FROM node:20-alpine AS base

WORKDIR /app

# Copy package descriptors (package-lock.json is optional on initial run)
COPY package.json package-lock.json* ./

# Install packages inside container environment
RUN npm install

# Copy application source
COPY . .

# --- Production Build & Serve ---
FROM base AS builder
RUN npm run build

FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html

RUN echo $'server {\n\
    listen 80;\n\
    location / {\n\
        root /usr/share/nginx/html;\n\
        index index.html index.htm;\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]