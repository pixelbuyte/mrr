/**
 * svg3d — a tiny software 3D renderer that emits SVG instead of pixels.
 *
 * Every visible surface becomes one <path>, shaded analytically at its
 * centroid. Output is resolution independent: the same file is a crisp
 * icon at 200px and a poster at 4000px.
 *
 * Pipeline: build meshes -> transform to world -> backface cull ->
 * sort back-to-front (painter's algorithm) -> shade -> emit paths.
 */

/* ────────────────────────────── vector math ────────────────────────────── */
export const V     = (x, y, z) => ({x, y, z});
export const add   = (a, b) => V(a.x+b.x, a.y+b.y, a.z+b.z);
export const sub   = (a, b) => V(a.x-b.x, a.y-b.y, a.z-b.z);
export const scale = (a, s) => V(a.x*s, a.y*s, a.z*s);
export const dot   = (a, b) => a.x*b.x + a.y*b.y + a.z*b.z;
export const cross = (a, b) => V(a.y*b.z - a.z*b.y, a.z*b.x - a.x*b.z, a.x*b.y - a.y*b.x);
export const len   = a => Math.hypot(a.x, a.y, a.z);
export const norm  = a => { const l = len(a) || 1; return V(a.x/l, a.y/l, a.z/l); };

/* ───────────────────────────── colour helpers ──────────────────────────── */
/* Shading happens in linear light; sRGB is only the transport encoding. */
const srgbToLinear = c => c <= 0.04045 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4);
const linearToSrgb = c => c <= 0.0031308 ? c*12.92 : 1.055*Math.pow(c, 1/2.4) - 0.055;

export function hexToLinear(hex){
  const n = typeof hex === 'string' ? parseInt(hex.replace('#',''), 16) : hex;
  return {
    r: srgbToLinear(((n >> 16) & 255) / 255),
    g: srgbToLinear(((n >>  8) & 255) / 255),
    b: srgbToLinear(( n        & 255) / 255),
  };
}
function linearToHex(c){
  const q = v => {
    const n = Math.round(Math.max(0, Math.min(1, linearToSrgb(v))) * 255);
    return n.toString(16).padStart(2, '0');
  };
  return '#' + q(c.r) + q(c.g) + q(c.b);
}
/* Filmic-ish shoulder so bright speculars roll off instead of clipping flat. */
const toneMap = v => (v * (2.51*v + 0.03)) / (v * (2.43*v + 0.59) + 0.14);

/* ─────────────────────────────── transforms ────────────────────────────── */
/* Rotation order is Z, then X, then Y — matches how the scene is authored. */
function applyTransform(p, t){
  let {x, y, z} = p;
  const s = t.scale ?? 1;
  const sx = (t.scaleX ?? 1) * s, sy = (t.scaleY ?? 1) * s, sz = (t.scaleZ ?? 1) * s;
  x *= sx; y *= sy; z *= sz;

  if(t.rz){ const c = Math.cos(t.rz), n = Math.sin(t.rz); [x, y] = [x*c - y*n, x*n + y*c]; }
  if(t.rx){ const c = Math.cos(t.rx), n = Math.sin(t.rx); [y, z] = [y*c - z*n, y*n + z*c]; }
  if(t.ry){ const c = Math.cos(t.ry), n = Math.sin(t.ry); [x, z] = [x*c + z*n, -x*n + z*c]; }

  return V(x + (t.x ?? 0), y + (t.y ?? 0), z + (t.z ?? 0));
}

/* ──────────────────────────── geometry builders ────────────────────────── */
/* Each returns {verts, faces}; a face is a list of vertex indices, wound
   counter-clockwise when seen from outside. */

export function box(w, h, d){
  const X = w/2, Y = h/2, Z = d/2;
  const verts = [
    V(-X,-Y, Z), V( X,-Y, Z), V( X, Y, Z), V(-X, Y, Z),   // front
    V(-X,-Y,-Z), V( X,-Y,-Z), V( X, Y,-Z), V(-X, Y,-Z),   // back
  ];
  const faces = [
    [0,1,2,3], [5,4,7,6], [4,0,3,7], [1,5,6,2], [3,2,6,7], [4,5,1,0],
  ];
  return {verts, faces};
}

