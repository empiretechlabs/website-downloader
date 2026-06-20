# Use official Node LTS image
FROM node:18-alpine

# Working directory inside container
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy the rest of the project
COPY . .

# Expose the app port (change if your app listens on a different one)
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
