import { ValidationLevel, ValidationDetails, ValidationResult } from '../app/types';

// Dictionnaire de gestionnaires de paquets avec leurs commandes et options
export const packageManagerInfo: Record<
  string,
  {
    main: string;
    aliases: string[];
    installCmds: string[];
    installShortcuts: string[];
    commonOptions: Record<string, string>;
    platforms: string[];
  }
> = {
  brew: {
    main: 'brew',
    aliases: ['homebr', 'brew', 'hbrew'],
    installCmds: ['install', 'cask install', 'install --cask'],
    installShortcuts: ['i', 'in', 'ins'],
    commonOptions: {
      '--force': "Forcer l'installation même si le paquet existe déjà",
      '--verbose': "Afficher plus d'informations pendant l'installation",
      '--quiet': "Réduire la verbosité de l'installation",
      '--no-quarantine': 'Désactiver la mise en quarantaine macOS',
      '--debug': 'Afficher les informations de débogage',
    },
    platforms: ['darwin'],
  },
  winget: {
    main: 'winget',
    aliases: ['winget', 'wingit', 'wg'],
    installCmds: ['install'],
    installShortcuts: ['i', 'in', 'ins'],
    commonOptions: {
      '--silent': 'Installation silencieuse',
      '--interactive': 'Installation interactive',
      '--version': 'Spécifier une version à installer',
      '--source': 'Spécifier la source du paquet',
    },
    platforms: ['windows'],
  },
  apt: {
    main: 'apt',
    aliases: ['apt', 'apt-get'],
    installCmds: ['install'],
    installShortcuts: ['i', 'in', 'ins'],
    commonOptions: {
      '-y': 'Répondre oui automatiquement aux questions',
      '--no-install-recommends': 'Ne pas installer les paquets recommandés',
      '--reinstall': 'Réinstaller un paquet déjà installé',
      '--fix-broken': 'Tenter de réparer des dépendances cassées',
    },
    platforms: ['linux'],
  },
  dnf: {
    main: 'dnf',
    aliases: ['dnf', 'yum'],
    installCmds: ['install'],
    installShortcuts: ['i', 'in', 'ins'],
    commonOptions: {
      '-y': 'Répondre oui automatiquement aux questions',
      '--enablerepo': 'Activer un dépôt spécifique pour cette installation',
      '--best': 'Installer la meilleure version disponible',
      '--refresh': 'Rafraîchir le cache des métadonnées',
    },
    platforms: ['linux'],
  },
  pacman: {
    main: 'pacman',
    aliases: ['pacman', 'pac'],
    installCmds: ['-S'],
    installShortcuts: ['-s'],
    commonOptions: {
      '--noconfirm': 'Ne pas demander de confirmation',
      '--needed': 'Ne pas réinstaller les paquets à jour',
      '-q': 'Mode silencieux',
      '-v': 'Mode verbeux',
    },
    platforms: ['linux'],
  },
  snap: {
    main: 'snap',
    aliases: ['snap', 'snapd'],
    installCmds: ['install'],
    installShortcuts: ['i', 'in', 'ins'],
    commonOptions: {
      '--classic': 'Utiliser le mode classic (moins confiné)',
      '--edge': 'Installer la version edge (dev)',
      '--beta': 'Installer la version beta',
      '--channel': "Spécifier le canal d'installation",
    },
    platforms: ['linux'],
  },
  flatpak: {
    main: 'flatpak',
    aliases: ['flatpak', 'flat'],
    installCmds: ['install'],
    installShortcuts: ['i', 'in', 'ins'],
    commonOptions: {
      '--user': "Installer pour l'utilisateur actuel seulement",
      '--system': 'Installer au niveau système',
      '--assumeyes': 'Répondre oui automatiquement',
      '--verbose': 'Mode verbeux',
    },
    platforms: ['linux'],
  },
};

