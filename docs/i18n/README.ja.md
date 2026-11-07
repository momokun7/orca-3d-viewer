<div align="center">

[English](../../README.md) · **日本語** · [Deutsch](README.de.md) · [Español](README.es.md) ·
[Français](README.fr.md) · [한국어](README.ko.md) · [Português](README.pt-BR.md) ·
[Русский](README.ru.md) · [Türkçe](README.tr.md) · [简体中文](README.zh-Hans.md) ·
[繁體中文](README.zh-Hant.md)

# 3D Viewer for Orca

**エディターを離れずに、3D モデルを見る。**

[Orca](https://github.com/stablyai/orca) の中で、GLB・glTF・STL・PLY・OBJ・FBX を開ける読み取り専用のビューアーです。
モデルを回して眺め、アニメーションを再生し、思ったとおりの大きさかをひと目で確かめられます。

[![CI](https://github.com/momokun7/orca-3d-viewer/actions/workflows/ci.yml/badge.svg)](https://github.com/momokun7/orca-3d-viewer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)
[![Orca](https://img.shields.io/badge/Orca-%E2%89%A5%201.4.248-black.svg)](https://github.com/stablyai/orca)
[![Permissions](https://img.shields.io/badge/permissions-none-brightgreen.svg)](#安全性)

[すぐに使う](#すぐに使う) · [対応形式](#対応形式) · [機能](#機能) · [インストール](#インストール) · [使い方](#使い方) ·
[困ったとき](#困ったとき) · [安全性](#安全性) · [開発](#開発) ·
[バグを報告](https://github.com/momokun7/orca-3d-viewer/issues/new?template=bug_report.yml)

<img alt="Orca の中の 3D Viewer で、床のグリッドの上に座るスタンフォードバニー。下の欄に 156 × 154 × 121 mm と大きさが表示されている" src="../images/hero.png" width="800">

</div>

## すぐに使う

1. Orca で **設定 → プラグイン → プラグインをインストール** を開き、**Git URL** のタブの **リポジトリ URL** に `https://github.com/momokun7/orca-3d-viewer#v1.0.0` を貼り付けて、**インストール** を押す。続けて出る確認で **プラグインを有効にする** を押す。
2. `.glb`・`.gltf`・`.stl`・`.ply`・`.obj`・`.fbx` のどれかを開く。
3. ドラッグで回し、ホイールで近づく。

権限は何も求めません。詳しくは [インストール](#インストール) と [使い方](#使い方) を見てください。

## 対応形式

ひとつのビューアーで、6 つの形式を開けます。

<table>
  <tr>
    <td width="33%"><img alt="GLB の A Beautiful Game。大理石の盤と、ガラスや金属の質感のチェスの駒" src="../images/formats/glb.png"></td>
    <td width="33%"><img alt="データを埋め込んだ glTF の Corset。刺繍の布と金具の模様つき" src="../images/formats/gltf.png"></td>
    <td width="33%"><img alt="STL の 3DBenchy。3D プリンターの試し出力によく使われる小さな船。ファイルに書き込んだオレンジ色で表示" src="../images/formats/stl.png"></td>
  </tr>
  <tr>
    <td align="center"><b>GLB</b>: A Beautiful Game</td>
    <td align="center"><b>glTF</b>: Corset</td>
    <td align="center"><b>STL</b>: 3DBenchy</td>
  </tr>
  <tr>
    <td width="33%"><img alt="PLY のスタンフォードアルマジロ。3D スキャンのデータ。頂点に書き込んだ緑色で表示" src="../images/formats/ply.png"></td>
    <td width="33%"><img alt="OBJ のユタのティーポット。頂点に書き込んだ紫色で表示" src="../images/formats/obj.png"></td>
    <td width="33%"><img alt="FBX の BoomBox。ボタンやスピーカーの網目の模様つき" src="../images/formats/fbx.png"></td>
  </tr>
  <tr>
    <td align="center"><b>PLY</b>: Stanford Armadillo</td>
    <td align="center"><b>OBJ</b>: Utah Teapot</td>
    <td align="center"><b>FBX</b>: BoomBox</td>
  </tr>
</table>

| 形式 | 拡張子 | 色と模様(テクスチャ) | アニメーション | 大きさの単位 | 注意 |
| --- | --- | --- | --- | --- | --- |
| glTF 2.0 | `.glb` `.gltf` | あり | あり | メートル(glTF の決まり) | `.gltf` は、データを埋め込んだものだけ |
| STL | `.stl` | ファイルに書かれた色(ない場合は標準の色) | なし | ミリメートル(3D プリントの慣習)、Z 軸が上 | バイナリとテキストの両方 |
| PLY | `.ply` | 頂点の色(ない場合は標準の色) | なし | メートルとみなして表示 | バイナリとテキストの両方 |
| OBJ | `.obj` | 頂点の色(`.mtl` は読めない) | なし | メートルとみなして表示 | |
| FBX | `.fbx` | 埋め込んだ模様だけ | あり | ファイルに書かれた単位 | バイナリの FBX 7.0(2011 年)以降 |

Draco や Meshopt で圧縮した glTF も開けます。KTX2 / Basis Universal 形式の模様も表示できます。

## 機能

### 見回す

<table>
  <tr>
    <td width="50%"><img alt="左ボタンでドラッグすると、バニーのまわりをカメラが回る" src="../images/features/orbit.gif"></td>
    <td width="50%"><img alt="右ドラッグ、続けて Shift を押しながらの左ドラッグで、視点が横にずれる" src="../images/features/pan.gif"></td>
  </tr>
  <tr>
    <td align="center"><b>回す</b>: ドラッグ</td>
    <td align="center"><b>横にずらす</b>: 右ドラッグ、または <kbd>Shift</kbd> + ドラッグ</td>
  </tr>
  <tr>
    <td width="50%"><img alt="マウスのホイールで、バニーに近づいてまた離れる" src="../images/features/zoom.gif"></td>
    <td width="50%"><img alt="逆さまになった視点が、リセットのボタンで最初の向きに戻る" src="../images/features/reset.gif"></td>
  </tr>
  <tr>
    <td align="center"><b>近づく</b>: ホイール</td>
    <td align="center"><b>視点をリセット</b>: ツールバーの左端のボタン</td>
  </tr>
</table>

### 実際の大きさ

床のグリッドと X・Y・Z の軸、モデルの幅 × 高さ × 奥行きを表示するので、単位を間違えて作ったモデルにすぐ気づけます。
たとえば画像のスタンフォードバニーは、幅 15.6 cm です。

<img alt="10 mm のグリッドの上のバニー。下の欄に 156 × 154 × 121 mm、グリッド 10 mm と表示される" src="../images/features/size.gif" width="600">

### ワイヤーフレーム、グリッドと軸

モデルを線の網目だけで表示したり、グリッドと軸を隠したりできます。頂点と三角形の数は、下の欄に表示されます。

<img alt="ワイヤーフレームのボタンでバニーの網目が見え、グリッドと軸のボタンで床のグリッドが消える" src="../images/features/inspect.gif" width="600">

### アニメーション

アニメーションを再生・一時停止できます。アニメーションが複数あるモデルでは、一覧から選べます。

<img alt="キツネが Survey のアニメーションを再生し、一覧から Run に切り替え、一時停止してまた再生する" src="../images/features/animations.gif" width="600">

### 保存するとすぐ反映

ファイルを保存すると、カメラの位置はそのままで、新しい内容に切り替わります。

<img alt="Ctrl + S で保存するたびに、バニーの色がその場で変わる" src="../images/features/live.gif" width="600">

### ライトとダーク

最初はライトで表示されます。ツールバーの月のボタンで、ダークとライトを切り替えられます。テーマ・ワイヤーフレーム・グリッドの状態は、最後に選んだものを覚えていて、Orca を再起動しても引き継がれます(Orca 1.4.250 以降)。

<img alt="ツールバーの月のボタンを押すとダークになり、もう一度押すとライトに戻る" src="../images/features/theme.gif" width="600">

### 11 の言語

画面の文字は、Orca の言語の設定に合わせて切り替わります。English、日本語、Deutsch、Español、Français、한국어、Português、Русский、Türkçe、简体中文、繁體中文 に対応しています。

### Issue に貼れる「詳細」

ツールバーの **i** のボタン(エラーの画面では、案内の下の **詳細** のボタン)を押すと、ビューアーのバージョン、ブラウザとグラフィックスの情報、最近の読み込みとかかった時間、発生したエラーがまとめて表示されます。**コピー**して Issue に貼れば、何が起きたかが伝わります。モデルのデータは含みません(エラーの文に引用された部分を除く)。

<img alt="詳細の欄。ビューアーのバージョン、ブラウザ、読み込みの記録、開かなかった理由が並び、コピーと閉じるのボタンがある" src="../images/details.png" width="600">

## インストール

1. Orca で **設定 → プラグイン** を開き、**プラグインをインストール** を押す。
2. **Git URL** のタブを選び、**リポジトリ URL** に次を貼り付ける。

   ```text
   https://github.com/momokun7/orca-3d-viewer#v1.0.0
   ```

3. **インストール** を押し、続けて出る確認で **プラグインを有効にする** を押す。このプラグインは権限を何も求めません。

> [!IMPORTANT]
> Orca のデスクトップ版(1.4.248 以降)が必要です。

## 使い方

対応する形式のファイルを開くと、3D で表示されます。`.gltf` と `.obj` は文字のファイルなので、エディターのタブで **ソース**(中身の文字)と **3D** を切り替えられます。

| すること | やり方 |
| --- | --- |
| 回す | ドラッグ |
| 横にずらす | 右ドラッグ、<kbd>Shift</kbd> + ドラッグ、または矢印キー |
| 近づく・離れる | ホイール |
| 視点をリセット | ツールバーの左端のボタン |
| ワイヤーフレーム、グリッドと軸 | その隣の 2 つのボタン |
| ライトとダーク | 月のボタン |
| 詳細 | **i** のボタン |
| アニメーション | 再生のボタンと一覧(アニメーションがあるモデルだけ) |

## できないこと

> [!NOTE]
> Orca のプラグインが読めるのは、開いたファイルだけです。同じフォルダーにあるほかのファイルは読めないため、別のファイルに分かれたデータは表示できません。たとえば、形状を別の `.bin` に入れた `.gltf` は開けず、別の画像ファイルの模様や OBJ の `.mtl` も表示されません。`.glb`、データを埋め込んだ `.gltf`、模様を埋め込んだ FBX なら、すべて表示されます。

- **デスクトップ版だけ**: ブラウザで動く Orca では、ファイルは **ソース** で開きます。
- **64 MiB まで**: Orca のカスタムエディター(プラグインが用意する表示画面)で開ける大きさの上限です。展開すると安全に扱える量を大きく超えるモデルや、ビューアーが読めない仕組みを使ったモデルは、理由を表示して開きません。
- **古い FBX とテキストの FBX は読めません**: バイナリの FBX 7.0 以降で書き出し直してください。

Khronos の [glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets) にある GLB とデータを埋め込んだ glTF、全 152 個を試しました。開けなかったのは、three.js が対応していない拡張機能を使う 3 個だけです。

## 困ったとき

<details>
<summary>3D ではなく文字で開く</summary>

`.gltf` と `.obj` は文字のファイルなので、**ソース**(中身の文字)で開くことがあります。エディターのタブで **3D** を選んでください。ブラウザで動く Orca では、3D は使えません。

</details>

<details>
<summary>模様や色が出ない</summary>

模様(テクスチャ)が別の画像ファイルに分かれていると、プラグインからは読めません。画面の下の欄に、読めなかったファイルの名前が表示されます。glTF は `.glb` で、FBX は模様を埋め込んで書き出し直すと表示されます。OBJ の `.mtl` は読めないので、頂点に色があればその色、なければ標準の色で表示します。

</details>

<details>
<summary>大きさがおかしい</summary>

STL はミリメートル、PLY と OBJ はメートルとみなして表示します(どれも、ファイルに単位を書かない形式です)。FBX と glTF は、ファイルに書かれた単位を使います。思った大きさから 1000 倍や 100 倍ずれているときは、書き出したときの単位を確かめてください。

</details>

<details>
<summary>「表示できません」「開きませんでした」と出る</summary>

案内の文に理由が書いてあります。大きすぎるモデル、壊れたファイル、対応していない仕組みを使ったモデルは、開く前に止めます。理由が分からないときは、**詳細** をコピーして Issue に貼ってください。

</details>

<details>
<summary>バグを報告したい</summary>

[バグ報告](https://github.com/momokun7/orca-3d-viewer/issues/new?template=bug_report.yml) のテンプレートで、**詳細** の文を貼ってください。モデルを添えられる場合は、出どころも書いてもらえると助かります。安全に関わる問題は、Issue ではなく [非公開の報告](https://github.com/momokun7/orca-3d-viewer/security/advisories/new) でお願いします。

</details>

## 安全性

開くモデルは、誰が作ったか分からないファイルとして扱う必要があります。そのためこのビューアーは、悪意のあるファイルを開いても、つけ入る隙がほとんどないように作っています。

- **隔離された枠で動く**: Orca がプラグイン用に用意した隔離された枠の中で動きます。読み込めるものを厳しく絞る決まり(コンテンツセキュリティポリシー)のもとで、ネットワークにもつながりません。
- **権限ゼロ**: マニフェストは何の権限も求めません。ワーカーも、コマンドも、ファイルへのアクセスもありません。
- **読むだけ**: 文書を書き換えたり保存したりしません。モデルの中に書かれた URI(ほかのファイルやサイトの場所)も読みに行きません。
- **開く前に確かめる**: どの形式も、展開する前に別のスレッドで大きさを確かめます。FBX の圧縮データは、少しずつ展開しながら大きさを数え、ファイルに書かれた大きさを超えた時点で止めます。
- **テストで守る**: CI で、Orca の枠と同じ決まりのもと、悪意のあるモデルや壊したモデルを読ませています。コミットしたビルド結果がソースから作り直せることも確かめています。

詳しくは [SECURITY.md](../../SECURITY.md) を見てください。

## 開発

プラグインのコードは `build/src` にあります。`build/build.mjs` がそれを `editor/` にまとめます。`editor/` もコミットしているので、Orca はビルドなしでプラグインを読めます。

```sh
cd build
npm ci
npm test
npm run typecheck
npm run build
```

[mise](https://mise.jdx.dev) を使うなら、`mise run check` で CI と同じ検査をまとめて実行できます。ほかの作業は `mise tasks` で一覧できます。

Orca で試すには、リポジトリの最上位のフォルダーで `orca plugin dev watch .` を実行します。または、**設定 → プラグイン** の **開発** の欄で **パスを追加** を押し、このフォルダーを加えます。

## 参加する

Issue・ラベル・プロジェクトボード・マイルストーン・PR の決まりは [CONTRIBUTING.md](../../CONTRIBUTING.md) にまとめています。英語と日本語以外の翻訳は、機械で下書きしたものです。その言語を母語とする方からの直しを、とても歓迎します。

## ライセンスと出典

[MIT](../../LICENSE)。同梱している three.js、meshoptimizer、fflate、Lucide(MIT / ISC)と Draco のデコーダー(Apache-2.0)は、それぞれのライセンスに従います。[THIRD_PARTY_NOTICES.txt](../../THIRD_PARTY_NOTICES.txt) を見てください。

画像と GIF に使ったモデルは、次のところからお借りしています。どのモデルも、形式の変換・色付け(3DBenchy・アルマジロ・ティーポットの色は、私たちがファイルに書き込んだもの)・向きの調整は、私たちが行いました。

| モデル | 使った場所 | 出典 | ライセンス |
| --- | --- | --- | --- |
| Stanford Bunny | 一番上の画像、機能の GIF | [Stanford 3D Scanning Repository](https://graphics.stanford.edu/data/3Dscanrep/)。Source: Stanford University Computer Graphics Laboratory | 出典を書いて、商用以外で使える |
| Stanford Armadillo | PLY | 同上 | 同上 |
| A Beautiful Game | GLB | Khronos [glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets)。元のモデルは MaterialX Project、glTF への変換は Ed Mackey | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Corset | glTF | Khronos glTF Sample Assets、Microsoft | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| BoomBox | FBX | Khronos glTF Sample Assets、Microsoft | CC0 1.0 |
| 3DBenchy | STL | [3DBenchy.com](https://www.3dbenchy.com/)、Creative Tools | CC0 1.0 |
| Utah Teapot | OBJ | [McGuire Computer Graphics Archive](https://casual-effects.com/data)、Martin Newell(1975)、Kenzie Lamar | CC0 |
| Fox | アニメーションの GIF | Khronos glTF Sample Assets。モデルは PixelMannen(CC0 1.0)、骨組みと動きは tomkranis、glTF への変換は @AsoboStudio と @scurest | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
