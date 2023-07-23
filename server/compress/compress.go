package compress

import (
	"bufio"
	"fmt"
	"ngssc/server/constants"
	"os"
	"path/filepath"
	"strings"
	"unicode/utf8"

	"github.com/urfave/cli/v2"
)

var Flags = []cli.Flag{
	&cli.Int64Flag{
		EnvVars: []string{"_COMPRESSION_THRESHOLD"},
		Name:    "threshold",
		Value:   constants.CompressionDefaultThreshold,
	},
}

type CompressParams struct {
	Threshold        int64
	WorkingDirectory string
}

func Action(c *cli.Context) error {
	params := parseParams(c)
	return compressFilesInDirectory(params)
}

func parseParams(c *cli.Context) *CompressParams {
	workingDirectory, err := os.Getwd()
	if err != nil {
		panic(fmt.Sprintf("failed to resolve current working directory: %v", err))
	}

	return &CompressParams{
		Threshold:        c.Int64("threshold"),
		WorkingDirectory: workingDirectory,
	}
}

func compressFilesInDirectory(params *CompressParams) error {
	fmt.Printf("starting compression walk in %v:\n", params.WorkingDirectory)
	err := filepath.Walk(params.WorkingDirectory, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		} else if info.IsDir() || isCompressedFile(path) {
			return nil
		} else if strings.HasSuffix(path, "/index.html") {
			fmt.Printf("- skipping %v (no index files)\n", path)
			return nil
		} else if !isUnicodeFile(path) {
			fmt.Printf("- skipping %v (not a text/unicode file)\n", path)
			return nil
		} else if info.Size() < params.Threshold {
			fmt.Printf("- skipping %v (%v is below threshold %v)\n", path, info.Size(), params.Threshold)
			return nil
		}

		content, err := os.ReadFile(path)
		if err != nil {
			return err
		}

		err = CompressWithBrotliToFile(content, path+".br")
		if err != nil {
			return err
		}
		err = CompressWithGzipToFile(content, path+".gz")
		if err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return fmt.Errorf("compression failed: %w", err)
	}

	fmt.Println("\nfinished compression walk")

	return nil
}

func isCompressedFile(path string) bool {
	extension := filepath.Ext(path)
	return extension == ".gz" || extension == ".br"
}

func isUnicodeFile(path string) bool {
	readFile, _ := os.Open(path)
	fileScanner := bufio.NewScanner(readFile)
	fileScanner.Split(bufio.ScanLines)
	fileScanner.Scan()

	return utf8.ValidString(string(fileScanner.Text()))
}
