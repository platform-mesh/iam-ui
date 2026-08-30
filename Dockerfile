FROM node:24.18.1@sha256:19cd848a0e073d34bd8cd5545a1b6b4d28489b3e3b607366621ced442bd5f6b4 AS build

COPY ./ /app

WORKDIR /app
RUN npm ci

RUN npm run build

FROM nginx:alpine@sha256:8b1e78743a03dbb2c95171cc58639fef29abc8816598e27fb910ed2e621e589a
COPY --from=build /app/dist-ui /usr/share/nginx/html/ui/iam/ui
COPY --from=build /app/dist-wc /usr/share/nginx/html/ui/iam/wc
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080
