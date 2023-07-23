package response

import (
	"ngssc/cli/test"
	"path/filepath"
	"testing"
)

func TestResolvingNotFound(t *testing.T) {
	context := test.NewTestDir(t)
	resolver := CreateEntityResolver(context.Path)
	entity := resolver.Resolve("does-not-exist.txt")
	test.AssertTrue(t, entity.IsNotFound(), "")
}

func TestResolvingNotFoundIndex(t *testing.T) {
	context := test.NewTestDir(t)
	context.CreateDirectory("de").CreateFile("index.html", "content")
	context.CreateDirectory("en").CreateFile("index.html", "content")
	resolver := CreateEntityResolver(context.Path)
	entity := resolver.Resolve("does-not-exist.txt")
	test.AssertTrue(t, entity.IsNotFound(), "")
}

func TestResolvingExistingFile(t *testing.T) {
	context := test.NewTestDir(t)
	context.CreateFile("exist.txt", "example")
	resolver := CreateEntityResolver(context.Path)
	entity := resolver.Resolve("exist.txt")
	test.AssertEqual(t, entity.ContentType, "text/plain; charset=utf-8", "")
	test.AssertEqual(t, entity.Path, filepath.Join(context.Path, "exist.txt"), "")
	test.AssertTrue(t, !entity.IsIndex(), "")
	test.AssertTrue(t, !entity.IsFingerprinted(), "")
	test.AssertTrue(t, !entity.IsNotFound(), "")
	test.AssertTrue(t, !entity.HasBrotli(), "")
	test.AssertTrue(t, !entity.HasGzip(), "")
	test.AssertTrue(t, entity.Compressable, "")
}

func TestResolvingExistingFileMetaInfo(t *testing.T) {
	context := test.NewTestDir(t)
	context.CreateFile("exist.txt", "example")
	resolver := CreateEntityResolver(context.Path)
	entity := resolver.Resolve("exist.txt")
	size, modTime := fileMeta(filepath.Join(context.Path, "exist.txt"))
	test.AssertEqual(t, entity.Size, size, "")
	test.AssertEqual(t, entity.ModTime, modTime, "")
}

func TestResolvingExistingFileWithBrotli(t *testing.T) {
	context := test.NewTestDir(t)
	context.CreateFile("exist.txt", "example")
	context.CreateFile("exist.txt.br", "noop")
	resolver := CreateEntityResolver(context.Path)
	entity := resolver.Resolve("exist.txt")
	test.AssertTrue(t, !entity.IsIndex(), "")
	test.AssertTrue(t, !entity.IsFingerprinted(), "")
	test.AssertTrue(t, !entity.IsNotFound(), "")
	test.AssertTrue(t, entity.HasBrotli(), "")
	test.AssertTrue(t, !entity.HasGzip(), "")
	test.AssertTrue(t, entity.Compressable, "")
}

func TestResolvingExistingFileWithGzip(t *testing.T) {
	context := test.NewTestDir(t)
	context.CreateFile("exist.txt", "example")
	context.CreateFile("exist.txt.gz", "noop")
	resolver := CreateEntityResolver(context.Path)
	entity := resolver.Resolve("exist.txt")
	test.AssertTrue(t, !entity.IsIndex(), "")
	test.AssertTrue(t, !entity.IsFingerprinted(), "")
	test.AssertTrue(t, !entity.IsNotFound(), "")
	test.AssertTrue(t, !entity.HasBrotli(), "")
	test.AssertTrue(t, entity.HasGzip(), "")
	test.AssertTrue(t, entity.Compressable, "")
}

