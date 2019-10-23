#!/bin/sh

cd /src

echo "Building for Windows 32-bit"
env GOOS=windows GOARCH=386 go build -ldflags="-s -w -X main.CliVersion=$VERSION" -o /dist/ngssc_32bit.exe main.go
cp /dist/ngssc_32bit.exe /dist/ngssc_uncompressed_32bit.exe
upx --brute /dist/ngssc_32bit.exe

echo "Building for Windows 64-bit"
env GOOS=windows GOARCH=amd64 go build -ldflags="-s -w -X main.CliVersion=$VERSION" -o /dist/ngssc_64bit.exe main.go
cp /dist/ngssc_64bit.exe /dist/ngssc_uncompressed_64bit.exe
upx --brute /dist/ngssc_64bit.exe

echo "Building for Linux 32-bit"
env GOOS=linux GOARCH=386 go build -ldflags="-s -w -X main.CliVersion=$VERSION" -o /dist/ngssc_32bit main.go
cp /dist/ngssc_32bit /dist/ngssc_uncompressed_32bit
upx --brute /dist/ngssc_32bit

echo "Building for Linux 64-bit"
env GOOS=linux GOARCH=amd64 go build -ldflags="-s -w -X main.CliVersion=$VERSION" -o /dist/ngssc_64bit main.go
cp /dist/ngssc_64bit /dist/ngssc_uncompressed_64bit
upx --brute /dist/ngssc_64bit
