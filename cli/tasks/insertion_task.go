package tasks

import (
	"fmt"
	"ngssc/cli/config"
	"ngssc/cli/targets"
	"path/filepath"
	"strings"

	"github.com/bmatcuk/doublestar"
)

// InsertionTask represents an insertion task
type InsertionTask struct {
	path   string
	dryRun bool
}

// New InsertionTask from a path
func New(path string, dryRun bool) InsertionTask {
	task := InsertionTask{path, dryRun}
	return task
}

// Single will perform the insertion for a single ngssc.json
func (task InsertionTask) Single() error {
	ngsscFile := filepath.Join(task.path, "ngssc.json")
	return task.insertWithNgssc(ngsscFile)
}

// Recursive will perform the insertion for all ngssc.json below given path
func (task InsertionTask) Recursive() error {
	pattern := filepath.Join(task.path, "**", "ngssc.json")
	files, err := doublestar.Glob(pattern)
	if err != nil {
		fmt.Printf("Unable to resolve pattern: %v\n", pattern)
		return err
	} else if len(files) == 0 {
		fmt.Printf("No ngssc.json files found in %v\n", task.path)
		return nil
	}

	for _, ngsscFile := range files {
		err = task.insertWithNgssc(ngsscFile)
	}

	return nil
}

func (task InsertionTask) insertWithNgssc(ngsscFile string) error {
	ngsscConfig, err := config.New(ngsscFile)
	if err != nil {
		return err
	}

	pattern := filepath.Join(filepath.Dir(ngsscConfig.FilePath), ngsscConfig.FilePattern)
	files, err := doublestar.Glob(pattern)
	if err != nil {
		fmt.Printf("Unable to resolve pattern: %v\n", pattern)
		return err
	} else if files == nil {
		fmt.Printf("No files found with pattern: %v\n", ngsscConfig.FilePattern)
		return nil
	}

	logInsertionDetails(files, ngsscConfig)
	if !task.dryRun {
		for _, insertionFile := range files {
			target := targets.New(insertionFile, ngsscConfig)
			target.Insert()
		}
	}

	return nil
}

func logInsertionDetails(files []string, ngsscConfig config.NgsscConfig) {
	fmt.Printf(
		"Populated environment variables will be inserted into %v (Variant: %v, %v)\n",
		strings.Join(files[:], ", "),
		ngsscConfig.Variant,
		ngsscConfig.FilePath)
	for key, value := range ngsscConfig.EnvironmentVariables {
		if value != nil {
			fmt.Printf("  %v: %v\n", key, *value)
		} else {
			fmt.Printf("  %v: %v\n", key, "null")
		}
	}
}
