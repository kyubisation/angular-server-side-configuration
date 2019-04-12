FROM golang:alpine
RUN apk add upx
RUN apk add git

COPY . /src
RUN ["chmod", "+x", "/src/build.sh"]

ENTRYPOINT [ "/src/build.sh" ]
