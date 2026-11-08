// German UI text; see messages.ts for the English source.
import type { Messages } from '../messages.ts'

export const DE: Messages = {
  loading: '3D-Modell wird geladen…',
  contextLost:
    'Der Grafiktreiber hat die 3D-Ansicht zurückgesetzt. Sie wird wiederhergestellt, sobald der Treiber wieder reagiert. Falls nicht, die Datei erneut öffnen.',
  parseFailed:
    'Dieses 3D-Modell kann nicht angezeigt werden. Möglicherweise ist es beschädigt oder nutzt eine Funktion, die der Viewer nicht unterstützt.',
  corrupt: 'Dieses Modell ist beschädigt: {{path}} {{reason}}.',
  corruptFile: 'Diese {{format}}-Datei ist beschädigt: {{reason}}.',
  parseTimeout: 'Das Laden dieses 3D-Modells hat zu lange gedauert und wurde abgebrochen.',
  webglUnavailable:
    'Für die 3D-Ansicht wird WebGL benötigt, das derzeit nicht verfügbar ist. Möglicherweise ist die Hardwarebeschleunigung deaktiviert oder die GPU reagiert nicht mehr.',
  renderFailed: 'Das Modell wurde eingelesen, konnte aber nicht dargestellt werden.',
  truncated:
    'Diese GLB-Datei ist unvollständig: Sie enthält nur {{actual}} der im Header angegebenen {{declared}} Bytes. Vielleicht wird sie noch heruntergeladen oder kopiert, oder die Übertragung wurde unterbrochen.',
  unsupportedExtensions: 'Dieses Modell benötigt glTF-Erweiterungen, die der Viewer nicht unterstützt: {{extensions}}.',
  tooLargeGeometry:
    'Dieses Modell ist zu groß, um es sicher anzuzeigen: Dekodiert ergäbe es {{value}} an Vertex- und Animationsdaten (Limit: {{limit}}).',
  tooLargeGpu:
    'Dieses Modell ist zu groß, um es sicher anzuzeigen: Texturen und Morph-Targets würden {{value}} GPU-Speicher belegen (Limit: {{limit}}).',
  tooManyNodes: 'Dieses Modell ist zu groß, um es sicher anzuzeigen: Es enthält {{value}} Knoten (Limit: {{limit}}).',
  tooManyDrawCalls:
    'Dieses Modell ist zu groß, um es sicher anzuzeigen: Es bräuchte {{value}} Draw Calls pro Frame (Limit: {{limit}}).',
  tooManyImages: 'Dieses Modell ist zu groß, um es sicher anzuzeigen: Es enthält {{value}} Bilder (Limit: {{limit}}).',
  tooManyDrawnVertices:
    'Dieses Modell ist zu groß, um es sicher anzuzeigen: Pro Frame müssten {{value}} Vertices gezeichnet werden (Limit: {{limit}}).',
  tooManyMaterials:
    'Dieses Modell ist zu groß, um es sicher anzuzeigen: Es enthält {{value}} Materialien (Limit: {{limit}}).',
  tooManyChannels:
    'Dieses Modell ist zu groß, um es sicher anzuzeigen: Die Animationen haben {{value}} Kanäle (Limit: {{limit}}).',
  tooComplex: 'Dieses Modell ist zu komplex, um es vor dem Laden zu prüfen, und wurde daher nicht geöffnet.',
  tooManyTracks:
    'Dieses Modell ist zu groß, um es sicher anzuzeigen: Die Animationen ergeben {{value}} Tracks (Limit: {{limit}}).',
  tooLargeTotal:
    'Dieses Modell ist zu groß, um es sicher anzuzeigen: Es würde insgesamt {{value}} Speicher belegen (Limit: {{limit}}).',
  tooLargeLoaded: 'Dieses Modell ist größer als in der Datei angegeben ({{what}}) und wird daher nicht angezeigt.',
  loadingNewer: 'Zuletzt gespeicherte Version wird geladen…',
  tooManyTextures:
    'Dieses Modell ist zu groß, um es sicher anzuzeigen: Es enthält {{value}} Texturen (Limit: {{limit}}).',
  tooManyJoints:
    'Dieses Modell ist zu groß, um es sicher anzuzeigen: Ein Skin hat {{value}} Gelenke (Limit: {{limit}}).',
  imageTooLarge:
    'Dieses Modell ist zu groß, um es sicher anzuzeigen: Ein Bild ist {{width}} × {{height}} Pixel groß (Limit: {{limit}} pro Seite).',
  unreadableImage:
    'Bild {{index}} ist kein PNG-, JPEG-, WebP-, AVIF- oder KTX2-Bild, dessen Größe sich vor dem Dekodieren prüfen lässt. Das Modell wurde daher nicht geöffnet.',
  unreadableDraco:
    'Mesh {{index}} enthält Draco-Daten, deren Größe sich vor dem Dekodieren nicht prüfen lässt. Das Modell wurde daher nicht geöffnet.',
  externalBuffers:
    'Die Geometrie dieses Modells liegt in separaten Dateien ({{files}}), die Orca-Plugins nicht lesen können. Stattdessen eine .glb-Datei oder eine .gltf-Datei mit eingebetteten Daten öffnen.',
  externalImages:
    'Texturen in separaten Dateien ({{files}}) werden nicht angezeigt, da Orca-Plugins keine weiteren Dateien im Ordner des Modells lesen können. Mit einer .glb-Datei werden sie angezeigt.',
  externalTextures:
    'Texturen in separaten Dateien ({{files}}) werden nicht angezeigt, da Orca-Plugins keine weiteren Dateien im Ordner des Modells lesen können. Damit sie angezeigt werden, die Texturen in die Datei einbetten.',
  objMaterials:
    'Materialien aus einer separaten .mtl-Datei werden nicht angezeigt, da Orca-Plugins keine weiteren Dateien im Ordner des Modells lesen können.',
  assumedMeters: 'Dieses Format speichert keine Einheiten. Größen werden daher in Metern angezeigt.',
  fbxText:
    'Dies ist eine FBX-Datei im Textformat (ASCII), die der Viewer nicht lesen kann. Die Datei als binäres FBX exportieren.',
  fbxVersion:
    'Diese FBX-Datei hat die Version {{version}}; der Viewer liest FBX ab Version 7.0 (2011). Die Datei mit einem aktuellen Programm erneut exportieren.',
  usdCompressed: 'Dieses USDZ-Paket komprimiert seine Dateien. USDZ speichert sie unkomprimiert, daher öffnet der Viewer es nicht. Die Datei mit einem Programm, das USDZ schreibt, erneut exportieren.',
  usdAssumedCentimeters: 'Diese USD-Datei gibt keine Einheit an. Größen werden daher, wie bei USD vorgesehen, in Zentimetern angezeigt.',
  usdExternalLayers: 'Teile in separaten USD-Dateien ({{files}}) werden nicht angezeigt: Orca-Plugins können keine Dateien neben dem Modell lesen. Für die Anzeige die Dateien in eine .usdz packen.',
  usdExternalTextures: 'Texturen in separaten Dateien ({{files}}) werden nicht angezeigt: Orca-Plugins können keine Dateien neben dem Modell lesen. Für die Anzeige die Dateien in eine .usdz packen.',
  laterSaveFailed:
    'Die zuletzt gespeicherte Version konnte nicht angezeigt werden, daher wird weiter die vorherige angezeigt: {{reason}}',
  moreFiles: '{{list}} und {{count}} weitere',
  otherScenes: {
    one: 'Diese Datei enthält 1 weitere Szene; angezeigt wird die Standardszene.',
    other: 'Diese Datei enthält {{count}} weitere Szenen; angezeigt wird die Standardszene.'
  },
  resetView: 'Ansicht zurücksetzen',
  wireframe: 'Drahtgitter',
  wireframeTooLarge: 'Drahtgitter ist bei so großen Modellen nicht verfügbar',
  guides: 'Raster und Achsen',
  darkTheme: 'Dunkles Design',
  details: 'Details',
  detailsTitle: 'Details für ein Issue',
  detailsNote:
    'Versionen von Viewer und Browser, Grafik, letzte Ladevorgänge und etwaige Fehler. Keine Modelldaten, abgesehen von Zitaten in Fehlermeldungen.',
  copyDetails: 'Kopieren',
  copied: 'Kopiert',
  copyByHand: 'Kopieren war hier nicht möglich. Den Text markieren und manuell kopieren.',
  close: 'Schließen',
  playAnimation: 'Animation abspielen',
  pauseAnimation: 'Animation pausieren',
  animation: 'Animation',
  animationFallback: 'Animation {{index}}',
  allClips: 'Alle Clips',
  vertices: { one: '{{count}} Vertex', other: '{{count}} Vertices' },
  triangles: { one: '{{count}} Dreieck', other: '{{count}} Dreiecke' },
  points: { one: '{{count}} Punkt', other: '{{count}} Punkte' },
  lineSegments: { one: '{{count}} Liniensegment', other: '{{count}} Liniensegmente' },
  dimensionsTitle: 'Breite × Höhe × Tiefe',
  dimensions: '{{width}} × {{height}} × {{depth}} {{unit}}',
  gridCell: 'Raster {{size}}',
  viewportLabel: '3D-Modell: {{summary}}'
}
