# Use the official Node.js image as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps flag
RUN npm install --legacy-peer-deps

# Copy the rest of the application code to the working directory
COPY . .

# Build the Next.js application with type checking disabled for build
ENV NEXT_DISABLE_TYPE_CHECKS=1

# Build with production optimization
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the application using next start
CMD ["npm", "run", "start"] 