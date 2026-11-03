# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies (Tailwind package)
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG GITHUB_TOKEN
ENV GITHUB_TOKEN=$GITHUB_TOKEN

RUN node build.js

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
