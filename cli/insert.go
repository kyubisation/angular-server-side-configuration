package main

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/urfave/cli"
)

// InsertCommand is the ngssc CLI command to insert environment variables
func InsertCommand(c *cli.Context) error {
	// Init Flags
	nginxFlag := c.Bool("nginx")
	noncePlaceholder := c.String("nonce")
	dryRunFlag := c.Bool("dry")
	recursive := c.Bool("recursive")
	if !recursive && nginxFlag {
		recursive = true
	}

	// Dry Run Flag
	if dryRunFlag {
		fmt.Println("DRY RUN! Files will not be changed!")
	}

	// Resolve target directory
	var workingDirectory string
	if c.NArg() > 0 {
		var err error
		workingDirectory, err = filepath.Abs(c.Args()[0])
		if err != nil {
			return fmt.Errorf("unable to resolve the absolute path of %v\n%v", c.Args()[0], err)
		}
	} else if nginxFlag {
		workingDirectory = "/usr/share/nginx/html"
	} else {
		var err error
		workingDirectory, err = os.Getwd()
		if err != nil {
			return fmt.Errorf(
				"unable to resolve the current working directory. "+
					"Please specify the directory as a CLI parameter. (e.g. ngssc insert /path/to/directory)\n%v",
				err)
		}
	}

	fmt.Printf("Working directory:\n  %v\n", workingDirectory)
	if _, err := os.Stat(workingDirectory); os.IsNotExist(err) {
		return fmt.Errorf("working directory does not exist\n%v", err)
	}

	task := InsertionTask{
		path:             workingDirectory,
		noncePlaceholder: noncePlaceholder,
		dryRun:           dryRunFlag,
	}
	if recursive {
		return task.Recursive()
	} else {
		return task.Single()
	}
}
