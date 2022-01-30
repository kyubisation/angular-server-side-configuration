package main

import (
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"testing"
)

func TestSubstitutionWithCwdAndSingleNgsscRecursivelyFound(t *testing.T) {
	context := createDefaultContextAndCwd(t)
	tmpEnv(t, "TEST_VALUE", "example value")
	result := runWithArgs("substitute")
	assertSuccess(t, result)
	assertEqual(t, context.ReadFile("default.conf"), sha512ConfContent, "Expected ${NGSSC_CSP_HASH} to be substituted.")
}

func TestSubstitutionWithCwdAndMultipleNgsscRecursivelyFoundWithSameConfig(t *testing.T) {
	context := newTestDir(t)
	context.CreateDirectory("de").CreateFile("ngssc.json", `{"variant":"process","environmentVariables":["TEST_VALUE"]}`)
	context.CreateDirectory("en").CreateFile("ngssc.json", `{"variant":"process","environmentVariables":["TEST_VALUE"]}`)
	context.CreateFile("default.conf.template", defaultConfContent)

	chdir(t, context.path)
	tmpEnv(t, "TEST_VALUE", "example value")
	result := runWithArgs("substitute")
	assertSuccess(t, result)
	assertEqual(t, context.ReadFile("default.conf"), sha512ConfContent, "Expected ${NGSSC_CSP_HASH} to be substituted.")
}

func TestSubstitutionWithCwdAndMissingNgssc(t *testing.T) {
	context := newTestDir(t)
	context.CreateFile("default.conf.template", defaultConfContent)

	chdir(t, context.path)
	result := runWithArgs("substitute")
	assertFailure(t, result)
	assertContains(t, result.err.Error(), "no ngssc.json files found with", "")
}

func TestSubstitutionWithCwdAndMultipleNgsscWithDifferentConfigs(t *testing.T) {
	context := newTestDir(t)
	context.CreateDirectory("de").CreateFile("ngssc.json", `{"variant":"process","environmentVariables":["TEST_VALUE"]}`)
	context.CreateDirectory("en").CreateFile("ngssc.json", `{"variant":"process","environmentVariables":["TEST_VALUE2"]}`)
	context.CreateFile("default.conf.template", defaultConfContent)

	chdir(t, context.path)
	result := runWithArgs("substitute")
	assertFailure(t, result)
	assertContains(t, result.err.Error(), "all recursively found ngssc.json must have same variant and environment variables configuration", "")
}

func TestSubstitutionWithCwdAndSingleNgsscViaParameter(t *testing.T) {
	context := createDefaultContextAndCwd(t)
	tmpEnv(t, "TEST_VALUE", "example value")
	result := runWithArgs("substitute", "--ngssc-path=ngssc.json")
	assertSuccess(t, result)
	assertEqual(t, context.ReadFile("default.conf"), sha512ConfContent, "Expected ${NGSSC_CSP_HASH} to be substituted.")
}

func TestSubstitutionWithCwdAndSingleNgsscViaDirectoryParameter(t *testing.T) {
	context := createDefaultContextAndCwd(t)
	tmpEnv(t, "TEST_VALUE", "example value")
	result := runWithArgs("substitute", "--ngssc-path=.")
	assertSuccess(t, result)
	assertEqual(t, context.ReadFile("default.conf"), sha512ConfContent, "Expected ${NGSSC_CSP_HASH} to be substituted.")
}

func TestSubstitutionWithCwdAndSingleNgsscViaAbsolutePathParameter(t *testing.T) {
	context := createDefaultContextAndCwd(t)
	tmpEnv(t, "TEST_VALUE", "example value")
	result := runWithArgs("substitute", "--ngssc-path="+filepath.Join(context.path, "ngssc.json"))
	assertSuccess(t, result)
	assertEqual(t, context.ReadFile("default.conf"), sha512ConfContent, "Expected ${NGSSC_CSP_HASH} to be substituted.")
}

func TestSubstitutionWithMissingFile(t *testing.T) {
	context := newTestDir(t)
	context.CreateFile("ngssc.json", `{"variant":"process","environmentVariables":["TEST_VALUE"]}`)

	chdir(t, context.path)
	result := runWithArgs("substitute")
	assertFailure(t, result)
	assertContains(t, result.err.Error(), "no files found with", "")
}