// Fonction pour déterminer si une option est connue et sûre
export function analyzeOption(
  option: string,
  packageManager: string
): { isKnown: boolean; isSuspicious: boolean; description: string } {
  // Options suspectes communes à tous les gestionnaires
  const suspiciousOptions = [
    'rm',
    'remove',
    'delete',
    'purge',
    '/etc',
    '/dev',
    '/usr',
    '/var',
    '/root',
    'curl',
    'wget',
    'bash',
    'sh',
    'sudo',
    'su',
    ';',
    '|',
    '&&',
    '||',
    '>',
    '>>',
    '<',
    'eval',
    'exec',
  ];

  // Vérifier si l'option est suspecte
  if (suspiciousOptions.some(o => option.includes(o))) {
    return {
      isKnown: false,
      isSuspicious: true,
      description: 'Cette option peut être dangereuse et compromettre la sécurité.',
    };
  }

  // Vérifier si l'option est connue pour ce gestionnaire
  const managerInfo = packageManagerInfo[packageManager];
  if (managerInfo) {
    for (const [knownOption, description] of Object.entries(managerInfo.commonOptions)) {
      if (option === knownOption || option.startsWith(knownOption + '=')) {
        return {
          isKnown: true,
          isSuspicious: false,
          description,
        };
      }
    }
  }

  // Option inconnue mais pas suspecte
  return {
    isKnown: false,
    isSuspicious: false,
    description: 'Option non reconnue mais probablement sans danger.',
  };
}

