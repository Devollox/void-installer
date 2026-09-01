package installer

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"time"

	wailsruntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

type Installer struct {
	ctx context.Context
}

func NewInstaller() *Installer {
	return &Installer{}
}

func (i *Installer) Startup(ctx context.Context) {
	i.ctx = ctx
}

type LatestReleaseInfo struct {
	Tag         string `json:"tag"`
	AssetName   string `json:"assetName"`
	DownloadURL string `json:"downloadUrl"`
}

const githubReleasesURL = "https://api.voidpresence.com/v2/github/releases"


func platformAssetSuffix() string {
	switch runtime.GOOS {
	case "darwin":
		return ".dmg"
	case "linux":
		return ".deb"
	default:
		return ".exe"
	}
}

func tempInstallerPattern() string {
	switch runtime.GOOS {
	case "darwin":
		return "Void.Presence.Setup.*.dmg"
	case "linux":
		return "Void.Presence.Setup.*.deb"
	default:
		return "Void.Presence.Setup.*.exe"
	}
}

func (i *Installer) GetLatestRelease() (*LatestReleaseInfo, error) {
	osPlatform := "windows"
	switch runtime.GOOS {
	case "darwin":
		osPlatform = "macos"
	case "linux":
		osPlatform = "linux"
	}

	payload := map[string]string{
		"app":      "void-presence",
		"platform": osPlatform,
	}
	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest(
		http.MethodPost,
		githubReleasesURL,
		bytes.NewReader(bodyBytes),
	)
	if err != nil {
		return nil, err
	}

	req.Header.Set("User-Agent", "VoidPresenceInstaller/1.0")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		b, _ := io.ReadAll(resp.Body)
		return nil, errors.New("bad status from api: " + resp.Status + " body: " + string(b))
	}

	var info LatestReleaseInfo
	if err := json.NewDecoder(resp.Body).Decode(&info); err != nil {
		return nil, err
	}

	if info.Tag == "" || info.AssetName == "" || info.DownloadURL == "" {
		return nil, errors.New("incomplete latest release info")
	}

	return &info, nil
}

type DownloadResult struct {
	Path string `json:"path"`
}

func (i *Installer) DownloadInstaller(url string) (*DownloadResult, error) {
	if i.ctx == nil {
		return nil, errors.New("no context")
	}

	if url == "" {
		return nil, errors.New("empty download url")
	}

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "VoidPresenceInstaller/1.0")

	client := &http.Client{
		Timeout: 120 * time.Second,
	}

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, errors.New("bad status: " + resp.Status)
	}

	destFile, err := os.CreateTemp(os.TempDir(), tempInstallerPattern())
	if err != nil {
		return nil, err
	}
	defer destFile.Close()

	destPath := destFile.Name()

	total := resp.ContentLength
	var downloaded int64 = 0
	buf := make([]byte, 32*1024)
	lastEvent := time.Now()

	for {
		n, readErr := resp.Body.Read(buf)
		if n > 0 {
			written, writeErr := destFile.Write(buf[:n])
			if writeErr != nil {
				return nil, writeErr
			}
			downloaded += int64(written)
		}

		now := time.Now()
		if now.Sub(lastEvent) > 150*time.Millisecond || readErr != nil {
			percent := 0
			if total > 0 {
				percent = int(float64(downloaded) / float64(total) * 100.0)
				if percent > 100 {
					percent = 100
				}
			}
			wailsruntime.EventsEmit(i.ctx, "download:progress", percent)
			lastEvent = now
		}

		if readErr != nil {
			if readErr == io.EOF {
				break
			}
			return nil, readErr
		}
	}

	return &DownloadResult{Path: destPath}, nil
}

func killApp() {
	switch runtime.GOOS {
	case "windows":
		cmd := exec.Command("taskkill", "/IM", "Void Presence.exe", "/T", "/F")
		hideWindow(cmd)
		_ = cmd.Run()
	case "darwin":
		_ = exec.Command("pkill", "-x", "Void Presence").Run()
	case "linux":
		_ = exec.Command("pkill", "-x", "void-presence").Run()
		_ = exec.Command("pkill", "-x", "Void Presence").Run()
	}
}

func appInstallPath() (string, error) {
	switch runtime.GOOS {
	case "windows":
		localAppData := os.Getenv("LOCALAPPDATA")
		if localAppData == "" {
			return "", errors.New("LOCALAPPDATA not set")
		}
		return filepath.Join(localAppData, "Programs", "voidpresence", "Void Presence.exe"), nil
	case "darwin":
		return "/Applications/Void Presence.app/Contents/MacOS/Void Presence", nil
	case "linux":
		return "/usr/bin/void-presence", nil
	default:
		return "", errors.New("unsupported platform: " + runtime.GOOS)
	}
}

