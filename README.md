# GLB Viewer for Orca

Preview GLB 3D models in [Orca](https://github.com/stablyai/orca)'s editor. A `.gltf` opens too
when its data is embedded in it (see [Limits](#limits)).

- Orbit, zoom and pan the model; reset the view at any time.
- Play the model's animations, and pick a clip when it has several.
- A floor grid and X / Y / Z axes, with the model's width × height × depth in meters, so a model
  authored in the wrong unit (say, centimeters) stands out at a glance.
- Wireframe view, and vertex and triangle counts.
- Draco and Meshopt compressed models, and KTX2 / Basis Universal textures.
- Follows Orca's light and dark themes, in English and Japanese.

It is read-only: it never changes the file. `.glb` files open in the 3D view by default; for a
`.gltf`, switch between Source and 3D in the editor tab.

## Limits

- **Files next to the model are not read.** Orca plugins see only the open file, never its folder,
  so a `.gltf` whose geometry lives in a separate `.bin` cannot be shown, and textures in separate
  image files are left off. A `.glb`, or a `.gltf` with its data embedded, shows everything.
- **Desktop app only.** The viewer needs the Orca desktop app's isolated plugin frame; in a browser
  client the file opens in Source.
- Files up to 64 MiB, Orca's limit for custom editors.

Requires Orca 1.4.248 or later.

## Development

The plugin's code lives in `build/src`, and `build/build.mjs` bundles it into `editor/`, which is
committed so Orca can load the plugin without a build step.

```sh
cd build
npm ci
npm test
npm run typecheck
npm run build
```

With [mise](https://mise.jdx.dev), `mise run build` (and `test`, `typecheck`) does the same.

To try it in Orca, run `orca plugin dev watch .` from the repository root, or add the folder under
Settings → Plugins → Development folders.

## License

[MIT](LICENSE). The bundled three.js, meshoptimizer and Lucide (MIT / ISC) and the Draco decoder
(Apache-2.0) keep their own licenses; see [THIRD_PARTY_NOTICES.txt](THIRD_PARTY_NOTICES.txt).
