FROM scratch
LABEL org.opencontainers.image.source="https://github.com/kyubisation/angular-server-side-configuration"
LABEL org.opencontainers.image.description="angular-server-side-configuration CLI tool"

ARG TARGETARCH 
COPY dist/cli/ngssc_$TARGETARCH /usr/bin/ngssc
ENTRYPOINT ["ngssc"]