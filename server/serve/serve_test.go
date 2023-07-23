package serve

import (
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"ngssc/cli/test"
	"ngssc/server/compress"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/urfave/cli/v2"
)

var Licenses = "3rdpartylicenses.txt"
var Polyfill = "polyfills.93b1b275c1c94b15.js"
var IndexHtml = "index.html"

func TestAction(t *testing.T) {
	timeout := time.After(1 * time.Second)
	done := make(chan bool)
	go func() {
		app := &cli.App{
			Commands: []*cli.Command{
				{
					Name:   "serve",
					Flags:  Flags,
					Action: Action,
				},
			},
		}
		app.Run([]string{"path-to-binary", "serve"})
		done <- true
	}()

	select {
	case <-timeout:
	case <-done:
	}
}

func TestStartingServer(t *testing.T) {
	app, _ := createTestApp(t)
	ts := httptest.NewServer(http.HandlerFunc(app.handleRequest))
	defer ts.Close()
}

func TestFileRequest(t *testing.T) {
	app, context := createTestApp(t)
	content := context.ReadFile(Licenses)

	req := httptest.NewRequest("GET", fmt.Sprintf("/%v", Licenses), nil)
	w := httptest.NewRecorder()
	app.handleRequest(w, req)

	resp := w.Result()
	body, _ := io.ReadAll(resp.Body)

	test.AssertEqual(t, resp.StatusCode, 200, "")
	test.AssertEqual(t, resp.Header.Get("Content-Type"), "text/plain; charset=utf-8", "")
	test.AssertEqual(t, string(body), content, "")
}

func TestFileRequestWithMissingPermission(t *testing.T) {
	app, context := createTestApp(t)
	err := os.Chmod(filepath.Join(context.Path, Licenses), 0000)
	if err != nil {
		t.Error(err)
	}

	req := httptest.NewRequest("GET", fmt.Sprintf("/%v", Licenses), nil)
	w := httptest.NewRecorder()
	app.handleRequest(w, req)

	resp := w.Result()
	body, _ := io.ReadAll(resp.Body)

	test.AssertEqual(t, resp.StatusCode, 500, "")
	test.AssertEqual(t, resp.Header.Get("Content-Type"), "application/json", "")
	test.AssertEqual(t, string(body), "{\"code\": 500, \"status\": \"Internal Server Error\"}", "")
}

func TestFileRequestBrotli(t *testing.T) {
	for _, dynamic := range []bool{true, false} {
		for _, e := range []string{"*", "br", "gz, deflate, br"} {
			app, context := createTestApp(t)
			content := context.ReadFile(Polyfill)
			if !dynamic {
				compress.CompressWithBrotliToFile([]byte(content), filepath.Join(context.Path, Polyfill+".br"))
			}

			req := httptest.NewRequest("GET", fmt.Sprintf("/%v", Polyfill), nil)
			req.Header.Add("Accept-Encoding", e)
			w := httptest.NewRecorder()
			app.handleRequest(w, req)

			resp := w.Result()
			body, _ := io.ReadAll(resp.Body)

			test.AssertEqual(t, resp.StatusCode, 200, "")
			test.AssertEqual(t, resp.Header.Get("Content-Type"), "text/javascript; charset=utf-8", "")
			test.AssertEqual(t, resp.Header.Get("Content-Encoding"), "br", "")
			responseContent := string(test.DecompressBrotli(body))
			test.AssertEqual(t, responseContent, content, "")
		}
	}
}

