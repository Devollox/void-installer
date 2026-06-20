package installer_paths

import (
	"context"
	"os"
	"path/filepath"
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
	localAppData := os.Getenv("LOCALAPPDATA")
	if localAppData == "" {
		return &InstallPathInfo{
			InstallPath: filepath.Join("C:\\", "Users", "Public", "Programs", "voidpresence"),
		}, nil
	}

	installPath := filepath.Join(
		localAppData,
		"Programs",
		"voidpresence",
	)

	return &InstallPathInfo{
		InstallPath: installPath,
	}, nil
}
