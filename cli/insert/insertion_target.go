package insert

import (
	"crypto/sha1"
	"fmt"
	"ngssc/cli/ngsscjson"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

// InsertionTarget represents an html file target
type InsertionTarget struct {
	filePath    string
	ngsscConfig ngsscjson.NgsscConfig
}

// Insert the environment variables into the targeted file
func (target InsertionTarget) Insert() error {
	htmlBytes, err := os.ReadFile(target.filePath)
	if err != nil {
		return err
	}

	newHTML := Apply(htmlBytes, target.ngsscConfig)
	newHTMLBytes := []byte(newHTML)
	err = os.WriteFile(target.filePath, newHTMLBytes, 0644)
	if err != nil {
		return fmt.Errorf("failed to update %v\n%v", target.filePath, err)
	}

	replaceIndexHashInNgsw(target, htmlBytes, newHTMLBytes)

	return nil
}

// Insert the environment variables into the targeted file
func Apply(htmlBytes []byte, ngsscConfig ngsscjson.NgsscConfig) string {
	html := string(htmlBytes)
	iifeScript := fmt.Sprintf(
		"<!--ngssc--><script>%v</script><!--/ngssc-->",
		ngsscConfig.BuildIifeScriptContent())
	var newHTML string
	ngsscRegex := regexp.MustCompile(`<!--ngssc-->[\w\W]*<!--/ngssc-->`)
	configRegex := regexp.MustCompile(`<!--\s*CONFIG\s*-->`)
	if ngsscRegex.Match(htmlBytes) {
		newHTML = ngsscRegex.ReplaceAllString(html, iifeScript)
	} else if configRegex.Match(htmlBytes) {
		newHTML = configRegex.ReplaceAllString(html, iifeScript)
	} else if strings.Contains(html, "</title>") {
		newHTML = strings.Replace(html, "</title>", "</title>"+iifeScript, 1)
	} else {
		newHTML = strings.Replace(html, "</head>", iifeScript+"</head>", 1)
	}

	return newHTML
}

func replaceIndexHashInNgsw(target InsertionTarget, originalHash []byte, replacedHash []byte) {
	filePath := filepath.Join(filepath.Dir(target.filePath), "ngsw.json")
	info, err := os.Stat(filePath)
	if os.IsNotExist(err) || info.IsDir() {
		return
	}

	ngswBytes, err := os.ReadFile(filePath)
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
	err = os.WriteFile(filePath, []byte(replacedNgswContent), info.Mode())
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
