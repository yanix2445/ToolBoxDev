// Types pour l'application ToolBox

export interface OSInfo {
  name: string;
  version: string;
  arch: string;
  isMacOS: boolean;
  isWindows: boolean;
  cpuModel: string;
  gpuModel: string;
  memoryTotal: string;
  diskFree: string;
  diskTotal: string;
  osFullName: string;
}

export interface AppInstallCommand {
  appName: string;
  command: string;
  icon: string;
  category: string;
  description: string;
}

export interface AppCategoryInfo {
  name: string;
  description: string;
  icon: string;
  apps: string[];
}

export const AppCategories = [
  {
    name: 'Développement',
    description: 'Outils pour développeurs',
    icon: 'code',
    apps: ['git', 'nodejs', 'python', 'vscode'],
  },
  {
    name: 'Navigateurs',
    description: 'Navigateurs web',
    icon: 'globe',
    apps: ['chrome', 'firefox'],
  },
  {
    name: 'Utilitaires',
    description: 'Outils système et utilitaires',
    icon: 'tool',
    apps: ['docker', 'terminal', 'iterm2', 'powershell', 'wsl'],
  },
  {
    name: 'Productivité',
    description: 'Applications pour améliorer votre productivité',
    icon: 'zap',
    apps: ['alfred'],
  },
  {
    name: 'Serveurs',
    description: 'Logiciels serveurs et services',
    icon: 'server',
    apps: ['nginx', 'apache2'],
  },
];

export const AppIconMap: Record<string, string> = {
  git: 'git-branch',
  nodejs: 'nodejs',
  python: 'python',
  vscode: 'code',
  docker: 'docker',
  chrome: 'chrome',
  firefox: 'firefox',
  powershell: 'terminal',
  terminal: 'terminal',
  iterm2: 'terminal-square',
  wsl: 'linux',
  alfred: 'search',
  nginx: 'server',
  apache2: 'server',
  vim: 'pen-tool',
  homebrew: 'package',
};

export const AppDescriptions: Record<string, string> = {
  git: 'Système de contrôle de version décentralisé',
  nodejs: "Environnement d'exécution JavaScript côté serveur",
  python: 'Langage de programmation polyvalent et puissant',
  vscode: 'Éditeur de code source léger mais puissant',
  docker: 'Plateforme de conteneurisation',
  chrome: 'Navigateur web développé par Google',
  firefox: 'Navigateur web open-source développé par Mozilla',
  powershell: 'Émulateur de terminal pour Windows',
  terminal: 'Émulateur de terminal pour macOS',
  iterm2: 'Shell de ligne de commande et langage de script',
  wsl: 'Sous-système Windows pour Linux',
  alfred: 'Application de productivité pour macOS',
  nginx: 'Serveur web haute performance',
  apache2: 'Serveur HTTP open-source',
  vim: 'Éditeur de texte en ligne de commande',
  homebrew: 'Gestionnaire de paquets pour macOS',
};
