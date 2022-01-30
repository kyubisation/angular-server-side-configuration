#!/bin/sh
ngssc insert /usr/share/nginx/html
ngssc substitute -e --ngssc-path=/usr/share/nginx/html -o=/etc/nginx/conf.d/ /etc/nginx/ngssc-templates/