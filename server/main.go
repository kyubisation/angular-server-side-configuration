package main

import (
	"fmt"
	"log"
	"ngssc/server/compress"
	"ngssc/server/serve"
	"os"
	"strings"

	"github.com/urfave/cli/v2"
)

// CliVersion will be injected during build
var CliVersion string

func main() {
	err := run(os.Args)
	if err != nil {
		log.Fatal(err)
	}
}

func run(args []string) error {
	app := &cli.App{
		Name:    "Angular Server",
		Usage:   "A simple static file server for Angular applications",
		Version: CliVersion,
		Before:  separator,
		After:   separator,
		Commands: []*cli.Command{
			{
				Before: title,
				Name:   "compress",
				Flags:  compress.Flags,
				Action: compress.Action,
			},
			{
				Before: title,
				Name:   "serve",
				Flags:  serve.Flags,
				Action: serve.Action,
			},
		},
	}

	return app.Run(args)
}

func separator(c *cli.Context) error {
	fmt.Println()
	return nil
}

func title(c *cli.Context) error {
	title := fmt.Sprintf("%v(%v) %v", c.App.Name, CliVersion, c.Command.Name)
	fmt.Printf("%v\n%v\n\n", title, strings.Repeat("=", len(title)))
	return nil
}