func TestIndexRequestBrotli(t *testing.T) {
	for _, e := range []string{"*", "br"} {
		app, context := createTestAppWithInit(t, func(_ test.TestDir, params *ServerParams) {
			params.CompressionThreshold = 10
		})
		content := context.ReadFile(IndexHtml)
		parts := strings.Split(content, "<!--CONFIG-->")

		req := httptest.NewRequest("GET", "/", nil)
		req.Header.Add("Accept-Encoding", e)
		w := httptest.NewRecorder()
		app.handleRequest(w, req)

		resp := w.Result()
		body, _ := io.ReadAll(resp.Body)

		test.AssertEqual(t, resp.StatusCode, 200, "")
		test.AssertEqual(t, resp.Header.Get("Content-Type"), "text/html; charset=utf-8", "")
		test.AssertEqual(t, resp.Header.Get("Content-Encoding"), "br", "")
		responseContent := string(test.DecompressBrotli(body))
		test.AssertTrue(t, strings.HasPrefix(responseContent, parts[0]), "")
		test.AssertTrue(t, strings.HasSuffix(responseContent, parts[1]), "")
	}
}

func TestFileRequestGzip(t *testing.T) {
	for _, dynamic := range []bool{true, false} {
		app, context := createTestApp(t)
		content := context.ReadFile(Polyfill)
		if !dynamic {
			compress.CompressWithGzipToFile([]byte(content), filepath.Join(context.Path, Polyfill+".gz"))
		}

		req := httptest.NewRequest("GET", fmt.Sprintf("/%v", Polyfill), nil)
		req.Header.Add("Accept-Encoding", "gzip")
		w := httptest.NewRecorder()
		app.handleRequest(w, req)

		resp := w.Result()
		body, _ := io.ReadAll(resp.Body)

		test.AssertEqual(t, resp.StatusCode, 200, "")
		test.AssertEqual(t, resp.Header.Get("Content-Type"), "text/javascript; charset=utf-8", "")
		test.AssertEqual(t, resp.Header.Get("Content-Encoding"), "gzip", "")
		responseContent := string(test.DecompressGzip(body))
		test.AssertEqual(t, responseContent, content, "")
	}
}

func TestIndexRequestGzip(t *testing.T) {
	app, context := createTestAppWithInit(t, func(_ test.TestDir, params *ServerParams) {
		params.CompressionThreshold = 10
	})
	content := context.ReadFile(IndexHtml)
	parts := strings.Split(content, "<!--CONFIG-->")

	req := httptest.NewRequest("GET", "/", nil)
	req.Header.Add("Accept-Encoding", "gzip")
	w := httptest.NewRecorder()
	app.handleRequest(w, req)

	resp := w.Result()
	body, _ := io.ReadAll(resp.Body)

	test.AssertEqual(t, resp.StatusCode, 200, "")
	test.AssertEqual(t, resp.Header.Get("Content-Type"), "text/html; charset=utf-8", "")
	test.AssertEqual(t, resp.Header.Get("Content-Encoding"), "gzip", "")
	responseContent := string(test.DecompressGzip(body))
	test.AssertTrue(t, strings.HasPrefix(responseContent, parts[0]), "")
	test.AssertTrue(t, strings.HasSuffix(responseContent, parts[1]), "")
}

func TestMultipleIndex(t *testing.T) {
	var expectedIndexContent string
	app, _ := createTestAppWithInit(t, func(context test.TestDir, params *ServerParams) {
		expectedIndexContent = context.ReadFile(IndexHtml)
		expectedIndexContent = strings.ReplaceAll(expectedIndexContent, "<app-root></app-root>", "<app-root><div></div></app-root>")
		context.CreateDirectory("example").CreateFile(IndexHtml, expectedIndexContent)
	})
	parts := strings.Split(expectedIndexContent, "<!--CONFIG-->")

	req := httptest.NewRequest("GET", "/example/path/to/request", nil)
	w := httptest.NewRecorder()
	app.handleRequest(w, req)

	resp := w.Result()
	body, _ := io.ReadAll(resp.Body)

	test.AssertEqual(t, resp.StatusCode, 200, "")
	test.AssertEqual(t, resp.Header.Get("Content-Type"), "text/html; charset=utf-8", "")
	test.AssertTrue(t, strings.HasPrefix(string(body), parts[0]), "")
	test.AssertTrue(t, strings.HasSuffix(string(body), parts[1]), "")
}

