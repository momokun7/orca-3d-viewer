import type { Messages } from '../messages.ts'

// Turkish UI text; see messages.ts for the English source.
export const TR: Messages = {
  loading: '3D model yükleniyor…',
  contextLost:
    '3D görünüm grafik sürücüsü tarafından sıfırlandı. Sürücü düzeldiğinde geri gelir; gelmezse dosyayı yeniden açın.',
  parseFailed:
    'Bu 3D model görüntülenemiyor. Bozuk olabilir veya görüntüleyicinin desteklemediği bir özellik kullanıyor olabilir.',
  corrupt: 'Bu model bozuk: {{path}} {{reason}}.',
  corruptFile: 'Bu {{format}} dosyası bozuk: {{reason}}.',
  parseTimeout: 'Bu 3D modelin yüklenmesi çok uzun sürdü, bu yüzden yükleme durduruldu.',
  webglUnavailable:
    'Bu 3D görünüm için WebGL gerekiyor, ancak şu anda kullanılamıyor. Grafik hızlandırma kapalı olabilir veya GPU yanıt vermeyi bırakmış olabilir.',
  renderFailed: 'Model okundu, ancak çizilemedi.',
  truncated:
    'Bu GLB dosyası eksik: başlığında bildirilen {{declared}} bayttan yalnızca {{actual}} bayt var. Hâlâ indiriliyor veya kopyalanıyor olabilir ya da aktarım yarıda kesilmiş olabilir.',
  unsupportedExtensions: 'Bu model, görüntüleyicinin desteklemediği glTF uzantıları gerektiriyor: {{extensions}}.',
  tooLargeGeometry:
    'Bu model güvenle görüntülenemeyecek kadar büyük: açıldığında köşe ve animasyon verisi {{value}} yer kaplayacak (sınır: {{limit}}).',
  tooLargeGpu:
    'Bu model güvenle görüntülenemeyecek kadar büyük: dokuları ve morph hedefleri {{value}} GPU belleği kullanacak (sınır: {{limit}}).',
  tooManyNodes: 'Bu model güvenle görüntülenemeyecek kadar büyük: {{value}} düğümü var (sınır: {{limit}}).',
  tooManyDrawCalls:
    'Bu model güvenle görüntülenemeyecek kadar büyük: kare başına {{value}} çizim çağrısı gerektirecek (sınır: {{limit}}).',
  tooManyImages: 'Bu model güvenle görüntülenemeyecek kadar büyük: {{value}} görseli var (sınır: {{limit}}).',
  tooManyDrawnVertices:
    'Bu model güvenle görüntülenemeyecek kadar büyük: kare başına {{value}} köşe çizecek (sınır: {{limit}}).',
  tooManyMaterials: 'Bu model güvenle görüntülenemeyecek kadar büyük: {{value}} malzemesi var (sınır: {{limit}}).',
  tooManyChannels:
    'Bu model güvenle görüntülenemeyecek kadar büyük: animasyonlarında {{value}} kanal var (sınır: {{limit}}).',
  tooComplex: 'Bu model, yüklenmeden önce denetlenemeyecek kadar karmaşık, bu yüzden açılmadı.',
  tooManyTracks:
    'Bu model güvenle görüntülenemeyecek kadar büyük: animasyonları {{value}} iz oluşturuyor (sınır: {{limit}}).',
  tooLargeTotal:
    'Bu model güvenle görüntülenemeyecek kadar büyük: toplamda {{value}} bellek kullanacak (sınır: {{limit}}).',
  tooLargeLoaded: 'Bu model, dosyasında bildirilenden büyük çıktı ({{what}}), bu yüzden gösterilmiyor.',
  loadingNewer: 'Son kayıt yükleniyor…',
  tooManyTextures: 'Bu model güvenle görüntülenemeyecek kadar büyük: {{value}} dokusu var (sınır: {{limit}}).',
  tooManyJoints:
    'Bu model güvenle görüntülenemeyecek kadar büyük: bir skin içinde {{value}} eklem var (sınır: {{limit}}).',
  imageTooLarge:
    'Bu model güvenle görüntülenemeyecek kadar büyük: bir görsel {{width}} × {{height}} piksel (sınır: kenar başına {{limit}}).',
  unreadableImage:
    'Görsel {{index}}, kodu çözülmeden önce boyutu denetlenebilen bir PNG, JPEG, WebP, AVIF veya KTX2 görseli değil, bu yüzden model açılmadı.',
  unreadableDraco:
    'Örgü {{index}}, kodu çözülmeden önce boyutu denetlenemeyen Draco verisi içeriyor, bu yüzden model açılmadı.',
  externalBuffers:
    'Bu model geometrisini ayrı dosyalarda ({{files}}) tutuyor ve Orca eklentileri bu dosyaları okuyamaz. Bir .glb veya verileri gömülü bir .gltf açın.',
  externalImages:
    'Ayrı dosyalardaki dokular ({{files}}) gösterilmiyor: Orca eklentileri modelin yanındaki dosyaları okuyamaz. Görmek için bir .glb kullanın.',
  externalTextures:
    'Ayrı dosyalardaki dokular ({{files}}) gösterilmiyor: Orca eklentileri modelin yanındaki dosyaları okuyamaz. Görmek için onları dosyaya gömün.',
  objMaterials: 'Ayrı bir .mtl dosyasındaki malzemeler gösterilmiyor: Orca eklentileri modelin yanındaki dosyaları okuyamaz.',
  assumedMeters: 'Bu biçimde birim yok, bu yüzden boyutlar metre olarak gösteriliyor.',
  fbxText: 'Bu bir metin (ASCII) FBX dosyası ve görüntüleyici bunu okumaz. İkili FBX olarak dışa aktarın.',
  fbxVersion:
    'Bu FBX dosyasının sürümü: {{version}}. Görüntüleyici FBX 7.0 (2011) ve sonrasını okur. Güncel bir araçla yeniden dışa aktarın.',
  laterSaveFailed: 'Son kayıt gösterilemedi, bu yüzden önceki kayıt ekranda kalıyor: {{reason}}',
  moreFiles: '{{list}} ve {{count}} tane daha',
  otherScenes: {
    one: 'Bu dosyada {{count}} sahne daha var; varsayılan sahne gösteriliyor.',
    other: 'Bu dosyada {{count}} sahne daha var; varsayılan sahne gösteriliyor.'
  },
  resetView: 'Görünümü sıfırla',
  wireframe: 'Tel kafes',
  wireframeTooLarge: 'Bu kadar büyük bir model için tel kafes kullanılamaz',
  guides: 'Izgara ve eksenler',
  darkTheme: 'Koyu tema',
  details: 'Ayrıntılar',
  detailsTitle: 'Sorun bildirimi için ayrıntılar',
  detailsNote:
    'Görüntüleyici ve tarayıcı sürümleri, grafik bilgileriniz, son yüklemeler ve hatalar. Bir hata mesajında alıntılananlar dışında model verisi yok.',
  copyDetails: 'Kopyala',
  copied: 'Kopyalandı',
  copyByHand: 'Burada kopyalanamadı. Metni seçip kopyalayın.',
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
