#!/bin/sh

cd /src/cli

echo "Building for Windows 32-bit"
env GOOS=windows GOARCH=386 go build -ldflags="-s -w -X main.CliVersion=$VERSION" -o /dist/ngssc_32bit.exe main.go

echo "Building for Windows 64-bit"
env GOOS=windows GOARCH=amd64 go build -ldflags="-s -w -X main.CliVersion=$VERSION" -o /dist/ngssc_64bit.exe main.go

echo "Building for Linux 32-bit"
env GOOS=linux GOARCH=386 go build -ldflags="-s -w -X main.CliVersion=$VERSION" -o /dist/ngssc_32bit main.go

echo "Building for Linux 64-bit"
env GOOS=linux GOARCH=amd64 go build -ldflags="-s -w -X main.CliVersion=$VERSION" -o /dist/ngssc_64bit main.go

echo "Building for Darwin 64-bit"
env GOOS=darwin GOARCH=amd64 go build -ldflags="-s -w -X main.CliVersion=$VERSION" -o /dist/ngssc_darwin_64bit main.go

if [[ -z "$BUILD_UPX" ]]; then
    exit 0
fi

echo "Minify Windows 32 binary"
cp /dist/ngssc_32bit.exe /dist/ngssc_32bit_min.exe
upx --brute /dist/ngssc_32bit_min.exe

echo "Minify Windows 64 binary"
cp /dist/ngssc_64bit.exe /dist/ngssc_64bit_min.exe
upx --brute /dist/ngssc_64bit_min.exe

echo "Minify Linux 32 binary"
cp /dist/ngssc_32bit /dist/ngssc_32bit_min
upx --brute /dist/ngssc_32bit_min

echo "Minify Linux 64 binary"
cp /dist/ngssc_64bit /dist/ngssc_64bit_min
upx --brute /dist/ngssc_64bit_min

echo "Minify Darwin 64 binary"
cp /dist/ngssc_darwin_64bit /dist/ngssc_darwin_64bit_min
upx --brute /dist/ngssc_darwin_64bit_min
