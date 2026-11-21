FROM node:26.13.0@sha256:438603bbb5cda404b9416f0b5c8026f61501ab911760d861ec28c36b5d675725 AS build

COPY ./ /app

WORKDIR /app
RUN npm ci

RUN npm run build

FROM nginx:alpine-slim@sha256:f45171d36c76a8b2f5ef97108a3a8a2294248a6578a0a180edc2d78f7d2edc26
COPY --from=build /app/dist-ui /usr/share/nginx/html/ui/iam/ui
COPY --from=build /app/dist-wc /usr/share/nginx/html/ui/iam/wc
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080
