// French UI text; see messages.ts for the English source.
import type { Messages } from '../messages.ts'

export const FR: Messages = {
  loading: 'Chargement du modèle 3D…',
  contextLost:
    'La vue 3D a été réinitialisée par le pilote graphique. Elle reviendra dès que le pilote sera rétabli ; sinon, rouvrez le fichier.',
  parseFailed:
    'Impossible d’afficher ce modèle 3D. Il est peut-être corrompu ou utilise une fonctionnalité que la visionneuse ne prend pas en charge.',
  corrupt: 'Ce modèle est corrompu : {{path}} {{reason}}.',
  corruptFile: 'Ce fichier {{format}} est corrompu : {{reason}}.',
  parseTimeout: 'Le chargement de ce modèle 3D prenait trop de temps ; il a été arrêté.',
  webglUnavailable:
    'Cette vue 3D nécessite WebGL, qui n’est pas disponible pour le moment. L’accélération graphique est peut-être désactivée, ou le GPU ne répond plus.',
  renderFailed: 'Le modèle a été lu, mais il n’a pas pu être affiché.',
  truncated:
    'Ce fichier GLB est tronqué : il contient {{actual}} des {{declared}} octets annoncés par son en-tête. Il est peut-être encore en cours de téléchargement ou de copie, ou le transfert a été interrompu.',
  unsupportedExtensions:
    'Ce modèle nécessite des extensions glTF que la visionneuse ne prend pas en charge : {{extensions}}.',
  tooLargeGeometry:
    'Ce modèle est trop volumineux pour être affiché sans risque : une fois décodé, il occuperait {{value}} de données de sommets et d’animation (limite : {{limit}}).',
  tooLargeGpu:
    'Ce modèle est trop volumineux pour être affiché sans risque : ses textures et cibles de morphing occuperaient {{value}} de mémoire GPU (limite : {{limit}}).',
  tooManyNodes:
    'Ce modèle est trop volumineux pour être affiché sans risque : il compte {{value}} nœuds (limite : {{limit}}).',
  tooManyDrawCalls:
    'Ce modèle est trop volumineux pour être affiché sans risque : il nécessiterait {{value}} appels de dessin par image (limite : {{limit}}).',
  tooManyImages:
    'Ce modèle est trop volumineux pour être affiché sans risque : il compte {{value}} images (limite : {{limit}}).',
  tooManyDrawnVertices:
    'Ce modèle est trop volumineux pour être affiché sans risque : il afficherait {{value}} sommets par image (limite : {{limit}}).',
  tooManyMaterials:
    'Ce modèle est trop volumineux pour être affiché sans risque : il compte {{value}} matériaux (limite : {{limit}}).',
  tooManyChannels:
    'Ce modèle est trop volumineux pour être affiché sans risque : ses animations comptent {{value}} canaux (limite : {{limit}}).',
  tooComplex: 'Ce modèle est trop complexe pour être vérifié avant le chargement ; il n’a donc pas été ouvert.',
  tooManyTracks:
    'Ce modèle est trop volumineux pour être affiché sans risque : ses animations créent {{value}} pistes (limite : {{limit}}).',
  tooLargeTotal:
    'Ce modèle est trop volumineux pour être affiché sans risque : il occuperait {{value}} de mémoire au total (limite : {{limit}}).',
  tooLargeLoaded:
    'Ce modèle s’est révélé plus volumineux que ne l’annonçait son fichier ({{what}}) ; il n’est donc pas affiché.',
  loadingNewer: 'Chargement du dernier enregistrement…',
  tooManyTextures:
    'Ce modèle est trop volumineux pour être affiché sans risque : il compte {{value}} textures (limite : {{limit}}).',
  tooManyJoints:
    'Ce modèle est trop volumineux pour être affiché sans risque : un skin compte {{value}} articulations (limite : {{limit}}).',
  imageTooLarge:
    'Ce modèle est trop volumineux pour être affiché sans risque : une image mesure {{width}} × {{height}} pixels (limite : {{limit}} par côté).',
  unreadableImage:
    'L’image {{index}} n’est pas une image PNG, JPEG, WebP, AVIF ou KTX2 dont la taille peut être vérifiée avant le décodage ; le modèle n’a donc pas été ouvert.',
  unreadableDraco:
    'Le maillage {{index}} contient des données Draco dont la taille ne peut pas être vérifiée avant le décodage ; le modèle n’a donc pas été ouvert.',
  externalBuffers:
    'Ce modèle stocke sa géométrie dans des fichiers séparés ({{files}}), que les plugins Orca ne peuvent pas lire. Ouvrez un fichier .glb, ou un .gltf dont les données sont intégrées.',
  externalImages:
    'Les textures stockées dans des fichiers séparés ({{files}}) ne sont pas affichées : les plugins Orca ne peuvent pas lire les fichiers situés à côté du modèle. Utilisez un fichier .glb pour les voir.',
  externalTextures:
    'Les textures stockées dans des fichiers séparés ({{files}}) ne sont pas affichées : les plugins Orca ne peuvent pas lire les fichiers situés à côté du modèle. Intégrez-les au fichier pour les voir.',
  objMaterials:
    'Les matériaux d’un fichier .mtl séparé ne sont pas affichés : les plugins Orca ne peuvent pas lire les fichiers situés à côté du modèle.',
  assumedMeters: 'Ce format n’a pas d’unités ; les tailles sont donc affichées en mètres.',
  fbxText: 'Ce fichier FBX est au format texte (ASCII), que la visionneuse ne lit pas. Exportez-le en FBX binaire.',
  fbxVersion:
    'Ce fichier FBX est en version {{version}} ; la visionneuse lit FBX 7.0 (2011) et les versions ultérieures. Exportez-le de nouveau avec un outil récent.',
  laterSaveFailed: 'Le dernier enregistrement n’a pas pu être affiché ; le précédent reste à l’écran : {{reason}}',
  moreFiles: '{{list}} et {{count}} autres',
  otherScenes: {
    one: 'Ce fichier contient {{count}} autre scène ; la scène par défaut est affichée.',
    many: 'Ce fichier contient {{count}} autres scènes ; la scène par défaut est affichée.',
    other: 'Ce fichier contient {{count}} autres scènes ; la scène par défaut est affichée.'
  },
  resetView: 'Réinitialiser la vue',
  wireframe: 'Filaire',
  wireframeTooLarge: 'Le mode filaire n’est pas disponible pour un modèle aussi volumineux',
  guides: 'Grille et axes',
  darkTheme: 'Thème sombre',
  details: 'Détails',
  detailsTitle: 'Détails pour signaler une issue',
  detailsNote:
    'Les versions de la visionneuse et du navigateur, votre configuration graphique, les chargements récents et les éventuelles erreurs. Aucune donnée du modèle, sauf ce que cite un message d’erreur.',
  copyDetails: 'Copier',
  copied: 'Copié',
  copyByHand: 'Impossible de copier ici. Sélectionnez le texte et copiez-le.',
  close: 'Fermer',
  playAnimation: 'Lire l’animation',
  pauseAnimation: 'Mettre l’animation en pause',
  animation: 'Animation',
  animationFallback: 'Animation {{index}}',
  allClips: 'Tous les clips',
  vertices: { one: '{{count}} sommet', many: '{{count}} de sommets', other: '{{count}} sommets' },
  triangles: { one: '{{count}} triangle', many: '{{count}} de triangles', other: '{{count}} triangles' },
  points: { one: '{{count}} point', many: '{{count}} de points', other: '{{count}} points' },
  lineSegments: { one: '{{count}} segment', many: '{{count}} de segments', other: '{{count}} segments' },
  dimensionsTitle: 'Largeur × hauteur × profondeur',
  dimensions: '{{width}} × {{height}} × {{depth}} {{unit}}',
  gridCell: 'Grille {{size}}',
  viewportLabel: 'Modèle 3D : {{summary}}'
}
