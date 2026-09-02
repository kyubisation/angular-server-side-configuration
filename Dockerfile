FROM --platform=$BUILDPLATFORM docker.io/library/golang:alpine AS build
RUN apk add --no-cache jq
ADD package.json go.mod go.sum /src/
ADD cli /src/cli
WORKDIR /src/cli
RUN --mount=type=cache,target=/root/.cache/go-build \
  --mount=type=cache,target=/root/go/pkg/mod \
  <<EOF
  version=$(jq -r .version <../package.json)
  export GOOS=$TARGETOS GOARCH=$TARGETARCH
  go build -ldflags="-s -w -X main.CliVersion=$version" -o ngssc
EOF

FROM scratch AS run
COPY --from=build /src/cli/ngssc /usr/bin/ngssc
ENTRYPOINT ["ngssc"]

LABEL org.opencontainers.image.source="https://github.com/kyubisation/angular-server-side-configuration"
LABEL org.opencontainers.image.description="angular-server-side-configuration CLI tool"
