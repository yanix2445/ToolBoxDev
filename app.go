package main

import (
	"context"
	"fmt"
	"os/exec"
	"runtime"
	"strconv"
	"strings"
)

// App struct
type App struct {
	ctx context.Context
}

// OSInfo contient des informations sur le système d'exploitation
type OSInfo struct {
	Name        string `json:"name"`
	Version     string `json:"version"`
	Arch        string `json:"arch"`
	IsMacOS     bool   `json:"isMacOS"`
	IsWindows   bool   `json:"isWindows"`
	CPUModel    string `json:"cpuModel"`
	GPUModel    string `json:"gpuModel"`
	MemoryTotal string `json:"memoryTotal"`
	DiskFree    string `json:"diskFree"`
	DiskTotal   string `json:"diskTotal"`
	OSFullName  string `json:"osFullName"`
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called at application startup
func (a *App) startup(ctx context.Context) {
	// Perform your setup here
	a.ctx = ctx
}

// domReady is called after front-end resources have been loaded
func (a App) domReady(ctx context.Context) {
	// Add your action here
}

// beforeClose is called when the application is about to quit,
// either by clicking the window close button or calling runtime.Quit.
// Returning true will cause the application to continue, false will continue shutdown as normal.
func (a *App) beforeClose(ctx context.Context) (prevent bool) {
	return false
}

// shutdown is called at application termination
func (a *App) shutdown(ctx context.Context) {
	// Perform your teardown here
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

// GetOSInfo détecte et retourne les informations sur le système d'exploitation
func (a *App) GetOSInfo() OSInfo {
	osInfo := OSInfo{
		Name:        runtime.GOOS,
		Version:     getOSVersion(),
		Arch:        runtime.GOARCH,
		IsMacOS:     runtime.GOOS == "darwin",
		IsWindows:   runtime.GOOS == "windows",
		CPUModel:    getCPUInfo(),
		GPUModel:    getGPUInfo(),
		MemoryTotal: getMemoryInfo(),
		DiskFree:    getDiskFreeSpace(),
		DiskTotal:   getDiskTotalSpace(),
		OSFullName:  getOSFullName(),
	}
	
	return osInfo
}

// getOSVersion retourne la version du système d'exploitation
func getOSVersion() string {
	var cmd *exec.Cmd
	var output []byte
	var err error

	switch runtime.GOOS {
	case "darwin":
		// Pour macOS, utiliser la commande sw_vers pour obtenir la version
		cmd = exec.Command("sw_vers", "-productVersion")
		output, err = cmd.Output()
		if err == nil {
			return strings.TrimSpace(string(output))
		}
	case "windows":
		// Pour Windows, utiliser la commande ver
		cmd = exec.Command("cmd", "/c", "ver")
		output, err = cmd.Output()
		if err == nil {
			// Format typique: "Microsoft Windows [Version 10.0.19042.1826]"
			version := strings.TrimSpace(string(output))
			// Trouver et extraire la partie de la version
			if idx := strings.Index(version, "[Version "); idx != -1 {
				versionPart := version[idx+9:]
				if endIdx := strings.Index(versionPart, "]"); endIdx != -1 {
					return versionPart[:endIdx]
				}
			}
		}
	}

	// En cas d'échec ou pour d'autres systèmes d'exploitation
	return "Version inconnue"
}

// getOSFullName retourne le nom complet du système d'exploitation
func getOSFullName() string {
	var cmd *exec.Cmd
	var output []byte
	var err error

	switch runtime.GOOS {
	case "darwin":
		// Pour macOS, obtenir à la fois le nom de version et la version numérique
		// D'abord récupérer le nom de version (Sonoma, Ventura, etc.)
		cmd = exec.Command("sw_vers", "-productName")
		nameOutput, nameErr := cmd.Output()
		if nameErr != nil {
			return "macOS"
		}
		
		// Récupérer le nom de la version (Sonoma, Ventura, etc.)
		cmd = exec.Command("sw_vers", "-productVersion")
		versionOutput, versionErr := cmd.Output()
		if versionErr != nil {
			return "macOS " + strings.TrimSpace(string(nameOutput))
		}
		
		// Récupérer le nom marketing (Sonoma, Ventura, etc.)
		marketingName := "macOS"
		version := strings.TrimSpace(string(versionOutput))
		majorVersion := strings.Split(version, ".")[0]
		
		switch majorVersion {
		case "14":
			marketingName = "Sonoma"
		case "13":
			marketingName = "Ventura"
		case "12":
			marketingName = "Monterey"
		case "11":
			marketingName = "Big Sur"
		case "10":
			minorVersion := strings.Split(version, ".")[1]
			switch minorVersion {
			case "15":
				marketingName = "Catalina"
			case "14":
				marketingName = "Mojave"
			case "13":
				marketingName = "High Sierra"
			case "12":
				marketingName = "Sierra"
			case "11":
				marketingName = "El Capitan"
			case "10":
				marketingName = "Yosemite"
			case "9":
				marketingName = "Mavericks"
			}
		}
		
		return "macOS " + marketingName + " " + version
		
	case "windows":
		// Pour Windows, obtenir la version et l'édition
		cmd = exec.Command("cmd", "/c", "ver")
		output, err = cmd.Output()
		if err != nil {
			return "Windows"
		}
		
		version := strings.TrimSpace(string(output))
		
		// Pour obtenir plus de détails sur l'édition de Windows
		editionCmd := exec.Command("wmic", "os", "get", "Caption")
		editionOutput, editionErr := editionCmd.Output()
		if editionErr == nil {
			lines := strings.Split(strings.TrimSpace(string(editionOutput)), "\n")
			if len(lines) >= 2 {
				edition := strings.TrimSpace(lines[1])
				if strings.Contains(edition, "Microsoft") {
					return edition
				}
			}
		}
		
		// Extraction simplifiée de la version
		if idx := strings.Index(version, "[Version "); idx != -1 {
			versionPart := version[idx+9:]
			if endIdx := strings.Index(versionPart, "]"); endIdx != -1 {
				v := versionPart[:endIdx]
				// Conversion des numéros de version en noms marketing
				if strings.HasPrefix(v, "10.0") {
					return "Windows 10/11 (Version " + v + ")"
				} else if strings.HasPrefix(v, "6.3") {
					return "Windows 8.1 (Version " + v + ")"
				} else if strings.HasPrefix(v, "6.2") {
					return "Windows 8 (Version " + v + ")"
				} else if strings.HasPrefix(v, "6.1") {
					return "Windows 7 (Version " + v + ")"
				}
				return "Windows (Version " + v + ")"
			}
		}
	}

	return runtime.GOOS
}

// getCPUInfo retourne les informations sur le CPU
func getCPUInfo() string {
	var cmd *exec.Cmd
	var output []byte
	var err error

	switch runtime.GOOS {
	case "darwin":
		// Pour macOS, détecter d'abord si c'est une puce Apple
		cmd = exec.Command("sysctl", "-n", "machdep.cpu.brand_string")
		output, err = cmd.Output()
		cpuInfo := ""
		
		if err == nil {
			cpuInfo = strings.TrimSpace(string(output))
		}
		
		// Vérifier si c'est une puce Apple Silicon
		isAppleSilicon := strings.Contains(strings.ToLower(cpuInfo), "apple") || 
					       strings.Contains(strings.ToLower(cpuInfo), "m1") || 
					       strings.Contains(strings.ToLower(cpuInfo), "m2") ||
					       strings.Contains(strings.ToLower(cpuInfo), "m3")
		
		if isAppleSilicon || strings.TrimSpace(cpuInfo) == "" {
			// Pour Apple Silicon, obtenir des informations plus détaillées
			cmd = exec.Command("sysctl", "-n", "hw.model")
			modelOutput, modelErr := cmd.Output()
			
			if modelErr == nil {
				model := strings.TrimSpace(string(modelOutput))
				
				// Détection de la série M exacte
				if strings.Contains(model, "Mac") {
					// Initialiser avec une valeur par défaut
					appleChip := "Apple Silicon"
					
					// Détection précise basée sur l'identifiant du modèle Mac
					if strings.Contains(model, "Mac13,") {
						appleChip = "Apple M1"
						
						// Détection des variantes M1 Pro/Max/Ultra
						if strings.Contains(model, "MacBookPro18,") {
							appleChip = "Apple M1 Pro/Max"
						} else if strings.Contains(model, "Mac13,1") {
							appleChip = "Apple M1"
						} else if strings.Contains(model, "Mac13,2") {
							appleChip = "Apple M1 (8-Core)"
						}
					} else if strings.Contains(model, "Mac14,") {
						appleChip = "Apple M2"
						
						// Détection des variantes M2 Pro/Max/Ultra
						if strings.Contains(model, "Mac14,5") || strings.Contains(model, "Mac14,6") {
							appleChip = "Apple M2 Pro/Max"
						}
					} else if strings.Contains(model, "Mac15,") {
						appleChip = "Apple M3"
						
						// Détection des variantes M3 Pro/Max/Ultra
						if strings.Contains(model, "Mac15,6") || strings.Contains(model, "Mac15,8") || strings.Contains(model, "Mac15,10") {
							appleChip = "Apple M3 Pro/Max"
						} else if strings.Contains(model, "Mac15,11") {
							appleChip = "Apple M3 Ultra"
						}
					} else if strings.Contains(model, "Mac16,") {
						appleChip = "Apple M4"
						
						// Détection des variantes M4 Pro/Max/Ultra si présentes
						if strings.Contains(model, "Mac16,5") {
							appleChip = "Apple M4 Pro"
						}
					}
					
					return appleChip
				}
			}
			
			// Si on ne peut pas déterminer le modèle exact, retourner un générique
			return "Apple Silicon"
		}
		
		// Si ce n'est pas Apple Silicon, renvoyer le nom du processeur Intel
		return cpuInfo
		
	case "windows":
		// Pour Windows, utiliser wmic pour obtenir le modèle du CPU
		cmd = exec.Command("wmic", "cpu", "get", "name")
		output, err = cmd.Output()
		if err == nil {
			lines := strings.Split(strings.TrimSpace(string(output)), "\n")
			if len(lines) >= 2 {
				cpuInfo := strings.TrimSpace(lines[1])
				// Mettre en forme pour les CPU Intel et AMD
				if strings.Contains(strings.ToLower(cpuInfo), "intel") {
					// Extraire la génération du processeur Intel si possible
					// Par exemple: Intel(R) Core(TM) i7-10700K CPU @ 3.80GHz
					if strings.Contains(cpuInfo, "i3-") || strings.Contains(cpuInfo, "i5-") || strings.Contains(cpuInfo, "i7-") || strings.Contains(cpuInfo, "i9-") {
						// Extraire le numéro de modèle
						return cpuInfo
					}
					return "Intel " + cpuInfo
				} else if strings.Contains(strings.ToLower(cpuInfo), "amd") || strings.Contains(strings.ToLower(cpuInfo), "ryzen") {
					// Pour AMD, extraire la génération si possible
					// Par exemple: AMD Ryzen 9 5900X 12-Core Processor
					return cpuInfo
				}
				return cpuInfo
			}
		}
	default:
		// Pour Linux et autres systèmes Unix
		cmd = exec.Command("cat", "/proc/cpuinfo")
		output, err = cmd.Output()
		if err == nil {
			lines := strings.Split(string(output), "\n")
			for _, line := range lines {
				if strings.Contains(line, "model name") {
					parts := strings.Split(line, ":")
					if len(parts) >= 2 {
						return strings.TrimSpace(parts[1])
					}
				}
			}
		}
	}

	return "CPU inconnu"
}

// getGPUInfo retourne les informations sur le GPU
func getGPUInfo() string {
	var cmd *exec.Cmd
	var output []byte
	var err error

	switch runtime.GOOS {
	case "darwin":
		// Pour macOS, le GPU est intégré dans la puce Apple pour les M1/M2/M3/M4
		if strings.Contains(getCPUInfo(), "Apple Silicon") {
			return "GPU intégré Apple"
		}
		// Pour les autres Mac
		cmd = exec.Command("system_profiler", "SPDisplaysDataType")
		output, err = cmd.Output()
		if err == nil {
			gpuInfo := string(output)
			if strings.Contains(gpuInfo, "Chipset Model:") {
				lines := strings.Split(gpuInfo, "\n")
				for _, line := range lines {
					if strings.Contains(line, "Chipset Model:") {
						parts := strings.Split(line, ":")
						if len(parts) >= 2 {
							return strings.TrimSpace(parts[1])
						}
					}
				}
			}
		}
	case "windows":
		// Pour Windows, utiliser wmic pour obtenir le modèle du GPU
		cmd = exec.Command("wmic", "path", "win32_VideoController", "get", "name")
		output, err = cmd.Output()
		if err == nil {
			lines := strings.Split(strings.TrimSpace(string(output)), "\n")
			if len(lines) >= 2 {
				gpuInfo := strings.TrimSpace(lines[1])
				// Mettre en forme pour NVIDIA, AMD et Intel
				if strings.Contains(strings.ToLower(gpuInfo), "nvidia") {
					return "NVIDIA " + gpuInfo
				} else if strings.Contains(strings.ToLower(gpuInfo), "amd") || strings.Contains(strings.ToLower(gpuInfo), "radeon") {
					return "AMD " + gpuInfo
				} else if strings.Contains(strings.ToLower(gpuInfo), "intel") {
					return "Intel " + gpuInfo
				}
				return gpuInfo
			}
		}
	default:
		// Pour Linux
		cmd = exec.Command("lspci", "-v")
		output, err = cmd.Output()
		if err == nil {
			lines := strings.Split(string(output), "\n")
			for i, line := range lines {
				if strings.Contains(strings.ToLower(line), "vga compatible") || 
                   strings.Contains(strings.ToLower(line), "3d") || 
                   strings.Contains(strings.ToLower(line), "display") {
					if i+1 < len(lines) {
						return strings.TrimSpace(line)
					}
				}
			}
		}
	}

	return "GPU inconnu"
}

// getMemoryInfo retourne la quantité totale de mémoire RAM
func getMemoryInfo() string {
	var cmd *exec.Cmd
	var output []byte
	var err error

	switch runtime.GOOS {
	case "darwin":
		// Pour macOS
		cmd = exec.Command("sysctl", "-n", "hw.memsize")
		output, err = cmd.Output()
		if err == nil {
			memBytes, parseErr := strconv.ParseInt(strings.TrimSpace(string(output)), 10, 64)
			if parseErr == nil {
				// Convertir en gigaoctets et arrondir
				memGB := float64(memBytes) / (1024 * 1024 * 1024)
				return fmt.Sprintf("%.0f Go", memGB)
			}
		}
	case "windows":
		// Pour Windows
		cmd = exec.Command("wmic", "computersystem", "get", "totalphysicalmemory")
		output, err = cmd.Output()
		if err == nil {
			lines := strings.Split(strings.TrimSpace(string(output)), "\n")
			if len(lines) >= 2 {
				memBytes, parseErr := strconv.ParseInt(strings.TrimSpace(lines[1]), 10, 64)
				if parseErr == nil {
					// Convertir en gigaoctets et arrondir
					memGB := float64(memBytes) / (1024 * 1024 * 1024)
					return fmt.Sprintf("%.0f Go", memGB)
				}
			}
		}
	default:
		// Pour Linux
		cmd = exec.Command("grep", "MemTotal", "/proc/meminfo")
		output, err = cmd.Output()
		if err == nil {
			// Format typique: "MemTotal:       16384516 kB"
			line := strings.TrimSpace(string(output))
			parts := strings.Fields(line)
			if len(parts) >= 2 {
				memKB, parseErr := strconv.ParseInt(parts[1], 10, 64)
				if parseErr == nil {
					// Convertir en gigaoctets et arrondir
					memGB := float64(memKB) / (1024 * 1024)
					return fmt.Sprintf("%.0f Go", memGB)
				}
			}
		}
	}

	return "Mémoire inconnue"
}

// getDiskFreeSpace retourne l'espace disque libre
func getDiskFreeSpace() string {
	var cmd *exec.Cmd
	var output []byte
	var err error

	switch runtime.GOOS {
	case "darwin":
		// Pour macOS, utiliser df pour obtenir l'espace disque libre sur le volume principal
		cmd = exec.Command("df", "-h", "/")
		output, err = cmd.Output()
		if err == nil {
			lines := strings.Split(string(output), "\n")
			if len(lines) >= 2 {
				fields := strings.Fields(lines[1])
				if len(fields) >= 4 {
					return fields[3] // Espace disponible
				}
			}
		}
	case "windows":
		// Pour Windows
		cmd = exec.Command("wmic", "logicaldisk", "where", "DeviceID='C:'", "get", "FreeSpace")
		output, err = cmd.Output()
		if err == nil {
			lines := strings.Split(strings.TrimSpace(string(output)), "\n")
			if len(lines) >= 2 {
				freeSpace, parseErr := strconv.ParseInt(strings.TrimSpace(lines[1]), 10, 64)
				if parseErr == nil {
					// Convertir en gigaoctets
					freeGB := float64(freeSpace) / (1024 * 1024 * 1024)
					return fmt.Sprintf("%.2f Go", freeGB)
				}
			}
		}
	default:
		// Pour Linux
		cmd = exec.Command("df", "-h", "/")
		output, err = cmd.Output()
		if err == nil {
			lines := strings.Split(string(output), "\n")
			if len(lines) >= 2 {
				fields := strings.Fields(lines[1])
				if len(fields) >= 4 {
					return fields[3] // Espace disponible
				}
			}
		}
	}

	return "Espace disque inconnu"
}

// getDiskTotalSpace retourne la capacité totale du disque
func getDiskTotalSpace() string {
	var cmd *exec.Cmd
	var output []byte
	var err error

	switch runtime.GOOS {
	case "darwin":
		// Pour macOS
		cmd = exec.Command("df", "-h", "/")
		output, err = cmd.Output()
		if err == nil {
			lines := strings.Split(string(output), "\n")
			if len(lines) >= 2 {
				fields := strings.Fields(lines[1])
				if len(fields) >= 2 {
					return fields[1] // Taille totale
				}
			}
		}
	case "windows":
		// Pour Windows
		cmd = exec.Command("wmic", "logicaldisk", "where", "DeviceID='C:'", "get", "Size")
		output, err = cmd.Output()
		if err == nil {
			lines := strings.Split(strings.TrimSpace(string(output)), "\n")
			if len(lines) >= 2 {
				totalSpace, parseErr := strconv.ParseInt(strings.TrimSpace(lines[1]), 10, 64)
				if parseErr == nil {
					// Convertir en gigaoctets
					totalGB := float64(totalSpace) / (1024 * 1024 * 1024)
					return fmt.Sprintf("%.0f Go", totalGB)
				}
			}
		}
	default:
		// Pour Linux
		cmd = exec.Command("df", "-h", "/")
		output, err = cmd.Output()
		if err == nil {
			lines := strings.Split(string(output), "\n")
			if len(lines) >= 2 {
				fields := strings.Fields(lines[1])
				if len(fields) >= 2 {
					return fields[1] // Taille totale
				}
			}
		}
	}

	return "Capacité disque inconnue"
}