func TestSubstitutionWithCwdWithOutAndSingleNgsscRecursivelyFound(t *testing.T) {
	context := createDefaultContextAndCwd(t)
	tmpEnv(t, "TEST_VALUE", "example value")
	result := runWithArgs("substitute", "--out=out")
	assertSuccess(t, result)
	assertEqual(t, context.ReadFile("out/default.conf"), sha512ConfContent, "Expected ${NGSSC_CSP_HASH} to be substituted.")
}

func TestSubstitutionWithCwdWithAbsoluteOutAndSingleNgsscRecursivelyFound(t *testing.T) {
	createDefaultContextAndCwd(t)
	outDir := t.TempDir()
	tmpEnv(t, "TEST_VALUE", "example value")
	result := runWithArgs("substitute", fmt.Sprintf(`--out=%v`, outDir))
	assertSuccess(t, result)
	outPath := filepath.Join(outDir, "default.conf")
	fileContent, err := ioutil.ReadFile(outPath)
	if err != nil {
		panic(err)
	}
	assertEqual(t, string(fileContent), sha512ConfContent, "Expected ${NGSSC_CSP_HASH} to be substituted.")
}

func TestSubstitutionWithAbsolutePathAndSingleNgsscViaAbsolutePathParameter(t *testing.T) {
	context := createDefaultContext(t)

	tmpEnv(t, "TEST_VALUE", "example value")
	result := runWithArgs("substitute", "--ngssc-path="+filepath.Join(context.path, "ngssc.json"), context.path)
	assertSuccess(t, result)
	assertEqual(t, context.ReadFile("default.conf"), sha512ConfContent, "Expected ${NGSSC_CSP_HASH} to be substituted.")
}

func TestSubstitutionWithCwdAndSingleNgsscRecursivelyFoundWithSha384(t *testing.T) {
	context := createDefaultContextAndCwd(t)
	tmpEnv(t, "TEST_VALUE", "example value")
	result := runWithArgs("substitute", "--hash-algorithm=sha384")
	assertSuccess(t, result)
	assertEqual(t, context.ReadFile("default.conf"), sha384ConfContent, "Expected ${NGSSC_CSP_HASH} to be substituted.")
}

func TestSubstitutionWithCwdAndSingleNgsscRecursivelyFoundWithSha384UpperCase(t *testing.T) {
	context := createDefaultContextAndCwd(t)
	tmpEnv(t, "TEST_VALUE", "example value")
	result := runWithArgs("substitute", "--hash-algorithm=SHA384")
	assertSuccess(t, result)
	assertEqual(t, context.ReadFile("default.conf"), sha384ConfContent, "Expected ${NGSSC_CSP_HASH} to be substituted.")
}

func TestSubstitutionWithCwdAndSingleNgsscRecursivelyFoundWithSha256(t *testing.T) {
	context := createDefaultContextAndCwd(t)
	tmpEnv(t, "TEST_VALUE", "example value")
	result := runWithArgs("substitute", "--hash-algorithm=sha256")
	assertSuccess(t, result)
	assertEqual(t, context.ReadFile("default.conf"), sha256ConfContent, "Expected ${NGSSC_CSP_HASH} to be substituted.")
}

func TestSubstitutionWithCwdAndSingleNgsscRecursivelyFoundWithSha256UpperCase(t *testing.T) {
	context := createDefaultContextAndCwd(t)
	tmpEnv(t, "TEST_VALUE", "example value")
	result := runWithArgs("substitute", "--hash-algorithm=SHA256")
	assertSuccess(t, result)
	assertEqual(t, context.ReadFile("default.conf"), sha256ConfContent, "Expected ${NGSSC_CSP_HASH} to be substituted.")
}

func TestSubstitutionWithCwdAndSingleNgsscRecursivelyFoundWithInvalidHash(t *testing.T) {
	context := createDefaultContextAndCwd(t)
	tmpEnv(t, "TEST_VALUE", "example value")
	result := runWithArgs("substitute", "--hash-algorithm=invalid")
	assertSuccess(t, result)
	assertEqual(t, context.ReadFile("default.conf"), sha512ConfContent, "Expected ${NGSSC_CSP_HASH} to be substituted.")
	assertContains(t, result.Stdout(), "Unknown hash algorithm invalid. Using sha512 instead.", "")
}

