package targets

import (
	"crypto/sha1"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"ngssc/cli/config"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

// InsertionTarget represents an html file target
type InsertionTarget struct {
	filePath    string
	ngsscConfig config.NgsscConfig
}

// New InsertionTarget instance from an html file and an ngssc configuration
func New(filePath string, ngsscConfig config.NgsscConfig) InsertionTarget {
	target := InsertionTarget{filePath, ngsscConfig}
	return target
}

// Insert the environment variables into the targeted file
func (target InsertionTarget) Insert() error {
	htmlBytes, err := ioutil.ReadFile(target.filePath)
	if err != nil {
		fmt.Printf("Failed to read %v\n", target.filePath)
		return err
	}

	html := string(htmlBytes)
	iifeScript := generateIifeScript(target.ngsscConfig)
	var newHTML string
	ngsscRegex := regexp.MustCompile("<!--ngssc-->[\\w\\W]*<!--/ngssc-->")
	configRegex := regexp.MustCompile("<!--\\s*CONFIG\\s*-->")
	if ngsscRegex.Match(htmlBytes) {
		newHTML = ngsscRegex.ReplaceAllString(html, iifeScript)
	} else if configRegex.Match(htmlBytes) {
		newHTML = configRegex.ReplaceAllString(html, iifeScript)
	} else if strings.Contains(html, "</title>") {
		newHTML = strings.Replace(html, "</title>", "</title>"+iifeScript, 1)
	} else {
		newHTML = strings.Replace(html, "</head>", iifeScript+"</head>", 1)
	}

	newHTMLBytes := []byte(newHTML)
	err = ioutil.WriteFile(target.filePath, newHTMLBytes, 0644)
	if err != nil {
		fmt.Printf("Failed to update %v\n", target.filePath)
		return err
	}

	replaceIndexHashInNgsw(target, htmlBytes, newHTMLBytes)

	return nil
}

func generateIifeScript(ngsscConfig config.NgsscConfig) string {
	jsonBytes, err := json.Marshal(ngsscConfig.EnvironmentVariables)
	if err != nil {
		fmt.Print(err)
	}

	envMapJSON := string(jsonBytes)
	var iife string
	if ngsscConfig.Variant == "process" {
		iife = fmt.Sprintf(`self.process={"env":%v}`, envMapJSON)
	} else {
		iife = fmt.Sprintf("self.NG_ENV=%v", envMapJSON)
	}

	return fmt.Sprintf("<!--ngssc--><script>(function(self){%v;})(window)</script><!--/ngssc-->", iife)
}

func replaceIndexHashInNgsw(target InsertionTarget, originalHash []byte, replacedHash []byte) {
	filePath := filepath.Join(filepath.Dir(target.filePath), "ngsw.json")
	info, err := os.Stat(filePath)
	if os.IsNotExist(err) || info.IsDir() {
		return
	}

	ngswBytes, err := ioutil.ReadFile(filePath)
	if err != nil {
		fmt.Printf("Detected ngsw.json, but failed to read it at %v\n", filePath)
		return
	}

	ngswContent := string(ngswBytes)
	wrappedHexHash := createQuotedHash(originalHash)
	if !strings.Contains(ngswContent, wrappedHexHash) {
		fmt.Printf("Detected ngsw.json, but existing hash (%v) of the index file could not be found\n", wrappedHexHash)
		return
	}

	replacedWrappedHexHash := createQuotedHash(replacedHash)
	replacedNgswContent := strings.Replace(ngswContent, wrappedHexHash, replacedWrappedHexHash, 1)
	err = ioutil.WriteFile(filePath, []byte(replacedNgswContent), info.Mode())
	if err != nil {
		fmt.Printf("Detected ngsw.json, but failed to update it at %v\n", filePath)
		return
	}

	fmt.Printf("Detected ngsw.json and updated index hash at %v\n", filePath)
}

func createQuotedHash(bytes []byte) string {
	hash := sha1.New()
	hash.Write(bytes)
	hashSum := hash.Sum(nil)
	wrappedHexHash := fmt.Sprintf(`"%x"`, hashSum)
	return wrappedHexHash
}
