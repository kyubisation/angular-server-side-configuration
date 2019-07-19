package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/bmatcuk/doublestar"
	"github.com/urfave/cli"
)

// CliVersion will be injected during build
var CliVersion string

func main() {
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
			Action: insertCommand,
		},
	}

	err := ngssc.Run(os.Args)
	if err != nil {
		log.Fatal(err)
	}
}

// NgsscJSON is the JSON structure of ngssc.json
type NgsscJSON struct {
	Variant 							string
	EnvironmentVariables 	[]string
	FilePattern  					*string
}

// InsertCommand is the ngssc CLI command to insert environment variables
func insertCommand(c *cli.Context) error {
	// Init Flags
	dryRunFlag := c.Bool("dry")
	recursive := c.Bool("recursive")

	// Dry Run Flag
	if dryRunFlag == true {
		fmt.Println("DRY RUN! Files will not be changed!")
	}

	// Change working directory if an argument has been passed
	if c.NArg() > 0 {
		workingDirectory := c.Args()[0]
		fmt.Printf("Changing working directory to %v\n", workingDirectory)
		err := os.Chdir(workingDirectory)
		if err != nil {
			return cli.NewExitError(err, 1)
		}
	}

	if recursive {
		err := configureWithNgsscRecursively(dryRunFlag)
		if err != nil {
			return cli.NewExitError(err, 1)
		}
	} else {
		ngsscPath, err := filepath.Abs("./ngssc.json")
		if err != nil {
			return cli.NewExitError(err, 1)
		}
		err = configureWithNgssc(ngsscPath, dryRunFlag)
		if err != nil {
			return cli.NewExitError(err, 1)
		}
	}

	return nil
}

func configureWithNgsscRecursively(dryRun bool) error {
	files, err := doublestar.Glob("**/ngssc.json")
	if err != nil {
		return err
	} else if len(files) == 0 {
		cwd, err := os.Getwd()
		if err != nil {
			return err
		}
		fmt.Printf("No ngssc.json files found in %v\n", cwd)
		return nil
	}
	
	for _, ngsscFile := range files {
		err = configureWithNgssc(ngsscFile, dryRun)
		return err
	}

	return nil
}

func configureWithNgssc(ngsscPath string, dryRun bool) error {
	ngssc, err := readNgsscJSON(ngsscPath)
	if err != nil {
		return err
	}

	iifeScript := generateIifeScript(*ngssc, ngsscPath)
	files, err := doublestar.Glob(*ngssc.FilePattern)
	if err != nil {
		return err
	} else if files == nil {
		fmt.Printf("No files found with pattern %v\n", ngssc.FilePattern)
		return nil
	}

	fmt.Printf("Configuration will be inserted into %v\n", strings.Join(files[:], ", "))
	if dryRun {
		fmt.Println("Dry run. Nothing will be inserted.")
	} else {
		for _, htmlFile := range files {
			insertIifeIntoHTML(htmlFile, iifeScript)
		}
	}

	return nil
}

func readNgsscJSON(path string) (ngssc *NgsscJSON, err error) {
	data, err := ioutil.ReadFile(path)
	if err != nil {
		fmt.Printf("Failed to read %v\n", path)
		return nil, err
	}

	err = json.Unmarshal(data, &ngssc)
	if err != nil {
		fmt.Printf("Failed to parse %v\n", path)
		return nil, err
	} else if ngssc == nil || ngssc.EnvironmentVariables == nil || (ngssc.Variant != "process" && ngssc.Variant != "NG_ENV") {
		return nil, fmt.Errorf("Invalid ngssc.json at %v", path)
	}

	if ngssc.FilePattern == nil {
		filePatternDefault := "**/index.html"
		ngssc.FilePattern = &filePatternDefault
	}

	return ngssc, nil
}

func generateIifeScript(ngssc NgsscJSON, source string) string {
	envMap := populateEnvironmentVariables(ngssc.EnvironmentVariables)
	logPopulatedEnvironmentVariables(source, ngssc.Variant, envMap)
	jsonBytes, err := json.Marshal(envMap)
	if err != nil {
		fmt.Print(err)
	}

	envMapJSON := string(jsonBytes)
	var iife string
	if ngssc.Variant == "process" {
		iife = fmt.Sprintf(`self.process={"env":%v}`, envMapJSON)
	} else {
		iife = fmt.Sprintf("self.NG_ENV=%v", envMapJSON)
	}

	return fmt.Sprintf("<script>(function(self){%v;})(window)</script>", iife)
}

func populateEnvironmentVariables(environmentVariables []string) map[string]*string {
	envMap := make(map[string]*string)
	for _, env := range environmentVariables {
		value, exists := os.LookupEnv(env)
		if exists {
			envMap[env] = &value
		} else {
			envMap[env] = nil
		}
	}

	return envMap
}

func logPopulatedEnvironmentVariables(source string, variant string, envMap map[string]*string) {
	fmt.Printf("Populated environment variables (Variant: %v, %v)\n", variant, source)
	for key, value := range envMap {
		if value != nil {
			fmt.Printf("  %v: %v\n", key, *value)
		} else {
			fmt.Printf("  %v: %v\n", key, "null")
		}
	}
}

func insertIifeIntoHTML(htmlFile string, iifeScript string) error {
	htmlBytes, err := ioutil.ReadFile(htmlFile)
	if err != nil {
		fmt.Printf("Failed to read %v\n", htmlFile)
		return err
	}

	var newHTML string
	html := string(htmlBytes)
	var re = regexp.MustCompile("<!--\\s*CONFIG\\s*-->")
	if re.Match(htmlBytes) {
		newHTML = re.ReplaceAllString(html, iifeScript)
	} else if strings.Contains(html, "</title>") {
		newHTML = strings.Replace(html, "</title>", "</title>"+iifeScript, 1)
	} else {
		newHTML = strings.Replace(html, "</head>", iifeScript+"</head>", 1)
	}

	err = ioutil.WriteFile(htmlFile, []byte(newHTML), 0644)
	if err != nil {
		fmt.Printf("Failed to update %v\n", htmlFile)
		return err
	}

	return nil
}
