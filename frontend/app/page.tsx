"use client";

import { useEffect, useState } from "react";
import { Greet } from "../wailsjs/go/main/App";
import { OSInfo } from "./types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Separator } from "../components/ui/separator";
import { Skeleton } from "../components/ui/skeleton";
import {
  Terminal,
  Info,
  AlertCircle,
  Computer,
  Monitor,
  HardDrive,
} from "lucide-react";
import { FaApple, FaWindows, FaLinux } from "react-icons/fa";

declare global {
  interface Window {
    go: {
      main: {
        App: {
          GetOSInfo(): Promise<OSInfo>;
          Greet(name: string): Promise<string>;
        };
      };
    };
  }
}

export default function Home() {
  const [greeting, setGreeting] = useState<string>("");
  const [osInfo, setOsInfo] = useState<OSInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [backendAvailable, setBackendAvailable] = useState<boolean>(false);
  const [diskInfo, setDiskInfo] = useState<{ free: string; total: string }>({
    free: "",
    total: "",
  });
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);

  // Fonction pour rafraîchir les données du système
  const refreshSystemInfo = async () => {
    setLoading(true);
    try {
      if (window.go?.main?.App?.GetOSInfo) {
        const newOsInfo = await window.go.main.App.GetOSInfo();
        setOsInfo(newOsInfo);
        setDiskInfo({
          free: newOsInfo.diskFree || "",
          total: newOsInfo.diskTotal || "",
        });
        setBackendAvailable(true);
      } else {
        console.log("La méthode GetOSInfo n'est pas disponible");
        setBackendAvailable(false);
      }
    } catch (error) {
      console.error("Erreur lors du rafraîchissement des données:", error);
      setBackendAvailable(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const message = await Greet("ToolBox");
        setGreeting(message);

        // Essayer d'appeler GetOSInfo directement
        if (
          window.go &&
          window.go.main &&
          window.go.main.App &&
          typeof window.go.main.App.GetOSInfo === "function"
        ) {
          try {
            const osInfo = await window.go.main.App.GetOSInfo();
            setOsInfo(osInfo);
            setDiskInfo({
              free: osInfo.diskFree || "",
              total: osInfo.diskTotal || "",
            });
            setBackendAvailable(true);
          } catch (err) {
            console.error("Erreur l&apos;appel à GetOSInfo:", err);
            setBackendAvailable(false);
          }
        } else {
          console.log("La méthode GetOSInfo n&apos;est pas disponible");
          setBackendAvailable(false);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
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
            free: osInfo.diskFree || "",
            total: osInfo.diskTotal || "",
          });
        } catch (err) {
          console.error(
            "Erreur lors de la mise à jour des informations de disque:",
            err
          );
        }
      }
    }, 5000); // Mise à jour toutes les 5 secondes

    setRefreshInterval(interval);

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  // Fonction pour déterminer si un OS est l'OS actuel détecté
  const isDetectedOS = (osName: string): boolean => {
    if (!osInfo) return false;

    if (osName === "macOS" && osInfo.isMacOS) return true;
    if (osName === "Windows" && osInfo.isWindows) return true;
    if (
      osName === "Linux" &&
      !osInfo.isMacOS &&
      !osInfo.isWindows &&
      osInfo.name.toLowerCase().includes("linux")
    )
      return true;

    return false;
  };

  // Rendu d'une carte pour un système d'exploitation
  const renderOSCard = (
    osName: string,
    icon: React.ReactNode,
    description: string
  ) => {
    const isDetected = isDetectedOS(osName);

    return (
      <Card
        className={`w-full transition-all duration-500 ${
          isDetected
            ? "ring-2 ring-primary/40 shadow-xl scale-[1.02] relative backdrop-blur-sm bg-background/70 before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/5 before:to-transparent before:rounded-xl before:z-[-1] after:absolute after:inset-0 after:bg-gradient-to-br after:from-primary/20 after:to-transparent after:z-[-2] after:rounded-xl after:blur-lg after:opacity-70 hover:ring-primary/60 hover:scale-[1.03]"
            : "opacity-90 hover:opacity-100 hover:shadow-lg hover:translate-y-[-4px] hover:bg-background/80 hover:scale-[1.02] transition-transform duration-300 bg-background/60 border border-primary/5"
        }`}
      >
        <CardHeader
          className={`${
            isDetected
              ? "bg-gradient-to-r from-primary/20 to-primary/5 backdrop-blur-md"
              : "bg-gradient-to-r from-muted/20 to-transparent"
          } rounded-t-xl transition-all duration-300 relative overflow-hidden ${
            isDetected
              ? "before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/10 before:via-primary/5 before:to-transparent before:animate-gradient"
              : ""
          }`}
        >
          <div className="flex items-center gap-3 relative z-10">
            <div
              className={`p-3 rounded-full ${
                isDetected
                  ? "bg-primary/20 text-primary shadow-lg ring-1 ring-primary/30 animate-subtle-bounce"
                  : "bg-muted/30"
              } transform transition-all duration-300`}
            >
              {icon}
            </div>
            <div>
              <CardTitle
                className={`${
                  isDetected ? "text-primary font-bold text-shadow-sm" : ""
                } font-heading`}
              >
                {osName}
              </CardTitle>
              {isDetected && osInfo && osName === "macOS" && (
                <div className="text-sm font-medium mt-1 text-primary/80 font-smooth">
                  {osInfo.version}
                </div>
              )}
              {isDetected && osInfo && osName !== "macOS" && (
                <div className="text-sm font-medium mt-1 text-primary/80 font-smooth">
                  {osInfo.osFullName}
                </div>
              )}
            </div>
          </div>
          <CardDescription
            className={`${isDetected ? "text-primary-foreground/80" : ""} mt-2`}
          >
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 relative z-10 backdrop-blur-sm bg-gradient-to-b from-transparent to-background/30">
          {isDetected && osInfo && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge
                  variant={isDetected ? "default" : "outline"}
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
                  {osInfo.cpuModel || "Non détecté"}
                  {isDetected &&
                    osName === "macOS" &&
                    osInfo.cpuModel &&
                    osInfo.cpuModel.includes("Apple") && (
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/20 text-primary font-bold font-mono text-glow animate-pulse">
                        {osInfo.cpuModel.includes("M1")
                          ? "M1"
                          : osInfo.cpuModel.includes("M2")
                          ? "M2"
                          : osInfo.cpuModel.includes("M3")
                          ? "M3"
                          : osInfo.cpuModel.includes("M4")
                          ? "M4"
                          : "Apple Silicon"}
                      </span>
                    )}
                  {isDetected && osName === "Windows" && osInfo.cpuModel && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/20 text-primary">
                      {osInfo.cpuModel.toLowerCase().includes("intel")
                        ? "Intel"
                        : osInfo.cpuModel.toLowerCase().includes("amd") ||
                          osInfo.cpuModel.toLowerCase().includes("ryzen")
                        ? "AMD"
                        : ""}
                    </span>
                  )}
                </p>

                <p className="text-sm text-muted-foreground mt-2 font-medium font-smooth">
                  Carte graphique (GPU)
                </p>
                <p className="font-medium bg-background/50 p-3 rounded-md shadow-inner backdrop-blur-sm border border-primary/10 transform hover:scale-[1.01] transition-transform font-smooth">
                  {osInfo.gpuModel || "Non détecté"}
                  {isDetected && osName === "Windows" && osInfo.gpuModel && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/20 text-primary">
                      {osInfo.gpuModel.toLowerCase().includes("nvidia")
                        ? "NVIDIA"
                        : osInfo.gpuModel.toLowerCase().includes("amd") ||
                          osInfo.gpuModel.toLowerCase().includes("radeon")
                        ? "AMD"
                        : osInfo.gpuModel.toLowerCase().includes("intel")
                        ? "Intel"
                        : ""}
                    </span>
                  )}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium font-smooth">
                      Mémoire RAM
                    </p>
                    <p className="font-medium bg-background/50 p-3 rounded-md shadow-inner backdrop-blur-sm border border-primary/10 transform hover:scale-[1.01] transition-transform font-smooth flex items-center">
                      <span>{osInfo.memoryTotal || "Non détecté"}</span>
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
                        {osInfo.arch === "arm64" ? "ARM" : "x86"}
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
                      <span>{osInfo.diskTotal || "Non détecté"}</span>
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground font-medium font-smooth">
                      Stockage Libre
                    </p>
                    <p className="font-medium bg-background/50 p-3 rounded-md shadow-inner backdrop-blur-sm border border-primary/10 transform hover:scale-[1.01] transition-transform font-smooth flex items-center">
                      <span>{osInfo.diskFree || "Non détecté"}</span>
                      {osInfo.diskFree && osInfo.diskTotal && (
                        <Badge
                          variant="outline"
                          className="ml-auto bg-background/50 backdrop-blur-sm shadow-inner"
                        >
                          Utilisé:{" "}
                          {calculateUsedPercentage(
                            osInfo.diskFree,
                            osInfo.diskTotal
                          )}
                          %
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
      const freeValue = parseFloat(
        free.replace(/[^0-9,.]/g, "").replace(",", ".")
      );
      const totalValue = parseFloat(
        total.replace(/[^0-9,.]/g, "").replace(",", ".")
      );

      if (isNaN(freeValue) || isNaN(totalValue) || totalValue === 0) {
        return 0;
      }

      const usedPercentage = Math.round(
        ((totalValue - freeValue) / totalValue) * 100
      );
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
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-70"></div>
            <div className="relative p-4 flex gap-3 items-start z-10">
              <div className="bg-primary/10 p-2 rounded-full">
                <Terminal className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-base">
                  Bienvenue dans ToolBox
                </h3>
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
            {isDetectedOS("macOS") && (
              <div className="relative overflow-hidden rounded-2xl shadow-lg group hover:shadow-xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-80"></div>
                <div className="absolute -bottom-4 -right-4 w-40 h-40 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl"></div>

                <div className="relative z-10 grid grid-cols-12 gap-0 overflow-hidden">
                  <div className="col-span-12 sm:col-span-4 p-4 backdrop-blur-sm backdrop-saturate-150 flex items-center gap-4 bg-background/62">
                    <div className="p-3 rounded-full bg-white/10 shadow-inner backdrop-blur-sm">
                      <FaApple className="h-6 w-6 text-primary drop-shadow-md" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base">macOS</h3>
                      {osInfo && (
                        <p className="text-sm opacity-80">{osInfo.version}</p>
                      )}
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
                            {osInfo.cpuModel || "Non détecté"}
                          </p>
                        </div>
                        <div className="rounded-xl overflow-hidden bg-background/50 backdrop-blur-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] group">
                          <div className="p-3 bg-gradient-to-br from-primary/10 to-transparent">
                            <p className="text-xs font-medium">RAM</p>
                          </div>
                          <p className="px-3 py-2 font-medium text-sm">
                            {osInfo.memoryTotal || "Non détecté"}
                          </p>
                        </div>
                        <div className="rounded-xl overflow-hidden bg-background/50 backdrop-blur-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] group">
                          <div className="p-3 bg-gradient-to-br from-primary/10 to-transparent">
                            <p className="text-xs font-medium">Stockage</p>
                          </div>
                          <p className="px-3 py-2 font-medium text-sm truncate">
                            {osInfo.diskFree || "?"}/{osInfo.diskTotal || "?"}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {isDetectedOS("Windows") && (
              <div className="relative overflow-hidden rounded-2xl shadow-lg group hover:shadow-xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-80"></div>
                <div className="absolute -bottom-4 -right-4 w-40 h-40 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl"></div>

                <div className="relative z-10 grid grid-cols-12 gap-0 overflow-hidden">
                  <div className="col-span-12 sm:col-span-4 p-4 backdrop-blur-sm backdrop-saturate-150 flex items-center gap-4 bg-background/60">
                    <div className="p-3 rounded-full bg-white/10 shadow-inner backdrop-blur-sm">
                      <FaWindows className="h-6 w-6 text-primary drop-shadow-md" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base">Windows</h3>
                      {osInfo && (
                        <p className="text-sm opacity-80">
                          {osInfo.osFullName}
                        </p>
                      )}
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
                            {osInfo.cpuModel || "Non détecté"}
                          </p>
                        </div>
                        <div className="rounded-xl overflow-hidden bg-background/50 backdrop-blur-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                          <div className="p-3 bg-gradient-to-br from-primary/10 to-transparent">
                            <p className="text-xs font-medium">GPU</p>
                          </div>
                          <p className="px-3 py-2 font-medium text-sm truncate">
                            {osInfo.gpuModel || "Non détecté"}
                          </p>
                        </div>
                        <div className="rounded-xl overflow-hidden bg-background/50 backdrop-blur-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                          <div className="p-3 bg-gradient-to-br from-primary/10 to-transparent">
                            <p className="text-xs font-medium">RAM</p>
                          </div>
                          <p className="px-3 py-2 font-medium text-sm">
                            {osInfo.memoryTotal || "Non détecté"}
                          </p>
                        </div>
                        <div className="rounded-xl overflow-hidden bg-background/50 backdrop-blur-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                          <div className="p-3 bg-gradient-to-br from-primary/10 to-transparent">
                            <p className="text-xs font-medium">Stockage</p>
                          </div>
                          <p className="px-3 py-2 font-medium text-sm truncate">
                            {osInfo.diskFree || "?"}/{osInfo.diskTotal || "?"}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {isDetectedOS("Linux") && (
              <div className="relative overflow-hidden rounded-2xl shadow-lg group hover:shadow-xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-80"></div>
                <div className="absolute -bottom-4 -right-4 w-40 h-40 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl"></div>

                <div className="relative z-10 grid grid-cols-12 gap-0 overflow-hidden">
                  <div className="col-span-12 sm:col-span-4 p-4 backdrop-blur-sm backdrop-saturate-150 flex items-center gap-4 bg-background/60">
                    <div className="p-3 rounded-full bg-white/10 shadow-inner backdrop-blur-sm">
                      <FaLinux className="h-6 w-6 text-primary drop-shadow-md" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base">Linux</h3>
                      {osInfo && (
                        <p className="text-sm opacity-80">
                          {osInfo.osFullName}
                        </p>
                      )}
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
                            {osInfo.cpuModel || "Non détecté"}
                          </p>
                        </div>
                        <div className="rounded-xl overflow-hidden bg-background/50 backdrop-blur-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                          <div className="p-3 bg-gradient-to-br from-primary/10 to-transparent">
                            <p className="text-xs font-medium">GPU</p>
                          </div>
                          <p className="px-3 py-2 font-medium text-sm truncate">
                            {osInfo.gpuModel || "Non détecté"}
                          </p>
                        </div>
                        <div className="rounded-xl overflow-hidden bg-background/50 backdrop-blur-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                          <div className="p-3 bg-gradient-to-br from-primary/10 to-transparent">
                            <p className="text-xs font-medium">RAM</p>
                          </div>
                          <p className="px-3 py-2 font-medium text-sm">
                            {osInfo.memoryTotal || "Non détecté"}
                          </p>
                        </div>
                        <div className="rounded-xl overflow-hidden bg-background/50 backdrop-blur-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                          <div className="p-3 bg-gradient-to-br from-primary/10 to-transparent">
                            <p className="text-xs font-medium">Stockage</p>
                          </div>
                          <p className="px-3 py-2 font-medium text-sm truncate">
                            {osInfo.diskFree || "?"}/{osInfo.diskTotal || "?"}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Détails techniques avec texture */}
            <div className="relative overflow-hidden rounded-2xl shadow-md bg-gradient-to-br from-background/95 via-background/85 to-background/75 backdrop-blur-md group hover:shadow-lg transition-all duration-700 transform hover:scale-[1.01] hover:translate-y-[-2px] before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/5 before:via-primary/4 before:via-primary/3 before:to-transparent before:opacity-60 before:z-[-1]">
              <div className="absolute inset-0 bg-noise opacity-15 mix-blend-soft-light"></div>
              <div className="absolute -bottom-10 -right-10 w-52 h-52 bg-gradient-to-br from-primary/10 via-primary/8 via-primary/6 via-primary/4 to-transparent rounded-full blur-3xl opacity-50 transition-opacity duration-700 group-hover:opacity-70"></div>
              <div className="absolute -top-10 -left-10 w-52 h-52 bg-gradient-to-tr from-primary/10 via-primary/8 via-primary/6 via-primary/4 to-transparent rounded-full blur-3xl opacity-30 transition-opacity duration-700 group-hover:opacity-40"></div>
              <div className="py-3 px-4 relative z-10 border-b border-primary/10 bg-gradient-to-r from-primary/5 via-primary/4 via-primary/3 via-primary/2 to-transparent flex items-center gap-2 shadow-sm">
                <div className="p-2 rounded-full bg-gradient-to-br from-primary/20 via-primary/17 via-primary/15 via-primary/12 to-primary/5 shadow-md backdrop-blur-sm transform transition-transform duration-700 ease-in-out group-hover:scale-110 group-hover:rotate-3">
                  <Monitor className="h-5 w-5 text-primary drop-shadow-lg" />
                </div>
                <h3 className="font-bold text-base bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/95 via-primary/90 via-primary/85 to-primary/80 drop-shadow-sm">
                  Détails Techniques
                </h3>
              </div>
              <div className="p-4 relative z-10 bg-gradient-to-b from-transparent via-background/10 via-background/20 via-background/30 to-background/40">
                {osInfo && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="space-y-2 transform transition-all duration-500 hover:translate-y-[-2px] hover:scale-[1.02]">
                      <p className="text-xs opacity-70 font-medium ml-1">
                        Système
                      </p>
                      <div className="rounded-xl p-3 bg-gradient-to-br from-background/85 via-background/80 via-background/75 to-background/65 shadow-md backdrop-blur-sm border border-primary/10 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/5 before:via-primary/4 before:via-primary/3 before:via-primary/2 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity duration-700 ease-in-out">
                        <div className="absolute inset-0 bg-noise opacity-8 mix-blend-soft-light"></div>
                        <p className="font-medium text-sm truncate relative z-10">
                          {osInfo.osFullName ||
                            `${osInfo.name} ${osInfo.version}`}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 transform transition-all duration-500 hover:translate-y-[-2px] hover:scale-[1.02]">
                      <p className="text-xs opacity-70 font-medium ml-1">
                        Architecture
                      </p>
                      <div className="rounded-xl p-3 bg-gradient-to-br from-background/85 via-background/80 via-background/75 to-background/65 shadow-md backdrop-blur-sm border border-primary/10 flex items-center justify-between relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/5 before:via-primary/4 before:via-primary/3 before:via-primary/2 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity duration-700 ease-in-out">
                        <div className="absolute inset-0 bg-noise opacity-8 mix-blend-soft-light"></div>
                        <p className="font-medium text-sm relative z-10">
                          {osInfo.arch}
                        </p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-primary/25 via-primary/22 via-primary/20 via-primary/18 to-primary/15 border border-primary/30 shadow-inner relative z-10 backdrop-blur-sm">
                          {osInfo.arch === "arm64" ? "ARM" : "x86"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 transform transition-all duration-500 hover:translate-y-[-2px] hover:scale-[1.02]">
                      <p className="text-xs opacity-70 font-medium ml-1">
                        Stockage Total
                      </p>
                      <div className="rounded-xl p-3 bg-gradient-to-br from-background/85 via-background/80 via-background/75 to-background/65 shadow-md backdrop-blur-sm border border-primary/10 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/5 before:via-primary/4 before:via-primary/3 before:via-primary/2 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity duration-700 ease-in-out">
                        <div className="absolute inset-0 bg-noise opacity-8 mix-blend-soft-light"></div>
                        <p className="font-medium text-sm relative z-10">
                          {osInfo.diskTotal || "Non détecté"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 transform transition-all duration-500 hover:translate-y-[-2px] hover:scale-[1.02]">
                      <p className="text-xs opacity-70 font-medium ml-1">
                        Utilisé
                      </p>
                      <div className="rounded-xl p-3 bg-gradient-to-br from-background/85 via-background/80 via-background/75 to-background/65 shadow-md backdrop-blur-sm border border-primary/10 flex items-center justify-between relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/5 before:via-primary/4 before:via-primary/3 before:via-primary/2 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity duration-700 ease-in-out">
                        <div className="absolute inset-0 bg-noise opacity-8 mix-blend-soft-light"></div>
                        <p className="font-medium text-sm relative z-10">
                          {osInfo.diskFree || "?"}
                        </p>
                        {osInfo.diskFree && osInfo.diskTotal && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-primary/25 via-primary/22 via-primary/20 via-primary/18 to-primary/15 border border-primary/30 shadow-inner relative z-10 backdrop-blur-sm">
                            {calculateUsedPercentage(
                              osInfo.diskFree,
                              osInfo.diskTotal
                            )}
                            %
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Autres OS en version épurée */}
            <div className="flex gap-3">
              {!isDetectedOS("macOS") && (
                <div className="flex-1 relative overflow-hidden rounded-2xl group transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-sm"></div>
                  <div className="relative p-4 flex flex-col items-center justify-center gap-2 z-10">
                    <div className="p-3 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm">
                      <FaApple className="h-5 w-5 text-primary/70" />
                    </div>
                    <span className="text-sm font-medium">macOS</span>
                  </div>
                </div>
              )}
              {!isDetectedOS("Windows") && (
                <div className="flex-1 relative overflow-hidden rounded-2xl group transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-sm"></div>
                  <div className="relative p-4 flex flex-col items-center justify-center gap-2 z-10">
                    <div className="p-3 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm">
                      <FaWindows className="h-5 w-5 text-primary/70" />
                    </div>
                    <span className="text-sm font-medium">Windows</span>
                  </div>
                </div>
              )}
              {!isDetectedOS("Linux") && (
                <div className="flex-1 relative overflow-hidden rounded-2xl group transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-sm"></div>
                  <div className="relative p-4 flex flex-col items-center justify-center gap-2 z-10">
                    <div className="p-3 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm">
                      <FaLinux className="h-5 w-5 text-primary/70" />
                    </div>
                    <span className="text-sm font-medium">Linux</span>
                  </div>
                </div>
              )}
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
                <h3 className="font-semibold text-base text-destructive">
                  Erreur de détection
                </h3>
                <p className="text-sm mt-1">
                  La fonction GetOSInfo n&apos;est pas disponible.
                </p>
                <p className="text-sm mt-1">Redémarrez avec `wails dev`.</p>
              </div>
            </div>
          </div>
        )}

        {/* Barre d'actions en bas avec effet glassmorphism */}
        <div className="relative overflow-hidden rounded-2xl backdrop-blur-md border border-primary/10 bg-gradient-to-r from-background/60 to-background/40 shadow-lg">
          <div className="absolute inset-0 bg-noise opacity-20 mix-blend-soft-light"></div>
          <div className="relative z-10 py-3 px-4 flex justify-between items-center">
            <Button
              variant="default"
              size="sm"
              className="h-9 px-4 rounded-xl bg-primary/80 hover:bg-primary/90 backdrop-blur-sm shadow-md hover:shadow transform transition-all duration-300 hover:scale-[1.02]"
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
                  <HardDrive className="h-4 w-4 mr-2" />
                  Rafraîchir
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
