FROM node:22.22@sha256:ecabd1cb6956d7acfffe8af6bbfbe2df42362269fd28c227f36367213d0bb777 as build

COPY ./ /app

WORKDIR /app
RUN npm ci

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist-ui /usr/share/nginx/html/ui/iam/ui
COPY --from=build /app/dist-wc /usr/share/nginx/html/ui/iam/wc
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080