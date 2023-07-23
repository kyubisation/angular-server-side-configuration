package main

import (
	"fmt"
	"ngssc/cli/test"
	"os"
	"path/filepath"
	"testing"
)

func TestSubstitutionWithCwdAndSingleNgsscRecursivelyFound(t *testing.T) {
	context := createDefaultContextAndCwd(t)
	t.Setenv("TEST_VALUE", "example value")
	result := test.RunWithArgs(run, "substitute")
	test.AssertSuccess(t, result)
	test.AssertEqual(t, context.ReadFile("default.conf"), sha512ConfContent, "Expected ${NGSSC_CSP_HASH} to be substituted.")
}

func TestSubstitutionWithCwdAndMultipleNgsscRecursivelyFoundWithSameConfig(t *testing.T) {
	context := test.NewTestDir(t)
	context.CreateDirectory("de").CreateFile("ngssc.json", `{"variant":"process","environmentVariables":["TEST_VALUE"]}`)
	context.CreateDirectory("en").CreateFile("ngssc.json", `{"variant":"process","environmentVariables":["TEST_VALUE"]}`)
	context.CreateFile("default.conf.template", defaultConfContent)

	test.Chdir(t, context.Path)
	t.Setenv("TEST_VALUE", "example value")
	result := test.RunWithArgs(run, "substitute")
	test.AssertSuccess(t, result)
	test.AssertEqual(t, context.ReadFile("default.conf"), sha512ConfContent, "Expected ${NGSSC_CSP_HASH} to be substituted.")
}

func TestSubstitutionWithCwdAndMissingNgssc(t *testing.T) {
	context := test.NewTestDir(t)
	context.CreateFile("default.conf.template", defaultConfContent)

	test.Chdir(t, context.Path)
	result := test.RunWithArgs(run, "substitute")
	test.AssertFailure(t, result)
	test.AssertContains(t, result.Error().Error(), "no ngssc.json files found with", "")
}

func TestSubstitutionWithCwdAndMultipleNgsscWithDifferentConfigs(t *testing.T) {
	context := test.NewTestDir(t)
	context.CreateDirectory("de").CreateFile("ngssc.json", `{"variant":"process","environmentVariables":["TEST_VALUE"]}`)
	context.CreateDirectory("en").CreateFile("ngssc.json", `{"variant":"process","environmentVariables":["TEST_VALUE2"]}`)
	context.CreateFile("default.conf.template", defaultConfContent)

	test.Chdir(t, context.Path)
	result := test.RunWithArgs(run, "substitute")
	test.AssertFailure(t, result)
	test.AssertContains(t, result.Error().Error(), "all recursively found ngssc.json must have same variant and environment variables configuration", "")
}

func TestSubstitutionWithCwdAndSingleNgsscViaParameter(t *testing.T) {
	context := createDefaultContextAndCwd(t)
	t.Setenv("TEST_VALUE", "example value")
	result := test.RunWithArgs(run, "substitute", "--ngssc-path=ngssc.json")
	test.AssertSuccess(t, result)
	test.AssertEqual(t, context.ReadFile("default.conf"), sha512ConfContent, "Expected ${NGSSC_CSP_HASH} to be substituted.")
}

func TestSubstitutionWithCwdAndSingleNgsscViaDirectoryParameter(t *testing.T) {
	context := createDefaultContextAndCwd(t)
	t.Setenv("TEST_VALUE", "example value")
	result := test.RunWithArgs(run, "substitute", "--ngssc-path=.")
	test.AssertSuccess(t, result)
	test.AssertEqual(t, context.ReadFile("default.conf"), sha512ConfContent, "Expected ${NGSSC_CSP_HASH} to be substituted.")
}

func TestSubstitutionWithCwdAndSingleNgsscViaAbsolutePathParameter(t *testing.T) {
	context := createDefaultContextAndCwd(t)
	t.Setenv("TEST_VALUE", "example value")
	result := test.RunWithArgs(run, "substitute", "--ngssc-path="+filepath.Join(context.Path, "ngssc.json"))
	test.AssertSuccess(t, result)
	test.AssertEqual(t, context.ReadFile("default.conf"), sha512ConfContent, "Expected ${NGSSC_CSP_HASH} to be substituted.")
}

