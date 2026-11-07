<div align="center">

[English](../../README.md) · [日本語](README.ja.md) · [Deutsch](README.de.md) · [Español](README.es.md) ·
[Français](README.fr.md) · [한국어](README.ko.md) · [Português](README.pt-BR.md) ·
[Русский](README.ru.md) · [Türkçe](README.tr.md) · [简体中文](README.zh-Hans.md) ·
**繁體中文**

# 3D Viewer for Orca

**不必離開編輯器，就能檢視 3D 模型。**

一款適用於 [Orca](https://github.com/stablyai/orca) 的唯讀檢視器，可開啟 GLB、glTF、STL、PLY、OBJ 和 FBX。
你可以環繞模型檢視、播放動畫，並一眼確認模型的尺寸是否符合預期。

[![CI](https://github.com/momokun7/orca-3d-viewer/actions/workflows/ci.yml/badge.svg)](https://github.com/momokun7/orca-3d-viewer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)
[![Orca](https://img.shields.io/badge/Orca-%E2%89%A5%201.4.248-black.svg)](https://github.com/stablyai/orca)
[![Permissions](https://img.shields.io/badge/permissions-none-brightgreen.svg)](#安全性)

[支援的格式](#支援的格式) · [功能](#功能) · [安裝](#安裝) · [使用方式](#使用方式) ·
[疑難排解](#疑難排解) · [安全性](#安全性) · [開發](#開發) ·
[回報錯誤](https://github.com/momokun7/orca-3d-viewer/issues/new?template=bug_report.yml)

<img alt="Orca 中的 3D Viewer 顯示坐在地面網格上的 Stanford Bunny，狀態列顯示其尺寸 156 × 154 × 121 mm" src="../images/hero.png" width="800">

</div>

## 支援的格式

一個檢視器，六種格式。

<table>
  <tr>
    <td width="33%"><img alt="GLB 格式的 A Beautiful Game：大理石棋盤與玻璃、金屬質感的棋子" src="../images/formats/glb.png"></td>
    <td width="33%"><img alt="已內嵌資料的 glTF 格式的 Corset：帶有刺繡的布料與扣環" src="../images/formats/gltf.png"></td>
    <td width="33%"><img alt="STL 格式的 3DBenchy：用來測試 3D 印表機的小船，以檔案中儲存的橘色顯示" src="../images/formats/stl.png"></td>
  </tr>
  <tr>
    <td align="center"><b>GLB</b>: A Beautiful Game</td>
    <td align="center"><b>glTF</b>: Corset</td>
    <td align="center"><b>STL</b>: 3DBenchy</td>
  </tr>
  <tr>
    <td width="33%"><img alt="PLY 格式的 Stanford Armadillo：一份 3D 掃描資料，以頂點中儲存的綠色顯示" src="../images/formats/ply.png"></td>
    <td width="33%"><img alt="OBJ 格式的 Utah Teapot，以頂點中儲存的紫色顯示" src="../images/formats/obj.png"></td>
    <td width="33%"><img alt="FBX 格式的 BoomBox，帶有按鈕與喇叭網罩的紋理" src="../images/formats/fbx.png"></td>
  </tr>
  <tr>
    <td align="center"><b>PLY</b>: Stanford Armadillo</td>
    <td align="center"><b>OBJ</b>: Utah Teapot</td>
    <td align="center"><b>FBX</b>: BoomBox</td>
  </tr>
</table>

| 格式 | 副檔名 | 顏色與紋理 | 動畫 | 尺寸單位 | 備註 |
| --- | --- | --- | --- | --- | --- |
| glTF 2.0 | `.glb` `.gltf` | 支援 | 支援 | 公尺（依 glTF 規範） | `.gltf` 必須內嵌資料 |
| STL | `.stl` | 檔案中儲存的顏色，否則使用預設顏色 | 不支援 | 公釐（3D 列印的慣例），Z 軸朝上 | 二進位與文字皆可 |
| PLY | `.ply` | 頂點顏色，否則使用預設顏色 | 不支援 | 以公尺顯示 | 二進位與文字皆可 |
| OBJ | `.obj` | 頂點顏色（無法讀取 `.mtl`） | 不支援 | 以公尺顯示 | |
| FBX | `.fbx` | 僅限內嵌的紋理 | 支援 | 檔案中宣告的單位 | 二進位 FBX 7.0（2011）及更新版本 |

以 Draco 或 Meshopt 壓縮的 glTF，以及 KTX2 / Basis Universal 紋理，也都能開啟。

## 功能

### 四處檢視

<table>
  <tr>
    <td width="50%"><img alt="按住滑鼠左鍵拖曳，相機會繞著 Bunny 旋轉" src="../images/features/orbit.gif"></td>
    <td width="50%"><img alt="先以右鍵拖曳，再按住 Shift 以左鍵拖曳，畫面會往側邊平移" src="../images/features/pan.gif"></td>
  </tr>
  <tr>
    <td align="center"><b>環繞</b>：拖曳</td>
    <td align="center"><b>平移</b>：右鍵拖曳，或 <kbd>Shift</kbd> + 拖曳</td>
  </tr>
  <tr>
    <td width="50%"><img alt="捲動滑鼠滾輪，拉近 Bunny 後再拉遠" src="../images/features/zoom.gif"></td>
    <td width="50%"><img alt="上下顛倒的檢視透過重設按鈕回到初始檢視" src="../images/features/reset.gif"></td>
  </tr>
  <tr>
    <td align="center"><b>縮放</b>：捲動</td>
    <td align="center"><b>重設檢視</b>：工具列的第一個按鈕</td>
  </tr>
</table>

### 實際尺寸

地面網格、X / Y / Z 座標軸，以及模型的寬 × 高 × 深，讓以錯誤單位製作的模型一眼就能看出來。
Stanford Bunny 的寬度為 15.6 cm。

<img alt="10 mm 網格上的 Bunny；狀態列顯示 156 × 154 × 121 mm，接著是網格 10 mm" src="../images/features/size.gif" width="600">

### 線框、網格與座標軸

可以只用線條顯示網格模型，也可以隱藏網格與座標軸。頂點數與三角形數顯示在狀態列中。

<img alt="線框按鈕顯示 Bunny 的網格模型，接著網格與座標軸按鈕隱藏地面網格" src="../images/features/inspect.gif" width="600">

### 動畫

可以播放與暫停；模型有多個片段時，還可以選擇片段。

<img alt="一隻狐狸播放 Survey 片段，從片段選單切換到 Run，接著暫停並再次播放" src="../images/features/animations.gif" width="600">

### 保持最新

儲存檔案後，檢視會顯示新版本，相機位置維持不變。

<img alt="每次以 Ctrl + S 儲存檔案，Bunny 都會在原處改變顏色" src="../images/features/live.gif" width="600">

### 淺色或深色

檢視器預設以淺色開啟；工具列中的月亮按鈕可在深色與淺色之間切換。它會記住你上次選擇的主題、線框與網格設定，
即使重新啟動 Orca 也不會遺失（Orca 1.4.250 及更新版本）。

<img alt="點選工具列中的月亮按鈕，檢視器會變成深色；再點選一次則變回淺色" src="../images/features/theme.gif" width="600">

### 十一種語言

檢視器的文字會跟隨 Orca 的語言：English、日本語、Deutsch、Español、Français、한국어、Português、
Русский、Türkçe、简体中文與繁體中文。

### 可貼到 Issue 的詳情

工具列中的 **i** 按鈕（在錯誤畫面中，則是訊息下方的 **詳情** 按鈕）會開啟一份摘要：
包括檢視器版本、瀏覽器與圖形資訊、最近的載入記錄及其耗時，以及遇到的錯誤。
**複製** 後貼到 Issue 中，就能說明發生了什麼事。其中不含模型資料。

<img alt="詳情面板：顯示檢視器版本、瀏覽器、載入記錄以及拒絕開啟某個檔案的原因，並附有複製與關閉按鈕" src="../images/details.png" width="600">

## 安裝

1. 在 Orca 中開啟 **設定 → 外掛**，然後選擇 **安裝外掛**。
2. 在 **Git URL** 分頁中輸入：

   ```text
   https://github.com/momokun7/orca-3d-viewer#v1.0.0
   ```

3. 選擇 **安裝**。檢視器不要求任何權限，因此不需要再授予其他權限。

> [!IMPORTANT]
> 需要 Orca 桌面應用程式 1.4.248 或更新版本。

## 使用方式

開啟上述任一格式的檔案，就會以 3D 顯示。`.gltf` 和 `.obj` 是文字檔案，因此可以在編輯器分頁上
切換 **原始碼**（文字）與 **3D**。

| 操作 | 方式 |
| --- | --- |
| 環繞 | 拖曳 |
| 平移 | 右鍵拖曳、<kbd>Shift</kbd> + 拖曳，或方向鍵 |
| 縮放 | 捲動 |
| 重設檢視 | 工具列的第一個按鈕 |
| 線框、網格與座標軸 | 旁邊的按鈕 |
| 淺色或深色 | 月亮按鈕 |
| 詳情 | **i** 按鈕 |
| 動畫 | 播放按鈕與片段選單（模型含有動畫時） |

## 限制

> [!NOTE]
> Orca 外掛只能讀取開啟的檔案，無法讀取同一資料夾中的其他檔案，因此無法顯示儲存在個別檔案中的資料。
> 幾何資料儲存在個別 `.bin` 中的 `.gltf` 無法開啟，個別圖片檔案中的紋理與 OBJ 的 `.mtl` 也不會顯示。
> `.glb`、已內嵌資料的 `.gltf`，或已內嵌紋理的 FBX 可以完整顯示。

- **僅限桌面應用程式**：在瀏覽器中執行的 Orca 裡，檔案會以原始碼開啟。
- **最大 64 MiB**：這是 Orca 對自訂編輯器的限制。解碼後遠超過安全上限的模型，或使用了檢視器無法讀取之功能的模型，
  會被拒絕開啟，並顯示說明原因的訊息。
- **不支援舊版或文字格式的 FBX**：請重新匯出為二進位 FBX 7.0 或更新版本。

我們檢查了 Khronos [glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets) 中全部 152 個 GLB
與已內嵌資料的 glTF 模型：除了 3 個需要 three.js 尚未實作之擴充功能的模型外，其餘都能開啟。

## 疑難排解

<details>
<summary>檔案以文字而不是 3D 開啟</summary>

`.gltf` 和 `.obj` 是文字檔案，因此可能會以原始碼（文字）開啟。請在編輯器分頁上選擇 **3D**。
在瀏覽器中執行的 Orca 無法使用 3D。

</details>

<details>
<summary>紋理或顏色不見了</summary>

外掛無法讀取個別圖片檔案中的紋理；狀態列會列出無法讀取的檔案名稱。
若是 glTF，請使用 `.glb`；若是 FBX，請在匯出時內嵌紋理。OBJ 的 `.mtl` 無法讀取，
因此若有頂點顏色就以頂點顏色顯示，否則以預設顏色顯示。

</details>

<details>
<summary>尺寸看起來不對</summary>

STL 以公釐顯示，PLY 與 OBJ 以公尺顯示，因為這些格式都不儲存單位。FBX 與 glTF 使用檔案中宣告的單位。
如果尺寸相差 1000 倍或 100 倍，請檢查匯出模型時使用的單位。

</details>

<details>
<summary>顯示無法開啟模型</summary>

訊息中會說明原因。過大的模型、損毀的檔案，以及檢視器不支援的功能，都會在開啟前被拒絕。
如果原因不明，請將 **詳情** 複製到 Issue 中。

</details>

<details>
<summary>回報錯誤</summary>

請使用 [錯誤回報](https://github.com/momokun7/orca-3d-viewer/issues/new?template=bug_report.yml) 範本，
並貼上 **詳情** 中的文字。如果可以分享模型，請說明它的來源。安全性問題請透過
[私人回報](https://github.com/momokun7/orca-3d-viewer/security/advisories/new) 提交，而不是建立 Issue。

</details>

## 安全性

模型是不可信任的輸入，因此這個檢視器在設計上讓攻擊者無從下手。

- **隔離**：在 Orca 隔離的外掛框架中執行，受嚴格的 Content-Security-Policy 約束，且無法存取網路。
- **無權限**：資訊清單不要求任何功能：沒有 worker，沒有命令，也沒有檔案存取。
- **唯讀**：從不編輯或儲存文件，模型中的 URI 也絕不會傳給載入器。
- **先檢查**：在解碼任何內容之前，每種格式都會先在個別的執行緒中依大小上限進行檢查。FBX 的壓縮陣列會分小步解壓縮，
  一旦超過其宣告的大小就立即停止。
- **經過測試**：CI 在 Orca 的框架政策下，以惡意模型與模糊測試產生的模型執行檢視器，並檢查提交的打包檔案
  能否從原始碼完整重現。

詳情請參閱 [SECURITY.md](../../SECURITY.md)。

## 開發

外掛程式碼位於 `build/src`。`build/build.mjs` 會將其打包到 `editor/`，該目錄也已提交，
因此 Orca 不需要建置步驟就能載入外掛。

```sh
cd build
npm ci
npm test
npm run typecheck
npm run build
```

如果使用 [mise](https://mise.jdx.dev)，`mise run check` 會執行 CI 執行的全部檢查，`mise tasks` 會列出其餘工作。

若要在 Orca 中試用你的修改，請在存放庫根目錄執行 `orca plugin dev watch .`，或在
**設定 → 外掛 → 開發** 中加入該資料夾。

## 參與貢獻

關於 Issue、標籤、專案看板、里程碑與提取要求的說明，請參閱 [CONTRIBUTING.md](../../CONTRIBUTING.md)。
除了英文與日文以外，其他語言的譯文皆由機器起草；非常歡迎母語人士提出修正。

## 授權與出處

[MIT](../../LICENSE)。隨附的 three.js、meshoptimizer、fflate 與 Lucide（MIT / ISC）以及 Draco 解碼器
（Apache-2.0）各自沿用其授權條款；請參閱 [THIRD_PARTY_NOTICES.txt](../../THIRD_PARTY_NOTICES.txt)。

圖片與 GIF 中的模型來自以下來源。在每一份副本中，格式轉換、顏色（3DBenchy、Armadillo 與 Teapot 的顏色由我們寫入檔案）
以及方向均為我們所做的修改。

| 模型 | 使用位置 | 來源 | 授權 |
| --- | --- | --- | --- |
| Stanford Bunny | 主圖、功能 GIF | [Stanford 3D Scanning Repository](https://graphics.stanford.edu/data/3Dscanrep/)。Source: Stanford University Computer Graphics Laboratory | 註明出處即可免費用於非商業用途 |
| Stanford Armadillo | PLY | 同上 | 同上 |
| A Beautiful Game | GLB | Khronos [glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets)。原始模型由 MaterialX Project 製作，由 Ed Mackey 轉換為 glTF | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Corset | glTF | Khronos glTF Sample Assets，Microsoft | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| BoomBox | FBX | Khronos glTF Sample Assets，Microsoft | CC0 1.0 |
| 3DBenchy | STL | [3DBenchy.com](https://www.3dbenchy.com/)，Creative Tools | CC0 1.0 |
| Utah Teapot | OBJ | [McGuire Computer Graphics Archive](https://casual-effects.com/data)，Martin Newell（1975），Kenzie Lamar | CC0 |
| Fox | 動畫 GIF | Khronos glTF Sample Assets。模型由 PixelMannen 製作（CC0 1.0），骨架綁定與動畫由 tomkranis 製作，由 @AsoboStudio 與 @scurest 轉換為 glTF | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
