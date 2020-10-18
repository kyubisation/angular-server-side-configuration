package config

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
)

// NgsscConfig corresponds to the JSON structure of ngssc.json
type NgsscConfig struct {
	FilePath             string
	Variant              string
	EnvironmentVariables map[string]*string
	FilePattern          string
}

type ngsscJSON struct {
	Variant              string
	EnvironmentVariables []string
	FilePattern          *string
}

// New NgsscConfig instance from a file
func New(path string) (ngsscConfig NgsscConfig, err error) {
	data, err := ioutil.ReadFile(path)
	if err != nil {
		fmt.Printf("Failed to read %v\n", path)
		return ngsscConfig, err
	}

	var ngssc *ngsscJSON
	err = json.Unmarshal(data, &ngssc)
	if err != nil {
		fmt.Printf("Failed to parse %v\n", path)
		return ngsscConfig, err
	} else if ngssc == nil {
		return ngsscConfig, fmt.Errorf("Invalid ngssc.json at %v (Must not be empty)", path)
	} else if ngssc.EnvironmentVariables == nil {
		return ngsscConfig, fmt.Errorf("Invalid ngssc.json at %v (environmentVariables must be defined)", path)
	} else if ngssc.Variant != "process" && ngssc.Variant != "NG_ENV" {
		return ngsscConfig, fmt.Errorf("Invalid ngssc.json at %v (variant must either be process or NG_ENV)", path)
	}

	if ngssc.FilePattern == nil {
		filePatternDefault := "**/index.html"
		ngssc.FilePattern = &filePatternDefault
	}

	ngsscConfig = NgsscConfig{
		FilePath:             path,
		Variant:              ngssc.Variant,
		EnvironmentVariables: populateEnvironmentVariables(ngssc.EnvironmentVariables),
		FilePattern:          *ngssc.FilePattern,
	}

	return ngsscConfig, nil
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
