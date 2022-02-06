package main

import (
	"fmt"
	"log"
	"os"
	"strings"

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

	ngssc.Before = separator
	ngssc.After = separator
	ngssc.Commands = []cli.Command{
		{
			Before: title,
			Name:   "insert",
			Usage: "Insert environment variables. Looks for an ngssc.json file inside the current or " +
				"given directory. Directory defaults to current working directory.",
			UsageText: "[WORKING_DIRECTORY]",
			Flags: []cli.Flag{
				cli.BoolFlag{
					Name:  "recursive, r",
					Usage: "Recursively searches for ngssc.json files and applies the contained configuration.",
				},
				cli.BoolFlag{
					Name: "nginx",
					Usage: "Applies default configuration for ngssc insert to work with nginx. " +
						"Sets working directory to /usr/share/nginx/html/ and recursive to true.",
				},
				cli.BoolFlag{
					Name:  "dry",
					Usage: "Perform the insert without actually inserting the variables.",
				},
			},
			Action: InsertCommand,
		},
		{
			Before: title,
			Name:   "substitute",
			Usage: `Substitutes the variable ${NGSSC_CSP_HASH} in files ending with ".template"	and copies the file while removing the ".template" extension.

							${NGSSC_CSP_HASH} represents the CSP hash value of the IIFE generated/inserted by the
							insert command, wrapped by single quotes.

							By default looks for "*.template" files in the current working directory. Specify another
							directory to search for "*.template" files via argument.
							(e.g. ngssc substitute /path/to/template/files)

							When applying the variable(s), the file is copied to the same directory without the
							".template" extension with the substituion applied.
							(e.g. ngssc substitute: /a/my.conf.template => /a/my.conf)

							Use the "--out" flag to define a different output directory.
							(e.g. ngssc substitute --out=/b: /a/my.conf.template => /b/my.conf)

							Optionally supports substituting environment variables with the --include-env flag.
							The format ${EXAMPLE} must be used ($EXAMPLE will not work). Additionally only
							alphanumeric characters and _ are allowed as variable names (e.g. ${EXAMPLE_KEY}).
							(e.g. ngssc substitute --include-env)
`,
			UsageText: "[TEMPLATE_DIRECTORY]",
			Flags: []cli.Flag{
				cli.StringFlag{
					Name: "ngssc-path",
					Usage: "Path to the ngssc.json file or containing directory to be used for the " +
						"generated IIFE. Supports glob. " +
						"Defaults to [current working directory]/**/ngssc.json. " +
						"Throws if multiple ngssc.json with different variant or variables are found.",
				},
				cli.StringFlag{
					Name: "hash-algorithm, a",
					Usage: "The hash algorithm to be used. Supports sha256, sha384 and sha512. " +
						"Defaults to sha512.",
				},
				cli.StringFlag{
					Name:  "out, o",
					Usage: "The directory into which the updated files should be copied.",
				},
				cli.BoolFlag{
					Name:  "include-env, e",
					Usage: "Substitute all variables in the format of ${VARIABLE_NAME}.",
				},
				cli.BoolFlag{
					Name: "nginx",
					Usage: "Applies default configuration for ngssc substitute to work with nginx. " +
						"Sets ngssc-path to /usr/share/nginx/html/, template directory to " +
						"/etc/nginx/ngssc-templates/ and out directory to /etc/nginx/conf.d/.",
				},
				cli.BoolFlag{
					Name:  "dry",
					Usage: "Perform the insert without actually inserting the variables.",
				},
			},
			Action: SubstituteCommand,
		},
	}

	return ngssc.Run(args)
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
