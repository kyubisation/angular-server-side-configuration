package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestNgsscProcessWithNotSetEnvironmentVariable(t *testing.T) {
	context := newTestDir(t)
	context.CreateFile("index.html", configHTMLTemplate)
	context.CreateFile("ngssc.json", `{"variant":"process","environmentVariables":["TEST_VALUE"]}`)

	result := runWithArgs("insert", context.path)
	assertSuccess(t, result)
	expect := `<script>(function(self){self.process={"env":{"TEST_VALUE":null}};})(window)</script>`
	assertContains(t, context.ReadFile("index.html"), expect, "Expected html to contain iife.")
}

func TestNgsscProcessWithSetEnvironmentVariable(t *testing.T) {
	context := newTestDir(t)
	context.CreateFile("index.html", configHTMLTemplate)
	context.CreateFile("ngssc.json", `{"variant":"process","environmentVariables":["TEST_VALUE"]}`)

	os.Setenv("TEST_VALUE", "example value")
	result := runWithArgs("insert", context.path)
	os.Unsetenv("TEST_VALUE")
	assertSuccess(t, result)
	expect := `<script>(function(self){self.process={"env":{"TEST_VALUE":"example value"}};})(window)</script>`
	assertContains(t, context.ReadFile("index.html"), expect, "Expected html to contain iife.")
}

func TestNgsscProcessWithSetEnvironmentVariableAndCwd(t *testing.T) {
	context := newTestDir(t)
	context.CreateFile("index.html", configHTMLTemplate)
	context.CreateFile("ngssc.json", `{"variant":"process","environmentVariables":["TEST_VALUE"]}`)

	chdir(t, context.path)
	os.Setenv("TEST_VALUE", "example value")
	result := runWithArgs("insert")
	os.Unsetenv("TEST_VALUE")
	assertSuccess(t, result)
	expect := `<script>(function(self){self.process={"env":{"TEST_VALUE":"example value"}};})(window)</script>`
	assertContains(t, context.ReadFile("index.html"), expect, "Expected html to contain iife.")
}

func TestIdempotentNgsscProcessWithSetEnvironmentVariable(t *testing.T) {
	context := newTestDir(t)
	context.CreateFile("index.html", configHTMLTemplate)
	context.CreateFile("ngssc.json", `{"variant":"process","environmentVariables":["TEST_VALUE","TEST_VALUE2"]}`)

	os.Setenv("TEST_VALUE", "example value")
	result := runWithArgs("insert", context.path)
	os.Unsetenv("TEST_VALUE")
	assertSuccess(t, result)
	expect := `<script>(function(self){self.process={"env":{"TEST_VALUE":"example value","TEST_VALUE2":null}};})(window)</script>`
	assertContains(t, context.ReadFile("index.html"), expect, "Expected html to contain iife.")

	os.Setenv("TEST_VALUE", "example value")
	os.Setenv("TEST_VALUE2", "example value 2")
	result = runWithArgs("insert", context.path)
	os.Unsetenv("TEST_VALUE")
	os.Unsetenv("TEST_VALUE2")
	assertSuccess(t, result)
	expect = `<script>(function(self){self.process={"env":{"TEST_VALUE":"example value","TEST_VALUE2":null}};})(window)</script>`
	assertNotContains(t, context.ReadFile("index.html"), expect, "Expected html to contain updated iife.")
	expect = `<script>(function(self){self.process={"env":{"TEST_VALUE":"example value","TEST_VALUE2":"example value 2"}};})(window)</script>`
	assertContains(t, context.ReadFile("index.html"), expect, "Expected html to contain updated iife.")
}

func TestNgsscGlobalWithSetEnvironmentVariable(t *testing.T) {
	context := newTestDir(t)
	context.CreateFile("index.html", configHTMLTemplate)
	context.CreateFile("ngssc.json", `{"variant":"global","environmentVariables":["TEST_VALUE"]}`)

	os.Setenv("TEST_VALUE", "example value")
	result := runWithArgs("insert", context.path)
	os.Unsetenv("TEST_VALUE")
	assertSuccess(t, result)
	expect := `<script>(function(self){Object.assign(self,{"TEST_VALUE":"example value"});})(window)</script>`
	assertContains(t, context.ReadFile("index.html"), expect, "Expected html to contain iife.")
}

