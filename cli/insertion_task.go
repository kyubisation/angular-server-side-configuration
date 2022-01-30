package main

import (
	"fmt"
	"path/filepath"

	"github.com/bmatcuk/doublestar"
)

// InsertionTask represents an insertion task
type InsertionTask struct {
	path   string
	dryRun bool
}

// Single will perform the insertion for a single ngssc.json
func (task InsertionTask) Single() error {
	ngsscConfig, err := NgsscJsonConfigFromPath(task.path)
	if err != nil {
		return err
	}
	return task.insertWithNgssc(ngsscConfig)
}

// Recursive will perform the insertion for all ngssc.json below given path
func (task InsertionTask) Recursive() error {
	pattern := filepath.Join(task.path, "**", "ngssc.json")
	configs, err := FindNgsscJsonConfigs(pattern)
	if err != nil {
		return err
	}

	for _, ngsscConfig := range configs {
		err = task.insertWithNgssc(ngsscConfig)
		if err != nil {
			return err
		}
	}

	return nil
}

func (task InsertionTask) insertWithNgssc(ngsscConfig NgsscConfig) error {
	pattern := filepath.Join(filepath.Dir(ngsscConfig.FilePath), ngsscConfig.FilePattern)
	files, err := doublestar.Glob(pattern)
	if err != nil {
		return fmt.Errorf("unable to resolve pattern: %v\n%v", pattern, err)
	} else if files == nil {
		return fmt.Errorf("no files found with pattern: %v", ngsscConfig.FilePattern)
	}

	logInsertionDetails(files, ngsscConfig)
	if !task.dryRun {
		for _, insertionFile := range files {
			target := InsertionTarget{
				filePath:    insertionFile,
				ngsscConfig: ngsscConfig,
			}
			target.Insert()
		}
	}

	return nil
}

func logInsertionDetails(files []string, ngsscConfig NgsscConfig) {
	fmt.Println("Inserting variables:")
	fmt.Println("  Files:")
	for _, file := range files {
		fmt.Printf("    %v\n", file)
	}
	fmt.Printf("  Variant: %v\n", ngsscConfig.Variant)
	fmt.Printf("  Variables:\n")
	for key, value := range ngsscConfig.EnvironmentVariables {
		if value != nil {
			fmt.Printf("    %v: %v\n", key, *value)
		} else {
			fmt.Printf("    %v: %v\n", key, "null")
		}
	}
}
