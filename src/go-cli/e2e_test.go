package main

import (
	"io/ioutil"
	"os"
	"testing"

	"github.com/rendon/testcli"
)

/*
 * End 2 End Tests
 */

// First Test Case with one variable
var firstEnvName = "first_test"
var firstEnvValue = "testValue"
var compareTextWithFirstEnv = `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8" />
  <title>Docker - Angular Runtime Variables Demo</title>
  <base href="/" />

  <script>(function(self){self.process={"first_test":"testValue"};})(window)</script>

  <link href="https://fonts.googleapis.com/css?family=Major+Mono+Display" rel="stylesheet" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" type="image/x-icon" href="favicon.ico" />
</head>

<body>
  <app-root></app-root>
</body>

</html>
`

// Second Test Case with two variables
var secondEnvName = "second_test"
var secondEnvValue = "testValue"
var compareTextWithSecondEnv = `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8" />
  <title>Docker - Angular Runtime Variables Demo</title>
  <base href="/" />

  <script>(function(self){self.process={"first_test":"testValue","second_test":"testValue"};})(window)</script>

  <link href="https://fonts.googleapis.com/css?family=Major+Mono+Display" rel="stylesheet" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" type="image/x-icon" href="favicon.ico" />
</head>

<body>
  <app-root></app-root>
</body>

</html>
`

func TestInsertWithOneVariable(t *testing.T) {
	// Prepare
	os.Setenv(firstEnvName, firstEnvValue)
	prepareTestFile()

	// Execute
	testcli.Run("./app", "insert", "-e", firstEnvName)
	if !testcli.Success() {
		t.Fatalf("Expected to succeed, but failed: %s %s", testcli.Stdout(), testcli.Error())
	}

	// Verfiy
	if !testcli.StdoutContains(firstEnvName) {
		t.Fatalf("Expected %q to contain %q", testcli.Stdout(), "Variable test")
	}

	if getTestFileContent() != compareTextWithFirstEnv {
		t.Fatalf("Compare text not the same as generated. Got:\n" + getTestFileContent())
	}
}

func TestInsertWithMultipleVariable(t *testing.T) {
	// Prepare
	os.Setenv(firstEnvName, firstEnvValue)
	os.Setenv(secondEnvName, secondEnvValue)
	prepareTestFile()

	// Execute
	testcli.Run("./app", "insert", "-e", firstEnvName, "-e", secondEnvName)
	if !testcli.Success() {
		t.Fatalf("Expected to succeed, but failed: %s %s", testcli.Stdout(), testcli.Error())
	}

	// Verfiy
	if !testcli.StdoutContains(firstEnvName) || !testcli.StdoutContains(firstEnvValue) {
		t.Fatalf("Expected %q to contain %q", testcli.Stdout(), firstEnvName)
	}

	if !testcli.StdoutContains(secondEnvName) {
		t.Fatalf("Expected %q to contain %q", testcli.Stdout(), secondEnvName)
	}

	if getTestFileContent() != compareTextWithSecondEnv {
		t.Fatalf("Compare text not the same as generated. Got:\n" + getTestFileContent())
	}
}

func TestInsertDryRun(t *testing.T) {
	// Prepare
	os.Setenv(firstEnvName, firstEnvValue)
	prepareTestFile()

	// Execute
	testcli.Run("./app", "insert", "-e", "test", "--dry")
	if !testcli.Success() {
		t.Fatalf("Expected to succeed, but failed: %s %s", testcli.Stdout(), testcli.Error())
	}

	// Verfiy
	testString := "DRY MODE"
	if !testcli.StdoutContains(testString) {
		t.Fatalf("Expected %q to contain %q", testcli.Stdout(), testString)
	}

	if getTestFileContent() != startContent {
		t.Fatalf("Compare text not the same as generated. Got:\n" + getTestFileContent())
	}
}

