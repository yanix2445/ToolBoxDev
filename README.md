# 🧰 TOOLBOX 🛠️

> _Un projecteur dans l'univers sombre de ton système d'exploitation_

![Banner](https://i.imgur.com/XFIStN1.png)

<p align="center">
  <img src="https://img.shields.io/badge/Wails-v2.0+-00ADD8?style=for-the-badge&logo=go&logoColor=white" alt="Wails" />
  <img src="https://img.shields.io/badge/Next.js-14.0+-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Go-1.18+-00ADD8?style=for-the-badge&logo=go&logoColor=white" alt="Go" />
</p>

## 🌟 Qu'est-ce que c'est ? (D'où viens-tu ? Où vas-tu ?)

**TOOLBOX** n'est pas juste une application... c'est une **_EXPÉRIENCE_** mystique pour découvrir ton ordinateur comme jamais auparavant.

C'est comme si ton système d'exploitation avait enfin décidé de se dévoiler dans une transe psychédélique digitale. Imagine un détective high-tech sous acide qui analyse ton hardware avec une précision chirurgicale et un style visuel hallucinant.

### 🤯 Pourquoi ToolBox va changer ta vie

- 🧙‍♂️ **Détection de l'OS** avec la finesse d'un sommelier du silicium
- 🔮 **Interface néomorphique** qui flotte comme si la gravité n'existait pas
- 🧠 **Architecture hybride** Go + React comme un cyborg digital surpuissant
- 🌈 **Thème sombre/clair** pour hacker à minuit ou coder en plein soleil
- 💎 **Animations fluides** qui feraient pleurer un designer d'interface

## 🚀 Installation (ou comment invoquer la bête)

```bash
# Clone le portail interdimensionnel
git clone https://github.com/ton-username/toolbox.git

# Téléporte-toi dans le dossier
cd toolbox

# Invoque les dépendances mystiques
go mod tidy

# Prépare l'interface neuronale
cd frontend
npm install # ou la formule sacrée 'pnpm install'
```

## 🔥 Mode développement (pour les sorciers numériques)

```bash
# Terminal 1 - Lance le backend Go en mode observation
wails dev

# Terminal 2 - La danse frontend en temps réel
cd frontend
npm run dev
```

> 💡 **ASTUCE DE MAÎTRE**: Ouvre <http://localhost:3000> pour entrer dans la dimension parallèle

## 🏗️ Construction (assemble ton artefact technologique)

```bash
# Compile la relique finale
wails build
```

Le trésor compilé t'attend dans le dossier `build/bin`!

## 🧰 Scripts et Commandes Magiques

### 🔮 Commandes Wails essentielles

```bash
# Démarre le mode développement (hot-reload inclus)
wails dev

# Compile uniquement le frontend
wails build -frontend-only

# Compile uniquement le backend
wails build -backend-only

# Crée une version release de l'application
wails build -production

# Pour les adeptes de Windows
wails build -platform windows

# Pour les fidèles de macOS
wails build -platform darwin

# Pour les disciples de Linux
wails build -platform linux
```

### 🧙‍♂️ Gestion des dépendances frontend

```bash
# Installation des dépendances avec npm
cd frontend && npm install

# Installation avec pnpm (recommandé)
cd frontend && pnpm install

# Si tu rencontres des conflits de dépendances
cd frontend && pnpm install --force

# Pour mettre à jour les dépendances
cd frontend && pnpm update
```

### 🔧 Debugging et dépannage

```bash
# Nettoyer le cache de développement Wails
rm -rf frontend/dist
rm -rf build/bin

# Si le port est déjà utilisé, trouve le processus
lsof -i :[port_number]   # Exemple: lsof -i :2024

# Tue le processus qui utilise le port
kill -9 [PID]

# Vérifier les erreurs TypeScript
cd frontend && pnpm run type-check

# Lancer le linter pour trouver les problèmes
cd frontend && pnpm run lint

# Corriger automatiquement les problèmes de linting
cd frontend && pnpm run lint:fix

# Vérifier si des modifications de package.json ont été faites
cd frontend && md5sum -c package.json.md5
```

### 🧠 Configuration et personnalisation

```bash
# Modifier le port du frontend (si 2024 est déjà utilisé)
# Édite frontend/package.json: "dev": "next dev -p XXXX"
# Et wails.json: "frontend:dev:serverUrl": "http://localhost:XXXX"

# Configure Git hooks pour le linting avant commit
cd frontend && pnpm run prepare

# Recompile le Wailsjs (si tu changes le backend Go)
wails generate module
```

### 🌐 Environnements spécifiques

```bash
# Variables d'environnement pour le dev
NODE_ENV=development wails dev

# Démarrage avec debug verbose
wails dev -v -loglevel debug
```

### 🔍 Commandes de déploiement

```bash
# Créer un paquet d'installation complet
wails build -platform windows -nsis
wails build -platform darwin -dmg

# Créer un binaire autonome
wails build -platform linux -o toolbox
```

## 🧪 Architecture magique

```
TOOLBOX/
├── 🧙‍♂️ go.mod                  # Grimoire des dépendances Go
├── 🧠 main.go                 # Cerveau principal de l'application
├── 🔮 app.go                  # Invocations magiques côté Go
├── 🌀 wails.json              # Configuration du portail dimensionnel
├── 📱 frontend/               # Interface neuronale
│   ├── 🌈 app/                # Composants Next.js avec App Router
│   ├── 🧩 components/         # Arsenal de composants UI
│   ├── 🔧 lib/                # Utilitaires et sortilèges
│   └── 🎭 wailsjs/            # Pont bindings Go → JS généré automatiquement
└── 📦 build/                  # Artefacts de compilation
```

## 🌌 Captures d'écran (ou fenêtres sur d'autres dimensions)

<p align="center">
  <img src="https://i.imgur.com/D4ORChc.png" width="45%" alt="Mode Clair" />
  &nbsp;&nbsp;
  <img src="https://i.imgur.com/tOBaCsZ.png" width="45%" alt="Mode Sombre" />
</p>

## 🛸 Fonctionnalités du futur (roadmap interdimensionnelle)

- [ ] 🔥 **Mode Benchmark** - Pousse ton CPU à bout et regarde-le transpirer
- [ ] 🧬 **Scan réseau avancé** - Cartographie ton LAN comme si tu étais la NSA
- [ ] 🧿 **Historique hardware** - Voyage dans le temps de tes composants
- [ ] 🌍 **Mode multi-système** - Scanne plusieurs machines en une seule interface
- [ ] 🦾 **Optimisations suggérées** - Laisse l'IA révéler le plein potentiel de ta machine

## 🧙‍♂️ L'alchimiste derrière TOOLBOX

Créé avec ❤️, 🔥, et une dose de folie par **Yanis**, explorateur des confins numériques.

Si tu as des idées folles ou des bugs dimensionnels, ouvre une issue sur GitHub ou propose une PR!

---

<p align="center">
  <strong>TOOLBOX</strong> — Car ton ordinateur mérite d'être compris dans toute sa splendeur.
</p>

<p align="center">
  <img src="https://i.imgur.com/SYAVmWp.gif" width="60%" alt="Animation TOOLBOX" />
</p>
