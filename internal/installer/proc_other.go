//go:build !windows

package installer

import "os/exec"

func hideWindow(_ *exec.Cmd) {}
