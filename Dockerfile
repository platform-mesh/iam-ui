FROM node:22.17 as build

COPY ./ /app

WORKDIR /app
RUN --mount=type=secret,id=github_token NODE_AUTH_TOKEN=$(cat /run/secrets/github_token) npm ci

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist-ui /usr/share/nginx/html/ui
COPY --from=build /app/dist-wc /usr/share/nginx/html/wc
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080