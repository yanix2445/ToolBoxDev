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
