package main

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/urfave/cli"
)

func InsertCommand(c *cli.Context) error {
	root := "./"

	if c.NArg() > 0 {
		root = c.Args()[0]
	}

	err := filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		fmt.Println(path)
		if !info.IsDir() {
			// files = append(files, path)
		}
		return nil
	})

	fmt.Println("Error:", err)

	fmt.Println("Hola")
	return nil
}
