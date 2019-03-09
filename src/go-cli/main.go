package main

import (
	"log"
	"os"

	"github.com/urfave/cli"
)

func main() {
	ngssc := cli.NewApp()
	ngssc.Name = "ngssc"
	ngssc.Usage = "Angular Server Side Configuration"
	ngssc.Version = "0.0.1"

	ngssc.Commands = []cli.Command{
		{
			Name:     "insert",
			Category: "Server Side",
			Usage:    "Search and replace the placeholder with environment variables (Directory defaults to current working directory)",
			Flags: []cli.Flag{
				cli.StringSliceFlag{
					Name:  "env, e",
					Usage: "Add an environment variable named `ENV_NAME` to be resolved",
				},
				cli.StringFlag{
					Name:  "placeholder, p",
					Usage: "Set the placeholder to replace with the environment variables (Defaults to <!--CONFIG-->)'",
				},
				cli.BoolFlag{
					Name:  "head",
					Usage: "Insert environment variables into the head tag (after title tag, if available, otherwise before closing head tag)",
				},
				cli.BoolFlag{
					Name:  "dry",
					Usage: "Perform the insert without actually inserting the variables",
				},
			},
			Action: InsertCommand,
		},
	}

	err := ngssc.Run(os.Args)
	if err != nil {
		log.Fatal(err)
	}
}
