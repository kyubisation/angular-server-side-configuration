FROM golang:alpine
COPY . /src
RUN apk add upx
RUN apk add git

ENTRYPOINT [ "/src/build.sh" ]
