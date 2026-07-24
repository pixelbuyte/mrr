/**
 * The Aroma Fridge scene, rendered to a single self-contained SVG.
 *
 *   node fridge-scene.mjs [out.svg]
 *
 * Same subject and proportions as the WebGL game, rebuilt out of analytic
 * solids so it can be shaded once and shipped as vectors.
 */
import { writeFileSync } from 'node:fs';
import {
  V, Scene, render, box, openBox, chamferBox, cylinder, sphere, lathe, extrude,
  subdivide,
} from './svg3d.mjs';

const S = new Scene();
const TAU = Math.PI * 2;

/* ────────────────────────────── materials ────────────────────────────── */
const M = {
  steel:    {color:'#c6cfd8', metal:.85, spec:.85, shine:48},
  steelDim: {color:'#97a2ad', metal:.80, spec:.55, shine:36},
  chrome:   {color:'#e9eff5', metal:1.0, spec:1.5, shine:150},
  gasket:   {color:'#1d2229', metal:0,   spec:.06, shine:8},
  liner:    {color:'#e3e9ee', metal:0,   spec:.10, shine:16},
  linerDim: {color:'#c2ccd5', metal:0,   spec:.08, shine:14},
  glass:    {color:'#d6ecf8', metal:0,   spec:1.1, shine:120, opacity:.34, doubleSided:true},
  bin:      {color:'#dceaf4', metal:0,   spec:.85, shine:80,  opacity:.55, doubleSided:true},
  crisper:  {color:'#cfe2ee', metal:0,   spec:.75, shine:70,  opacity:.30, doubleSided:true},
  floor:    {color:'#333941', metal:.10, spec:.18, shine:22},
  wall:     {color:'#3d444e', metal:0,   spec:.05, shine:10},
  tile:     {color:'#59636f', metal:.05, spec:.45, shine:44},
  tileAlt:  {color:'#4e5763', metal:.05, spec:.45, shine:44},
  cabinet:  {color:'#333a44', metal:.06, spec:.22, shine:26},
  worktop:  {color:'#1f242c', metal:.18, spec:.55, shine:60},
  led:      {color:'#fff8ec', metal:0,   spec:.2,  shine:10, ambient:9},
  dispGlow: {color:'#63d3ff', metal:0,   spec:.3,  shine:20, ambient:7},
};

/** Food surfaces: soft, slightly waxy, never mirror-like. */
const food = (color, spec = .30, shine = 26) => ({color, metal:0, spec, shine});
const plastic = (color, spec = .45, shine = 40) => ({color, metal:.05, spec, shine});

/* ─────────────────────────── kitchen backdrop ────────────────────────── */
S.add(subdivide(box(46, .2, 40), 8), M.floor, {y: -.1, z: -8});
S.add(subdivide(box(30, 16, .2), 8), M.wall,  {y: 8, z: -3.2});

for(let i = -7; i <= 7; i++){
  for(let j = 0; j < 3; j++){
    S.add(box(.86, .5, .05), (i + j) % 2 ? M.tile : M.tileAlt,
      {x: i*.92, y: 2.05 + j*.56, z: -3.06});
  }
}

function counterUnit(cx, w){
  S.add(chamferBox(w, 1.72, 1.55, .05), M.cabinet, {x: cx, y: .86, z: -2.0});
  S.add(chamferBox(w + .12, .12, 1.68, .03), M.worktop, {x: cx, y: 1.78, z: -2.0});
  const n = Math.max(1, Math.round(w / 1.3));
  for(let i = 0; i < n; i++){
    S.add(cylinder(.024, .024, .36, 12), M.chrome,
      {x: cx - w/2 + w*(i + .5)/n, y: 1.5, z: -1.2, rz: Math.PI/2});
  }
}
counterUnit(-3.9, 3.2);
counterUnit( 3.9, 3.2);

/* ──────────────────────────── the refrigerator ───────────────────────── */
const BW = 3.0, BH = 4.6, BD = 2.5;
const shelfZ = -0.18;
const SHELVES = [1.55, 2.45, 3.35];