func TestNgsscNgEnvWithNotSetEnvironmentVariable(t *testing.T) {
	context := newTestDir(t)
	context.CreateFile("index.html", configHTMLTemplate)
	context.CreateFile("ngssc.json", `{"variant":"NG_ENV","environmentVariables":["TEST_VALUE"]}`)

	result := runWithArgs("insert", context.path)
	assertSuccess(t, result)
	expect := `<script>(function(self){self.NG_ENV={"TEST_VALUE":null};})(window)</script>`
	assertContains(t, context.ReadFile("index.html"), expect, "Expected html to contain iife.")
}

func TestNgsscWithInvalidDir(t *testing.T) {
	context := newTestDir(t)

	result := runWithArgs("insert", filepath.Join(context.path, "invalid"))
	assertFailure(t, result)
	assertContains(t, result.err.Error(), "working directory does not exist", "")
}

func TestNgsscNgEnvWithSetEnvironmentVariable(t *testing.T) {
	context := newTestDir(t)
	context.CreateFile("index.html", configHTMLTemplate)
	context.CreateFile("ngssc.json", `{"variant":"NG_ENV","environmentVariables":["TEST_VALUE"]}`)

	os.Setenv("TEST_VALUE", "example value")
	result := runWithArgs("insert", context.path)
	os.Unsetenv("TEST_VALUE")
	assertSuccess(t, result)
	expect := `<script>(function(self){self.NG_ENV={"TEST_VALUE":"example value"};})(window)</script>`
	assertContains(t, context.ReadFile("index.html"), expect, "Expected html to contain iife.")
}

func TestNgsscNgEnvWithMultipleHtmlFiles(t *testing.T) {
	context := newTestDir(t)
	context.CreateFile("ngssc.json", `{"variant":"NG_ENV","environmentVariables":["TEST_VALUE"]}`)
	deContext := context.CreateDirectory("de")
	deContext.CreateFile("index.html", configHTMLTemplate)
	enContext := context.CreateDirectory("en")
	enContext.CreateFile("index.html", configHTMLTemplate)

	result := runWithArgs("insert", context.path)
	assertSuccess(t, result)
	expect := `<script>(function(self){self.NG_ENV={"TEST_VALUE":null};})(window)</script>`
	assertContains(t, deContext.ReadFile("index.html"), expect, "Expected html to contain iife.")
	expect = `<script>(function(self){self.NG_ENV={"TEST_VALUE":null};})(window)</script>`
	assertContains(t, enContext.ReadFile("index.html"), expect, "Expected html to contain iife.")
}

func TestNgsscNgEnvWithFilePattern(t *testing.T) {
	context := newTestDir(t)
	context.CreateFile("main.html", configHTMLTemplate)
	context.CreateFile("ngssc.json", `{"variant":"NG_ENV","environmentVariables":["TEST_VALUE"],"filePattern":"main.html"}`)

	os.Setenv("TEST_VALUE", "example value")
	result := runWithArgs("insert", context.path)
	os.Unsetenv("TEST_VALUE")
	assertSuccess(t, result)
	expect := `<script>(function(self){self.NG_ENV={"TEST_VALUE":"example value"};})(window)</script>`
	assertContains(t, context.ReadFile("main.html"), expect, "Expected html to contain iife.")
}

func TestNgsscProcessWithInsertInHead(t *testing.T) {
	context := newTestDir(t)
	context.CreateFile("index.html", htmlTemplate)
	context.CreateFile("ngssc.json", `{"variant":"process","environmentVariables":["TEST_VALUE"]}`)

	result := runWithArgs("insert", context.path)
	assertSuccess(t, result)
	expect := `<script>(function(self){self.process={"env":{"TEST_VALUE":null}};})(window)</script>`
	assertContains(t, context.ReadFile("index.html"), expect, "Expected html to contain iife.")
}

