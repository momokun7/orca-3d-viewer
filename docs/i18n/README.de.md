<div align="center">

[English](../../README.md) · [日本語](README.ja.md) · **Deutsch** · [Español](README.es.md) ·
[Français](README.fr.md) · [한국어](README.ko.md) · [Português](README.pt-BR.md) ·
[Русский](README.ru.md) · [Türkçe](README.tr.md) · [简体中文](README.zh-Hans.md) ·
[繁體中文](README.zh-Hant.md)

# 3D Viewer for Orca

**3D-Modelle ansehen, ohne den Editor zu verlassen.**

Ein schreibgeschützter Viewer für [Orca](https://github.com/stablyai/orca), der GLB, glTF, STL, PLY, OBJ und FBX öffnet.
Ein Modell umkreisen, seine Animationen abspielen und auf einen Blick sehen, ob es so groß ist wie gedacht.

[![CI](https://github.com/momokun7/orca-3d-viewer/actions/workflows/ci.yml/badge.svg)](https://github.com/momokun7/orca-3d-viewer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)
[![Orca](https://img.shields.io/badge/Orca-%E2%89%A5%201.4.248-black.svg)](https://github.com/stablyai/orca)
[![Permissions](https://img.shields.io/badge/permissions-none-brightgreen.svg)](#sicherheit)

[Formate](#formate) · [Funktionen](#funktionen) · [Installation](#installation) · [Verwendung](#verwendung) ·
[Fehlerbehebung](#fehlerbehebung) · [Sicherheit](#sicherheit) · [Entwicklung](#entwicklung) ·
[Fehler melden](https://github.com/momokun7/orca-3d-viewer/issues/new?template=bug_report.yml)

<img alt="Das Stanford Bunny im 3D Viewer in Orca, auf einem Bodenraster sitzend, mit seiner Größe von 156 × 154 × 121 mm in der Statusleiste" src="../images/hero.png" width="800">

</div>

## Formate

Ein Viewer, sechs Formate.

<table>
  <tr>
    <td width="33%"><img alt="A Beautiful Game als GLB: ein Schachbrett aus Marmor mit Figuren aus Glas und Metall" src="../images/formats/glb.png"></td>
    <td width="33%"><img alt="Corset als glTF mit eingebetteten Daten: bestickter Stoff und Schnallen" src="../images/formats/gltf.png"></td>
    <td width="33%"><img alt="3DBenchy als STL: das kleine Boot zum Testen von 3D-Druckern, in einem in der Datei gespeicherten Orange" src="../images/formats/stl.png"></td>
  </tr>
  <tr>
    <td align="center"><b>GLB</b>: A Beautiful Game</td>
    <td align="center"><b>glTF</b>: Corset</td>
    <td align="center"><b>STL</b>: 3DBenchy</td>
  </tr>
  <tr>
    <td width="33%"><img alt="Das Stanford Armadillo als PLY: ein 3D-Scan, in einem in seinen Vertices gespeicherten Grün" src="../images/formats/ply.png"></td>
    <td width="33%"><img alt="Die Utah-Teekanne als OBJ, in einem in ihren Vertices gespeicherten Violett" src="../images/formats/obj.png"></td>
    <td width="33%"><img alt="BoomBox als FBX, mit der Textur ihrer Tasten und Lautsprechergitter" src="../images/formats/fbx.png"></td>
  </tr>
  <tr>
    <td align="center"><b>PLY</b>: Stanford Armadillo</td>
    <td align="center"><b>OBJ</b>: Utah Teapot</td>
    <td align="center"><b>FBX</b>: BoomBox</td>
  </tr>
</table>

| Format | Endungen | Farben und Texturen | Animation | Größeneinheit | Hinweise |
| --- | --- | --- | --- | --- | --- |
| glTF 2.0 | `.glb` `.gltf` | Ja | Ja | Meter (wie glTF es festlegt) | Eine `.gltf` muss ihre Daten einbetten |
| STL | `.stl` | In der Datei gespeicherte Farben, sonst eine Standardfarbe | Nein | Millimeter (Konvention im 3D-Druck), Z nach oben | Binär und Text |
| PLY | `.ply` | Vertexfarben, sonst eine Standardfarbe | Nein | Als Meter angezeigt | Binär und Text |
| OBJ | `.obj` | Vertexfarben (`.mtl` kann nicht gelesen werden) | Nein | Als Meter angezeigt | |
| FBX | `.fbx` | Nur eingebettete Texturen | Ja | Die in der Datei angegebene Einheit | Binäres FBX 7.0 (2011) und neuer |

Mit Draco oder Meshopt komprimiertes glTF sowie KTX2- / Basis-Universal-Texturen lassen sich ebenfalls öffnen.

## Funktionen

### Umsehen

<table>
  <tr>
    <td width="50%"><img alt="Ziehen mit der linken Maustaste lässt die Kamera um das Bunny kreisen" src="../images/features/orbit.gif"></td>
    <td width="50%"><img alt="Ziehen mit der rechten Maustaste, dann Shift plus Ziehen mit der linken, verschiebt die Ansicht seitlich" src="../images/features/pan.gif"></td>
  </tr>
  <tr>
    <td align="center"><b>Umkreisen</b>: ziehen</td>
    <td align="center"><b>Verschieben</b>: mit rechts ziehen oder <kbd>Shift</kbd> + ziehen</td>
  </tr>
  <tr>
    <td width="50%"><img alt="Mit dem Mausrad an das Bunny heran- und wieder herauszoomen" src="../images/features/zoom.gif"></td>
    <td width="50%"><img alt="Eine auf den Kopf gestellte Ansicht kehrt mit der Schaltfläche zum Zurücksetzen in die Ausgangsansicht zurück" src="../images/features/reset.gif"></td>
  </tr>
  <tr>
    <td align="center"><b>Zoomen</b>: scrollen</td>
    <td align="center"><b>Ansicht zurücksetzen</b>: die erste Schaltfläche der Werkzeugleiste</td>
  </tr>
</table>

### Reale Größe

Ein Bodenraster, X- / Y- / Z-Achsen und Breite × Höhe × Tiefe des Modells, sodass ein in der falschen Einheit
erstelltes Modell sofort auffällt. Das Stanford Bunny ist 15,6 cm breit.

<img alt="Das Bunny auf einem 10-mm-Raster; die Statusleiste zeigt 156 × 154 × 121 mm, dann Raster 10 mm" src="../images/features/size.gif" width="600">

### Drahtgitter, Raster und Achsen

Das Mesh nur als Linien anzeigen oder Raster und Achsen ausblenden. Die Anzahl der Vertices und Dreiecke steht in der Statusleiste.

<img alt="Die Schaltfläche Drahtgitter zeigt das Mesh des Bunnys, dann blendet die Schaltfläche Raster und Achsen das Bodenraster aus" src="../images/features/inspect.gif" width="600">

### Animationen

Abspielen und pausieren sowie einen Clip wählen, wenn das Modell mehrere hat.

<img alt="Ein Fuchs spielt seinen Clip Survey ab, wechselt im Clip-Menü zu Run, pausiert dann und spielt weiter" src="../images/features/animations.gif" width="600">

### Immer aktuell

Die Datei speichern, und die Ansicht zeigt die neue Version, wobei die Kamera bleibt, wo sie war.

<img alt="Jedes Mal, wenn die Datei mit Strg + S gespeichert wird, ändert das Bunny an Ort und Stelle seine Farbe" src="../images/features/live.gif" width="600">

### Hell oder dunkel

Der Viewer öffnet sich hell; die Mond-Schaltfläche in der Werkzeugleiste schaltet auf **Dunkles Design** und zurück. Er merkt sich
das zuletzt gewählte Design, Drahtgitter und Raster, auch nach einem Neustart von Orca (Orca 1.4.250 und neuer).

<img alt="Ein Klick auf die Mond-Schaltfläche in der Werkzeugleiste macht den Viewer dunkel, ein weiterer Klick wieder hell" src="../images/features/theme.gif" width="600">

### Elf Sprachen

Der Text des Viewers folgt der Sprache von Orca: English, 日本語, Deutsch, Español, Français, 한국어, Português,
Русский, Türkçe, 简体中文 und 繁體中文.

### Details zum Einfügen in ein Issue

Die Schaltfläche **i** in der Werkzeugleiste (auf einem Fehlerbildschirm die Schaltfläche **Details** unter der Meldung) öffnet eine Zusammenfassung:
die Version des Viewers, Browser und Grafik, die letzten Ladevorgänge mit ihrer Dauer und die aufgetretenen Fehler.
Mit **Kopieren** in ein Issue übernehmen, und es beschreibt, was passiert ist. Es enthält keine Modelldaten.

<img alt="Das Panel Details: die Version des Viewers, der Browser, der Ladeverlauf und der Grund, aus dem eine Datei abgelehnt wurde, mit den Schaltflächen Kopieren und Schließen" src="../images/details.png" width="600">

## Installation

1. In Orca **Einstellungen → Plugins** öffnen und **Plugin installieren** wählen.
2. Auf dem Tab **Git-URL** Folgendes eingeben:

   ```text
   https://github.com/momokun7/orca-3d-viewer#v1.0.0
   ```

3. **Installieren** wählen. Der Viewer fordert keine Berechtigungen an, es muss also nichts weiter gewährt werden.

> [!IMPORTANT]
> Erfordert die Orca-Desktop-App ab Version 1.4.248.

## Verwendung

Eine Datei in einem dieser Formate öffnen, und sie wird in 3D angezeigt. `.gltf` und `.obj` sind Textdateien, daher wechselt
der Editor-Tab zwischen **Quelltext** (dem Text) und **3D**.

| Aktion | So geht's |
| --- | --- |
| Umkreisen | Ziehen |
| Verschieben | Mit rechts ziehen, <kbd>Shift</kbd> + ziehen oder die Pfeiltasten |
| Zoomen | Scrollen |
| Ansicht zurücksetzen | Die erste Schaltfläche der Werkzeugleiste |
| Drahtgitter, Raster und Achsen | Die Schaltflächen daneben |
| Hell oder dunkel | Die Mond-Schaltfläche |
| Details | Die Schaltfläche **i** |
| Animationen | Die Wiedergabe-Schaltfläche und das Clip-Menü, wenn das Modell welche hat |

## Grenzen

> [!NOTE]
> Orca-Plugins lesen nur die geöffnete Datei, nie die anderen Dateien in ihrem Ordner, daher können Daten in separaten Dateien
> nicht angezeigt werden. Eine `.gltf`, deren Geometrie in einer separaten `.bin` liegt, öffnet sich nicht, und Texturen in separaten
> Bilddateien sowie die `.mtl` einer OBJ werden weggelassen. Eine `.glb`, eine `.gltf` mit eingebetteten Daten oder eine FBX mit
> eingebetteten Texturen zeigt alles.

- **Nur in der Desktop-App.** In Orca im Browser öffnet sich die Datei im Quelltext.
- **Bis 64 MiB**, das Limit von Orca für benutzerdefinierte Editoren. Ein Modell, das dekodiert weit mehr belegen würde, als sicher zu halten ist,
  oder das etwas verwendet, das der Viewer nicht lesen kann, wird mit einer Meldung abgelehnt, die den Grund nennt.
- **Kein altes FBX und kein Text-FBX.** Erneut als binäres FBX 7.0 oder neuer exportieren.

Alle 152 GLB- und eingebetteten glTF-Modelle aus Khronos'
[glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets) wurden geprüft: Jedes öffnet sich, außer
drei, die eine Erweiterung benötigen, die three.js nicht implementiert.

## Fehlerbehebung

<details>
<summary>Die Datei öffnet sich als Text statt in 3D</summary>

`.gltf` und `.obj` sind Textdateien und öffnen sich daher möglicherweise im Quelltext. Auf dem Editor-Tab **3D** wählen. In
Orca im Browser ist 3D nicht verfügbar.

</details>

<details>
<summary>Texturen oder Farben fehlen</summary>

Texturen in separaten Bilddateien kann ein Plugin nicht lesen; die Statusleiste nennt die Dateien, die nicht gelesen werden konnten.
Für glTF eine `.glb` verwenden; für FBX mit eingebetteten Texturen exportieren. Die `.mtl` einer OBJ kann nicht gelesen werden, daher
wird sie in ihren Vertexfarben angezeigt, falls vorhanden, sonst in einer Standardfarbe.

</details>

<details>
<summary>Die Größe sieht falsch aus</summary>

STL wird in Millimetern angezeigt, PLY und OBJ in Metern, da keines dieser Formate eine Einheit speichert. FBX und glTF verwenden die
in der Datei angegebene Einheit. Liegt die Größe um den Faktor 1000 oder 100 daneben, die Einheit prüfen, in der das Modell exportiert wurde.

</details>

<details>
<summary>Es heißt, das Modell könne nicht geöffnet werden</summary>

Die Meldung nennt den Grund. Zu große Modelle, beschädigte Dateien und Funktionen, die der Viewer nicht
unterstützt, werden abgelehnt, bevor sie geöffnet werden. Ist der Grund unklar, die **Details** kopieren und in ein Issue einfügen.

</details>

<details>
<summary>Einen Fehler melden</summary>

Die Vorlage [Fehlerbericht](https://github.com/momokun7/orca-3d-viewer/issues/new?template=bug_report.yml) verwenden
und den Text aus **Details** einfügen. Falls das Modell geteilt werden kann, angeben, woher es stammt. Ein Sicherheitsproblem gehört
in eine [vertrauliche Meldung](https://github.com/momokun7/orca-3d-viewer/security/advisories/new), nicht in ein Issue.

</details>

## Sicherheit

Ein Modell ist eine nicht vertrauenswürdige Eingabe, daher ist der Viewer so gebaut, dass er ein langweiliges Angriffsziel ist.

- **Isoliert**: Er läuft im isolierten Plugin-Frame von Orca, unter einer strengen Content-Security-Policy, ohne Netzwerk.
- **Keine Berechtigungen**: Das Manifest fordert keine Fähigkeiten an: keinen Worker, keine Befehle, keinen Dateizugriff.
- **Schreibgeschützt**: Er bearbeitet oder speichert das Dokument nie, und URIs in einem Modell erreichen nie einen Loader.
- **Zuerst geprüft**: Jedes Format wird in einem separaten Thread gegen Größenbudgets geprüft, bevor irgendetwas
  dekodiert wird. Die komprimierten Arrays von FBX werden in kleinen Schritten entpackt und gestoppt, sobald sie ihre angegebene Größe überschreiten.
- **Getestet**: Die CI führt den Viewer unter der Frame-Richtlinie von Orca mit feindseligen und gefuzzten Modellen aus und prüft, dass das
  committete Bundle aus dem Quellcode reproduzierbar ist.

Einzelheiten stehen in [SECURITY.md](../../SECURITY.md).

## Entwicklung

Der Code des Plugins liegt in `build/src`. `build/build.mjs` bündelt ihn nach `editor/`, das committet wird, damit Orca
das Plugin ohne Build-Schritt laden kann.

```sh
cd build
npm ci
npm test
npm run typecheck
npm run build
```

Mit [mise](https://mise.jdx.dev) führt `mise run check` alles aus, was die CI ausführt, und `mise tasks` listet den Rest auf.

Um Änderungen in Orca auszuprobieren, `orca plugin dev watch .` im Stammverzeichnis des Repositorys ausführen oder den Ordner unter
**Einstellungen → Plugins → Entwicklung** hinzufügen.

## Mitwirken

Issues, Labels, das Projektboard, Meilensteine und Pull Requests sind in
[CONTRIBUTING.md](../../CONTRIBUTING.md) beschrieben. Die Übersetzungen außer Englisch und Japanisch wurden maschinell entworfen;
Korrekturen von Muttersprachlern sind sehr willkommen.

## Lizenz und Danksagungen

[MIT](../../LICENSE). Die mitgelieferten three.js, meshoptimizer, fflate und Lucide (MIT / ISC) sowie der Draco-Decoder
(Apache-2.0) behalten ihre eigenen Lizenzen; siehe [THIRD_PARTY_NOTICES.txt](../../THIRD_PARTY_NOTICES.txt).

Die Modelle in den Bildern und GIFs stammen aus den unten genannten Quellen. In jeder Kopie stammen die Formatkonvertierung, die Farben
(die von 3DBenchy, dem Armadillo und der Teekanne haben wir in die Datei geschrieben) und die Ausrichtung von uns.

| Modell | Verwendet in | Quelle | Lizenz |
| --- | --- | --- | --- |
| Stanford Bunny | Titelbild, Funktions-GIFs | [Stanford 3D Scanning Repository](https://graphics.stanford.edu/data/3Dscanrep/). Source: Stanford University Computer Graphics Laboratory | Frei für nichtkommerzielle Nutzung mit Namensnennung |
| Stanford Armadillo | PLY | Wie oben | Wie oben |
| A Beautiful Game | GLB | Khronos [glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets). Originalmodell vom MaterialX Project, Konvertierung nach glTF von Ed Mackey | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Corset | glTF | Khronos glTF Sample Assets, Microsoft | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| BoomBox | FBX | Khronos glTF Sample Assets, Microsoft | CC0 1.0 |
| 3DBenchy | STL | [3DBenchy.com](https://www.3dbenchy.com/), Creative Tools | CC0 1.0 |
| Utah Teapot | OBJ | [McGuire Computer Graphics Archive](https://casual-effects.com/data), Martin Newell (1975), Kenzie Lamar | CC0 |
| Fox | Animations-GIF | Khronos glTF Sample Assets. Modell von PixelMannen (CC0 1.0), Rigging und Animation von tomkranis, Konvertierung nach glTF von @AsoboStudio und @scurest | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
