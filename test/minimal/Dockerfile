FROM nginx:alpine
COPY dist/ngssc_64bit /usr/sbin/ngssc
RUN chmod +x /usr/sbin/ngssc
COPY dist/minimal /usr/share/nginx/html
COPY start.sh start.sh
RUN chmod +x ./start.sh
CMD ["./start.sh"]