func TestNgsscRecursive(t *testing.T) {
	context := newTestDir(t)
	deContext := context.CreateDirectory("de")
	deContext.CreateFile("index.html", configHTMLTemplate)
	deContext.CreateFile("ngssc.json", `{"variant":"process","environmentVariables":["TEST_VALUE"],"filePattern":"index.html"}`)
	enContext := context.CreateDirectory("en")
	enContext.CreateFile("index.html", configHTMLTemplate)
	enContext.CreateFile("ngssc.json", `{"variant":"process","environmentVariables":["TEST_VALUE"],"filePattern":"index.html"}`)

	result := runWithArgs("insert", context.path, "--recursive")
	assertSuccess(t, result)
	expect := `<script>(function(self){self.process={"env":{"TEST_VALUE":null}};})(window)</script>`
	assertContains(t, deContext.ReadFile("index.html"), expect, "Expected html to contain iife.")
	expect = `<script>(function(self){self.process={"env":{"TEST_VALUE":null}};})(window)</script>`
	assertContains(t, enContext.ReadFile("index.html"), expect, "Expected html to contain iife.")
}

func TestNgsscProcessWithNgsw(t *testing.T) {
	context := newTestDir(t)
	context.CreateFile("index.html", configHTMLTemplate)
	context.CreateFile("ngssc.json", `{"variant":"process","environmentVariables":["TEST_VALUE"]}`)
	context.CreateFile("ngsw.json", ngswTemplate)

	os.Setenv("TEST_VALUE", "example value")
	result := runWithArgs("insert", context.path)
	os.Unsetenv("TEST_VALUE")
	assertSuccess(t, result)
	expect := `<script>(function(self){self.process={"env":{"TEST_VALUE":"example value"}};})(window)</script>`
	assertContains(t, context.ReadFile("index.html"), expect, "Expected html to contain iife.")
	assertTrue(
		t,
		result.StdoutContains("Detected ngsw.json and updated index hash at "),
		"Expected ngsw.json to be updated:\n "+result.Stdout())
}

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

var ngswTemplate = `{
  "configVersion": 1,
  "timestamp": 1602890563070,
  "index": "/index.html",
  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",
      "updateMode": "prefetch",
      "cacheQueryOptions": {
        "ignoreVary": true
      },
      "urls": [
        "/index.html",
        "/main-es2015.456948156f706a9ecc0d.js",
        "/main-es5.456948156f706a9ecc0d.js",
        "/manifest.webmanifest",
        "/polyfills-es2015.a0fa45e0fa52702b64f0.js",
        "/polyfills-es5.2dcde1efe3c1bf4aaa25.js",
        "/runtime-es2015.409e6590615fb48d139f.js",
        "/runtime-es5.409e6590615fb48d139f.js"
      ],
      "patterns": []
    },
    {
      "name": "assets",
      "installMode": "lazy",
      "updateMode": "prefetch",
      "cacheQueryOptions": {
        "ignoreVary": true
      },
      "urls": [],
      "patterns": []
    }
  ],
  "dataGroups": [],
  "hashTable": {
    "/index.html": "ea58d338769b6747a0c604d72ac82cf1129ffbb1",
    "/main-es2015.456948156f706a9ecc0d.js": "49c43df3989b0bb3c649d699ad5c9e88321048c5",
    "/main-es5.456948156f706a9ecc0d.js": "4afe362dbbc6752967d7861a2d57174780659c14",
    "/manifest.webmanifest": "2a943f564a370150f1b0cfabe19e5ef8b341dd75",
    "/polyfills-es2015.a0fa45e0fa52702b64f0.js": "72ad4ccc0a3916ae4598199447cdeadd6d380570",
    "/polyfills-es5.2dcde1efe3c1bf4aaa25.js": "8aa26ea87b9958c6bd13b7c257c0e9940438e684",
    "/runtime-es2015.409e6590615fb48d139f.js": "a9aafcf49f49145093fc831efd9b8e2f6c71bb9c",
    "/runtime-es5.409e6590615fb48d139f.js": "a9aafcf49f49145093fc831efd9b8e2f6c71bb9c"
  },
  "navigationUrls": [
    {
      "positive": true,
      "regex": "^\\/.*$"
    },
    {
      "positive": false,
      "regex": "^\\/(?:.+\\/)?[^/]*\\.[^/]*$"
    },
    {
      "positive": false,
      "regex": "^\\/(?:.+\\/)?[^/]*__[^/]*$"
    },
    {
      "positive": false,
      "regex": "^\\/(?:.+\\/)?[^/]*__[^/]*\\/.*$"
    }
  ]
}`
