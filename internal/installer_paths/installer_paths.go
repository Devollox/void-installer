package installer_paths

import (
	"context"
	"os"
	"path/filepath"
	"runtime"
)

type Paths struct {
	ctx context.Context
}

func NewPaths() *Paths {
	return &Paths{}
}

func (p *Paths) Startup(ctx context.Context) {
	p.ctx = ctx
}

type InstallPathInfo struct {
	InstallPath string `json:"installPath"`
}

func (p *Paths) GetInstallPath() (*InstallPathInfo, error) {
	switch runtime.GOOS {
	case "windows":
		return windowsInstallPath()
	case "darwin":
		return &InstallPathInfo{
			InstallPath: "/Applications/Void Presence.app",
		}, nil
	case "linux":
		return &InstallPathInfo{
			InstallPath: "/usr/bin",
		}, nil
	default:
		return &InstallPathInfo{
			InstallPath: filepath.Join(os.TempDir(), "voidpresence"),
		}, nil
	}
}

func windowsInstallPath() (*InstallPathInfo, error) {
	localAppData := os.Getenv("LOCALAPPDATA")
	if localAppData == "" {
		return &InstallPathInfo{
			InstallPath: filepath.Join("C:\\", "Users", "Public", "Programs", "voidpresence"),
		}, nil
	}

	return &InstallPathInfo{
		InstallPath: filepath.Join(localAppData, "Programs", "voidpresence"),
	}, nil
}