// Fonction pour analyser une commande complète et retourner des détails de validation complets
export function validateCommandWithDetails(
  command: string,
  appName: string,
  appAliases: string[] = [],
  currentPlatform: string = ''
): ValidationDetails {
  // Si commande vide
  if (!command || command.trim() === '') {
    return {
      level: 'error-syntax',
      message: 'La commande est vide.',
      suggestion: "Entrez une commande d'installation valide.",
      explanation:
        "Une commande d'installation doit contenir au minimum un gestionnaire de paquets, une action d'installation et le nom de l'application.",
    };
  }

  // Normalisation de la commande pour l'analyse
  const normalizedCmd = command.toLowerCase().trim().replace(/\s+/g, ' ');
  const cmdWords = normalizedCmd.split(/\s+/);

  // Vérification des motifs dangereux
  const suspiciousPatterns = [
    /rm\s+-rf/i, // commandes de suppression dangereuses
    /\/dev\/null/i, // redirections vers dev/null
    />\s*\/etc\//i, // écritures vers /etc
    />\s*\/dev\//i, // écritures vers /dev
    /sudo\s+rm/i, // sudo rm
    /;\s*rm/i, // point-virgule suivi de rm
    /\|\s*sh/i, // pipe vers shell
    /eval/i, // eval
    /exec/i, // exec
    /[<>|;]$/, // terminaison par des caractères de redirection
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(normalizedCmd)) {
      return {
        level: 'error-security',
        message: 'Motif suspect détecté dans la commande.',
        suggestion:
          "Évitez d'utiliser des caractères spéciaux ou des commandes système dangereuses.",
        explanation:
          'Cette commande contient des éléments qui pourraient compromettre la sécurité de votre système.',
      };
    }
  }

  // Détection du gestionnaire de paquets
  let detectedManager = '';
  let hasValidInstallAction = false;

  for (const [manager, info] of Object.entries(packageManagerInfo)) {
    // Vérifier si le gestionnaire est utilisé sur la bonne plateforme
    if (currentPlatform && !info.platforms.includes(currentPlatform)) {
      continue;
    }

    const managerFound = info.aliases.some(alias => cmdWords.includes(alias));

    if (managerFound) {
      detectedManager = manager;

      // Vérifier si une action d'installation valide est présente
      const managerIndex = cmdWords.findIndex(word => info.aliases.some(alias => word === alias));

      if (managerIndex !== -1 && managerIndex < cmdWords.length - 1) {
        // Vérifier les commandes d'installation complètes
        const hasFullCmd = info.installCmds.some(cmd => {
          const cmdParts = cmd.split(' ');
          let matches = true;

          for (let i = 0; i < cmdParts.length; i++) {
            if (
              managerIndex + 1 + i >= cmdWords.length ||
              cmdWords[managerIndex + 1 + i] !== cmdParts[i]
            ) {
              matches = false;
              break;
            }
          }

          return matches;
        });

        // Vérifier les raccourcis d'installation
        const nextWord = managerIndex + 1 < cmdWords.length ? cmdWords[managerIndex + 1] : '';
        const hasShortcut = nextWord ? info.installShortcuts.includes(nextWord as string) : false;

        hasValidInstallAction = hasFullCmd || hasShortcut;
      }

      break;
    }
  }

  // Si aucun gestionnaire de paquets n'est détecté
  if (!detectedManager) {
    return {
      level: 'error-manager',
      message: 'Aucun gestionnaire de paquets reconnu.',
      suggestion: `Utilisez un gestionnaire comme ${currentPlatform === 'darwin' ? 'brew' : currentPlatform === 'windows' ? 'winget' : 'apt ou snap'}`,
      explanation:
        "La commande doit commencer par un gestionnaire de paquets compatible avec votre système d'exploitation.",
    };
  }

  // Si l'action d'installation n'est pas valide
  if (!hasValidInstallAction) {
    const manager = packageManagerInfo[detectedManager] || {
      installCmds: ['install'],
      installShortcuts: ['i'],
    };

    return {
      level: 'error-syntax',
      message: "Action d'installation invalide ou manquante.",
      suggestion: `Utilisez ${manager.installCmds[0]} ou ${manager.installShortcuts[0]} après ${detectedManager}`,
      explanation: `Les actions d'installation valides pour ${detectedManager} sont: ${manager.installCmds.join(', ')} ou leurs raccourcis ${manager.installShortcuts.join(', ')}`,
    };
  }

  // Vérification stricte du nom de l'application
  const appNameLower = appName.toLowerCase();
  const allAliases = [...appAliases, appNameLower];

  // Vérifier si le nom exact de l'application ou un alias est présent comme mot entier
  const appNameFound = cmdWords.some(word => allAliases.includes(word));

  if (!appNameFound) {
    return {
      level: 'error-name',
      message: "Le nom exact de l'application est requis.",
      suggestion: `Utilisez "${appNameLower}" ou un alias officiel: ${appAliases.join(', ')}`,
      explanation:
        "Aucune variation ou abréviation n'est acceptée pour le nom de l'application, sauf les alias officiels.",
    };
  }

  // Analyse des options supplémentaires
  // Construire la commande de base pour comparer
  let baseCommand = '';
  switch (detectedManager) {
    case 'brew':
      baseCommand =
        normalizedCmd.includes('cask') || normalizedCmd.includes('--cask')
          ? `brew install --cask ${appNameLower}`
          : `brew install ${appNameLower}`;
      break;
    case 'winget':
      baseCommand = `winget install ${appNameLower}`;
      break;
    case 'apt':
    case 'dnf':
    case 'snap':
    case 'flatpak':
      baseCommand = `${detectedManager} install ${appNameLower}`;
      break;
    case 'pacman':
      baseCommand = `pacman -S ${appNameLower}`;
      break;
    default:
      baseCommand = `${detectedManager} install ${appNameLower}`;
  }

  const baseWords = baseCommand.toLowerCase().split(/\s+/);

  // Extraire les options supplémentaires
  const managerInfo = packageManagerInfo[detectedManager] || {
    installCmds: [] as string[],
    installShortcuts: [] as string[],
  };

  const extraOptions = cmdWords.filter(
    word =>
      !baseWords.includes(word) &&
      word !== detectedManager &&
      !managerInfo.installCmds.flatMap(cmd => cmd.split(' ')).includes(word) &&
      !managerInfo.installShortcuts.includes(word) &&
      !allAliases.includes(word)
  );

  // Si pas d'options, c'est une réussite totale
  if (extraOptions.length === 0) {
    return {
      level: 'success',
      message: 'Commande parfaitement valide.',
      explanation:
        "Cette commande utilise le gestionnaire de paquets adapté à votre système, avec l'action d'installation correcte et le nom exact de l'application.",
    };
  }

  // Analyser les options supplémentaires
  const unknownOptions: string[] = [];
  const knownOptions: string[] = [];
  const suspiciousOptions: string[] = [];

  for (const option of extraOptions) {
    const analysis = analyzeOption(option, detectedManager);

    if (analysis.isSuspicious) {
      suspiciousOptions.push(option);
    } else if (analysis.isKnown) {
      knownOptions.push(`${option} (${analysis.description})`);
    } else {
      unknownOptions.push(option);
    }
  }

  // Si options suspectes, c'est une erreur
  if (suspiciousOptions.length > 0) {
    return {
      level: 'error-security',
      message: 'Options potentiellement dangereuses détectées.',
      suggestion: `Retirez les options suspectes: ${suspiciousOptions.join(', ')}`,
      explanation:
        'Ces options pourraient compromettre la sécurité de votre système ou causer des comportements indésirables.',
    };
  }

  // Si options inconnues mais pas suspectes, c'est un avertissement
  if (unknownOptions.length > 0) {
    return {
      level: 'warning-options',
      message: 'Options non standards détectées.',
      suggestion: `Consultez la documentation de ${detectedManager} pour vérifier que ces options sont appropriées: ${unknownOptions.join(', ')}`,
      explanation:
        'Ces options ne sont pas reconnues comme standards pour ce gestionnaire de paquets, mais ne semblent pas dangereuses.',
    };
  }

  // Si seulement des options connues, c'est un succès avec options
  return {
    level: 'success-with-options',
    message: 'Commande valide avec options reconnues.',
    explanation: `Options utilisées: ${knownOptions.join(', ')}`,
  };
}

