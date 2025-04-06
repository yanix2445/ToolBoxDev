'use client';

import {
  Terminal,
  Info as _Info,
  AlertCircle as _AlertCircle,
  Computer as _Computer,
  Monitor,
  HardDrive as _HardDrive,
  Download,
  Code,
  Package,
  Layers,
  Check,
  Copy,
  GitBranch,
  Globe,
  Wrench as Tool,
  Zap,
  Server,
  X,
  ExternalLink as _ExternalLink,
  Play as _Play,
  Pen as _Pen,
  Loader,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { FaApple, FaWindows, FaLinux } from 'react-icons/fa';

import { Icon } from '../components/Icon';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Card as _Card,
  CardHeader as _CardHeader,
  CardContent as _CardContent,
} from '../components/ui/card';
import _ValidationStatusIndicator from '../components/ValidationStatusIndicator';
import { validateCommandWithDetails, convertToSimpleResult } from '../lib/validationUtils';
import { Greet } from '../wailsjs/wailsjs/go/main/App';

import { OSInfo, AppCategories, AppIconMap, AppDescriptions, AppInstallCommand } from './types';
import type { ValidationLevel, ValidationDetails } from './types';

declare global {
  interface Window {
    go: {
      main: {
        App: {
          GetOSInfo(): Promise<OSInfo>;
          Greet(name: string): Promise<string>;
          InstallPackageManager(): Promise<string>;
          GetAvailableApps(): Promise<string[]>;
          GenerateInstallCommand(appName: string): Promise<string>;
          BrowserOpenURL(url: string): void;
          ValidateCommand(command: string, appName: string): Promise<string>;
        };
      };
    };
    runtime: {
      BrowserOpenURL(url: string): void;
    };
  }
}

// Fonction pour obtenir l'icône d'application
const getAppIcon = (iconName: string) => {
  switch (iconName) {
    case 'git-branch':
      return <GitBranch className="h-4 w-4" />;
    case 'nodejs':
      return <Code className="h-4 w-4" />;
    case 'python':
      return <Code className="h-4 w-4" />;
    case 'code':
      return <Code className="h-4 w-4" />;
    case 'docker':
      return <Layers className="h-4 w-4" />;
    case 'chrome':
      return <Globe className="h-4 w-4" />;
    case 'firefox':
      return <Globe className="h-4 w-4" />;
    case 'terminal':
      return <Terminal className="h-4 w-4" />;
    case 'terminal-square':
      return <Terminal className="h-4 w-4" />;
    case 'linux':
      return <Terminal className="h-4 w-4" />;
    case 'search':
      return <Zap className="h-4 w-4" />;
    case 'server':
      return <Server className="h-4 w-4" />;
    case 'pen-tool':
      return <Code className="h-4 w-4" />;
    case 'package':
      return <Package className="h-4 w-4" />;
    default:
      return <Package className="h-4 w-4" />;
  }
};

// Interface pour le CommandCard actuel (pour compatibilité)
interface CommandCardProps {
  app: AppInstallCommand;
  onValidate: (command: string, appName: string) => void;
  validationResults: Record<string, 'success' | 'warning' | 'error' | 'loading' | null>;
  commandValidating: boolean;
  onCopy: (command: string) => void;
}