/** Box with the +Z face removed, so you can see into it. */
export function openBox(w, h, d){
  const m = box(w, h, d);
  m.faces = m.faces.filter((_, i) => i !== 0);
  m.doubleSided = true;
  return m;
}

export function cylinder(rTop, rBottom, h, seg = 24, caps = true){
  const verts = [], faces = [];
  for(let i = 0; i < seg; i++){
    const a = i/seg * Math.PI*2;
    verts.push(V(Math.cos(a)*rTop,    h/2, Math.sin(a)*rTop));
    verts.push(V(Math.cos(a)*rBottom,-h/2, Math.sin(a)*rBottom));
  }
  for(let i = 0; i < seg; i++){
    const j = (i+1) % seg;
    faces.push([i*2, j*2, j*2+1, i*2+1]);
  }
  if(caps){
    const top = verts.length; verts.push(V(0,  h/2, 0));
    const bot = verts.length; verts.push(V(0, -h/2, 0));
    for(let i = 0; i < seg; i++){
      const j = (i+1) % seg;
      faces.push([top, j*2, i*2]);
      faces.push([bot, i*2+1, j*2+1]);
    }
  }
  return {verts, faces};
}

export function sphere(r, seg = 22, rings = 14){
  const verts = [], faces = [];
  for(let y = 0; y <= rings; y++){
    const phi = y/rings * Math.PI;
    for(let x = 0; x < seg; x++){
      const th = x/seg * Math.PI*2;
      verts.push(V(
        r * Math.sin(phi) * Math.cos(th),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(th)));
    }
  }
  const idx = (y, x) => y*seg + (x % seg);
  for(let y = 0; y < rings; y++){
    for(let x = 0; x < seg; x++){
      if(y === 0)          faces.push([idx(0,0), idx(1,x+1), idx(1,x)]);
      else if(y === rings-1) faces.push([idx(y,x), idx(y,x+1), idx(rings,0)]);
      else                 faces.push([idx(y,x), idx(y,x+1), idx(y+1,x+1), idx(y+1,x)]);
    }
  }
  return {verts, faces};
}

/** Revolve a 2D profile ([[radius, y], ...]) around the Y axis. */
export function lathe(profile, seg = 24){
  const verts = [], faces = [];
  for(let i = 0; i < seg; i++){
    const a = i/seg * Math.PI*2, c = Math.cos(a), s = Math.sin(a);
    for(const [r, y] of profile) verts.push(V(c*r, y, s*r));
  }
  const n = profile.length;
  for(let i = 0; i < seg; i++){
    const j = (i+1) % seg;
    for(let k = 0; k < n-1; k++){
      faces.push([i*n+k, i*n+k+1, j*n+k+1, j*n+k]);
    }
  }
  return {verts, faces};
}

/** Extrude a closed 2D polygon ([[x,y],...]) along Z. */
export function extrude(poly, depth){
  const verts = [], faces = [], n = poly.length;
  for(const [x, y] of poly) verts.push(V(x, y,  depth/2));
  for(const [x, y] of poly) verts.push(V(x, y, -depth/2));
  const front = [], back = [];
  for(let i = 0; i < n; i++){ front.push(i); back.push(2*n - 1 - i); }
  faces.push(front, back);
  for(let i = 0; i < n; i++){
    const j = (i+1) % n;
    faces.push([j, i, i+n, j+n]);
  }
  return {verts, faces};
}

/** Box with chamfered vertical edges — reads far more like real sheet metal. */
export function chamferBox(w, h, d, c = 0.04){
  const X = w/2, Z = d/2;
  const poly = [
    [-X+c, -Z], [X-c, -Z], [X, -Z+c], [X, Z-c],
    [X-c, Z], [-X+c, Z], [-X, Z-c], [-X, -Z+c],
  ].map(([a, b]) => [a, b]);
  const m = extrude(poly, h);
  // extrude() works in XY then pushes along Z; stand it up so h is vertical
  m.verts = m.verts.map(p => V(p.x, p.z, -p.y));
  return m;
}

