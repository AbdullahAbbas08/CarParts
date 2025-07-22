# ============================
# Build stage
# ============================
FROM node:20-alpine AS build

# Create app directory
WORKDIR /app

# Copy only package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies (use ci for clean, reproducible builds)
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the Angular app in production mode
RUN npm run build -- --configuration production
# أو لو معرف script مخصص: npm run build

# ============================
# Production NGINX stage
# ============================
FROM nginx:alpine

# Copy built files from build stage to NGINX html folder
COPY --from=build /app/dist/fokkerah-client /usr/share/nginx/html

# Optional: Replace default NGINX config if needed
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start NGINX server
CMD ["nginx", "-g", "daemon off;"]
