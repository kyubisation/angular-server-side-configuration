package main

import (
	"bytes"
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

type TestResult struct {
	stdout string
	err    error
}

func runWithArgs(additionalArgs ...string) TestResult {
	args := os.Args[0:1]
	args = append(args, additionalArgs...)

	old := os.Stdout // keep backup of the real stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	err := run(args)

	outC := make(chan string)
	// copy the output in a separate goroutine so printing can't block indefinitely
	go func() {
		var buf bytes.Buffer
		io.Copy(&buf, r)
		outC <- buf.String()
	}()

	// back to normal state
	w.Close()
	os.Stdout = old // restoring the real stdout

	return TestResult{
		stdout: <-outC,
		err:    err,
	}
}

func (result TestResult) Success() bool {
	return result.err == nil
}

func (result TestResult) Error() error {
	return result.err
}

func (result TestResult) Stdout() string {
	return result.stdout
}

func (result TestResult) StdoutContains(pattern string) bool {
	return strings.Contains(result.Stdout(), pattern)
}

type TestDir struct {
	path string
}

func newTestDir(t *testing.T) TestDir {
	dir := t.TempDir()
	return TestDir{path: dir}
}

func (context TestDir) CreateFile(fileName string, content string) {
	filePath := filepath.Join(context.path, fileName)
	ioutil.WriteFile(filePath, []byte(content), 0644)
}

func (context TestDir) FileContains(fileName string, pattern string) bool {
	return strings.Contains(context.ReadFile(fileName), pattern)
}

func (context TestDir) ReadFile(fileName string) string {
	filePath := filepath.Join(context.path, fileName)
	fileContent, err := ioutil.ReadFile(filePath)
	if err != nil {
		panic(err)
	}

	return string(fileContent)
}

func (context TestDir) CreateDirectory(language string) TestDir {
	path := filepath.Join(context.path, language)
	err := os.Mkdir(path, 0755)
	if err != nil {
		panic(err)
	}

	return TestDir{path}
}

func chdir(t *testing.T, dir string) {
	t.Helper()
	wd, err := os.Getwd()
	if err != nil {
		t.Fatalf("chdir %s: %v", dir, err)
	}
	if err := os.Chdir(dir); err != nil {
		t.Fatal(err)
	}

	t.Cleanup(func() {
		if err := os.Chdir(wd); err != nil {
			t.Fatalf("restoring working directory: %v", err)
		}
	})
}

func tmpEnv(t *testing.T, key string, value string) {
	os.Setenv("TEST_VALUE", "example value")

	t.Cleanup(func() {
		os.Unsetenv("TEST_VALUE")
	})
}

func assertContains(t *testing.T, s string, substring string, message string) {
	t.Helper()
	debugMessage := fmt.Sprintf("Expected %v to contain %v", s, substring)
	assertTrue(t, strings.Contains(s, substring), appendDebugMessage(message, debugMessage))
}

func assertNotContains(t *testing.T, s string, substring string, message string) {
	t.Helper()
	debugMessage := fmt.Sprintf("Expected %v to not contain %v", s, substring)
	assertTrue(t, !strings.Contains(s, substring), appendDebugMessage(message, debugMessage))
}

func assertEqual(t *testing.T, a interface{}, b interface{}, message string) {
	t.Helper()
	assertTrue(t, a == b, appendDebugMessage(message, fmt.Sprintf("%v != %v", a, b)))
}

func assertFailure(t *testing.T, result TestResult) {
	t.Helper()
	if !result.Success() {
		return
	}
	t.Fatalf("Expected to fail, but succeeded: %v %v", result.Stdout(), result.Error())
}

func assertSuccess(t *testing.T, result TestResult) {
	t.Helper()
	if result.Success() {
		return
	}
	t.Fatalf("Expected to succeed, but failed: %v %v", result.Stdout(), result.Error())
}

func assertTrue(t *testing.T, v bool, message string) {
	t.Helper()
	if v {
		return
	}
	if len(message) == 0 {
		message = "Expected value to be true"
	}
	t.Fatal(message)
}

func appendDebugMessage(message string, debugMessage string) string {
	if len(message) == 0 {
		return debugMessage
	} else {
		return message + "\n" + debugMessage
	}
}