func TestInsertErrorIfVariableNotDefined(t *testing.T) {
	// Prepare
	os.Unsetenv("test")

	// Execute
	testcli.Run("./app", "insert", "-e", "test")
	if testcli.Success() {
		t.Fatalf("Expected to error, but succeeded: %s ", testcli.Stdout())
	}

	// Verfiy
	testString := "not defined in environment"
	if !testcli.StderrContains(testString) {
		t.Fatalf("Expected %q to contain %q", testcli.Stderr(), testString)
	}
}

func TestInsertErrorIfNoVariablesSet(t *testing.T) {
	// Execute
	testcli.Run("./app", "insert")
	if testcli.Success() {
		t.Fatalf("Expected to error, but succeeded: %s ", testcli.Stdout())
	}

	// Verfiy
	testString := "No Variables set"
	if !testcli.StderrContains(testString) {
		t.Fatalf("Expected %q to contain %q", testcli.Stderr(), testString)
	}
}

func TestInsertWithCustomPlaceholder(t *testing.T) {
	// Prepare
	os.Setenv(firstEnvName, firstEnvValue)
	WriteFile(path, `<!DOCTYPE html>
  <html lang="en">

  <head>
    <meta charset="utf-8" />
    <title>Docker - Angular Runtime Variables Demo</title>
    <base href="/" />

    TextPlaceholder

    <link href="https://fonts.googleapis.com/css?family=Major+Mono+Display" rel="stylesheet" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/x-icon" href="favicon.ico" />
  </head>

  <body>
    <app-root></app-root>
  </body>

  </html>
  `)

	// Execute
	testcli.Run("./app", "insert", "-e", firstEnvName, "--placeholder", "TextPlaceholder")
	if !testcli.Success() {
		t.Fatalf("Expected to succeed, but failed: %s %s", testcli.Stdout(), testcli.Error())
	}

	compareText := `<!DOCTYPE html>
  <html lang="en">

  <head>
    <meta charset="utf-8" />
    <title>Docker - Angular Runtime Variables Demo</title>
    <base href="/" />

    <script>(function(self){self.process={"first_test":"testValue"};})(window)</script>

    <link href="https://fonts.googleapis.com/css?family=Major+Mono+Display" rel="stylesheet" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/x-icon" href="favicon.ico" />
  </head>

  <body>
    <app-root></app-root>
  </body>

  </html>
  `
	if getTestFileContent() != compareText {
		t.Fatalf("Compare text not the same as generated. Got:\n" + getTestFileContent())
	}
}

func TestInsertInHead(t *testing.T) {
	// Prepare
	os.Setenv(firstEnvName, firstEnvValue)
	WriteFile(path,
		`<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8" />
  <title>Docker - Angular Runtime Variables Demo</title>
  <base href="/" />

  <link href="https://fonts.googleapis.com/css?family=Major+Mono+Display" rel="stylesheet" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" type="image/x-icon" href="favicon.ico" />
</head>

<body>
  <app-root></app-root>
</body>

</html>
`)

	// Execute
	testcli.Run("./app", "insert", "-e", firstEnvName, "--head")
	if !testcli.Success() {
		t.Fatalf("Expected to succeed, but failed: %s %s", testcli.Stdout(), testcli.Error())
	}

	compareText :=
		`<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8" />
  <title>Docker - Angular Runtime Variables Demo</title>
  <base href="/" />

  <link href="https://fonts.googleapis.com/css?family=Major+Mono+Display" rel="stylesheet" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" type="image/x-icon" href="favicon.ico" />
<script>(function(self){self.process={"first_test":"testValue"};})(window)</script>
</head>

<body>
  <app-root></app-root>
</body>

</html>
`
	if getTestFileContent() != compareText {
		t.Fatalf("Compare text not the same as generated. Got:\n" + getTestFileContent())
	}
}

/*
 * Helper Functions
 */
func getTestFileContent() string {
	read, err := ioutil.ReadFile(path)
	if err != nil {
		panic(err)
	}
	return string(read)
}
