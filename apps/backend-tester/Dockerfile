FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --omit=dev

# Copy source code
COPY . .

# Railway automatically passes environment variables as build args
# We just need to declare them and set them as environment variables
ARG NEXT_PUBLIC_RAILWAY_INTERNAL_URL
ARG NEXT_PUBLIC_RAILWAY_PUBLIC_URL  
ARG NEXT_PUBLIC_LOCAL_URL

# Make them available as environment variables during build
ENV NEXT_PUBLIC_RAILWAY_INTERNAL_URL=$NEXT_PUBLIC_RAILWAY_INTERNAL_URL
ENV NEXT_PUBLIC_RAILWAY_PUBLIC_URL=$NEXT_PUBLIC_RAILWAY_PUBLIC_URL
ENV NEXT_PUBLIC_LOCAL_URL=$NEXT_PUBLIC_LOCAL_URL

# Build the application (environment variables are now available)
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