func TestResolvingExistingFileWithBrotliAndGzip(t *testing.T) {
	context := test.NewTestDir(t)
	context.CreateFile("exist.txt", "example")
	context.CreateFile("exist.txt.br", "noop")
	context.CreateFile("exist.txt.gz", "noop")
	resolver := CreateEntityResolver(context.Path)
	entity := resolver.Resolve("exist.txt")
	test.AssertTrue(t, !entity.IsIndex(), "")
	test.AssertTrue(t, !entity.IsFingerprinted(), "")
	test.AssertTrue(t, !entity.IsNotFound(), "")
	test.AssertTrue(t, entity.HasBrotli(), "")
	test.AssertTrue(t, entity.HasGzip(), "")
	test.AssertTrue(t, entity.Compressable, "")
}

func TestResolvingExistingFingerprintedFile(t *testing.T) {
	context := test.NewTestDir(t)
	context.CreateFile("main.676ae13716545088.js", "example")
	resolver := CreateEntityResolver(context.Path)
	entity := resolver.Resolve("main.676ae13716545088.js")
	test.AssertEqual(t, entity.ContentType, "text/javascript; charset=utf-8", "")
	test.AssertTrue(t, entity.IsFingerprinted(), "")
	test.AssertTrue(t, !entity.HasBrotli(), "")
	test.AssertTrue(t, !entity.HasGzip(), "")
	test.AssertTrue(t, entity.Compressable, "")
}

func TestResolvingExistingFingerprintedFileWithBrotli(t *testing.T) {
	context := test.NewTestDir(t)
	context.CreateFile("main.676ae13716545088.js", "example")
	context.CreateFile("main.676ae13716545088.js.br", "noop")
	resolver := CreateEntityResolver(context.Path)
	entity := resolver.Resolve("main.676ae13716545088.js")
	test.AssertTrue(t, entity.IsFingerprinted(), "")
	test.AssertTrue(t, entity.HasBrotli(), "")
	test.AssertTrue(t, !entity.HasGzip(), "")
	test.AssertTrue(t, entity.Compressable, "")
}

func TestResolvingIndex(t *testing.T) {
	context := test.NewTestDir(t)
	context.CreateFile("index.html", "example")
	resolver := CreateEntityResolver(context.Path)
	entity := resolver.Resolve("some/path")
	test.AssertEqual(t, entity.Path, filepath.Join(context.Path, "index.html"), "")
	test.AssertTrue(t, entity.IsIndex(), "")
	test.AssertTrue(t, !entity.HasBrotli(), "")
	test.AssertTrue(t, !entity.HasGzip(), "")
	test.AssertTrue(t, entity.Compressable, "")
}

func TestResolvingMultipleIndex(t *testing.T) {
	context := test.NewTestDir(t)
	context.CreateFile("index.html", "example")
	context.CreateDirectory("nested").CreateFile("index.html", "example2")
	resolver := CreateEntityResolver(context.Path)
	entity := resolver.Resolve("nested/some/path")
	test.AssertEqual(t, entity.Path, filepath.Join(context.Path, "nested/index.html"), "")
	test.AssertTrue(t, entity.IsIndex(), "")
	test.AssertTrue(t, !entity.HasBrotli(), "")
	test.AssertTrue(t, !entity.HasGzip(), "")
	test.AssertTrue(t, entity.Compressable, "")
}

func TestResolvingExistingBinaryFile(t *testing.T) {
	context := test.NewTestDir(t)
	context.CreateFile("exist.exe", "noop")
	resolver := CreateEntityResolver(context.Path)
	entity := resolver.Resolve("exist.exe")
	test.AssertTrue(t, !entity.IsIndex(), "")
	test.AssertTrue(t, !entity.IsFingerprinted(), "")
	test.AssertTrue(t, !entity.IsNotFound(), "")
	test.AssertTrue(t, !entity.Compressable, "")
}

func TestResolvingExistingFileSize(t *testing.T) {
	context := test.NewTestDir(t)
	content := "noop"
	context.CreateFile("exist.txt", content)
	resolver := CreateEntityResolver(context.Path)
	entity := resolver.Resolve("exist.txt")
	test.AssertTrue(t, entity.Size > int64(len(content)-1), "")
	test.AssertTrue(t, !(entity.Size > int64(len(content))), "")
}
