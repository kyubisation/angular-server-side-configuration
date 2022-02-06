package main

import (
	"crypto/sha256"
	"crypto/sha512"
	"encoding/base64"
	"fmt"
	"hash"
	"os"
	"path/filepath"
	"strings"

	"github.com/bmatcuk/doublestar"
)

type SubstitutionTask struct {
	workingDirectory  string
	templateDirectory string
	ngsscPath         string
	hashAlgorithm     string
	out               string
	includeEnv        bool
	dryRun            bool
}

func (task SubstitutionTask) Substitute() error {
	if _, err := os.Stat(task.templateDirectory); os.IsNotExist(err) {
		return fmt.Errorf("template directory does not exist:%v\n%v", task.templateDirectory, err)
	}

	fmt.Printf("Template directory:\n  %v\n", task.templateDirectory)

	ngsscConfig, err := resolveNgsscConfig(task.ngsscPath, task.workingDirectory)
	if err != nil {
		return err
	}
	fmt.Printf("Resolved ngssc.json config:\n  %v\n", ngsscConfig.FilePath)

	scriptHash := generateIifeScriptHash(ngsscConfig, task.hashAlgorithm)
	substitutionFiles, err := resolveSubstitutionFiles(task.templateDirectory)
	if err != nil {
		return err
	}

	variableMap := createVariablesMap(scriptHash, task.includeEnv)
	outDir := task.out
	if outDir != "" && !filepath.IsAbs(outDir) {
		outDir = filepath.Join(task.workingDirectory, outDir)
	}

	if outDir != "" && !task.dryRun {
		err := os.MkdirAll(outDir, os.ModePerm)
		if err != nil {
			return fmt.Errorf("failed to create directory %v\n%v", outDir, err)
		}
	}

	return substituteVariables(substitutionFiles, outDir, variableMap, task.dryRun)
}

func generateIifeScriptHash(ngsscConfig NgsscConfig, hashAlgorithmString string) string {
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

func resolveNgsscConfig(ngsscPath string, workingDirectory string) (ngsscConfig NgsscConfig, err error) {
	if ngsscPath == "" {
		ngsscPath = filepath.Join(workingDirectory, "**", "ngssc.json")
	} else if filepath.Base(ngsscPath) != "ngssc.json" {
		ngsscPath = filepath.Join(ngsscPath, "ngssc.json")
	}

	configs, err := FindNgsscJsonConfigs(ngsscPath)
	if err != nil {
		return NgsscConfig{}, err
	} else if len(configs) == 1 {
		return configs[0], nil
	}

	pivot := configs[0]
	for _, ngsscConfig := range configs {
		if !pivot.VariantAndVariablesMatch(ngsscConfig) {
			return NgsscConfig{},
				fmt.Errorf(
					"all recursively found ngssc.json must have same variant and environment variables configuration. (See %v and %v)",
					pivot.FilePath,
					ngsscConfig.FilePath)
		}
	}

	return pivot, nil
}

func resolveSubstitutionFiles(templateDirectory string) (resolvedFiles []string, err error) {
	pattern := filepath.Join(templateDirectory, "*.template")
	globFiles, err := doublestar.Glob(pattern)
	if err != nil {
		return nil, fmt.Errorf("unable to resolve pattern: %v\n%v", pattern, err)
	} else if len(globFiles) == 0 {
		return nil, fmt.Errorf("no files found with %v", pattern)
	}

	return globFiles, nil
}

func createVariablesMap(scriptHash string, includeEnv bool) map[string]*string {
	envMap := make(map[string]*string)
	if includeEnv {
		for _, e := range os.Environ() {
			pair := strings.SplitN(e, "=", 2)
			envMap[pair[0]] = &pair[1]
		}
	}

	envMap["NGSSC_CSP_HASH"] = &scriptHash

	return envMap
}

func substituteVariables(substitutionFiles []string, outDir string, envMap map[string]*string, dryRun bool) error {
	for _, templateFile := range substitutionFiles {
		substituteTarget := createSubstitutionTarget(templateFile, outDir, envMap, dryRun)
		err := substituteTarget.Substitute()
		if err != nil {
			return err
		}
	}

	return nil
}