func TestSubstitutionWithMissingFile(t *testing.T) {
	context := test.NewTestDir(t)
	context.CreateFile("ngssc.json", `{"variant":"process","environmentVariables":["TEST_VALUE"]}`)

	test.Chdir(t, context.Path)
	result := test.RunWithArgs(run, "substitute")
	test.AssertFailure(t, result)
	test.AssertContains(t, result.Error().Error(), "no files found with", "")
}

func TestSubstitutionWithCwdWithOutAndSingleNgsscRecursivelyFound(t *testing.T) {
	context := createDefaultContextAndCwd(t)
	t.Setenv("TEST_VALUE", "example value")
	result := test.RunWithArgs(run, "substitute", "--out=out")
	test.AssertSuccess(t, result)
	test.AssertEqual(t, context.ReadFile("out/default.conf"), sha512ConfContent, "Expected ${NGSSC_CSP_HASH} to be substituted.")
}

func TestSubstitutionWithCwdWithAbsoluteOutAndSingleNgsscRecursivelyFound(t *testing.T) {
	createDefaultContextAndCwd(t)
	outDir := t.TempDir()
	t.Setenv("TEST_VALUE", "example value")
	result := test.RunWithArgs(run, "substitute", fmt.Sprintf(`--out=%v`, outDir))
	test.AssertSuccess(t, result)
	outPath := filepath.Join(outDir, "default.conf")
	fileContent, err := os.ReadFile(outPath)
	if err != nil {
		panic(err)
	}
	test.AssertEqual(t, string(fileContent), sha512ConfContent, "Expected ${NGSSC_CSP_HASH} to be substituted.")
}

func TestSubstitutionWithAbsolutePathAndSingleNgsscViaAbsolutePathParameter(t *testing.T) {
	context := createDefaultContext(t)

	t.Setenv("TEST_VALUE", "example value")
	result := test.RunWithArgs(run, "substitute", "--ngssc-path="+filepath.Join(context.Path, "ngssc.json"), context.Path)
	test.AssertSuccess(t, result)
	test.AssertEqual(t, context.ReadFile("default.conf"), sha512ConfContent, "Expected ${NGSSC_CSP_HASH} to be substituted.")
}

func TestSubstitutionWithCwdAndSingleNgsscRecursivelyFoundWithSha384(t *testing.T) {
	context := createDefaultContextAndCwd(t)
	t.Setenv("TEST_VALUE", "example value")
	result := test.RunWithArgs(run, "substitute", "--hash-algorithm=sha384")
	test.AssertSuccess(t, result)
	test.AssertEqual(t, context.ReadFile("default.conf"), sha384ConfContent, "Expected ${NGSSC_CSP_HASH} to be substituted.")
}

func TestSubstitutionWithCwdAndSingleNgsscRecursivelyFoundWithSha384UpperCase(t *testing.T) {
	context := createDefaultContextAndCwd(t)
	t.Setenv("TEST_VALUE", "example value")
	result := test.RunWithArgs(run, "substitute", "--hash-algorithm=SHA384")
	test.AssertSuccess(t, result)
	test.AssertEqual(t, context.ReadFile("default.conf"), sha384ConfContent, "Expected ${NGSSC_CSP_HASH} to be substituted.")
}

func TestSubstitutionWithCwdAndSingleNgsscRecursivelyFoundWithSha256(t *testing.T) {
	context := createDefaultContextAndCwd(t)
	t.Setenv("TEST_VALUE", "example value")
	result := test.RunWithArgs(run, "substitute", "--hash-algorithm=sha256")
	test.AssertSuccess(t, result)
	test.AssertEqual(t, context.ReadFile("default.conf"), sha256ConfContent, "Expected ${NGSSC_CSP_HASH} to be substituted.")
}

func TestSubstitutionWithCwdAndSingleNgsscRecursivelyFoundWithSha256UpperCase(t *testing.T) {
	context := createDefaultContextAndCwd(t)
	t.Setenv("TEST_VALUE", "example value")
	result := test.RunWithArgs(run, "substitute", "--hash-algorithm=SHA256")
	test.AssertSuccess(t, result)
	test.AssertEqual(t, context.ReadFile("default.conf"), sha256ConfContent, "Expected ${NGSSC_CSP_HASH} to be substituted.")
}

