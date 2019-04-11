#!/bin/sh

cd /src

echo "Building for Windows 32-bit"
env GOOS=windows GOARCH=386 go build -ldflags="-s -w" -o ngssc_${VERSION}_32bit.exe main.go

echo "Building for Windows 64-bit"
env GOOS=windows GOARCH=amd64 go build -ldflags="-s -w" -o ngssc_${VERSION}_64bit.exe main.go

echo "Building for Linux 32-bit"
env GOOS=linux GOARCH=386 go build -ldflags="-s -w" -o ngssc_${VERSION}_32bit main.go

echo "Building for Linux 64-bit"
env GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o ngssc_${VERSION}_64bit main.go
