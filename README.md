# Galerie en réalité augmentée (WebAR)

Projet individuel réalisé à l'**Université de Malte** (2026) : rendre interactives les fresques murales d'un
service pédiatrique d'hôpital. L'enfant scanne un QR code avec l'appareil photo du téléphone, ouvre une page
web, pointe le téléphone vers une fresque : une animation vidéo apparaît par-dessus le mur.

**Aucune application à installer** : tout fonctionne dans Safari ou Chrome.

## Fonctionnement

- **Reconnaissance d'images avec MindAR** (basé sur TensorFlow.js) : les 9 fresques sont compilées en un fichier
  de suivi `targets.mind`, puis reconnues en temps réel par la caméra.
- **Rendu 3D avec A-Frame** (Three.js) : la vidéo correspondant à la fresque est plaquée sur l'image détectée.
- **Portail de connexion** (`portal/`) : affiche sur l'ordinateur un QR code vers l'application, généré avec
  qrcodejs à partir de l'adresse IP locale.
- **Cache hors ligne par Service Worker** (`sw.js`) : le fichier de suivi et les vidéos sont mis en cache au
  premier chargement, l'application se relance ensuite presque instantanément.
- **Interface « musée moderne »** : barre de signal pendant la recherche, conseils tournants (« approchez-vous »,
  « vérifiez l'éclairage »), bouton « Toucher pour lancer » quand le navigateur bloque la lecture automatique du son.

## Problèmes résolus

- **Plantage mémoire à la compilation** : les images d'origine (5 à 6 Mo chacune) faisaient planter le
  compilateur MindAR dans le navigateur ; réduites à environ 200 Ko, elles se compilent sans problème.
- **Lecture automatique bloquée** (Safari, Chrome) : vidéo lancée en muet, puis son débloqué au premier toucher.
- **Accès caméra uniquement en HTTPS** : serveur local HTTPS avec certificat auto-signé pour les tests.

## Technologies

JavaScript (sans framework) · A-Frame · MindAR · TensorFlow.js · Service Worker · HTML / CSS · Python (serveur HTTPS)

## Images et vidéos non incluses

Les fresques représentent des personnages protégés par le droit d'auteur : les images, les vidéos et le fichier
`targets.mind` ne sont donc pas publiés. Pour essayer le projet avec vos propres images :

1. Placez vos images dans `ar-app/assets/images/` (1.jpg à 9.jpg, environ 200 Ko chacune) et les vidéos dans
   `ar-app/assets/videos/` (1.mp4 à 9.mp4).
2. Ouvrez `ar-app/compiler.html` pour générer `targets.mind`, puis placez-le dans `ar-app/assets/`.
3. Servez le dossier en HTTPS (par exemple avec GitHub Pages) et ouvrez `ar-app/index.html` sur un téléphone.

Le fonctionnement détaillé est décrit dans [`docs/Documentation-projet.pdf`](docs/Documentation-projet.pdf)
(en anglais).
