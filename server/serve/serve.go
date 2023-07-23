package serve

import (
	"bytes"
	"crypto/rand"
	"fmt"
	mathrand "math/rand"
	"net/http"
	"ngssc/cli/insert"
	"ngssc/cli/ngsscjson"
	"ngssc/server/compress"
	"ngssc/server/constants"
	"ngssc/server/serve/acceptencoding"
	"ngssc/server/serve/dotenv"
	"ngssc/server/serve/response"
	"os"
	"path/filepath"
	"strings"
	"time"

	lru "github.com/hashicorp/golang-lru/v2"
	"github.com/urfave/cli/v2"
	"golang.org/x/exp/slog"
)

var Flags = []cli.Flag{
	&cli.IntFlag{
		EnvVars: []string{"_PORT"},
		Name:    "port",
		Aliases: []string{"p"},
		Value:   8080,
	},
	&cli.Int64Flag{
		EnvVars: []string{"_CACHE_CONTROL_MAX_AGE"},
		Name:    "cache-control-max-age",
		Value:   60 * 60 * 24 * 365,
	},
	&cli.BoolFlag{
		EnvVars: []string{"_CACHE"},
		Name:    "cache",
		Value:   true,
	},
	&cli.IntFlag{
		EnvVars: []string{"_CACHE_BUFFER"},
		Name:    "cache-buffer",
		Value:   50 * 1024,
	},
	&cli.Int64Flag{
		EnvVars: []string{"_COMPRESSION_THRESHOLD"},
		Name:    "compression-threshold",
		Value:   constants.CompressionDefaultThreshold,
	},
	&cli.StringFlag{
		EnvVars: []string{"_LOG_LEVEL"},
		Name:    "log-level",
		Aliases: []string{"l"},
		Value:   "INFO",
	},
	&cli.StringFlag{
		EnvVars: []string{"_LOG_FORMAT"},
		Name:    "log-format",
		Value:   "text",
	},
	&cli.PathFlag{
		EnvVars: []string{"_DOTENV_PATH"},
		Name:    "dotenv-path",
		Value:   "/config/.env",
	},
	&cli.StringFlag{
		EnvVars: []string{"_CSP_TEMPLATE"},
		Name:    "csp-template",
		Value:   "default-src 'self'; style-src 'self' ${NGSSC_CSP_NONCE}; script-src 'self' ${NGSSC_CSP_HASH} ${NGSSC_CSP_NONCE};",
	},
}

type ServerParams struct {
	WorkingDirectory     string
	Port                 int
	DotEnvPath           string
	CacheControlMaxAge   int64
	CacheEnabled         bool
	CacheBuffer          int
	CompressionThreshold int64
	LogLevel             string
	LogFormat            string
	CspTemplate          string
}

type ResolveEntity func(path string) response.ResponseEntity
type UpdateEntityCache func(path string, entity response.ResponseEntity)

type App struct {
	params            *ServerParams
	resolveEntity     ResolveEntity
	updateEntityCache UpdateEntityCache
	ngsscConfig       ngsscjson.NgsscConfig
	env               dotenv.DotEnv
}

func Action(c *cli.Context) error {
	params := parseServerParams(c)

	// Configure slog logger
	var handler slog.Handler
	level := slog.LevelInfo
	err := level.UnmarshalText([]byte(params.LogLevel))
	handlerOptions := &slog.HandlerOptions{Level: level}
	if params.LogFormat == "json" {
		handler = slog.NewJSONHandler(os.Stdout, handlerOptions)
	} else {
		handler = slog.NewTextHandler(os.Stdout, handlerOptions)
	}
	slog.SetDefault(slog.New(handler))

	if err != nil {
		slog.Warn(fmt.Sprintf("Failed to set log level %v. Resetting to INFO.\n", level))
	}

	app := createApp(params)
	defer app.Close()

	http.HandleFunc("/", app.handleRequest)
	return http.ListenAndServe(fmt.Sprintf(":%v", params.Port), nil)
}

func parseServerParams(c *cli.Context) *ServerParams {
	workingDirectory, err := os.Getwd()
	if err != nil {
		panic(fmt.Sprintf("failed to resolve current working directory: %v", err))
	}

	return &ServerParams{
		WorkingDirectory:     workingDirectory,
		Port:                 c.Int("port"),
		DotEnvPath:           c.Path("dotenv-path"),
		CacheControlMaxAge:   c.Int64("cache-control-max-age"),
		CacheEnabled:         c.Bool("cache"),
		CacheBuffer:          c.Int("cache-buffer"),
		CompressionThreshold: c.Int64("compression-threshold"),
		LogLevel:             c.String("log-level"),
		LogFormat:            c.String("log-format"),
		CspTemplate:          c.String("csp-template"),
	}
}

