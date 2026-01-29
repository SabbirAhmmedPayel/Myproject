# Use a slim version of Node for a smaller image size
FROM node:20-slim

# Create app directory
WORKDIR /app
# Install app dependencies
# Copying package files first helps with Docker caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Bundle app source
COPY . .

# Expose the port your index.js is listening on
EXPOSE 3000

# Start the application
CMD [ "node", "index.js" ]