func TestNoNgsscJson(t *testing.T) {
	app, _ := createTestAppWithInit(t, func(context test.TestDir, _ *ServerParams) {
		context.RemoveFile("ngssc.json")
	})

	req := httptest.NewRequest("GET", "/", nil)
	w := httptest.NewRecorder()
	app.handleRequest(w, req)

	resp := w.Result()
	body, _ := io.ReadAll(resp.Body)

	test.AssertEqual(t, resp.StatusCode, 200, "")
	test.AssertEqual(t, resp.Header.Get("Content-Type"), "text/html; charset=utf-8", "")
	test.AssertContains(t, string(body), "<!--ngssc--><script>(function(self){Object.assign(self,{});})(window)</script><!--/ngssc-->", "")
}

func TestNotFound(t *testing.T) {
	app, _ := createTestAppWithInit(t, func(context test.TestDir, params *ServerParams) {
		context.RemoveFile(IndexHtml)
	})

	req := httptest.NewRequest("GET", "/example.txt", nil)
	w := httptest.NewRecorder()
	app.handleRequest(w, req)

	resp := w.Result()

	test.AssertEqual(t, resp.StatusCode, 404, "")
}

func TestNonGetRequest(t *testing.T) {
	app, _ := createTestApp(t)

	req := httptest.NewRequest("PUT", "/example.txt", nil)
	w := httptest.NewRecorder()
	app.handleRequest(w, req)

	resp := w.Result()

	test.AssertEqual(t, resp.StatusCode, 405, "")
}

func TestHeadRequest(t *testing.T) {
	app, _ := createTestApp(t)

	req := httptest.NewRequest("HEAD", "/example.txt", nil)
	w := httptest.NewRecorder()
	app.handleRequest(w, req)

	resp := w.Result()
	body, _ := io.ReadAll(resp.Body)

	test.AssertEqual(t, resp.StatusCode, 200, "")
	test.AssertEqual(t, resp.Header.Get("Content-Type"), "text/html; charset=utf-8", "")
	test.AssertEqual(t, string(body), "", "")
}

func TestIndexWithoutCache(t *testing.T) {
	app, context := createTestAppWithInit(t, func(_ test.TestDir, params *ServerParams) {
		params.CacheEnabled = false
	})
	content := context.ReadFile(IndexHtml)
	parts := strings.Split(content, "<!--CONFIG-->")

	req := httptest.NewRequest("GET", "/", nil)
	w := httptest.NewRecorder()
	app.handleRequest(w, req)

	resp := w.Result()
	body, _ := io.ReadAll(resp.Body)

	test.AssertEqual(t, resp.StatusCode, 200, "")
	test.AssertEqual(t, resp.Header.Get("Content-Type"), "text/html; charset=utf-8", "")
	test.AssertTrue(t, strings.HasPrefix(string(body), parts[0]), "")
	test.AssertTrue(t, strings.HasSuffix(string(body), parts[1]), "")
}

func createTestApp(t *testing.T) (App, test.TestDir) {
	return createTestAppWithInit(t, func(context test.TestDir, params *ServerParams) {})
}

func createTestAppWithInit(t *testing.T, init func(context test.TestDir, params *ServerParams)) (App, test.TestDir) {
	context := test.NewTestDir(t)
	context.ImportTestNgsscApp()
	params := &ServerParams{
		WorkingDirectory:     context.Path,
		Port:                 0,
		DotEnvPath:           filepath.Join(context.Path, ".env"),
		CacheControlMaxAge:   31536000,
		CacheEnabled:         true,
		CacheBuffer:          50 * 1024,
		CompressionThreshold: 1024,
		LogLevel:             "ERROR",
		CspTemplate:          "default-src 'self'; style-src 'self' ${NGSSC_CSP_NONCE}; script-src 'self' ${NGSSC_CSP_HASH} ${NGSSC_CSP_NONCE};",
	}
	init(context, params)
	app := createApp(params)
	t.Cleanup(func() {
		app.Close()
	})
	return app, context
}
