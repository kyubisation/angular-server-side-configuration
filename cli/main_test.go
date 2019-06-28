package main

import (
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/rendon/testcli"
)

/*
 * End 2 End Tests
 */

var configHTMLTemplate = `<!DOCTYPE html>
 <html lang="en">
 
 <head>
	 <meta charset="utf-8" />
	 <title>Docker - Angular Runtime Variables Demo</title>
	 <base href="/" />
 
	 <!--CONFIG-->
 
	 <link href="https://fonts.googleapis.com/css?family=Major+Mono+Display" rel="stylesheet" />
	 <meta name="viewport" content="width=device-width, initial-scale=1" />
	 <link rel="icon" type="image/x-icon" href="favicon.ico" />
 </head>
 
 <body>
	 <app-root></app-root>
 </body>
 
 </html>
 `

var htmlTemplate = strings.Replace(configHTMLTemplate, "<!--CONFIG-->", "", 1)

func TestNgsscProcessWithNotSetEnvironmentVariable(t *testing.T) {
	dir := createTempDir()
	htmlPath := filepath.Join(dir, "index.html")
	ioutil.WriteFile(filepath.Join(dir, "ngssc.json"), []byte(`{"variant":"process","environmentVariables":["TEST_VALUE"]}`), 0644)
	ioutil.WriteFile(htmlPath, []byte(configHTMLTemplate), 0644)
	testcli.Run("./app", "insert", dir)
	if !testcli.Success() {
		t.Fatalf("Expected to succeed, but failed: %s %s", testcli.Stdout(), testcli.Error())
	} else if !strings.Contains(readFile(htmlPath), `<script>(function(self){self.process={"env":{"TEST_VALUE":null}};})(window)</script>`) {
		t.Fatalf("Expected html to contain iife. Got:\n" + readFile(htmlPath))
	}
}

func TestNgsscProcessWithSetEnvironmentVariable(t *testing.T) {
	dir := createTempDir()
	htmlPath := filepath.Join(dir, "index.html")
	ioutil.WriteFile(filepath.Join(dir, "ngssc.json"), []byte(`{"variant":"process","environmentVariables":["TEST_VALUE"]}`), 0644)
	ioutil.WriteFile(htmlPath, []byte(configHTMLTemplate), 0644)
	os.Setenv("TEST_VALUE", "example value")
	testcli.Run("./app", "insert", dir)
	os.Unsetenv("TEST_VALUE")
	if !testcli.Success() {
		t.Fatalf("Expected to succeed, but failed: %s %s", testcli.Stdout(), testcli.Error())
	} else if !strings.Contains(readFile(htmlPath), `<script>(function(self){self.process={"env":{"TEST_VALUE":"example value"}};})(window)</script>`) {
		t.Fatalf("Expected html to contain iife. Got:\n" + readFile(htmlPath))
	}
}

func TestNgsscNgEnvWithNotSetEnvironmentVariable(t *testing.T) {
	dir := createTempDir()
	htmlPath := filepath.Join(dir, "index.html")
	ioutil.WriteFile(filepath.Join(dir, "ngssc.json"), []byte(`{"variant":"NG_ENV","environmentVariables":["TEST_VALUE"]}`), 0644)
	ioutil.WriteFile(htmlPath, []byte(configHTMLTemplate), 0644)
	testcli.Run("./app", "insert", dir)
	if !testcli.Success() {
		t.Fatalf("Expected to succeed, but failed: %s %s", testcli.Stdout(), testcli.Error())
	} else if !strings.Contains(readFile(htmlPath), `<script>(function(self){self.NG_ENV={"TEST_VALUE":null};})(window)</script>`) {
		t.Fatalf("Expected html to contain iife. Got:\n" + readFile(htmlPath))
	}
}

