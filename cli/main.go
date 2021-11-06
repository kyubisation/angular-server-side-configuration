package main

import (
	"log"
	"ngssc/cli/commands"
	"os"

	"github.com/urfave/cli"
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
	ngssc := cli.NewApp()
	ngssc.Name = "ngssc"
	ngssc.Usage = "Angular Server Side Configuration"
	ngssc.Version = CliVersion

	ngssc.Commands = []cli.Command{
		{
			Name:     "insert",
			Category: "Server Side",
			Usage: "Insert environment variables. Looks for an ngssc.json file inside the current or " +
				"given directory. Alternatively use the --config-in-html flag. " +
				"Directory defaults to current working directory",
			Flags: []cli.Flag{
				cli.BoolFlag{
					Name:  "recursive, r",
					Usage: "Recursively searches for ngssc.json files and applies the contained configuration",
				},
				cli.BoolFlag{
					Name:  "dry",
					Usage: "Perform the insert without actually inserting the variables",
				},
			},
			Action: commands.InsertCommand,
		},
	}

	return ngssc.Run(args)
}
