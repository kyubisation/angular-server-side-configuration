package main

import (
	"bytes"
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

type TestIOContext struct {
	path string
}

func NewTestIOContext(t *testing.T) TestIOContext {
	dir, err := ioutil.TempDir("", "ngssc_test")
	if err != nil {
		panic(err)
	}

	context := TestIOContext{path: dir}
	t.Cleanup(func() {
		err := os.RemoveAll(context.path)
		if err != nil {
			panic(err)
		}
	})
	return context
}

func (context TestIOContext) CreateFile(fileName string, content string) {
	filePath := filepath.Join(context.path, fileName)
	ioutil.WriteFile(filePath, []byte(content), 0644)
}

func (context TestIOContext) FileContains(fileName string, pattern string) bool {
	return strings.Contains(context.ReadFile(fileName), pattern)
}

func (context TestIOContext) ReadFile(fileName string) string {
	filePath := filepath.Join(context.path, fileName)
	fileContent, err := ioutil.ReadFile(filePath)
	if err != nil {
		panic(err)
	}

	return string(fileContent)
}

func (context TestIOContext) CreateLanguageContext(language string) TestIOContext {
	path := filepath.Join(context.path, language)
	err := os.Mkdir(path, 0755)
	if err != nil {
		panic(err)
	}

	languageContext := TestIOContext{path}
	return languageContext
}
