FROM node:20-slim

WORKDIR /app

# Copy package files first to leverage caching
COPY package*.json ./

# Install dependencies cleanly inside the image build
RUN npm install --legacy-peer-deps

# Copy the rest of your app source
COPY . .

EXPOSE 5173