/* cabinet shell, front face removed so the interior is visible */
const shellMesh = openBox(BW, BH, BD);
shellMesh.doubleSided = false;          // only the outside of the cabinet draws
S.add(shellMesh, M.steel, {y: BH/2 + .12});
S.add(subdivide(openBox(BW - .10, BH - .12, BD - .06), 10), M.liner, {y: BH/2 + .12, z: .03});

/* flange around the opening — hides the shell/liner seam */
for(const [w, h, x, y] of [
  [BW, .10, 0, BH + .17], [BW, .10, 0, .07],
  [.06, BH, -BW/2 + .03, BH/2 + .12], [.06, BH, BW/2 - .03, BH/2 + .12],
]){
  S.add(box(w, h, .05), M.gasket, {x, y, z: BD/2 - .02});
}

/* levelling feet */
for(const [x, z] of [[-1.2,-1.0],[1.2,-1.0],[-1.2,1.0],[1.2,1.0]]){
  S.add(cylinder(.09, .11, .14, 14), M.steelDim, {x, y: .07, z});
}

/* bottom freezer drawer */
S.add(chamferBox(BW + .04, 1.15, .14, .03), M.steel, {y: .72, z: BD/2 + .06});
S.add(cylinder(.055, .055, BW - .5, 18), M.chrome, {y: 1.13, z: BD/2 + .21, rz: Math.PI/2});
for(const s of [-1, 1]){
  S.add(box(.09, .09, .16), M.chrome, {x: s*(BW/2 - .3), y: 1.13, z: BD/2 + .13});
}
S.add(box(.62, .10, .02), M.chrome, {y: 1.62, z: BD/2 + .08});

/* back panel + vent grille — keeps the rear wall from reading as a void */
S.add(subdivide(box(2.66, 3.30, .04), 9), M.linerDim, {y: 2.45, z: shelfZ - .92});
for(let i = 0; i < 7; i++){
  S.add(box(1.5, .035, .02), M.steelDim, {y: 3.62 + i*.055, z: shelfZ - .89});
}

/* shelf-support ladders on the side walls */
for(const x of [-1.34, 1.34]){
  S.add(box(.05, 3.1, .09), M.steelDim, {x, y: 2.45, z: shelfZ - .55});
  for(let i = 0; i < 11; i++){
    S.add(box(.055, .05, .10), M.gasket, {x, y: 1.05 + i*.28, z: shelfZ - .55});
  }
}

/* glass shelves on chrome rails */
for(const y of SHELVES){
  S.add(box(2.6, .045, 1.9), M.glass, {y, z: shelfZ});
  for(const dz of [-.94, .94]){
    S.add(cylinder(.028, .028, 2.6, 12), M.chrome, {y: y + .03, z: shelfZ + dz, rz: Math.PI/2});
  }
  for(const x of [-1.3, 1.3]){
    S.add(box(.05, .05, 1.9), M.chrome, {x, y: y - .01, z: shelfZ});
  }
}

/* crisper drawers */
for(const x of [-.66, .66]){
  S.add(openBox(1.22, .62, 1.75), M.crisper, {x, y: .78, z: shelfZ});
  S.add(box(1.1, .05, .05), M.chrome, {x, y: 1.02, z: shelfZ + .9});
}

/* LED light bar */
S.add(box(1.9, .06, .34), M.led, {y: 3.92, z: shelfZ - .10});

/* ──────────────────────────────── the door ───────────────────────────── */
/* Authored flat, then swung about the left-hand hinge. */
const DOOR_ANGLE = -Math.PI * 0.52;
const hinge = V(-BW/2, 0, BD/2);

function door(mesh, mat, t = {}){
  // place relative to the door's own origin (its centre line), then rotate
  const lx = (t.x ?? 0) + BW/2, ly = t.y ?? 0, lz = t.z ?? 0;
  const c = Math.cos(DOOR_ANGLE), s = Math.sin(DOOR_ANGLE);
  S.add(mesh, mat, {
    ...t,
    ry: DOOR_ANGLE + (t.ry ?? 0),
    x: hinge.x + lx*c + lz*s,
    y: hinge.y + ly,
    z: hinge.z - lx*s + lz*c,
  });
}

