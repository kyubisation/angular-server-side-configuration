package main

import (
	"fmt"
	"io/ioutil"
	"os"
	"testing"

	"github.com/rendon/testcli"
)

func TestInsert(t *testing.T) {
	os.Setenv("test", "testValue")

	testcli.Run("./app", "insert", "-e", "test")
	if !testcli.Success() {
		t.Fatalf("Expected to succeed, but failed: %s %s", testcli.Stdout(), testcli.Error())
	}

	// if !testcli.StdoutContains("Hello?") {
	// 	t.Fatalf("Expected %q to contain %q", testcli.Stdout(), "Hello?")
	// }

	read, err := ioutil.ReadFile(path)
	if err != nil {
		panic(err)
	}

	compareText := `<!DOCTYPE html>
  <html lang="en">

  <head>
    <meta charset="utf-8" />
    <title>Docker - Angular Runtime Variables Demo</title>
    <base href="/" />
    <!-- <script>
        var ENV = {
          test: "${TEST_ENV}"
        };
      </script> -->

    <script>(function(self){self.process={"test":"testValue"};})(window)</script>

    <link href="https://fonts.googleapis.com/css?family=Major+Mono+Display" rel="stylesheet" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/x-icon" href="favicon.ico" />
  </head>

  <body>
    <app-root></app-root>
  </body>

  </html>
  `
	if string(read) != compareText {
		t.Fatalf("Compare text not the same as generated.")
	}

	fmt.Sprintf(string(read))
}