// Convertir le résultat détaillé en résultat simplifié pour la compatibilité
export function convertToSimpleResult(details: ValidationDetails): ValidationResult {
  switch (details.level) {
    case 'success':
    case 'success-with-options':
      return 'success';
    case 'warning-options':
    case 'warning-syntax':
      return 'warning';
    case 'error-name':
    case 'error-manager':
    case 'error-security':
    case 'error-syntax':
      return 'error';
    case 'loading':
      return 'loading';
    default:
      return null;
  }
}

// Générer une couleur pour chaque niveau de validation
export function getValidationColor(level: ValidationLevel): string {
  switch (level) {
    case 'success':
      return 'text-green-500';
    case 'success-with-options':
      return 'text-emerald-400';
    case 'warning-options':
      return 'text-amber-400';
    case 'warning-syntax':
      return 'text-yellow-500';
    case 'error-name':
      return 'text-red-400';
    case 'error-manager':
      return 'text-red-500';
    case 'error-security':
      return 'text-rose-600';
    case 'error-syntax':
      return 'text-red-500';
    case 'loading':
      return 'text-blue-400';
    default:
      return 'text-gray-400';
  }
}

// Générer une icône pour chaque niveau de validation
export function getValidationIcon(level: ValidationLevel): string {
  switch (level) {
    case 'success':
      return 'check-circle';
    case 'success-with-options':
      return 'check';
    case 'warning-options':
      return 'alert-triangle';
    case 'warning-syntax':
      return 'alert-circle';
    case 'error-name':
      return 'x-circle';
    case 'error-manager':
      return 'alert-octagon';
    case 'error-security':
      return 'shield-alert';
    case 'error-syntax':
      return 'x-octagon';
    case 'loading':
      return 'loader';
    default:
      return 'help-circle';
  }
}