door(chamferBox(BW, 3.28, .17, .04), M.steel,      {y: 3.06, z: .085});
door(box(BW - .12, 3.20, .03),       M.gasket,     {y: 3.06, z: -.075});
door(subdivide(box(BW - .20, 3.14, .04), 6), M.liner, {y: 3.06, z: -.035});
door(cylinder(.06, .06, 2.5, 18),    M.chrome,     {x: BW/2 - .28, y: 3.05, z: .34});
for(const dy of [-1.15, 1.15]){
  door(box(.10, .10, .20), M.chrome, {x: BW/2 - .28, y: 3.05 + dy, z: .19});
}

/* water / ice dispenser recess */
door(box(.66, .92, .06), M.gasket,   {x: -.72, y: 3.36, z: .175});
door(box(.50, .20, .02), M.dispGlow, {x: -.72, y: 3.66, z: .21});
for(let i = 0; i < 5; i++){
  door(box(.44, .022, .015), M.steelDim, {x: -.72, y: 3.10 + i*.05, z: .21});
}

/* door bins */
const BIN_Y = [2.05, 3.02, 3.92];
for(const y of BIN_Y){
  door(openBox(BW - .42, .52, .30), M.bin,   {y, z: -.20, ry: Math.PI});
  door(box(BW - .42, .34, .025),    M.bin,   {y: y - .06, z: -.35});
  door(cylinder(.022, .022, BW - .42, 12), M.chrome, {y: y + .14, z: -.35, rz: Math.PI/2});
}

/* ─────────────────────────── food: shape library ─────────────────────── */
function bottle(place, bodyColor, capColor, h, r, mat = null){
  const body = mat ?? plastic(bodyColor, .55, 55);
  place(lathe([
    [0, 0], [r*.94, 0], [r, r*.5], [r, h*.60], [r*.86, h*.68],
    [r*.42, h*.78], [r*.38, h*.92], [0, h*.92],
  ], 18), body);
  place(lathe([
    [0, h*.90], [r*.46, h*.90], [r*.46, h*1.0], [0, h*1.0],
  ], 18), plastic(capColor, .4, 32));
}

function jarShape(place, contentColor, h, r){
  place(lathe([
    [0, 0], [r*.9, 0], [r, r*.35], [r, h*.86], [r*.92, h*.90], [0, h*.90],
  ], 18), {color:'#e8f4fb', metal:0, spec:1.0, shine:110, opacity:.42, doubleSided:true});
  place(cylinder(r*.86, r*.86, h*.72, 18), food(contentColor, .2, 18), {y: h*.38});
  place(lathe([
    [0, h*.86], [r*1.06, h*.86], [r*1.06, h*1.0], [0, h*1.0],
  ], 18), plastic('#b4362f', .35, 30));
}

function canShape(place, color, h, r){
  place(lathe([
    [0, 0], [r*.9, 0], [r, .03], [r, h - .03], [r*.9, h], [0, h],
  ], 18), {color, metal:.55, spec:.8, shine:70});
  for(const y of [.02, h - .02]){
    place(cylinder(r*.96, r*.96, .022, 18), M.chrome, {y});
  }
}

function cartonShape(place, color, w, h, d, label){
  place(box(w, h, d), plastic(color, .22, 20), {y: h/2});
  place(box(w, .14, d*.35), plastic(color, .22, 20), {y: h + .07});
  place(box(w*.7, h*.36, .012), plastic(label, .3, 26), {y: h*.58, z: d/2 + .006});
}

function grapeCluster(place, color){
  const pts = [[0,0,0],[.075,-.02,.04],[-.075,-.02,-.03],[.03,-.10,-.06],
               [-.04,-.10,.06],[0,-.18,0],[.06,-.20,.03],[-.05,-.21,-.02]];
  for(const [x, y, z] of pts) place(sphere(.055, 18, 12), food(color, .45, 40), {x, y, z});
  place(cylinder(.012, .016, .11, 8), food('#5b7c3a', .12, 12), {y: .10});
}

