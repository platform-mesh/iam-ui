FROM node:24.15.0@sha256:f22d6a1f082c02f292e86929b5b0442ac2e5eaf438a5dea9b1566601c3e05940 AS build

COPY ./ /app

WORKDIR /app
RUN npm ci

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist-ui /usr/share/nginx/html/ui/iam/ui
COPY --from=build /app/dist-wc /usr/share/nginx/html/ui/iam/wc
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080
