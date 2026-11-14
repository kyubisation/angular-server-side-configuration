FROM scratch
ARG TARGETARCH 
COPY dist/cli/ngssc_$TARGETARCH /usr/bin/ngssc
ENTRYPOINT ["ngssc"]