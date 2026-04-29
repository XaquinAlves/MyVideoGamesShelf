FROM node:20-alpine AS build

WORKDIR /frontend

COPY frontend/package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

COPY frontend/ ./
RUN npm run build

FROM nginx:stable

COPY --from=build /frontend/dist /usr/share/nginx/html
