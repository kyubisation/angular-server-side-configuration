package acceptencoding

import (
	"net/http"
	"strings"
)

type Encoding uint8

const (
	NO_COMPRESSION = 0
	GZIP           = 1 << iota
	BROTLI
)

type AcceptEncoding struct {
	acceptEncoding Encoding
}

func ResolveAcceptEncoding(r *http.Request) AcceptEncoding {
	acceptEncoding := r.Header.Values("Accept-Encoding")
	var resultEncoding Encoding
	for _, entry := range acceptEncoding {
		for _, part := range strings.Split(entry, ",") {
			part = strings.TrimSpace(part)
			if part == "*" {
				return AcceptEncoding{acceptEncoding: BROTLI | GZIP}
			} else if part == "br" {
				resultEncoding = resultEncoding ^ BROTLI
			} else if part == "gzip" {
				resultEncoding = resultEncoding ^ GZIP
			}
		}
	}

	return AcceptEncoding{acceptEncoding: resultEncoding}
}

func (encoding Encoding) ContainsBrotli() bool {
	return encoding&BROTLI != 0
}

func (encoding Encoding) ContainsGzip() bool {
	return encoding&GZIP != 0
}

func (encoding Encoding) NoCompression() bool {
	return encoding == NO_COMPRESSION
}

func (encoding AcceptEncoding) AllowsBrotli() bool {
	return encoding.acceptEncoding.ContainsBrotli()
}

func (encoding AcceptEncoding) AllowsGzip() bool {
	return encoding.acceptEncoding.ContainsGzip()
}
