#!/bin/sh

cd /src

echo "Building for Windows 32-bit"
env GOOS=windows GOARCH=386 go build -ldflags="-s -w -X main.CliVersion=$VERSION" -o /dist/ngssc_32bit.exe main.go
upx --brute /dist/ngssc_32bit.exe

echo "Building for Windows 64-bit"
env GOOS=windows GOARCH=amd64 go build -ldflags="-s -w -X main.CliVersion=$VERSION" -o /dist/ngssc_64bit.exe main.go
upx --brute /dist/ngssc_64bit.exe

echo "Building for Linux 32-bit"
env GOOS=linux GOARCH=386 go build -ldflags="-s -w -X main.CliVersion=$VERSION" -o /dist/ngssc_32bit main.go
upx --brute /dist/ngssc_32bit

echo "Building for Linux 64-bit"
env GOOS=linux GOARCH=amd64 go build -ldflags="-s -w -X main.CliVersion=$VERSION" -o /dist/ngssc_64bit main.go
upx --brute /dist/ngssc_64bit
