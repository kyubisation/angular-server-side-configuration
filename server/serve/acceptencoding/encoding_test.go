package acceptencoding

import (
	"net/http"
	"ngssc/cli/test"
	"testing"
)

func TestAcceptEncodingResolvingStar(t *testing.T) {
	encoding := ResolveAcceptEncoding(createRequest("*"))
	test.AssertTrue(t, encoding.AllowsBrotli(), "")
	test.AssertTrue(t, encoding.AllowsGzip(), "")
	test.AssertTrue(t, !encoding.acceptEncoding.NoCompression(), "")
}

func TestAcceptEncodingResolvingBrotliAndGzip(t *testing.T) {
	encoding := ResolveAcceptEncoding(createRequest("br", "gzip"))
	test.AssertTrue(t, encoding.AllowsBrotli(), "")
	test.AssertTrue(t, encoding.AllowsGzip(), "")
}

func TestAcceptEncodingResolvingBrotli(t *testing.T) {
	encoding := ResolveAcceptEncoding(createRequest("br"))
	test.AssertTrue(t, encoding.AllowsBrotli(), "")
	test.AssertTrue(t, !encoding.AllowsGzip(), "")
}

func TestAcceptEncodingResolvingGzip(t *testing.T) {
	encoding := ResolveAcceptEncoding(createRequest("gzip"))
	test.AssertTrue(t, !encoding.AllowsBrotli(), "")
	test.AssertTrue(t, encoding.AllowsGzip(), "")
}

func TestAcceptEncodingResolvingNothing(t *testing.T) {
	encoding := ResolveAcceptEncoding(createRequest())
	test.AssertTrue(t, !encoding.AllowsBrotli(), "")
	test.AssertTrue(t, !encoding.AllowsGzip(), "")
}

func TestAcceptEncodingResolvingUnsupportedDeflate(t *testing.T) {
	encoding := ResolveAcceptEncoding(createRequest("deflate"))
	test.AssertTrue(t, !encoding.AllowsBrotli(), "")
	test.AssertTrue(t, !encoding.AllowsGzip(), "")
}

func createRequest(acceptEncoding ...string) *http.Request {
	var acceptEncodingHeader []string
	acceptEncodingHeader = append(acceptEncodingHeader, acceptEncoding...)
	header := make(map[string][]string, 1)
	header["Accept-Encoding"] = acceptEncodingHeader
	return &http.Request{
		Header: header,
	}
}
