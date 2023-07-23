package dotenv

import (
	"ngssc/cli/test"
	"path/filepath"
	"testing"
	"time"
)

func TestShouldParseDotEnv(t *testing.T) {
	context := test.NewTestDir(t)
	context.CreateFile(".env", "ENV =production\nPORT =8080 \nDELAY = 200")

	var result map[string]*string
	env := Create(filepath.Join(context.Path, ".env"), func(variables map[string]*string) {
		result = variables
	})
	defer env.Close()

	test.AssertEqual(t, len(result), 3, "")
	test.AssertEqual(t, readValue(t, result, "ENV"), "production", "")
	test.AssertEqual(t, readValue(t, result, "PORT"), "8080", "")
	test.AssertEqual(t, readValue(t, result, "DELAY"), "200", "")
}

func TestShouldParseEmptyDotEnv(t *testing.T) {
	context := test.NewTestDir(t)
	context.CreateFile(".env", "")

	var result map[string]*string
	env := Create(filepath.Join(context.Path, ".env"), func(variables map[string]*string) {
		result = variables
	})
	defer env.Close()

	test.AssertEqual(t, len(result), 0, "")
}

func TestShouldSkipMissingDotEnv(t *testing.T) {
	context := test.NewTestDir(t)

	var result map[string]*string
	env := Create(filepath.Join(context.Path, "missing", ".env"), func(variables map[string]*string) {
		result = variables
	})
	defer env.Close()

	test.AssertEqual(t, len(result), 0, "")
}

func TestShouldSkipMalformedDotEnv(t *testing.T) {
	context := test.NewTestDir(t)
	context.CreateFile(".env", "{}")

	var result map[string]*string
	env := Create(filepath.Join(context.Path, ".env"), func(variables map[string]*string) {
		result = variables
	})
	defer env.Close()

	test.AssertEqual(t, len(result), 0, "")
}

func TestShouldUpdateDotEnvOnChange(t *testing.T) {
	context := test.NewTestDir(t)
	context.CreateFile(".env", "ENV =production\nPORT =8080 \nDELAY = 200")

	var result map[string]*string
	env := Create(filepath.Join(context.Path, ".env"), func(variables map[string]*string) {
		result = variables
	})
	defer env.Close()

	test.AssertEqual(t, len(result), 3, "")

	context.CreateFile(".env", "TEST = example")

	time.Sleep(time.Millisecond)

	test.AssertEqual(t, len(result), 1, "")
	test.AssertEqual(t, readValue(t, result, "TEST"), "example", "")
}

func readValue(t *testing.T, variables map[string]*string, key string) string {
	value, ok := variables[key]
	if !ok {
		t.Fatalf("Variable %v not defined", key)
		return ""
	}

	return *value
}
