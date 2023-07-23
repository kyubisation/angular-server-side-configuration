package compress

import (
	"fmt"
	"ngssc/cli/test"
	"ngssc/server/constants"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/urfave/cli/v2"
)

func TestAction(t *testing.T) {
	context := test.NewTestDir(t)
	context.ImportTestNgsscApp()
	chdir(t, context.Path)
	app := &cli.App{
		Commands: []*cli.Command{
			{
				Name:   "compress",
				Flags:  Flags,
				Action: Action,
			},
		},
	}
	err := app.Run([]string{"path-to-binary", "compress"})
	if err != nil {
		t.Fatal(err)
	}
	err = assertCompression(t, context.Path, constants.CompressionDefaultThreshold)
	if err != nil {
		t.Error(err)
	}
}

func TestCompressAction(t *testing.T) {
	context := test.NewTestDir(t)
	context.ImportTestNgsscApp()
	params := &CompressParams{
		Threshold:        constants.CompressionDefaultThreshold,
		WorkingDirectory: context.Path,
	}

	err := compressFilesInDirectory(params)
	test.AssertTrue(t, err == nil, fmt.Sprintf("compress failed with %v", err))

	err = assertCompression(t, params.WorkingDirectory, params.Threshold)
	if err != nil {
		t.Error(err)
	}
}

func assertCompression(t *testing.T, workingDirectory string, threshold int64) error {
	return filepath.Walk(workingDirectory, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		} else if info.IsDir() || isCompressedFile(path) {
			return nil
		} else if info.Size() >= threshold && isUnicodeFile(path) && !strings.HasSuffix(path, "/index.html") {
			content, err := os.ReadFile(path)
			test.AssertNoError(t, err, "")
			for _, v := range []string{path + ".gz", path + ".br"} {
				test.AssertTrue(t, fileExists(v), fmt.Sprintf("%v expected to have been created", v))
				var compressedContent []byte
				if strings.HasSuffix(v, ".br") {
					compressedContent = test.DecompressBrotliFile(v)
				} else {
					compressedContent = test.DecompressGzipFile(v)
				}
				test.AssertEqual(t, string(compressedContent), string(content), "")
			}
		}

		return nil
	})
}

func fileExists(filePath string) bool {
	info, err := os.Stat(filePath)
	return err == nil && !info.IsDir()
}

func chdir(t *testing.T, dir string) {
	wd, err := os.Getwd()
	if err != nil {
		t.Fatalf("chdir %s: %v", dir, err)
	}
	if err := os.Chdir(dir); err != nil {
		t.Fatal(err)
	}

	t.Cleanup(func() {
		if err := os.Chdir(wd); err != nil {
			t.Fatal(err)
		}
	})
}
