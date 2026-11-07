<div align="center">

[English](../../README.md) · [日本語](README.ja.md) · [Deutsch](README.de.md) · [Español](README.es.md) ·
[Français](README.fr.md) · **한국어** · [Português](README.pt-BR.md) ·
[Русский](README.ru.md) · [Türkçe](README.tr.md) · [简体中文](README.zh-Hans.md) ·
[繁體中文](README.zh-Hant.md)

# 3D Viewer for Orca

**편집기를 떠나지 않고 3D 모델을 확인하세요.**

[Orca](https://github.com/stablyai/orca)에서 GLB, glTF, STL, PLY, OBJ, FBX를 여는 읽기 전용 뷰어입니다.
모델을 돌려 보고, 애니메이션을 재생하고, 모델이 생각한 크기인지 한눈에 확인할 수 있습니다.

[![CI](https://github.com/momokun7/orca-3d-viewer/actions/workflows/ci.yml/badge.svg)](https://github.com/momokun7/orca-3d-viewer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)
[![Orca](https://img.shields.io/badge/Orca-%E2%89%A5%201.4.248-black.svg)](https://github.com/stablyai/orca)
[![Permissions](https://img.shields.io/badge/permissions-none-brightgreen.svg)](#보안)

[지원 형식](#지원-형식) · [기능](#기능) · [설치](#설치) · [사용법](#사용법) ·
[문제 해결](#문제-해결) · [보안](#보안) · [개발](#개발) ·
[버그 신고](https://github.com/momokun7/orca-3d-viewer/issues/new?template=bug_report.yml)

<img alt="Orca 안의 3D Viewer에서 바닥 그리드 위에 앉아 있는 Stanford Bunny. 상태 표시줄에 크기 156 × 154 × 121 mm가 표시되어 있습니다" src="../images/hero.png" width="800">

</div>

## 지원 형식

하나의 뷰어로 여섯 가지 형식을 엽니다.

<table>
  <tr>
    <td width="33%"><img alt="GLB 형식의 A Beautiful Game. 대리석 체스판과 유리, 금속 질감의 체스 말" src="../images/formats/glb.png"></td>
    <td width="33%"><img alt="데이터가 포함된 glTF 형식의 Corset. 자수가 놓인 천과 버클" src="../images/formats/gltf.png"></td>
    <td width="33%"><img alt="STL 형식의 3DBenchy. 3D 프린터 테스트에 쓰이는 작은 배를 파일에 저장된 주황색으로 표시" src="../images/formats/stl.png"></td>
  </tr>
  <tr>
    <td align="center"><b>GLB</b>: A Beautiful Game</td>
    <td align="center"><b>glTF</b>: Corset</td>
    <td align="center"><b>STL</b>: 3DBenchy</td>
  </tr>
  <tr>
    <td width="33%"><img alt="PLY 형식의 Stanford Armadillo. 3D 스캔 데이터를 정점에 저장된 초록색으로 표시" src="../images/formats/ply.png"></td>
    <td width="33%"><img alt="OBJ 형식의 Utah Teapot을 정점에 저장된 보라색으로 표시" src="../images/formats/obj.png"></td>
    <td width="33%"><img alt="FBX 형식의 BoomBox. 버튼과 스피커 그릴의 텍스처 포함" src="../images/formats/fbx.png"></td>
  </tr>
  <tr>
    <td align="center"><b>PLY</b>: Stanford Armadillo</td>
    <td align="center"><b>OBJ</b>: Utah Teapot</td>
    <td align="center"><b>FBX</b>: BoomBox</td>
  </tr>
</table>

| 형식 | 확장자 | 색상과 텍스처 | 애니메이션 | 크기 단위 | 참고 |
| --- | --- | --- | --- | --- | --- |
| glTF 2.0 | `.glb` `.gltf` | 지원 | 지원 | 미터(glTF 규격) | `.gltf`는 데이터가 포함된 파일만 |
| STL | `.stl` | 파일에 저장된 색상, 없으면 기본 색상 | 미지원 | 밀리미터(3D 프린팅 관례), Z축이 위 | 바이너리와 텍스트 |
| PLY | `.ply` | 정점 색상, 없으면 기본 색상 | 미지원 | 미터로 표시 | 바이너리와 텍스트 |
| OBJ | `.obj` | 정점 색상(`.mtl`은 읽을 수 없음) | 미지원 | 미터로 표시 | |
| FBX | `.fbx` | 포함된 텍스처만 | 지원 | 파일에 명시된 단위 | 바이너리 FBX 7.0(2011) 이상 |

Draco 또는 Meshopt로 압축한 glTF와 KTX2 / Basis Universal 텍스처도 열 수 있습니다.

## 기능

### 둘러보기

<table>
  <tr>
    <td width="50%"><img alt="마우스 왼쪽 버튼으로 드래그하면 카메라가 Bunny 주위를 회전합니다" src="../images/features/orbit.gif"></td>
    <td width="50%"><img alt="오른쪽 드래그에 이어 Shift를 누른 채 왼쪽 드래그하면 화면이 옆으로 이동합니다" src="../images/features/pan.gif"></td>
  </tr>
  <tr>
    <td align="center"><b>회전</b>: 드래그</td>
    <td align="center"><b>이동</b>: 오른쪽 드래그 또는 <kbd>Shift</kbd> + 드래그</td>
  </tr>
  <tr>
    <td width="50%"><img alt="마우스 휠을 굴리면 Bunny를 확대했다가 다시 축소합니다" src="../images/features/zoom.gif"></td>
    <td width="50%"><img alt="거꾸로 뒤집힌 화면이 초기화 버튼으로 처음 보기로 돌아갑니다" src="../images/features/reset.gif"></td>
  </tr>
  <tr>
    <td align="center"><b>확대/축소</b>: 스크롤</td>
    <td align="center"><b>보기 초기화</b>: 도구 모음의 첫 번째 버튼</td>
  </tr>
</table>

### 실제 크기

바닥 그리드, X / Y / Z 축, 모델의 너비 × 높이 × 깊이를 표시하므로 잘못된 단위로 만든 모델을 바로 알아챌 수 있습니다.
Stanford Bunny의 너비는 15.6 cm입니다.

<img alt="10 mm 그리드 위의 Bunny. 상태 표시줄에 156 × 154 × 121 mm, 이어서 그리드 10 mm가 표시됩니다" src="../images/features/size.gif" width="600">

### 와이어프레임, 그리드 및 축

메시를 선으로만 보거나 그리드와 축을 숨길 수 있습니다. 정점 수와 삼각형 수는 상태 표시줄에 표시됩니다.

<img alt="와이어프레임 버튼으로 Bunny의 메시가 보이고, 이어서 그리드 및 축 버튼으로 바닥 그리드가 사라집니다" src="../images/features/inspect.gif" width="600">

### 애니메이션

재생과 일시 중지를 할 수 있고, 모델에 클립이 여러 개 있으면 클립을 고를 수 있습니다.

<img alt="여우가 Survey 클립을 재생하다가 클립 메뉴에서 Run으로 바꾸고, 일시 중지한 뒤 다시 재생합니다" src="../images/features/animations.gif" width="600">

### 항상 최신 상태

파일을 저장하면 카메라 위치는 그대로 둔 채 새 내용이 표시됩니다.

<img alt="Ctrl + S로 파일을 저장할 때마다 Bunny의 색이 그 자리에서 바뀝니다" src="../images/features/live.gif" width="600">

### 라이트 또는 다크

뷰어는 라이트 테마로 열리며, 도구 모음의 달 버튼으로 다크 테마와 라이트 테마를 전환합니다. 마지막으로 선택한 테마,
와이어프레임, 그리드 설정은 Orca를 다시 시작해도 유지됩니다(Orca 1.4.250 이상).

<img alt="도구 모음의 달 버튼을 클릭하면 뷰어가 다크 테마로 바뀌고, 다시 클릭하면 라이트 테마로 돌아갑니다" src="../images/features/theme.gif" width="600">

### 11개 언어

뷰어의 텍스트는 Orca의 언어를 따릅니다. English, 日本語, Deutsch, Español, Français, 한국어, Português,
Русский, Türkçe, 简体中文, 繁體中文을 지원합니다.

### 이슈에 붙여 넣을 세부 정보

도구 모음의 **i** 버튼(오류 화면에서는 메시지 아래의 **세부 정보** 버튼)을 누르면 요약이 열립니다.
뷰어 버전, 브라우저와 그래픽 정보, 최근 로드 기록과 걸린 시간, 발생한 오류가 들어 있습니다.
**복사**해서 이슈에 붙여 넣으면 무슨 일이 있었는지 전달됩니다. 모델 데이터는 포함되지 않습니다.

<img alt="세부 정보 패널. 뷰어 버전, 브라우저, 로드 기록, 파일을 거부한 이유가 표시되고 복사 및 닫기 버튼이 있습니다" src="../images/details.png" width="600">

## 설치

1. Orca에서 **설정 → 플러그인**을 열고 **플러그인 설치**를 선택합니다.
2. **Git URL** 탭에 다음을 입력합니다.

   ```text
   https://github.com/momokun7/orca-3d-viewer#v1.0.0
   ```

3. **설치**를 선택합니다. 뷰어는 권한을 요청하지 않으므로 따로 허용할 것이 없습니다.

> [!IMPORTANT]
> Orca 데스크톱 앱 1.4.248 이상이 필요합니다.

## 사용법

지원하는 형식의 파일을 열면 3D로 표시됩니다. `.gltf`와 `.obj`는 텍스트 파일이므로 편집기 탭에서
**소스**(텍스트)와 **3D**를 전환할 수 있습니다.

| 작업 | 방법 |
| --- | --- |
| 회전 | 드래그 |
| 이동 | 오른쪽 드래그, <kbd>Shift</kbd> + 드래그 또는 화살표 키 |
| 확대/축소 | 스크롤 |
| 보기 초기화 | 도구 모음의 첫 번째 버튼 |
| 와이어프레임, 그리드 및 축 | 그 옆의 버튼 |
| 라이트 또는 다크 | 달 버튼 |
| 세부 정보 | **i** 버튼 |
| 애니메이션 | 재생 버튼과 클립 메뉴(모델에 애니메이션이 있을 때) |

## 제한 사항

> [!NOTE]
> Orca 플러그인은 열린 파일만 읽을 수 있고 같은 폴더의 다른 파일은 읽을 수 없으므로, 별도 파일에 있는 데이터는
> 표시할 수 없습니다. 지오메트리가 별도 `.bin`에 있는 `.gltf`는 열리지 않으며, 별도 이미지 파일의 텍스처와
> OBJ의 `.mtl`은 표시되지 않습니다. `.glb`, 데이터가 포함된 `.gltf`, 텍스처가 포함된 FBX는 모두 표시됩니다.

- **데스크톱 앱 전용**: 브라우저에서 실행하는 Orca에서는 파일이 소스로 열립니다.
- **최대 64 MiB**: Orca의 사용자 지정 편집기 한도입니다. 디코딩하면 안전하게 다룰 수 있는 양을 크게 넘는 모델이나
  뷰어가 읽을 수 없는 기능을 사용하는 모델은 이유를 알려 주는 메시지와 함께 거부됩니다.
- **오래된 FBX와 텍스트 FBX는 미지원**: 바이너리 FBX 7.0 이상으로 다시 내보내세요.

Khronos [glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets)에 있는 GLB와 데이터가 포함된
glTF 모델 152개를 모두 확인했습니다. three.js가 구현하지 않은 확장이 필요한 3개를 제외하고 모두 열립니다.

## 문제 해결

<details>
<summary>파일이 3D가 아닌 텍스트로 열립니다</summary>

`.gltf`와 `.obj`는 텍스트 파일이므로 소스(텍스트)로 열릴 수 있습니다. 편집기 탭에서 **3D**를 선택하세요.
브라우저에서 실행하는 Orca에서는 3D를 사용할 수 없습니다.

</details>

<details>
<summary>텍스처나 색상이 보이지 않습니다</summary>

별도 이미지 파일의 텍스처는 플러그인이 읽을 수 없습니다. 읽지 못한 파일의 이름은 상태 표시줄에 표시됩니다.
glTF는 `.glb`를 사용하고, FBX는 텍스처를 포함해서 내보내세요. OBJ의 `.mtl`은 읽을 수 없으므로 정점 색상이 있으면
그 색상으로, 없으면 기본 색상으로 표시됩니다.

</details>

<details>
<summary>크기가 이상합니다</summary>

STL은 밀리미터로, PLY와 OBJ는 미터로 표시합니다. 이 형식들은 단위를 저장하지 않기 때문입니다. FBX와 glTF는
파일에 명시된 단위를 사용합니다. 크기가 1000배나 100배 차이 나면 모델을 내보낼 때의 단위를 확인하세요.

</details>

<details>
<summary>모델을 열 수 없다는 메시지가 나옵니다</summary>

메시지에 이유가 나와 있습니다. 너무 큰 모델, 손상된 파일, 뷰어가 지원하지 않는 기능은 열기 전에 거부됩니다.
이유가 분명하지 않으면 **세부 정보**를 복사해서 이슈에 붙여 넣으세요.

</details>

<details>
<summary>버그 신고하기</summary>

[버그 신고](https://github.com/momokun7/orca-3d-viewer/issues/new?template=bug_report.yml) 템플릿을 사용하고
**세부 정보** 텍스트를 붙여 넣으세요. 모델을 공유할 수 있다면 출처도 알려 주세요. 보안 문제는 이슈가 아니라
[비공개 신고](https://github.com/momokun7/orca-3d-viewer/security/advisories/new)로 알려 주세요.

</details>

## 보안

모델은 신뢰할 수 없는 입력이므로, 이 뷰어는 공격할 거리가 없도록 만들어졌습니다.

- **격리**: Orca의 격리된 플러그인 프레임 안에서 엄격한 Content-Security-Policy 아래, 네트워크 없이 실행됩니다.
- **권한 없음**: 매니페스트는 어떤 기능도 요청하지 않습니다. 워커도, 명령도, 파일 접근도 없습니다.
- **읽기 전용**: 문서를 편집하거나 저장하지 않으며, 모델 안의 URI는 로더에 전달되지 않습니다.
- **먼저 검사**: 모든 형식은 디코딩하기 전에 별도 스레드에서 크기 한도를 검사합니다. FBX의 압축 배열은 조금씩
  풀면서, 선언된 크기를 넘는 순간 중지합니다.
- **테스트**: CI는 Orca의 프레임 정책 아래에서 악의적인 모델과 퍼징한 모델로 뷰어를 실행하고, 커밋된 번들을
  소스에서 똑같이 다시 만들 수 있는지 확인합니다.

자세한 내용은 [SECURITY.md](../../SECURITY.md)를 참고하세요.

## 개발

플러그인 코드는 `build/src`에 있습니다. `build/build.mjs`가 이를 `editor/`로 번들링하며, Orca가 빌드 단계 없이
플러그인을 로드할 수 있도록 `editor/`도 커밋되어 있습니다.

```sh
cd build
npm ci
npm test
npm run typecheck
npm run build
```

[mise](https://mise.jdx.dev)를 사용하면 `mise run check`로 CI가 실행하는 모든 검사를 실행할 수 있고, `mise tasks`로
나머지 작업 목록을 볼 수 있습니다.

Orca에서 변경 사항을 시험하려면 저장소 루트에서 `orca plugin dev watch .`를 실행하거나,
**설정 → 플러그인 → 개발**에 이 폴더를 추가하세요.

## 기여하기

이슈, 레이블, 프로젝트 보드, 마일스톤, 풀 리퀘스트에 대한 안내는 [CONTRIBUTING.md](../../CONTRIBUTING.md)에 있습니다.
영어와 일본어 이외의 번역은 기계로 초안을 작성했습니다. 원어민의 수정을 언제나 환영합니다.

## 라이선스 및 출처

[MIT](../../LICENSE). 번들에 포함된 three.js, meshoptimizer, fflate, Lucide(MIT / ISC)와 Draco 디코더
(Apache-2.0)는 각자의 라이선스를 따릅니다. [THIRD_PARTY_NOTICES.txt](../../THIRD_PARTY_NOTICES.txt)를 참고하세요.

이미지와 GIF에 나오는 모델의 출처는 아래와 같습니다. 모든 사본에서 형식 변환, 색상(3DBenchy, Armadillo, Teapot의
색상은 저희가 파일에 기록한 것입니다), 방향은 저희가 수정한 것입니다.

| 모델 | 사용한 곳 | 출처 | 라이선스 |
| --- | --- | --- | --- |
| Stanford Bunny | 대표 이미지, 기능 GIF | [Stanford 3D Scanning Repository](https://graphics.stanford.edu/data/3Dscanrep/). Source: Stanford University Computer Graphics Laboratory | 출처 표기 시 비상업적 용도로 무료 사용 가능 |
| Stanford Armadillo | PLY | 위와 같음 | 위와 같음 |
| A Beautiful Game | GLB | Khronos [glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets). 원본 모델은 MaterialX Project, glTF 변환은 Ed Mackey | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Corset | glTF | Khronos glTF Sample Assets, Microsoft | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| BoomBox | FBX | Khronos glTF Sample Assets, Microsoft | CC0 1.0 |
| 3DBenchy | STL | [3DBenchy.com](https://www.3dbenchy.com/), Creative Tools | CC0 1.0 |
| Utah Teapot | OBJ | [McGuire Computer Graphics Archive](https://casual-effects.com/data), Martin Newell(1975), Kenzie Lamar | CC0 |
| Fox | 애니메이션 GIF | Khronos glTF Sample Assets. 모델은 PixelMannen(CC0 1.0), 리깅과 애니메이션은 tomkranis, glTF 변환은 @AsoboStudio와 @scurest | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
