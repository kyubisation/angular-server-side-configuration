package commands

import (
	"fmt"
	"ngssc/tasks"
	"os"
	"path/filepath"

	"github.com/urfave/cli"
)

// InsertCommand is the ngssc CLI command to insert environment variables
func InsertCommand(c *cli.Context) error {
	// Init Flags
	dryRunFlag := c.Bool("dry")
	recursive := c.Bool("recursive")

	// Dry Run Flag
	if dryRunFlag == true {
		fmt.Println("DRY RUN! Files will not be changed!")
	}

	// Resolve target directory
	var workingDirectory string
	if c.NArg() > 0 {
		var err error
		workingDirectory, err = filepath.Abs(c.Args()[0])
		if err != nil {
			fmt.Printf("Unable to resolve the absolute path of %v\n", c.Args()[0])
			return cli.NewExitError(err, 1)
		}
	} else {
		var err error
		workingDirectory, err = os.Getwd()
		if err != nil {
			fmt.Println("Unable to resolve the current working directory. " +
				"Please specify the directory as a CLI parameter. (e.g. ngssc insert /path/to/directory)")
			return cli.NewExitError(err, 1)
		}
	}

	fmt.Printf("Working directory: %v\n", workingDirectory)
	if _, err := os.Stat(workingDirectory); os.IsNotExist(err) {
		fmt.Println("Working directory does not exist")
		return cli.NewExitError(err, 1)
	}

	task := tasks.New(workingDirectory, dryRunFlag)
	if recursive {
		err := task.Recursive()
		if err != nil {
			return cli.NewExitError(err, 1)
		}
	} else {
		err := task.Single()
		if err != nil {
			return cli.NewExitError(err, 1)
		}
	}

	return nil
}
