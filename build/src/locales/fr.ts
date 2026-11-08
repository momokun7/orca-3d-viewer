// French UI text; see messages.ts for the English source.
import type { Messages } from '../messages.ts'

export const FR: Messages = {
  loading: 'Chargement du modèle 3D…',
  contextLost:
    'Le pilote graphique a réinitialisé la vue 3D. Elle réapparaîtra dès que le pilote sera rétabli ; sinon, rouvrez le fichier.',
  parseFailed:
    'Impossible d’afficher ce modèle 3D. Il est peut-être corrompu, ou utilise une fonctionnalité non prise en charge par la visionneuse.',
  corrupt: 'Ce modèle est corrompu : {{path}} {{reason}}.',
  corruptFile: 'Ce fichier {{format}} est corrompu : {{reason}}.',
  parseTimeout: 'Le chargement de ce modèle 3D prenait trop de temps et a été interrompu.',
  webglUnavailable:
    'Cette vue 3D nécessite WebGL, actuellement indisponible. L’accélération graphique est peut-être désactivée, ou le GPU ne répond plus.',
  renderFailed: 'Le modèle a bien été lu, mais son affichage a échoué.',
  truncated:
    'Ce fichier GLB est incomplet : il ne contient que {{actual}} octets sur les {{declared}} annoncés par son en-tête. Il est peut-être encore en cours de téléchargement ou de copie, ou le transfert a été interrompu.',
  unsupportedExtensions:
    'Ce modèle nécessite des extensions glTF non prises en charge par la visionneuse : {{extensions}}.',
  tooLargeGeometry:
    'Ce modèle est trop volumineux pour être affiché sans risque : une fois décodé, il représenterait {{value}} de données de sommets et d’animation (limite : {{limit}}).',
  tooLargeGpu:
    'Ce modèle est trop volumineux pour être affiché sans risque : ses textures et ses cibles de morphing occuperaient {{value}} de mémoire GPU (limite : {{limit}}).',
  tooManyNodes:
    'Ce modèle est trop volumineux pour être affiché sans risque : il compte {{value}} nœuds (limite : {{limit}}).',
  tooManyDrawCalls:
    'Ce modèle est trop volumineux pour être affiché sans risque : il exigerait {{value}} appels de dessin par image (limite : {{limit}}).',
  tooManyImages:
    'Ce modèle est trop volumineux pour être affiché sans risque : il compte {{value}} images (limite : {{limit}}).',
  tooManyDrawnVertices:
    'Ce modèle est trop volumineux pour être affiché sans risque : il faudrait dessiner {{value}} sommets par image (limite : {{limit}}).',
  tooManyMaterials:
    'Ce modèle est trop volumineux pour être affiché sans risque : il compte {{value}} matériaux (limite : {{limit}}).',
  tooManyChannels:
    'Ce modèle est trop volumineux pour être affiché sans risque : ses animations comptent {{value}} canaux (limite : {{limit}}).',
  tooComplex: 'Ce modèle est trop complexe pour être vérifié avant le chargement ; il n’a donc pas été ouvert.',
  tooManyTracks:
    'Ce modèle est trop volumineux pour être affiché sans risque : ses animations généreraient {{value}} pistes (limite : {{limit}}).',
  tooLargeTotal:
    'Ce modèle est trop volumineux pour être affiché sans risque : il occuperait {{value}} de mémoire au total (limite : {{limit}}).',
  tooLargeLoaded:
    'Ce modèle s’est révélé plus volumineux que ce qu’annonçait son fichier ({{what}}) ; il n’est donc pas affiché.',
  loadingNewer: 'Chargement de la dernière version enregistrée…',
  tooManyTextures:
    'Ce modèle est trop volumineux pour être affiché sans risque : il compte {{value}} textures (limite : {{limit}}).',
  tooManyJoints:
    'Ce modèle est trop volumineux pour être affiché sans risque : un skin compte {{value}} articulations (limite : {{limit}}).',
  imageTooLarge:
    'Ce modèle est trop volumineux pour être affiché sans risque : une image mesure {{width}} × {{height}} pixels (limite : {{limit}} par côté).',
  unreadableImage:
    'L’image {{index}} n’est pas une image PNG, JPEG, WebP, AVIF ou KTX2 dont la taille puisse être vérifiée avant le décodage ; le modèle n’a donc pas été ouvert.',
  unreadableDraco:
    'Le maillage {{index}} contient des données Draco dont la taille ne peut pas être vérifiée avant le décodage ; le modèle n’a donc pas été ouvert.',
  externalBuffers:
    'Ce modèle enregistre sa géométrie dans des fichiers séparés ({{files}}), que les plugins Orca ne peuvent pas lire. Ouvrez un fichier .glb, ou un .gltf aux données intégrées.',
  externalImages:
    'Les textures contenues dans des fichiers séparés ({{files}}) ne sont pas affichées : les plugins Orca ne peuvent pas lire les fichiers situés à côté du modèle. Utilisez un fichier .glb pour les afficher.',
  externalTextures:
    'Les textures contenues dans des fichiers séparés ({{files}}) ne sont pas affichées : les plugins Orca ne peuvent pas lire les fichiers situés à côté du modèle. Intégrez-les au fichier pour les afficher.',
  objMaterials:
    'Les matériaux du fichier .mtl séparé ne sont pas affichés : les plugins Orca ne peuvent pas lire les fichiers situés à côté du modèle.',
  assumedMeters: 'Ce format n’indique pas d’unité : les tailles sont donc affichées en mètres.',
  fbxText: 'Ce fichier FBX est au format texte (ASCII), que la visionneuse ne lit pas. Exportez-le en FBX binaire.',
  fbxVersion:
    'Ce fichier FBX est en version {{version}} ; la visionneuse lit FBX 7.0 (2011) et les versions ultérieures. Réexportez-le avec un outil récent.',
  usdCompressed: 'Ce paquet USDZ compresse ses fichiers. Le format USDZ les stocke sans compression : la visionneuse ne l’ouvre donc pas. Exportez-le de nouveau avec un outil qui écrit l’USDZ.',
  usdAssumedCentimeters: 'Ce fichier USD n’indique pas d’unité : les tailles sont donc affichées en centimètres, comme le prévoit USD.',
  usdExternalLayers: 'Les parties situées dans des fichiers USD séparés ({{files}}) ne sont pas affichées : les plugins Orca ne peuvent pas lire les fichiers placés à côté du modèle. Regroupez-les dans un .usdz pour les voir.',
  usdExternalTextures: 'Les textures situées dans des fichiers séparés ({{files}}) ne sont pas affichées : les plugins Orca ne peuvent pas lire les fichiers placés à côté du modèle. Regroupez-les dans un .usdz pour les voir.',
  laterSaveFailed:
    'Impossible d’afficher la dernière version enregistrée ; la version précédente reste à l’écran : {{reason}}',
  moreFiles: {
    one: '{{list}} et {{count}} autre',
    many: '{{list}} et {{count}} autres',
    other: '{{list}} et {{count}} autres'
  },
  otherScenes: {
    one: 'Ce fichier contient {{count}} autre scène ; la scène par défaut est affichée.',
    many: 'Ce fichier contient {{count}} autres scènes ; la scène par défaut est affichée.',
    other: 'Ce fichier contient {{count}} autres scènes ; la scène par défaut est affichée.'
  },
  resetView: 'Réinitialiser la vue',
  wireframe: 'Filaire',
  wireframeTooLarge: 'Mode filaire indisponible pour un modèle aussi volumineux',
  guides: 'Grille et axes',
  darkTheme: 'Thème sombre',
  details: 'Détails',
  detailsTitle: 'Détails à joindre à une issue',
  detailsNote:
    'Versions de la visionneuse et du navigateur, configuration graphique, derniers chargements et erreurs éventuelles. Aucune donnée du modèle, hormis ce que cite un message d’erreur.',
  copyDetails: 'Copier',
  copied: 'Copié',
  copyByHand: 'Copie impossible ici. Sélectionnez le texte et copiez-le manuellement.',
  close: 'Fermer',
  playAnimation: 'Lire l’animation',
  pauseAnimation: 'Mettre l’animation en pause',
  animation: 'Animation',
  animationFallback: 'Animation {{index}}',
  allClips: 'Tous les clips',
  vertices: { one: '{{count}} sommet', many: '{{count}} sommets', other: '{{count}} sommets' },
  triangles: { one: '{{count}} triangle', many: '{{count}} triangles', other: '{{count}} triangles' },
  points: { one: '{{count}} point', many: '{{count}} points', other: '{{count}} points' },
  lineSegments: { one: '{{count}} segment', many: '{{count}} segments', other: '{{count}} segments' },
  dimensionsTitle: 'Largeur × hauteur × profondeur',
  dimensions: '{{width}} × {{height}} × {{depth}} {{unit}}',
  gridCell: 'Grille {{size}}',
  viewportLabel: 'Modèle 3D : {{summary}}'
}
