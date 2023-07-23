package compress

import (
	"bytes"
	"compress/gzip"
	"io"
	"os"

	"github.com/andybalholm/brotli"
)

func CompressWithBrotliToFile(content []byte, file string) error {
	compressedContent := CompressWithBrotliBest(content)
	return os.WriteFile(file, compressedContent, 0444)
}

func CompressWithBrotliBest(content []byte) []byte {
	return compress(content, func(buffer *bytes.Buffer) io.WriteCloser {
		return brotli.NewWriterLevel(buffer, brotli.BestCompression)
	})
}

func CompressWithBrotliFast(content []byte) []byte {
	return compress(content, func(buffer *bytes.Buffer) io.WriteCloser {
		// Level 4 recommended for dynamic brotli usage: https://expeditedsecurity.com/blog/nginx-brotli/
		return brotli.NewWriterLevel(buffer, 4)
	})
}

func CompressWithGzipToFile(content []byte, file string) error {
	compressedContent := CompressWithGzipBest(content)
	return os.WriteFile(file, compressedContent, 0444)
}

func CompressWithGzipBest(content []byte) []byte {
	return compress(content, func(buffer *bytes.Buffer) io.WriteCloser {
		writer, _ := gzip.NewWriterLevel(buffer, gzip.BestCompression)
		return writer
	})
}

func CompressWithGzipFast(content []byte) []byte {
	return compress(content, func(buffer *bytes.Buffer) io.WriteCloser {
		writer, _ := gzip.NewWriterLevel(buffer, 4)
		return writer
	})
}

func compress(content []byte, compression func(buffer *bytes.Buffer) io.WriteCloser) []byte {
	var buffer bytes.Buffer
	writer := compression(&buffer)
	writer.Write(content)
	writer.Close()
	return buffer.Bytes()
}