func TestSubstitutionWithIncludingEnvironmentVariables(t *testing.T) {
	context := newTestDir(t)
	context.CreateFile("ngssc.json", `{"variant":"process","environmentVariables":["TEST_VALUE"]}`)
	context.CreateFile(
		"default.conf.template",
		"test $NGSSC_CSP_HASH some text ${NGSSC_CSP_HASH} other ${TEST_VALUE} some text $TEST_VALUE ${MISSING_VALUE}")

	chdir(t, context.path)
	tmpEnv(t, "TEST_VALUE", "example value")
	result := runWithArgs("substitute", "--include-env")
	assertSuccess(t, result)
	assertEqual(
		t,
		context.ReadFile("default.conf"),
		"test $NGSSC_CSP_HASH some text 'sha512-21jOIuJ7NOssNu09erK1ht/C+K5ebRhhCGtsIfs5W5F4GkJ5mHbXk4lRA6i/cAM/3FNcyHnR0heOe6ZVrOzmgQ=='"+
			" other example value some text $TEST_VALUE ${MISSING_VALUE}",
		"Expected environment variables to be substituted.")
}

func TestSubstitutionDryRun(t *testing.T) {
	context := createDefaultContextAndCwd(t)
	tmpEnv(t, "TEST_VALUE", "example value")
	result := runWithArgs("substitute", "--dry")
	assertSuccess(t, result)
	_, err := os.Stat(filepath.Join(context.path, "default.conf"))
	assertTrue(t, os.IsNotExist(err), "Expected default.conf to not have been created")
}

func TestSubstitutionMissingTemplateDirectory(t *testing.T) {
	context := newTestDir(t)
	result := runWithArgs("substitute", filepath.Join(context.path, "missing"))
	assertFailure(t, result)
	assertContains(t, result.err.Error(), "template directory does not exist:", "")
}

func TestSubstitutionMissingNgssc(t *testing.T) {
	context := newTestDir(t)
	result := runWithArgs("substitute", "--ngssc-path="+filepath.Join(context.path, "missing"))
	assertFailure(t, result)
	assertContains(t, result.err.Error(), "no ngssc.json files found", "")
}

func TestSubstitutionWithNoVariables(t *testing.T) {
	context := createDefaultContextAndCwd(t)
	context.CreateFile("default.conf.template", "no variables")
	tmpEnv(t, "TEST_VALUE", "example value")
	result := runWithArgs("substitute")
	assertSuccess(t, result)
	assertEqual(t, context.ReadFile("default.conf"), "no variables", "")
}

func createDefaultContextAndCwd(t *testing.T) TestDir {
	context := createDefaultContext(t)
	chdir(t, context.path)
	return context
}

func createDefaultContext(t *testing.T) TestDir {
	context := newTestDir(t)
	context.CreateFile("ngssc.json", `{"variant":"process","environmentVariables":["TEST_VALUE"]}`)
	context.CreateFile("default.conf.template", defaultConfContent)
	return context
}

var defaultConfContent = "test $NGSSC_CSP_HASH some text ${NGSSC_CSP_HASH} other"
var sha512ConfContent = `test $NGSSC_CSP_HASH some text 'sha512-21jOIuJ7NOssNu09erK1ht/C+K5ebRhhCGtsIfs5W5F4GkJ5mHbXk4lRA6i/cAM/3FNcyHnR0heOe6ZVrOzmgQ==' other`
var sha384ConfContent = `test $NGSSC_CSP_HASH some text 'sha384-YvhmrZwFM9YFATGGVVvaJ9nrHGj8IOvUTGa7hlPAYvVfz7C6yqd3qtFL/KGohBs1' other`
var sha256ConfContent = `test $NGSSC_CSP_HASH some text 'sha256-Mc7pndp1wggP7pIEfFqPE1e7KD6BdhIMvqXVAonw32s=' other`
