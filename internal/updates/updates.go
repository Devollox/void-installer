package updates

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"runtime"
	"strings"
	"time"
)

type ApiLatestInfo struct {
  Tag        string `json:"tag"`
  AssetName  string `json:"assetName"`
  DownloadURL string `json:"downloadUrl"`
}

type UpdateInfo struct {
  HasUpdate      bool   `json:"hasUpdate"`
  CurrentVersion string `json:"currentVersion"`
  LatestVersion  string `json:"latestVersion"`
  AssetName      string `json:"assetName"`
  AssetURL       string `json:"assetUrl"`
}

const (
  githubReleasesURL = "https://api.voidpresence.com/v2/github/releases"
  currentVersion    = "v1.0.0"
)

type Updates struct{}

func NewUpdates() *Updates {
  return &Updates{}
}

func normalizeTag(tag string) string {
  t := strings.TrimSpace(tag)
  if t == "" {
    return ""
  }
  if strings.HasPrefix(t, "v") || strings.HasPrefix(t, "V") {
    return t
  }
  return "v" + t
}

func (u *Updates) GetLatestInstallerRelease() (*ApiLatestInfo, error) {
  client := &http.Client{
    Timeout: 10 * time.Second,
  }

  osPlatform := "windows"
  switch runtime.GOOS {
  case "darwin":
    osPlatform = "macos"
  case "linux":
    osPlatform = "linux"
  }

  payload := map[string]string{
    "app":      "void-installer",
    "platform": osPlatform,
  }
  bodyBytes, err := json.Marshal(payload)
  if err != nil {
    return nil, err
  }

  req, err := http.NewRequest(http.MethodPost, githubReleasesURL, bytes.NewReader(bodyBytes))
  if err != nil {
    return nil, err
  }

  req.Header.Set("User-Agent", "void-installer-updater")
  req.Header.Set("Content-Type", "application/json")

  resp, err := client.Do(req)
  if err != nil {
    return nil, err
  }
  defer resp.Body.Close()

  if resp.StatusCode >= 400 {
    body, _ := io.ReadAll(resp.Body)
    return nil, fmt.Errorf("api error: %s body: %s", resp.Status, string(body))
  }

  body, err := io.ReadAll(resp.Body)
  if err != nil {
    return nil, err
  }

  var info ApiLatestInfo
  if err := json.Unmarshal(body, &info); err != nil {
    return nil, err
  }

  if info.Tag == "" {
    return nil, errors.New("empty tag from api")
  }

  return &info, nil
}

func (u *Updates) CheckInstallerUpdate() (*UpdateInfo, error) {
  rel, err := u.GetLatestInstallerRelease()
  if err != nil {
    return &UpdateInfo{
      HasUpdate:      false,
      CurrentVersion: normalizeTag(currentVersion),
      LatestVersion:  "",
      AssetName:      "",
      AssetURL:       "",
    }, nil
  }

  current := normalizeTag(currentVersion)
  latest := normalizeTag(rel.Tag)

  hasUpdate := current != "" && latest != "" && current != latest

  return &UpdateInfo{
    HasUpdate:      hasUpdate,
    CurrentVersion: current,
    LatestVersion:  latest,
    AssetName:      rel.AssetName,
    AssetURL:       rel.DownloadURL,
  }, nil
}