func launchApp(appPath string) error {
	switch runtime.GOOS {
	case "darwin":
		appBundle := "/Applications/Void Presence.app"
		cmd := exec.Command("open", appBundle)
		return cmd.Start()
	case "linux":
		cmd := exec.Command(appPath)
		return cmd.Start()
	default:
		cmd := exec.Command(appPath)
		hideWindow(cmd)
		return cmd.Start()
	}
}

func (i *Installer) RunNsis(path string) error {
	if path == "" {
		return errors.New("empty path")
	}

	killApp()

	if i.ctx != nil {
		wailsruntime.EventsEmit(i.ctx, "install:progress", "Running installer…")
	}

	if err := runInstaller(path); err != nil {
		if i.ctx != nil {
			wailsruntime.EventsEmit(i.ctx, "install:progress", "Installer failed")
		}
		return err
	}

	appPath, err := appInstallPath()
	if err != nil {
		return err
	}

	if i.ctx != nil {
		wailsruntime.EventsEmit(i.ctx, "install:progress", "Starting application…")
	}

	if _, err := os.Stat(appPath); err != nil {
		if runtime.GOOS != "windows" {
			_ = launchApp(appPath)
			return nil
		}
		return fmt.Errorf("app exe not found at %s: %w", appPath, err)
	}

	return launchApp(appPath)
}

func runInstaller(path string) error {
	switch runtime.GOOS {
	case "windows":
		cmd := exec.Command(path, "/S")
		hideWindow(cmd)
		return cmd.Run()
	case "darwin":
		if err := installDmg(path); err != nil {
			return err
		}
		return nil
	case "linux":
		if err := exec.Command("pkexec", "dpkg", "-i", path).Run(); err != nil {
			return exec.Command("sudo", "dpkg", "-i", path).Run()
		}
		return nil
	default:
		return errors.New("unsupported platform: " + runtime.GOOS)
	}
}

func installDmg(dmgPath string) error {
	mountPoint := filepath.Join(os.TempDir(), "VoidPresenceDMG")
	_ = os.MkdirAll(mountPoint, 0755)

	attach := exec.Command("hdiutil", "attach", "-mountpoint", mountPoint, "-nobrowse", "-quiet", dmgPath)
	if err := attach.Run(); err != nil {
		return fmt.Errorf("hdiutil attach: %w", err)
	}

	defer func() {
		_ = exec.Command("hdiutil", "detach", mountPoint, "-quiet").Run()
	}()

	entries, err := os.ReadDir(mountPoint)
	if err != nil {
		return fmt.Errorf("readdir mountpoint: %w", err)
	}

	var appName string
	for _, e := range entries {
		if filepath.Ext(e.Name()) == ".app" {
			appName = e.Name()
			break
		}
	}
	if appName == "" {
		return errors.New("no .app found in DMG")
	}

	src := filepath.Join(mountPoint, appName)
	dest := filepath.Join("/Applications", appName)

	if err := exec.Command("ditto", src, dest).Run(); err != nil {
		return fmt.Errorf("ditto copy: %w", err)
	}

	return nil
}

func (i *Installer) RunInstallerUpdater(path string) error {
	if path == "" {
		return errors.New("empty path")
	}

	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "darwin":
		cmd = exec.Command("open", path)
	case "linux":
		cmd = exec.Command("pkexec", "dpkg", "-i", path)
	default:
		cmd = exec.Command(path)
		hideWindow(cmd)
	}

	if err := cmd.Start(); err != nil {
		return err
	}

	go func() {
		if i.ctx != nil {
			wailsruntime.Quit(i.ctx)
		}
	}()

	return nil
}

func (i *Installer) RemoveVoidPresence(path string) error {
	if path == "" {
		return errors.New("empty install path")
	}

	killApp()

	switch runtime.GOOS {
	case "windows":
		uninstallPath := filepath.Join(path, "Uninstall Void Presence.exe")
		if _, err := os.Stat(uninstallPath); err != nil {
			return err
		}
		cmd := exec.Command(uninstallPath, "/S")
		hideWindow(cmd)
		return cmd.Run()

	case "darwin":
		appBundle := "/Applications/Void Presence.app"
		if _, err := os.Stat(appBundle); err != nil {
			return err
		}
		return os.RemoveAll(appBundle)

	case "linux":
		if err := exec.Command("pkexec", "dpkg", "--remove", "void-presence").Run(); err != nil {
			return os.RemoveAll(path)
		}
		return nil

	default:
		return errors.New("unsupported platform: " + runtime.GOOS)
	}
}
