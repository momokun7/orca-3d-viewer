// German UI text; see messages.ts for the English source.
import type { Messages } from '../messages.ts'

export const DE: Messages = {
  loading: '3D-Modell wird geladen…',
  contextLost:
    'Die 3D-Ansicht wurde vom Grafiktreiber zurückgesetzt. Sie erscheint wieder, sobald sich der Treiber erholt hat; andernfalls die Datei erneut öffnen.',
  parseFailed:
    'Dieses 3D-Modell kann nicht angezeigt werden. Es ist möglicherweise beschädigt oder verwendet eine Funktion, die der Viewer nicht unterstützt.',
  corrupt: 'Dieses Modell ist beschädigt: {{path}} {{reason}}.',
  corruptFile: 'Diese {{format}}-Datei ist beschädigt: {{reason}}.',
  parseTimeout: 'Das Laden dieses 3D-Modells hat zu lange gedauert und wurde abgebrochen.',
  webglUnavailable:
    'Diese 3D-Ansicht benötigt WebGL, das gerade nicht verfügbar ist. Möglicherweise ist die Grafikbeschleunigung deaktiviert oder die GPU reagiert nicht mehr.',
  renderFailed: 'Das Modell wurde gelesen, konnte aber nicht dargestellt werden.',
  truncated:
    'Diese GLB-Datei ist unvollständig: Sie enthält {{actual}} der {{declared}} Bytes, die ihr Header angibt. Möglicherweise wird sie noch heruntergeladen oder kopiert, oder die Übertragung wurde unterbrochen.',
  unsupportedExtensions: 'Dieses Modell benötigt glTF-Erweiterungen, die der Viewer nicht unterstützt: {{extensions}}.',
  tooLargeGeometry:
    'Dieses Modell ist zu groß für eine sichere Anzeige: Es würde zu {{value}} Vertex- und Animationsdaten dekodiert (Limit: {{limit}}).',
  tooLargeGpu:
    'Dieses Modell ist zu groß für eine sichere Anzeige: Seine Texturen und Morph-Targets würden {{value}} GPU-Speicher belegen (Limit: {{limit}}).',
  tooManyNodes: 'Dieses Modell ist zu groß für eine sichere Anzeige: Es hat {{value}} Knoten (Limit: {{limit}}).',
  tooManyDrawCalls:
    'Dieses Modell ist zu groß für eine sichere Anzeige: Es würde {{value}} Draw Calls pro Frame erfordern (Limit: {{limit}}).',
  tooManyImages: 'Dieses Modell ist zu groß für eine sichere Anzeige: Es hat {{value}} Bilder (Limit: {{limit}}).',
  tooManyDrawnVertices:
    'Dieses Modell ist zu groß für eine sichere Anzeige: Es würde {{value}} Vertices pro Frame zeichnen (Limit: {{limit}}).',
  tooManyMaterials:
    'Dieses Modell ist zu groß für eine sichere Anzeige: Es hat {{value}} Materialien (Limit: {{limit}}).',
  tooManyChannels:
    'Dieses Modell ist zu groß für eine sichere Anzeige: Seine Animationen haben {{value}} Kanäle (Limit: {{limit}}).',
  tooComplex: 'Dieses Modell ist zu komplex, um es vor dem Laden zu prüfen, daher wurde es nicht geöffnet.',
  tooManyTracks:
    'Dieses Modell ist zu groß für eine sichere Anzeige: Seine Animationen erzeugen {{value}} Tracks (Limit: {{limit}}).',
  tooLargeTotal:
    'Dieses Modell ist zu groß für eine sichere Anzeige: Es würde insgesamt {{value}} Speicher belegen (Limit: {{limit}}).',
  tooLargeLoaded: 'Dieses Modell ist größer als in seiner Datei angegeben ({{what}}) und wird daher nicht angezeigt.',
  loadingNewer: 'Neueste gespeicherte Version wird geladen…',
  tooManyTextures: 'Dieses Modell ist zu groß für eine sichere Anzeige: Es hat {{value}} Texturen (Limit: {{limit}}).',
  tooManyJoints:
    'Dieses Modell ist zu groß für eine sichere Anzeige: Ein Skin hat {{value}} Gelenke (Limit: {{limit}}).',
  imageTooLarge:
    'Dieses Modell ist zu groß für eine sichere Anzeige: Ein Bild ist {{width}} × {{height}} Pixel groß (Limit: {{limit}} pro Seite).',
  unreadableImage:
    'Bild {{index}} ist kein PNG-, JPEG-, WebP-, AVIF- oder KTX2-Bild, dessen Größe sich vor dem Dekodieren prüfen lässt, daher wurde das Modell nicht geöffnet.',
  unreadableDraco:
    'Mesh {{index}} enthält Draco-Daten, deren Größe sich vor dem Dekodieren nicht prüfen lässt, daher wurde das Modell nicht geöffnet.',
  externalBuffers:
    'Dieses Modell speichert seine Geometrie in separaten Dateien ({{files}}), die Orca-Plugins nicht lesen können. Eine .glb-Datei oder eine .gltf-Datei mit eingebetteten Daten öffnen.',
  externalImages:
    'Texturen in separaten Dateien ({{files}}) werden nicht angezeigt: Orca-Plugins können keine Dateien neben dem Modell lesen. Zum Anzeigen eine .glb-Datei verwenden.',
  externalTextures:
    'Texturen in separaten Dateien ({{files}}) werden nicht angezeigt: Orca-Plugins können keine Dateien neben dem Modell lesen. Zum Anzeigen die Texturen in die Datei einbetten.',
  objMaterials:
    'Materialien in einer separaten .mtl-Datei werden nicht angezeigt: Orca-Plugins können keine Dateien neben dem Modell lesen.',
  assumedMeters: 'Dieses Format hat keine Einheiten, daher werden Größen in Metern angezeigt.',
  fbxText:
    'Dies ist eine FBX-Datei im Textformat (ASCII), die der Viewer nicht liest. Als binäre FBX-Datei exportieren.',
  fbxVersion:
    'Diese FBX-Datei hat Version {{version}}; der Viewer liest FBX 7.0 (2011) und neuer. Mit einem aktuellen Werkzeug erneut exportieren.',
  laterSaveFailed:
    'Die neueste gespeicherte Version konnte nicht angezeigt werden, daher bleibt die vorherige sichtbar: {{reason}}',
  moreFiles: '{{list}} und {{count}} weitere',
  otherScenes: {
    one: 'Diese Datei enthält 1 weitere Szene; die Standardszene wird angezeigt.',
    other: 'Diese Datei enthält {{count}} weitere Szenen; die Standardszene wird angezeigt.'
  },
  resetView: 'Ansicht zurücksetzen',
  wireframe: 'Drahtgitter',
  wireframeTooLarge: 'Drahtgitter ist für ein so großes Modell nicht verfügbar',
  guides: 'Raster und Achsen',
  darkTheme: 'Dunkles Design',
  details: 'Details',
  detailsTitle: 'Details für einen Issue-Bericht',
  detailsNote:
    'Viewer- und Browserversion, Grafik, letzte Ladevorgänge und etwaige Fehler. Keine Modelldaten, außer was eine Fehlermeldung zitiert.',
  copyDetails: 'Kopieren',
  copied: 'Kopiert',
  copyByHand: 'Kopieren ist hier nicht möglich. Den Text markieren und kopieren.',
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
