import {
  CanvasTexture,
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Raycaster,
  SRGBColorSpace,
  Vector3,
} from 'three';
import gsap from 'gsap';
import { COLORS, ICONS } from './services.js';

const SCALE = 3; // texture pixels per CSS pixel
const PILL_H = 52;
const PAD = 28;
const PX = 0.0082; // world units per CSS pixel
const FONT = '"Hanken Grotesk", system-ui, sans-serif';

function drawIcon(ctx, icon, x, y, size, color, lineWidth) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 24, size / 24);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  icon.paths.forEach((d) => ctx.stroke(new Path2D(d)));
  (icon.dots || []).forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.arc(dx, dy, 1.1, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function measure(label) {
  const c = document.createElement('canvas').getContext('2d');
  c.font = `600 15px ${FONT}`;
  return Math.ceil(c.measureText(label).width);
}

function drawPill(service, pillW, active) {
  const canvas = document.createElement('canvas');
  canvas.width = (pillW + PAD * 2) * SCALE;
  canvas.height = (PILL_H + PAD * 2) * SCALE;
  const ctx = canvas.getContext('2d');
  ctx.scale(SCALE, SCALE);
  const x = PAD;
  const y = PAD;

  ctx.beginPath();
  ctx.roundRect(x, y, pillW, PILL_H, PILL_H / 2);
  ctx.save();
  ctx.shadowColor = active ? 'rgba(107,78,255,.28)' : 'rgba(36,36,36,.16)';
  ctx.shadowBlur = active ? 26 : 20;
  ctx.shadowOffsetY = active ? 12 : 9;
  ctx.fillStyle = 'rgba(255,255,255,.97)';
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.shadowColor = 'rgba(36,36,36,.12)';
  ctx.shadowBlur = 3;
  ctx.shadowOffsetY = 1;
  ctx.fillStyle = 'rgba(255,255,255,.97)';
  ctx.fill();
  ctx.restore();
  ctx.lineWidth = 1;
  ctx.strokeStyle = active ? 'rgba(107,78,255,.5)' : 'rgba(36,36,36,.1)';
  ctx.stroke();

  const icon = ICONS[service.icon];
  const badge = 32;
  const bx = x + 10;
  const by = y + (PILL_H - badge) / 2;
  if (active) {
    ctx.beginPath();
    ctx.arc(bx + badge / 2, by + badge / 2, badge / 2, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.purple;
    ctx.fill();
    drawIcon(ctx, icon, bx + 7, by + 7, 18, '#fff', 2);
  } else {
    ctx.beginPath();
    ctx.arc(bx + badge / 2, by + badge / 2, badge / 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(107,78,255,.09)';
    ctx.fill();
    drawIcon(ctx, icon, bx + 7, by + 7, 18, COLORS.purple, 1.8);
  }

  ctx.fillStyle = COLORS.charcoal;
  ctx.font = `600 15px ${FONT}`;
  ctx.textBaseline = 'middle';
  ctx.fillText(service.label, bx + badge + 10, y + PILL_H / 2 + 0.5);
  return canvas;
}

export class ServicePills {
  constructor({ scene, list, services, anisotropy, onActiveChange }) {
    this.scene = scene;
    this.list = list;
    this.onActiveChange = onActiveChange;
    this.anisotropy = anisotropy;
    this.scale = 1;
    this.raycaster = new Raycaster();
    this.tmp = new Vector3();
    this.dir = new Vector3();
    this.activeCount = 0;
    this.disposables = [];
    this.items = services.map((service, i) => this.createItem(service, i));
  }

  texture(canvas) {
    const tex = new CanvasTexture(canvas);
    tex.colorSpace = SRGBColorSpace;
    tex.premultiplyAlpha = true;
    tex.anisotropy = this.anisotropy;
    tex.minFilter = LinearMipmapLinearFilter;
    tex.magFilter = LinearFilter;
    this.disposables.push(tex);
    return tex;
  }

  createItem(service, index) {
    const pillW = 10 + 32 + 10 + measure(service.label) + 22;
    const geo = new PlaneGeometry((pillW + PAD * 2) * PX, (PILL_H + PAD * 2) * PX);
    this.disposables.push(geo);
    const makeMat = (canvas, opacity) => {
      const m = new MeshBasicMaterial({
        map: this.texture(canvas),
        transparent: true,
        depthWrite: false,
        toneMapped: false,
        premultipliedAlpha: true,
        opacity,
      });
      this.disposables.push(m);
      return m;
    };
    const mesh = new Mesh(geo, makeMat(drawPill(service, pillW, false), 1));
    const hoverMesh = new Mesh(geo, makeMat(drawPill(service, pillW, true), 0));
    mesh.renderOrder = 2;
    hoverMesh.renderOrder = 2;
    mesh.add(hoverMesh);
    hoverMesh.position.z = 0.001;
    this.scene.add(mesh);

    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = service.url;
    a.className = 'lo-orbit__pill';
    a.style.width = `${pillW}px`;
    a.style.height = `${PILL_H}px`;
    const text = document.createElement('span');
    text.textContent = service.label;
    a.append(text);
    li.append(a);
    this.list.append(li);

    const item = {
      service,
      index,
      mesh,
      hoverMesh,
      anchor: a,
      pillW,
      state: { h: 0 },
      pointer: false,
      focus: false,
      active: false,
      baseOpacity: 1,
      x: NaN,
      y: NaN,
      s: NaN,
      blocked: false,
    };
    const sync = () => this.setActive(item, item.pointer || item.focus);
    a.addEventListener('pointerenter', () => ((item.pointer = true), sync()));
    a.addEventListener('pointerleave', () => ((item.pointer = false), sync()));
    a.addEventListener('focus', () => ((item.focus = true), sync()));
    a.addEventListener('blur', () => ((item.focus = false), sync()));
    item.cleanup = () => a.remove();
    return item;
  }

  setActive(item, on) {
    if (item.active === on) return;
    item.active = on;
    this.activeCount += on ? 1 : -1;
    if (this.instant) item.state.h = on ? 1 : 0;
    else gsap.to(item.state, { h: on ? 1 : 0, duration: 0.45, ease: 'power2.out', overwrite: true });
    this.onActiveChange?.(this.activeCount > 0);
  }

  setScale(scale) {
    this.scale = scale;
  }

  // Positions meshes in 3D, then moves the invisible HTML links to match the projection.
  place(index, worldPos, front, camera, view, proxy) {
    const item = this.items[index];
    const { mesh, hoverMesh, state } = item;
    mesh.position.copy(worldPos);
    mesh.quaternion.copy(camera.quaternion);
    const grow = this.scale * (1 + 0.07 * state.h);
    mesh.scale.setScalar(grow);

    const depth = 0.55 + 0.45 * front;
    mesh.material.opacity = depth * (1 - state.h * 0.0);
    hoverMesh.material.opacity = state.h * depth;

    // Pills behind the phone must not capture clicks meant for nothing; hand them back to the page.
    this.dir.copy(worldPos).sub(camera.position);
    const dist = this.dir.length();
    this.dir.normalize();
    this.raycaster.set(camera.position, this.dir);
    this.raycaster.far = dist;
    item.blocked = proxy ? this.raycaster.intersectObject(proxy, false).length > 0 : false;

    this.tmp.copy(worldPos).project(camera);
    const px = ((this.tmp.x + 1) / 2) * view.w;
    const py = ((1 - this.tmp.y) / 2) * view.h;
    const pxPerUnit = view.h / (2 * Math.tan((camera.fov * Math.PI) / 360) * dist);
    const s = (pxPerUnit * PX) * grow;
    if (Math.abs(px - item.x) > 0.05 || Math.abs(py - item.y) > 0.05 || Math.abs(s - item.s) > 0.0005) {
      item.x = px;
      item.y = py;
      item.s = s;
      item.anchor.style.transform = `translate3d(${px.toFixed(2)}px,${py.toFixed(2)}px,0) translate(-50%,-50%) scale(${s.toFixed(4)})`;
    }
    item.anchor.style.pointerEvents = item.blocked ? 'none' : '';
    item.anchor.style.zIndex = String(Math.round(front * 10));
  }

  setInstant(flag) {
    this.instant = flag;
  }

  dispose() {
    this.items.forEach((item) => {
      gsap.killTweensOf(item.state);
      item.cleanup();
      item.mesh.removeFromParent();
    });
    this.disposables.forEach((d) => d.dispose());
  }
}
