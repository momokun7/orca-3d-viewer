<div align="center">

[English](../../README.md) · [日本語](README.ja.md) · [Deutsch](README.de.md) · [Español](README.es.md) ·
[Français](README.fr.md) · [한국어](README.ko.md) · [Português](README.pt-BR.md) ·
[Русский](README.ru.md) · **Türkçe** · [简体中文](README.zh-Hans.md) ·
[繁體中文](README.zh-Hant.md)

# 3D Viewer for Orca

**3D modelleri düzenleyiciden çıkmadan görüntüleyin.**

[Orca](https://github.com/stablyai/orca) için GLB, glTF, STL, PLY, OBJ ve FBX dosyalarını açan salt okunur bir görüntüleyici.
Modeli her açıdan inceleyin, animasyonlarını oynatın ve beklediğiniz boyutta olup olmadığını bir bakışta görün.

[![CI](https://github.com/momokun7/orca-3d-viewer/actions/workflows/ci.yml/badge.svg)](https://github.com/momokun7/orca-3d-viewer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)
[![Orca](https://img.shields.io/badge/Orca-%E2%89%A5%201.4.248-black.svg)](https://github.com/stablyai/orca)
[![Permissions](https://img.shields.io/badge/permissions-none-brightgreen.svg)](#güvenlik)

[Hızlı başlangıç](#hızlı-başlangıç) · [Biçimler](#biçimler) · [Özellikler](#özellikler) · [Kurulum](#kurulum) · [Kullanım](#kullanım) ·
[Sorun giderme](#sorun-giderme) · [Güvenlik](#güvenlik) · [Geliştirme](#geliştirme) ·
[Hata bildir](https://github.com/momokun7/orca-3d-viewer/issues/new?template=bug_report.yml)

<img alt="Orca içinde 3D Viewer'da açılmış, zemin ızgarasının üzerinde duran Stanford Bunny; durum çubuğunda boyutu yazıyor: 156 × 154 × 121 mm" src="../images/hero.png" width="800">

</div>

## Hızlı başlangıç

1. Orca'da **Ayarlar → Eklentiler → Eklenti yükle**'yi açın, **Git URL'si** sekmesine `https://github.com/momokun7/orca-3d-viewer#v1.0.0` adresini yazın ve **Yükle**'ye tıklayın.
2. Bir `.glb`, `.gltf`, `.stl`, `.ply`, `.obj` veya `.fbx` dosyası açın.
3. Döndürmek için sürükleyin, yakınlaştırmak için fare tekerleğini çevirin.

Görüntüleyici hiçbir izin istemez. Ayrıntılar için [Kurulum](#kurulum) ve [Kullanım](#kullanım) bölümlerine bakın.

## Biçimler

Altı biçim, tek görüntüleyici.

<table>
  <tr>
    <td width="33%"><img alt="GLB biçiminde A Beautiful Game: cam ve metal taşlarıyla mermer bir satranç tahtası" src="../images/formats/glb.png"></td>
    <td width="33%"><img alt="Verileri gömülü glTF biçiminde Corset: işlemeli kumaş ve tokalar" src="../images/formats/gltf.png"></td>
    <td width="33%"><img alt="STL biçiminde 3DBenchy: 3D yazıcıların test edildiği küçük tekne, dosyada kayıtlı turuncu renkle" src="../images/formats/stl.png"></td>
  </tr>
  <tr>
    <td align="center"><b>GLB</b>: A Beautiful Game</td>
    <td align="center"><b>glTF</b>: Corset</td>
    <td align="center"><b>STL</b>: 3DBenchy</td>
  </tr>
  <tr>
    <td width="33%"><img alt="PLY biçiminde Stanford Armadillo: köşelerinde kayıtlı yeşil renkle gösterilen bir 3D tarama" src="../images/formats/ply.png"></td>
    <td width="33%"><img alt="OBJ biçiminde Utah Teapot, köşelerinde kayıtlı mor renkle" src="../images/formats/obj.png"></td>
    <td width="33%"><img alt="FBX biçiminde BoomBox, düğmeleri ve hoparlör ızgaralarıyla birlikte dokusu görünüyor" src="../images/formats/fbx.png"></td>
  </tr>
  <tr>
    <td align="center"><b>PLY</b>: Stanford Armadillo</td>
    <td align="center"><b>OBJ</b>: Utah Teapot</td>
    <td align="center"><b>FBX</b>: BoomBox</td>
  </tr>
</table>

| Biçim | Uzantılar | Renk ve doku | Animasyon | Boyut birimi | Notlar |
| --- | --- | --- | --- | --- | --- |
| glTF 2.0 | `.glb` `.gltf` | Var | Var | Metre (glTF standardı gereği) | `.gltf` dosyasında veriler gömülü olmalıdır |
| STL | `.stl` | Dosyada kayıtlı renkler, yoksa varsayılan renk | Yok | Milimetre (3D baskıdaki yaygın kullanım), Z ekseni yukarı | İkili ve metin |
| PLY | `.ply` | Köşe renkleri, yoksa varsayılan renk | Yok | Metre kabul edilir | İkili ve metin |
| OBJ | `.obj` | Köşe renkleri (`.mtl` okunamaz) | Yok | Metre kabul edilir | |
| FBX | `.fbx` | Yalnızca gömülü dokular | Var | Dosyada belirtilen birim | İkili FBX 7.0 (2011) ve sonrası |

Draco veya Meshopt ile sıkıştırılmış glTF dosyaları ve KTX2 / Basis Universal dokuları da açılabilir.

## Özellikler

### Her açıdan inceleme

<table>
  <tr>
    <td width="50%"><img alt="Sol fare tuşuyla sürükleyince kamera tavşanın etrafında döner" src="../images/features/orbit.gif"></td>
    <td width="50%"><img alt="Önce sağ tuşla, ardından Shift basılıyken sol tuşla sürükleyince görünüm yana kayar" src="../images/features/pan.gif"></td>
  </tr>
  <tr>
    <td align="center"><b>Döndürme</b>: sürükleyin</td>
    <td align="center"><b>Kaydırma</b>: sağ tuşla veya <kbd>Shift</kbd> basılıyken sürükleyin</td>
  </tr>
  <tr>
    <td width="50%"><img alt="Fare tekerleği çevrildikçe görünüm tavşana yaklaşıyor ve yeniden uzaklaşıyor" src="../images/features/zoom.gif"></td>
    <td width="50%"><img alt="Baş aşağı dönmüş görünüm, sıfırlama düğmesiyle başlangıçtaki hâline dönüyor" src="../images/features/reset.gif"></td>
  </tr>
  <tr>
    <td align="center"><b>Yakınlaştırma</b>: fare tekerleği</td>
    <td align="center"><b>Görünümü sıfırla</b>: araç çubuğundaki ilk düğme</td>
  </tr>
</table>

### Gerçek boyut

Zemin ızgarası, X / Y / Z eksenleri ve modelin genişlik × yükseklik × derinlik ölçüleri sayesinde yanlış birimle
hazırlanmış bir model hemen göze çarpar. Örneğin Stanford Bunny'nin genişliği 15,6 cm çıkar.

<img alt="10 mm'lik ızgaranın üzerindeki tavşan; durum çubuğunda önce 156 × 154 × 121 mm, ardından Izgara 10 mm yazıyor" src="../images/features/size.gif" width="600">

### Tel kafes, ızgara ve eksenler

Örgüyü (mesh) yalnızca çizgilerle gösterebilir, ızgarayı ve eksenleri gizleyebilirsiniz. Köşe ve üçgen sayıları
durum çubuğunda yazar.

<img alt="Tel kafes düğmesi tavşanın örgüsünü gösteriyor, ardından Izgara ve eksenler düğmesi zemin ızgarasını gizliyor" src="../images/features/inspect.gif" width="600">

### Animasyonlar

Animasyonu oynatıp duraklatabilir, modelde birden fazla klip varsa istediğinizi seçebilirsiniz.

<img alt="Tilki Survey klibini oynatıyor, klip menüsünden Run klibine geçiliyor, ardından animasyon duraklatılıp yeniden oynatılıyor" src="../images/features/animations.gif" width="600">

### Her zaman güncel

Dosyayı kaydettiğinizde görünüm, kamera açısını bozmadan yeni sürümü gösterir.

<img alt="Dosya Ctrl + S ile her kaydedildiğinde tavşan yerinden oynamadan renk değiştiriyor" src="../images/features/live.gif" width="600">

### Açık veya koyu tema

Görüntüleyici açık temayla açılır; araç çubuğundaki ay düğmesiyle koyu temaya geçip geri dönebilirsiniz. Son
seçtiğiniz tema, tel kafes ve ızgara ayarları Orca yeniden başlatıldıktan sonra da korunur (Orca 1.4.250 ve
sonrası).

<img alt="Araç çubuğundaki ay düğmesine tıklayınca görüntüleyici koyu temaya, yeniden tıklayınca açık temaya geçiyor" src="../images/features/theme.gif" width="600">

### On bir dil

Görüntüleyicinin arayüzü Orca'da seçili dili kullanır: English, 日本語, Deutsch, Español, Français, 한국어,
Português, Русский, Türkçe, 简体中文 ve 繁體中文.

### Issue'ya eklenecek ayrıntılar

Araç çubuğundaki **i** düğmesi (hata ekranında ise mesajın altındaki **Ayrıntılar** düğmesi) bir özet açar:
görüntüleyicinin sürümü, tarayıcınız ve grafik donanımınız, son yüklemeler ve ne kadar sürdükleri, karşılaşılan
hatalar. **Kopyala** ile alıp bir issue'ya yapıştırmanız, ne olduğunu anlatmaya yeter. Özette hiçbir model verisi
bulunmaz.

<img alt="Ayrıntılar paneli: görüntüleyicinin sürümü, tarayıcı, yükleme geçmişi ve bir dosyanın neden reddedildiği; altta Kopyala ve Kapat düğmeleri" src="../images/details.png" width="600">

## Kurulum

1. Orca'da **Ayarlar → Eklentiler** bölümünü açın ve **Eklenti yükle**'ye tıklayın.
2. **Git URL'si** sekmesine şu adresi yazın:

   ```text
   https://github.com/momokun7/orca-3d-viewer#v1.0.0
   ```

3. **Yükle**'ye tıklayın. Görüntüleyici hiçbir izin istemediği için onaylamanız gereken başka bir şey yoktur.

> [!IMPORTANT]
> Orca masaüstü uygulamasının 1.4.248 veya daha yeni bir sürümü gerekir.

## Kullanım

Bu biçimlerden birinde bir dosya açtığınızda model 3D olarak görüntülenir. `.gltf` ve `.obj` metin dosyası olduğu
için bunlarda düzenleyici sekmesinden **Kaynak** (metin) ile **3D** arasında geçiş yapabilirsiniz.

| İşlem | Nasıl yapılır |
| --- | --- |
| Döndürme | Sürükleyin |
| Kaydırma | Sağ tuşla veya <kbd>Shift</kbd> basılıyken sürükleyin ya da ok tuşlarını kullanın |
| Yakınlaştırma | Fare tekerleği |
| Görünümü sıfırla | Araç çubuğundaki ilk düğme |
| Tel kafes, ızgara ve eksenler | Hemen yanındaki düğmeler |
| Açık veya koyu tema | Ay düğmesi |
| Ayrıntılar | **i** düğmesi |
| Animasyonlar | Oynatma düğmesi ve klip menüsü (modelde animasyon varsa) |

## Sınırlamalar

> [!NOTE]
> Orca eklentileri yalnızca açık olan dosyayı okuyabilir, aynı klasördeki diğer dosyalara erişemez. Bu yüzden ayrı
> dosyalarda tutulan veriler gösterilemez: geometrisi ayrı bir `.bin` dosyasında duran `.gltf` açılmaz, ayrı görsel
> dosyalarındaki dokular ve OBJ'nin `.mtl` dosyası ise yok sayılır. `.glb` dosyaları, verileri gömülü `.gltf`
> dosyaları ve dokuları gömülü FBX dosyaları eksiksiz görüntülenir.

- **Yalnızca masaüstü uygulamasında çalışır.** Orca'yı tarayıcıda kullanıyorsanız dosya Kaynak görünümünde açılır.
- **En fazla 64 MiB.** Bu, Orca'nın özel düzenleyiciler için koyduğu sınırdır. Kodu çözüldüğünde güvenle
  tutulabilecek boyutu fazlasıyla aşacak ya da görüntüleyicinin okuyamadığı bir özellik kullanan modeller, nedenini
  açıklayan bir mesajla reddedilir.
- **Eski FBX sürümleri ve metin biçimli FBX desteklenmez.** Dosyayı ikili FBX 7.0 veya sonrası olarak yeniden
  dışa aktarın.

Khronos'un [glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets) koleksiyonundaki 152 GLB ve
verileri gömülü glTF modelinin tamamı denendi: three.js'in desteklemediği bir uzantı gerektiren üç model dışında
hepsi sorunsuz açılıyor.

## Sorun giderme

<details>
<summary>Dosya 3D yerine metin olarak açılıyor</summary>

`.gltf` ve `.obj` metin dosyası olduğundan Kaynak (metin) görünümünde açılabilir. Düzenleyici sekmesinden **3D**'yi
seçin. Orca tarayıcıda kullanılırken 3D görünüm kullanılamaz.

</details>

<details>
<summary>Dokular veya renkler eksik</summary>

Eklentiler ayrı görsel dosyalarındaki dokuları okuyamaz; okunamayan dosyaların adları durum çubuğunda gösterilir.
glTF için `.glb` kullanın, FBX'i ise dokuları gömülü olacak şekilde dışa aktarın. OBJ'nin `.mtl` dosyası
okunamadığından model, varsa köşe renkleriyle, yoksa varsayılan bir renkle gösterilir.

</details>

<details>
<summary>Boyut yanlış görünüyor</summary>

Bu biçimler birim bilgisi tutmadığı için STL dosyaları milimetre, PLY ve OBJ dosyaları ise metre kabul edilir. FBX
ve glTF'de dosyada belirtilen birim kullanılır. Boyut 1000 ya da 100 kat farklı çıkıyorsa modelin hangi birimle
dışa aktarıldığını kontrol edin.

</details>

<details>
<summary>Modelin açılamadığı söyleniyor</summary>

Nedeni mesajda yazar. Çok büyük modeller, bozuk dosyalar ve görüntüleyicinin desteklemediği özellikleri kullanan
modeller daha açılmadan reddedilir. Neden anlaşılmıyorsa **Ayrıntılar** metnini kopyalayıp bir issue'ya
yapıştırın.

</details>

<details>
<summary>Hata bildirme</summary>

[Hata bildirimi](https://github.com/momokun7/orca-3d-viewer/issues/new?template=bug_report.yml) şablonunu kullanın
ve **Ayrıntılar** metnini yapıştırın. Modeli paylaşabiliyorsanız nereden edindiğinizi de belirtin. Güvenlik
sorunlarını issue olarak açmayın; [gizli bir bildirimle](https://github.com/momokun7/orca-3d-viewer/security/advisories/new)
iletin.

</details>

## Güvenlik

Açılan her model güvenilmeyen bir girdidir. Bu yüzden görüntüleyici, saldırganın işine yarayacak hiçbir şey
sunmayacak kadar sade tasarlanmıştır.

- **Yalıtılmış**: Orca'nın yalıtılmış eklenti çerçevesinde, katı bir Content-Security-Policy altında ve ağ
  erişimi olmadan çalışır.
- **İzin yok**: manifest hiçbir yetenek istemez; worker yok, komut yok, dosya erişimi yok.
- **Salt okunur**: belgeyi hiçbir zaman düzenlemez veya kaydetmez; modelin içindeki URI'ler de hiçbir zaman bir
  yükleyiciye ulaşmaz.
- **Önce denetim**: hiçbir şeyin kodu çözülmeden önce, her biçim ayrı bir iş parçacığında boyut sınırlarına göre
  denetlenir. FBX'in sıkıştırılmış dizileri küçük adımlarla açılır ve bildirilen boyutu aştığı anda işlem durdurulur.
- **Test edilmiş**: CI, görüntüleyiciyi Orca'nın çerçeve politikası altında kötü amaçlı ve fuzzing ile üretilmiş
  modellerle çalıştırır; commit edilmiş paketin kaynak koddan birebir yeniden üretilebildiğini de denetler.

Ayrıntılar için [SECURITY.md](../../SECURITY.md) dosyasına bakın.

## Geliştirme

Eklentinin kaynak kodu `build/src` klasöründedir. `build/build.mjs` bu kodu `editor/` klasörüne paketler. Orca'nın
eklentiyi derleme adımı olmadan yükleyebilmesi için `editor/` da depoya commit edilir.

```sh
cd build
npm ci
npm test
npm run typecheck
npm run build
```

[mise](https://mise.jdx.dev) kullanıyorsanız `mise run check` CI'daki tüm kontrolleri çalıştırır; diğer görevleri
`mise tasks` ile listeleyebilirsiniz.

Değişikliklerinizi Orca'da denemek için depo kökünde `orca plugin dev watch .` komutunu çalıştırın ya da klasörü
**Ayarlar → Eklentiler → Geliştirme** bölümüne ekleyin.

## Katkıda bulunma

Issue'lar, etiketler, proje panosu, kilometre taşları ve pull request'lerle ilgili her şey
[CONTRIBUTING.md](../../CONTRIBUTING.md) dosyasında anlatılıyor. İngilizce ve Japonca dışındaki çevirilerin
taslağı makineyle hazırlandı; anadili bu dillerden biri olanların düzeltmelerini memnuniyetle bekliyoruz.

## Lisans ve emeği geçenler

[MIT](../../LICENSE). Pakete dahil edilen three.js, meshoptimizer, fflate ve Lucide (MIT / ISC) ile Draco kod
çözücüsü (Apache-2.0) kendi lisanslarına tabidir; bkz. [THIRD_PARTY_NOTICES.txt](../../THIRD_PARTY_NOTICES.txt).

Görsellerdeki ve GIF'lerdeki modeller aşağıdaki kaynaklardan alınmıştır. Tüm kopyalarda biçim dönüştürme, renkler
(3DBenchy, Armadillo ve Teapot'un renklerini dosyaya biz yazdık) ve yönlendirme bize aittir.

| Model | Kullanıldığı yer | Kaynak | Lisans |
| --- | --- | --- | --- |
| Stanford Bunny | Ana görsel, özellik GIF'leri | [Stanford 3D Scanning Repository](https://graphics.stanford.edu/data/3Dscanrep/). Source: Stanford University Computer Graphics Laboratory | Kaynak gösterilmek koşuluyla ticari olmayan kullanım için ücretsiz |
| Stanford Armadillo | PLY | Yukarıdakiyle aynı | Yukarıdakiyle aynı |
| A Beautiful Game | GLB | Khronos [glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets). Özgün model: MaterialX Project, glTF'e dönüştürme: Ed Mackey | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Corset | glTF | Khronos glTF Sample Assets, Microsoft | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| BoomBox | FBX | Khronos glTF Sample Assets, Microsoft | CC0 1.0 |
| 3DBenchy | STL | [3DBenchy.com](https://www.3dbenchy.com/), Creative Tools | CC0 1.0 |
| Utah Teapot | OBJ | [McGuire Computer Graphics Archive](https://casual-effects.com/data), Martin Newell (1975), Kenzie Lamar | CC0 |
| Fox | Animasyon GIF'i | Khronos glTF Sample Assets. Model: PixelMannen (CC0 1.0), rig ve animasyon: tomkranis, glTF'e dönüştürme: @AsoboStudio ve @scurest | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
