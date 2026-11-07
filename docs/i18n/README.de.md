<div align="center">

[English](../../README.md) · [日本語](README.ja.md) · **Deutsch** · [Español](README.es.md) ·
[Français](README.fr.md) · [한국어](README.ko.md) · [Português](README.pt-BR.md) ·
[Русский](README.ru.md) · [Türkçe](README.tr.md) · [简体中文](README.zh-Hans.md) ·
[繁體中文](README.zh-Hant.md)

# 3D Viewer for Orca

Ein schreibgeschützter Viewer für [Orca](https://github.com/stablyai/orca), der GLB, glTF, STL, PLY, OBJ und FBX öffnet.
Modelle von allen Seiten betrachten, Animationen abspielen und auf einen Blick sehen, ob die Größe stimmt.

[![CI](https://github.com/momokun7/orca-3d-viewer/actions/workflows/ci.yml/badge.svg)](https://github.com/momokun7/orca-3d-viewer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)
[![Orca](https://img.shields.io/badge/Orca-%E2%89%A5%201.4.248-black.svg)](https://github.com/stablyai/orca)
[![Permissions](https://img.shields.io/badge/permissions-none-brightgreen.svg)](#sicherheit)

[Schnellstart](#schnellstart) · [Formate](#formate) · [Funktionen](#funktionen) · [Installation](#installation) · [Verwendung](#verwendung) ·
[Fehlerbehebung](#fehlerbehebung) · [Sicherheit](#sicherheit) · [Entwicklung](#entwicklung) ·
[Fehler melden](https://github.com/momokun7/orca-3d-viewer/issues/new?template=bug_report.yml)

<img alt="Das Stanford Bunny im 3D Viewer in Orca auf einem Bodenraster; die Statusleiste zeigt seine Größe von 156 × 154 × 121 mm" src="../images/hero.png" width="800">

</div>

## Schnellstart

1. In Orca **Einstellungen → Plugins → Plugin installieren** öffnen, im Tab **Git-URL** `https://github.com/momokun7/orca-3d-viewer#v1.0.0` eingeben und auf **Installieren** klicken.
2. Eine `.glb`-, `.gltf`-, `.stl`-, `.ply`-, `.obj`- oder `.fbx`-Datei öffnen.
3. Zum Drehen ziehen, zum Zoomen scrollen.

Berechtigungen sind nicht nötig. Mehr dazu unter [Installation](#installation) und [Verwendung](#verwendung).

## Formate

Ein Viewer für sechs Formate.

<table>
  <tr>
    <td width="33%"><img alt="A Beautiful Game als GLB: ein Schachbrett aus Marmor mit Figuren aus Glas und Metall" src="../images/formats/glb.png"></td>
    <td width="33%"><img alt="Corset als glTF mit eingebetteten Daten: bestickter Stoff und Schnallen" src="../images/formats/gltf.png"></td>
    <td width="33%"><img alt="3DBenchy als STL: das kleine Testboot für 3D-Drucker, in Orange, wie in der Datei gespeichert" src="../images/formats/stl.png"></td>
  </tr>
  <tr>
    <td align="center"><b>GLB</b>: A Beautiful Game</td>
    <td align="center"><b>glTF</b>: Corset</td>
    <td align="center"><b>STL</b>: 3DBenchy</td>
  </tr>
  <tr>
    <td width="33%"><img alt="Das Stanford Armadillo als PLY: ein 3D-Scan, in Grün, wie in den Vertices gespeichert" src="../images/formats/ply.png"></td>
    <td width="33%"><img alt="Die Utah-Teekanne als OBJ, in Violett, wie in den Vertices gespeichert" src="../images/formats/obj.png"></td>
    <td width="33%"><img alt="BoomBox als FBX, mit Textur für Tasten und Lautsprechergitter" src="../images/formats/fbx.png"></td>
  </tr>
  <tr>
    <td align="center"><b>PLY</b>: Stanford Armadillo</td>
    <td align="center"><b>OBJ</b>: Utah Teapot</td>
    <td align="center"><b>FBX</b>: BoomBox</td>
  </tr>
</table>

| Format | Endungen | Farben und Texturen | Animation | Größeneinheit | Hinweise |
| --- | --- | --- | --- | --- | --- |
| glTF 2.0 | `.glb` `.gltf` | Ja | Ja | Meter (laut glTF-Spezifikation) | Eine `.gltf` muss ihre Daten eingebettet enthalten |
| STL | `.stl` | In der Datei gespeicherte Farben, sonst Standardfarbe | Nein | Millimeter (üblich im 3D-Druck), Z zeigt nach oben | Binär und Text |
| PLY | `.ply` | Vertexfarben, sonst Standardfarbe | Nein | Als Meter angezeigt | Binär und Text |
| OBJ | `.obj` | Vertexfarben (`.mtl` wird nicht gelesen) | Nein | Als Meter angezeigt | |
| FBX | `.fbx` | Nur eingebettete Texturen | Ja | Die in der Datei angegebene Einheit | Binäres FBX ab 7.0 (2011) |

Auch mit Draco oder Meshopt komprimiertes glTF sowie KTX2- und Basis-Universal-Texturen werden unterstützt.

## Funktionen

### Umsehen

<table>
  <tr>
    <td width="50%"><img alt="Ziehen mit der linken Maustaste lässt die Kamera um das Bunny kreisen" src="../images/features/orbit.gif"></td>
    <td width="50%"><img alt="Ziehen mit der rechten Maustaste und anschließend Shift plus Ziehen mit der linken verschiebt die Ansicht seitlich" src="../images/features/pan.gif"></td>
  </tr>
  <tr>
    <td align="center"><b>Drehen</b>: ziehen</td>
    <td align="center"><b>Verschieben</b>: mit der rechten Maustaste oder mit <kbd>Shift</kbd> ziehen</td>
  </tr>
  <tr>
    <td width="50%"><img alt="Mit dem Mausrad an das Bunny heran- und wieder wegzoomen" src="../images/features/zoom.gif"></td>
    <td width="50%"><img alt="Eine auf den Kopf gestellte Ansicht springt mit der Schaltfläche zum Zurücksetzen in die Ausgangsansicht zurück" src="../images/features/reset.gif"></td>
  </tr>
  <tr>
    <td align="center"><b>Zoomen</b>: scrollen</td>
    <td align="center"><b>Ansicht zurücksetzen</b>: erste Schaltfläche in der Werkzeugleiste</td>
  </tr>
</table>

### Reale Größe

Bodenraster, X-, Y- und Z-Achse sowie Breite × Höhe × Tiefe des Modells lassen sofort erkennen, wenn ein Modell
in der falschen Einheit erstellt wurde. Das Stanford Bunny ist zum Beispiel 15,6 cm breit.

<img alt="Das Bunny auf einem 10-mm-Raster; die Statusleiste zeigt 156 × 154 × 121 mm und Raster 10 mm" src="../images/features/size.gif" width="600">

### Drahtgitter, Raster und Achsen

Das Mesh nur als Linien anzeigen oder Raster und Achsen ausblenden. Die Statusleiste zeigt die Anzahl der Vertices und Dreiecke.

<img alt="Die Schaltfläche „Drahtgitter“ zeigt das Mesh des Bunnys, anschließend blendet die Schaltfläche „Raster und Achsen“ das Bodenraster aus" src="../images/features/inspect.gif" width="600">

### Animationen

Animationen abspielen und pausieren und bei mehreren Clips den gewünschten auswählen.

<img alt="Ein Fuchs spielt den Clip „Survey“ ab, wechselt über das Clip-Menü zu „Run“, pausiert und läuft dann weiter" src="../images/features/animations.gif" width="600">

### Immer aktuell

Nach dem Speichern zeigt die Ansicht sofort die neue Version, und die Kamera bleibt, wo sie war.

<img alt="Bei jedem Speichern mit Strg + S ändert das Bunny an Ort und Stelle seine Farbe" src="../images/features/live.gif" width="600">

### Hell oder dunkel

Der Viewer startet hell; die Mond-Schaltfläche **Dunkles Design** in der Werkzeugleiste schaltet auf dunkel und wieder zurück.
Design, Drahtgitter und Raster bleiben so eingestellt, wie sie zuletzt gewählt wurden, auch nach einem Neustart von Orca (ab Orca 1.4.250).

<img alt="Ein Klick auf die Mond-Schaltfläche in der Werkzeugleiste stellt den Viewer auf dunkel, ein weiterer Klick wieder auf hell" src="../images/features/theme.gif" width="600">

### Elf Sprachen

Der Viewer übernimmt die Sprache von Orca: English, 日本語, Deutsch, Español, Français, 한국어, Português,
Русский, Türkçe, 简体中文 und 繁體中文.

### Details zum Einfügen in ein Issue

Die Schaltfläche **i** in der Werkzeugleiste (bzw. auf einem Fehlerbildschirm die Schaltfläche **Details** unter der Meldung) öffnet eine Zusammenfassung:
Version des Viewers, Browser und Grafik, die letzten Ladevorgänge samt Dauer sowie aufgetretene Fehler.
Mit **Kopieren** lässt sie sich in ein Issue einfügen und beschreibt dort, was passiert ist. Modelldaten sind nicht enthalten.

<img alt="Das Panel „Details“: Version des Viewers, Browser, Ladeverlauf und der Grund, warum eine Datei abgelehnt wurde, mit den Schaltflächen „Kopieren“ und „Schließen“" src="../images/details.png" width="600">

## Installation

1. In Orca **Einstellungen → Plugins** öffnen und auf **Plugin installieren** klicken.
2. Im Tab **Git-URL** Folgendes eingeben:

   ```text
   https://github.com/momokun7/orca-3d-viewer#v1.0.0
   ```

3. Auf **Installieren** klicken. Der Viewer fordert keine Berechtigungen an, es muss also nichts weiter freigegeben werden.

> [!IMPORTANT]
> Erfordert die Desktop-App von Orca ab Version 1.4.248.

## Verwendung

Eine Datei in einem der unterstützten Formate öffnen, und sie wird in 3D angezeigt. Da `.gltf` und `.obj` Textdateien sind,
lässt sich im Editor-Tab zwischen **Quelltext** (dem Text) und **3D** umschalten.

| Aktion | Bedienung |
| --- | --- |
| Drehen | Ziehen |
| Verschieben | Mit der rechten Maustaste ziehen, mit <kbd>Shift</kbd> ziehen oder Pfeiltasten |
| Zoomen | Scrollen |
| Ansicht zurücksetzen | Erste Schaltfläche in der Werkzeugleiste |
| Drahtgitter, Raster und Achsen | Die Schaltflächen daneben |
| Hell oder dunkel | Mond-Schaltfläche |
| Details | Schaltfläche **i** |
| Animationen | Wiedergabe-Schaltfläche und Clip-Menü, sofern das Modell Animationen enthält |

## Grenzen

> [!NOTE]
> Orca-Plugins lesen nur die geöffnete Datei, nie andere Dateien im selben Ordner. Daten in separaten Dateien
> können daher nicht angezeigt werden: Eine `.gltf`, deren Geometrie in einer separaten `.bin` liegt, lässt sich nicht öffnen,
> und Texturen in separaten Bilddateien sowie die `.mtl` einer OBJ fehlen. Eine `.glb`, eine `.gltf` mit eingebetteten Daten
> oder eine FBX mit eingebetteten Texturen wird dagegen vollständig angezeigt.

- **Nur in der Desktop-App.** In der Browserversion von Orca öffnet sich die Datei als Quelltext.
- **Bis 64 MiB**, das Limit von Orca für benutzerdefinierte Editoren. Ein Modell, das dekodiert weit mehr Speicher belegen würde, als sicher ist,
  oder etwas verwendet, das der Viewer nicht lesen kann, wird abgelehnt; eine Meldung nennt den Grund.
- **Kein altes FBX und kein Text-FBX.** Die Datei erneut als binäres FBX ab 7.0 exportieren.

Getestet wurden alle 152 GLB-Modelle und glTF-Modelle mit eingebetteten Daten aus den
[glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets) von Khronos: Alle lassen sich öffnen, bis auf
drei, die eine Erweiterung benötigen, die three.js nicht implementiert.

## Fehlerbehebung

<details>
<summary>Die Datei öffnet sich als Text statt in 3D</summary>

Da `.gltf` und `.obj` Textdateien sind, öffnen sie sich unter Umständen als Quelltext. Im Editor-Tab **3D** wählen. In
der Browserversion von Orca steht 3D nicht zur Verfügung.

</details>

<details>
<summary>Texturen oder Farben fehlen</summary>

Texturen in separaten Bilddateien kann ein Plugin nicht lesen; die Statusleiste nennt die betroffenen Dateien.
Bei glTF eine `.glb` verwenden, bei FBX mit eingebetteten Texturen exportieren. Die `.mtl` einer OBJ wird nicht gelesen, daher
erscheint das Modell in seinen Vertexfarben, falls vorhanden, sonst in einer Standardfarbe.

</details>

<details>
<summary>Die Größe stimmt nicht</summary>

STL wird in Millimetern angezeigt, PLY und OBJ in Metern, da keines dieser Formate eine Einheit speichert. FBX und glTF verwenden die
in der Datei angegebene Einheit. Weicht die Größe um den Faktor 1000 oder 100 ab, die Einheit prüfen, in der das Modell exportiert wurde.

</details>

<details>
<summary>Das Modell lässt sich laut Meldung nicht öffnen</summary>

Die Meldung nennt den Grund. Zu große Modelle, beschädigte Dateien und Funktionen, die der Viewer nicht
unterstützt, werden schon vor dem Öffnen abgelehnt. Ist der Grund unklar, die **Details** kopieren und in ein Issue einfügen.

</details>

<details>
<summary>Einen Fehler melden</summary>

Die Vorlage [Fehlerbericht](https://github.com/momokun7/orca-3d-viewer/issues/new?template=bug_report.yml) verwenden
und den Text aus **Details** einfügen. Falls das Modell geteilt werden kann, bitte angeben, woher es stammt. Sicherheitsprobleme bitte
nicht als Issue, sondern über eine [vertrauliche Meldung](https://github.com/momokun7/orca-3d-viewer/security/advisories/new) melden.

</details>

## Sicherheit

Ein Modell ist eine nicht vertrauenswürdige Eingabe. Deshalb ist der Viewer so gebaut, dass er Angreifern möglichst wenig bietet.

- **Isoliert**: Er läuft im isolierten Plugin-Frame von Orca, unter einer strengen Content-Security-Policy und ohne Netzwerkzugriff.
- **Keine Berechtigungen**: Das Manifest fordert keinerlei Fähigkeiten an – keinen Worker, keine Befehle, keinen Dateizugriff.
- **Schreibgeschützt**: Er bearbeitet oder speichert das Dokument nie, und URIs in einem Modell gelangen nie an einen Loader.
- **Vorab geprüft**: Jedes Format wird in einem separaten Thread mit Größenbudgets abgeglichen, bevor überhaupt etwas
  dekodiert wird. Komprimierte FBX-Arrays werden schrittweise entpackt; das Entpacken stoppt, sobald sie ihre angegebene Größe überschreiten.
- **Getestet**: Die CI testet den Viewer unter der Frame-Richtlinie von Orca mit böswilligen und per Fuzzing erzeugten Modellen und prüft, ob sich das
  committete Bundle reproduzierbar aus dem Quellcode erzeugen lässt.

Einzelheiten stehen in [SECURITY.md](../../SECURITY.md).

## Entwicklung

Der Code des Plugins liegt in `build/src`. `build/build.mjs` bündelt ihn nach `editor/`. Dieser Ordner wird mit committet, damit Orca
das Plugin ohne Build-Schritt laden kann.

```sh
cd build
npm ci
npm test
npm run typecheck
npm run build
```

Mit [mise](https://mise.jdx.dev) führt `mise run check` alle Prüfungen der CI aus; `mise tasks` listet die übrigen Tasks auf.

Um Änderungen in Orca auszuprobieren, `orca plugin dev watch .` im Stammverzeichnis des Repositorys ausführen oder den Ordner unter
**Einstellungen → Plugins → Entwicklung** hinzufügen.

## Mitwirken

Issues, Labels, das Projektboard, Meilensteine und Pull Requests sind in
[CONTRIBUTING.md](../../CONTRIBUTING.md) beschrieben. Alle Übersetzungen außer Englisch und Japanisch wurden maschinell vorübersetzt;
Korrekturen von Muttersprachlern sind sehr willkommen.

## Lizenz und Danksagungen

[MIT](../../LICENSE). Die mitgelieferten Bibliotheken three.js, meshoptimizer, fflate und Lucide (MIT / ISC) sowie der Draco-Decoder
(Apache-2.0) unterliegen ihren eigenen Lizenzen; siehe [THIRD_PARTY_NOTICES.txt](../../THIRD_PARTY_NOTICES.txt).

Die Modelle in den Bildern und GIFs stammen aus den unten genannten Quellen. Bei allen Kopien haben wir das Format konvertiert sowie Farben
(bei 3DBenchy, dem Armadillo und der Teekanne von uns in die Datei geschrieben) und Ausrichtung angepasst.

| Modell | Verwendet in | Quelle | Lizenz |
| --- | --- | --- | --- |
| Stanford Bunny | Titelbild, Funktions-GIFs | [Stanford 3D Scanning Repository](https://graphics.stanford.edu/data/3Dscanrep/). Quelle: Stanford University Computer Graphics Laboratory | Frei für nichtkommerzielle Nutzung mit Namensnennung |
| Stanford Armadillo | PLY | Wie oben | Wie oben |
| A Beautiful Game | GLB | Khronos [glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets). Originalmodell vom MaterialX Project, Konvertierung nach glTF von Ed Mackey | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Corset | glTF | Khronos glTF Sample Assets, Microsoft | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| BoomBox | FBX | Khronos glTF Sample Assets, Microsoft | CC0 1.0 |
| 3DBenchy | STL | [3DBenchy.com](https://www.3dbenchy.com/), Creative Tools | CC0 1.0 |
| Utah Teapot | OBJ | [McGuire Computer Graphics Archive](https://casual-effects.com/data), Martin Newell (1975), Kenzie Lamar | CC0 |
| Fox | Animations-GIF | Khronos glTF Sample Assets. Modell von PixelMannen (CC0 1.0), Rigging und Animation von tomkranis, Konvertierung nach glTF von @AsoboStudio und @scurest | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
