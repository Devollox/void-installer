package main

import (
  "context"
  "embed"
  "log"

  "github.com/wailsapp/wails/v2"
  "github.com/wailsapp/wails/v2/pkg/options"
  "github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
  defer func() {
    if r := recover(); r != nil {
      log.Printf("panic: %v", r)
    }
  }()

  app := NewApp()
  installer := NewInstaller()
  updates := NewUpdates()

  err := wails.Run(&options.App{
    Title:  "Void Presence Installer",
    Width:  680,
    Height: 472,
    Frameless: true,
		DisableResize: true,
    AssetServer: &assetserver.Options{
      Assets: assets,
    },
    BackgroundColour: &options.RGBA{R: 5, G: 5, B: 5, A: 1},
    OnStartup: func(ctx context.Context) {
      app.startup(ctx)
      installer.Startup(ctx)
    },
    Bind: []interface{}{
      app,
      installer,
      updates,
    },
  })

  if err != nil {
    log.Printf("wails error: %v", err)
  }
}