function leafy(place, color){
  place(sphere(.15, 14, 9), food('#dff0b8', .2, 16));
  for(let i = 0; i < 7; i++){
    const a = i/7 * TAU;
    place(sphere(.13, 12, 8), food(color, .25, 20), {
      x: Math.cos(a)*.09, y: .03 + Math.sin(i)*.02, z: Math.sin(a)*.09,
      scaleY: .55, scaleZ: 1.05, ry: a,
    });
  }
}

function cheeseWedge(place, color){
  place(extrude([[0,0],[.34,0],[.05,.26]], .20), food(color, .18, 16),
        {x: -.17, y: -.10, z: -.10});
}

function eggCarton(place){
  place(box(.62, .10, .40), food('#d8cdb8', .12, 12), {y: .05});
  for(let i = 0; i < 3; i++){
    for(let j = 0; j < 2; j++){
      place(sphere(.06, 12, 8), food('#fdf3e0', .3, 30),
            {x: -.2 + i*.2, y: .13, z: -.1 + j*.2, scaleY: 1.28});
    }
  }
}

function fruit(place, color, r, squashY = 1, withStem = false){
  place(sphere(r, 28, 18), food(color, .35, 34), {scaleY: squashY});
  if(withStem){
    place(cylinder(.016, .022, .09, 8), food('#4a7a2b', .12, 12), {y: r*squashY*.95});
    place(sphere(.05, 10, 7), food('#5f9c33', .18, 16),
          {x: .04, y: r*squashY, scaleY: .22, scaleZ: .55});
  }
}

/* ──────────────────────── stock the shelves and bins ─────────────────── */
/** Returns a `place` helper that drops a mesh at a fixed anchor in the cabinet. */
const at = (ax, ay, az, ry = 0) => (mesh, mat, t = {}) => {
  const c = Math.cos(ry), s = Math.sin(ry);
  const lx = t.x ?? 0, lz = t.z ?? 0;
  S.add(mesh, mat, {
    ...t,
    ry: ry + (t.ry ?? 0),
    x: ax + lx*c + lz*s,
    y: ay + (t.y ?? 0),
    z: az - lx*s + lz*c,
  });
};

/* top shelf */
cartonShape(at(-1.05, 3.38, shelfZ - .20, .12), '#f2f4f7', .34, .55, .26, '#5aa9e6');
cartonShape(at(-0.68, 3.38, shelfZ - .35, -.20), '#e8a13a', .30, .48, .24, '#fff0c9');
bottle(at( 1.05, 3.38, shelfZ - .30), '#dff0ff', '#3f7bd6', .62, .10,
       {color:'#dff0ff', metal:0, spec:1.0, shine:100, opacity:.55, doubleSided:true});
bottle(at( 0.82, 3.38, shelfZ - .05, .30), '#8ed17a', '#f2f2f2', .55, .09,
       {color:'#8ed17a', metal:0, spec:.95, shine:90, opacity:.55, doubleSided:true});
eggCarton(at( 0.92, 3.38, shelfZ + .55, -.15));

/* middle shelf */
jarShape(at(-1.02, 2.48, shelfZ - .30, .20), '#e4452c', .30, .13);
jarShape(at(-0.78, 2.48, shelfZ - .05, -.30), '#6fa832', .26, .11);
canShape(at( 1.10, 2.48, shelfZ - .35), '#c23b3b', .26, .10);
canShape(at( 1.10, 2.48, shelfZ - .05), '#2f7fc1', .26, .10);
canShape(at( 0.88, 2.48, shelfZ - .20), '#3f9e5c', .26, .10);
(function butter(){
  const p = at(-0.95, 2.48, shelfZ + .55, .25);
  p(box(.32, .12, .16), food('#f7e08a', .2, 18), {y: .06});
  p(box(.20, .125, .165), food('#f0f2f5', .25, 22), {y: .06});
})();

