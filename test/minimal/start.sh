#!/bin/sh
ngssc insert /usr/share/nginx/html -r
nginx -g 'daemon off;'