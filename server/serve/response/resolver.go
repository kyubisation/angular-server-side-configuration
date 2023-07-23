package response

import (
	"fmt"
	"mime"
	"ngssc/server/constants"
	"ngssc/server/serve/acceptencoding"
	"os"
	"path"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"golang.org/x/exp/slog"
)

type EntityResolver struct {
	root          string
	indexResolver func(filePath string) *string
}

var fingerprintRegex, _ = regexp.Compile("\\.[a-zA-Z0-9]{16,}\\.(js|mjs|css)$")

func CreateEntityResolver(root string) EntityResolver {
	indexHtmlFiles := findIndexHtmlFiles(root)
	indexResolver := func(filePath string) *string {
		return nil
	}
	if len(indexHtmlFiles) == 1 {
		indexHtmlPath := indexHtmlFiles[0]
		indexResolver = func(filePath string) *string {
			return &indexHtmlPath
		}
	} else if len(indexHtmlFiles) > 1 {
		indexResolver = func(filePath string) *string {
			return findFileUpwards(root, filePath, "index.html")
		}
	}
	return EntityResolver{
		root:          root,
		indexResolver: indexResolver,
	}
}

func findIndexHtmlFiles(root string) []string {
	indexHtmlFiles := make([]string, 0)
	err := filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		if err == nil && strings.HasSuffix(path, "/index.html") {
			indexHtmlFiles = append(indexHtmlFiles, path)
		}
		return nil
	})
	if err != nil {
		slog.Error(fmt.Sprintf("Failed to look up index.html files in %v: %v", root, err))
	}

	return indexHtmlFiles
}

func findFileUpwards(root string, filePath string, fileName string) *string {
	resolvedPath := path.Join(root, filePath)

	for {
		indexPath := path.Join(resolvedPath, fileName)
		if fileExists(indexPath) {
			return &indexPath
		}

		rel, _ := filepath.Rel(root, resolvedPath)
		if rel == "." {
			break
		}

		resolvedPath = path.Dir(resolvedPath)
	}

	return nil
}

func (resolver EntityResolver) Resolve(filePath string) ResponseEntity {
	resolvedPath := path.Join(resolver.root, filePath)
	if fileExists(resolvedPath) {
		var category FileType
		category = FILE
		if fingerprintRegex.MatchString(filePath) {
			category = FINGERPRINTED_FILE
		}

		var availableEncoding acceptencoding.Encoding
		if fileExists(resolvedPath + ".br") {
			availableEncoding = availableEncoding ^ acceptencoding.BROTLI
		}
		if fileExists(resolvedPath + ".gz") {
			availableEncoding = availableEncoding ^ acceptencoding.GZIP
		}

		fileSize, modTime := fileMeta(resolvedPath)
		mimeType := mime.TypeByExtension(filepath.Ext(resolvedPath))
		return ResponseEntity{
			Path:         resolvedPath,
			fileType:     category,
			Size:         fileSize,
			ModTime:      modTime,
			ContentType:  mimeType,
			Compressable: !availableEncoding.NoCompression() || constants.IsCompressionMimeType(mimeType),
			encoding:     availableEncoding,
		}
	}

	indexPath := resolver.indexResolver(filePath)
	if indexPath != nil {
		fileSize, modTime := fileMeta(*indexPath)
		return ResponseEntity{
			Path:         *indexPath,
			fileType:     INDEX,
			Size:         fileSize,
			ModTime:      modTime,
			ContentType:  mime.TypeByExtension(filepath.Ext(*indexPath)),
			Compressable: true,
			encoding:     acceptencoding.NO_COMPRESSION,
		}
	}

	return ResponseEntity{fileType: NOT_FOUND}
}

func fileExists(filePath string) bool {
	info, err := os.Stat(filePath)
	return err == nil && !info.IsDir()
}

func fileMeta(filePath string) (size int64, modTime time.Time) {
	info, err := os.Stat(filePath)
	if err != nil {
		return 0, time.Time{}
	}
	return info.Size(), time.Time{}
}
