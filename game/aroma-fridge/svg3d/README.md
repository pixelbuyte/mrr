# svg3d

A small software 3D renderer that emits **SVG** instead of pixels. Every
visible surface becomes one `<path>`, shaded analytically at its centroid, so
the output is resolution independent — the same file is a crisp icon at 200px
and a poster at 4000px, with no raster assets and no runtime JavaScript.

```bash
node fridge-scene.mjs             # writes aroma-fridge.svg
node fridge-scene.mjs out.svg     # or somewhere else
```

The bundled scene is the Aroma Fridge from the game next door: ~8,500 shaded
faces, roughly 950 KB of SVG.

## Pipeline

1. Build meshes from analytic primitives
2. Transform to world space
3. Backface cull (closed solids only)
4. Sort back-to-front — painter's algorithm
5. Shade each face and emit a `<path>`

## Primitives

`box` · `openBox` · `chamferBox` · `cylinder` · `sphere` · `lathe` · `extrude`
· `subdivide`

`lathe` takes a `[radius, y]` profile and revolves it, which is how the bottles
and jars get their silhouettes. `extrude` takes a closed 2D polygon. `openBox`
drops the `+Z` face so you can see into a shell.

## Shading

Blinn-Phong over a hemisphere ambient term, evaluated in linear light and
encoded to sRGB on output, with an ACES-style filmic shoulder so speculars roll
off instead of clipping. Materials carry `color`, `spec`, `shine`, `metal`,
`ambient`, `opacity`, and `doubleSided`. Metals take their diffuse from
reflection and tint their highlights; dielectrics don't.

Lights are directional (`direction`) or point (`position`, `range`, `soft`).

## Three things that will bite you

**Painter's algorithm has no occlusion.** Two surfaces a few centimetres apart
and near-coplanar from the camera will interleave per-face into a checkerboard,
because centroid depth ordering between them is unstable. Fix it in the *scene*,
not the renderer: cull the hidden one (`mesh.doubleSided = false`) or separate
them in depth. The cabinet shell and its liner needed both.

**Flat shading turns light gradients into blocks.** One large quad under a
nearby point light renders as a single uniform slab. `subdivide(mesh, n)` splits
quads `n×n` so the falloff actually shows.

**Point lights need a soft radius.** A bare `1/d²` blows up in the near field —
a lamp 0.8 m under a ceiling varies ~16× across that one surface, which flat
shading quantises into visible tiles. Every point light takes `soft` (default
`0.6`), modelling an emitter of finite size:

```
attenuation = intensity / (d² + soft²)
```

Raising `soft` flattens the hot spot; you generally raise `intensity` to match.

## Transparency

Transparent faces are emitted without the seam stroke that opaque faces get —
there the stroke overlap double-composites into a visible wireframe. Sorting is
still by centroid, so heavily overlapping transparent geometry is approximate.
