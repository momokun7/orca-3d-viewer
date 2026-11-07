<div align="center">

[English](../../README.md) · [日本語](README.ja.md) · [Deutsch](README.de.md) · [Español](README.es.md) ·
**Français** · [한국어](README.ko.md) · [Português](README.pt-BR.md) ·
[Русский](README.ru.md) · [Türkçe](README.tr.md) · [简体中文](README.zh-Hans.md) ·
[繁體中文](README.zh-Hant.md)

# 3D Viewer for Orca

Une visionneuse en lecture seule pour [Orca](https://github.com/stablyai/orca), qui ouvre les fichiers GLB, glTF, STL, PLY, OBJ et FBX.
Faites tourner le modèle, lisez ses animations et vérifiez d’un coup d’œil qu’il a bien la taille attendue.

[![CI](https://github.com/momokun7/orca-3d-viewer/actions/workflows/ci.yml/badge.svg)](https://github.com/momokun7/orca-3d-viewer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)
[![Orca](https://img.shields.io/badge/Orca-%E2%89%A5%201.4.248-black.svg)](https://github.com/stablyai/orca)
[![Permissions](https://img.shields.io/badge/permissions-none-brightgreen.svg)](#sécurité)

[Démarrage rapide](#démarrage-rapide) · [Formats](#formats) · [Fonctionnalités](#fonctionnalités) · [Installation](#installation) · [Utilisation](#utilisation) ·
[Dépannage](#dépannage) · [Sécurité](#sécurité) · [Développement](#développement) ·
[Signaler un bug](https://github.com/momokun7/orca-3d-viewer/issues/new?template=bug_report.yml)

<img alt="Le Stanford Bunny ouvert dans 3D Viewer, dans Orca, posé sur une grille au sol ; la barre d’état indique sa taille : 156 × 154 × 121 mm" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/hero.png" width="800">

</div>

## Démarrage rapide

1. Dans Orca, ouvrez **Paramètres → Plugins → Installer le plugin**, puis, dans l’onglet **URL Git**, collez `https://github.com/momokun7/orca-3d-viewer#v1.0.2` dans **URL du dépôt**. Cliquez sur **Continuer**, puis sur **Installer**, et enfin sur **Activer le plugin** dans la fenêtre qui s’affiche.
2. Ouvrez un fichier `.glb`, `.gltf`, `.stl`, `.ply`, `.obj` ou `.fbx`.
3. Faites glisser la souris pour tourner autour du modèle, et zoomez avec la molette.

Aucune autorisation n’est requise. Pour en savoir plus, consultez [Installation](#installation) et [Utilisation](#utilisation).

## Formats

Une seule visionneuse pour six formats.

<table>
  <tr>
    <td width="33%"><img alt="A Beautiful Game au format GLB : un échiquier en marbre aux pièces de verre et de métal" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/formats/glb.png"></td>
    <td width="33%"><img alt="Corset au format glTF, données intégrées : tissu brodé et boucles" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/formats/gltf.png"></td>
    <td width="33%"><img alt="3DBenchy au format STL : le petit bateau qui sert à tester les imprimantes 3D, en orange grâce à une couleur enregistrée dans le fichier" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/formats/stl.png"></td>
  </tr>
  <tr>
    <td align="center"><b>GLB</b> : A Beautiful Game</td>
    <td align="center"><b>glTF</b> : Corset</td>
    <td align="center"><b>STL</b> : 3DBenchy</td>
  </tr>
  <tr>
    <td width="33%"><img alt="Le Stanford Armadillo au format PLY : un scan 3D, en vert grâce aux couleurs enregistrées dans ses sommets" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/formats/ply.png"></td>
    <td width="33%"><img alt="La théière de l’Utah au format OBJ, en violet grâce aux couleurs enregistrées dans ses sommets" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/formats/obj.png"></td>
    <td width="33%"><img alt="BoomBox au format FBX, avec la texture de ses boutons et de ses grilles de haut-parleurs" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/formats/fbx.png"></td>
  </tr>
  <tr>
    <td align="center"><b>PLY</b> : Stanford Armadillo</td>
    <td align="center"><b>OBJ</b> : Utah Teapot</td>
    <td align="center"><b>FBX</b> : BoomBox</td>
  </tr>
</table>

| Format | Extensions | Couleurs et textures | Animation | Unité de taille | Remarques |
| --- | --- | --- | --- | --- | --- |
| glTF 2.0 | `.glb` `.gltf` | Oui | Oui | Mètres (défini par la spécification glTF) | Un `.gltf` doit intégrer ses données |
| STL | `.stl` | Couleurs enregistrées dans le fichier, sinon couleur par défaut | Non | Millimètres (convention de l’impression 3D), axe Z vers le haut | Binaire et texte |
| PLY | `.ply` | Couleurs de sommets, sinon couleur par défaut | Non | Affichage en mètres | Binaire et texte |
| OBJ | `.obj` | Couleurs de sommets (le `.mtl` n’est pas lu) | Non | Affichage en mètres | |
| FBX | `.fbx` | Textures intégrées uniquement | Oui | Unité indiquée dans le fichier | FBX binaire 7.0 (2011) et versions ultérieures |

Les fichiers glTF compressés avec Draco ou Meshopt, ainsi que les textures KTX2 / Basis Universal, sont également pris en charge.

## Fonctionnalités

### Tourner autour

<table>
  <tr>
    <td width="50%"><img alt="Un glisser avec le bouton gauche de la souris fait tourner la caméra autour du lapin" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/features/orbit.gif"></td>
    <td width="50%"><img alt="Un glisser avec le bouton droit, puis avec Maj et le bouton gauche, décale la vue latéralement" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/features/pan.gif"></td>
  </tr>
  <tr>
    <td align="center"><b>Orbite</b> : faire glisser</td>
    <td align="center"><b>Panoramique</b> : faire glisser avec le bouton droit, ou <kbd>Shift</kbd> + glisser</td>
  </tr>
  <tr>
    <td width="50%"><img alt="La molette de la souris rapproche le lapin, puis l’éloigne" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/features/zoom.gif"></td>
    <td width="50%"><img alt="Une vue mise à l’envers revient à son point de départ grâce au bouton de réinitialisation" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/features/reset.gif"></td>
  </tr>
  <tr>
    <td align="center"><b>Zoom</b> : molette</td>
    <td align="center"><b>Réinitialiser la vue</b> : premier bouton de la barre d’outils</td>
  </tr>
</table>

### Taille réelle

Grille au sol, axes X / Y / Z et dimensions du modèle (largeur × hauteur × profondeur) : un modèle créé dans la
mauvaise unité saute aux yeux. Le Stanford Bunny mesure ainsi 15,6 cm de large.

<img alt="Le lapin sur une grille de 10 mm ; la barre d’état indique 156 × 154 × 121 mm, puis Grille 10 mm" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/features/size.gif" width="600">

### Filaire, grille et axes

Affichez le maillage seul, sous forme de lignes, ou masquez la grille et les axes. La barre d’état indique le nombre de sommets et de triangles.

<img alt="Le bouton Filaire fait apparaître le maillage du lapin, puis le bouton Grille et axes masque la grille au sol" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/features/inspect.gif" width="600">

### Animations

Lancez ou mettez en pause l’animation et, si le modèle en contient plusieurs, choisissez le clip à lire.

<img alt="Un renard joue son clip Survey, passe au clip Run depuis le menu des clips, puis se met en pause et repart" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/features/animations.gif" width="600">

### Toujours à jour

Dès que vous enregistrez le fichier, la vue affiche la nouvelle version, sans toucher à la position de la caméra.

<img alt="À chaque enregistrement avec Ctrl + S, le lapin change de couleur sans bouger" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/features/live.gif" width="600">

### Clair ou sombre

La visionneuse s’ouvre en thème clair ; le bouton en forme de lune de la barre d’outils active ou désactive le **Thème sombre**.
Le thème, le mode filaire et l’affichage de la grille choisis en dernier sont conservés, même après un redémarrage d’Orca
(Orca 1.4.250 et versions ultérieures).

<img alt="Un clic sur le bouton en forme de lune de la barre d’outils passe la visionneuse en thème sombre, un second clic la ramène en thème clair" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/features/theme.gif" width="600">

### Onze langues

La visionneuse s’affiche dans la langue d’Orca : English, 日本語, Deutsch, Español, Français, 한국어, Português,
Русский, Türkçe, 简体中文 et 繁體中文.

### Détails à coller dans une issue

Le bouton **i** de la barre d’outils (ou, sur un écran d’erreur, le bouton **Détails** sous le message) ouvre un récapitulatif :
version de la visionneuse, navigateur et configuration graphique, derniers chargements avec leur durée, et erreurs rencontrées.
Cliquez sur **Copier** et collez-le dans une issue : il décrit ce qui s’est passé. Il ne contient aucune donnée du modèle, hormis ce que cite un message d’erreur.

<img alt="Le panneau Détails : version de la visionneuse, navigateur, historique des chargements et motif du refus d’un fichier, avec les boutons Copier et Fermer" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/details.png" width="600">

## Installation

1. Dans Orca, ouvrez **Paramètres → Plugins** et cliquez sur **Installer le plugin**.
2. Dans l’onglet **URL Git**, collez dans **URL du dépôt** :

   ```text
   https://github.com/momokun7/orca-3d-viewer#v1.0.2
   ```

3. Cliquez sur **Continuer**, puis sur **Installer**. Dans la fenêtre qui s’affiche ensuite, cliquez sur **Activer le plugin** : rien ne s’exécute tant que vous ne l’avez pas activé. La visionneuse ne demande aucune autorisation : vous n’avez rien d’autre à accorder.

> [!IMPORTANT]
> Nécessite l’application de bureau Orca 1.4.248 ou ultérieure.

## Utilisation

Ouvrez un fichier dans l’un de ces formats pour l’afficher en 3D. Les fichiers `.gltf` et `.obj` étant des fichiers texte,
l’onglet de l’éditeur permet de passer de **Source** (le texte) à **3D**, et inversement.

| Action | Commande |
| --- | --- |
| Orbite | Faire glisser |
| Panoramique | Faire glisser avec le bouton droit, <kbd>Shift</kbd> + glisser, ou touches fléchées |
| Zoom | Molette |
| Réinitialiser la vue | Premier bouton de la barre d’outils |
| Filaire, grille et axes | Boutons suivants |
| Clair ou sombre | Bouton en forme de lune |
| Détails | Bouton **i** |
| Animations | Bouton de lecture et menu des clips, si le modèle en contient |

## Limites

> [!NOTE]
> Les plugins Orca ne peuvent lire que le fichier ouvert, et aucun autre fichier de son dossier : les données enregistrées
> dans des fichiers séparés ne peuvent donc pas être affichées. Un `.gltf` dont la géométrie se trouve dans un `.bin` séparé
> ne s’ouvre pas ; les textures contenues dans des fichiers image séparés et le `.mtl` d’un OBJ sont ignorés. En revanche, un
> `.glb`, un `.gltf` aux données intégrées ou un FBX aux textures intégrées s’affiche intégralement.

- **Application de bureau uniquement.** Dans la version navigateur d’Orca, le fichier s’ouvre en mode Source.
- **64 Mio au maximum**, la limite d’Orca pour les éditeurs personnalisés. Un modèle qui, une fois décodé, occuperait bien plus
  de mémoire que ce qui est raisonnable, ou qui fait appel à une fonctionnalité que la visionneuse ne sait pas lire, est refusé
  avec un message qui en explique la raison.
- **Pas de FBX ancien ni de FBX texte.** Réexportez le modèle en FBX binaire 7.0 ou ultérieur.

Les 152 modèles GLB et glTF à données intégrées des
[glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets) de Khronos ont été testés : tous s’ouvrent, à
l’exception de trois qui nécessitent une extension non implémentée par three.js.

## Dépannage

<details>
<summary>Le fichier s’ouvre en texte et non en 3D</summary>

Les fichiers `.gltf` et `.obj` étant des fichiers texte, ils peuvent s’ouvrir en mode Source (le texte). Sélectionnez **3D** dans
l’onglet de l’éditeur. La 3D n’est pas disponible dans la version navigateur d’Orca.

</details>

<details>
<summary>Des textures ou des couleurs manquent</summary>

Un plugin ne peut pas lire les textures contenues dans des fichiers image séparés ; la barre d’état indique les fichiers qui
n’ont pas pu être lus. Pour un glTF, utilisez un `.glb` ; pour un FBX, exportez-le avec les textures intégrées. Le `.mtl`
d’un OBJ n’étant pas lu, l’OBJ s’affiche avec ses couleurs de sommets s’il en possède, sinon avec une couleur par défaut.

</details>

<details>
<summary>La taille semble incorrecte</summary>

Les fichiers STL sont affichés en millimètres, et les fichiers PLY et OBJ en mètres, car aucun de ces formats n’enregistre d’unité.
Les fichiers FBX et glTF utilisent l’unité indiquée dans le fichier. Si la taille est fausse d’un facteur 1000 ou 100,
vérifiez l’unité choisie lors de l’export du modèle.

</details>

<details>
<summary>Le modèle ne peut pas être ouvert</summary>

Le message en donne la raison. Les modèles trop volumineux, les fichiers corrompus et les fonctionnalités non prises en charge
par la visionneuse sont refusés avant l’ouverture. Si la raison n’est pas claire, copiez les **Détails** dans une issue.

</details>

<details>
<summary>Signaler un bug</summary>

Remplissez le formulaire de [rapport de bug](https://github.com/momokun7/orca-3d-viewer/issues/new?template=bug_report.yml)
et collez-y le texte des **Détails**. Si vous pouvez partager le modèle, précisez sa provenance. Pour un problème de sécurité,
faites un [signalement privé](https://github.com/momokun7/orca-3d-viewer/security/advisories/new) plutôt que d’ouvrir une issue.

</details>

## Sécurité

Un modèle 3D est une donnée non fiable : la visionneuse est donc conçue pour offrir le moins de prise possible aux attaques.

- **Isolée** : elle s’exécute dans le cadre isolé réservé aux plugins d’Orca, sous une Content-Security-Policy stricte, sans accès au réseau.
- **Sans autorisation** : le manifeste ne demande aucune capacité (ni worker, ni commandes, ni accès aux fichiers).
- **En lecture seule** : elle ne modifie et n’enregistre jamais le document, et les URI contenues dans un modèle ne sont jamais transmises à un chargeur.
- **Vérifiée en amont** : avant tout décodage, chaque format est contrôlé par rapport à des limites de taille, dans un thread séparé.
  Les tableaux compressés des fichiers FBX sont décompressés par petits blocs, et l’opération s’arrête dès qu’ils dépassent leur taille déclarée.
- **Testée** : la CI exécute la visionneuse sous la politique de cadre d’Orca avec des modèles malveillants ou générés par fuzzing,
  et vérifie que le bundle versionné peut être reproduit à partir des sources.

Pour plus de détails, consultez [SECURITY.md](../../SECURITY.md).

## Développement

Le code du plugin se trouve dans `build/src`. `build/build.mjs` l’assemble dans `editor/`, un dossier versionné afin qu’Orca
puisse charger le plugin sans étape de build.

```sh
cd build
npm ci
npm test
npm run typecheck
npm run build
```

Avec [mise](https://mise.jdx.dev), `mise run check` lance toutes les vérifications de la CI, et `mise tasks` liste les autres tâches.

Pour tester vos modifications dans Orca, exécutez `orca plugin dev watch .` à la racine du dépôt, ou ajoutez le dossier dans
**Paramètres → Plugins → Développement**.

## Contribuer

Les issues, les labels, le tableau du projet, les jalons et les pull requests sont présentés dans
[CONTRIBUTING.md](../../CONTRIBUTING.md). Les traductions autres que l’anglais et le japonais ont d’abord été produites par
traduction automatique : les corrections de locuteurs natifs sont les bienvenues.

## Licence et crédits

[MIT](../../LICENSE). Les bibliothèques incluses, three.js, meshoptimizer, fflate et Lucide (MIT / ISC), ainsi que le décodeur
Draco (Apache-2.0), restent soumises à leur propre licence ; voir [THIRD_PARTY_NOTICES.txt](../../THIRD_PARTY_NOTICES.txt).

Les modèles présentés dans les images et les GIF, dans l’icône du plugin et dans les images de la page du plugin dans Orca proviennent des sources ci-dessous. Sur chaque copie, nous avons converti le
format, appliqué les couleurs (celles de 3DBenchy, de l’Armadillo et de la théière ont été écrites dans le fichier par nos soins)
et ajusté l’orientation.

| Modèle | Utilisé dans | Source | Licence |
| --- | --- | --- | --- |
| Stanford Bunny | Image principale, GIF des fonctionnalités, icône du plugin, page du plugin | [Stanford 3D Scanning Repository](https://graphics.stanford.edu/data/3Dscanrep/). Source : Stanford University Computer Graphics Laboratory | Libre pour un usage non commercial, avec mention de la source |
| Stanford Armadillo | PLY | Idem | Idem |
| A Beautiful Game | GLB, page du plugin | Khronos [glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets). Modèle original du MaterialX Project, converti en glTF par Ed Mackey | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Corset | glTF | Khronos glTF Sample Assets, Microsoft | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| BoomBox | FBX, page du plugin | Khronos glTF Sample Assets, Microsoft | CC0 1.0 |
| 3DBenchy | STL | [3DBenchy.com](https://www.3dbenchy.com/), Creative Tools | CC0 1.0 |
| Utah Teapot | OBJ | [McGuire Computer Graphics Archive](https://casual-effects.com/data), Martin Newell (1975), Kenzie Lamar | CC0 |
| Fox | GIF d’animation, page du plugin | Khronos glTF Sample Assets. Modèle de PixelMannen (CC0 1.0), rigging et animation par tomkranis, conversion en glTF par @AsoboStudio et @scurest | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
