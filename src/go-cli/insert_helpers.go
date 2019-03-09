package main

import (
	"encoding/json"
	"errors"
	"os"
	"regexp"
	"strings"
)

// GenerateEnvMap generates a Map of Environment variable with its Values
// The search options searches for additional Environment Variable definitions in the .js files
func GenerateEnvMap(v []string, search bool) (map[string]string, error) {
	if v == nil || len(v) == 0 {
		return nil, errors.New("No Variables set")
	}

	notFoundEnvs := []string{}
	envMap := make(map[string]string)
	for _, env := range v {
		value := os.Getenv(env)
		if len(value) == 0 {
			notFoundEnvs = append(notFoundEnvs, env)
			// return nil, errors.New("Variable \"" + env + "\" not defined in environment. ")
		} else {
			envMap[env] = value
		}
	}

	if len(notFoundEnvs) > 0 {
		// TODO: Link the guide to provide help
		return envMap, errors.New("Variables: " + strings.Join(notFoundEnvs, ", ") + " not defined in environment.\nUse 'export variableName=\"<value>\"' or $Env: = \"<value>\" to set them before")
	}
	return envMap, nil
}

// prepareJavascriptString generate the Javascript Code with the variable from the envMap to place in the index.html
func PrepareJavascriptString(envMap map[string]string) string {
	jsonMap, _ := json.Marshal(envMap)
	return "<script>(function(self){self.process=" + string(jsonMap) + ";})(window)</script>"
}

func PrepareReplacementString(head bool, customPlaceholder string) string {
	if len(customPlaceholder) > 0 {
		return regexp.QuoteMeta(customPlaceholder)
	}
	if head {
		return `</head>`
	}
	return `<!--\s*CONFIG\s*-->`

}
