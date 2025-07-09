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
- Splash screen animé
- Page d'accueil avec logo, texte, bouton GO
- Formulaire de connexion (nom, email, mot de passe)
- Stockage sécurisé de l'utilisateur connecté
- Gestion des utilisateurs côté back (Node.js, users.json, mot de passe hashé)
- Affichage de messages stylés (succès/erreur)

## Astuces
- Pour réinitialiser les utilisateurs, vide le fichier `server/users.json` (`[]`).
- Pour changer le port du serveur, modifie `PORT` dans `server/index.js`.

## Démo
- Fonctionne sur Expo Go (Android/iOS)
- Testé sur Node.js 18+

