<div align="center">

[English](../../README.md) · [日本語](README.ja.md) · [Deutsch](README.de.md) · [Español](README.es.md) ·
[Français](README.fr.md) · [한국어](README.ko.md) · [Português](README.pt-BR.md) ·
[Русский](README.ru.md) · [Türkçe](README.tr.md) · **简体中文** ·
[繁體中文](README.zh-Hant.md)

# 3D Viewer for Orca

**不用离开编辑器，就能查看 3D 模型。**

这是一款 [Orca](https://github.com/stablyai/orca) 插件，以只读方式打开 GLB、glTF、STL、PLY、OBJ 和 FBX 模型。
你可以绕着模型旋转查看、播放动画，还能一眼看出模型尺寸对不对。

[![CI](https://github.com/momokun7/orca-3d-viewer/actions/workflows/ci.yml/badge.svg)](https://github.com/momokun7/orca-3d-viewer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)
[![Orca](https://img.shields.io/badge/Orca-%E2%89%A5%201.4.248-black.svg)](https://github.com/stablyai/orca)
[![Permissions](https://img.shields.io/badge/permissions-none-brightgreen.svg)](#安全性)

[快速开始](#快速开始) · [支持的格式](#支持的格式) · [功能](#功能) · [安装](#安装) · [使用方法](#使用方法) ·
[故障排除](#故障排除) · [安全性](#安全性) · [开发](#开发) ·
[报告错误](https://github.com/momokun7/orca-3d-viewer/issues/new?template=bug_report.yml)

<img alt="在 Orca 中用 3D Viewer 查看放在地面网格上的 Stanford Bunny，状态栏显示其尺寸为 156 × 154 × 121 mm" src="../images/hero.png" width="800">

</div>

## 快速开始

1. 在 Orca 中打开 **设置 → 插件 → 安装插件**，在 **Git URL** 选项卡中输入 `https://github.com/momokun7/orca-3d-viewer#v1.0.0`，然后点击 **安装**。
2. 打开任意一个 `.glb`、`.gltf`、`.stl`、`.ply`、`.obj` 或 `.fbx` 文件。
3. 拖动鼠标旋转视角，滚动滚轮缩放。

插件不需要任何权限。更多说明见 [安装](#安装) 和 [使用方法](#使用方法)。

## 支持的格式

一个查看器，支持六种格式。

<table>
  <tr>
    <td width="33%"><img alt="GLB 格式的 A Beautiful Game：大理石棋盘，以及玻璃和金属质感的棋子" src="../images/formats/glb.png"></td>
    <td width="33%"><img alt="内嵌数据的 glTF 格式的 Corset：带刺绣的布料和搭扣" src="../images/formats/gltf.png"></td>
    <td width="33%"><img alt="STL 格式的 3DBenchy：用来测试 3D 打印机的小船，显示为文件中保存的橙色" src="../images/formats/stl.png"></td>
  </tr>
  <tr>
    <td align="center"><b>GLB</b>: A Beautiful Game</td>
    <td align="center"><b>glTF</b>: Corset</td>
    <td align="center"><b>STL</b>: 3DBenchy</td>
  </tr>
  <tr>
    <td width="33%"><img alt="PLY 格式的 Stanford Armadillo：一份 3D 扫描数据，显示为顶点中保存的绿色" src="../images/formats/ply.png"></td>
    <td width="33%"><img alt="OBJ 格式的 Utah Teapot，显示为顶点中保存的紫色" src="../images/formats/obj.png"></td>
    <td width="33%"><img alt="FBX 格式的 BoomBox，按钮和扬声器网罩的纹理清晰可见" src="../images/formats/fbx.png"></td>
  </tr>
  <tr>
    <td align="center"><b>PLY</b>: Stanford Armadillo</td>
    <td align="center"><b>OBJ</b>: Utah Teapot</td>
    <td align="center"><b>FBX</b>: BoomBox</td>
  </tr>
</table>

| 格式 | 扩展名 | 颜色和纹理 | 动画 | 尺寸单位 | 备注 |
| --- | --- | --- | --- | --- | --- |
| glTF 2.0 | `.glb` `.gltf` | 支持 | 支持 | 米（glTF 规范规定） | `.gltf` 必须内嵌数据 |
| STL | `.stl` | 文件中保存的颜色，没有则用默认颜色 | 不支持 | 毫米（3D 打印的惯例），Z 轴朝上 | 支持二进制和文本格式 |
| PLY | `.ply` | 顶点颜色，没有则用默认颜色 | 不支持 | 按米显示 | 支持二进制和文本格式 |
| OBJ | `.obj` | 顶点颜色（不读取 `.mtl`） | 不支持 | 按米显示 | |
| FBX | `.fbx` | 仅支持内嵌纹理 | 支持 | 文件中声明的单位 | 二进制 FBX 7.0（2011）及以上版本 |

经 Draco 或 Meshopt 压缩的 glTF，以及 KTX2 / Basis Universal 纹理，同样可以打开。

## 功能

### 自由查看

<table>
  <tr>
    <td width="50%"><img alt="按住鼠标左键拖动，相机绕着 Bunny 旋转" src="../images/features/orbit.gif"></td>
    <td width="50%"><img alt="先用右键拖动，再按住 Shift 用左键拖动，视图随之左右平移" src="../images/features/pan.gif"></td>
  </tr>
  <tr>
    <td align="center"><b>环绕</b>：拖动</td>
    <td align="center"><b>平移</b>：右键拖动，或 <kbd>Shift</kbd> + 拖动</td>
  </tr>
  <tr>
    <td width="50%"><img alt="滚动鼠标滚轮，把 Bunny 拉近再拉远" src="../images/features/zoom.gif"></td>
    <td width="50%"><img alt="视图转得上下颠倒后，点击重置按钮回到初始视角" src="../images/features/reset.gif"></td>
  </tr>
  <tr>
    <td align="center"><b>缩放</b>：滚动滚轮</td>
    <td align="center"><b>重置视图</b>：工具栏中的第一个按钮</td>
  </tr>
</table>

### 真实尺寸

画面中有地面网格和 X / Y / Z 坐标轴，并标出模型的宽 × 高 × 深，单位用错的模型一看便知。
比如 Stanford Bunny 宽 15.6 cm。

<img alt="10 mm 网格上的 Bunny；状态栏显示 156 × 154 × 121 mm，后面是“网格 10 mm”" src="../images/features/size.gif" width="600">

### 线框、网格和坐标轴

可以把模型显示为线框，也可以隐藏地面网格和坐标轴。状态栏会显示顶点数和三角形数。

<img alt="点击线框按钮后显示 Bunny 的网格结构，再点击网格和坐标轴按钮隐藏地面网格" src="../images/features/inspect.gif" width="600">

### 动画

支持播放和暂停；模型包含多个片段时，还可以选择要播放的片段。

<img alt="狐狸正在播放 Survey 片段，从片段菜单切换到 Run 后暂停，再继续播放" src="../images/features/animations.gif" width="600">

### 自动刷新

文件一保存，视图就会更新为新版本，相机位置保持不变。

<img alt="每次按 Ctrl + S 保存文件，Bunny 都会在原位置换一种颜色" src="../images/features/live.gif" width="600">

### 浅色和深色

查看器默认使用浅色主题，点击工具栏中的月亮按钮即可在深色和浅色之间切换。你上次选择的主题以及线框、网格设置都会被记住，
重启 Orca 后依然有效（需要 Orca 1.4.250 及以上版本）。

<img alt="点击工具栏中的月亮按钮，查看器切换为深色；再点击一次，又切回浅色" src="../images/features/theme.gif" width="600">

### 支持十一种语言

查看器的界面语言与 Orca 保持一致，支持 English、日本語、Deutsch、Español、Français、한국어、Português、
Русский、Türkçe、简体中文和繁體中文。

### 一键复制详情，方便提交 Issue

点击工具栏中的 **i** 按钮（出错时则点击错误消息下方的 **详情** 按钮），即可打开一份摘要，
其中包括查看器版本、浏览器和显卡信息、最近几次加载的记录和耗时，以及出现过的错误。
点击 **复制** 并粘贴到 Issue 中，就能把问题说清楚。摘要不包含模型数据。

<img alt="详情面板：列出查看器版本、浏览器、加载记录以及某个文件被拒绝打开的原因，底部有复制和关闭按钮" src="../images/details.png" width="600">

## 安装

1. 在 Orca 中打开 **设置 → 插件**，然后点击 **安装插件**。
2. 在 **Git URL** 选项卡中输入：

   ```text
   https://github.com/momokun7/orca-3d-viewer#v1.0.0
   ```

3. 点击 **安装**。查看器不申请任何权限，因此无需额外授权。

> [!IMPORTANT]
> 需要 Orca 桌面版 1.4.248 及以上版本。

## 使用方法

打开上述任一格式的文件，就会以 3D 方式显示。`.gltf` 和 `.obj` 是文本文件，可以在编辑器标签页上
切换 **源码**（文本）和 **3D** 两种视图。

| 操作 | 方法 |
| --- | --- |
| 环绕 | 拖动 |
| 平移 | 右键拖动、<kbd>Shift</kbd> + 拖动，或按方向键 |
| 缩放 | 滚动滚轮 |
| 重置视图 | 工具栏中的第一个按钮 |
| 线框、网格和坐标轴 | 紧挨着的几个按钮 |
| 浅色和深色 | 月亮按钮 |
| 详情 | **i** 按钮 |
| 动画 | 播放按钮和片段菜单（仅在模型包含动画时显示） |

## 限制

> [!NOTE]
> Orca 插件只能读取当前打开的文件，读不到同一文件夹中的其他文件，因此存放在其他文件中的数据无法显示。
> 几何数据存放在单独 `.bin` 文件中的 `.gltf` 无法打开；单独图片文件中的纹理和 OBJ 的 `.mtl` 也不会显示。
> `.glb`、内嵌数据的 `.gltf` 以及内嵌纹理的 FBX 则可以完整显示。

- **仅支持桌面版**：在浏览器中使用 Orca 时，文件会以源码形式打开。
- **文件不超过 64 MiB**：这是 Orca 对自定义编辑器的限制。如果模型解码后的数据量远超安全上限，或用到了查看器无法读取的功能，
  查看器会拒绝打开，并提示原因。
- **不支持旧版或文本格式的 FBX**：请重新导出为二进制 FBX 7.0 或以上版本。

我们测试了 Khronos [glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets) 中全部 152 个 GLB
和内嵌数据的 glTF 模型：只有 3 个模型因依赖 three.js 尚未实现的扩展而无法打开，其余全部正常。

## 故障排除

<details>
<summary>文件以文本形式打开，而不是 3D</summary>

`.gltf` 和 `.obj` 是文本文件，可能会以源码（文本）形式打开。请在编辑器标签页上选择 **3D**。
在浏览器中使用 Orca 时无法查看 3D。

</details>

<details>
<summary>纹理或颜色没有显示</summary>

插件无法读取单独图片文件中的纹理，状态栏会列出读取不到的文件名。
glTF 请改用 `.glb`；FBX 请在导出时内嵌纹理。OBJ 的 `.mtl` 无法读取，
所以模型有顶点颜色时按顶点颜色显示，没有则用默认颜色显示。

</details>

<details>
<summary>尺寸看起来不对</summary>

STL 不保存单位，所以按毫米显示；PLY 和 OBJ 同样不保存单位，按米显示。FBX 和 glTF 使用文件中声明的单位。
如果尺寸差了 1000 倍或 100 倍，请检查导出模型时选择的单位。

</details>

<details>
<summary>提示无法打开模型</summary>

提示消息会说明原因。模型过大、文件损坏，或用到了查看器不支持的功能，都会在打开前被拒绝。
如果看不出原因，请把 **详情** 复制到 Issue 中。

</details>

<details>
<summary>报告错误</summary>

请使用 [错误报告](https://github.com/momokun7/orca-3d-viewer/issues/new?template=bug_report.yml) 模板，
并粘贴 **详情** 中的文本。如果模型可以公开，请注明它的来源。安全问题请不要发 Issue，而是通过
[私密报告](https://github.com/momokun7/orca-3d-viewer/security/advisories/new) 提交。

</details>

## 安全性

模型属于不可信的输入，因此查看器在设计上尽量不给攻击者留下可乘之机。

- **隔离运行**：运行在 Orca 隔离的插件框架中，受严格的 Content-Security-Policy 约束，无法访问网络。
- **无需权限**：插件清单（manifest）不申请任何能力，不使用 worker、不注册命令，也不访问文件。
- **只读**：从不修改或保存文档，模型中的 URI 也绝不会交给加载器处理。
- **先检查再解码**：每种格式在解码前，都会先在独立线程中按大小上限进行检查。FBX 的压缩数组会分小块逐步解压，
  一旦超出声明的大小就立即停止。
- **充分测试**：CI 会在 Orca 的框架策略下，用恶意构造的模型和模糊测试生成的模型来运行查看器，并检查仓库中提交的打包文件
  能否从源码完全复现。

详情请参阅 [SECURITY.md](../../SECURITY.md)。

## 开发

插件源码位于 `build/src`。`build/build.mjs` 会将其打包到 `editor/` 目录。该目录也提交到了仓库中，
因此 Orca 无需构建即可直接加载插件。

```sh
cd build
npm ci
npm test
npm run typecheck
npm run build
```

如果你使用 [mise](https://mise.jdx.dev)，`mise run check` 会执行 CI 中的全部检查，`mise tasks` 可以列出其他任务。

要在 Orca 中试用你的修改，请在仓库根目录运行 `orca plugin dev watch .`，或在
**设置 → 插件 → 开发** 中添加该文件夹。

## 参与贡献

关于 Issue、标签、项目看板、里程碑和拉取请求的说明，请参阅 [CONTRIBUTING.md](../../CONTRIBUTING.md)。
除英语和日语外，其他语言的译文均由机器起草，欢迎母语人士帮忙改进。

## 许可证与致谢

[MIT](../../LICENSE)。随附打包的 three.js、meshoptimizer、fflate、Lucide（MIT / ISC）以及 Draco 解码器
（Apache-2.0）各自沿用其原有许可证，详见 [THIRD_PARTY_NOTICES.txt](../../THIRD_PARTY_NOTICES.txt)。

图片和 GIF 中使用的模型来源如下。所有副本的格式转换、颜色（3DBenchy、Armadillo 和 Teapot 的颜色是我们写入文件的）
以及朝向均经过我们的修改。

| 模型 | 用于 | 来源 | 许可证 |
| --- | --- | --- | --- |
| Stanford Bunny | 头图、功能演示 GIF | [Stanford 3D Scanning Repository](https://graphics.stanford.edu/data/3Dscanrep/)。Source: Stanford University Computer Graphics Laboratory | 注明出处即可免费用于非商业用途 |
| Stanford Armadillo | PLY | 同上 | 同上 |
| A Beautiful Game | GLB | Khronos [glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets)。原始模型由 MaterialX Project 制作，Ed Mackey 转换为 glTF | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Corset | glTF | Khronos glTF Sample Assets，Microsoft | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| BoomBox | FBX | Khronos glTF Sample Assets，Microsoft | CC0 1.0 |
| 3DBenchy | STL | [3DBenchy.com](https://www.3dbenchy.com/)，Creative Tools | CC0 1.0 |
| Utah Teapot | OBJ | [McGuire Computer Graphics Archive](https://casual-effects.com/data)，Martin Newell（1975），Kenzie Lamar | CC0 |
| Fox | 动画 GIF | Khronos glTF Sample Assets。模型由 PixelMannen 制作（CC0 1.0），骨骼绑定和动画由 tomkranis 制作，@AsoboStudio 和 @scurest 转换为 glTF | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
