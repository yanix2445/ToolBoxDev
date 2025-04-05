package main

import (
	"fmt"
	"regexp"
	"runtime"
	"strings"
)

// ValidateCommand vérifie si la commande d'installation est valide pour le système d'exploitation actuel
func (a *App) ValidateCommand(command string, appName string) string {
	if command == "" {
		return "error:La commande est vide"
	}

	// Vérifier si la commande contient des caractères dangereux
	dangerousPatterns := []string{
		";\\s*rm", // Commande rm après un point-virgule
		"&&\\s*rm", // Commande rm après &&
		"rm\\s+-rf", // Suppression récursive
		"\\|\\s*rm", // Pipe vers rm
		"sudo\\s+rm", // sudo rm
		">\\s*/dev", // Redirection vers /dev
		">\\s*/etc", // Redirection vers /etc
		"curl\\s+.*\\s*\\|\\s*sh", // Téléchargement et exécution de script
		"wget\\s+.*\\s*\\|\\s*sh", // Téléchargement et exécution de script
	}

	for _, pattern := range dangerousPatterns {
		matched, _ := regexp.MatchString(pattern, command)
		if matched {
			return "error:La commande contient des instructions potentiellement dangereuses"
		}
	}

	os := runtime.GOOS
	switch os {
	case "darwin":
		return validateMacOSCommand(command, appName)
	case "windows":
		return validateWindowsCommand(command, appName)
	case "linux":
		return validateLinuxCommand(command, appName)
	default:
		return "warning:Système d'exploitation non reconnu pour la validation"
	}
}

// Validation pour macOS
func validateMacOSCommand(command string, appName string) string {
	// Vérifier si la commande utilise Homebrew
	if !strings.Contains(command, "brew") {
		return "warning:La commande ne semble pas utiliser Homebrew, qui est recommandé pour macOS"
	}

	// Vérifier le format général d'une commande Homebrew
	if strings.Contains(command, "brew install") {
		// Vérifier si le nom de l'application est inclus
		if !strings.Contains(strings.ToLower(command), strings.ToLower(appName)) && 
		   !strings.Contains(command, "-cask") && !strings.Contains(command, "--cask") {
			return "warning:La commande n'inclut pas explicitement le nom de l'application"
		}
		return "success:La commande semble valide pour macOS"
	} else if strings.Contains(command, "brew cask install") || 
			  strings.Contains(command, "brew install --cask") {
		return "success:La commande semble valide pour l'installation d'une application GUI sur macOS"
	}

	return "warning:Le format de la commande Homebrew est inhabituel"
}

// Validation pour Windows
func validateWindowsCommand(command string, appName string) string {
	// Vérifier si la commande utilise winget
	if !strings.Contains(command, "winget") {
		return "warning:La commande ne semble pas utiliser winget, qui est recommandé pour Windows"
	}

	// Vérifier le format général d'une commande winget
	if strings.Contains(command, "winget install") {
		// Vérifier si le nom de l'application est inclus
		if !strings.Contains(strings.ToLower(command), strings.ToLower(appName)) {
			return "warning:La commande n'inclut pas explicitement le nom de l'application"
		}
		return "success:La commande semble valide pour Windows"
	}

	return "warning:Le format de la commande winget est inhabituel"
}

// Validation pour Linux
func validateLinuxCommand(command string, appName string) string {
	// Vérifier les gestionnaires de paquets courants
	packageManagers := []string{"apt", "apt-get", "dnf", "yum", "pacman", "zypper", "snap", "flatpak"}
	
	foundManager := false
	for _, pm := range packageManagers {
		if strings.Contains(command, pm) {
			foundManager = true
			break
		}
	}

	if !foundManager {
		return "warning:La commande ne semble pas utiliser un gestionnaire de paquets Linux courant"
	}

	// Vérifier les commandes d'installation communes
	installPatterns := []string{"install", "i ", "-S ", "-i "}
	
	foundInstall := false
	for _, pattern := range installPatterns {
		if strings.Contains(command, pattern) {
			foundInstall = true
			break
		}
	}

	if !foundInstall {
		return "warning:La commande ne semble pas être une commande d'installation"
	}

	// Vérifier si le nom de l'application est inclus
	if !strings.Contains(strings.ToLower(command), strings.ToLower(appName)) {
		return "warning:La commande n'inclut pas explicitement le nom de l'application"
	}

	return "success:La commande semble valide pour Linux"
} 