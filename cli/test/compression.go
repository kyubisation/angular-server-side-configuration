package test

import (
	"bytes"
	"compress/gzip"
	"os"

	"github.com/andybalholm/brotli"
)

func DecompressBrotliFile(filePath string) []byte {
	content, err := os.ReadFile(filePath)
	if err != nil {
		panic(err)
	}

	return DecompressBrotli(content)
}

func DecompressBrotli(content []byte) []byte {
	var buf bytes.Buffer
	buf.ReadFrom(brotli.NewReader(bytes.NewReader(content)))
	return buf.Bytes()
}

func DecompressGzipFile(filePath string) []byte {
	content, err := os.ReadFile(filePath)
	if err != nil {
		panic(err)
	}

	return DecompressGzip(content)
}

func DecompressGzip(content []byte) []byte {
	var buf bytes.Buffer
	gzipReader, err := gzip.NewReader(bytes.NewReader(content))
	if err != nil {
		panic(err)
	}
	buf.ReadFrom(gzipReader)
	return buf.Bytes()
}
