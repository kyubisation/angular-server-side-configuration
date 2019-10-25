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

	if recursive {
		err := configureWithNgsscRecursively(workingDirectory, dryRunFlag)
		if err != nil {
			return cli.NewExitError(err, 1)
		}
	} else {
		ngsscFile := filepath.Join(workingDirectory, "ngssc.json")
		err := configureWithNgssc(ngsscFile, dryRunFlag)
		if err != nil {
			return cli.NewExitError(err, 1)
		}
	}

	return nil
}

func configureWithNgsscRecursively(directory string, dryRun bool) error {
	pattern := filepath.Join(directory, "**", "ngssc.json")
	files, err := doublestar.Glob(pattern)
	if err != nil {
		fmt.Printf("Unable to resolve pattern: %v\n", pattern)
		return err
	} else if len(files) == 0 {
		fmt.Printf("No ngssc.json files found in %v\n", directory)
		return nil
	}
	
	for _, ngsscFile := range files {
		err = configureWithNgssc(ngsscFile, dryRun)
	}

	return nil
}

func configureWithNgssc(ngsscFile string, dryRun bool) error {
	ngssc, err := readNgsscJSON(ngsscFile)
	if err != nil {
		return err
	}

	directory := filepath.Dir(ngsscFile)
	iifeScript := generateIifeScript(*ngssc, ngsscFile)
	pattern := filepath.Join(directory, *ngssc.FilePattern)
	files, err := doublestar.Glob(pattern)
	if err != nil {
		fmt.Printf("Unable to resolve pattern: %v\n", pattern)
		return err
	} else if files == nil {
		fmt.Printf("No files found with pattern: %v\n", *ngssc.FilePattern)
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
	} else if ngssc == nil {
		return nil, fmt.Errorf("Invalid ngssc.json at %v (Must not be empty)", path)
	} else if ngssc.EnvironmentVariables == nil {
		return nil, fmt.Errorf("Invalid ngssc.json at %v (environmentVariables must be defined)", path)
	} else if (ngssc.Variant != "process" && ngssc.Variant != "NG_ENV") {
		return nil, fmt.Errorf("Invalid ngssc.json at %v (variant must either be process or NG_ENV)", path)
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
