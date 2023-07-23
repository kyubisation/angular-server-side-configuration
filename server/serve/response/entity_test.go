package response

import (
	"errors"
	"ngssc/cli/test"
	"ngssc/server/compress"
	"os"
	"path/filepath"
	"testing"
)

const MainFile = "main.676ae13716545088.js"

func TestGettingContent(t *testing.T) {
	context := test.NewTestDir(t)
	context.ImportTestNgsscApp()
	mainContent := context.ReadFile(MainFile)
	resolver := CreateEntityResolver(context.Path)
	entity := resolver.Resolve(MainFile)

	content, readFromDisk, err := entity.Content()
	test.AssertEqual(t, string(content), mainContent, "")
	test.AssertTrue(t, readFromDisk, "")
	test.AssertEqual(t, err, nil, "")

	content, readFromDisk, err = entity.Content()
	test.AssertEqual(t, string(content), mainContent, "")
	test.AssertTrue(t, !readFromDisk, "")
	test.AssertEqual(t, err, nil, "")
}

func TestGettingContentWithNoReadPermission(t *testing.T) {
	context := test.NewTestDir(t)
	context.ImportTestNgsscApp()
	err := os.Chmod(filepath.Join(context.Path, MainFile), 0000)
	if err != nil {
		panic(err)
	}
	resolver := CreateEntityResolver(context.Path)
	entity := resolver.Resolve(MainFile)

	_, _, err = entity.Content()
	test.AssertTrue(t, errors.Is(err, os.ErrPermission), "")

	_, _, err = entity.ContentBrotli()
	test.AssertTrue(t, errors.Is(err, os.ErrPermission), "")

	_, _, err = entity.ContentGzip()
	test.AssertTrue(t, errors.Is(err, os.ErrPermission), "")
}

func TestGettingContentBrotli(t *testing.T) {
	for _, d := range []bool{true, false} {
		context := test.NewTestDir(t)
		context.ImportTestNgsscApp()
		mainContent := context.ReadFile(MainFile)
		if !d {
			compress.CompressWithBrotliToFile([]byte(mainContent), filepath.Join(context.Path, MainFile+".br"))
		}
		resolver := CreateEntityResolver(context.Path)
		entity := resolver.Resolve(MainFile)
		content, readFromDisk, err := entity.ContentBrotli()
		brotliContent := string(test.DecompressBrotli(content))
		test.AssertEqual(t, brotliContent, mainContent, "")
		test.AssertTrue(t, readFromDisk, "")
		test.AssertEqual(t, err, nil, "")

		content, readFromDisk, err = entity.ContentBrotli()
		brotliContent = string(test.DecompressBrotli(content))
		test.AssertEqual(t, brotliContent, mainContent, "")
		test.AssertTrue(t, !readFromDisk, "")
		test.AssertEqual(t, err, nil, "")
	}
}

func TestGettingContentGzip(t *testing.T) {
	for _, d := range []bool{true, false} {
		context := test.NewTestDir(t)
		context.ImportTestNgsscApp()
		mainContent := context.ReadFile(MainFile)
		if !d {
			compress.CompressWithGzipToFile([]byte(mainContent), filepath.Join(context.Path, MainFile+".gz"))
		}
		resolver := CreateEntityResolver(context.Path)
		entity := resolver.Resolve(MainFile)
		content, readFromDisk, err := entity.ContentGzip()
		brotliContent := string(test.DecompressGzip(content))
		test.AssertEqual(t, brotliContent, mainContent, "")
		test.AssertTrue(t, readFromDisk, "")
		test.AssertEqual(t, err, nil, "")

		content, readFromDisk, err = entity.ContentGzip()
		brotliContent = string(test.DecompressGzip(content))
		test.AssertEqual(t, brotliContent, mainContent, "")
		test.AssertTrue(t, !readFromDisk, "")
		test.AssertEqual(t, err, nil, "")
	}
}
