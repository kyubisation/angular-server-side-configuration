package ngsscjson

import (
	"crypto/sha256"
	"crypto/sha512"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"hash"
	"os"
	"path/filepath"
	"reflect"
	"strings"

	"github.com/bmatcuk/doublestar"
)

// NgsscConfig corresponds to the JSON structure of ngssc.json
type NgsscConfig struct {
	FilePath                      string
	Variant                       string
	EnvironmentVariables          []string
	PopulatedEnvironmentVariables map[string]*string
	FilePattern                   string
}

type ngsscJSON struct {
	Variant              string
	EnvironmentVariables []string
	FilePattern          *string
}

func FindNgsscJsonConfigs(pattern string) (ngsscConfigs []NgsscConfig, err error) {
	files, err := doublestar.Glob(pattern)
	if err != nil {
		return nil, fmt.Errorf("unable to resolve pattern: %v\n%v", pattern, err)
	} else if len(files) == 0 {
		return nil, fmt.Errorf("no ngssc.json files found with %v", pattern)
	}

	ngsscConfigs = make([]NgsscConfig, 0)
	for _, ngsscFile := range files {
		ngsscConfig, err := readNgsscJson(ngsscFile)
		if err != nil {
			return nil, err
		}

		ngsscConfigs = append(ngsscConfigs, ngsscConfig)
	}

	return ngsscConfigs, nil
}

func NgsscJsonConfigFromPath(ngsscFile string) (ngsscConfig NgsscConfig, err error) {
	if !strings.HasSuffix(ngsscFile, "ngssc.json") {
		ngsscFile = filepath.Join(ngsscFile, "ngssc.json")
	}
	return readNgsscJson(ngsscFile)
}

// readNgsscJson NgsscConfig instance from a file
func readNgsscJson(path string) (ngsscConfig NgsscConfig, err error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return ngsscConfig, fmt.Errorf("failed to read %v\n%v", path, err)
	}

	var ngssc *ngsscJSON
	err = json.Unmarshal(data, &ngssc)
	if err != nil {
		return ngsscConfig, fmt.Errorf("failed to parse %v\n%v", path, err)
	} else if ngssc == nil {
		return ngsscConfig, fmt.Errorf("invalid ngssc.json at %v (Must not be empty)", path)
	} else if ngssc.EnvironmentVariables == nil {
		return ngsscConfig, fmt.Errorf("invalid ngssc.json at %v (environmentVariables must be defined)", path)
	} else if ngssc.Variant != "process" && ngssc.Variant != "global" && ngssc.Variant != "NG_ENV" {
		return ngsscConfig, fmt.Errorf("invalid ngssc.json at %v (variant must either be process or NG_ENV)", path)
	}

	if ngssc.FilePattern == nil {
		filePatternDefault := "**/index.html"
		ngssc.FilePattern = &filePatternDefault
	}

	ngsscConfig = NgsscConfig{
		FilePath:                      path,
		Variant:                       ngssc.Variant,
		EnvironmentVariables:          ngssc.EnvironmentVariables,
		PopulatedEnvironmentVariables: populateEnvironmentVariables(ngssc.EnvironmentVariables),
		FilePattern:                   *ngssc.FilePattern,
	}

	return ngsscConfig, nil
}

func (base NgsscConfig) VariantAndVariablesMatch(other NgsscConfig) bool {
	return base.Variant == other.Variant && reflect.DeepEqual(base.PopulatedEnvironmentVariables, other.PopulatedEnvironmentVariables)
}

func (ngsscConfig NgsscConfig) BuildIifeScriptContent() string {
	jsonBytes, err := json.Marshal(ngsscConfig.PopulatedEnvironmentVariables)
	if err != nil {
		fmt.Print(err)
	}

	envMapJSON := string(jsonBytes)
	var iife string
	if ngsscConfig.Variant == "NG_ENV" {
		iife = fmt.Sprintf("self.NG_ENV=%v", envMapJSON)
	} else if ngsscConfig.Variant == "global" {
		iife = fmt.Sprintf("Object.assign(self,%v)", envMapJSON)
	} else {
		iife = fmt.Sprintf(`self.process={"env":%v}`, envMapJSON)
	}

	return fmt.Sprintf("(function(self){%v;})(window)", iife)
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

func (ngsscConfig NgsscConfig) GenerateIifeScriptHash(hashAlgorithmString string) string {
	hashAlgorithm, hashName := resolveHashAlgorithm(hashAlgorithmString)
	hashAlgorithm.Write([]byte(ngsscConfig.BuildIifeScriptContent()))
	hashSum := hashAlgorithm.Sum(nil)
	hashBase64 := base64.StdEncoding.EncodeToString(hashSum)
	hashResult := fmt.Sprintf(`'%v-%v'`, hashName, hashBase64)
	return hashResult
}

func resolveHashAlgorithm(hashAlgorithmString string) (hash.Hash, string) {
	hashAlgorithm := strings.ToLower(hashAlgorithmString)
	if hashAlgorithm == "" || hashAlgorithm == "sha512" {
		return sha512.New(), "sha512"
	} else if hashAlgorithm == "sha384" {
		return sha512.New384(), "sha384"
	} else if hashAlgorithm == "sha256" {
		return sha256.New(), "sha256"
	} else {
		fmt.Printf("Unknown hash algorithm %v. Using sha512 instead.", hashAlgorithmString)
		return sha512.New(), "sha512"
	}
}

func (ngsscConfig NgsscConfig) MergeVariables(variables map[string]*string) {
	for k := range ngsscConfig.PopulatedEnvironmentVariables {
		value, ok := variables[k]
		if ok {
			ngsscConfig.PopulatedEnvironmentVariables[k] = value
		} else {
			value, ok := os.LookupEnv(k)
			if ok {
				ngsscConfig.PopulatedEnvironmentVariables[k] = &value
			} else {
				ngsscConfig.PopulatedEnvironmentVariables[k] = nil
			}
		}
	}
}