/**
 * Split every quad into n×n smaller quads.
 *
 * Flat shading gives one colour per face, so a wall built from a single large
 * quad lit by a nearby point light renders as one uniform slab. Subdividing it
 * lets the inverse-square falloff actually show up as a gradient.
 */
export function subdivide(mesh, n = 4){
  if(n <= 1) return mesh;
  const verts = [], faces = [];
  const key = new Map();
  const push = p => {
    const k = `${p.x.toFixed(5)},${p.y.toFixed(5)},${p.z.toFixed(5)}`;
    if(key.has(k)) return key.get(k);
    key.set(k, verts.length); verts.push(p); return verts.length - 1;
  };
  const lerp = (a, b, t) => V(a.x+(b.x-a.x)*t, a.y+(b.y-a.y)*t, a.z+(b.z-a.z)*t);

  for(const face of mesh.faces){
    if(face.length !== 4){                       // leave triangles alone
      faces.push(face.map(i => push(mesh.verts[i])));
      continue;
    }
    const [a, b, c, d] = face.map(i => mesh.verts[i]);
    for(let u = 0; u < n; u++){
      for(let v = 0; v < n; v++){
        const corner = (uu, vv) => lerp(lerp(a, b, uu/n), lerp(d, c, uu/n), vv/n);
        faces.push([
          push(corner(u, v)), push(corner(u+1, v)),
          push(corner(u+1, v+1)), push(corner(u, v+1)),
        ]);
      }
    }
  }
  return {...mesh, verts, faces};
}

/* ────────────────────────────────── scene ──────────────────────────────── */
export class Scene {
  constructor(){ this.items = []; this.lights = []; }

  /** mat: {color, spec, shine, metal, ambient, opacity, gradient, doubleSided} */
  add(mesh, mat, transform = {}){
    this.items.push({mesh, mat, transform});
    return this;
  }

  light(l){ this.lights.push(l); return this; }
}

