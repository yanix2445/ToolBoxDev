'use client';

import { useEffect, useState } from 'react';

import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Skeleton } from '../components/ui/skeleton';

import { Greet } from '../wailsjs/wailsjs/go/main/App';
import { OSInfo, AppCategories, AppIconMap, AppDescriptions, AppInstallCommand } from './types';

import { FaApple, FaWindows, FaLinux } from 'react-icons/fa';
import {
  Terminal,
  Info,
  AlertCircle,
  Computer,
  Monitor,
  HardDrive,
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
  Tag,
  X,
  ExternalLink,
  Play,
} from 'lucide-react';

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
        };
      };
    };
  }
}

export default function Home() {
  const [greeting, setGreeting] = useState<string>('');
  const [osInfo, setOsInfo] = useState<OSInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [backendAvailable, setBackendAvailable] = useState<boolean>(false);
  const [diskInfo, setDiskInfo] = useState<{ free: string; total: string }>({
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

  // Fonction pour rafraîchir les données du système
  const refreshSystemInfo = async () => {
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

  // Fonction pour générer les commandes d'installation pour les applications sélectionnées
  const generateInstallCommands = async () => {
    if (selectedApps.length === 0) return;

    setAppCommandsLoading(true);
    const commands: AppInstallCommand[] = [];

    try {
      for (const appName of selectedApps) {
        try {
          const command = await window.go.main.App.GenerateInstallCommand(appName);
          const category = getCategoryForApp(appName);

          commands.push({
            appName,
            command,
            icon: AppIconMap[appName] || 'package',
            category,
            description: AppDescriptions[appName] || appName,
          });
        } catch (error) {
          console.error(`Erreur lors de la génération de la commande pour ${appName}:`, error);
        }
      }

      setAppCommands(commands);
    } catch (error) {
      console.error('Erreur lors de la génération des commandes:', error);
    } finally {
      setAppCommandsLoading(false);
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

  // Rendu d'une carte pour un système d'exploitation
  const renderOSCard = (osName: string, icon: React.ReactNode, description: string) => {
    const isDetected = isDetectedOS(osName);

    return (
      <Card
        className={`w-full transition-all duration-500 ${
          isDetected
            ? 'ring-2 ring-primary/40 shadow-xl scale-[1.02] relative backdrop-blur-sm bg-background/70 before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/5 before:to-transparent before:rounded-xl before:z-[-1] after:absolute after:inset-0 after:bg-gradient-to-br after:from-primary/20 after:to-transparent after:z-[-2] after:rounded-xl after:blur-lg after:opacity-70 hover:ring-primary/60 hover:scale-[1.03]'
            : 'opacity-90 hover:opacity-100 hover:shadow-lg hover:translate-y-[-4px] hover:bg-background/80 hover:scale-[1.02] transition-transform duration-300 bg-background/60 border border-primary/5'
        }`}
      >
        <CardHeader
          className={`${
            isDetected
              ? 'bg-gradient-to-r from-primary/20 to-primary/5 backdrop-blur-md'
              : 'bg-gradient-to-r from-muted/20 to-transparent'
          } rounded-t-xl transition-all duration-300 relative overflow-hidden ${
            isDetected
              ? 'before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/10 before:via-primary/5 before:to-transparent before:animate-gradient'
              : ''
          }`}
        >
          <div className="flex items-center gap-3 relative z-10">
            <div
              className={`p-3 rounded-full ${
                isDetected
                  ? 'bg-primary/20 text-primary shadow-lg ring-1 ring-primary/30 animate-subtle-bounce'
                  : 'bg-muted/30'
              } transform transition-all duration-300`}
            >
              {icon}
            </div>
            <div>
              <CardTitle
                className={`${
                  isDetected ? 'text-primary font-bold text-shadow-sm' : ''
                } font-heading`}
              >
                {osName}
              </CardTitle>
              {isDetected && osInfo && osName === 'macOS' && (
                <div className="text-sm font-medium mt-1 text-primary/80 font-smooth">
                  {osInfo.version}
                </div>
              )}
              {isDetected && osInfo && osName !== 'macOS' && (
                <div className="text-sm font-medium mt-1 text-primary/80 font-smooth">
                  {osInfo.osFullName}
                </div>
              )}
            </div>
          </div>
          <CardDescription className={`${isDetected ? 'text-primary-foreground/80' : ''} mt-2`}>
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 relative z-10 backdrop-blur-sm bg-gradient-to-b from-transparent to-background/30">
          {isDetected && osInfo && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge
                  variant={isDetected ? 'default' : 'outline'}
                  className="animate-pulse shadow-sm backdrop-blur-sm bg-primary/20 font-smooth"
                >
                  Détecté
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-background/50 backdrop-blur-sm shadow-inner font-mono"
                >
                  {osInfo.arch}
                </Badge>
              </div>

              <Separator className="bg-primary/20" />

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium font-smooth">
                  Système d&apos;exploitation
                </p>
                <p className="font-medium bg-background/50 p-3 rounded-md shadow-inner backdrop-blur-sm border border-primary/10 transform hover:scale-[1.01] transition-transform font-smooth hover:bg-background/70 hover:border-primary/20">
                  <span className="font-bold">
                    {osInfo.osFullName || `${osInfo.name} v${osInfo.version}`}
                  </span>
                </p>

                <p className="text-sm text-muted-foreground mt-2 font-medium font-smooth">
                  Processeur (CPU)
                </p>
                <p className="font-medium bg-background/50 p-3 rounded-md shadow-inner backdrop-blur-sm border border-primary/10 transform hover:scale-[1.01] transition-transform font-smooth">
                  {osInfo.cpuModel || 'Non détecté'}
                  {isDetected &&
                    osName === 'macOS' &&
                    osInfo.cpuModel &&
                    osInfo.cpuModel.includes('Apple') && (
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/20 text-primary font-bold font-mono text-glow animate-pulse">
                        {osInfo.cpuModel.includes('M1')
                          ? 'M1'
                          : osInfo.cpuModel.includes('M2')
                            ? 'M2'
                            : osInfo.cpuModel.includes('M3')
                              ? 'M3'
                              : osInfo.cpuModel.includes('M4')
                                ? 'M4'
                                : 'Apple Silicon'}
                      </span>
                    )}
                  {isDetected && osName === 'Windows' && osInfo.cpuModel && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/20 text-primary">
                      {osInfo.cpuModel.toLowerCase().includes('intel')
                        ? 'Intel'
                        : osInfo.cpuModel.toLowerCase().includes('amd') ||
                            osInfo.cpuModel.toLowerCase().includes('ryzen')
                          ? 'AMD'
                          : ''}
                    </span>
                  )}
                </p>

                <p className="text-sm text-muted-foreground mt-2 font-medium font-smooth">
                  Carte graphique (GPU)
                </p>
                <p className="font-medium bg-background/50 p-3 rounded-md shadow-inner backdrop-blur-sm border border-primary/10 transform hover:scale-[1.01] transition-transform font-smooth">
                  {osInfo.gpuModel || 'Non détecté'}
                  {isDetected && osName === 'Windows' && osInfo.gpuModel && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/20 text-primary">
                      {osInfo.gpuModel.toLowerCase().includes('nvidia')
                        ? 'NVIDIA'
                        : osInfo.gpuModel.toLowerCase().includes('amd') ||
                            osInfo.gpuModel.toLowerCase().includes('radeon')
                          ? 'AMD'
                          : osInfo.gpuModel.toLowerCase().includes('intel')
                            ? 'Intel'
                            : ''}
                    </span>
                  )}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium font-smooth">
                      Mémoire RAM
                    </p>
                    <p className="font-medium bg-background/50 p-3 rounded-md shadow-inner backdrop-blur-sm border border-primary/10 transform hover:scale-[1.01] transition-transform font-smooth flex items-center">
                      <span>{osInfo.memoryTotal || 'Non détecté'}</span>
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground font-medium font-smooth">
                      Architecture
                    </p>
                    <p className="font-medium bg-background/50 p-3 rounded-md shadow-inner backdrop-blur-sm border border-primary/10 transform hover:scale-[1.01] transition-transform font-smooth flex items-center">
                      <span>{osInfo.arch}</span>
                      <Badge
                        variant="outline"
                        className="ml-auto bg-background/50 backdrop-blur-sm shadow-inner"
                      >
                        {osInfo.arch === 'arm64' ? 'ARM' : 'x86'}
                      </Badge>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium font-smooth">
                      Stockage Total
                    </p>
                    <p className="font-medium bg-background/50 p-3 rounded-md shadow-inner backdrop-blur-sm border border-primary/10 transform hover:scale-[1.01] transition-transform font-smooth flex items-center">
                      <span>{osInfo.diskTotal || 'Non détecté'}</span>
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground font-medium font-smooth">
                      Stockage Libre
                    </p>
                    <p className="font-medium bg-background/50 p-3 rounded-md shadow-inner backdrop-blur-sm border border-primary/10 transform hover:scale-[1.01] transition-transform font-smooth flex items-center">
                      <span>{osInfo.diskFree || 'Non détecté'}</span>
                      {osInfo.diskFree && osInfo.diskTotal && (
                        <Badge
                          variant="outline"
                          className="ml-auto bg-background/50 backdrop-blur-sm shadow-inner"
                        >
                          Utilisé: {calculateUsedPercentage(osInfo.diskFree, osInfo.diskTotal)}%
                        </Badge>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {!isDetected && (
            <div className="h-20 flex items-center justify-center text-muted-foreground backdrop-blur-sm perspective-800">
              <div className="opacity-70 hover:opacity-90 transition-all transform hover:scale-105 hover:rotate-1 p-4 rounded-full bg-background/50 shadow-inner">
                {icon}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

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

                      {/* Sélection d'applications par catégorie */}
                      <div className="space-y-6">
                        {AppCategories.map(category => {
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
                          <div className="space-y-3">
                            {appCommands.map((app, index) => (
                              <div
                                key={index}
                                className="rounded-lg p-3 bg-background/50 border border-primary/10 shadow-sm"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    {getAppIcon(app.icon)}
                                    <span className="font-medium text-sm">{app.appName}</span>
                                    <Badge
                                      variant="outline"
                                      className="bg-primary/5 text-xs font-normal"
                                    >
                                      {app.category}
                                    </Badge>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={() => copyCommandToClipboard(app.command)}
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                                <div className="text-xs bg-background/80 rounded p-2 font-mono border border-primary/5 overflow-x-auto">
                                  {app.command}
                                </div>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Vous pouvez copier ces commandes et les exécuter dans un terminal sur
                            votre système.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Autres OS en version épurée */}
            <div className="relative overflow-hidden rounded-2xl shadow-md bg-gradient-to-br from-background/95 via-background/90 to-background/85 backdrop-blur-none group hover:shadow-lg transition-all duration-700 transform hover:scale-[1.01] hover:translate-y-[-2px] before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/5 before:via-primary/3 before:via-primary/2 before:to-transparent before:opacity-40 before:z-[-1]">
              <div className="absolute inset-0 bg-noise opacity-5 mix-blend-soft-light"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-primary/5 via-primary/4 via-primary/3 via-primary/2 to-transparent rounded-full blur-xl opacity-30 transition-opacity duration-700 group-hover:opacity-40"></div>
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-tr from-primary/5 via-primary/4 via-primary/3 via-primary/2 to-transparent rounded-full blur-xl opacity-20 transition-opacity duration-700 group-hover:opacity-30"></div>
              <div className="py-3 px-4 relative z-10 border-b border-primary/10 bg-gradient-to-r from-primary/5 via-primary/4 via-primary/3 via-primary/2 to-transparent flex items-center gap-2 shadow-sm">
                <div className="p-2 rounded-full bg-primary/20 shadow-lg backdrop-blur-none transform transition-transform duration-700 ease-in-out group-hover:scale-105 icon-3d-metallic animated ring-1 ring-primary/30">
                  <Computer className="h-6 w-6 text-primary" />
                  <div className="reflective-effect"></div>
                </div>
                <h2 className="text-primary font-bold text-lg font-heading">
                  Autres systèmes d&apos;exploitation
                </h2>
              </div>
              <div className="p-4 relative z-10 bg-gradient-to-b from-transparent via-background/10 via-background/20 via-background/30 to-background/40">
                <p className="text-sm text-muted-foreground mb-4">
                  Explorez d&apos;autres systèmes d&apos;exploitation pour vos besoins
                  informatiques.
                </p>
                <div className="flex justify-evenly items-center py-12 px-6">
                  {!isDetectedOS('macOS') && (
                    <div className="relative">
                      <div className="p-4 rounded-full bg-primary/15 backdrop-blur-none icon-3d-metallic icon-copper group cursor-pointer">
                        <FaApple className="h-12 w-12 text-primary/80 icon-apple group-hover:opacity-0 transition-all duration-500" />
                        <div className="reflective-effect group-hover:opacity-0 transition-all duration-500"></div>

                        {/* Carte qui apparaît au survol */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] opacity-0 scale-0 origin-center group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 bg-[#000000] rounded-xl shadow-2xl border-2 border-[#444444]/70 p-4 z-50">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-full bg-[#333333] shadow-[0_0_10px_rgba(255,255,255,0.15)]">
                              <FaApple className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-base font-semibold text-white">macOS</h3>
                          </div>
                          <p className="text-xs text-white/90 mb-3">
                            Système élégant et intuitif d&apos;Apple, parfaitement intégré à
                            l&apos;écosystème Apple.
                          </p>
                          <div className="flex gap-2">
                            <a
                              href="https://www.apple.com/fr/macos/sonoma/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 h-8 rounded-md bg-white/15 hover:bg-white/25 text-white text-xs border border-white/30 flex items-center justify-center z-[100]"
                            >
                              <ExternalLink className="h-3 w-3 mr-2" />
                              Site officiel
                            </a>
                            <a
                              href="https://youtu.be/t7siwq7JkWM?si=Wk3xc3zNMPKAErkq"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-8 w-8 rounded-md bg-white/15 hover:bg-white/25 text-white border border-white/30 flex items-center justify-center z-[100]"
                            >
                              <Play className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!isDetectedOS('Windows') && (
                    <div className="relative">
                      <div className="p-4 rounded-full bg-[#0078d7]/20 backdrop-blur-none icon-3d-metallic icon-silver group cursor-pointer">
                        <FaWindows className="h-12 w-12 text-[#0078d7] icon-windows group-hover:opacity-0 transition-all duration-500" />
                        <div className="reflective-effect group-hover:opacity-0 transition-all duration-500"></div>

                        {/* Carte qui apparaît au survol */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] opacity-0 scale-0 origin-center group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 bg-[#0078d7] rounded-xl shadow-2xl border-2 border-[#0063b1]/70 p-4 z-50">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-full bg-[#0063b1] shadow-[0_0_10px_rgba(255,255,255,0.15)]">
                              <FaWindows className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-base font-semibold text-white">Windows</h3>
                          </div>
                          <p className="text-xs text-white/90 mb-3">
                            Le système le plus utilisé au monde avec une large compatibilité
                            matérielle et logicielle.
                          </p>
                          <div className="flex gap-2">
                            <a
                              href="https://www.microsoft.com/fr-fr/windows/features"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 h-8 rounded-md bg-white/15 hover:bg-white/25 text-white text-xs border border-white/30 flex items-center justify-center z-[100]"
                            >
                              <ExternalLink className="h-3 w-3 mr-2" />
                              Site officiel
                            </a>
                            <a
                              href="https://youtu.be/_85L5NWT87M?si=s3EzZs6oXqj6oiTv"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-8 w-8 rounded-md bg-white/15 hover:bg-white/25 text-white border border-white/30 flex items-center justify-center z-[100]"
                            >
                              <Play className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!isDetectedOS('Linux') && (
                    <div className="relative">
                      <div className="p-4 rounded-full bg-primary/15 backdrop-blur-none icon-3d-metallic icon-gold group cursor-pointer">
                        <FaLinux className="h-12 w-12 text-primary/80 icon-linux group-hover:opacity-0 transition-all duration-500" />
                        <div className="reflective-effect group-hover:opacity-0 transition-all duration-500"></div>

                        {/* Carte qui apparaît au survol */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] opacity-0 scale-0 origin-center group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 bg-[#e67e22] rounded-xl shadow-2xl border-2 border-[#d35400]/70 p-4 z-50">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-full bg-[#d35400] shadow-[0_0_12px_rgba(255,255,255,0.2)]">
                              <FaLinux className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-base font-semibold text-white">Linux</h3>
                          </div>
                          <p className="text-xs text-white/90 mb-3">
                            Système open source hautement personnalisable avec de nombreuses
                            distributions.
                          </p>
                          <div className="flex gap-2">
                            <a
                              href="https://www.kernel.org/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 h-8 rounded-md bg-white/15 hover:bg-white/25 text-white text-xs border border-white/30 flex items-center justify-center z-[100]"
                            >
                              <ExternalLink className="h-3 w-3 mr-2" />
                              Site officiel
                            </a>
                            <a
                              href="https://youtu.be/xLhCOFWaY_M?si=vxcJIvG6mUjn8dal"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-8 w-8 rounded-md bg-white/15 hover:bg-white/25 text-white border border-white/30 flex items-center justify-center z-[100]"
                            >
                              <Play className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-2xl backdrop-blur-sm border border-destructive/20 bg-destructive/5 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 to-transparent opacity-30"></div>
            <div className="relative p-4 flex gap-3 items-start z-10">
              <div className="bg-destructive/10 p-2 rounded-full">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold text-base text-destructive">Erreur de détection</h3>
                <p className="text-sm mt-1">La fonction GetOSInfo n&apos;est pas disponible.</p>
                <p className="text-sm mt-1">Redémarrez avec `wails dev`.</p>
              </div>
            </div>
          </div>
        )}

        {/* Barre d'actions en bas avec effet glassmorphism */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-r from-background/70 to-background/60 shadow-md">
          <div className="absolute inset-0 bg-noise opacity-5 mix-blend-soft-light"></div>
          <div className="relative z-10 py-3 px-4 flex justify-between items-center">
            <Button
              variant="default"
              size="sm"
              className="h-9 px-4 rounded-xl bg-primary/80 hover:bg-primary/90 backdrop-blur-sm shadow-md hover:shadow transform transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group"
              onClick={refreshSystemInfo}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Chargement...
                </>
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <HardDrive className="h-4 w-4 mr-2 relative z-10" />
                  <span className="relative z-10">Rafraîchir</span>
                </>
              )}
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-primary/10">
                <Info className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium">Diagnostique Système</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
