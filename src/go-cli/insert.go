package main

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/urfave/cli"
)

func InsertCommand(c *cli.Context) error {
	if c.Bool("dry") == true {
		fmt.Println("RUNNING IN DRY MODE")
	}


	root := "./"

	if c.NArg() > 0 {
		root = c.Args()[0]
	}

	fmt.Println("Searching in: ", root)
	
	err := filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
	if err != nil {
		return err
	}
		if !info.IsDir() {
			// fmt.Println(path)
			for _, env := range c.StringSlice("env") {
				fmt.Println("Name: ", env, " Variable: ", os.Getenv(env))
			}

			// files = append(files, path)
		}
		return nil
	})

	if err != nil {
		fmt.Println("Error:", err)	
		return nil
	}

	fmt.Println("Hola")
	return nil
}