/* bottom shelf */
(function bowl(){
  const p = at(-1.00, 1.58, shelfZ - .20);
  p(lathe([[.06,0],[.20,.10],[.22,.22],[.205,.22],[.185,.10],[.05,.012]], 20),
    plastic('#e8ecf0', .5, 60));
  p(sphere(.17, 14, 9), food('#e0b878', .2, 18), {y: .12, scaleY: .55});
})();
cartonShape(at( 1.02, 1.58, shelfZ - .35, -.15), '#f7c9d8', .28, .34, .22, '#ffffff');
bottle(at( 1.14, 1.58, shelfZ - .02, .40), '#4a3423', '#d8b45a', .66, .11);

/* crispers */
fruit(at(-0.90, .82, shelfZ - .20), '#d8a63a', .13, .90);
fruit(at(-0.50, .82, shelfZ + .10), '#b2d84a', .12, 1.10);
fruit(at( 0.88, .82, shelfZ + .20), '#e06a2a', .12, .95);
leafy(at( 0.55, .84, shelfZ - .10), '#63b04a');

/* the eight aroma sources the game spawns bubbles from */
const AROMA = [
  {name:'Apple',   color:'#d6342c', at:[-1.05, 1.72, shelfZ + .34]},
  {name:'Orange',  color:'#ff8a2b', at:[-0.55, 1.72, shelfZ + .35]},
  {name:'Lemon',   color:'#f5df3a', at:[ 0.15, 1.72, shelfZ + .40]},
  {name:'Tomato',  color:'#e83a28', at:[ 0.62, 1.70, shelfZ + .30]},
  {name:'Grapes',  color:'#8b4fd6', at:[-0.45, 2.68, shelfZ + .35]},
  {name:'Cheese',  color:'#f2c14e', at:[ 0.05, 2.64, shelfZ + .30]},
  {name:'Lime',    color:'#9ed13a', at:[ 0.50, 2.66, shelfZ + .40]},
  {name:'Lettuce', color:'#4caf50', at:[ 1.05, 1.73, shelfZ + .34]},
];
fruit(at(...AROMA[0].at), AROMA[0].color, .15, 1.05, true);
fruit(at(...AROMA[1].at), AROMA[1].color, .17, 1.00, true);
fruit(at(...AROMA[2].at), AROMA[2].color, .15, 1.35);
fruit(at(...AROMA[3].at), AROMA[3].color, .16,  .85, true);
grapeCluster(at(...AROMA[4].at), AROMA[4].color);
cheeseWedge(at(...AROMA[5].at), AROMA[5].color);
fruit(at(...AROMA[6].at), AROMA[6].color, .14);
leafy(at(...AROMA[7].at), AROMA[7].color);

/* door bins */
const doorAt = (bx, by, bz = -.20) => (mesh, mat, t = {}) => {
  const lx = bx + (t.x ?? 0) + BW/2, ly = by + (t.y ?? 0), lz = bz + (t.z ?? 0);
  const c = Math.cos(DOOR_ANGLE), s = Math.sin(DOOR_ANGLE);
  S.add(mesh, mat, {
    ...t,
    ry: DOOR_ANGLE + (t.ry ?? 0),
    x: hinge.x + lx*c + lz*s,
    y: hinge.y + ly,
    z: hinge.z - lx*s + lz*c,
  });
};
const glassy = c => ({color:c, metal:0, spec:1.0, shine:100, opacity:.55, doubleSided:true});

bottle(doorAt(-0.95, 2.14), '#dff0ff', '#3f7bd6', .58, .090, glassy('#dff0ff'));
bottle(doorAt(-0.60, 2.14), '#e8dd5a', '#ffffff', .52, .080, glassy('#e8dd5a'));
cartonShape(doorAt(-0.15, 2.10), '#f2f4f7', .24, .40, .18, '#5aa9e6');
jarShape(doorAt( 0.35, 2.12), '#e0a53a', .24, .100);
bottle(doorAt( 0.85, 2.14), '#c23b3b', '#f2f2f2', .50, .085);

jarShape(doorAt(-0.85, 3.08), '#8b4fd6', .22, .095);
bottle(doorAt(-0.42, 3.10), '#6fa832', '#ffffff', .50, .085);
canShape(doorAt( 0.10, 3.12), '#c23b3b', .24, .095);
canShape(doorAt( 0.38, 3.12), '#2f7fc1', .24, .095);
bottle(doorAt( 0.85, 3.10), '#4a3423', '#d8b45a', .55, .090);