func createApp(params *ServerParams) App {
	ngsscConfig := tryReadNgsscJson(params)
	resolveEntity, updateEntityCache := createEntityResolver(params)
	return App{
		params:            params,
		resolveEntity:     resolveEntity,
		updateEntityCache: updateEntityCache,
		ngsscConfig:       ngsscConfig,
		env: dotenv.Create(params.DotEnvPath, func(envVariables map[string]*string) {
			if len(ngsscConfig.EnvironmentVariables) > 0 {
				ngsscConfig.MergeVariables(envVariables)
			} else {
				ngsscConfig.PopulatedEnvironmentVariables = envVariables
			}
		}),
	}
}

func createEntityResolver(params *ServerParams) (ResolveEntity, UpdateEntityCache) {
	entityResolver := response.CreateEntityResolver(params.WorkingDirectory)
	entityResolverFunc := func(path string) response.ResponseEntity {
		return entityResolver.Resolve(path)
	}
	updateEntityCacheFunc := func(path string, entity response.ResponseEntity) {}
	if params.CacheEnabled {
		cache, err := lru.New2Q[string, response.ResponseEntity](params.CacheBuffer)
		if err != nil {
			slog.Error(fmt.Sprintf("Failed to create cache: %v", err))
		} else {
			entityResolverFunc = func(path string) response.ResponseEntity {
				entity, ok := cache.Get(path)
				if !ok {
					entity = entityResolver.Resolve(path)
					cache.Add(path, entity)
				}
				return entity
			}
			updateEntityCacheFunc = func(path string, entity response.ResponseEntity) {
				cache.Add(path, entity)
			}
		}
	}
	return entityResolverFunc, updateEntityCacheFunc
}

func tryReadNgsscJson(params *ServerParams) ngsscjson.NgsscConfig {
	ngsscjsonPath := filepath.Join(params.WorkingDirectory, "ngssc.json")
	info, err := os.Stat(ngsscjsonPath)
	if err == nil && !info.IsDir() {
		slog.Info(fmt.Sprintf("Detected ngssc.json file at %v. Reading configuration.", ngsscjsonPath))
		ngsscConfig, err := ngsscjson.NgsscJsonConfigFromPath(ngsscjsonPath)
		if err == nil {
			return ngsscConfig
		}
		slog.Warn(fmt.Sprintf("%v, creating default configuration", err))
	}

	return ngsscjson.NgsscConfig{
		FilePath:                      params.WorkingDirectory,
		Variant:                       "global",
		EnvironmentVariables:          make([]string, 0),
		PopulatedEnvironmentVariables: make(map[string]*string),
		FilePattern:                   "**/index.html",
	}
}

func (app *App) Close() {
	app.env.Close()
}