func TestSubstitutionWithCwdAndSingleNgsscRecursivelyFoundWithInvalidHash(t *testing.T) {
	context := createDefaultContextAndCwd(t)
	t.Setenv("TEST_VALUE", "example value")
	result := test.RunWithArgs(run, "substitute", "--hash-algorithm=invalid")
	test.AssertSuccess(t, result)
	test.AssertEqual(t, context.ReadFile("default.conf"), sha512ConfContent, "Expected ${NGSSC_CSP_HASH} to be substituted.")
	test.AssertContains(t, result.Stdout(), "Unknown hash algorithm invalid. Using sha512 instead.", "")
}

func TestSubstitutionWithIncludingEnvironmentVariables(t *testing.T) {
	context := test.NewTestDir(t)
	context.CreateFile("ngssc.json", `{"variant":"process","environmentVariables":["TEST_VALUE"]}`)
	context.CreateFile(
		"default.conf.template",
		"test $NGSSC_CSP_HASH some text ${NGSSC_CSP_HASH} other ${TEST_VALUE} some text $TEST_VALUE ${MISSING_VALUE}")

	test.Chdir(t, context.Path)
	t.Setenv("TEST_VALUE", "example value")
	result := test.RunWithArgs(run, "substitute", "--include-env")
	test.AssertSuccess(t, result)
	test.AssertEqual(
		t,
		context.ReadFile("default.conf"),
		"test $NGSSC_CSP_HASH some text 'sha512-21jOIuJ7NOssNu09erK1ht/C+K5ebRhhCGtsIfs5W5F4GkJ5mHbXk4lRA6i/cAM/3FNcyHnR0heOe6ZVrOzmgQ=='"+
			" other example value some text $TEST_VALUE ${MISSING_VALUE}",
		"Expected environment variables to be substituted.")
}

func TestSubstitutionDryRun(t *testing.T) {
	context := createDefaultContextAndCwd(t)
	t.Setenv("TEST_VALUE", "example value")
	result := test.RunWithArgs(run, "substitute", "--dry")
	test.AssertSuccess(t, result)
	_, err := os.Stat(filepath.Join(context.Path, "default.conf"))
	test.AssertTrue(t, os.IsNotExist(err), "Expected default.conf to not have been created")
}

func TestSubstitutionMissingTemplateDirectory(t *testing.T) {
	context := test.NewTestDir(t)
	result := test.RunWithArgs(run, "substitute", filepath.Join(context.Path, "missing"))
	test.AssertFailure(t, result)
	test.AssertContains(t, result.Error().Error(), "template directory does not exist:", "")
}

func TestSubstitutionMissingNgssc(t *testing.T) {
	context := test.NewTestDir(t)
	result := test.RunWithArgs(run, "substitute", "--ngssc-path="+filepath.Join(context.Path, "missing"))
	test.AssertFailure(t, result)
	test.AssertContains(t, result.Error().Error(), "no ngssc.json files found", "")
}

func TestSubstitutionWithNoVariables(t *testing.T) {
	context := createDefaultContextAndCwd(t)
	context.CreateFile("default.conf.template", "no variables")
	t.Setenv("TEST_VALUE", "example value")
	result := test.RunWithArgs(run, "substitute")
	test.AssertSuccess(t, result)
	test.AssertEqual(t, context.ReadFile("default.conf"), "no variables", "")
}

func createDefaultContextAndCwd(t *testing.T) test.TestDir {
	context := createDefaultContext(t)
	test.Chdir(t, context.Path)
	return context
}

func createDefaultContext(t *testing.T) test.TestDir {
	context := test.NewTestDir(t)
	context.CreateFile("ngssc.json", `{"variant":"process","environmentVariables":["TEST_VALUE"]}`)
	context.CreateFile("default.conf.template", defaultConfContent)
	return context
}

var defaultConfContent = "test $NGSSC_CSP_HASH some text ${NGSSC_CSP_HASH} other"
var sha512ConfContent = `test $NGSSC_CSP_HASH some text 'sha512-21jOIuJ7NOssNu09erK1ht/C+K5ebRhhCGtsIfs5W5F4GkJ5mHbXk4lRA6i/cAM/3FNcyHnR0heOe6ZVrOzmgQ==' other`
var sha384ConfContent = `test $NGSSC_CSP_HASH some text 'sha384-YvhmrZwFM9YFATGGVVvaJ9nrHGj8IOvUTGa7hlPAYvVfz7C6yqd3qtFL/KGohBs1' other`
var sha256ConfContent = `test $NGSSC_CSP_HASH some text 'sha256-Mc7pndp1wggP7pIEfFqPE1e7KD6BdhIMvqXVAonw32s=' other`
