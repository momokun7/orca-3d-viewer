<div align="center">

[English](../../README.md) · [日本語](README.ja.md) · [Deutsch](README.de.md) · [Español](README.es.md) ·
[Français](README.fr.md) · [한국어](README.ko.md) · [Português](README.pt-BR.md) ·
[Русский](README.ru.md) · [Türkçe](README.tr.md) · **简体中文** ·
[繁體中文](README.zh-Hant.md)

# 3D Viewer for Orca

**无需离开编辑器，即可查看 3D 模型。**

一款用于 [Orca](https://github.com/stablyai/orca) 的只读查看器，可打开 GLB、glTF、STL、PLY、OBJ 和 FBX。
你可以环绕模型查看、播放动画，并一眼确认模型的尺寸是否符合预期。

[![CI](https://github.com/momokun7/orca-3d-viewer/actions/workflows/ci.yml/badge.svg)](https://github.com/momokun7/orca-3d-viewer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)
[![Orca](https://img.shields.io/badge/Orca-%E2%89%A5%201.4.248-black.svg)](https://github.com/stablyai/orca)
[![Permissions](https://img.shields.io/badge/permissions-none-brightgreen.svg)](#安全性)

[支持的格式](#支持的格式) · [功能](#功能) · [安装](#安装) · [使用方法](#使用方法) ·
[故障排除](#故障排除) · [安全性](#安全性) · [开发](#开发) ·
[报告错误](https://github.com/momokun7/orca-3d-viewer/issues/new?template=bug_report.yml)

<img alt="Orca 中的 3D Viewer 显示坐在地面网格上的 Stanford Bunny，状态栏显示其尺寸 156 × 154 × 121 mm" src="../images/hero.png" width="800">

</div>

## 支持的格式

一个查看器，六种格式。

<table>
  <tr>
    <td width="33%"><img alt="GLB 格式的 A Beautiful Game：大理石棋盘与玻璃、金属材质的棋子" src="../images/formats/glb.png"></td>
    <td width="33%"><img alt="已嵌入数据的 glTF 格式的 Corset：带刺绣的布料和搭扣" src="../images/formats/gltf.png"></td>
    <td width="33%"><img alt="STL 格式的 3DBenchy：用于测试 3D 打印机的小船，以文件中保存的橙色显示" src="../images/formats/stl.png"></td>
  </tr>
  <tr>
    <td align="center"><b>GLB</b>: A Beautiful Game</td>
    <td align="center"><b>glTF</b>: Corset</td>
    <td align="center"><b>STL</b>: 3DBenchy</td>
  </tr>
  <tr>
    <td width="33%"><img alt="PLY 格式的 Stanford Armadillo：一份 3D 扫描数据，以顶点中保存的绿色显示" src="../images/formats/ply.png"></td>
    <td width="33%"><img alt="OBJ 格式的 Utah Teapot，以顶点中保存的紫色显示" src="../images/formats/obj.png"></td>
    <td width="33%"><img alt="FBX 格式的 BoomBox，带有按钮和扬声器网罩的纹理" src="../images/formats/fbx.png"></td>
  </tr>
  <tr>
    <td align="center"><b>PLY</b>: Stanford Armadillo</td>
    <td align="center"><b>OBJ</b>: Utah Teapot</td>
    <td align="center"><b>FBX</b>: BoomBox</td>
  </tr>
</table>

| 格式 | 扩展名 | 颜色和纹理 | 动画 | 尺寸单位 | 说明 |
| --- | --- | --- | --- | --- | --- |
| glTF 2.0 | `.glb` `.gltf` | 支持 | 支持 | 米（glTF 规范的定义） | `.gltf` 必须嵌入数据 |
| STL | `.stl` | 文件中保存的颜色，否则使用默认颜色 | 不支持 | 毫米（3D 打印的惯例），Z 轴朝上 | 二进制和文本均可 |
| PLY | `.ply` | 顶点颜色，否则使用默认颜色 | 不支持 | 按米显示 | 二进制和文本均可 |
| OBJ | `.obj` | 顶点颜色（无法读取 `.mtl`） | 不支持 | 按米显示 | |
| FBX | `.fbx` | 仅限嵌入的纹理 | 支持 | 文件中声明的单位 | 二进制 FBX 7.0（2011）及更高版本 |

使用 Draco 或 Meshopt 压缩的 glTF，以及 KTX2 / Basis Universal 纹理，也都能打开。

## 功能

### 四处查看

<table>
  <tr>
    <td width="50%"><img alt="按住鼠标左键拖动，相机围绕 Bunny 旋转" src="../images/features/orbit.gif"></td>
    <td width="50%"><img alt="先用右键拖动，再按住 Shift 用左键拖动，视图向侧面平移" src="../images/features/pan.gif"></td>
  </tr>
  <tr>
    <td align="center"><b>环绕</b>：拖动</td>
    <td align="center"><b>平移</b>：右键拖动，或 <kbd>Shift</kbd> + 拖动</td>
  </tr>
  <tr>
    <td width="50%"><img alt="滚动鼠标滚轮，拉近 Bunny 后再拉远" src="../images/features/zoom.gif"></td>
    <td width="50%"><img alt="上下颠倒的视图通过重置按钮回到初始视图" src="../images/features/reset.gif"></td>
  </tr>
  <tr>
    <td align="center"><b>缩放</b>：滚动</td>
    <td align="center"><b>重置视图</b>：工具栏的第一个按钮</td>
  </tr>
</table>

### 真实尺寸

地面网格、X / Y / Z 坐标轴，以及模型的宽 × 高 × 深，让以错误单位制作的模型一眼就能看出来。
Stanford Bunny 的宽度为 15.6 cm。

<img alt="10 mm 网格上的 Bunny；状态栏显示 156 × 154 × 121 mm，然后是网格 10 mm" src="../images/features/size.gif" width="600">

### 线框、网格和坐标轴

可以只用线条显示网格体，也可以隐藏网格和坐标轴。顶点数和三角形数显示在状态栏中。

<img alt="线框按钮显示 Bunny 的网格体，随后网格和坐标轴按钮隐藏地面网格" src="../images/features/inspect.gif" width="600">

### 动画

可以播放和暂停；模型有多个片段时，还可以选择片段。

<img alt="一只狐狸播放 Survey 片段，从片段菜单切换到 Run，然后暂停并再次播放" src="../images/features/animations.gif" width="600">

### 保持最新

保存文件后，视图会显示新版本，相机位置保持不变。

<img alt="每次用 Ctrl + S 保存文件，Bunny 都会在原处改变颜色" src="../images/features/live.gif" width="600">

### 浅色或深色

查看器默认以浅色打开；工具栏中的月亮按钮可在深色和浅色之间切换。它会记住你上次选择的主题、线框和网格设置，
即使重启 Orca 也不会丢失（Orca 1.4.250 及更高版本）。

<img alt="点击工具栏中的月亮按钮，查看器变为深色；再次点击则变回浅色" src="../images/features/theme.gif" width="600">

### 十一种语言

查看器的文字跟随 Orca 的语言：English、日本語、Deutsch、Español、Français、한국어、Português、
Русский、Türkçe、简体中文和繁體中文。

### 可粘贴到 Issue 的详情

工具栏中的 **i** 按钮（在错误画面中，则是消息下方的 **详情** 按钮）会打开一份摘要：
包括查看器版本、浏览器和图形信息、最近的加载记录及其耗时，以及遇到的错误。
**复制** 后粘贴到 Issue 中，就能说明发生了什么。其中不包含模型数据。

<img alt="详情面板：显示查看器版本、浏览器、加载记录以及拒绝打开某个文件的原因，并带有复制和关闭按钮" src="../images/details.png" width="600">

## 安装

1. 在 Orca 中打开 **设置 → 插件**，然后选择 **安装插件**。
2. 在 **Git URL** 选项卡中输入：

   ```text
   https://github.com/momokun7/orca-3d-viewer#v1.0.0
   ```

3. 选择 **安装**。查看器不请求任何权限，因此无需再授予其他权限。

> [!IMPORTANT]
> 需要 Orca 桌面应用 1.4.248 或更高版本。

## 使用方法

打开上述任一格式的文件，即会以 3D 显示。`.gltf` 和 `.obj` 是文本文件，因此可以在编辑器标签页上
切换 **源码**（文本）和 **3D**。

| 操作 | 方法 |
| --- | --- |
| 环绕 | 拖动 |
| 平移 | 右键拖动、<kbd>Shift</kbd> + 拖动，或方向键 |
| 缩放 | 滚动 |
| 重置视图 | 工具栏的第一个按钮 |
| 线框、网格和坐标轴 | 旁边的按钮 |
| 浅色或深色 | 月亮按钮 |
| 详情 | **i** 按钮 |
| 动画 | 播放按钮和片段菜单（模型含有动画时） |

## 限制

> [!NOTE]
> Orca 插件只能读取打开的文件，无法读取同一文件夹中的其他文件，因此无法显示保存在单独文件中的数据。
> 几何数据保存在单独 `.bin` 中的 `.gltf` 无法打开，单独图片文件中的纹理和 OBJ 的 `.mtl` 也不会显示。
> `.glb`、已嵌入数据的 `.gltf`，或已嵌入纹理的 FBX 可以完整显示。

- **仅限桌面应用**：在浏览器中运行的 Orca 里，文件会以源码打开。
- **最大 64 MiB**：这是 Orca 对自定义编辑器的限制。解码后远超安全上限的模型，或使用了查看器无法读取的功能的模型，
  会被拒绝打开，并显示说明原因的消息。
- **不支持旧版或文本格式的 FBX**：请重新导出为二进制 FBX 7.0 或更高版本。

我们检查了 Khronos [glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets) 中全部 152 个 GLB
和已嵌入数据的 glTF 模型：除了 3 个需要 three.js 尚未实现的扩展的模型外，其余都能打开。

## 故障排除

<details>
<summary>文件以文本而不是 3D 打开</summary>

`.gltf` 和 `.obj` 是文本文件，因此可能会以源码（文本）打开。请在编辑器标签页上选择 **3D**。
在浏览器中运行的 Orca 无法使用 3D。

</details>

<details>
<summary>纹理或颜色缺失</summary>

插件无法读取单独图片文件中的纹理；状态栏会列出无法读取的文件名。
对于 glTF，请使用 `.glb`；对于 FBX，请在导出时嵌入纹理。OBJ 的 `.mtl` 无法读取，
因此如果有顶点颜色就以顶点颜色显示，否则以默认颜色显示。

</details>

<details>
<summary>尺寸看起来不对</summary>

STL 按毫米显示，PLY 和 OBJ 按米显示，因为这些格式都不保存单位。FBX 和 glTF 使用文件中声明的单位。
如果尺寸相差 1000 倍或 100 倍，请检查导出模型时使用的单位。

</details>

<details>
<summary>提示无法打开模型</summary>

消息中会说明原因。过大的模型、损坏的文件，以及查看器不支持的功能，都会在打开前被拒绝。
如果原因不明，请将 **详情** 复制到 Issue 中。

</details>

<details>
<summary>报告错误</summary>

请使用 [错误报告](https://github.com/momokun7/orca-3d-viewer/issues/new?template=bug_report.yml) 模板，
并粘贴 **详情** 中的文本。如果可以分享模型，请说明它的来源。安全问题请通过
[私密报告](https://github.com/momokun7/orca-3d-viewer/security/advisories/new) 提交，而不是创建 Issue。

</details>

## 安全性

模型是不可信的输入，因此这个查看器在设计上让攻击者无从下手。

- **隔离**：在 Orca 隔离的插件框架中运行，受严格的 Content-Security-Policy 约束，且无法访问网络。
- **无权限**：清单不请求任何功能：没有 worker，没有命令，也没有文件访问。
- **只读**：从不编辑或保存文档，模型中的 URI 也绝不会传给加载器。
- **先检查**：在解码任何内容之前，每种格式都会先在单独的线程中按大小上限进行检查。FBX 的压缩数组会分小步解压，
  一旦超过其声明的大小就立即停止。
- **经过测试**：CI 在 Orca 的框架策略下，用恶意模型和模糊测试生成的模型运行查看器，并检查提交的打包文件
  能否从源代码完全重现。

详情请参阅 [SECURITY.md](../../SECURITY.md)。

## 开发

插件代码位于 `build/src`。`build/build.mjs` 会将其打包到 `editor/`，该目录也已提交，
因此 Orca 无需构建步骤即可加载插件。

```sh
cd build
npm ci
npm test
npm run typecheck
npm run build
```

如果使用 [mise](https://mise.jdx.dev)，`mise run check` 会运行 CI 运行的全部检查，`mise tasks` 会列出其余任务。

要在 Orca 中试用你的修改，请在仓库根目录运行 `orca plugin dev watch .`，或在
**设置 → 插件 → 开发** 中添加该文件夹。

## 参与贡献

关于 Issue、标签、项目看板、里程碑和拉取请求的说明，请参阅 [CONTRIBUTING.md](../../CONTRIBUTING.md)。
除英语和日语外，其他语言的译文均由机器起草；非常欢迎母语使用者提出修改。

## 许可证与致谢

[MIT](../../LICENSE)。打包附带的 three.js、meshoptimizer、fflate 和 Lucide（MIT / ISC）以及 Draco 解码器
（Apache-2.0）各自沿用其许可证；请参阅 [THIRD_PARTY_NOTICES.txt](../../THIRD_PARTY_NOTICES.txt)。

图片和 GIF 中的模型来自以下来源。在每一份副本中，格式转换、颜色（3DBenchy、Armadillo 和 Teapot 的颜色由我们写入文件）
以及朝向均为我们所做的修改。

| 模型 | 使用位置 | 来源 | 许可证 |
| --- | --- | --- | --- |
| Stanford Bunny | 首图、功能 GIF | [Stanford 3D Scanning Repository](https://graphics.stanford.edu/data/3Dscanrep/)。Source: Stanford University Computer Graphics Laboratory | 注明出处即可免费用于非商业用途 |
| Stanford Armadillo | PLY | 同上 | 同上 |
| A Beautiful Game | GLB | Khronos [glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets)。原始模型由 MaterialX Project 制作，由 Ed Mackey 转换为 glTF | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Corset | glTF | Khronos glTF Sample Assets，Microsoft | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| BoomBox | FBX | Khronos glTF Sample Assets，Microsoft | CC0 1.0 |
| 3DBenchy | STL | [3DBenchy.com](https://www.3dbenchy.com/)，Creative Tools | CC0 1.0 |
| Utah Teapot | OBJ | [McGuire Computer Graphics Archive](https://casual-effects.com/data)，Martin Newell（1975），Kenzie Lamar | CC0 |
| Fox | 动画 GIF | Khronos glTF Sample Assets。模型由 PixelMannen 制作（CC0 1.0），绑定和动画由 tomkranis 制作，由 @AsoboStudio 和 @scurest 转换为 glTF | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
