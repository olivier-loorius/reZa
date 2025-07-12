# RéZa

Appli mobile de réservation de salles (React Native + Node.js)

## Prérequis
- Node.js 
- npm 
- Expo CLI (`npm install -g expo-cli` ou utiliser npx expo)

## Installation

### 1. Cloner le projet
```sh
git clone https://github.com/olivier-loorius/reZa.git
cd reZa
```

### 2. Installer les dépendances du front (Expo)
```sh
cd MaReza
npm install
```

### 3. Installer les dépendances du back (Node.js)
```sh
cd ../server
npm install
```

## Lancement du projet (2 terminaux nécessaires)

### Terminal 1 : Lancer le serveur Node.js (back)
```sh
cd server
node index.js
```
Le serveur écoute sur http://localhost:3001

### Terminal 2 : Lancer l'application mobile (front)
```sh
cd MaReza
npx expo start
```
Scanne le QR code avec Expo Go sur ton mobile (assure-toi que ton téléphone et ton PC sont sur le même réseau Wi-Fi).

## Configuration réseau (Expo Go sur mobile)
- Modifie l'adresse IP dans `MaReza/components/LoginForm.tsx` (ligne du fetch) pour mettre l'IP locale de ton PC (ex : `http://192.168.1.12:3001/login`).
- Pour trouver l'IP locale :
  - Windows : `ipconfig` → Adresse IPv4
  - Mac/Linux : `ifconfig` ou `ip a`

## Fonctionnalités principales

###  Interface utilisateur
- Splash screen animé avec logo et transition
- Page d'accueil: logo, texte d'accueil et boutons de navigation
- Navigation avec boutons de retour et menus

###  Authentification
- Formulaire de connexion: nom, email, mot de passe
- Stockage sécurisé de l'utilisateur connecté avec Expo SecureStore
- Gestion des utilisateurs côté back: Node.js, users.json, mot de passe hashé
- Indicateur de connexion avec avatar utilisateur et statut visuel

###  Gestion des salles
- Création de salles avec formulaire: nom, capacité, équipements, +, description, étage
- Affichage des salles détaillées
- Vue détaillée de chaque salle avec image, équipements et réservations existantes
- Gestion des créateurs : seuls les créateurs peuvent supprimer leurs salles
- Interface "Mes salles" pour voir et gérer ses propres salles

###  Système de réservation
- Réservation flexible : 1-4 heures ou journée complète
- Sélection de date avec calendrier avancé et dates rapides
- Sélection d'heure avec créneaux de 9h à 20h
- Vérification de disponibilité
- Modal de confirmation avec détails de la réservation

###  Gestion des utilisateurs
- Menu utilisateur  et statut de connexion
- Bouton "Mes ReZa" avec logo pour accéder aux réservations personnelles
- Gestion des réservations: voir, supprimer ses propres réservations
- Déconnexion sécurisée avec nettoyage des données

###  Organisation des données
- Stockage JSON côté server: users.json, rooms.json, reservations.json
- Validation des données côté serveur et client
- Gestion des erreurs avec messages utilisateur appropriés


## Structure du projet

```
Reza/
├── MaReza/                 # Application React Native
│   ├── components/         # Composants réutilisables
│   ├── assets/            # Images, fonts, etc.
│   ├── theme.ts           # Configuration des couleurs et styles
│   └── App.tsx           # Point d'entrée de l'app
└── server/                # API Node.js
    ├── index.js           # Serveur Express
    ├── users.json         # Base de données utilisateurs
    ├── rooms.json         # Base de données salles
    └── reservations.json  # Base de données réservations
```

## API Endpoints

### Authentification
- `POST /login` - Connexion utilisateur

### Salles
- `GET /rooms` - Récupérer toutes les salles
- `POST /rooms` - Créer une nouvelle salle
- `DELETE /rooms/:id` - Supprimer une salle

### Réservations
- `GET /reservations` - Récupérer toutes les réservations
- `POST /reservations` - Créer une nouvelle réservation
- `DELETE /reservations/:id` - Supprimer une réservation
- `GET /reservations/room/:roomId` - Réservations d'une salle

## Astuces
- Pour réinitialiser les utilisateurs, vide le fichier `server/users.json` (`[]`).
- Pour changer le port du serveur, modifie `PORT` dans `server/index.js`.
- Les mots de passe sont hashés avec bcrypt pour la sécurité.

## Démo
- Fonctionne sur Expo Go (Android/iOS)
- Testé sur Node.js 18+
- Interface intuitive et moderne
- Gestion complète du cycle de vie des réservations