/* ───────────────────────────────── renderer ────────────────────────────── */
export function render(scene, opts){
  const {
    width, height, camera, background = '#0f1319',
    hemisphere = {sky: '#8fa8c8', ground: '#2a2620', strength: 0.30},
    exposure = 1.0, seamStroke = 0.75, precision = 2,
  } = opts;

  const eye    = camera.position;
  const fwd    = norm(sub(camera.target, eye));
  const right  = norm(cross(fwd, camera.up ?? V(0,1,0)));
  const upVec  = cross(right, fwd);
  const fovRad = (camera.fov ?? 40) * Math.PI/180;
  const focal  = (height/2) / Math.tan(fovRad/2);

  const toCamera = p => {
    const rel = sub(p, eye);
    return {x: dot(rel, right), y: dot(rel, upVec), z: dot(rel, fwd)};
  };
  const project = c => ({
    x: width/2  + (c.x / c.z) * focal,
    y: height/2 - (c.y / c.z) * focal,
  });

  const sky = hexToLinear(hemisphere.sky), ground = hexToLinear(hemisphere.ground);
  const lights = scene.lights.map(l => ({
    ...l,
    lin: hexToLinear(l.color ?? '#ffffff'),
    dirN: l.direction ? norm(l.direction) : null,
  }));

  /* ---- 1. transform every face into world space, cull, collect ---- */
  const polys = [];
  for(const {mesh, mat, transform} of scene.items){
    const world = mesh.verts.map(p => applyTransform(p, transform));
    const twoSided = mat.doubleSided || mesh.doubleSided;

    for(const face of mesh.faces){
      const pts = face.map(i => world[i]);

      // Newell's method: a stable normal even for slightly non-planar quads
      let nx = 0, ny = 0, nz = 0;
      for(let i = 0; i < pts.length; i++){
        const a = pts[i], b = pts[(i+1) % pts.length];
        nx += (a.y - b.y) * (a.z + b.z);
        ny += (a.z - b.z) * (a.x + b.x);
        nz += (a.x - b.x) * (a.y + b.y);
      }
      let n = norm(V(nx, ny, nz));

      const centroid = pts.reduce((s, p) => add(s, p), V(0,0,0));
      const c = scale(centroid, 1/pts.length);
      const toEye = norm(sub(eye, c));

      const facing = dot(n, toEye);
      if(facing <= 0){
        if(!twoSided) continue;      // closed solid: back faces are invisible
        n = scale(n, -1);            // open shell: light the side we can see
      }

      const cam = pts.map(toCamera);
      if(cam.some(p => p.z <= 0.05)) continue;   // behind or through the camera

      polys.push({pts: cam.map(project), depth: cam.reduce((s,p)=>s+p.z,0)/cam.length,
                  n, c, mat});
    }
  }

  /* ---- 2. painter's algorithm ---- */
  polys.sort((a, b) => b.depth - a.depth);

  /* ---- 3. shade + emit ---- */
  const shadeFace = (mat, n, p) => {
    const albedo = hexToLinear(mat.color);
    const view   = norm(sub(eye, p));
    const metal  = mat.metal ?? 0;
    const shine  = mat.shine ?? 24;
    const specK  = mat.spec ?? 0.25;

    // Hemisphere ambient stands in for bounced environment light.
    const t = n.y*0.5 + 0.5;
    const amb = hemisphere.strength * (mat.ambient ?? 1);
    let r = albedo.r * (ground.r + (sky.r-ground.r)*t) * amb;
    let g = albedo.g * (ground.g + (sky.g-ground.g)*t) * amb;
    let b = albedo.b * (ground.b + (sky.b-ground.b)*t) * amb;

    for(const L of lights){
      let dir, atten = L.intensity ?? 1;
      if(L.dirN){
        dir = L.dirN;
      } else {
        const d = sub(L.position, p), dist = len(d) || 1e-4;
        if(L.range && dist > L.range) continue;
        dir = scale(d, 1/dist);
        // Softened inverse-square. A bare 1/d² blows up close to the light:
        // a lamp 0.8m under a ceiling varies ~16x across that one surface,
        // which flat shading turns into visible blocks. The soft radius
        // models an emitter of finite size and flattens the near field.
        const soft = L.soft ?? 0.6;
        atten /= (dist*dist + soft*soft);
        if(L.range) atten *= Math.max(0, 1 - dist/L.range);
      }

      const ndl = dot(n, dir);
      if(ndl <= 0) continue;

      // Metals take their diffuse colour almost entirely from reflection.
      const kd = (1 - metal*0.85) * ndl * atten;
      r += albedo.r * L.lin.r * kd;
      g += albedo.g * L.lin.g * kd;
      b += albedo.b * L.lin.b * kd;

      const h = norm(add(dir, view));
      const s = Math.pow(Math.max(0, dot(n, h)), shine) * specK * atten;
      // Metallic highlights are tinted by the surface; dielectric ones aren't.
      r += L.lin.r * s * (metal ? albedo.r : 1);
      g += L.lin.g * s * (metal ? albedo.g : 1);
      b += L.lin.b * s * (metal ? albedo.b : 1);
    }

    return linearToHex({
      r: toneMap(r*exposure), g: toneMap(g*exposure), b: toneMap(b*exposure),
    });
  };

  const f = v => v.toFixed(precision);
  const out = [];
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" `
         + `viewBox="0 0 ${width} ${height}" shape-rendering="geometricPrecision">`);
  out.push(`<rect width="${width}" height="${height}" fill="${background}"/>`);
  if(opts.defs) out.push(`<defs>${opts.defs}</defs>`);
  if(opts.beforeGeometry) out.push(opts.beforeGeometry);

  for(const p of polys){
    const d = 'M' + p.pts.map(q => `${f(q.x)},${f(q.y)}`).join('L') + 'Z';
    const fill = shadeFace(p.mat, p.n, p.c);
    const transparent = p.mat.opacity != null && p.mat.opacity < 1;
    // Stroking each face in its own fill colour closes the hairline cracks
    // that antialiased adjacent polygons leave behind. Transparent faces are
    // left unstroked — there the overlap double-composites into a wireframe.
    out.push(transparent
      ? `<path d="${d}" fill="${fill}" fill-opacity="${p.mat.opacity}"/>`
      : `<path d="${d}" fill="${fill}" stroke="${fill}" stroke-width="${seamStroke}"/>`);
  }

  if(opts.afterGeometry) out.push(opts.afterGeometry);
  out.push('</svg>');

  return {svg: out.join('\n'), faceCount: polys.length};
}
