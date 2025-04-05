package main

import (
	"context"
	"fmt"
	"net/url"
	"os/exec"
	"runtime"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// BrowserOpenURL opens a URL in the default browser
func (a *App) BrowserOpenURL(rawurl string) error {
	u, err := url.Parse(rawurl)
	if err != nil {
		return err
	}

	// Only allow http and https URLs
	if u.Scheme != "http" && u.Scheme != "https" {
		return fmt.Errorf("only HTTP and HTTPS URLs are supported")
	}

	// Open the URL in the default browser based on the operating system
	switch runtime.GOOS {
	case "darwin": // macOS
		return exec.Command("open", rawurl).Start()
	case "windows":
		return exec.Command("cmd", "/c", "start", rawurl).Start()
	case "linux":
		return exec.Command("xdg-open", rawurl).Start()
	default:
		return fmt.Errorf("unsupported operating system: %s", runtime.GOOS)
	}
} 