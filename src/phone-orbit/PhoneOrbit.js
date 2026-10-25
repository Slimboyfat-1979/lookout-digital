import {
  AmbientLight,
  CanvasTexture,
  DirectionalLight,
  Group,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  ACESFilmicToneMapping,
  WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import gsap from 'gsap';
import { PhoneModel } from './PhoneModel.js';
import { OrbitSystem } from './OrbitSystem.js';
import { ServicePills } from './ServicePills.js';
import { SERVICES } from './services.js';

const FOV = 28;
const BASE_ROT = { x: -0.13, y: -0.3, z: 0.02 };

function layoutFor(width) {
  if (width < 520) return { orbit: 0.58, pill: 0.72 };
  if (width < 900) return { orbit: 0.82, pill: 0.88 };
  return { orbit: 1, pill: 1 };
}

function makeShadowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(60,40,140,.34)');
  g.addColorStop(0.5, 'rgba(60,40,140,.12)');
  g.addColorStop(1, 'rgba(60,40,140,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

export class PhoneOrbit {
  constructor(root, options = {}) {
    this.root = root;
    this.services = options.services || SERVICES;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.state = { floatY: 0, floatR: 0, mx: 0, my: 0, speed: 0 };
    this.time = 0;
    this.running = false;
    this.destroyed = false;
    this.view = { w: 1, h: 1 };
    this.layout = layoutFor(1200);
    this.tick = this.tick.bind(this);
    this.build();
  }

  build() {
    this.root.classList.add('lo-orbit');
    this.root.setAttribute('role', 'group');
    this.root.setAttribute('aria-label', 'Lookout Digital services');
    this.list = document.createElement('ul');
    this.list.className = 'lo-orbit__list';
    this.root.append(this.list);

    // Without WebGL the list stays visible as a simple set of links.
    try {
      this.renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (e) {
      this.fallback();
      return;
    }

    const r = this.renderer;
    r.setClearColor(0x000000, 0);
    r.outputColorSpace = SRGBColorSpace;
    r.toneMapping = ACESFilmicToneMapping;
    r.toneMappingExposure = 1;
    this.canvas = r.domElement;
    this.canvas.className = 'lo-orbit__canvas';
    this.canvas.setAttribute('aria-hidden', 'true');
    this.root.prepend(this.canvas);

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(FOV, 1, 0.1, 60);

    const pmrem = new PMREMGenerator(r);
    const env = new RoomEnvironment();
    this.envTarget = pmrem.fromScene(env, 0.04);
    this.scene.environment = this.envTarget.texture;
    this.scene.environmentIntensity = 0.85;
    env.dispose?.();
    pmrem.dispose();

    this.scene.add(new AmbientLight(0xffffff, 0.35));
    const key = new DirectionalLight(0xfff4e8, 1.4);
    key.position.set(-4, 6, 6);
    this.scene.add(key);
    const rim = new DirectionalLight(0xb8a8ff, 0.9);
    rim.position.set(5, 2, -3);
    this.scene.add(rim);

    const aniso = Math.min(8, r.capabilities.getMaxAnisotropy());
    this.phone = new PhoneModel(aniso);
    this.phoneGroup = new Group();
    this.phoneGroup.add(this.phone.group);
    this.scene.add(this.phoneGroup);

    this.shadow = new Mesh(
      new PlaneGeometry(5.2, 3),
      new MeshBasicMaterial({ map: makeShadowTexture(), transparent: true, depthWrite: false, toneMapped: false }),
    );
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.y = -2.75;
    this.shadow.renderOrder = 0;
    this.scene.add(this.shadow);

    this.orbits = new OrbitSystem(this.scene);
    this.root.classList.add('is-ready');
    this.bind();
    this.resize();

    // Pills are measured and drawn with the site fonts, so wait for them (briefly).
    const fonts = document.fonts?.load
      ? Promise.all([
          document.fonts.load('600 15px "Hanken Grotesk"'),
          document.fonts.load('400 40px "Instrument Serif"'),
          document.fonts.load('italic 400 40px "Instrument Serif"'),
        ]).catch(() => {})
      : Promise.resolve();
    Promise.race([fonts, new Promise((res) => setTimeout(res, 2000))]).then(() => {
      if (this.destroyed) return;
      this.phone.refreshScreen();
      this.pills = new ServicePills({
        scene: this.scene,
        list: this.list,
        services: this.services,
        anisotropy: aniso,
        onActiveChange: (active) => {
          this.slow(active);
          this.requestRender();
        },
      });
      this.pills.setInstant(this.reduced.matches);
      this.pills.setScale(this.layout.pill);
      this.requestRender();
    });
  }
  fallback() {
    this.root.classList.add('is-fallback');
    this.services.forEach((s) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = s.url;
      a.className = 'lo-orbit__pill';
      a.textContent = s.label;
      li.append(a);
      this.list.append(li);
    });
  }

  bind() {
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(this.root);

    this.io = new IntersectionObserver(
      ([entry]) => {
        this.visible = entry.isIntersecting;
        if (this.visible) this.start();
        else this.stop();
      },
      { rootMargin: '120px' },
    );
    this.io.observe(this.root);

    this.onMove = (e) => {
      if (e.pointerType !== 'mouse' || this.reduced.matches) return;
      const rect = this.root.getBoundingClientRect();
      this.moveX?.(((e.clientX - rect.left) / rect.width) * 2 - 1);
      this.moveY?.(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    this.onLeave = () => {
      this.moveX?.(0);
      this.moveY?.(0);
    };
    this.root.addEventListener('pointermove', this.onMove);
    this.root.addEventListener('pointerleave', this.onLeave);

    this.onMotionChange = () => {
      this.pills?.setInstant(this.reduced.matches);
      this.applyMotionPreference();
    };
    this.reduced.addEventListener('change', this.onMotionChange);
    this.applyMotionPreference();
  }

  applyMotionPreference() {
    gsap.killTweensOf(this.state);
    gsap.killTweensOf(this.canvas);
    if (this.reduced.matches) {
      Object.assign(this.state, { floatY: 0, floatR: 0, mx: 0, my: 0, speed: 0 });
      this.moveX = this.moveY = null;
      this.canvas.style.opacity = 1;
      this.time = 0;
      this.requestRender();
      if (this.running) this.stop();
      return;
    }
    this.state.speed = 0;
    gsap.to(this.state, { speed: 1, duration: 3, ease: 'power2.inOut' });
    gsap.fromTo(this.canvas, { opacity: 0 }, { opacity: 1, duration: 1.4, ease: 'power2.out' });
    gsap.to(this.state, { floatY: 0.1, duration: 3.8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.to(this.state, { floatR: 0.035, duration: 5.4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 0.7 });
    this.moveX = gsap.quickTo(this.state, 'mx', { duration: 1.3, ease: 'power3.out' });
    this.moveY = gsap.quickTo(this.state, 'my', { duration: 1.3, ease: 'power3.out' });
    if (this.visible) this.start();
  }

  slow(active) {
    if (this.reduced.matches) return;
    gsap.to(this.state, { speed: active ? 0.08 : 1, duration: active ? 0.6 : 1.4, ease: 'power2.out', overwrite: 'auto' });
  }

  resize() {
    if (this.destroyed) return;
    const w = Math.max(1, this.root.clientWidth);
    const h = Math.max(1, this.root.clientHeight);
    this.view = { w, h };
    this.layout = layoutFor(w);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;

    // Fit the widest orbit plus a pill, and the phone's height, inside the frame.
    const t = Math.tan((FOV * Math.PI) / 360);
    const needW = 2 * 3.55 * this.layout.orbit + 2.1 * this.layout.pill + 0.5;
    const needH = 5.9;
    const dist = Math.max(needH / (2 * t), needW / (2 * t * this.camera.aspect));
    this.camera.position.set(0, 0.7, dist);
    this.camera.lookAt(0, 0, 0);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld(true);

    this.orbits.setScale(this.layout.orbit);
    this.pills?.setScale(this.layout.pill);
    this.requestRender();
  }

  start() {
    if (this.running || this.reduced.matches || this.destroyed) return;
    this.running = true;
    gsap.ticker.add(this.tick);
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    gsap.ticker.remove(this.tick);
  }

  tick(_time, deltaTime) {
    const dt = Math.min(deltaTime, 50) / 1000;
    this.time += dt * this.state.speed;
    this.update();
  }

  requestRender() {
    if (this.running || this.destroyed || this.pending) return;
    this.pending = requestAnimationFrame(() => {
      this.pending = 0;
      if (!this.destroyed) this.update();
    });
  }

  update() {
    const s = this.state;
    const g = this.phoneGroup;
    g.rotation.set(BASE_ROT.x + s.my * 0.08 + s.floatR * 0.5, BASE_ROT.y + s.mx * 0.2 + s.floatR, BASE_ROT.z);
    const cx = s.mx * 0.16;
    const cy = s.floatY - s.my * 0.06;
    g.position.set(cx, cy, 0);
    g.updateMatrixWorld(true);
    this.shadow.position.x = cx;
    this.shadow.scale.setScalar(1 - (s.floatY - 0.05) * 0.4);

    this.orbits.setCenter(cx, cy, 0);
    this.orbits.update();
    const pos = this.orbits.tmp;
    this.orbits.defs.forEach((def, o) => {
      def.slots.forEach((_, slot) => {
        const front = this.orbits.position(o, slot, this.time, pos);
        this.pills?.place(this.pillIndex(o, slot), pos, front, this.camera, this.view, this.phone.proxy);
      });
    });
    this.renderer.render(this.scene, this.camera);
  }

  // Alternate pills across the two orbits so neighbours in the list sit on different paths.
  pillIndex(orbit, slot) {
    return slot * 2 + orbit;
  }

  destroy() {
    this.destroyed = true;
    this.stop();
    cancelAnimationFrame(this.pending);
    gsap.killTweensOf(this.state);
    if (this.canvas) gsap.killTweensOf(this.canvas);
    this.ro?.disconnect();
    this.io?.disconnect();
    this.root.removeEventListener('pointermove', this.onMove);
    this.root.removeEventListener('pointerleave', this.onLeave);
    this.reduced.removeEventListener('change', this.onMotionChange);
    this.pills?.dispose();
    this.orbits?.dispose();
    this.phone?.dispose();
    this.shadow?.geometry.dispose();
    this.shadow?.material.map.dispose();
    this.shadow?.material.dispose();
    this.envTarget?.dispose();
    this.renderer?.dispose();
    this.canvas?.remove();
    this.list?.remove();
    this.root.classList.remove('lo-orbit', 'is-ready', 'is-fallback');
  }
}
