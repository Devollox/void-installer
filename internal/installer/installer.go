package installer

import (
  "context"
  "encoding/json"
  "errors"
  "io"
  "net/http"
  "os"
  "os/exec"
  "path/filepath"
  "time"

  "github.com/wailsapp/wails/v2/pkg/runtime"
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
  Tag       string `json:"tag"`
  AssetName string `json:"assetName"`
}

func (i *Installer) GetLatestRelease() (*LatestReleaseInfo, error) {
  req, err := http.NewRequest("GET", "https://api.github.com/repos/Devollox/void-presence/releases/latest", nil)
  if err != nil {
    return nil, err
  }
  req.Header.Set("User-Agent", "VoidPresenceInstaller/1.0")

  resp, err := http.DefaultClient.Do(req)
  if err != nil {
    return nil, err
  }
  defer resp.Body.Close()

  if resp.StatusCode < 200 || resp.StatusCode >= 300 {
    b, _ := io.ReadAll(resp.Body)
    return nil, errors.New("bad status: " + resp.Status + " body: " + string(b))
  }

  type asset struct {
    Name string `json:"name"`
    URL  string `json:"browser_download_url"`
  }
  type ghRelease struct {
    TagName string  `json:"tag_name"`
    Name    string  `json:"name"`
    Assets  []asset `json:"assets"`
  }

  var data ghRelease
  if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
    return nil, err
  }

  if len(data.Assets) == 0 {
    return nil, errors.New("no assets in latest release")
  }

  selected := data.Assets[0]
  for _, a := range data.Assets {
    if len(a.Name) > 4 && a.Name[len(a.Name)-4:] == ".exe" {
      selected = a
      break
    }
  }

  info := &LatestReleaseInfo{
    Tag:       data.TagName,
    AssetName: selected.Name,
  }

  return info, nil
}

type DownloadResult struct {
  Path string `json:"path"`
}

func (i *Installer) DownloadInstaller(url string) (*DownloadResult, error) {
  if i.ctx == nil {
    return nil, errors.New("no context")
  }

  req, err := http.NewRequest("GET", url, nil)
  if err != nil {
    return nil, err
  }
  req.Header.Set("User-Agent", "VoidPresenceInstaller/1.0")

  resp, err := http.DefaultClient.Do(req)
  if err != nil {
    return nil, err
  }
  defer resp.Body.Close()

  if resp.StatusCode < 200 || resp.StatusCode >= 300 {
    return nil, errors.New("bad status: " + resp.Status)
  }

  tmpDir := os.TempDir()
  destPath := filepath.Join(tmpDir, "Void.Presence.Setup.exe")

  out, err := os.Create(destPath)
  if err != nil {
    return nil, err
  }
  defer out.Close()

  total := resp.ContentLength
  var downloaded int64 = 0
  buf := make([]byte, 32*1024)
  lastEvent := time.Now()

  for {
    n, readErr := resp.Body.Read(buf)
    if n > 0 {
      written, writeErr := out.Write(buf[:n])
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
      runtime.EventsEmit(i.ctx, "download:progress", percent)
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

func (i *Installer) RunNsis(path string) error {
  if path == "" {
    return errors.New("empty path")
  }

  if i.ctx != nil {
    runtime.EventsEmit(i.ctx, "install:progress", "Running installer…")
  }

  cmd := exec.Command(path, "/S")
  if err := cmd.Run(); err != nil {
    if i.ctx != nil {
      runtime.EventsEmit(i.ctx, "install:progress", "Installer failed")
    }
    return err
  }

  localAppData := os.Getenv("LOCALAPPDATA")
  if localAppData == "" {
    return errors.New("LOCALAPPDATA not set")
  }

  appPath := filepath.Join(
    localAppData,
    "Programs",
    "voidpresence",
    "Void Presence.exe",
  )

  if i.ctx != nil {
    runtime.EventsEmit(i.ctx, "install:progress", "Starting application…")
  }

  return exec.Command(appPath).Start()
}

func (i *Installer) RunInstallerUpdater(path string) error {
  if path == "" {
    return errors.New("empty path")
  }

  cmd := exec.Command(path)
  if err := cmd.Start(); err != nil {
    return err
  }

  go func() {
    runtime.Quit(i.ctx)
  }()

  return nil
}

func (i *Installer) RemoveVoidPresence(path string) error {
  if path == "" {
    return errors.New("empty install path")
  }

  kill := exec.Command("taskkill", "/IM", "Void Presence.exe", "/T", "/F")
  _ = kill.Run()

  uninstallPath := filepath.Join(path, "Uninstall Void Presence.exe")
  if _, err := os.Stat(uninstallPath); err != nil {
    return err
  }

  cmd := exec.Command(uninstallPath, "/S")
  return cmd.Run()
}
