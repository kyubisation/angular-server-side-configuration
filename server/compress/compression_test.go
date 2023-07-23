package compress

import (
	"ngssc/cli/test"
	"path/filepath"
	"strings"
	"testing"
)

func TestCompressionBrotli(t *testing.T) {
	dir := t.TempDir()
	filePath := filepath.Join(dir, "file.txt.br")
	expected := strings.Repeat("example", 10)
	CompressWithBrotliToFile([]byte(expected), filePath)

	content := test.DecompressBrotliFile(filePath)
	test.AssertEqual(t, string(content), expected, "")
}

func TestCompressionBrotliFast(t *testing.T) {
	expected := strings.Repeat("example", 10)
	content := CompressWithBrotliFast([]byte(expected))

	content = test.DecompressBrotli(content)
	test.AssertEqual(t, string(content), expected, "")
}

func TestCompressionGzip(t *testing.T) {
	dir := t.TempDir()
	filePath := filepath.Join(dir, "file.txt.gz")
	expected := strings.Repeat("example", 10)
	CompressWithGzipToFile([]byte(expected), filePath)

	content := test.DecompressGzipFile(filePath)
	test.AssertEqual(t, string(content), expected, "")
}

func TestCompressionGzipFast(t *testing.T) {
	expected := strings.Repeat("example", 10)
	content := CompressWithGzipFast([]byte(expected))

	content = test.DecompressGzip(content)
	test.AssertEqual(t, string(content), expected, "")
}