/* ───────────────────────── aroma bubbles in flight ───────────────────── */
/* Deterministic so the SVG is byte-reproducible across runs. */
let seed = 20260724;
const rand = () => (seed = (seed*1664525 + 1013904223) >>> 0) / 4294967296;

for(const src of AROMA){
  if(rand() > .62) continue;                 // only some sources are venting
  const rise = .34 + rand()*1.05;
  S.add(sphere(.075 + rise*.022, 20, 13), {
    color: src.color, metal:0, spec:1.5, shine:140,
    opacity: Math.max(.20, .46 - rise*.20), ambient: 2.6,
  }, {
    x: src.at[0] + (rand() - .5)*.34,
    y: src.at[1] + .26 + rise,
    z: src.at[2] + .10 + rand()*.18,
  });
}

/* ────────────────────────────────  lights  ───────────────────────────── */
S.light({direction: V( 0.55,  0.78,  0.60), color:'#fff3e2', intensity: 1.45});  // key
S.light({direction: V(-0.62,  0.42, -0.35), color:'#8fbcff', intensity: 0.55});  // rim
S.light({direction: V( 0.10, -0.60,  0.35), color:'#5b6a7d', intensity: 0.16});  // bounce

/* interior LEDs — inverse-square, so intensity is in cabinet units */
S.light({position: V( 0.0, 3.72,  0.10), color:'#fff6e6', intensity: 2.6, range: 6, soft: 1.1});
S.light({position: V( 0.0, 2.40,  0.30), color:'#fff6e6', intensity: 2.3, range: 6, soft: 1.1});
S.light({position: V( 0.0, 1.20,  0.30), color:'#fff2dc', intensity: 2.0, range: 6, soft: 1.1});
S.light({position: V( 1.2, 2.50,  1.40), color:'#ffffff', intensity: 1.6, range: 7, soft: 1.2});
S.light({position: V(-2.3, 2.95,  2.70), color:'#fff4e2', intensity: 3.2, range: 9, soft: 1.4});

/* ────────────────────────────────  render  ───────────────────────────── */
const defs = `
<radialGradient id="room" cx="46%" cy="34%" r="82%">
  <stop offset="0%"  stop-color="#232c37"/>
  <stop offset="58%" stop-color="#161b23"/>
  <stop offset="100%" stop-color="#0b0e13"/>
</radialGradient>
<radialGradient id="contact" cx="50%" cy="50%" r="50%">
  <stop offset="0%"   stop-color="#000000" stop-opacity=".62"/>
  <stop offset="62%"  stop-color="#000000" stop-opacity=".24"/>
  <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
</radialGradient>
<radialGradient id="spill" cx="50%" cy="50%" r="50%">
  <stop offset="0%"   stop-color="#ffeccd" stop-opacity=".30"/>
  <stop offset="100%" stop-color="#ffeccd" stop-opacity="0"/>
</radialGradient>
<filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
  <feGaussianBlur stdDeviation="26"/>
</filter>`;

const {svg, faceCount} = render(S, {
  width: 1600, height: 1000,
  camera: {position: V(2.85, 2.95, 8.6), target: V(0.10, 2.15, 0), fov: 38},
  background: 'url(#room)',
  hemisphere: {sky:'#93aecb', ground:'#2b2721', strength: .34},
  exposure: 1.0,
  seamStroke: .5,
  defs,
  // contact shadow goes under the geometry; light spill sits over it
  beforeGeometry:
    `<ellipse cx="735" cy="900" rx="520" ry="86" fill="url(#contact)"/>`,
  afterGeometry:
    `<ellipse cx="640" cy="470" rx="470" ry="330" fill="url(#spill)" filter="url(#soft)"/>`,
});

const out = process.argv[2] ?? new URL('./aroma-fridge.svg', import.meta.url).pathname;
writeFileSync(out, svg);
console.log(`${out}  ${faceCount} faces  ${(svg.length/1024).toFixed(0)} KB`);
