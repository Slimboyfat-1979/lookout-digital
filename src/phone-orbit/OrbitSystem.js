import { BufferGeometry, Color, Float32BufferAttribute, Group, Line, LineBasicMaterial, Vector3 } from 'three';

// Two slightly different elliptical paths, both inclined diagonally.
// a = half width (x), b = half depth (z). `slots` are phase offsets (radians) for pills on that path.
export const ORBITS = [
  { a: 3.1, b: 1.95, tiltX: 0.14, tiltZ: 0.3, speed: 0.2, slots: [0.35, 0.35 + (Math.PI * 2) / 3, 0.35 + (Math.PI * 4) / 3] },
  { a: 3.55, b: 2.35, tiltX: -0.12, tiltZ: 0.2, speed: 0.15, slots: [1.4, 1.4 + (Math.PI * 2) / 3, 1.4 + (Math.PI * 4) / 3] },
];

const GUIDE_POINTS = 160;

export class OrbitSystem {
  constructor(parent, defs = ORBITS, color = 0x6b4eff) {
    this.defs = defs;
    this.scale = 1;
    this.disposables = [];
    this.tmp = new Vector3();
    this.groups = defs.map((def) => {
      const group = new Group();
      group.rotation.set(def.tiltX, 0, def.tiltZ);
      group.add(this.createGuide(def, color));
      parent.add(group);
      return group;
    });
  }

  createGuide(def, color) {
    const positions = [];
    const colors = [];
    const c = new Color(color);
    for (let i = 0; i <= GUIDE_POINTS; i += 1) {
      const t = (i / GUIDE_POINTS) * Math.PI * 2;
      positions.push(Math.cos(t) * def.a, 0, Math.sin(t) * def.b);
      // fainter on the far side of the orbit
      const front = (Math.sin(t) + 1) / 2;
      colors.push(c.r, c.g, c.b, 0.08 + 0.3 * front);
    }
    const geo = new BufferGeometry();
    geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new Float32BufferAttribute(colors, 4));
    const mat = new LineBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false });
    this.disposables.push(geo, mat);
    const line = new Line(geo, mat);
    line.renderOrder = 1;
    return line;
  }

  setScale(scale) {
    this.scale = scale;
    this.groups.forEach((g) => g.scale.setScalar(scale));
  }

  setCenter(x, y, z) {
    this.groups.forEach((g) => g.position.set(x, y, z));
  }

  update() {
    this.groups.forEach((g) => g.updateMatrixWorld(true));
  }

  // World-space position of a pill slot. `front` runs from 0 (far side) to 1 (near side).
  position(orbitIndex, slot, time, out) {
    const def = this.defs[orbitIndex];
    const phase = def.slots[slot] + time * def.speed;
    out.set(Math.cos(phase) * def.a, 0, Math.sin(phase) * def.b).applyMatrix4(this.groups[orbitIndex].matrixWorld);
    return (Math.sin(phase) + 1) / 2;
  }

  dispose() {
    this.disposables.forEach((d) => d.dispose());
    this.groups.forEach((g) => g.removeFromParent());
  }
}
