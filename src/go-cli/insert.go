package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/urfave/cli"
)

func InsertCommand(c *cli.Context) error {
	// Init Flags
	dryRunFlag := c.Bool("dry")
	placeholderFlag := c.String("placeholder")
	headFlag := c.Bool("head")

	// Validate Flags
	if len(placeholderFlag) != 0 && headFlag {
		return cli.NewExitError("--placeholder amd -head cannot be used at the same time!", 1)
	}

	// Dry Run Flag

	if dryRunFlag == true {
		fmt.Println("RUNNING IN DRY MODE! NO FILES WILL BE CHANGED!")
	}

	// Use Root if not Path is set for Searching Files
	root := "./"
	if c.NArg() > 0 {
		root = c.Args()[0]
	}

	// Generate Environment Variables
	envMap, err := GenerateEnvMap(c.StringSlice("env"), false)
	if err != nil {
		return cli.NewExitError(err, 1)
	}
	fmt.Println("Populated environment variables:")
	for key, value := range envMap {
		fmt.Println("  " + key + ": " + value)
	}

	// Go through the files
	fmt.Println("Searching in: ", root)

	err = filepath.Walk(root, func(path string, file os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// If it is a Directory do nothing
		if !!file.IsDir() {
			return nil //
		}

		// Matching Logic
		matched, err := filepath.Match("*.html", file.Name())

		if matched {
			fmt.Println("Matched: " + path)
			if dryRunFlag != true {

				read, err := ioutil.ReadFile(path)
				if err != nil {
					panic(err)
				}

				re := regexp.MustCompile(PrepareReplacementString(headFlag, placeholderFlag))

				// Search for occurrences of the placeholder
				found := re.FindString(string(read))
				if found != "" {

					insertString := PrepareJavascriptString(envMap)
					if headFlag {
						insertString += "\n" + found
					}

					// Replace the first occurrence
					newContents := strings.Replace(string(read), found, insertString, 1)

					// Write back to File
					err = ioutil.WriteFile(path, []byte(newContents), 0644)
					if err != nil {
						panic(err)
					}
					fmt.Println(" -> Injected the variables.")
				} else {
					fmt.Println(" -> Nothing found to replace.")
				}
			}
		}
		return nil
	})

	if err != nil {
		log.Fatal(err)
		return nil
	}
	return nil
}
