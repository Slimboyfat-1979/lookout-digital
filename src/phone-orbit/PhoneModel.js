import {
  BoxGeometry,
  CanvasTexture,
  ExtrudeGeometry,
  Group,
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  Shape,
  ShapeGeometry,
  SRGBColorSpace,
} from 'three';
import { COLORS } from './services.js';

const BODY_W = 1.9;
const BODY_H = 3.95;
const BODY_R = 0.34;
const BEVEL = 0.035;
const DEPTH = 0.1;
const SCREEN_W = 1.74;
const SCREEN_H = 3.79;
const SCREEN_R = 0.26;

export const PHONE_SIZE = { w: BODY_W, h: BODY_H, d: DEPTH + BEVEL * 2 };

function roundedRect(w, h, r) {
  const x = -w / 2;
  const y = -h / 2;
  const s = new Shape();
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

function canvasRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function makeTexture(canvas, anisotropy) {
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = anisotropy;
  tex.minFilter = LinearMipmapLinearFilter;
  tex.magFilter = LinearFilter;
  return tex;
}

function drawScreen(canvas) {
  const W = canvas.width;
  const H = canvas.height;
  const ctx = canvas.getContext('2d');
  const sans = '"Hanken Grotesk", system-ui, sans-serif';
  const serif = '"Instrument Serif", Georgia, serif';
  ctx.clearRect(0, 0, W, H);

  ctx.save();
  canvasRoundRect(ctx, 0, 0, W, H, (SCREEN_R / SCREEN_W) * W);
  ctx.clip();
  ctx.fillStyle = COLORS.offWhite;
  ctx.fillRect(0, 0, W, H);

  // status bar
  ctx.fillStyle = COLORS.charcoal;
  ctx.font = `700 29px ${sans}`;
  ctx.textBaseline = 'middle';
  ctx.fillText('9:41', 74, 58);
  ctx.fillStyle = '#050505';
  canvasRoundRect(ctx, W / 2 - 96, 28, 192, 56, 28);
  ctx.fill();
  ctx.fillStyle = '#16161c';
  ctx.beginPath();
  ctx.arc(W / 2 + 62, 56, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2a2a38';
  ctx.beginPath();
  ctx.arc(W / 2 + 62, 56, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.charcoal;
  canvasRoundRect(ctx, W - 134, 46, 46, 22, 7);
  ctx.globalAlpha = 0.85;
  ctx.fill();
  ctx.globalAlpha = 1;

  // nav
  ctx.strokeStyle = COLORS.purple;
  ctx.lineWidth = 3.5;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(60, 190);
  ctx.lineTo(80, 152);
  ctx.lineTo(100, 190);
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = COLORS.charcoal;
  ctx.font = `700 32px ${sans}`;
  ctx.fillText('lookout', 116, 172);
  const lw = ctx.measureText('lookout').width;
  ctx.font = `400 32px ${sans}`;
  ctx.fillStyle = '#73716e';
  ctx.fillText('digital', 116 + lw + 2, 172);
  ctx.strokeStyle = COLORS.charcoal;
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(W - 112, 162);
  ctx.lineTo(W - 60, 162);
  ctx.moveTo(W - 112, 182);
  ctx.lineTo(W - 78, 182);
  ctx.stroke();

  // hero copy
  ctx.fillStyle = COLORS.purple;
  ctx.font = `600 21px ${sans}`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = '3px';
  ctx.fillText('NELSON · NEW ZEALAND', 60, 296);
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  ctx.fillStyle = COLORS.charcoal;
  ctx.font = `400 92px ${serif}`;
  ctx.fillText('A clearer view', 60, 392);
  ctx.fillText('of what’s', 60, 484);
  ctx.fillStyle = COLORS.purple;
  ctx.font = `italic 400 92px ${serif}`;
  ctx.fillText('possible.', 60, 576);
  ctx.fillStyle = '#73716e';
  ctx.font = `400 27px ${sans}`;
  ctx.fillText('Websites and web apps for small', 60, 650);
  ctx.fillText('businesses across Aotearoa.', 60, 688);

  ctx.fillStyle = COLORS.purple;
  canvasRoundRect(ctx, 60, 736, 340, 84, 42);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = `600 26px ${sans}`;
  ctx.fillText('Start a conversation', 90, 779);

  // abstract hero image
  const ix = 60;
  const iy = 870;
  const iw = W - 120;
  const ih = 380;
  ctx.save();
  canvasRoundRect(ctx, ix, iy, iw, ih, 34);
  ctx.clip();
  const g = ctx.createLinearGradient(ix, iy, ix + iw, iy + ih);
  g.addColorStop(0, '#1f1b2e');
  g.addColorStop(0.55, '#4a35c9');
  g.addColorStop(1, '#b9acff');
  ctx.fillStyle = g;
  ctx.fillRect(ix, iy, iw, ih);
  ctx.strokeStyle = 'rgba(255,255,255,.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(ix + iw * 0.68, iy + ih * 0.5, 150, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(ix + iw * 0.68, iy + ih * 0.5, 100, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(244,243,241,.92)';
  ctx.beginPath();
  ctx.moveTo(ix + 40, iy + ih + 1);
  ctx.lineTo(ix + 190, iy + 120);
  ctx.lineTo(ix + 340, iy + ih + 1);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(107,78,255,.55)';
  ctx.beginPath();
  ctx.moveTo(ix + 150, iy + ih + 1);
  ctx.lineTo(ix + 270, iy + 205);
  ctx.lineTo(ix + 400, iy + ih + 1);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillRect(ix + iw - 86, iy + 40, 16, 16);
  ctx.restore();

  // cards
  const cw = (W - 120 - 24) / 2;
  const cy = 1290;
  const ch = 190;
  [
    ['01 / WEBSITE', 'WordPress', 'or custom'],
    ['02 / WEB APP', 'Tools that', 'do more'],
  ].forEach(([tag, l1, l2], i) => {
    const cx = 60 + i * (cw + 24);
    ctx.fillStyle = '#fff';
    canvasRoundRect(ctx, cx, cy, cw, ch, 30);
    ctx.fill();
    ctx.strokeStyle = '#dfdeda';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = COLORS.purple;
    ctx.font = `600 17px ${sans}`;
    if ('letterSpacing' in ctx) ctx.letterSpacing = '2px';
    ctx.fillText(tag, cx + 28, cy + 40);
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
    ctx.fillStyle = COLORS.charcoal;
    ctx.font = `400 42px ${serif}`;
    ctx.fillText(l1, cx + 28, cy + 100);
    ctx.fillText(l2, cx + 28, cy + 146);
  });

  // home indicator
  ctx.fillStyle = 'rgba(36,36,36,.8)';
  canvasRoundRect(ctx, W / 2 - 110, H - 34, 220, 9, 5);
  ctx.fill();
  ctx.restore();
}

function makeGlassTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 512;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 256, 512);
  g.addColorStop(0, 'rgba(255,255,255,.22)');
  g.addColorStop(0.28, 'rgba(255,255,255,.07)');
  g.addColorStop(0.4, 'rgba(255,255,255,0)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 512);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

export class PhoneModel {
  constructor(anisotropy = 4) {
    this.group = new Group();
    this.disposables = [];
    const track = (o) => {
      this.disposables.push(o);
      return o;
    };

    const frameMat = track(
      new MeshStandardMaterial({ color: 0x2b2b2f, metalness: 0.9, roughness: 0.32 }),
    );

    const bodyGeo = track(
      new ExtrudeGeometry(roundedRect(BODY_W - BEVEL * 2, BODY_H - BEVEL * 2, BODY_R - BEVEL), {
        depth: DEPTH,
        bevelEnabled: true,
        bevelThickness: BEVEL,
        bevelSize: BEVEL,
        bevelSegments: 6,
        curveSegments: 28,
      }),
    );
    bodyGeo.center();
    this.body = new Mesh(bodyGeo, frameMat);
    this.group.add(this.body);

    const front = PHONE_SIZE.d / 2;

    const bezel = new Mesh(
      track(new ShapeGeometry(roundedRect(1.82, 3.87, 0.3), 24)),
      track(new MeshBasicMaterial({ color: 0x050506, toneMapped: false })),
    );
    bezel.position.z = front + 0.0008;
    this.group.add(bezel);

    this.screenCanvas = document.createElement('canvas');
    this.screenCanvas.width = 720;
    this.screenCanvas.height = Math.round((720 * SCREEN_H) / SCREEN_W);
    drawScreen(this.screenCanvas);
    this.screenTexture = track(makeTexture(this.screenCanvas, anisotropy));
    const screen = new Mesh(
      track(new PlaneGeometry(SCREEN_W, SCREEN_H)),
      track(
        new MeshBasicMaterial({
          map: this.screenTexture,
          transparent: true,
          alphaTest: 0.5,
          toneMapped: false,
        }),
      ),
    );
    screen.position.z = front + 0.0016;
    this.group.add(screen);

    const glass = new Mesh(
      track(new PlaneGeometry(SCREEN_W, SCREEN_H)),
      track(
        new MeshBasicMaterial({
          map: track(makeGlassTexture()),
          transparent: true,
          depthWrite: false,
          toneMapped: false,
        }),
      ),
    );
    glass.position.z = front + 0.0024;
    this.group.add(glass);

    const btnGeo = track(new BoxGeometry(0.035, 0.38, 0.07));
    const addButton = (x, y, h) => {
      const b = new Mesh(btnGeo, frameMat);
      b.scale.y = h / 0.38;
      b.position.set(x, y, 0);
      this.group.add(b);
    };
    addButton(-BODY_W / 2 - 0.012, 0.8, 0.3);
    addButton(-BODY_W / 2 - 0.012, 0.3, 0.52);
    addButton(BODY_W / 2 + 0.012, 0.55, 0.78);

    // Invisible box matching the body, used to test whether a pill sits behind the phone.
    this.proxy = new Mesh(
      track(new BoxGeometry(BODY_W, BODY_H, PHONE_SIZE.d)),
      track(new MeshBasicMaterial({ visible: false })),
    );
    this.group.add(this.proxy);
  }

  refreshScreen() {
    drawScreen(this.screenCanvas);
    this.screenTexture.needsUpdate = true;
  }

  dispose() {
    this.disposables.forEach((d) => d.dispose());
  }
}
