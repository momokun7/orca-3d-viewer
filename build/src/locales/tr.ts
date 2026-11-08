import type { Messages } from '../messages.ts'

// Turkish UI text; see messages.ts for the English source.
export const TR: Messages = {
  loading: '3D model yükleniyor…',
  contextLost:
    '3D görünüm grafik sürücüsü tarafından sıfırlandı. Sürücü toparlandığında görünüm geri gelir; gelmezse dosyayı yeniden açın.',
  parseFailed:
    'Bu 3D model görüntülenemiyor. Model bozuk olabilir veya görüntüleyicinin desteklemediği bir özellik kullanıyor olabilir.',
  corrupt: 'Bu model bozuk: {{path}} {{reason}}.',
  corruptFile: 'Bu {{format}} dosyası bozuk: {{reason}}.',
  parseTimeout: 'Bu 3D modelin yüklenmesi çok uzun sürdüğü için yükleme durduruldu.',
  webglUnavailable:
    '3D görünüm için WebGL gerekiyor, ancak WebGL şu anda kullanılamıyor. Grafik hızlandırma kapalı olabilir veya GPU yanıt vermiyor olabilir.',
  renderFailed: 'Model okundu, ancak çizilemedi.',
  truncated:
    'Bu GLB dosyası eksik: başlığa göre {{declared}} bayt olması gerekirken yalnızca {{actual}} bayt var. Dosya hâlâ indiriliyor ya da kopyalanıyor olabilir; aktarım yarıda da kesilmiş olabilir.',
  unsupportedExtensions: 'Bu model, görüntüleyicinin desteklemediği glTF uzantıları gerektiriyor: {{extensions}}.',
  tooLargeGeometry:
    'Bu model güvenle görüntülenemeyecek kadar büyük: kodu çözüldüğünde köşe ve animasyon verileri {{value}} yer kaplayacak (sınır: {{limit}}).',
  tooLargeGpu:
    'Bu model güvenle görüntülenemeyecek kadar büyük: dokuları ve morph hedefleri {{value}} GPU belleği kaplayacak (sınır: {{limit}}).',
  tooManyNodes: 'Bu model güvenle görüntülenemeyecek kadar büyük: {{value}} düğüm içeriyor (sınır: {{limit}}).',
  tooManyDrawCalls:
    'Bu model güvenle görüntülenemeyecek kadar büyük: kare başına {{value}} çizim çağrısı gerektirecek (sınır: {{limit}}).',
  tooManyImages: 'Bu model güvenle görüntülenemeyecek kadar büyük: {{value}} görsel içeriyor (sınır: {{limit}}).',
  tooManyDrawnVertices:
    'Bu model güvenle görüntülenemeyecek kadar büyük: kare başına {{value}} köşe çizecek (sınır: {{limit}}).',
  tooManyMaterials: 'Bu model güvenle görüntülenemeyecek kadar büyük: {{value}} malzeme içeriyor (sınır: {{limit}}).',
  tooManyChannels:
    'Bu model güvenle görüntülenemeyecek kadar büyük: animasyonlarında {{value}} kanal var (sınır: {{limit}}).',
  tooComplex: 'Bu model, yüklenmeden önce denetlenemeyecek kadar karmaşık olduğu için açılmadı.',
  tooManyTracks:
    'Bu model güvenle görüntülenemeyecek kadar büyük: animasyonlarından {{value}} iz (track) oluşuyor (sınır: {{limit}}).',
  tooLargeTotal:
    'Bu model güvenle görüntülenemeyecek kadar büyük: toplamda {{value}} bellek kaplayacak (sınır: {{limit}}).',
  tooLargeLoaded: 'Bu model, dosyasında bildirilenden büyük çıktığı için ({{what}}) gösterilmiyor.',
  loadingNewer: 'Son kaydedilen sürüm yükleniyor…',
  tooManyTextures: 'Bu model güvenle görüntülenemeyecek kadar büyük: {{value}} doku içeriyor (sınır: {{limit}}).',
  tooManyJoints:
    'Bu model güvenle görüntülenemeyecek kadar büyük: bir skin içinde {{value}} kemik (joint) var (sınır: {{limit}}).',
  imageTooLarge:
    'Bu model güvenle görüntülenemeyecek kadar büyük: bir görsel {{width}} × {{height}} piksel (sınır: kenar başına {{limit}}).',
  unreadableImage:
    'Görsel {{index}}, boyutu kodu çözülmeden önce denetlenebilen biçimlerden (PNG, JPEG, WebP, AVIF, KTX2) birinde olmadığı için model açılmadı.',
  unreadableDraco:
    'Örgü {{index}}, kodu çözülmeden önce boyutu denetlenemeyen Draco verisi içerdiği için model açılmadı.',
  externalBuffers:
    'Bu model geometrisini ayrı dosyalarda ({{files}}) tutuyor ve Orca eklentileri bu dosyaları okuyamaz. Bir .glb dosyası veya verileri gömülü bir .gltf dosyası açın.',
  externalImages:
    'Ayrı dosyalardaki dokular ({{files}}) gösterilmiyor: Orca eklentileri modelin yanındaki dosyaları okuyamaz. Dokuları görmek için .glb kullanın.',
  externalTextures:
    'Ayrı dosyalardaki dokular ({{files}}) gösterilmiyor: Orca eklentileri modelin yanındaki dosyaları okuyamaz. Görmek için dokuları dosyaya gömün.',
  objMaterials: 'Ayrı bir .mtl dosyasındaki malzemeler gösterilmiyor: Orca eklentileri modelin yanındaki dosyaları okuyamaz.',
  assumedMeters: 'Bu biçim birim bilgisi içermediği için boyutlar metre olarak gösteriliyor.',
  fbxText: 'Bu, metin (ASCII) biçiminde bir FBX dosyası; görüntüleyici bu biçimi okuyamaz. Dosyayı ikili FBX olarak dışa aktarın.',
  fbxVersion:
    'Bu FBX dosyasının sürümü {{version}}; görüntüleyici FBX 7.0 (2011) ve sonrasını okur. Dosyayı güncel bir araçla yeniden dışa aktarın.',
  usdBinary: 'Bu USD dosyası ikili (USDC) biçimde ve görüntüleyici bu biçimi henüz okuyamıyor. Dosyayı USDA olarak ya da USDA içeren bir USDZ olarak dışa aktarın.',
  usdCompressed: 'Bu USDZ paketi dosyalarını sıkıştırıyor. USDZ dosyaları sıkıştırmadan sakladığı için görüntüleyici paketi açmaz. Dosyayı USDZ yazabilen bir araçla yeniden dışa aktarın.',
  usdAssumedCentimeters: 'Bu USD dosyasında birim belirtilmediği için boyutlar, USD kuralına göre santimetre cinsinden gösteriliyor.',
  usdExternalLayers: 'Ayrı USD dosyalarındaki parçalar ({{files}}) gösterilmiyor: Orca eklentileri modelin yanındaki dosyaları okuyamaz. Görmek için bunları bir .usdz içinde paketleyin.',
  usdExternalTextures: 'Ayrı dosyalardaki dokular ({{files}}) gösterilmiyor: Orca eklentileri modelin yanındaki dosyaları okuyamaz. Görmek için dokuları bir .usdz içinde paketleyin.',
  laterSaveFailed: 'Son kaydedilen sürüm gösterilemediği için önceki sürüm ekranda kalıyor: {{reason}}',
  moreFiles: '{{list}} ve {{count}} dosya daha',
  otherScenes: {
    one: 'Bu dosyada bir sahne daha var; varsayılan sahne gösteriliyor.',
    other: 'Bu dosyada {{count}} sahne daha var; varsayılan sahne gösteriliyor.'
  },
  resetView: 'Görünümü sıfırla',
  wireframe: 'Tel kafes',
  wireframeTooLarge: 'Bu kadar büyük bir modelde tel kafes kullanılamaz',
  guides: 'Izgara ve eksenler',
  darkTheme: 'Koyu tema',
  details: 'Ayrıntılar',
  detailsTitle: 'Sorun bildirimi için ayrıntılar',
  detailsNote:
    'Görüntüleyici ve tarayıcı sürümleri, grafik bilgileriniz, son yüklemeler ve hatalar. Hata mesajlarında geçenler dışında model verisi içermez.',
  copyDetails: 'Kopyala',
  copied: 'Kopyalandı',
  copyByHand: 'Buradan kopyalanamadı. Metni seçip elle kopyalayın.',
  close: 'Kapat',
  playAnimation: 'Animasyonu oynat',
  pauseAnimation: 'Animasyonu duraklat',
  animation: 'Animasyon',
  animationFallback: 'Animasyon {{index}}',
  allClips: 'Tüm klipler',
  vertices: { one: '{{count}} köşe', other: '{{count}} köşe' },
  triangles: { one: '{{count}} üçgen', other: '{{count}} üçgen' },
  points: { one: '{{count}} nokta', other: '{{count}} nokta' },
  lineSegments: { one: '{{count}} çizgi parçası', other: '{{count}} çizgi parçası' },
  dimensionsTitle: 'Genişlik × yükseklik × derinlik',
  dimensions: '{{width}} × {{height}} × {{depth}} {{unit}}',
  gridCell: 'Izgara {{size}}',
  viewportLabel: '3D model: {{summary}}'
}
