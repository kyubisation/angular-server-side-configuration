package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"regexp"

	"github.com/urfave/cli"
)

func InsertCommand(c *cli.Context) error {
	// Dry Run Flag
	dryRun := c.Bool("dry")

	if dryRun == true {
		fmt.Println("RUNNING IN DRY MODE")
	}

	// Root for Searching Files
	root := "./"
	if c.NArg() > 0 {
		root = c.Args()[0]
	}

	//  Environment Variables
	if c.StringSlice("env") == nil {
		return cli.NewExitError("No Variables set", 1)
	}
	if len(c.StringSlice("env")) == 0 {
		return cli.NewExitError("No Variables set", 1)
	}
	envMap := make(map[string]string)
	for _, env := range c.StringSlice("env") {

		value := os.Getenv(env)
		if len(value) == 0 {
			return cli.NewExitError("Variable \""+env+"\" not defined in environment. Use 'export "+env+"=\"content\"' or $Env:"+env+" = \"content\"", 1)
		}
		envMap[env] = value
		fmt.Println("Populated environment variables")
		fmt.Println("  " + env + ": " + value)
	}

	// Generate Javascript Code to place in file
	jsonMap, _ := json.Marshal(envMap)
	javascript := "<script>(function(self){self.process=" + string(jsonMap) + ";})(window)</script>"
	// fmt.Println(string(jsonMap))

	// Go through the files
	fmt.Println("Searching in: ", root)

	err := filepath.Walk(root, func(path string, file os.FileInfo, err error) error {
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
			if dryRun != true {

				read, err := ioutil.ReadFile(path)
				if err != nil {
					panic(err)
				}

				//fmt.Println(string(read))

				var re = regexp.MustCompile(`<!--\s*CONFIG\s*-->`)
				// Use Regex if no other String is specified
				newContents := re.ReplaceAllString(string(read), javascript)
				// newContents := strings.Replace(string(read), "<!--CONFIG-->", "new", -1)

				err = ioutil.WriteFile(path, []byte(newContents), 0)
				if err != nil {
					panic(err)
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
