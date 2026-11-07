<div align="center">

[English](../../README.md) · [日本語](README.ja.md) · [Deutsch](README.de.md) · [Español](README.es.md) ·
**Français** · [한국어](README.ko.md) · [Português](README.pt-BR.md) ·
[Русский](README.ru.md) · [Türkçe](README.tr.md) · [简体中文](README.zh-Hans.md) ·
[繁體中文](README.zh-Hant.md)

# 3D Viewer for Orca

**Regardez des modèles 3D sans quitter votre éditeur.**

Une visionneuse en lecture seule pour [Orca](https://github.com/stablyai/orca) qui ouvre les fichiers GLB, glTF, STL, PLY, OBJ et FBX.
Tournez autour d’un modèle, lisez ses animations et voyez d’un coup d’œil s’il a bien la taille que vous pensez.

[![CI](https://github.com/momokun7/orca-3d-viewer/actions/workflows/ci.yml/badge.svg)](https://github.com/momokun7/orca-3d-viewer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)
[![Orca](https://img.shields.io/badge/Orca-%E2%89%A5%201.4.248-black.svg)](https://github.com/stablyai/orca)
[![Permissions](https://img.shields.io/badge/permissions-none-brightgreen.svg)](#sécurité)

[Formats](#formats) · [Fonctionnalités](#fonctionnalités) · [Installation](#installation) · [Utilisation](#utilisation) ·
[Dépannage](#dépannage) · [Sécurité](#sécurité) · [Développement](#développement) ·
[Signaler un bug](https://github.com/momokun7/orca-3d-viewer/issues/new?template=bug_report.yml)

<img alt="Le Stanford Bunny dans 3D Viewer au sein d’Orca, posé sur une grille au sol, avec sa taille, 156 × 154 × 121 mm, dans la barre d’état" src="../images/hero.png" width="800">

</div>

## Formats

Une visionneuse, six formats.

<table>
  <tr>
    <td width="33%"><img alt="A Beautiful Game en GLB : un échiquier en marbre avec des pièces en verre et en métal" src="../images/formats/glb.png"></td>
    <td width="33%"><img alt="Corset en glTF avec ses données intégrées : tissu brodé et boucles" src="../images/formats/gltf.png"></td>
    <td width="33%"><img alt="3DBenchy en STL : le petit bateau qui sert à tester les imprimantes 3D, dans un orange stocké dans le fichier" src="../images/formats/stl.png"></td>
  </tr>
  <tr>
    <td align="center"><b>GLB</b> : A Beautiful Game</td>
    <td align="center"><b>glTF</b> : Corset</td>
    <td align="center"><b>STL</b> : 3DBenchy</td>
  </tr>
  <tr>
    <td width="33%"><img alt="Le Stanford Armadillo en PLY : un scan 3D, dans un vert stocké dans ses sommets" src="../images/formats/ply.png"></td>
    <td width="33%"><img alt="La théière de l’Utah en OBJ, dans un violet stocké dans ses sommets" src="../images/formats/obj.png"></td>
    <td width="33%"><img alt="BoomBox en FBX, avec la texture de ses boutons et de ses grilles de haut-parleur" src="../images/formats/fbx.png"></td>
  </tr>
  <tr>
    <td align="center"><b>PLY</b> : Stanford Armadillo</td>
    <td align="center"><b>OBJ</b> : Utah Teapot</td>
    <td align="center"><b>FBX</b> : BoomBox</td>
  </tr>
</table>

| Format | Extensions | Couleurs et textures | Animation | Unité de taille | Remarques |
| --- | --- | --- | --- | --- | --- |
| glTF 2.0 | `.glb` `.gltf` | Oui | Oui | Mètres (comme le définit glTF) | Un `.gltf` doit intégrer ses données |
| STL | `.stl` | Couleurs stockées dans le fichier, sinon une couleur par défaut | Non | Millimètres (la convention de l’impression 3D), Z vers le haut | Binaire et texte |
| PLY | `.ply` | Couleurs de sommets, sinon une couleur par défaut | Non | Affiché en mètres | Binaire et texte |
| OBJ | `.obj` | Couleurs de sommets (le `.mtl` ne peut pas être lu) | Non | Affiché en mètres | |
| FBX | `.fbx` | Textures intégrées uniquement | Oui | L’unité indiquée par le fichier | FBX binaire 7.0 (2011) et versions ultérieures |

Les glTF compressés avec Draco ou Meshopt, ainsi que les textures KTX2 / Basis Universal, s’ouvrent aussi.

## Fonctionnalités

### Tourner autour

<table>
  <tr>
    <td width="50%"><img alt="Faire glisser avec le bouton gauche de la souris fait tourner la caméra autour du lapin" src="../images/features/orbit.gif"></td>
    <td width="50%"><img alt="Faire glisser avec le bouton droit, puis Maj plus le bouton gauche, déplace la vue sur le côté" src="../images/features/pan.gif"></td>
  </tr>
  <tr>
    <td align="center"><b>Orbite</b> : faire glisser</td>
    <td align="center"><b>Panoramique</b> : faire glisser avec le bouton droit, ou <kbd>Shift</kbd> + faire glisser</td>
  </tr>
  <tr>
    <td width="50%"><img alt="La molette de la souris rapproche le lapin puis l’éloigne" src="../images/features/zoom.gif"></td>
    <td width="50%"><img alt="Une vue retournée revient à la vue de départ avec le bouton de réinitialisation" src="../images/features/reset.gif"></td>
  </tr>
  <tr>
    <td align="center"><b>Zoom</b> : molette</td>
    <td align="center"><b>Réinitialiser la vue</b> : le premier bouton de la barre d’outils</td>
  </tr>
</table>

### Taille réelle

Une grille au sol, les axes X / Y / Z et la largeur × hauteur × profondeur du modèle : un modèle créé dans la mauvaise unité
saute aux yeux immédiatement. Le Stanford Bunny mesure 15,6 cm de large.

<img alt="Le lapin sur une grille de 10 mm ; la barre d’état affiche 156 × 154 × 121 mm, puis Grille 10 mm" src="../images/features/size.gif" width="600">

### Filaire, grille et axes

Affichez le maillage sous forme de lignes uniquement, ou masquez la grille et les axes. Le nombre de sommets et de triangles figure dans la barre d’état.

<img alt="Le bouton Filaire montre le maillage du lapin, puis le bouton Grille et axes masque la grille au sol" src="../images/features/inspect.gif" width="600">

### Animations

Lisez et mettez en pause, et choisissez un clip quand le modèle en a plusieurs.

<img alt="Un renard joue son clip Survey, passe à Run depuis le menu des clips, puis se met en pause et reprend" src="../images/features/animations.gif" width="600">

### Toujours à jour

Enregistrez le fichier et la vue affiche la nouvelle version, en laissant votre caméra là où elle était.

<img alt="Chaque fois que le fichier est enregistré avec Ctrl + S, le lapin change de couleur sur place" src="../images/features/live.gif" width="600">

### Clair ou sombre

La visionneuse s’ouvre en clair ; le bouton en forme de lune dans la barre d’outils active le **Thème sombre** et le désactive. Elle retient
le thème, le mode filaire et la grille choisis en dernier, même après un redémarrage d’Orca (Orca 1.4.250 et versions ultérieures).

<img alt="Un clic sur le bouton en forme de lune de la barre d’outils passe la visionneuse en sombre, un nouveau clic la repasse en clair" src="../images/features/theme.gif" width="600">

### Onze langues

Le texte de la visionneuse suit la langue d’Orca : English, 日本語, Deutsch, Español, Français, 한국어, Português,
Русский, Türkçe, 简体中文 et 繁體中文.

### Détails à coller dans une issue

Le bouton **i** de la barre d’outils (sur un écran d’erreur, le bouton **Détails** sous le message) ouvre un résumé :
la version de la visionneuse, votre navigateur et votre configuration graphique, les chargements récents avec leur durée et les erreurs rencontrées.
Cliquez sur **Copier** pour le coller dans une issue : il dit ce qui s’est passé. Il ne contient aucune donnée du modèle.

<img alt="Le panneau Détails : la version de la visionneuse, le navigateur, l’historique des chargements et la raison du refus d’un fichier, avec les boutons Copier et Fermer" src="../images/details.png" width="600">

## Installation

1. Dans Orca, ouvrez **Paramètres → Plugins** et choisissez **Installer le plugin**.
2. Dans l’onglet **URL Git**, saisissez :

   ```text
   https://github.com/momokun7/orca-3d-viewer#v1.0.0
   ```

3. Choisissez **Installer**. La visionneuse ne demande aucune autorisation, il n’y a donc rien d’autre à accorder.

> [!IMPORTANT]
> Nécessite l’application de bureau Orca, version 1.4.248 ou ultérieure.

## Utilisation

Ouvrez un fichier dans l’un de ces formats et il s’affiche en 3D. `.gltf` et `.obj` sont des fichiers texte : l’onglet de l’éditeur
permet donc de basculer entre **Source** (le texte) et **3D**.

| Action | Comment |
| --- | --- |
| Orbite | Faire glisser |
| Panoramique | Faire glisser avec le bouton droit, <kbd>Shift</kbd> + faire glisser, ou les touches fléchées |
| Zoom | Molette |
| Réinitialiser la vue | Le premier bouton de la barre d’outils |
| Filaire, grille et axes | Les boutons à côté |
| Clair ou sombre | Le bouton en forme de lune |
| Détails | Le bouton **i** |
| Animations | Le bouton de lecture et le menu des clips, quand le modèle en a |

## Limites

> [!NOTE]
> Les plugins Orca ne lisent que le fichier ouvert, jamais les autres fichiers de son dossier : les données stockées dans des fichiers séparés
> ne peuvent donc pas être affichées. Un `.gltf` dont la géométrie se trouve dans un `.bin` séparé ne s’ouvre pas, et les textures stockées dans des
> fichiers image séparés ainsi que le `.mtl` d’un OBJ sont ignorés. Un `.glb`, un `.gltf` dont les données sont intégrées ou un FBX dont les
> textures sont intégrées affiche tout.

- **Application de bureau uniquement.** Dans Orca dans un navigateur, le fichier s’ouvre en Source.
- **Jusqu’à 64 MiB**, la limite d’Orca pour les éditeurs personnalisés. Un modèle qui, une fois décodé, dépasserait largement ce qu’il est sûr de garder en mémoire,
  ou qui utilise quelque chose que la visionneuse ne sait pas lire, est refusé avec un message qui en donne la raison.
- **Pas de FBX ancien ni de FBX texte.** Exportez-le de nouveau en FBX binaire 7.0 ou ultérieur.

Les 152 modèles GLB et glTF intégrés des
[glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets) de Khronos ont été vérifiés : tous s’ouvrent, sauf
trois qui nécessitent une extension que three.js n’implémente pas.

## Dépannage

<details>
<summary>Le fichier s’ouvre en texte au lieu de la 3D</summary>

`.gltf` et `.obj` sont des fichiers texte : ils peuvent donc s’ouvrir en Source (le texte). Choisissez **3D** dans l’onglet de l’éditeur. Dans
Orca dans un navigateur, la 3D n’est pas disponible.

</details>

<details>
<summary>Des textures ou des couleurs manquent</summary>

Un plugin ne peut pas lire les textures stockées dans des fichiers image séparés ; la barre d’état indique les fichiers qui n’ont pas pu être lus.
Pour glTF, utilisez un `.glb` ; pour FBX, exportez avec les textures intégrées. Le `.mtl` d’un OBJ ne peut pas être lu : l’OBJ s’affiche
donc avec ses couleurs de sommets s’il en a, sinon avec une couleur par défaut.

</details>

<details>
<summary>La taille semble fausse</summary>

STL est affiché en millimètres, PLY et OBJ en mètres, car aucun de ces formats ne stocke d’unité. FBX et glTF utilisent
l’unité indiquée par le fichier. Si la taille est décalée d’un facteur 1000 ou 100, vérifiez l’unité dans laquelle le modèle a été exporté.

</details>

<details>
<summary>Le modèle ne peut pas être ouvert</summary>

Le message en donne la raison. Les modèles trop volumineux, les fichiers corrompus et les fonctionnalités que la visionneuse ne
prend pas en charge sont refusés avant d’être ouverts. Si la raison n’est pas claire, copiez les **Détails** dans une issue.

</details>

<details>
<summary>Signaler un bug</summary>

Utilisez le modèle de [rapport de bug](https://github.com/momokun7/orca-3d-viewer/issues/new?template=bug_report.yml)
et collez le texte des **Détails**. Si vous pouvez partager le modèle, indiquez d’où il vient. Un problème de sécurité doit faire l’objet
d’un [signalement privé](https://github.com/momokun7/orca-3d-viewer/security/advisories/new), pas d’une issue.

</details>

## Sécurité

Un modèle est une entrée non fiable : la visionneuse est donc conçue pour être une cible sans intérêt.

- **Isolée** : elle s’exécute dans le cadre isolé des plugins d’Orca, sous une Content-Security-Policy stricte, sans réseau.
- **Aucune autorisation** : le manifeste ne demande aucune capacité : pas de worker, pas de commandes, pas d’accès aux fichiers.
- **Lecture seule** : elle ne modifie ni n’enregistre jamais le document, et les URI contenues dans un modèle n’atteignent jamais un chargeur.
- **Vérifié d’abord** : chaque format est vérifié par rapport à des budgets de taille dans un thread séparé avant que quoi que ce soit ne soit
  décodé. Les tableaux compressés de FBX sont décompressés par petites étapes et arrêtés dès qu’ils dépassent leur taille déclarée.
- **Testée** : la CI exécute la visionneuse sous la politique de cadre d’Orca avec des modèles hostiles et générés par fuzzing, et vérifie que le
  bundle versionné est reproductible à partir des sources.

Voir [SECURITY.md](../../SECURITY.md) pour les détails.

## Développement

Le code du plugin se trouve dans `build/src`. `build/build.mjs` le regroupe dans `editor/`, qui est versionné pour qu’Orca
puisse charger le plugin sans étape de build.

```sh
cd build
npm ci
npm test
npm run typecheck
npm run build
```

Avec [mise](https://mise.jdx.dev), `mise run check` exécute tout ce qu’exécute la CI, et `mise tasks` liste le reste.

Pour essayer vos modifications dans Orca, exécutez `orca plugin dev watch .` depuis la racine du dépôt, ou ajoutez le dossier dans
**Paramètres → Plugins → Développement**.

## Contribuer

Les issues, les labels, le tableau du projet, les jalons et les pull requests sont décrits dans
[CONTRIBUTING.md](../../CONTRIBUTING.md). Les traductions autres que l’anglais et le japonais ont été rédigées par machine ;
les corrections de locuteurs natifs sont les bienvenues.

## Licence et crédits

[MIT](../../LICENSE). three.js, meshoptimizer, fflate et Lucide (MIT / ISC) ainsi que le décodeur Draco
(Apache-2.0), inclus dans le paquet, conservent leurs propres licences ; voir [THIRD_PARTY_NOTICES.txt](../../THIRD_PARTY_NOTICES.txt).

Les modèles des images et des GIF proviennent des sources ci-dessous. Dans chaque copie, la conversion de format, les couleurs
(celles de 3DBenchy, de l’Armadillo et de la théière ont été écrites dans le fichier par nous) et l’orientation sont de notre fait.

| Modèle | Utilisé dans | Source | Licence |
| --- | --- | --- | --- |
| Stanford Bunny | Image principale, GIF des fonctionnalités | [Stanford 3D Scanning Repository](https://graphics.stanford.edu/data/3Dscanrep/). Source: Stanford University Computer Graphics Laboratory | Libre pour un usage non commercial avec mention de la source |
| Stanford Armadillo | PLY | Idem | Idem |
| A Beautiful Game | GLB | Khronos [glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets). Modèle original du MaterialX Project, conversion en glTF par Ed Mackey | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Corset | glTF | Khronos glTF Sample Assets, Microsoft | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| BoomBox | FBX | Khronos glTF Sample Assets, Microsoft | CC0 1.0 |
| 3DBenchy | STL | [3DBenchy.com](https://www.3dbenchy.com/), Creative Tools | CC0 1.0 |
| Utah Teapot | OBJ | [McGuire Computer Graphics Archive](https://casual-effects.com/data), Martin Newell (1975), Kenzie Lamar | CC0 |
| Fox | GIF d’animation | Khronos glTF Sample Assets. Modèle de PixelMannen (CC0 1.0), rigging et animation par tomkranis, conversion en glTF par @AsoboStudio et @scurest | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
