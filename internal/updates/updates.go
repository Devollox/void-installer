package updates

import (
  "encoding/json"
  "errors"
  "fmt"
  "io"
  "net/http"
  "os"
  "strings"
  "time"
)

type GitHubAsset struct {
  Name               string `json:"name"`
  BrowserDownloadURL string `json:"browser_download_url"`
}

type GitHubRelease struct {
  TagName string        `json:"tag_name"`
  Assets  []GitHubAsset `json:"assets"`
}

type UpdateInfo struct {
  HasUpdate      bool   `json:"hasUpdate"`
  CurrentVersion string `json:"currentVersion"`
  LatestVersion  string `json:"latestVersion"`
  AssetName      string `json:"assetName"`
  AssetURL       string `json:"assetUrl"`
}

const (
  githubLatestURL = "https://api.github.com/repos/void-presence/void-installer/releases/latest"
  currentVersion  = "v1.1.0"
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

func (u *Updates) GetLatestInstallerRelease() (*GitHubRelease, error) {
  client := &http.Client{
    Timeout: 10 * time.Second,
  }

  req, err := http.NewRequest(http.MethodGet, githubLatestURL, nil)
  if err != nil {
    return nil, err
  }

  req.Header.Set("Accept", "application/vnd.github+json")
  req.Header.Set("User-Agent", "void-installer-updater")

  token := os.Getenv("GITHUB_TOKEN")
  if token != "" {
    req.Header.Set("Authorization", "Bearer "+token)
  }

  resp, err := client.Do(req)
  if err != nil {
    return nil, err
  }
  defer resp.Body.Close()

  if resp.StatusCode >= 400 {
    return nil, fmt.Errorf("github api error: %s", resp.Status)
  }

  body, err := io.ReadAll(resp.Body)
  if err != nil {
    return nil, err
  }

  var release GitHubRelease
  if err := json.Unmarshal(body, &release); err != nil {
    return nil, err
  }

  if release.TagName == "" {
    return nil, errors.New("empty tag name from GitHub")
  }

  return &release, nil
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
  latest := normalizeTag(rel.TagName)

  hasUpdate := current != "" && latest != "" && current != latest

  var assetName string
  var assetURL string

  if len(rel.Assets) > 0 {
    assetName = rel.Assets[0].Name
    assetURL = rel.Assets[0].BrowserDownloadURL
  }

  return &UpdateInfo{
    HasUpdate:      hasUpdate,
    CurrentVersion: current,
    LatestVersion:  latest,
    AssetName:      assetName,
    AssetURL:       assetURL,
  }, nil
}
