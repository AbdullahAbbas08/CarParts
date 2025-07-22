# Build stage
FROM node:20 AS build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build --prod

# Serve stage
FROM nginx:alpine
COPY --from=build /app/dist/fokkerah-client /usr/share/nginx/html
EXPOSE 80
