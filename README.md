<div align="center">

# GLB Viewer for Orca

**Look at 3D models without leaving your editor.**

A read-only GLB viewer for [Orca](https://github.com/stablyai/orca): orbit, play animations, and see
at a glance whether a model is the size you think it is.

[![CI](https://github.com/momokun7/orca-glb-viewer/actions/workflows/ci.yml/badge.svg)](https://github.com/momokun7/orca-glb-viewer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Orca](https://img.shields.io/badge/Orca-%E2%89%A5%201.4.248-black.svg)](https://github.com/stablyai/orca)
[![Permissions](https://img.shields.io/badge/permissions-none-brightgreen.svg)](#-security)

[Features](#-features) · [Install](#-install) · [Usage](#%EF%B8%8F-usage) · [Limits](#-limits) ·
[Security](#-security) · [Development](#%EF%B8%8F-development)

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/images/hero-dark.png">
  <img alt="A sofa chair shown in GLB Viewer inside Orca, standing on a floor grid with its size, 827 × 686 × 570 mm, in the status bar" src="docs/images/hero-light.png" width="800">
</picture>

</div>

## ✨ Features

|     |     |
| --- | --- |
| 🧭 **Look around** | Orbit, zoom and pan; reset the view in one click. |
| 📏 **Real-world size** | A floor grid, X / Y / Z axes and the width × height × depth, so a model authored in the wrong unit stands out at once. |
| 🎞️ **Animations** | Play and pause, and pick a clip when the model has several. |
| 🕸️ **Inspect** | Wireframe view, with vertex and triangle counts. |
| 🗜️ **Compressed models** | Draco and Meshopt geometry, KTX2 / Basis Universal textures. |
| 🔄 **Stays current** | Shows the latest save as the file changes. |
| 🌗 **Feels native** | Follows Orca's light and dark themes, in English and Japanese. |
| 🔒 **Hands off** | Read-only and sandboxed: it never changes the file, and asks Orca for no permissions. |

<table>
  <tr>
    <td width="50%"><img alt="A toy car on a draped cloth, 73.4 × 28.8 × 74 mm on a 10 mm grid" src="docs/images/toy-car.png"></td>
    <td width="50%"><img alt="A boom box in the dark theme: 19.8 × 19.5 × 20.2 mm, far smaller than a real one" src="docs/images/boom-box.png"></td>
  </tr>
  <tr>
    <td align="center"><sub>A toy car, measured in millimeters</sub></td>
    <td align="center"><sub>A 2 cm boom box: the unit slip shows right away</sub></td>
  </tr>
</table>

## 📦 Install

1. In Orca, open **Settings → Plugins** and choose **Install plugin**.
2. On the **Git URL** tab, enter:

   ```text
   https://github.com/momokun7/orca-glb-viewer#v1.0.0
   ```

3. Choose **Install**. The viewer asks for no permissions, so there is nothing else to grant.

Requires the Orca desktop app, version 1.4.248 or later.

## 🖱️ Usage

Open any `.glb` file and it shows in 3D. For a `.gltf`, switch the editor tab between **Source** and
**3D**.

| Action | How |
| --- | --- |
| Orbit | Drag |
| Pan | Right-drag, Shift + drag, or the arrow keys |
| Zoom | Scroll |
| Reset the view | ↺ in the toolbar |
| Wireframe, grid and axes | The toolbar buttons beside it |
| Animations | ▶ and the clip menu, when the model has any |

## 🚧 Limits

- **Files next to the model are not read.** Orca plugins see only the open file, never its folder.
  A `.gltf` whose geometry lives in a separate `.bin` cannot be shown, and textures in separate
  image files are left off. A `.glb`, or a `.gltf` with its data embedded, shows everything.
- **Desktop app only.** The viewer needs the desktop app's isolated plugin frame; in a browser client
  the file opens in Source.
- **Up to 64 MiB**, Orca's limit for custom editors. A model that would decode to far more than it
  is safe to hold, or that requires a glTF extension three.js does not support, is refused with a
  message saying why.

All 152 GLB and embedded glTF models in Khronos'
[glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets) were checked: every one
opens, except three that require an extension three.js does not implement.

## 🔒 Security

A model is untrusted input, so the viewer is built to be boring to attack:

- It runs in Orca's isolated plugin frame, with a strict Content-Security-Policy and no network.
- The manifest asks for **no capabilities**: no worker, no commands, no file access.
- It never edits or saves the document, and URIs inside a model never reach a loader.
- Each model is checked against size budgets on a separate thread before anything is decoded.
- CI runs the viewer under Orca's frame policy against hostile and fuzzed models, and checks that the
  committed bundle is reproducible from source.

See [SECURITY.md](SECURITY.md) for the details and how to report a vulnerability privately.

## 🛠️ Development

The plugin's code lives in `build/src`. `build/build.mjs` bundles it into `editor/`, which is
committed so Orca can load the plugin without a build step.

```sh
cd build
npm ci
npm test
npm run typecheck
npm run build
```

With [mise](https://mise.jdx.dev), `mise run check` runs everything CI runs, and `mise tasks` lists
the rest.

To try your changes in Orca, run `orca plugin dev watch .` from the repository root, or add the
folder under **Settings → Plugins → Development folders**.

## 📄 License

[MIT](LICENSE). The bundled three.js, meshoptimizer and Lucide (MIT / ISC) and the Draco decoder
(Apache-2.0) keep their own licenses; see [THIRD_PARTY_NOTICES.txt](THIRD_PARTY_NOTICES.txt).

The models in the screenshots are SheenChair, ToyCar and BoomBox from Khronos'
[glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets), released under
[CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).
