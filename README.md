<div align="center">

**English** · [日本語](docs/i18n/README.ja.md) · [Deutsch](docs/i18n/README.de.md) · [Español](docs/i18n/README.es.md) ·
[Français](docs/i18n/README.fr.md) · [한국어](docs/i18n/README.ko.md) · [Português](docs/i18n/README.pt-BR.md) ·
[Русский](docs/i18n/README.ru.md) · [Türkçe](docs/i18n/README.tr.md) · [简体中文](docs/i18n/README.zh-Hans.md) ·
[繁體中文](docs/i18n/README.zh-Hant.md)

# 3D Viewer for Orca

**Look at 3D models without leaving your editor.**

A read-only viewer for [Orca](https://github.com/stablyai/orca) that opens GLB, glTF, STL, PLY, OBJ and FBX.
Orbit around a model, play its animations, and see at a glance whether it is the size you think it is.

[![CI](https://github.com/momokun7/orca-3d-viewer/actions/workflows/ci.yml/badge.svg)](https://github.com/momokun7/orca-3d-viewer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Orca](https://img.shields.io/badge/Orca-%E2%89%A5%201.4.248-black.svg)](https://github.com/stablyai/orca)
[![Permissions](https://img.shields.io/badge/permissions-none-brightgreen.svg)](#security)

[Quick start](#quick-start) · [Formats](#formats) · [Features](#features) · [Install](#install) · [Usage](#usage) ·
[Troubleshooting](#troubleshooting) · [Security](#security) · [Development](#development) ·
[Report a bug](https://github.com/momokun7/orca-3d-viewer/issues/new?template=bug_report.yml)

<img alt="The Stanford Bunny in 3D Viewer inside Orca, sitting on a floor grid, with its size, 156 × 154 × 121 mm, in the status bar" src="docs/images/hero.png" width="800">

</div>

## Quick start

1. In Orca, open **Settings → Plugins → Install plugin**, enter `https://github.com/momokun7/orca-3d-viewer#v1.0.0` on the **Git URL** tab and choose **Install**.
2. Open a `.glb`, `.gltf`, `.stl`, `.ply`, `.obj` or `.fbx` file.
3. Drag to orbit, scroll to zoom.

It asks for no permissions. See [Install](#install) and [Usage](#usage) for more.

## Formats

One viewer, six formats.

<table>
  <tr>
    <td width="33%"><img alt="A Beautiful Game as GLB: a marble chessboard with glass and metal pieces" src="docs/images/formats/glb.png"></td>
    <td width="33%"><img alt="Corset as a glTF with its data embedded: embroidered cloth and buckles" src="docs/images/formats/gltf.png"></td>
    <td width="33%"><img alt="3DBenchy as STL: the small boat used to test 3D printers, in an orange stored in the file" src="docs/images/formats/stl.png"></td>
  </tr>
  <tr>
    <td align="center"><b>GLB</b>: A Beautiful Game</td>
    <td align="center"><b>glTF</b>: Corset</td>
    <td align="center"><b>STL</b>: 3DBenchy</td>
  </tr>
  <tr>
    <td width="33%"><img alt="The Stanford Armadillo as PLY: a 3D scan, in a green stored in its vertices" src="docs/images/formats/ply.png"></td>
    <td width="33%"><img alt="The Utah Teapot as OBJ, in a purple stored in its vertices" src="docs/images/formats/obj.png"></td>
    <td width="33%"><img alt="BoomBox as FBX, with the texture of its buttons and speaker grilles" src="docs/images/formats/fbx.png"></td>
  </tr>
  <tr>
    <td align="center"><b>PLY</b>: Stanford Armadillo</td>
    <td align="center"><b>OBJ</b>: Utah Teapot</td>
    <td align="center"><b>FBX</b>: BoomBox</td>
  </tr>
</table>

| Format | Extensions | Colors and textures | Animation | Size unit | Notes |
| --- | --- | --- | --- | --- | --- |
| glTF 2.0 | `.glb` `.gltf` | Yes | Yes | Meters (as glTF defines) | A `.gltf` must embed its data |
| STL | `.stl` | Colors stored in the file, else a default | No | Millimeters (the 3D printing convention), Z up | Binary and text |
| PLY | `.ply` | Vertex colors, else a default | No | Shown as meters | Binary and text |
| OBJ | `.obj` | Vertex colors (`.mtl` cannot be read) | No | Shown as meters | |
| FBX | `.fbx` | Embedded textures only | Yes | The unit the file states | Binary FBX 7.0 (2011) and later |

glTF compressed with Draco or Meshopt, and KTX2 / Basis Universal textures, open too.

## Features

### Look around

<table>
  <tr>
    <td width="50%"><img alt="Dragging with the left mouse button orbits the camera around the bunny" src="docs/images/features/orbit.gif"></td>
    <td width="50%"><img alt="Right-dragging, then Shift plus left-dragging, slides the view sideways" src="docs/images/features/pan.gif"></td>
  </tr>
  <tr>
    <td align="center"><b>Orbit</b>: drag</td>
    <td align="center"><b>Pan</b>: right-drag, or <kbd>Shift</kbd> + drag</td>
  </tr>
  <tr>
    <td width="50%"><img alt="Scrolling the mouse wheel zooms in on the bunny and back out" src="docs/images/features/zoom.gif"></td>
    <td width="50%"><img alt="A view turned upside down goes back to the starting view with the reset button" src="docs/images/features/reset.gif"></td>
  </tr>
  <tr>
    <td align="center"><b>Zoom</b>: scroll</td>
    <td align="center"><b>Reset the view</b>: the first toolbar button</td>
  </tr>
</table>

### Real-world size

A floor grid, X / Y / Z axes and the model's width × height × depth, so a model authored in the wrong unit
stands out at once. The Stanford Bunny comes out 15.6 cm wide.

<img alt="The bunny on a 10 mm grid; the status bar reads 156 × 154 × 121 mm, then Grid 10 mm" src="docs/images/features/size.gif" width="600">

### Wireframe, grid and axes

Show the mesh as lines only, or hide the grid and axes. Vertex and triangle counts sit in the status bar.

<img alt="The wireframe button shows the bunny's mesh, then the grid and axes button hides the floor grid" src="docs/images/features/inspect.gif" width="600">

### Animations

Play and pause, and pick a clip when the model has several.

<img alt="A fox plays its Survey clip, switches to Run from the clip menu, then pauses and plays again" src="docs/images/features/animations.gif" width="600">

### Stays current

Save the file and the view shows the new version, keeping your camera where it was.

<img alt="Each time the file is saved with Ctrl + S, the bunny changes color in place" src="docs/images/features/live.gif" width="600">

### Light or dark

The viewer opens light; the moon button in the toolbar switches it to dark and back. It remembers the theme,
wireframe and grid you last chose, even after Orca restarts (Orca 1.4.250 and later).

<img alt="Clicking the moon button in the toolbar turns the viewer dark, and clicking it again turns it light" src="docs/images/features/theme.gif" width="600">

### Eleven languages

The viewer's text follows Orca's language: English, 日本語, Deutsch, Español, Français, 한국어, Português,
Русский, Türkçe, 简体中文 and 繁體中文.

### Details to paste into an issue

The **i** button in the toolbar (on an error screen, the **Details** button under the message) opens a summary:
the viewer's version, your browser and graphics, the recent loads with how long they took, and the errors met.
**Copy** it into an issue and it says what happened. It holds no model data.

<img alt="The Details panel: the viewer's version, the browser, the load history and the reason a file was refused, with Copy and Close buttons" src="docs/images/details.png" width="600">

## Install

1. In Orca, open **Settings → Plugins** and choose **Install plugin**.
2. On the **Git URL** tab, enter:

   ```text
   https://github.com/momokun7/orca-3d-viewer#v1.0.0
   ```

3. Choose **Install**. The viewer asks for no permissions, so there is nothing else to grant.

> [!IMPORTANT]
> Requires the Orca desktop app, version 1.4.248 or later.

## Usage

Open a file in any of these formats and it shows in 3D. `.gltf` and `.obj` are text files, so the editor tab
switches between **Source** (the text) and **3D**.

| Action | How |
| --- | --- |
| Orbit | Drag |
| Pan | Right-drag, <kbd>Shift</kbd> + drag, or the arrow keys |
| Zoom | Scroll |
| Reset the view | The first toolbar button |
| Wireframe, grid and axes | The buttons beside it |
| Light or dark | The moon button |
| Details | The **i** button |
| Animations | The play button and the clip menu, when the model has any |

## Limits

> [!NOTE]
> Orca plugins read only the open file, never the other files in its folder, so data kept in separate files
> cannot be shown. A `.gltf` whose geometry lives in a separate `.bin` does not open, and textures in separate
> image files and an OBJ's `.mtl` are left off. A `.glb`, a `.gltf` with its data embedded, or an FBX with its
> textures embedded shows everything.

- **Desktop app only.** In Orca in a browser, the file opens in Source.
- **Up to 64 MiB**, Orca's limit for custom editors. A model that would decode to far more than is safe to hold,
  or that uses something the viewer cannot read, is refused with a message saying why.
- **No old or text FBX.** Export it again as binary FBX 7.0 or later.

All 152 GLB and embedded glTF models in Khronos'
[glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets) were checked: every one opens, except
three that need an extension three.js does not implement.

## Troubleshooting

<details>
<summary>The file opens as text instead of 3D</summary>

`.gltf` and `.obj` are text files, so they may open in Source (the text). Choose **3D** on the editor tab. In
Orca in a browser, 3D is not available.

</details>

<details>
<summary>Textures or colors are missing</summary>

Textures in separate image files cannot be read by a plugin; the status bar names the files it could not read.
For glTF, use a `.glb`; for FBX, export with the textures embedded. An OBJ's `.mtl` cannot be read, so it shows
in its vertex colors if it has them, else in a default color.

</details>

<details>
<summary>The size looks wrong</summary>

STL is shown in millimeters, and PLY and OBJ in meters, since neither format stores a unit. FBX and glTF use the
unit the file states. If the size is off by a factor of 1000 or 100, check the unit the model was exported in.

</details>

<details>
<summary>It says the model cannot be opened</summary>

The message says why. Models that are too large, files that are corrupt and features the viewer does not
support are refused before they are opened. If the reason is unclear, copy the **Details** into an issue.

</details>

<details>
<summary>Reporting a bug</summary>

Use the [bug report](https://github.com/momokun7/orca-3d-viewer/issues/new?template=bug_report.yml) template
and paste the **Details** text. If you can share the model, say where it came from. A security problem belongs
in a [private report](https://github.com/momokun7/orca-3d-viewer/security/advisories/new), not an issue.

</details>

## Security

A model is untrusted input, so the viewer is built to be boring to attack.

- **Isolated**: it runs in Orca's isolated plugin frame, under a strict Content-Security-Policy, with no network.
- **No permissions**: the manifest asks for no capabilities: no worker, no commands, no file access.
- **Read only**: it never edits or saves the document, and URIs inside a model never reach a loader.
- **Checked first**: every format is checked against size budgets on a separate thread before anything is
  decoded. FBX's compressed arrays are inflated in small steps and stopped once they pass their declared size.
- **Tested**: CI runs the viewer under Orca's frame policy against hostile and fuzzed models, and checks that the
  committed bundle is reproducible from source.

See [SECURITY.md](SECURITY.md) for the details.

## Development

The plugin's code lives in `build/src`. `build/build.mjs` bundles it into `editor/`, which is committed so Orca
can load the plugin without a build step.

```sh
cd build
npm ci
npm test
npm run typecheck
npm run build
```

With [mise](https://mise.jdx.dev), `mise run check` runs everything CI runs, and `mise tasks` lists the rest.

To try your changes in Orca, run `orca plugin dev watch .` from the repository root, or add the folder under
**Settings → Plugins → Development**.

## Contributing

Issues, labels, the project board, milestones and pull requests are described in
[CONTRIBUTING.md](CONTRIBUTING.md). The translations other than English and Japanese were drafted by machine;
corrections from native speakers are very welcome.

## License and credits

[MIT](LICENSE). The bundled three.js, meshoptimizer, fflate and Lucide (MIT / ISC) and the Draco decoder
(Apache-2.0) keep their own licenses; see [THIRD_PARTY_NOTICES.txt](THIRD_PARTY_NOTICES.txt).

The models in the images and GIFs come from the sources below. In every copy, the format conversion, the colors
(3DBenchy's, the Armadillo's and the Teapot's are written into the file by us) and the orientation are our edit.

| Model | Used in | Source | License |
| --- | --- | --- | --- |
| Stanford Bunny | Hero image, feature GIFs | [Stanford 3D Scanning Repository](https://graphics.stanford.edu/data/3Dscanrep/). Source: Stanford University Computer Graphics Laboratory | Free for non-commercial use with credit |
| Stanford Armadillo | PLY | As above | As above |
| A Beautiful Game | GLB | Khronos [glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets). Original model by the MaterialX Project, conversion to glTF by Ed Mackey | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Corset | glTF | Khronos glTF Sample Assets, Microsoft | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| BoomBox | FBX | Khronos glTF Sample Assets, Microsoft | CC0 1.0 |
| 3DBenchy | STL | [3DBenchy.com](https://www.3dbenchy.com/), Creative Tools | CC0 1.0 |
| Utah Teapot | OBJ | [McGuire Computer Graphics Archive](https://casual-effects.com/data), Martin Newell (1975), Kenzie Lamar | CC0 |
| Fox | Animation GIF | Khronos glTF Sample Assets. Model by PixelMannen (CC0 1.0), rigging and animation by tomkranis, conversion to glTF by @AsoboStudio and @scurest | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