// Composant CommandCard pour compatibilité avec le code existant
const _CommandCard: React.FC<CommandCardProps> = ({
  app,
  onValidate: _onValidate,
  validationResults,
  commandValidating,
  onCopy: _onCopy,
}) => {
  return (
    <div
      className={`p-4 border rounded-lg mb-4 transition-colors duration-300 ${
        validationResults[app.appName] === 'success'
          ? 'border-green-500 bg-green-500/10'
          : validationResults[app.appName] === 'warning'
            ? 'border-yellow-500 bg-yellow-500/10'
            : validationResults[app.appName] === 'error'
              ? 'border-red-500 bg-red-500/10'
              : 'border-gray-700'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-2">
          <span
            className={`inline-block p-2 rounded-md ${
              validationResults[app.appName] === 'success'
                ? 'bg-green-500/20'
                : validationResults[app.appName] === 'warning'
                  ? 'bg-yellow-500/20'
                  : validationResults[app.appName] === 'error'
                    ? 'bg-red-500/20'
                    : 'bg-gray-700/20'
            }`}
          >
            {app.icon && (
              <Icon
                icon={app.icon}
                className={`h-5 w-5 ${
                  validationResults[app.appName] === 'success'
                    ? 'text-green-500'
                    : validationResults[app.appName] === 'warning'
                      ? 'text-yellow-500'
                      : validationResults[app.appName] === 'error'
                        ? 'text-red-500'
                        : 'text-gray-400'
                }`}
              />
            )}
          </span>
          <div>
            <h3 className="font-medium">{app.appName}</h3>
            <p className="text-sm text-gray-400">{app.description}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {commandValidating ? (
            <Loader className="h-5 w-5 animate-spin text-blue-500" />
          ) : validationResults[app.appName] === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : validationResults[app.appName] === 'warning' ? (
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          ) : validationResults[app.appName] === 'error' ? (
            <XCircle className="h-5 w-5 text-red-500" />
          ) : (
            <div className="h-5 w-5" />
          )}
        </div>
      </div>

      <div className="mt-3">
        <div className="p-3 bg-gray-800 rounded-md flex justify-between items-center">
          <code className="text-sm break-all pr-2">{app.command}</code>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => _onCopy(app.command)}
            aria-label="Copier la commande"
            title="Copier la commande"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [greeting, setGreeting] = useState<string>('');
  const [osInfo, setOsInfo] = useState<OSInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [backendAvailable, setBackendAvailable] = useState<boolean>(false);
  const [_diskInfo, setDiskInfo] = useState<{ free: string; total: string }>({
    free: '',
    total: '',
  });
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);
  const [installerStatus, setInstallerStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle'
  );
  const [installerMessage, setInstallerMessage] = useState<string>('');
  const [availableApps, setAvailableApps] = useState<string[]>([]);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [appCommands, setAppCommands] = useState<AppInstallCommand[]>([]);
  const [appCommandsLoading, setAppCommandsLoading] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Toutes');
  const [_commandValidating, setCommandValidating] = useState<boolean>(false);
  const [validationResults, setValidationResults] = useState<{
    [key: string]: 'success' | 'warning' | 'error' | 'loading' | null;
  }>({});
  const [validationDetails, setValidationDetails] = useState<Record<string, ValidationDetails>>({});

  // Ajouter cette section pour centraliser les liens des OS
  const _osLinks = {
    macOS: {
      official: 'https://www.apple.com/macos/',
      video: 'https://www.youtube.com/watch?v=KQVFhUU1KzM',
      name: 'macOS',
      description:
        "Système élégant et intuitif d'Apple, parfaitement intégré à l'écosystème Apple.",
      bgColor: '#000000',
      borderColor: '#444444',
      iconBgColor: '#333333',
    },
    Windows: {
      official: 'https://www.microsoft.com/windows/',
      video: 'https://www.youtube.com/watch?v=6lTrZopI5y0',
      name: 'Windows',
      description:
        'Le système le plus utilisé au monde avec une large compatibilité matérielle et logicielle.',
      bgColor: '#0078d7',
      borderColor: '#0063b1',
      iconBgColor: '#0063b1',
    },
    Linux: {
      official: 'https://ubuntu.com/',
      video: 'https://www.youtube.com/watch?v=D9h_0dnSGWk',
      name: 'Linux',
      description:
        'Système open source hautement personnalisable avec de nombreuses distributions.',
      bgColor: '#e67e22',
      borderColor: '#d35400',
      iconBgColor: '#d35400',
    },
  };

  // Fonction pour ouvrir un lien en sécurité avec l'API Wails
  const _openLink = (url: string) => {
    try {
      // Utiliser l'API Wails pour ouvrir des URL via window.runtime
      if (window.runtime && typeof window.runtime.BrowserOpenURL === 'function') {
        window.runtime.BrowserOpenURL(url);
      } else if (
        window.go?.main?.App?.BrowserOpenURL &&
        typeof window.go.main.App.BrowserOpenURL === 'function'
      ) {
        // Fallback à notre implémentation personnalisée si disponible
        window.go.main.App.BrowserOpenURL(url);
      } else {
        // Fallback vers la méthode standard si l'API Wails n'est pas disponible
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error("Erreur lors de l'ouverture du lien:", error);
      // Tentative de fallback en cas d'erreur
      try {
        window.open(url, '_blank', 'noopener,noreferrer');
      } catch (fallbackError) {
        console.error('Erreur de fallback:', fallbackError);
        alert("Impossible d'ouvrir le lien. URL: " + url);
      }
    }
  };

  // Fonction pour rafraîchir les données du système
  const _refreshSystemInfo = async () => {
    setLoading(true);
    try {
      if (window.go?.main?.App?.GetOSInfo) {
        const newOsInfo = await window.go.main.App.GetOSInfo();
        setOsInfo(newOsInfo);
        setDiskInfo({
          free: newOsInfo.diskFree || '',
          total: newOsInfo.diskTotal || '',
        });
        setBackendAvailable(true);
      } else {
        console.log("La méthode GetOSInfo n'est pas disponible");
        setBackendAvailable(false);
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des données:', error);
      setBackendAvailable(false);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour installer un gestionnaire de paquets selon l'OS
  const installPackageManager = async () => {
    setInstallerStatus('loading');
    setInstallerMessage("Préparation de l'installation...");

    try {
      if (!osInfo) {
        throw new Error('Informations système non disponibles');
      }

      if (window.go?.main?.App?.InstallPackageManager) {
        const result = await window.go.main.App.InstallPackageManager();
        setInstallerMessage(result);
        setInstallerStatus('success');
      } else {
        throw new Error("La méthode InstallPackageManager n'est pas disponible");
      }
    } catch (error) {
      console.error("Erreur lors de l'installation:", error);
      setInstallerMessage("Une erreur s'est produite pendant l'installation.");
      setInstallerStatus('error');
    }
  };

  // Fonction pour charger la liste des applications disponibles pour cet OS
  const loadAvailableApps = async () => {
    try {
      if (window.go?.main?.App?.GetAvailableApps) {
        const apps = await window.go.main.App.GetAvailableApps();
        setAvailableApps(apps);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des applications disponibles:', error);
    }
  };

  // Fonction pour basculer la sélection d'une application
  const toggleAppSelection = (appName: string) => {
    if (selectedApps.includes(appName)) {
      setSelectedApps(selectedApps.filter(app => app !== appName));
    } else {
      setSelectedApps([...selectedApps, appName]);
    }
  };

  // Fonction pour vérifier la validité d'une commande d'installation
  const validateCommand = async (command: string, appName: string) => {
    console.log(`Validation de commande pour ${appName}: "${command}"`);
    setValidationResults(prev => ({ ...prev, [appName]: 'loading' }));
    setCommandValidating(true);

    // Vérification préliminaire de base
    if (!command || command.trim() === '') {
      console.log(`Commande vide pour ${appName}`);
      setValidationResults(prev => ({ ...prev, [appName]: 'error' }));
      setCommandValidating(false);
      return;
    }

    try {
      // Appeler l'API backend pour valider la commande
      if (window.go?.main?.App?.ValidateCommand) {
        const result = await window.go.main.App.ValidateCommand(command, appName);
        console.log(`Résultat de validation backend pour ${appName}: ${result}`);

        // Le backend renvoie une chaîne au format "status:message"
        const [status, message] = result.split(':', 2);
        console.log(`Validation pour ${appName}: ${status} - ${message}`);

        switch (status) {
          case 'success':
            setValidationResults(prev => ({ ...prev, [appName]: 'success' }));
            break;
          case 'warning':
            setValidationResults(prev => ({ ...prev, [appName]: 'warning' }));
            break;
          case 'error':
            setValidationResults(prev => ({ ...prev, [appName]: 'error' }));
            break;
          default:
            // Si le statut n'est pas reconnu, on considère comme une erreur
            console.log(`Statut non reconnu pour ${appName}: ${status}`);
            setValidationResults(prev => ({ ...prev, [appName]: 'error' }));
        }
      } else {
        // Fallback à la validation côté client si l'API n'est pas disponible
        console.log(
          "L'API ValidateCommand n'est pas disponible, utilisation de la validation côté client"
        );
        validateClientSide(command, appName);
      }
    } catch (error) {
      console.error(`Erreur lors de la validation de la commande pour ${appName}:`, error);
      // En cas d'erreur, on considère que la commande est invalide
      setValidationResults(prev => ({ ...prev, [appName]: 'error' }));
    } finally {
      setCommandValidating(false);
    }
  };

  // Fonction de validation côté client améliorée
  const validateClientSide = (command: string, appName: string): void => {
    console.log(`Validation côté client pour ${appName}: "${command}"`);

    // Vérification basique
    if (!command || command.trim() === '') {
      const errorDetails: ValidationDetails = {
        level: 'error-syntax',
        message: 'La commande est vide.',
        suggestion: "Entrez une commande d'installation valide.",
        explanation:
          "Une commande d'installation doit contenir au minimum un gestionnaire de paquets, une action d'installation et le nom de l'application.",
      };
      setValidationDetails(prev => ({ ...prev, [appName]: errorDetails }));
      setValidationResults(prev => ({ ...prev, [appName]: 'error' }));
      return;
    }

    // Déterminer les alias officiels pour cette application
    const aliases: Record<string, string[]> = {
      vscode: ['visual-studio-code', 'code', 'vs-code', 'vscodium', 'visualstudio'],
      chrome: ['google-chrome', 'chrome', 'chromium', 'googlechrome'],
      firefox: ['mozilla-firefox', 'firefox', 'mozilla', 'mozilla/firefox'],
      nodejs: ['node', 'node.js', 'node-js', 'npm'],
      git: ['git-scm', 'git', 'gitscm', 'git-client'],
      python: ['python3', 'python', 'py', 'py3', 'python-3'],
      docker: ['docker-desktop', 'docker', 'dockerdesktop', 'docker-engine'],
    };

    // Obtenir la plateforme actuelle
    let currentPlatform = '';
    if (osInfo?.platform) {
      currentPlatform = osInfo.platform;
    } else if (osInfo) {
      if (osInfo.isMacOS) {
        currentPlatform = 'darwin';
      } else if (osInfo.isWindows) {
        currentPlatform = 'windows';
      } else {
        currentPlatform = 'linux';
      }
    }

    // Utiliser la validation détaillée
    const details = validateCommandWithDetails(
      command,
      appName,
      aliases[appName.toLowerCase()] || [],
      currentPlatform
    );

    // Mettre à jour les deux états (détails et résultat simplifié pour compatibilité)
    setValidationDetails(prev => ({ ...prev, [appName]: details }));
    setValidationResults(prev => ({ ...prev, [appName]: convertToSimpleResult(details) }));
  };

  // Version améliorée de la fonction pour générer les commandes d'installation
  const generateInstallCommands = async () => {
    if (selectedApps.length === 0) return;

    setAppCommandsLoading(true);
    const commands: AppInstallCommand[] = [];
    setValidationResults({});

    try {
      for (const appName of selectedApps) {
        try {
          const command = await window.go.main.App.GenerateInstallCommand(appName);
          const category = getCategoryForApp(appName);

          // Ajouter la commande à la liste
          commands.push({
            appName,
            command,
            icon: AppIconMap[appName] || 'package',
            category,
            description: AppDescriptions[appName] || appName,
          });

          // Valider la commande après l'avoir générée
          validateCommand(command, appName);
        } catch (error) {
          console.error(`Erreur lors de la génération de la commande pour ${appName}:`, error);
          setValidationResults(prev => ({ ...prev, [appName]: 'error' }));
        }
      }

      setAppCommands(commands);
    } catch (error) {
      console.error('Erreur lors de la génération des commandes:', error);
    } finally {
      setAppCommandsLoading(false);
      setTimeout(() => {
        setCommandValidating(false);
      }, 1000); // Donner assez de temps pour que toutes les validations se terminent
    }
  };

  // Fonction pour copier la commande dans le presse-papiers
  const copyCommandToClipboard = (command: string) => {
    navigator.clipboard
      .writeText(command)
      .then(() => {
        console.log('Commande copiée dans le presse-papiers');
      })
      .catch(err => {
        console.error('Erreur lors de la copie de la commande:', err);
      });
  };

  // Fonction pour obtenir la catégorie d'une application
  const getCategoryForApp = (appName: string): string => {
    for (const category of AppCategories) {
      if (category.apps.includes(appName)) {
        return category.name;
      }
    }
    return 'Autre';
  };

  // Fonction pour obtenir l'icône de catégorie
  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName) {
      case 'Développement':
        return <Code className="h-4 w-4" />;
      case 'Navigateurs':
        return <Globe className="h-4 w-4" />;
      case 'Utilitaires':
        return <Tool className="h-4 w-4" />;
      case 'Productivité':
        return <Zap className="h-4 w-4" />;
      case 'Serveurs':
        return <Server className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  // Fonction pour générer une commande pour une application spécifique
  const generateCommandForApp = async (appName: string): Promise<string> => {
    try {
      // Utiliser l'API backend si disponible
      if (window.go?.main?.App?.GenerateInstallCommand) {
        return await window.go.main.App.GenerateInstallCommand(appName);
      }
      // Fallback vers une commande générique si l'API n'est pas disponible
      return `echo "Commande pour installer ${appName}"`;
    } catch (error) {
      console.error(`Erreur lors de la génération de la commande pour ${appName}:`, error);
      return `echo "Erreur: Impossible de générer la commande pour ${appName}"`;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const message = await Greet('ToolBox');
        setGreeting(message);

        // Essayer d'appeler GetOSInfo directement
        if (
          window.go &&
          window.go.main &&
          window.go.main.App &&
          typeof window.go.main.App.GetOSInfo === 'function'
        ) {
          try {
            const osInfo = await window.go.main.App.GetOSInfo();
            setOsInfo(osInfo);
            setDiskInfo({
              free: osInfo.diskFree || '',
              total: osInfo.diskTotal || '',
            });
            setBackendAvailable(true);
          } catch (err) {
            console.error('Erreur l&apos;appel à GetOSInfo:', err);
            setBackendAvailable(false);
          }
        } else {
          console.log('La méthode GetOSInfo n&apos;est pas disponible');
          setBackendAvailable(false);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Configurer une mise à jour périodique des informations de disque
    const interval = window.setInterval(async () => {
      if (window.go?.main?.App?.GetOSInfo) {
        try {
          const osInfo = await window.go.main.App.GetOSInfo();
          setDiskInfo({
            free: osInfo.diskFree || '',
            total: osInfo.diskTotal || '',
          });
        } catch (err) {
          console.error('Erreur lors de la mise à jour des informations de disque:', err);
        }
      }
    }, 5000); // Mise à jour toutes les 5 secondes

    setRefreshInterval(interval);

    // Charger la liste des applications disponibles
    loadAvailableApps();

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  // Réinitialiser les commandes quand la sélection change
  useEffect(() => {
    setAppCommands([]);
  }, [selectedApps]);

  // Fonction pour déterminer si un OS est l'OS actuel détecté
  const isDetectedOS = (osName: string): boolean => {
    if (!osInfo) return false;

    if (osInfo.platform) {
      const platform = osInfo.platform.toLowerCase();
      if (osName === 'macOS' && platform === 'darwin') return true;
      if (osName === 'Windows' && platform === 'windows') return true;
      if (osName === 'Linux' && platform === 'linux') return true;
      return false;
    }

    // Fallback pour la compatibilité avec les anciennes versions
    if (osName === 'macOS' && osInfo.isMacOS) return true;
    if (osName === 'Windows' && osInfo.isWindows) return true;
    if (
      osName === 'Linux' &&
      !osInfo.isMacOS &&
      !osInfo.isWindows &&
      osInfo.name.toLowerCase().includes('linux')
    )
      return true;

    return false;
  };

  // Fonction de calcul du pourcentage d'utilisation du disque
  const calculateUsedPercentage = (free: string, total: string): number => {
    try {
      // Extraire les valeurs numériques et convertir en Go
      const freeValue = parseFloat(free.replace(/[^0-9,.]/g, '').replace(',', '.'));
      const totalValue = parseFloat(total.replace(/[^0-9,.]/g, '').replace(',', '.'));

      if (isNaN(freeValue) || isNaN(totalValue) || totalValue === 0) {
        return 0;
      }

      const usedPercentage = Math.round(((totalValue - freeValue) / totalValue) * 100);
      return usedPercentage;
    } catch (e) {
      return 0;
    }
  };

  // Fonction utilitaire pour obtenir la couleur de fond selon le niveau de validation
  const _getValidationBackgroundColor = (level: ValidationLevel): string => {
    switch (level) {
      case 'success':
      case 'success-with-options':
        return 'bg-green-500/20';
      case 'warning-options':
      case 'warning-syntax':
        return 'bg-yellow-500/20';
      case 'error-name':
      case 'error-manager':
      case 'error-security':
      case 'error-syntax':
        return 'bg-red-500/20';
      case 'loading':
        return 'bg-blue-500/20';
      default:
        return 'bg-gray-700/20';
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-6 bg-gradient-to-b from-background to-background/90">
      <div className="w-full max-w-4xl space-y-6">
        {greeting && (
          <div className="relative overflow-hidden rounded-2xl backdrop-blur-sm border border-primary/20 bg-gradient-to-r from-background/80 to-background/40 shadow-lg group hover:shadow-primary/10 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-40"></div>
            <div className="relative p-4 flex gap-3 items-start z-10">
              <div className="bg-primary/5 p-2 rounded-full icon-3d-metallic animated">
                <Terminal className="h-5 w-5 text-primary" />
                <div className="reflective-effect"></div>
              </div>
              <div>
                <h3 className="font-semibold text-base">Bienvenue dans ToolBox</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Aperçu des informations système
                </p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-6">
            <div className="h-48 w-full rounded-2xl overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-muted/20 to-muted/10 animate-pulse"></div>
              <div className="absolute inset-0 border border-primary/10 rounded-2xl"></div>
            </div>
            <div className="h-36 w-full rounded-2xl overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-muted/20 to-muted/10 animate-pulse"></div>
              <div className="absolute inset-0 border border-primary/10 rounded-2xl"></div>
            </div>
          </div>
        ) : backendAvailable ? (
          <div className="space-y-6">
            {/* OS Détecté - Design moderne */}
            {isDetectedOS('macOS') && (
              <div className="relative overflow-hidden rounded-2xl shadow-lg group hover:shadow-xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-40"></div>
                <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-lg"></div>

                <div className="relative z-10 grid grid-cols-12 gap-0 overflow-hidden">
                  <div className="col-span-12 sm:col-span-4 p-4 backdrop-blur-sm backdrop-saturate-150 flex items-center gap-4 bg-background/62">
                    <div className="p-3 rounded-full bg-primary/15 shadow-lg backdrop-blur-none relative icon-3d-metallic animated ring-1 ring-primary/30">
                      <FaApple className="h-8 w-8 text-primary icon-apple" />
                      <div className="reflective-effect"></div>
                    </div>
                    <div>
                      <h3 className="font-bold text-base">macOS</h3>
                      {osInfo && <p className="text-sm opacity-80">{osInfo.version}</p>}
                    </div>
                  </div>

                  <div className="col-span-12 sm:col-span-8 p-4 backdrop-blur-sm backdrop-saturate-150 bg-background/40 grid grid-cols-3 gap-4">
                    {osInfo && (
                      <>
                        <div className="rounded-xl overflow-hidden bg-background/50 backdrop-blur-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] group">
                          <div className="p-3 bg-gradient-to-br from-primary/10 to-transparent">
                            <p className="text-xs font-medium">Puce</p>
                          </div>
                          <p className="px-3 py-2 font-medium text-sm truncate">
                            {osInfo.cpuModel || 'Non détecté'}
                          </p>
                        </div>
                        <div className="rounded-xl overflow-hidden bg-background/50 backdrop-blur-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] group">
                          <div className="p-3 bg-gradient-to-br from-primary/10 to-transparent">
                            <p className="text-xs font-medium">RAM</p>
                          </div>
                          <p className="px-3 py-2 font-medium text-sm">
                            {osInfo.memoryTotal || 'Non détecté'}
                          </p>
                        </div>
                        <div className="rounded-xl overflow-hidden bg-background/50 backdrop-blur-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] group">
                          <div className="p-3 bg-gradient-to-br from-primary/10 to-transparent">
                            <p className="text-xs font-medium">Stockage</p>
                          </div>
                          <p className="px-3 py-2 font-medium text-sm truncate">
                            {osInfo.diskFree || '?'}/{osInfo.diskTotal || '?'}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {isDetectedOS('Windows') && (
              <div className="relative overflow-hidden rounded-2xl shadow-md bg-gradient-to-br from-background/95 via-background/90 to-background/85 backdrop-blur-none group hover:shadow-lg transition-all duration-700 transform hover:scale-[1.01] hover:translate-y-[-2px] before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/5 before:via-primary/3 before:via-primary/2 before:to-transparent before:opacity-40 before:z-[-1]">
                <div className="absolute inset-0 bg-noise opacity-5 mix-blend-soft-light"></div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-primary/5 via-primary/4 via-primary/3 via-primary/2 to-transparent rounded-full blur-xl opacity-30 transition-opacity duration-700 group-hover:opacity-40"></div>
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-tr from-primary/5 via-primary/4 via-primary/3 via-primary/2 to-transparent rounded-full blur-xl opacity-20 transition-opacity duration-700 group-hover:opacity-30"></div>

                <div className="relative z-10 grid grid-cols-12 gap-0 overflow-hidden">
                  <div className="col-span-12 sm:col-span-4 p-4 backdrop-blur-sm backdrop-saturate-150 flex items-center gap-4 bg-background/60">
                    <div className="p-3 rounded-full bg-primary/15 shadow-lg backdrop-blur-none relative icon-3d-metallic icon-silver animated ring-1 ring-primary/30">
                      <FaWindows className="h-8 w-8 text-primary icon-windows" />
                      <div className="reflective-effect"></div>
                    </div>
                    <div>
                      <h3 className="font-bold text-base">Windows</h3>
                      {osInfo && <p className="text-sm opacity-80">{osInfo.osFullName}</p>}
                    </div>
                  </div>

                  <div className="col-span-12 sm:col-span-8 p-4 backdrop-blur-sm backdrop-saturate-150 bg-background/40 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {osInfo && (
                      <>
                        <div className="rounded-xl overflow-hidden bg-background/50 backdrop-blur-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                          <div className="p-3 bg-gradient-to-br from-primary/10 to-transparent">
                            <p className="text-xs font-medium">CPU</p>
                          </div>
                          <p className="px-3 py-2 font-medium text-sm truncate">
                            {osInfo.cpuModel || 'Non détecté'}
                          </p>
                        </div>
                        <div className="rounded-xl overflow-hidden bg-background/50 backdrop-blur-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                          <div className="p-3 bg-gradient-to-br from-primary/10 to-transparent">
                            <p className="text-xs font-medium">GPU</p>
                          </div>
                          <p className="px-3 py-2 font-medium text-sm truncate">
                            {osInfo.gpuModel || 'Non détecté'}
                          </p>
                        </div>
                        <div className="rounded-xl overflow-hidden bg-background/50 backdrop-blur-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                          <div className="p-3 bg-gradient-to-br from-primary/10 to-transparent">
                            <p className="text-xs font-medium">RAM</p>
                          </div>
                          <p className="px-3 py-2 font-medium text-sm">
                            {osInfo.memoryTotal || 'Non détecté'}
                          </p>
                        </div>
                        <div className="rounded-xl overflow-hidden bg-background/50 backdrop-blur-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                          <div className="p-3 bg-gradient-to-br from-primary/10 to-transparent">
                            <p className="text-xs font-medium">Stockage</p>
                          </div>
                          <p className="px-3 py-2 font-medium text-sm truncate">
                            {osInfo.diskFree || '?'}/{osInfo.diskTotal || '?'}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {isDetectedOS('Linux') && (
              <div className="relative overflow-hidden rounded-2xl shadow-md bg-gradient-to-br from-background/95 via-background/90 to-background/85 backdrop-blur-none group hover:shadow-lg transition-all duration-700 transform hover:scale-[1.01] hover:translate-y-[-2px] before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/5 before:via-primary/3 before:via-primary/2 before:to-transparent before:opacity-40 before:z-[-1]">
                <div className="absolute inset-0 bg-noise opacity-5 mix-blend-soft-light"></div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-primary/5 via-primary/4 via-primary/3 via-primary/2 to-transparent rounded-full blur-xl opacity-30 transition-opacity duration-700 group-hover:opacity-40"></div>
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-tr from-primary/5 via-primary/4 via-primary/3 via-primary/2 to-transparent rounded-full blur-xl opacity-20 transition-opacity duration-700 group-hover:opacity-30"></div>

                <div className="relative z-10 grid grid-cols-12 gap-0 overflow-hidden">
                  <div className="col-span-12 sm:col-span-4 p-4 backdrop-blur-sm backdrop-saturate-150 flex items-center gap-4 bg-background/60">
                    <div className="p-3 rounded-full bg-primary/20 shadow-lg backdrop-blur-none relative icon-3d-metallic icon-gold animated ring-1 ring-primary/40">
                      <FaLinux className="h-8 w-8 text-primary/90 icon-linux" />
                      <div className="reflective-effect"></div>
                    </div>
                    <div>
                      <h3 className="font-bold text-base">Linux</h3>
                      {osInfo && <p className="text-sm opacity-80">{osInfo.osFullName}</p>}
                    </div>
                  </div>

                  <div className="col-span-12 sm:col-span-8 p-4 backdrop-blur-sm backdrop-saturate-150 bg-background/40 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {osInfo && (
                      <>
                        <div className="rounded-xl overflow-hidden bg-background/50 backdrop-blur-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                          <div className="p-3 bg-gradient-to-br from-primary/10 to-transparent">
                            <p className="text-xs font-medium">CPU</p>
                          </div>
                          <p className="px-3 py-2 font-medium text-sm truncate">
                            {osInfo.cpuModel || 'Non détecté'}
                          </p>
                        </div>
                        <div className="rounded-xl overflow-hidden bg-background/50 backdrop-blur-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                          <div className="p-3 bg-gradient-to-br from-primary/10 to-transparent">
                            <p className="text-xs font-medium">GPU</p>
                          </div>
                          <p className="px-3 py-2 font-medium text-sm truncate">
                            {osInfo.gpuModel || 'Non détecté'}
                          </p>
                        </div>
                        <div className="rounded-xl overflow-hidden bg-background/50 backdrop-blur-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                          <div className="p-3 bg-gradient-to-br from-primary/10 to-transparent">
                            <p className="text-xs font-medium">RAM</p>
                          </div>
                          <p className="px-3 py-2 font-medium text-sm">
                            {osInfo.memoryTotal || 'Non détecté'}
                          </p>
                        </div>
                        <div className="rounded-xl overflow-hidden bg-background/50 backdrop-blur-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                          <div className="p-3 bg-gradient-to-br from-primary/10 to-transparent">
                            <p className="text-xs font-medium">Stockage</p>
                          </div>
                          <p className="px-3 py-2 font-medium text-sm truncate">
                            {osInfo.diskFree || '?'}/{osInfo.diskTotal || '?'}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Détails techniques avec texture */}
            <div className="relative overflow-hidden rounded-2xl shadow-md bg-gradient-to-br from-background/95 via-background/90 to-background/85 backdrop-blur-none group hover:shadow-lg transition-all duration-700 transform hover:scale-[1.01] hover:translate-y-[-2px] before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/5 before:via-primary/3 before:via-primary/2 before:to-transparent before:opacity-40 before:z-[-1]">
              <div className="absolute inset-0 bg-noise opacity-5 mix-blend-soft-light"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-primary/5 via-primary/4 via-primary/3 via-primary/2 to-transparent rounded-full blur-xl opacity-30 transition-opacity duration-700 group-hover:opacity-40"></div>
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-tr from-primary/5 via-primary/4 via-primary/3 via-primary/2 to-transparent rounded-full blur-xl opacity-20 transition-opacity duration-700 group-hover:opacity-30"></div>
              <div className="py-3 px-4 relative z-10 border-b border-primary/10 bg-gradient-to-r from-primary/5 via-primary/4 via-primary/3 via-primary/2 to-transparent flex items-center gap-2 shadow-sm">
                <div className="p-2 rounded-full bg-primary/20 shadow-lg backdrop-blur-none transform transition-transform duration-700 ease-in-out group-hover:scale-105 icon-3d-metallic animated ring-1 ring-primary/30">
                  <Monitor className="h-6 w-6 text-primary" />
                  <div className="reflective-effect"></div>
                </div>
                <h2 className="text-primary font-bold text-lg font-heading">Système</h2>
              </div>
              <div className="p-4 relative z-10 bg-gradient-to-b from-transparent via-background/10 via-background/20 via-background/30 to-background/40">
                {osInfo && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="space-y-2 transform transition-all duration-500 hover:translate-y-[-2px] hover:scale-[1.02]">
                      <p className="text-xs opacity-70 font-medium ml-1">Système</p>
                      <div className="rounded-xl p-3 bg-gradient-to-br from-background/85 via-background/80 via-background/75 to-background/65 shadow-md backdrop-blur-sm border border-primary/10 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/5 before:via-primary/4 before:via-primary/3 before:via-primary/2 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity duration-700 ease-in-out">
                        <div className="absolute inset-0 bg-noise opacity-8 mix-blend-soft-light"></div>
                        <p className="font-medium text-sm truncate relative z-10">
                          {osInfo.osFullName || `${osInfo.name} ${osInfo.version}`}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 transform transition-all duration-500 hover:translate-y-[-2px] hover:scale-[1.02]">
                      <p className="text-xs opacity-70 font-medium ml-1">Architecture</p>
                      <div className="rounded-xl p-3 bg-gradient-to-br from-background/85 via-background/80 via-background/75 to-background/65 shadow-md backdrop-blur-sm border border-primary/10 flex items-center justify-between relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/5 before:via-primary/4 before:via-primary/3 before:via-primary/2 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity duration-700 ease-in-out">
                        <div className="absolute inset-0 bg-noise opacity-8 mix-blend-soft-light"></div>
                        <p className="font-medium text-sm relative z-10">{osInfo.arch}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-primary/25 via-primary/22 via-primary/20 via-primary/18 to-primary/15 border border-primary/30 shadow-inner relative z-10 backdrop-blur-sm">
                          {osInfo.arch === 'arm64' ? 'ARM' : 'x86'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 transform transition-all duration-500 hover:translate-y-[-2px] hover:scale-[1.02]">
                      <p className="text-xs opacity-70 font-medium ml-1">Stockage Total</p>
                      <div className="rounded-xl p-3 bg-gradient-to-br from-background/85 via-background/80 via-background/75 to-background/65 shadow-md backdrop-blur-sm border border-primary/10 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/5 before:via-primary/4 before:via-primary/3 before:via-primary/2 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity duration-700 ease-in-out">
                        <div className="absolute inset-0 bg-noise opacity-8 mix-blend-soft-light"></div>
                        <p className="font-medium text-sm relative z-10">
                          {osInfo.diskTotal || 'Non détecté'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 transform transition-all duration-500 hover:translate-y-[-2px] hover:scale-[1.02]">
                      <p className="text-xs opacity-70 font-medium ml-1">Utilisé</p>
                      <div className="rounded-xl p-3 bg-gradient-to-br from-background/85 via-background/80 via-background/75 to-background/65 shadow-md backdrop-blur-sm border border-primary/10 flex items-center justify-between relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/5 before:via-primary/4 before:via-primary/3 before:via-primary/2 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity duration-700 ease-in-out">
                        <div className="absolute inset-0 bg-noise opacity-8 mix-blend-soft-light"></div>
                        <p className="font-medium text-sm relative z-10">
                          {osInfo.diskFree || '?'}
                        </p>
                        {osInfo.diskFree && osInfo.diskTotal && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-primary/25 via-primary/22 via-primary/20 via-primary/18 to-primary/15 border border-primary/30 shadow-inner relative z-10 backdrop-blur-sm">
                            {calculateUsedPercentage(osInfo.diskFree, osInfo.diskTotal)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section d'installation du gestionnaire de paquets */}
            <div className="relative overflow-hidden rounded-2xl shadow-md bg-gradient-to-br from-background/95 via-background/90 to-background/85 backdrop-blur-none group hover:shadow-lg transition-all duration-700 transform hover:scale-[1.01] hover:translate-y-[-2px] before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/5 before:via-primary/3 before:via-primary/2 before:to-transparent before:opacity-40 before:z-[-1]">
              <div className="absolute inset-0 bg-noise opacity-5 mix-blend-soft-light"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-primary/5 via-primary/4 via-primary/3 via-primary/2 to-transparent rounded-full blur-xl opacity-30 transition-opacity duration-700 group-hover:opacity-40"></div>
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-tr from-primary/5 via-primary/4 via-primary/3 via-primary/2 to-transparent rounded-full blur-xl opacity-20 transition-opacity duration-700 group-hover:opacity-30"></div>
              <div className="py-3 px-4 relative z-10 border-b border-primary/10 bg-gradient-to-r from-primary/5 via-primary/4 via-primary/3 via-primary/2 to-transparent flex items-center gap-2 shadow-sm">
                <div className="p-2 rounded-full bg-primary/20 shadow-lg backdrop-blur-none transform transition-transform duration-700 ease-in-out group-hover:scale-105 icon-3d-metallic animated ring-1 ring-primary/30">
                  <Download className="h-6 w-6 text-primary" />
                  <div className="reflective-effect"></div>
                </div>
                <h2 className="text-primary font-bold text-lg font-heading">
                  Gestionnaire de paquets
                </h2>
              </div>
              <div className="p-4 relative z-10 bg-gradient-to-b from-transparent via-background/10 via-background/20 via-background/30 to-background/40">
                <div className="space-y-4">
                  {osInfo && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {osInfo.isMacOS
                          ? 'Installez Homebrew, le gestionnaire de paquets pour macOS.'
                          : osInfo.isWindows
                            ? 'Installez Winget, le gestionnaire de paquets pour Windows.'
                            : 'Utilisez le gestionnaire de paquets pour votre distribution Linux.'}
                      </p>
                      <div className="rounded-xl p-4 bg-gradient-to-br from-background/85 to-background/65 shadow-md backdrop-blur-sm border border-primary/10 overflow-hidden">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="space-y-2">
                            <h3 className="font-semibold text-primary">
                              {osInfo.isMacOS
                                ? 'Homebrew'
                                : osInfo.isWindows
                                  ? 'Windows Package Manager (winget)'
                                  : 'Gestionnaire de paquets Linux'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {osInfo.isMacOS
                                ? 'Le gestionnaire de paquets manquant pour macOS'
                                : osInfo.isWindows
                                  ? 'Le gestionnaire de paquets officiel pour Windows'
                                  : 'Mettez à jour vos dépôts et paquets'}
                            </p>
                            {installerStatus !== 'idle' && (
                              <div
                                className={`mt-2 p-3 rounded-lg ${
                                  installerStatus === 'error'
                                    ? 'bg-destructive/10 text-destructive'
                                    : installerStatus === 'success'
                                      ? 'bg-green-500/10 text-green-500'
                                      : 'bg-primary/10 text-primary animate-pulse'
                                }`}
                              >
                                <p className="text-sm font-medium">{installerMessage}</p>
                              </div>
                            )}
                          </div>
                          <Button
                            onClick={installPackageManager}
                            disabled={installerStatus === 'loading'}
                            className="h-9 px-4 rounded-xl bg-primary/80 hover:bg-primary/90 backdrop-blur-sm shadow-md hover:shadow transform transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group"
                          >
                            {installerStatus === 'loading' ? (
                              <>
                                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                Installation...
                              </>
                            ) : (
                              <>
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <Download className="h-4 w-4 mr-2 relative z-10" />
                                <span className="relative z-10">
                                  {installerStatus === 'success'
                                    ? 'Instructions affichées'
                                    : 'Installer'}
                                </span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section d'installation des applications */}
            <div className="relative overflow-hidden rounded-2xl shadow-md bg-gradient-to-br from-background/95 via-background/90 to-background/85 backdrop-blur-none group hover:shadow-lg transition-all duration-700 transform hover:scale-[1.01] hover:translate-y-[-2px] before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/5 before:via-primary/3 before:via-primary/2 before:to-transparent before:opacity-40 before:z-[-1]">
              <div className="absolute inset-0 bg-noise opacity-5 mix-blend-soft-light"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-primary/5 via-primary/4 via-primary/3 via-primary/2 to-transparent rounded-full blur-xl opacity-30 transition-opacity duration-700 group-hover:opacity-40"></div>
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-tr from-primary/5 via-primary/4 via-primary/3 via-primary/2 to-transparent rounded-full blur-xl opacity-20 transition-opacity duration-700 group-hover:opacity-30"></div>
              <div className="py-3 px-4 relative z-10 border-b border-primary/10 bg-gradient-to-r from-primary/5 via-primary/4 via-primary/3 via-primary/2 to-transparent flex items-center gap-2 shadow-sm">
                <div className="p-2 rounded-full bg-primary/20 shadow-lg backdrop-blur-none transform transition-transform duration-700 ease-in-out group-hover:scale-105 icon-3d-metallic animated ring-1 ring-primary/30">
                  <Package className="h-6 w-6 text-primary" />
                  <div className="reflective-effect"></div>
                </div>
                <h2 className="text-primary font-bold text-lg font-heading">
                  Installer des applications
                </h2>
              </div>
              <div className="p-4 relative z-10 bg-gradient-to-b from-transparent via-background/10 via-background/20 via-background/30 to-background/40">
                <div className="space-y-4">
                  {osInfo && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Sélectionnez les applications que vous souhaitez installer sur votre système{' '}
                        {osInfo.isMacOS ? 'macOS' : osInfo.isWindows ? 'Windows' : 'Linux'}.
                      </p>

                      {/* Navigation par catégories - version centrée et améliorée */}
                      <div className="flex flex-wrap justify-center overflow-x-auto py-3 px-1 mb-6 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                        <Button
                          variant={selectedCategory === 'Toutes' ? 'default' : 'ghost'}
                          size="sm"
                          className={`m-1 whitespace-nowrap rounded-full px-4 ${
                            selectedCategory === 'Toutes'
                              ? 'bg-primary/20 text-primary hover:bg-primary/30 shadow-sm shadow-primary/20'
                              : 'hover:bg-background/80 hover:text-primary/90'
                          }`}
                          onClick={() => setSelectedCategory('Toutes')}
                        >
                          <Package className="h-4 w-4 mr-2" />
                          Toutes
                        </Button>

                        {AppCategories.map(category => {
                          // Ne montrer que les catégories qui ont des applications disponibles
                          const hasApps = category.apps.some(app => availableApps.includes(app));
                          if (!hasApps) return null;

                          return (
                            <Button
                              key={category.name}
                              variant={selectedCategory === category.name ? 'default' : 'ghost'}
                              size="sm"
                              className={`m-1 whitespace-nowrap rounded-full px-3 ${
                                selectedCategory === category.name
                                  ? 'bg-primary/20 text-primary hover:bg-primary/30 shadow-sm shadow-primary/20'
                                  : 'hover:bg-background/80 hover:text-primary/90'
                              }`}
                              onClick={() => setSelectedCategory(category.name)}
                            >
                              <span className="mr-1.5">{getCategoryIcon(category.name)}</span>
                              {category.name}
                            </Button>
                          );
                        })}
                      </div>

                      {/* Sélection d'applications par catégorie */}
                      <div className="space-y-6">
                        {AppCategories.map(category => {
                          // Si une catégorie spécifique est sélectionnée et ce n'est pas celle-ci, passer
                          if (selectedCategory !== 'Toutes' && selectedCategory !== category.name) {
                            return null;
                          }

                          const filteredApps = category.apps.filter(app =>
                            availableApps.includes(app)
                          );

                          if (filteredApps.length === 0) return null;

                          return (
                            <div key={category.name} className="space-y-2">
                              <div className="flex items-center gap-2">
                                {getCategoryIcon(category.name)}
                                <h3 className="text-sm font-semibold">{category.name}</h3>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {filteredApps.map(app => (
                                  <Button
                                    key={app}
                                    variant={selectedApps.includes(app) ? 'default' : 'outline'}
                                    size="sm"
                                    className={`h-auto py-2 px-3 justify-start gap-2 text-left ${
                                      selectedApps.includes(app)
                                        ? 'bg-primary/20 text-primary border-primary/30'
                                        : 'hover:bg-primary/10 hover:text-primary/90'
                                    }`}
                                    onClick={() => toggleAppSelection(app)}
                                  >
                                    {getAppIcon(AppIconMap[app] || 'package')}
                                    <span className="flex-1 truncate">{app}</span>
                                    {selectedApps.includes(app) && (
                                      <Check className="h-3 w-3 ml-1 flex-shrink-0" />
                                    )}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          );
                        })}

                        {/* Message si aucune application n'est disponible dans la catégorie sélectionnée */}
                        {selectedCategory !== 'Toutes' &&
                          !AppCategories.some(
                            cat =>
                              cat.name === selectedCategory &&
                              cat.apps.some(app => availableApps.includes(app))
                          ) && (
                            <div className="p-4 rounded-lg bg-background/50 text-center">
                              <p className="text-sm text-muted-foreground">
                                Aucune application disponible dans la catégorie {selectedCategory}
                              </p>
                            </div>
                          )}
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex justify-between items-center">
                        <div>
                          {selectedApps.length > 0 && (
                            <Badge variant="outline" className="bg-primary/10 text-primary">
                              {selectedApps.length} application
                              {selectedApps.length > 1 ? 's' : ''} sélectionnée
                              {selectedApps.length > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {selectedApps.length > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-8"
                              onClick={() => setSelectedApps([])}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Effacer
                            </Button>
                          )}
                          <Button
                            onClick={generateInstallCommands}
                            disabled={selectedApps.length === 0 || appCommandsLoading}
                            className="h-8 px-3 rounded-xl bg-primary/80 hover:bg-primary/90 backdrop-blur-sm shadow-md hover:shadow transform transition-all duration-300 hover:scale-[1.02] text-xs relative overflow-hidden group"
                          >
                            {appCommandsLoading ? (
                              <>
                                <div className="h-3 w-3 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                Générer les commandes
                              </>
                            ) : (
                              <>
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <Terminal className="h-3 w-3 mr-1 relative z-10" />
                                <span className="relative z-10">Générer les commandes</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Affichage des commandes générées */}
                      {appCommands.length > 0 && (
                        <div className="mt-6 space-y-3">
                          <h3 className="text-sm font-medium">Commandes d&apos;installation</h3>
                          <div>
                            {appCommands.map((app, index) => (
                              <div
                                key={`app-cmd-${index}-${app.appName}`}
                                className={`p-4 border rounded-lg mb-4 transition-colors duration-300 ${
                                  validationResults[app.appName] === 'success'
                                    ? 'border-emerald-500/50 bg-emerald-500/5'
                                    : validationResults[app.appName] === 'warning'
                                      ? 'border-amber-500/50 bg-amber-500/5'
                                      : validationResults[app.appName] === 'error'
                                        ? 'border-rose-500/50 bg-rose-500/5'
                                        : 'border-primary/20 bg-background/50'
                                }`}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center space-x-2">
                                    <span
                                      className={`inline-block p-2 rounded-md ${
                                        validationResults[app.appName] === 'success'
                                          ? 'bg-emerald-500/20'
                                          : validationResults[app.appName] === 'warning'
                                            ? 'bg-amber-500/20'
                                            : validationResults[app.appName] === 'error'
                                              ? 'bg-rose-500/20'
                                              : 'bg-primary/10'
                                      }`}
                                    >
                                      {app.icon && (
                                        <Icon
                                          icon={app.icon}
                                          className={`h-5 w-5 ${
                                            validationResults[app.appName] === 'success'
                                              ? 'text-emerald-500'
                                              : validationResults[app.appName] === 'warning'
                                                ? 'text-amber-500'
                                                : validationResults[app.appName] === 'error'
                                                  ? 'text-rose-500'
                                                  : 'text-primary/70'
                                          }`}
                                        />
                                      )}
                                    </span>
                                    <div>
                                      <h3 className="font-medium">{app.appName}</h3>
                                      <p className="text-sm text-muted-foreground">
                                        {app.description}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Affichage de l'état de validation amélioré avec couleurs distinctes */}
                                  <div className="flex items-center space-x-2">
                                    {validationDetails[app.appName] ? (
                                      <div
                                        className={`flex items-center ${
                                          validationDetails[app.appName]!.level.startsWith(
                                            'success'
                                          )
                                            ? 'text-emerald-500'
                                            : validationDetails[app.appName]!.level.startsWith(
                                                  'warning'
                                                )
                                              ? 'text-amber-500'
                                              : 'text-rose-500'
                                        }`}
                                      >
                                        {validationDetails[app.appName]!.level.startsWith(
                                          'success'
                                        ) && <CheckCircle className="h-5 w-5" />}
                                        {validationDetails[app.appName]!.level.startsWith(
                                          'warning'
                                        ) && <AlertTriangle className="h-5 w-5" />}
                                        {validationDetails[app.appName]!.level.startsWith(
                                          'error'
                                        ) && <XCircle className="h-5 w-5" />}
                                      </div>
                                    ) : validationResults[app.appName] === 'loading' ? (
                                      <Loader className="animate-spin h-5 w-5 text-primary/80" />
                                    ) : (
                                      <div className="h-5 w-5" /> // Espace réservé vide pour maintenir l'alignement
                                    )}
                                  </div>
                                </div>

                                <div className="mt-3">
                                  <div
                                    className={`p-3 backdrop-blur-sm border rounded-md flex justify-between items-center ${
                                      validationResults[app.appName] === 'success'
                                        ? 'bg-emerald-950/10 border-emerald-500/20'
                                        : validationResults[app.appName] === 'warning'
                                          ? 'bg-amber-950/10 border-amber-500/20'
                                          : validationResults[app.appName] === 'error'
                                            ? 'bg-rose-950/10 border-rose-500/20'
                                            : 'bg-background/50 border-primary/15'
                                    }`}
                                  >
                                    <textarea
                                      className="text-sm break-all pr-2 bg-transparent w-full resize-none outline-none border-none focus:ring-0 font-mono text-foreground"
                                      value={app.command}
                                      onChange={e => {
                                        // Mettre à jour la commande dans l'état
                                        const newCommands = [...appCommands];
                                        const commandIndex = newCommands.findIndex(
                                          cmd => cmd.appName === app.appName
                                        );
                                        if (commandIndex >= 0) {
                                          // S'assurer que tous les champs requis sont conservés
                                          newCommands[commandIndex] = {
                                            appName: app.appName,
                                            icon: app.icon,
                                            category: app.category,
                                            description: app.description,
                                            command: e.target.value,
                                          };
                                          setAppCommands(newCommands);

                                          // Revalider la commande après modification
                                          validateCommand(e.target.value, app.appName);
                                        }
                                      }}
                                      rows={1}
                                      style={{ height: 'auto', minHeight: '1.5rem' }}
                                      onInput={e => {
                                        const target = e.target as HTMLTextAreaElement;
                                        target.style.height = 'auto';
                                        target.style.height = `${target.scrollHeight}px`;
                                      }}
                                    />
                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          // Régénérer la commande originale
                                          generateCommandForApp(app.appName)
                                            .then((originalCommand: string) => {
                                              const newCommands = [...appCommands];
                                              const commandIndex = newCommands.findIndex(
                                                cmd => cmd.appName === app.appName
                                              );
                                              if (commandIndex >= 0) {
                                                newCommands[commandIndex] = {
                                                  appName: app.appName,
                                                  icon: app.icon,
                                                  category: app.category,
                                                  description: app.description,
                                                  command: originalCommand,
                                                };
                                                setAppCommands(newCommands);
                                                validateCommand(originalCommand, app.appName);
                                              }
                                            })
                                            .catch((err: Error) => {
                                              console.error(
                                                'Erreur lors de la régénération de la commande:',
                                                err
                                              );
                                            });
                                        }}
                                        aria-label="Réinitialiser la commande"
                                        title="Réinitialiser la commande"
                                        className={`hover:bg-primary/10 ${
                                          validationResults[app.appName] === 'success'
                                            ? 'text-emerald-500/80 hover:text-emerald-500'
                                            : validationResults[app.appName] === 'warning'
                                              ? 'text-amber-500/80 hover:text-amber-500'
                                              : validationResults[app.appName] === 'error'
                                                ? 'text-rose-500/80 hover:text-rose-500'
                                                : 'text-primary/70 hover:text-primary'
                                        }`}
                                      >
                                        <RefreshCw className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => copyCommandToClipboard(app.command)}
                                        aria-label="Copier la commande"
                                        title="Copier la commande"
                                        className={`hover:bg-primary/10 ${
                                          validationResults[app.appName] === 'success'
                                            ? 'text-emerald-500/80 hover:text-emerald-500'
                                            : validationResults[app.appName] === 'warning'
                                              ? 'text-amber-500/80 hover:text-amber-500'
                                              : validationResults[app.appName] === 'error'
                                                ? 'text-rose-500/80 hover:text-rose-500'
                                                : 'text-primary/70 hover:text-primary'
                                        }`}
                                      >
                                        <Copy className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>

                                {/* Affichage du message d'aide contextuel selon le niveau de validation */}
                                {validationDetails[app.appName] && (
                                  <div
                                    className={`mt-3 p-3 rounded-md backdrop-blur-sm border ${
                                      validationDetails[app.appName]!.level.startsWith('success')
                                        ? 'bg-emerald-950/10 border-emerald-500/20 text-emerald-400'
                                        : validationDetails[app.appName]!.level.startsWith(
                                              'warning'
                                            )
                                          ? 'bg-amber-950/10 border-amber-500/20 text-amber-400'
                                          : validationDetails[app.appName]!.level.startsWith(
                                                'error'
                                              )
                                            ? 'bg-rose-950/10 border-rose-500/20 text-rose-400'
                                            : 'bg-background/50 border-primary/15 text-foreground'
                                    }`}
                                  >
                                    <p className="text-sm">
                                      {validationDetails[app.appName]!.message}
                                    </p>
                                    {validationDetails[app.appName]!.suggestion && (
                                      <p className="text-sm mt-1">
                                        <span className="font-medium">Suggestion:</span>{' '}
                                        <span
                                          className={
                                            validationDetails[app.appName]!.level.startsWith(
                                              'error'
                                            )
                                              ? 'text-rose-300'
                                              : 'text-muted-foreground'
                                          }
                                        >
                                          {validationDetails[app.appName]!.suggestion}
                                        </span>
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Vous pouvez copier ces commandes et les exécuter dans votre terminal.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>{/* ... existing code ... */}</div>
        )}
      </div>
    </main>
  );
}
