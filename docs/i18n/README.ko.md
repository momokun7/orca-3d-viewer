<div align="center">

[English](../../README.md) · [日本語](README.ja.md) · [Deutsch](README.de.md) · [Español](README.es.md) ·
[Français](README.fr.md) · **한국어** · [Português](README.pt-BR.md) ·
[Русский](README.ru.md) · [Türkçe](README.tr.md) · [简体中文](README.zh-Hans.md) ·
[繁體中文](README.zh-Hant.md)

# 3D Viewer for Orca

**편집기를 떠나지 않고 3D 모델을 확인하세요.**

[Orca](https://github.com/stablyai/orca)에서 GLB, glTF, STL, PLY, OBJ, FBX 파일을 바로 열어 볼 수 있는 읽기 전용 뷰어입니다.
모델을 이리저리 돌려 보고, 애니메이션을 재생하고, 크기가 예상과 맞는지도 한눈에 확인할 수 있습니다.

[![CI](https://github.com/momokun7/orca-3d-viewer/actions/workflows/ci.yml/badge.svg)](https://github.com/momokun7/orca-3d-viewer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)
[![Orca](https://img.shields.io/badge/Orca-%E2%89%A5%201.4.248-black.svg)](https://github.com/stablyai/orca)
[![Permissions](https://img.shields.io/badge/permissions-none-brightgreen.svg)](#보안)

[빠른 시작](#빠른-시작) · [지원 형식](#지원-형식) · [기능](#기능) · [설치](#설치) · [사용법](#사용법) ·
[문제 해결](#문제-해결) · [보안](#보안) · [개발](#개발) ·
[버그 신고](https://github.com/momokun7/orca-3d-viewer/issues/new?template=bug_report.yml)

<img alt="Orca에서 연 3D Viewer. 바닥 그리드 위에 Stanford Bunny가 앉아 있고, 상태 표시줄에 크기 156 × 154 × 121 mm가 나와 있습니다" src="../images/hero.png" width="800">

</div>

## 빠른 시작

1. Orca에서 **설정 → 플러그인 → 플러그인 설치**를 열고, **Git URL** 탭에 `https://github.com/momokun7/orca-3d-viewer#v1.0.0`을 입력한 다음 **설치**를 선택합니다.
2. `.glb`, `.gltf`, `.stl`, `.ply`, `.obj`, `.fbx` 파일을 엽니다.
3. 드래그하면 회전하고, 스크롤하면 확대/축소됩니다.

별도의 권한은 요청하지 않습니다. 자세한 내용은 [설치](#설치)와 [사용법](#사용법)을 참고하세요.

## 지원 형식

뷰어 하나로 여섯 가지 형식을 모두 열 수 있습니다.

<table>
  <tr>
    <td width="33%"><img alt="GLB 형식의 A Beautiful Game. 대리석 체스판과 유리·금속으로 된 체스 말" src="../images/formats/glb.png"></td>
    <td width="33%"><img alt="데이터를 내장한 glTF 형식의 Corset. 자수 놓인 천과 버클" src="../images/formats/gltf.png"></td>
    <td width="33%"><img alt="STL 형식의 3DBenchy. 3D 프린터 테스트용으로 널리 쓰이는 작은 배이며, 파일에 저장된 주황색으로 표시됨" src="../images/formats/stl.png"></td>
  </tr>
  <tr>
    <td align="center"><b>GLB</b>: A Beautiful Game</td>
    <td align="center"><b>glTF</b>: Corset</td>
    <td align="center"><b>STL</b>: 3DBenchy</td>
  </tr>
  <tr>
    <td width="33%"><img alt="PLY 형식의 Stanford Armadillo. 3D 스캔 데이터이며, 정점에 저장된 초록색으로 표시됨" src="../images/formats/ply.png"></td>
    <td width="33%"><img alt="OBJ 형식의 Utah Teapot. 정점에 저장된 보라색으로 표시됨" src="../images/formats/obj.png"></td>
    <td width="33%"><img alt="FBX 형식의 BoomBox. 버튼과 스피커 그릴 텍스처까지 표시됨" src="../images/formats/fbx.png"></td>
  </tr>
  <tr>
    <td align="center"><b>PLY</b>: Stanford Armadillo</td>
    <td align="center"><b>OBJ</b>: Utah Teapot</td>
    <td align="center"><b>FBX</b>: BoomBox</td>
  </tr>
</table>

| 형식 | 확장자 | 색상과 텍스처 | 애니메이션 | 크기 단위 | 참고 |
| --- | --- | --- | --- | --- | --- |
| glTF 2.0 | `.glb` `.gltf` | 지원 | 지원 | 미터(glTF 규격) | `.gltf`는 데이터를 내장한 파일만 |
| STL | `.stl` | 파일에 저장된 색상(없으면 기본 색상) | 미지원 | 밀리미터(3D 프린팅 관례), Z축이 위쪽 | 바이너리, 텍스트 |
| PLY | `.ply` | 정점 색상(없으면 기본 색상) | 미지원 | 미터로 간주 | 바이너리, 텍스트 |
| OBJ | `.obj` | 정점 색상(`.mtl`은 읽지 못함) | 미지원 | 미터로 간주 | |
| FBX | `.fbx` | 내장된 텍스처만 | 지원 | 파일에 지정된 단위 | 바이너리 FBX 7.0(2011) 이상 |

Draco나 Meshopt로 압축한 glTF, KTX2 / Basis Universal 텍스처를 쓰는 모델도 열립니다.

## 기능

### 시점 조작

<table>
  <tr>
    <td width="50%"><img alt="마우스 왼쪽 버튼으로 드래그하면 카메라가 Bunny 주위를 돕니다" src="../images/features/orbit.gif"></td>
    <td width="50%"><img alt="오른쪽 버튼으로 드래그하거나 Shift를 누른 채 왼쪽 버튼으로 드래그하면 화면이 옆으로 이동합니다" src="../images/features/pan.gif"></td>
  </tr>
  <tr>
    <td align="center"><b>회전</b>: 드래그</td>
    <td align="center"><b>이동</b>: 오른쪽 드래그 또는 <kbd>Shift</kbd> + 드래그</td>
  </tr>
  <tr>
    <td width="50%"><img alt="마우스 휠을 굴리면 Bunny가 확대되었다가 다시 축소됩니다" src="../images/features/zoom.gif"></td>
    <td width="50%"><img alt="보기 초기화 버튼을 누르면 거꾸로 뒤집혔던 화면이 처음 시점으로 돌아갑니다" src="../images/features/reset.gif"></td>
  </tr>
  <tr>
    <td align="center"><b>확대/축소</b>: 스크롤</td>
    <td align="center"><b>보기 초기화</b>: 도구 모음의 첫 번째 버튼</td>
  </tr>
</table>

### 실제 크기

바닥 그리드와 X / Y / Z 축, 모델의 너비 × 높이 × 깊이가 표시되므로 단위를 잘못 지정해 만든 모델은 바로 눈에 띕니다.
예를 들어 Stanford Bunny는 너비가 15.6 cm로 나옵니다.

<img alt="10 mm 간격 그리드 위의 Bunny. 상태 표시줄에 156 × 154 × 121 mm와 그리드 10 mm가 차례로 표시됩니다" src="../images/features/size.gif" width="600">

### 와이어프레임, 그리드 및 축

메시를 선으로만 표시하거나 그리드와 축을 숨길 수 있습니다. 정점 수와 삼각형 수는 상태 표시줄에서 확인할 수 있습니다.

<img alt="와이어프레임 버튼을 누르면 Bunny의 메시가 드러나고, 이어서 그리드 및 축 버튼을 누르면 바닥 그리드가 사라집니다" src="../images/features/inspect.gif" width="600">

### 애니메이션

애니메이션을 재생하거나 일시 중지할 수 있습니다. 클립이 여러 개인 모델에서는 원하는 클립을 골라 볼 수 있습니다.

<img alt="여우 모델의 Survey 클립을 재생하다가 클립 메뉴에서 Run으로 바꾸고, 일시 중지했다가 다시 재생합니다" src="../images/features/animations.gif" width="600">

### 저장하면 바로 반영

파일을 저장하면 카메라 위치는 그대로 둔 채 바뀐 내용이 바로 표시됩니다.

<img alt="Ctrl + S로 저장할 때마다 Bunny의 색이 그 자리에서 바뀝니다" src="../images/features/live.gif" width="600">

### 라이트 또는 다크

뷰어는 처음에 라이트 테마로 열리며, 도구 모음의 달 버튼을 누를 때마다 다크 테마와 라이트 테마가 바뀝니다. 마지막으로 고른
테마와 와이어프레임, 그리드 설정은 Orca를 다시 시작해도 그대로 유지됩니다(Orca 1.4.250 이상).

<img alt="도구 모음의 달 버튼을 누르면 뷰어가 다크 테마로 바뀌고, 한 번 더 누르면 라이트 테마로 돌아옵니다" src="../images/features/theme.gif" width="600">

### 11개 언어

뷰어는 Orca에 설정된 언어로 표시됩니다. 지원 언어는 English, 日本語, Deutsch, Español, Français, 한국어, Português,
Русский, Türkçe, 简体中文, 繁體中文입니다.

### 이슈에 붙여 넣을 세부 정보

도구 모음의 **i** 버튼(오류 화면에서는 메시지 아래의 **세부 정보** 버튼)을 누르면 요약 정보가 열립니다.
뷰어 버전, 브라우저와 그래픽 정보, 최근 로드 기록과 각각 걸린 시간, 발생한 오류를 한데 모아 보여 줍니다.
**복사**해서 이슈에 붙여 넣기만 하면 어떤 상황이었는지 그대로 전달됩니다. 모델 데이터는 들어가지 않습니다.

<img alt="세부 정보 패널. 뷰어 버전, 브라우저, 로드 기록, 파일을 열지 않은 이유가 표시되고 아래에 복사 버튼과 닫기 버튼이 있습니다" src="../images/details.png" width="600">

## 설치

1. Orca에서 **설정 → 플러그인**을 열고 **플러그인 설치**를 선택합니다.
2. **Git URL** 탭에 다음 주소를 입력합니다.

   ```text
   https://github.com/momokun7/orca-3d-viewer#v1.0.0
   ```

3. **설치**를 선택합니다. 이 뷰어는 권한을 요청하지 않으므로 따로 허용할 항목이 없습니다.

> [!IMPORTANT]
> Orca 데스크톱 앱 1.4.248 이상이 필요합니다.

## 사용법

지원하는 형식의 파일을 열면 바로 3D로 표시됩니다. `.gltf`와 `.obj`는 텍스트 파일이기도 해서, 편집기 탭에서
**소스**(텍스트)와 **3D**를 오가며 볼 수 있습니다.

| 작업 | 방법 |
| --- | --- |
| 회전 | 드래그 |
| 이동 | 오른쪽 드래그, <kbd>Shift</kbd> + 드래그 또는 화살표 키 |
| 확대/축소 | 스크롤 |
| 보기 초기화 | 도구 모음의 첫 번째 버튼 |
| 와이어프레임, 그리드 및 축 | 바로 옆의 버튼 |
| 라이트 또는 다크 | 달 버튼 |
| 세부 정보 | **i** 버튼 |
| 애니메이션 | 재생 버튼과 클립 메뉴(애니메이션이 있는 모델만) |

## 제한 사항

> [!NOTE]
> Orca 플러그인은 열려 있는 파일만 읽을 수 있고 같은 폴더의 다른 파일은 읽지 못합니다. 그래서 별도 파일에 담긴
> 데이터는 표시되지 않습니다. 지오메트리가 별도의 `.bin` 파일에 들어 있는 `.gltf`는 열리지 않고, 별도 이미지 파일로
> 된 텍스처와 OBJ의 `.mtl`도 반영되지 않습니다. `.glb`나 데이터를 내장한 `.gltf`, 텍스처를 내장한 FBX라면 모든
> 내용이 표시됩니다.

- **데스크톱 앱 전용**: 브라우저에서 실행한 Orca에서는 파일이 소스로만 열립니다.
- **최대 64 MiB**: Orca가 사용자 지정 편집기에 허용하는 최대 크기입니다. 디코딩했을 때 안전하게 다룰 수 있는 양을
  크게 넘는 모델이나 뷰어가 읽을 수 없는 기능을 쓰는 모델은 열지 않고, 그 이유를 메시지로 알려 줍니다.
- **오래된 FBX와 텍스트 FBX는 지원하지 않음**: 바이너리 FBX 7.0 이상으로 다시 내보내세요.

Khronos [glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets)의 GLB 모델과 데이터를 내장한
glTF 모델 152개를 모두 열어 보았습니다. three.js에 구현되지 않은 확장이 필요한 3개를 빼면 전부 정상적으로 열립니다.

## 문제 해결

<details>
<summary>파일이 3D가 아니라 텍스트로 열립니다</summary>

`.gltf`와 `.obj`는 텍스트 파일이라 소스(텍스트)로 열리기도 합니다. 편집기 탭에서 **3D**를 선택하세요.
브라우저에서 실행한 Orca에서는 3D 보기를 쓸 수 없습니다.

</details>

<details>
<summary>텍스처나 색상이 보이지 않습니다</summary>

플러그인은 별도 이미지 파일로 된 텍스처를 읽을 수 없습니다. 읽지 못한 파일의 이름은 상태 표시줄에 나옵니다.
glTF라면 `.glb`로 저장하고, FBX라면 텍스처를 내장해서 내보내세요. OBJ는 `.mtl`을 읽을 수 없으므로 정점 색상이 있으면
그 색으로, 없으면 기본 색상으로 표시됩니다.

</details>

<details>
<summary>크기가 이상하게 나옵니다</summary>

STL, PLY, OBJ는 파일에 단위를 저장하지 않기 때문에 STL은 밀리미터, PLY와 OBJ는 미터로 간주해 표시합니다. FBX와
glTF는 파일에 지정된 단위를 따릅니다. 크기가 1000배나 100배 어긋난다면 모델을 내보낼 때 어떤 단위를 썼는지 확인하세요.

</details>

<details>
<summary>모델을 열 수 없다는 메시지가 나옵니다</summary>

메시지에 그 이유가 적혀 있습니다. 너무 큰 모델, 손상된 파일, 뷰어가 지원하지 않는 기능을 쓰는 모델은 열기 전에
걸러집니다. 이유가 분명하지 않다면 **세부 정보**를 복사해서 이슈에 붙여 넣어 주세요.

</details>

<details>
<summary>버그 신고하기</summary>

[버그 신고](https://github.com/momokun7/orca-3d-viewer/issues/new?template=bug_report.yml) 템플릿을 사용하고
**세부 정보** 텍스트를 붙여 넣어 주세요. 모델을 공유할 수 있다면 어디서 구한 모델인지도 알려 주세요. 보안 문제는
이슈 대신 [비공개 신고](https://github.com/momokun7/orca-3d-viewer/security/advisories/new)로 알려 주세요.

</details>

## 보안

모델 파일은 신뢰할 수 없는 입력입니다. 그래서 이 뷰어는 공격할 틈이 거의 없도록 설계했습니다.

- **격리**: Orca의 격리된 플러그인 프레임 안에서, 엄격한 Content-Security-Policy가 적용된 채 네트워크 없이 실행됩니다.
- **권한 없음**: 매니페스트에서 아무 기능도 요청하지 않습니다. 워커, 명령, 파일 접근 모두 쓰지 않습니다.
- **읽기 전용**: 문서를 편집하거나 저장하는 일이 없으며, 모델 안에 적힌 URI는 로더로 넘어가지 않습니다.
- **먼저 검사**: 어떤 형식이든 디코딩에 앞서 별도 스레드에서 크기가 한도 안인지 검사합니다. FBX의 압축 배열은
  조금씩 풀다가 선언된 크기를 넘는 즉시 멈춥니다.
- **테스트**: CI에서는 Orca와 같은 프레임 정책을 적용한 채 악의적으로 만든 모델과 퍼징으로 만든 모델을 뷰어에 넣어
  보고, 커밋된 번들을 소스에서 똑같이 다시 빌드할 수 있는지도 확인합니다.

자세한 내용은 [SECURITY.md](../../SECURITY.md)를 참고하세요.

## 개발

플러그인 코드는 `build/src`에 있으며, `build/build.mjs`가 이를 `editor/`로 번들링합니다. Orca가 따로 빌드하지 않고도
플러그인을 로드할 수 있도록 `editor/`도 함께 커밋해 두었습니다.

```sh
cd build
npm ci
npm test
npm run typecheck
npm run build
```

[mise](https://mise.jdx.dev)를 쓴다면 `mise run check` 한 번으로 CI와 같은 검사를 모두 돌릴 수 있고, `mise tasks`로
다른 작업 목록도 볼 수 있습니다.

수정한 내용을 Orca에서 확인하려면 저장소 루트에서 `orca plugin dev watch .` 명령을 실행하거나,
**설정 → 플러그인 → 개발**에 이 폴더를 추가하세요.

## 기여하기

이슈, 레이블, 프로젝트 보드, 마일스톤, 풀 리퀘스트를 어떻게 다루는지는 [CONTRIBUTING.md](../../CONTRIBUTING.md)에 정리되어 있습니다.
영어와 일본어를 제외한 번역은 기계 번역으로 초안을 만들었습니다. 원어민 분들의 수정 제안은 언제든 환영합니다.

## 라이선스 및 출처

[MIT](../../LICENSE). 번들에 포함된 three.js, meshoptimizer, fflate, Lucide(MIT / ISC)와 Draco 디코더
(Apache-2.0)는 각각의 라이선스를 따릅니다. [THIRD_PARTY_NOTICES.txt](../../THIRD_PARTY_NOTICES.txt)를 참고하세요.

이미지와 GIF에 나오는 모델의 출처는 아래와 같습니다. 모든 사본은 형식 변환, 색상, 방향을 저희가 손보았습니다
(3DBenchy, Armadillo, Teapot의 색상은 저희가 파일에 직접 기록한 것입니다).

| 모델 | 사용한 곳 | 출처 | 라이선스 |
| --- | --- | --- | --- |
| Stanford Bunny | 대표 이미지, 기능 GIF | [Stanford 3D Scanning Repository](https://graphics.stanford.edu/data/3Dscanrep/). Source: Stanford University Computer Graphics Laboratory | 출처를 밝히면 비상업적 용도로 무료 사용 가능 |
| Stanford Armadillo | PLY | 위와 같음 | 위와 같음 |
| A Beautiful Game | GLB | Khronos [glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets). 원본 모델은 MaterialX Project, glTF 변환은 Ed Mackey | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Corset | glTF | Khronos glTF Sample Assets, Microsoft | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| BoomBox | FBX | Khronos glTF Sample Assets, Microsoft | CC0 1.0 |
| 3DBenchy | STL | [3DBenchy.com](https://www.3dbenchy.com/), Creative Tools | CC0 1.0 |
| Utah Teapot | OBJ | [McGuire Computer Graphics Archive](https://casual-effects.com/data), Martin Newell(1975), Kenzie Lamar | CC0 |
| Fox | 애니메이션 GIF | Khronos glTF Sample Assets. 모델은 PixelMannen(CC0 1.0), 리깅과 애니메이션은 tomkranis, glTF 변환은 @AsoboStudio와 @scurest | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
