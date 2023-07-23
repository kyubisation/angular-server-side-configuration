package constants

var CompressionDefaultThreshold = int64(1024)

// Based on the golang mime type list
var CompressionMimeTypes []string = []string{
	"application/javascript",
	"application/json",
	"application/rss+xml",
	"application/vnd.ms-fontobject",
	"application/x-font-opentype",
	"application/x-font-truetype",
	"application/x-font-ttf",
	"application/x-javascript",
	"application/xhtml+xml",
	"application/xml",
	"font/eot",
	"font/opentype",
	"font/otf",
	"font/truetype",
	"image/svg+xml",
	"image/vnd.microsoft.icon",
	"image/x-icon",
	"image/x-win-bitmap",
	"text/css",
	"text/css; charset=utf-8",
	"text/html",
	"text/html; charset=utf-8",
	"text/javascript",
	"text/javascript; charset=utf-8",
	"text/plain",
	"text/plain; charset=utf-8",
	"text/xml",
	"text/xml; charset=utf-8",
}

func IsCompressionMimeType(mimeType string) bool {
	for _, m := range CompressionMimeTypes {
		if m == mimeType {
			return true
		}
	}
	return false
}
