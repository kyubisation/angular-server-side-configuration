package dotenv

import (
	"bytes"
	"fmt"
	"os"
	"path"

	"github.com/fsnotify/fsnotify"
	"github.com/hashicorp/go-envparse"
	"golang.org/x/exp/slog"
)

type DotEnv struct {
	filePath string
	env      map[string]*string
	watcher  *fsnotify.Watcher
}

func Create(filePath string, onChange func(variables map[string]*string)) DotEnv {
	instance := DotEnv{
		filePath: filePath,
		env:      parseDotEnv(filePath),
		watcher:  nil,
	}
	onChange(instance.env)
	instance.watcher = createWatcher(filePath, func() {
		instance.env = parseDotEnv(filePath)
		onChange(instance.env)
	})
	return instance
}

func parseDotEnv(filePath string) map[string]*string {
	content, err := os.ReadFile(filePath)
	if err != nil {
		return make(map[string]*string)
	}

	slog.Info(fmt.Sprintf("Detected .env file at %v. Reading variables and adding watch.", filePath))
	env, err := envparse.Parse(bytes.NewReader(content))
	if err != nil {
		slog.Error(fmt.Sprintf("Failed to parse dot env file at %v. Continuing without dot env file.", filePath))
		return make(map[string]*string)
	} else if len(env) == 0 {
		return make(map[string]*string, 0)
	}

	result := make(map[string]*string, len(env))
	for k, v := range env {
		value := v
		result[k] = &value
	}

	return result
}

func createWatcher(filePath string, onChange func()) *fsnotify.Watcher {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		slog.Error(fmt.Sprintf("Failed to create file watcher for %v", filePath))
		return nil
	}

	go func() {
		for {
			select {
			case event, ok := <-watcher.Events:
				if !ok {
					return
				}
				if event.Has(fsnotify.Write) {
					onChange()
				}
			case err, ok := <-watcher.Errors:
				if !ok {
					return
				}
				slog.Error(fmt.Sprintf("%v", err))
			}
		}
	}()

	err = watcher.Add(path.Dir(filePath))
	if err != nil {
		slog.Error(fmt.Sprintf("Failed to watch file changes for %v", filePath))
		return nil
	}

	return watcher
}

func (env DotEnv) Close() {
	if env.watcher != nil {
		env.watcher.Close()
	}
}
