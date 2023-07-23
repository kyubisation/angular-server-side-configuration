package substitute

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
)

type SubstitutionTarget struct {
	templateFile string
	targetFile   string
	envMap       map[string]*string
	dryRun       bool
}

func createSubstitutionTarget(templateFile string, outDir string, envMap map[string]*string, dryRun bool) SubstitutionTarget {
	targetFile := templateFile[:len(templateFile)-len(".template")]
	if outDir != "" {
		targetFile = filepath.Join(outDir, filepath.Base(targetFile))
	}
	substituteTarget := &SubstitutionTarget{
		templateFile,
		targetFile,
		envMap,
		dryRun,
	}
	return *substituteTarget
}

func (target SubstitutionTarget) Substitute() error {
	content, err := os.ReadFile(target.templateFile)
	if err != nil {
		return fmt.Errorf("failed to read %v\n%v", target.templateFile, err)
	}

	variableRegex := regexp.MustCompile(`\${[a-zA-Z0-9_]+}`)
	matches := variableRegex.FindAllString(string(content), -1)
	matches = removeDuplicates(matches)
	substitutionMap := createSubstitutionMap(matches, target.envMap)
	logSubstitutionDetails(target.templateFile, target.targetFile, matches, substitutionMap)
	if target.dryRun {
		return nil
	}

	stringContent := string(content)
	for key, value := range substitutionMap {
		stringContent = strings.ReplaceAll(stringContent, key, value)
	}
	os.WriteFile(target.targetFile, []byte(stringContent), 0644)
	return nil
}

func removeDuplicates(strSlice []string) []string {
	allKeys := make(map[string]bool)
	list := []string{}
	for _, item := range strSlice {
		if _, value := allKeys[item]; !value {
			allKeys[item] = true
			list = append(list, item)
		}
	}
	sort.Strings(list)
	return list
}

func createSubstitutionMap(variables []string, envMap map[string]*string) map[string]string {
	substitutionMap := make(map[string]string)
	for _, variable := range variables {
		key := variable[2 : len(variable)-1]
		value, ok := envMap[key]
		if ok {
			substitutionMap[variable] = *value
		}
	}
	return substitutionMap
}

func logSubstitutionDetails(templateFile string, targetFile string, matches []string, substitutionMap map[string]string) {
	fmt.Println("Substituting variables:")
	fmt.Printf("  Source:        %v\n", templateFile)
	fmt.Printf("  Target:        %v\n", targetFile)
	fmt.Printf("  Variables:     %v\n", strings.Join(matches, ", "))
	if len(substitutionMap) == 0 {
		fmt.Println("  Substitutions: No substitutable variables")
		return
	}

	fmt.Println("  Substitutions:")
	for key, value := range substitutionMap {
		fmt.Printf("    %v: %v\n", key, value)
	}
}
