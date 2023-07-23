package response

import (
	"ngssc/server/compress"
	"ngssc/server/serve/acceptencoding"
	"os"
	"time"
)

type FileType int

const (
	NOT_FOUND = iota
	FILE
	FINGERPRINTED_FILE
	INDEX
)

type ResponseEntity struct {
	Path          string
	fileType      FileType
	Size          int64
	ModTime       time.Time
	ContentType   string
	Compressable  bool
	encoding      acceptencoding.Encoding
	content       []byte
	contentBrotli []byte
	contentGzip   []byte
}

func (entity ResponseEntity) IsNotFound() bool {
	return entity.fileType == NOT_FOUND
}

func (entity ResponseEntity) IsIndex() bool {
	return entity.fileType == INDEX
}

func (entity ResponseEntity) IsFingerprinted() bool {
	return entity.fileType == FINGERPRINTED_FILE
}

func (entity ResponseEntity) HasBrotli() bool {
	return entity.encoding.ContainsBrotli()
}

func (entity ResponseEntity) HasGzip() bool {
	return entity.encoding.ContainsGzip()
}

func (entity *ResponseEntity) Content() (content []byte, cached bool, err error) {
	if entity.content != nil {
		return entity.content, false, nil
	}

	content, err = os.ReadFile(entity.Path)
	if err != nil {
		return nil, false, err
	}

	entity.content = content
	return entity.content, true, nil
}

func (entity *ResponseEntity) ContentBrotli() (content []byte, readFromDisk bool, err error) {
	if entity.contentBrotli != nil {
		return entity.contentBrotli, false, nil
	}

	if entity.HasBrotli() {
		content, err = os.ReadFile(entity.Path + ".br")
	} else if content, _, err = entity.Content(); err == nil {
		content = compress.CompressWithBrotliFast(content)
	}
	if err != nil {
		return nil, false, err
	}

	entity.contentBrotli = content
	return entity.contentBrotli, true, nil
}

func (entity *ResponseEntity) ContentGzip() (content []byte, readFromDisk bool, err error) {
	if entity.contentGzip != nil {
		return entity.contentGzip, false, nil
	}

	if entity.HasGzip() {
		content, err = os.ReadFile(entity.Path + ".gz")
	} else if content, _, err = entity.Content(); err == nil {
		content = compress.CompressWithGzipFast(content)
	}
	if err != nil {
		return nil, false, err
	}

	entity.contentGzip = content
	return entity.contentGzip, true, nil
}
