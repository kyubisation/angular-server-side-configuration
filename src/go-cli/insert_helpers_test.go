package main

import (
	"os"
	"reflect"
	"testing"
)

func TestGenerateEnvMapOneVariable(t *testing.T) {
	// Prepare
	compareMap := map[string]string{
		"first_test": "testValue",
	}
	os.Setenv("first_test", "testValue")
	envs := []string{"first_test"}

	// Execute
	envMap, err := GenerateEnvMap(envs, false)

	// Verify
	if err != nil {
		t.Fatalf("Expected to succeed, but failed: %s", err)
	}

	if !reflect.DeepEqual(envMap, compareMap) {
		t.Fatalf("Maps do not match:\n %v \n %v", envMap, compareMap)
	}
}

func TestGenerateEnvMapMultipleVariable(t *testing.T) {
	// Prepare
	compareMap := map[string]string{
		"first_test":  "testValue",
		"second_test": "testValue",
		"third_test":  "testValue",
	}
	os.Setenv("first_test", "testValue")
	os.Setenv("second_test", "testValue")
	os.Setenv("third_test", "testValue")
	envs := []string{"first_test", "second_test", "third_test"}

	// Execute
	envMap, err := GenerateEnvMap(envs, false)

	// Verify
	if err != nil {
		t.Fatalf("Expected to succeed, but failed: %s", err)
	}

	if !reflect.DeepEqual(envMap, compareMap) {
		t.Fatalf("Maps do not match:\n %v \n %v", envMap, compareMap)
	}
}

func TestGenerateEnvMapVariableNotSet(t *testing.T) {
	// Prepare
	compareMap := map[string]string{
		"first_test": "testValue",
		"third_test": "testValue",
	}
	os.Setenv("first_test", "testValue")
	os.Unsetenv("second_test")
	os.Setenv("third_test", "testValue")
	envs := []string{"first_test", "second_test", "third_test"}

	// Execute
	envMap, err := GenerateEnvMap(envs, false)

	// Verify
	if err == nil {
		t.Fatalf("Expected to error, but succeeded.")
	}

	if !reflect.DeepEqual(envMap, compareMap) {
		t.Fatalf("Maps do not match:\n %v \n %v", envMap, compareMap)
	}
}

func TestGenerateEnvMapNoVariable(t *testing.T) {
	// Prepare
	envs := []string{}

	// Execute
	envMap, err := GenerateEnvMap(envs, false)

	//Verify
	if err == nil {
		t.Fatalf("Expected to error, but succeed")
	}

	if envMap != nil {
		t.Fatalf("Expected envMap to be nil, but: %v", envMap)
	}
}

func TestGenerateEnvMapNilVariable(t *testing.T) {
	// Execute
	envMap, err := GenerateEnvMap(nil, false)

	//Verify
	if err == nil {
		t.Fatalf("Expected to error, but succeed")
	}

	if envMap != nil {
		t.Fatalf("Expected envMap to be nil, but: %v", envMap)
	}
}

func TestPrepareJavascriptString(t *testing.T) {
	// Prepare
	envMap := map[string]string{
		"first_test": "testValue",
		"third_test": "testValue",
	}

	// Execute
	str := PrepareJavascriptString(envMap)

	// Verify
	compareStr := "<script>(function(self){self.process={\"first_test\":\"testValue\",\"third_test\":\"testValue\"};})(window)</script>"
	if str != compareStr {
		t.Fatalf("Expected Javascript string to be:\n %s\n but got:\n %s", compareStr, str)
	}
}

func TestPrepareReplacementStringHead(t *testing.T) {
	// Execute
	str := PrepareReplacementString(true, "")

	// Verify
	compareStr := "</head>"
	if str != compareStr {
		t.Fatalf("Expected string to be:\n %s\n but got:\n %s", compareStr, str)
	}
}

func TestPrepareReplacementStringDefault(t *testing.T) {
	// Execute
	str := PrepareReplacementString(false, "")

	// Verify
	compareStr := `<!--\s*CONFIG\s*-->`
	if str != compareStr {
		t.Fatalf("Expected string to be:\n %s\n but got:\n %s", compareStr, str)
	}
}

func TestPrepareReplacementStringCustomString(t *testing.T) {
	customString := "customString"
	// Execute
	str := PrepareReplacementString(false, customString)

	// Verify
	if str != customString {
		t.Fatalf("Expected string to be:\n %s\n but got:\n %s", customString, str)
	}
}

func TestPrepareReplacementStringCustomStringWithEscapingSymbols(t *testing.T) {
	customString := "customString with escaping symbols .+*?()|[]{}^$"
	// Execute
	str := PrepareReplacementString(false, customString)

	// Verify
	compareStr := `customString with escaping symbols \.\+\*\?\(\)\|\[\]\{\}\^\$`
	if str != compareStr {
		t.Fatalf("Expected string to be:\n %s\n but got:\n %s", compareStr, str)
	}
}