func TestNgsscNgEnvWithSetEnvironmentVariable(t *testing.T) {
	dir := createTempDir()
	htmlPath := filepath.Join(dir, "index.html")
	ioutil.WriteFile(filepath.Join(dir, "ngssc.json"), []byte(`{"variant":"NG_ENV","environmentVariables":["TEST_VALUE"]}`), 0644)
	ioutil.WriteFile(htmlPath, []byte(configHTMLTemplate), 0644)
	os.Setenv("TEST_VALUE", "example value")
	testcli.Run("./app", "insert", dir)
	os.Unsetenv("TEST_VALUE")
	if !testcli.Success() {
		t.Fatalf("Expected to succeed, but failed: %s %s", testcli.Stdout(), testcli.Error())
	} else if !strings.Contains(readFile(htmlPath), `<script>(function(self){self.NG_ENV={"TEST_VALUE":"example value"};})(window)</script>`) {
		t.Fatalf("Expected html to contain iife. Got:\n" + readFile(htmlPath))
	}
}
func TestNgsscNgEnvWithMultipleHtmlFiles(t *testing.T) {
	dir := createTempDir()
	createDir(filepath.Join(dir, "de"))
	createDir(filepath.Join(dir, "en"))
	deHTML := filepath.Join(dir, "de", "index.html")
	enHTML := filepath.Join(dir, "en", "index.html")
	ioutil.WriteFile(filepath.Join(dir, "ngssc.json"), []byte(`{"variant":"NG_ENV","environmentVariables":["TEST_VALUE"]}`), 0644)
	ioutil.WriteFile(deHTML, []byte(configHTMLTemplate), 0644)
	ioutil.WriteFile(enHTML, []byte(configHTMLTemplate), 0644)
	testcli.Run("./app", "insert", dir)
	if !testcli.Success() {
		t.Fatalf("Expected to succeed, but failed: %s %s", testcli.Stdout(), testcli.Error())
	} else if !strings.Contains(readFile(deHTML), `<script>(function(self){self.NG_ENV={"TEST_VALUE":null};})(window)</script>`) {
		t.Fatalf("Expected html to contain iife. Got:\n" + readFile(deHTML))
	} else if !strings.Contains(readFile(enHTML), `<script>(function(self){self.NG_ENV={"TEST_VALUE":null};})(window)</script>`) {
		t.Fatalf("Expected html to contain iife. Got:\n" + readFile(enHTML))
	}
}

func TestNgsscNgEnvWithFilePattern(t *testing.T) {
	dir := createTempDir()
	htmlPath := filepath.Join(dir, "main.html")
	ioutil.WriteFile(filepath.Join(dir, "ngssc.json"), []byte(`{"variant":"NG_ENV","environmentVariables":["TEST_VALUE"],"filePattern":"main.html"}`), 0644)
	ioutil.WriteFile(htmlPath, []byte(configHTMLTemplate), 0644)
	os.Setenv("TEST_VALUE", "example value")
	testcli.Run("./app", "insert", dir)
	os.Unsetenv("TEST_VALUE")
	if !testcli.Success() {
		t.Fatalf("Expected to succeed, but failed: %s %s", testcli.Stdout(), testcli.Error())
	} else if !strings.Contains(readFile(htmlPath), `<script>(function(self){self.NG_ENV={"TEST_VALUE":"example value"};})(window)</script>`) {
		t.Fatalf("Expected html to contain iife. Got:\n" + readFile(htmlPath))
	}
}

func TestNgsscProcessWithInsertInHead(t *testing.T) {
	dir := createTempDir()
	htmlPath := filepath.Join(dir, "index.html")
	ioutil.WriteFile(filepath.Join(dir, "ngssc.json"), []byte(`{"variant":"process","environmentVariables":["TEST_VALUE"],"insertInHead":true}`), 0644)
	ioutil.WriteFile(htmlPath, []byte(htmlTemplate), 0644)
	testcli.Run("./app", "insert", dir)
	if !testcli.Success() {
		t.Fatalf("Expected to succeed, but failed: %s %s", testcli.Stdout(), testcli.Error())
	} else if !strings.Contains(readFile(htmlPath), `<script>(function(self){self.process={"env":{"TEST_VALUE":null}};})(window)</script>`) {
		t.Fatalf("Expected html to contain iife. Got:\n" + readFile(htmlPath))
	}
}

func createTempDir() string {
	dir, err := ioutil.TempDir("", "insert")
	if err != nil {
		panic(err)
	}

	return dir
}

func createDir(name string) {
	err := os.Mkdir(name, 0755)
	if err != nil {
		panic(err)
	}
}

func readFile(file string) string {
	content, err := ioutil.ReadFile(file)
	if err != nil {
		panic(err)
	}

	return string(content)
}
