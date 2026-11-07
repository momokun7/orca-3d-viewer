<div align="center">

[English](../../README.md) · [日本語](README.ja.md) · [Deutsch](README.de.md) · [Español](README.es.md) ·
[Français](README.fr.md) · [한국어](README.ko.md) · [Português](README.pt-BR.md) ·
[Русский](README.ru.md) · [Türkçe](README.tr.md) · [简体中文](README.zh-Hans.md) ·
**繁體中文**

# 3D Viewer for Orca

這是一款 [Orca](https://github.com/stablyai/orca) 外掛，能以唯讀方式開啟 GLB、glTF、STL、PLY、OBJ 和 FBX 模型。
你可以繞著模型轉動視角、播放動畫，也能一眼看出模型的尺寸對不對。

[![CI](https://github.com/momokun7/orca-3d-viewer/actions/workflows/ci.yml/badge.svg)](https://github.com/momokun7/orca-3d-viewer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)
[![Orca](https://img.shields.io/badge/Orca-%E2%89%A5%201.4.248-black.svg)](https://github.com/stablyai/orca)
[![Permissions](https://img.shields.io/badge/permissions-none-brightgreen.svg)](#安全性)

[快速開始](#快速開始) · [支援的格式](#支援的格式) · [功能](#功能) · [安裝](#安裝) · [使用方式](#使用方式) ·
[疑難排解](#疑難排解) · [安全性](#安全性) · [開發](#開發) ·
[回報錯誤](https://github.com/momokun7/orca-3d-viewer/issues/new?template=bug_report.yml)

<img alt="在 Orca 中以 3D Viewer 檢視放在地面網格上的 Stanford Bunny，狀態列顯示其尺寸為 156 × 154 × 121 mm" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/hero.png" width="800">

</div>

## 快速開始

1. 在 Orca 中開啟 **設定 → 外掛 → 安裝外掛**，在 **Git URL** 分頁中輸入 `https://github.com/momokun7/orca-3d-viewer#v1.0.2`，依序按下 **繼續** 和 **安裝**，再於接著出現的對話框中按下 **啟用外掛**。
2. 開啟任一個 `.glb`、`.gltf`、`.stl`、`.ply`、`.obj` 或 `.fbx` 檔案。
3. 拖曳滑鼠即可旋轉視角，捲動滾輪即可縮放。

外掛不需要任何權限。詳細說明請參閱 [安裝](#安裝) 與 [使用方式](#使用方式)。

## 支援的格式

一個檢視器，支援六種格式。

<table>
  <tr>
    <td width="33%"><img alt="GLB 格式的 A Beautiful Game：大理石棋盤，以及玻璃和金屬質感的棋子" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/formats/glb.png"></td>
    <td width="33%"><img alt="內嵌資料的 glTF 格式 Corset：帶有刺繡的布料與扣環" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/formats/gltf.png"></td>
    <td width="33%"><img alt="STL 格式的 3DBenchy：用來測試 3D 印表機的小船，以檔案中儲存的橘色顯示" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/formats/stl.png"></td>
  </tr>
  <tr>
    <td align="center"><b>GLB</b>: A Beautiful Game</td>
    <td align="center"><b>glTF</b>: Corset</td>
    <td align="center"><b>STL</b>: 3DBenchy</td>
  </tr>
  <tr>
    <td width="33%"><img alt="PLY 格式的 Stanford Armadillo：一份 3D 掃描資料，以頂點中儲存的綠色顯示" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/formats/ply.png"></td>
    <td width="33%"><img alt="OBJ 格式的 Utah Teapot，以頂點中儲存的紫色顯示" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/formats/obj.png"></td>
    <td width="33%"><img alt="FBX 格式的 BoomBox，可以看到按鈕與喇叭網罩的紋理" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/formats/fbx.png"></td>
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
| STL | `.stl` | 檔案中儲存的顏色，沒有則用預設顏色 | 不支援 | 公釐（3D 列印的慣例），Z 軸朝上 | 支援二進位與文字格式 |
| PLY | `.ply` | 頂點顏色，沒有則用預設顏色 | 不支援 | 以公尺顯示 | 支援二進位與文字格式 |
| OBJ | `.obj` | 頂點顏色（不讀取 `.mtl`） | 不支援 | 以公尺顯示 | |
| FBX | `.fbx` | 僅支援內嵌紋理 | 支援 | 檔案中宣告的單位 | 二進位 FBX 7.0（2011）以上版本 |

以 Draco 或 Meshopt 壓縮的 glTF，以及 KTX2 / Basis Universal 紋理，同樣可以開啟。

## 功能

### 自由檢視

<table>
  <tr>
    <td width="50%"><img alt="按住滑鼠左鍵拖曳，相機會繞著 Bunny 旋轉" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/features/orbit.gif"></td>
    <td width="50%"><img alt="先以右鍵拖曳，再按住 Shift 以左鍵拖曳，畫面隨之左右平移" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/features/pan.gif"></td>
  </tr>
  <tr>
    <td align="center"><b>環繞</b>：拖曳</td>
    <td align="center"><b>平移</b>：右鍵拖曳，或 <kbd>Shift</kbd> + 拖曳</td>
  </tr>
  <tr>
    <td width="50%"><img alt="捲動滑鼠滾輪，把 Bunny 拉近再拉遠" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/features/zoom.gif"></td>
    <td width="50%"><img alt="畫面轉到上下顛倒後，按下重設按鈕回到初始視角" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/features/reset.gif"></td>
  </tr>
  <tr>
    <td align="center"><b>縮放</b>：捲動滾輪</td>
    <td align="center"><b>重設檢視</b>：工具列的第一個按鈕</td>
  </tr>
</table>

### 實際尺寸

畫面中有地面網格與 X / Y / Z 座標軸，並標示模型的寬 × 高 × 深，用錯單位製作的模型一看就知道。
例如 Stanford Bunny 寬 15.6 cm。

<img alt="10 mm 網格上的 Bunny；狀態列顯示 156 × 154 × 121 mm，後面接著「網格 10 mm」" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/features/size.gif" width="600">

### 線框、網格與座標軸

可以將模型顯示為線框，也可以隱藏地面網格與座標軸。狀態列會顯示頂點數與三角形數。

<img alt="按下線框按鈕後顯示 Bunny 的網格結構，再按下網格與座標軸按鈕隱藏地面網格" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/features/inspect.gif" width="600">

### 動畫

支援播放與暫停；模型有多個片段時，還可以選擇要播放的片段。

<img alt="狐狸正在播放 Survey 片段，從片段選單切換到 Run 後暫停，再繼續播放" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/features/animations.gif" width="600">

### 自動更新

檔案一儲存，畫面就會更新為新版本，相機位置維持不變。

<img alt="每次按 Ctrl + S 儲存檔案，Bunny 都會在原處換一種顏色" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/features/live.gif" width="600">

### 淺色與深色

檢視器預設使用淺色主題，點選工具列中的月亮按鈕即可在深色與淺色之間切換。你上次選擇的主題以及線框、網格設定都會保留下來，
重新啟動 Orca 後依然有效（需要 Orca 1.4.250 以上版本）。

<img alt="點選工具列中的月亮按鈕，檢視器切換成深色；再點選一次，又切回淺色" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/features/theme.gif" width="600">

### 支援十一種語言

檢視器的介面語言會與 Orca 保持一致，支援 English、日本語、Deutsch、Español、Français、한국어、Português、
Русский、Türkçe、简体中文與繁體中文。

### 一鍵複製詳情，方便回報 Issue

按下工具列中的 **i** 按鈕（發生錯誤時，則是錯誤訊息下方的 **詳情** 按鈕），就會開啟一份摘要，
內容包括檢視器版本、瀏覽器與顯示卡資訊、最近幾次載入的紀錄與耗時，以及發生過的錯誤。
按下 **複製** 並貼到 Issue 中，就能把問題交代清楚。除了錯誤訊息中引用的內容，摘要不含任何模型資料。

<img alt="詳情面板：列出檢視器版本、瀏覽器、載入紀錄，以及某個檔案遭拒絕開啟的原因，下方有複製與關閉按鈕" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/details.png" width="600">

## 安裝

1. 在 Orca 中開啟 **設定 → 外掛**，然後按下 **安裝外掛**。
2. 在 **Git URL** 分頁的 **帶 #ref 的存放庫 URL** 欄位中貼上：

   ```text
   https://github.com/momokun7/orca-3d-viewer#v1.0.2
   ```

3. 按下 **繼續**，再按下 **安裝**，然後在接著出現的對話框中按下 **啟用外掛**。啟用之前，外掛不會執行。
   檢視器不要求任何權限，因此不需要另外授權。

> [!IMPORTANT]
> 需要 Orca 桌面版 1.4.248 以上版本。

## 使用方式

開啟上述任一格式的檔案，就會以 3D 方式顯示。`.gltf` 和 `.obj` 是文字檔，可以在編輯器分頁上
切換 **原始碼**（文字）與 **3D** 兩種檢視。

| 操作 | 方式 |
| --- | --- |
| 環繞 | 拖曳 |
| 平移 | 右鍵拖曳、<kbd>Shift</kbd> + 拖曳，或按方向鍵 |
| 縮放 | 捲動滾輪 |
| 重設檢視 | 工具列的第一個按鈕 |
| 線框、網格與座標軸 | 旁邊的幾個按鈕 |
| 淺色與深色 | 月亮按鈕 |
| 詳情 | **i** 按鈕 |
| 動畫 | 播放按鈕與片段選單（僅在模型含有動畫時顯示） |

## 限制

> [!NOTE]
> Orca 外掛只能讀取目前開啟的檔案，讀不到同一資料夾中的其他檔案，因此存放在其他檔案中的資料無法顯示。
> 幾何資料存放在獨立 `.bin` 檔中的 `.gltf` 無法開啟；獨立圖片檔中的紋理與 OBJ 的 `.mtl` 也不會顯示。
> `.glb`、內嵌資料的 `.gltf`，以及內嵌紋理的 FBX 則能完整顯示。

- **僅支援桌面版**：在瀏覽器中使用 Orca 時，檔案會以原始碼形式開啟。
- **檔案上限 64 MiB**：這是 Orca 對自訂編輯器的限制。如果模型解碼後的資料量遠超過安全上限，或用到檢視器無法讀取的功能，
  檢視器會拒絕開啟，並說明原因。
- **不支援舊版或文字格式的 FBX**：請重新匯出為二進位 FBX 7.0 以上版本。

我們測試了 Khronos [glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets) 中全部 152 個 GLB
與內嵌資料的 glTF 模型：只有 3 個模型因為需要 three.js 尚未實作的擴充功能而無法開啟，其餘全部正常。

## 疑難排解

<details>
<summary>檔案以文字開啟，而不是 3D</summary>

`.gltf` 和 `.obj` 是文字檔，可能會以原始碼（文字）形式開啟。請在編輯器分頁上選擇 **3D**。
在瀏覽器中使用 Orca 時無法檢視 3D。

</details>

<details>
<summary>紋理或顏色沒有顯示</summary>

外掛無法讀取獨立圖片檔中的紋理，狀態列會列出讀取不到的檔案名稱。
glTF 請改用 `.glb`；FBX 請在匯出時內嵌紋理。OBJ 的 `.mtl` 無法讀取，
所以模型有頂點顏色時會以頂點顏色顯示，沒有則以預設顏色顯示。

</details>

<details>
<summary>尺寸看起來不對</summary>

STL 不儲存單位，因此以公釐顯示；PLY 與 OBJ 同樣不儲存單位，以公尺顯示。FBX 與 glTF 則使用檔案中宣告的單位。
如果尺寸差了 1000 倍或 100 倍，請檢查匯出模型時選擇的單位。

</details>

<details>
<summary>出現無法開啟模型的訊息</summary>

訊息中會說明原因。模型過大、檔案損毀，或用到檢視器不支援的功能，都會在開啟前遭到拒絕。
如果看不出原因，請將 **詳情** 複製到 Issue 中。

</details>

<details>
<summary>回報錯誤</summary>

請使用 [錯誤回報](https://github.com/momokun7/orca-3d-viewer/issues/new?template=bug_report.yml) 範本，
並貼上 **詳情** 中的文字。如果模型可以公開，請註明它的來源。安全性問題請不要開 Issue，而是透過
[私下回報](https://github.com/momokun7/orca-3d-viewer/security/advisories/new) 提交。

</details>

## 安全性

模型屬於不可信任的輸入，因此檢視器在設計上盡量不給攻擊者可乘之機。

- **隔離執行**：在 Orca 隔離的外掛框架中執行，受嚴格的 Content-Security-Policy 限制，無法存取網路。
- **不需權限**：外掛資訊清單（manifest）不要求任何能力，不使用 worker、不註冊命令，也不存取檔案。
- **唯讀**：絕不修改或儲存文件，模型中的 URI 也絕不會交給載入器處理。
- **先檢查再解碼**：每種格式在解碼前，都會先在獨立的執行緒中依大小上限進行檢查。FBX 的壓縮陣列會分成小段逐步解壓縮，
  一旦超過宣告的大小就立即停止。
- **完整測試**：CI 會在 Orca 的框架政策下，以惡意構造的模型與模糊測試產生的模型執行檢視器，並檢查存放庫中提交的打包檔案
  能否從原始碼完整重現。

詳情請參閱 [SECURITY.md](../../SECURITY.md)。

## 開發

外掛原始碼位於 `build/src`。`build/build.mjs` 會將其打包到 `editor/` 目錄。這個目錄也一併提交到存放庫，
因此 Orca 不需要建置就能直接載入外掛。

```sh
cd build
npm ci
npm test
npm run typecheck
npm run build
```

如果你使用 [mise](https://mise.jdx.dev)，`mise run check` 會執行 CI 中的所有檢查，`mise tasks` 則會列出其他任務。

若要在 Orca 中試用你的修改，請在存放庫根目錄執行 `orca plugin dev watch .`，或在
**設定 → 外掛 → 開發** 中加入該資料夾。

## 參與貢獻

關於 Issue、標籤、專案看板、里程碑與 PR 的說明，請參閱 [CONTRIBUTING.md](../../CONTRIBUTING.md)。
除了英文與日文以外，其他語言的譯文都是由機器起草，歡迎母語人士協助改進。

## 授權與出處

[MIT](../../LICENSE)。隨附的 three.js、meshoptimizer、fflate、Lucide（MIT / ISC）以及 Draco 解碼器
（Apache-2.0）各自沿用原本的授權條款，詳見 [THIRD_PARTY_NOTICES.txt](../../THIRD_PARTY_NOTICES.txt)。

圖片與 GIF、外掛圖示以及 Orca 外掛頁面圖片中使用的模型來源如下。所有副本的格式轉換、顏色（3DBenchy、Armadillo 與 Teapot 的顏色是我們寫入檔案的）
以及方向，皆經過我們修改。

| 模型 | 用於 | 來源 | 授權 |
| --- | --- | --- | --- |
| Stanford Bunny | 主視覺圖、功能示範 GIF、外掛圖示、外掛頁面 | [Stanford 3D Scanning Repository](https://graphics.stanford.edu/data/3Dscanrep/)。Source: Stanford University Computer Graphics Laboratory | 註明出處即可免費用於非商業用途 |
| Stanford Armadillo | PLY | 同上 | 同上 |
| A Beautiful Game | GLB、外掛頁面 | Khronos [glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets)。原始模型由 MaterialX Project 製作，Ed Mackey 轉換為 glTF | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Corset | glTF | Khronos glTF Sample Assets，Microsoft | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| BoomBox | FBX、外掛頁面 | Khronos glTF Sample Assets，Microsoft | CC0 1.0 |
| 3DBenchy | STL | [3DBenchy.com](https://www.3dbenchy.com/)，Creative Tools | CC0 1.0 |
| Utah Teapot | OBJ | [McGuire Computer Graphics Archive](https://casual-effects.com/data)，Martin Newell（1975），Kenzie Lamar | CC0 |
| Fox | 動畫 GIF、外掛頁面 | Khronos glTF Sample Assets。模型由 PixelMannen 製作（CC0 1.0），骨架綁定與動畫由 tomkranis 製作，@AsoboStudio 與 @scurest 轉換為 glTF | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