func (app *App) handleRequest(w http.ResponseWriter, r *http.Request) {
	requestIdentity := fmt.Sprintf("%v %v %v", r.Method, r.URL.Path, r.Proto)
	slog.Debug(requestIdentity, "state", "request start")
	if r.Method != "GET" && r.Method != "HEAD" {
		errorResponse(w, requestIdentity, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}

	entity := app.resolveEntity(r.URL.Path)
	if entity.IsNotFound() {
		errorResponse(w, requestIdentity, http.StatusNotFound, "Not Found")
		return
	}

	if entity.IsFingerprinted() {
		w.Header().Set("Cache-Control", fmt.Sprintf("max-age=%d", app.params.CacheControlMaxAge))
	} else {
		w.Header().Set("Cache-Control", "no-store")
	}

	if entity.ContentType != "" {
		w.Header().Set("Content-Type", entity.ContentType)
	}

	var encoding acceptencoding.Encoding = acceptencoding.NO_COMPRESSION
	if app.params.CompressionThreshold <= entity.Size && entity.Compressable {
		slog.Debug(
			requestIdentity,
			"state",
			fmt.Sprintf(
				"compression possible (threshold %v <= size %v && compressable=%v)",
				app.params.CompressionThreshold,
				entity.Size,
				entity.Compressable))
		acceptedEncoding := acceptencoding.ResolveAcceptEncoding(r)
		if acceptedEncoding.AllowsBrotli() {
			slog.Debug(requestIdentity, "state", "compression with brotli")
			w.Header().Set("Content-Encoding", "br")
			encoding = acceptencoding.BROTLI
		} else if acceptedEncoding.AllowsGzip() {
			slog.Debug(requestIdentity, "state", "compression with gzip")
			w.Header().Set("Content-Encoding", "gzip")
			encoding = acceptencoding.GZIP
		}
	} else {
		slog.Debug(
			requestIdentity,
			"state",
			fmt.Sprintf(
				"compression not applicable (threshold %v > size %v || compressable=%v)",
				app.params.CompressionThreshold,
				entity.Size,
				entity.Compressable))
	}

	content, readFromDisk, err := app.resolveResponse(w, entity, encoding)
	if err != nil {
		errorResponse(w, requestIdentity, http.StatusInternalServerError, "Internal Server Error")
		slog.Error(fmt.Sprintf("%v", err))
		return
	} else if readFromDisk {
		app.updateEntityCache(entity.Path, entity)
	}

	http.ServeContent(w, r, entity.Path, entity.ModTime, bytes.NewReader(content))
	slog.Info(requestIdentity, "status", http.StatusOK)
}

func errorResponse(w http.ResponseWriter, requestIdentity string, statusCode int, statusMessage string) {
	slog.Info(requestIdentity, "status", http.StatusInternalServerError)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	w.Write([]byte(fmt.Sprintf(`{"code": %v, "status": "%v"}`, statusCode, statusMessage)))
}

func (app *App) resolveResponse(
	w http.ResponseWriter,
	entity response.ResponseEntity,
	encoding acceptencoding.Encoding,
) ([]byte, bool, error) {
	if entity.IsIndex() {
		return app.renderIndex(w, entity, encoding)
	} else if encoding.ContainsBrotli() {
		return entity.ContentBrotli()
	} else if encoding.ContainsGzip() {
		return entity.ContentGzip()
	} else {
		return entity.Content()
	}
}

func (app *App) renderIndex(
	w http.ResponseWriter,
	entity response.ResponseEntity,
	encoding acceptencoding.Encoding,
) ([]byte, bool, error) {
	cspNonce := ""
	if app.params.CspTemplate != "" {
		cspNonce = generateNonce()
		_, ok := app.ngsscConfig.PopulatedEnvironmentVariables["NGSSC_CSP_NONCE"]
		if ok {
			app.ngsscConfig.PopulatedEnvironmentVariables["NGSSC_CSP_NONCE"] = &cspNonce
		}
		cspValue := app.params.CspTemplate
		cspValue = strings.ReplaceAll(cspValue, "${NGSSC_CSP_HASH}", app.ngsscConfig.GenerateIifeScriptHash(""))
		cspValue = strings.ReplaceAll(cspValue, "${NGSSC_CSP_NONCE}", fmt.Sprintf("'nonce-%v'", cspNonce))
		w.Header().Set("Content-Security-Policy", cspValue)
	}

	byteContent, readFromDisk, err := entity.Content()
	if err != nil {
		return nil, false, err
	} else if readFromDisk {
		app.updateEntityCache(entity.Path, entity)
	}

	content := insert.Apply(byteContent, app.ngsscConfig)
	if cspNonce != "" {
		content = strings.ReplaceAll(content, "${NGSSC_CSP_NONCE}", cspNonce)
	}
	byteContent = []byte(content)
	if err != nil {
		return nil, false, err
	} else if int64(len(content)) < app.params.CompressionThreshold {
		return byteContent, readFromDisk, nil
	} else if encoding.ContainsBrotli() {
		return compress.CompressWithBrotliFast(byteContent), readFromDisk, nil
	} else if encoding.ContainsGzip() {
		return compress.CompressWithGzipFast(byteContent), readFromDisk, nil
	} else {
		return byteContent, readFromDisk, nil
	}
}

const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

var runeCharts = []rune(chars)

func generateNonce() string {
	bytes := make([]byte, 10)

	if _, err := rand.Read(bytes); err != nil {
		slog.Warn("Failed to use secure random to generate CSP nonce. Falling back to insecure variant.")
		localRand := mathrand.New(mathrand.NewSource(time.Now().UnixNano()))
		pick := make([]rune, 10)
		for i := range pick {
			pick[i] = runeCharts[localRand.Intn(len(chars))]
		}

		return string(pick)
	}

	for i, b := range bytes {
		bytes[i] = chars[b%byte(len(chars))]
	}

	return string(bytes)
}
