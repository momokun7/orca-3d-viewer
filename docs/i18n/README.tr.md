<div align="center">

[English](../../README.md) · [日本語](README.ja.md) · [Deutsch](README.de.md) · [Español](README.es.md) ·
[Français](README.fr.md) · [한국어](README.ko.md) · [Português](README.pt-BR.md) ·
[Русский](README.ru.md) · **Türkçe** · [简体中文](README.zh-Hans.md) ·
[繁體中文](README.zh-Hant.md)

# 3D Viewer for Orca

**Düzenleyiciden çıkmadan 3D modellere bakın.**

[Orca](https://github.com/stablyai/orca) için GLB, glTF, STL, PLY, OBJ ve FBX açan, salt okunur bir görüntüleyici.
Modelin etrafında dönün, animasyonlarını oynatın ve modelin düşündüğünüz boyutta olup olmadığını bir bakışta görün.

[![CI](https://github.com/momokun7/orca-3d-viewer/actions/workflows/ci.yml/badge.svg)](https://github.com/momokun7/orca-3d-viewer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)
[![Orca](https://img.shields.io/badge/Orca-%E2%89%A5%201.4.248-black.svg)](https://github.com/stablyai/orca)
[![Permissions](https://img.shields.io/badge/permissions-none-brightgreen.svg)](#güvenlik)

[Hızlı başlangıç](#hızlı-başlangıç) · [Biçimler](#biçimler) · [Özellikler](#özellikler) · [Kurulum](#kurulum) · [Kullanım](#kullanım) ·
[Sorun giderme](#sorun-giderme) · [Güvenlik](#güvenlik) · [Geliştirme](#geliştirme) ·
[Hata bildir](https://github.com/momokun7/orca-3d-viewer/issues/new?template=bug_report.yml)

<img alt="Orca içindeki 3D Viewer'da, zemin ızgarası üzerinde oturan Stanford Bunny; durum çubuğunda boyutu, 156 × 154 × 121 mm" src="../images/hero.png" width="800">

</div>

## Hızlı başlangıç

1. Orca'da **Ayarlar → Eklentiler → Eklenti yükle**'yi açın, **Git URL'si** sekmesine `https://github.com/momokun7/orca-3d-viewer#v1.0.0` adresini girin ve **Yükle**'yi seçin.
2. `.glb`, `.gltf`, `.stl`, `.ply`, `.obj`, `.fbx` dosyalarından birini açın.
3. Döndürmek için sürükleyin, yakınlaştırmak için tekerleği kullanın.

Hiçbir izin istemez. Ayrıntılar için [Kurulum](#kurulum) ve [Kullanım](#kullanım) bölümlerine bakın.

## Biçimler

Tek görüntüleyici, altı biçim.

<table>
  <tr>
    <td width="33%"><img alt="GLB olarak A Beautiful Game: cam ve metal taşlı mermer bir satranç tahtası" src="../images/formats/glb.png"></td>
    <td width="33%"><img alt="Verileri gömülü glTF olarak Corset: işlemeli kumaş ve tokalar" src="../images/formats/gltf.png"></td>
    <td width="33%"><img alt="STL olarak 3DBenchy: 3D yazıcıları denemek için kullanılan küçük tekne, dosyada saklanan turuncu renkte" src="../images/formats/stl.png"></td>
  </tr>
  <tr>
    <td align="center"><b>GLB</b>: A Beautiful Game</td>
    <td align="center"><b>glTF</b>: Corset</td>
    <td align="center"><b>STL</b>: 3DBenchy</td>
  </tr>
  <tr>
    <td width="33%"><img alt="PLY olarak Stanford Armadillo: bir 3D tarama, köşelerinde saklanan yeşil renkte" src="../images/formats/ply.png"></td>
    <td width="33%"><img alt="OBJ olarak Utah Teapot, köşelerinde saklanan mor renkte" src="../images/formats/obj.png"></td>
    <td width="33%"><img alt="FBX olarak BoomBox, düğmelerinin ve hoparlör ızgaralarının dokusuyla" src="../images/formats/fbx.png"></td>
  </tr>
  <tr>
    <td align="center"><b>PLY</b>: Stanford Armadillo</td>
    <td align="center"><b>OBJ</b>: Utah Teapot</td>
    <td align="center"><b>FBX</b>: BoomBox</td>
  </tr>
</table>

| Biçim | Uzantılar | Renkler ve dokular | Animasyon | Boyut birimi | Notlar |
| --- | --- | --- | --- | --- | --- |
| glTF 2.0 | `.glb` `.gltf` | Evet | Evet | Metre (glTF'in tanımladığı gibi) | Bir `.gltf` verilerini gömülü tutmalıdır |
| STL | `.stl` | Dosyada saklanan renkler, yoksa varsayılan renk | Hayır | Milimetre (3D baskı geleneği), Z yukarı | İkili ve metin |
| PLY | `.ply` | Köşe renkleri, yoksa varsayılan renk | Hayır | Metre olarak gösterilir | İkili ve metin |
| OBJ | `.obj` | Köşe renkleri (`.mtl` okunamaz) | Hayır | Metre olarak gösterilir | |
| FBX | `.fbx` | Yalnızca gömülü dokular | Evet | Dosyanın belirttiği birim | İkili FBX 7.0 (2011) ve sonrası |

Draco veya Meshopt ile sıkıştırılmış glTF ve KTX2 / Basis Universal dokuları da açılır.

## Özellikler

### Etrafa bakın

<table>
  <tr>
    <td width="50%"><img alt="Sol fare düğmesiyle sürüklemek kamerayı tavşanın etrafında döndürür" src="../images/features/orbit.gif"></td>
    <td width="50%"><img alt="Sağ tuşla sürüklemek, ardından Shift ile sol tuşla sürüklemek görünümü yana kaydırır" src="../images/features/pan.gif"></td>
  </tr>
  <tr>
    <td align="center"><b>Döndürme</b>: sürükleme</td>
    <td align="center"><b>Kaydırma</b>: sağ tuşla sürükleme veya <kbd>Shift</kbd> + sürükleme</td>
  </tr>
  <tr>
    <td width="50%"><img alt="Fare tekerleğini çevirmek tavşana yaklaştırır ve yeniden uzaklaştırır" src="../images/features/zoom.gif"></td>
    <td width="50%"><img alt="Baş aşağı dönmüş bir görünüm, sıfırlama düğmesiyle başlangıç görünümüne döner" src="../images/features/reset.gif"></td>
  </tr>
  <tr>
    <td align="center"><b>Yakınlaştırma</b>: tekerlek</td>
    <td align="center"><b>Görünümü sıfırla</b>: araç çubuğundaki ilk düğme</td>
  </tr>
</table>

### Gerçek boyut

Zemin ızgarası, X / Y / Z eksenleri ve modelin genişlik × yükseklik × derinliği sayesinde yanlış birimle hazırlanmış
bir model hemen göze çarpar. Stanford Bunny 15,6 cm genişliğinde çıkar.

<img alt="10 mm'lik ızgara üzerindeki tavşan; durum çubuğunda 156 × 154 × 121 mm, ardından Izgara 10 mm yazar" src="../images/features/size.gif" width="600">

### Tel kafes, ızgara ve eksenler

Örgüyü yalnızca çizgiler olarak gösterin veya ızgarayı ve eksenleri gizleyin. Köşe ve üçgen sayıları durum
çubuğunda yer alır.

<img alt="Tel kafes düğmesi tavşanın örgüsünü gösterir, ardından Izgara ve eksenler düğmesi zemin ızgarasını gizler" src="../images/features/inspect.gif" width="600">

### Animasyonlar

Oynatın ve duraklatın; modelde birden fazla klip varsa birini seçin.

<img alt="Bir tilki Survey klibini oynatır, klip menüsünden Run'a geçer, sonra duraklar ve yeniden oynar" src="../images/features/animations.gif" width="600">

### Hep güncel

Dosyayı kaydedin; görünüm, kameranızı olduğu yerde tutarak yeni sürümü gösterir.

<img alt="Dosya Ctrl + S ile her kaydedildiğinde tavşan yerinde renk değiştirir" src="../images/features/live.gif" width="600">

### Açık veya koyu

Görüntüleyici açık temayla açılır; araç çubuğundaki ay düğmesi koyu temaya geçirir ve geri döndürür. Son seçtiğiniz
temayı, tel kafesi ve ızgarayı Orca yeniden başlatıldıktan sonra da hatırlar (Orca 1.4.250 ve sonrası).

<img alt="Araç çubuğundaki ay düğmesine tıklamak görüntüleyiciyi koyu yapar, yeniden tıklamak açık yapar" src="../images/features/theme.gif" width="600">

### On bir dil

Görüntüleyicinin metinleri Orca'nın dilini izler: English, 日本語, Deutsch, Español, Français, 한국어, Português,
Русский, Türkçe, 简体中文 ve 繁體中文.

### Bir issue'ya yapıştırılacak ayrıntılar

Araç çubuğundaki **i** düğmesi (hata ekranında, mesajın altındaki **Ayrıntılar** düğmesi) bir özet açar:
görüntüleyicinin sürümü, tarayıcınız ve grafik bilgileriniz, son yüklemeler ve ne kadar sürdükleri, karşılaşılan
hatalar. **Kopyala** ile bir issue'ya yapıştırın; ne olduğunu anlatır. Hiçbir model verisi içermez.

<img alt="Ayrıntılar paneli: görüntüleyicinin sürümü, tarayıcı, yükleme geçmişi ve bir dosyanın reddedilme nedeni, Kopyala ve Kapat düğmeleriyle" src="../images/details.png" width="600">

## Kurulum

1. Orca'da **Ayarlar → Eklentiler**'i açın ve **Eklenti yükle**'yi seçin.
2. **Git URL'si** sekmesine şunu girin:

   ```text
   https://github.com/momokun7/orca-3d-viewer#v1.0.0
   ```

3. **Yükle**'yi seçin. Görüntüleyici hiçbir izin istemez, bu yüzden verilecek başka bir şey yoktur.

> [!IMPORTANT]
> Orca masaüstü uygulamasının 1.4.248 veya sonraki bir sürümü gerekir.

## Kullanım

Bu biçimlerden herhangi birindeki bir dosyayı açın, 3D olarak görünür. `.gltf` ve `.obj` metin dosyaları olduğu için
düzenleyici sekmesi **Kaynak** (metin) ile **3D** arasında geçiş yapar.

| Eylem | Nasıl |
| --- | --- |
| Döndürme | Sürükleme |
| Kaydırma | Sağ tuşla sürükleme, <kbd>Shift</kbd> + sürükleme veya ok tuşları |
| Yakınlaştırma | Tekerlek |
| Görünümü sıfırla | Araç çubuğundaki ilk düğme |
| Tel kafes, ızgara ve eksenler | Yanındaki düğmeler |
| Açık veya koyu | Ay düğmesi |
| Ayrıntılar | **i** düğmesi |
| Animasyonlar | Modelde animasyon varsa oynatma düğmesi ve klip menüsü |

## Sınırlamalar

> [!NOTE]
> Orca eklentileri yalnızca açık dosyayı okur, klasöründeki diğer dosyaları asla okumaz; bu yüzden ayrı dosyalarda
> tutulan veriler gösterilemez. Geometrisi ayrı bir `.bin` dosyasında olan bir `.gltf` açılmaz; ayrı görsel
> dosyalarındaki dokular ve bir OBJ'nin `.mtl` dosyası dışarıda kalır. Bir `.glb`, verileri gömülü bir `.gltf` veya
> dokuları gömülü bir FBX her şeyi gösterir.

- **Yalnızca masaüstü uygulaması.** Tarayıcıdaki Orca'da dosya Kaynak görünümünde açılır.
- **En fazla 64 MiB**, Orca'nın özel düzenleyiciler için sınırı. Kodu çözüldüğünde güvenle tutulabilecek miktarın
  çok üzerine çıkacak veya görüntüleyicinin okuyamadığı bir şey kullanan bir model, nedenini söyleyen bir mesajla
  reddedilir.
- **Eski veya metin FBX yok.** Dosyayı ikili FBX 7.0 veya sonrası olarak yeniden dışa aktarın.

Khronos'un [glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets) koleksiyonundaki 152 GLB ve
verileri gömülü glTF modelinin tamamı denendi: three.js'in uygulamadığı bir uzantıya ihtiyaç duyan üçü dışında
hepsi açılıyor.

## Sorun giderme

<details>
<summary>Dosya 3D yerine metin olarak açılıyor</summary>

`.gltf` ve `.obj` metin dosyalarıdır, bu yüzden Kaynak (metin) görünümünde açılabilirler. Düzenleyici sekmesinde
**3D**'yi seçin. Tarayıcıdaki Orca'da 3D kullanılamaz.

</details>

<details>
<summary>Dokular veya renkler eksik</summary>

Ayrı görsel dosyalarındaki dokular bir eklenti tarafından okunamaz; durum çubuğu okuyamadığı dosyaların adlarını
gösterir. glTF için bir `.glb` kullanın; FBX için dokuları gömülü olarak dışa aktarın. Bir OBJ'nin `.mtl` dosyası
okunamadığı için model, varsa köşe renkleriyle, yoksa varsayılan bir renkle gösterilir.

</details>

<details>
<summary>Boyut yanlış görünüyor</summary>

STL milimetre, PLY ve OBJ metre olarak gösterilir, çünkü bu biçimler birim saklamaz. FBX ve glTF dosyanın belirttiği
birimi kullanır. Boyut 1000 veya 100 kat farklıysa, modelin hangi birimle dışa aktarıldığını kontrol edin.

</details>

<details>
<summary>Modelin açılamayacağı söyleniyor</summary>

Mesaj nedenini söyler. Çok büyük modeller, bozuk dosyalar ve görüntüleyicinin desteklemediği özellikler açılmadan
önce reddedilir. Neden açık değilse **Ayrıntılar**'ı kopyalayıp bir issue'ya yapıştırın.

</details>

<details>
<summary>Hata bildirmek</summary>

[Hata bildirimi](https://github.com/momokun7/orca-3d-viewer/issues/new?template=bug_report.yml) şablonunu kullanın
ve **Ayrıntılar** metnini yapıştırın. Modeli paylaşabiliyorsanız nereden geldiğini belirtin. Bir güvenlik sorunu
issue'ya değil, [özel bir bildirime](https://github.com/momokun7/orca-3d-viewer/security/advisories/new) aittir.

</details>

## Güvenlik

Bir model güvenilmeyen bir girdidir, bu yüzden görüntüleyici saldırmaya değmeyecek kadar sıkıcı olacak şekilde
yapılmıştır.

- **Yalıtılmış**: Orca'nın yalıtılmış eklenti çerçevesinde, katı bir Content-Security-Policy altında, ağ olmadan
  çalışır.
- **İzin yok**: manifest hiçbir yetenek istemez: worker yok, komut yok, dosya erişimi yok.
- **Salt okunur**: belgeyi asla düzenlemez veya kaydetmez, ve bir modelin içindeki URI'ler asla bir yükleyiciye
  ulaşmaz.
- **Önce denetlenir**: her biçim, herhangi bir şeyin kodu çözülmeden önce ayrı bir iş parçacığında boyut sınırlarına
  göre denetlenir. FBX'in sıkıştırılmış dizileri küçük adımlarla açılır ve bildirilen boyutu aştıkları anda
  durdurulur.
- **Test edilmiş**: CI, görüntüleyiciyi Orca'nın çerçeve politikası altında kötü niyetli ve fuzz ile üretilmiş
  modellere karşı çalıştırır ve commit edilmiş paketin kaynaktan yeniden üretilebildiğini denetler.

Ayrıntılar için [SECURITY.md](../../SECURITY.md) dosyasına bakın.

## Geliştirme

Eklentinin kodu `build/src` içindedir. `build/build.mjs` onu `editor/` içine paketler; `editor/` commit edilmiştir,
böylece Orca eklentiyi bir derleme adımı olmadan yükleyebilir.

```sh
cd build
npm ci
npm test
npm run typecheck
npm run build
```

[mise](https://mise.jdx.dev) ile `mise run check`, CI'ın çalıştırdığı her şeyi çalıştırır; `mise tasks` ise geri
kalanları listeler.

Değişikliklerinizi Orca'da denemek için depo kökünde `orca plugin dev watch .` komutunu çalıştırın veya klasörü
**Ayarlar → Eklentiler → Geliştirme** altına ekleyin.

## Katkıda bulunma

Issue'lar, etiketler, proje panosu, kilometre taşları ve pull request'ler [CONTRIBUTING.md](../../CONTRIBUTING.md)
dosyasında anlatılmıştır. İngilizce ve Japonca dışındaki çeviriler makineyle taslak olarak hazırlanmıştır; ana dili
bu dil olan kişilerden gelecek düzeltmeler memnuniyetle karşılanır.

## Lisans ve kaynaklar

[MIT](../../LICENSE). Pakete dahil edilen three.js, meshoptimizer, fflate ve Lucide (MIT / ISC) ile Draco kod
çözücüsü (Apache-2.0) kendi lisanslarını korur; bkz. [THIRD_PARTY_NOTICES.txt](../../THIRD_PARTY_NOTICES.txt).

Görsellerdeki ve GIF'lerdeki modeller aşağıdaki kaynaklardan gelir. Her kopyada biçim dönüştürme, renkler
(3DBenchy'nin, Armadillo'nun ve Teapot'un renkleri dosyaya tarafımızdan yazılmıştır) ve yönlendirme bizim
düzenlememizdir.

| Model | Kullanıldığı yer | Kaynak | Lisans |
| --- | --- | --- | --- |
| Stanford Bunny | Ana görsel, özellik GIF'leri | [Stanford 3D Scanning Repository](https://graphics.stanford.edu/data/3Dscanrep/). Source: Stanford University Computer Graphics Laboratory | Kaynak belirtilerek ticari olmayan kullanım için ücretsiz |
| Stanford Armadillo | PLY | Yukarıdaki gibi | Yukarıdaki gibi |
| A Beautiful Game | GLB | Khronos [glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets). Özgün model MaterialX Project, glTF'e dönüştürme Ed Mackey | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Corset | glTF | Khronos glTF Sample Assets, Microsoft | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| BoomBox | FBX | Khronos glTF Sample Assets, Microsoft | CC0 1.0 |
| 3DBenchy | STL | [3DBenchy.com](https://www.3dbenchy.com/), Creative Tools | CC0 1.0 |
| Utah Teapot | OBJ | [McGuire Computer Graphics Archive](https://casual-effects.com/data), Martin Newell (1975), Kenzie Lamar | CC0 |
| Fox | Animasyon GIF'i | Khronos glTF Sample Assets. Model PixelMannen (CC0 1.0), rig ve animasyon tomkranis, glTF'e dönüştürme @AsoboStudio ve @scurest | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
