package main

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/urfave/cli"
)

// SubstituteCommand is the ngssc CLI command to insert environment variables
func SubstituteCommand(c *cli.Context) error {
	// Init Flags
	dryRun := c.Bool("dry")
	ngsscPath := c.String("ngssc-path")
	hashAlgorithm := c.String("hash-algorithm")
	out := c.String("out")
	includeEnv := c.Bool("include-env")

	// Dry Run Flag
	if dryRun {
		fmt.Println("DRY RUN! Files will not be changed!")
	}

	workingDirectory, err := os.Getwd()
	if err != nil {
		return fmt.Errorf("unable to resolve the current working directory.\n%v", err)
	}

	templateDirectory := workingDirectory
	if c.NArg() > 0 {
		templateDirectory, err = filepath.Abs(c.Args()[0])
		if err != nil {
			return fmt.Errorf("unable to resolve the absolute path of %v\n%v", c.Args()[0], err)
		}
	}

	task := &SubstitutionTask{
		workingDirectory,
		templateDirectory,
		ngsscPath,
		hashAlgorithm,
		out,
		includeEnv,
		dryRun,
	}
	return task.Substitute()
}
