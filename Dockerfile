# backend/Dockerfile

# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
# This leverages Docker's layer caching
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application's source code
COPY . .

# The app binds to port 3000
EXPOSE 3000

# The command to run the app in development mode
CMD ["npm", "run", "start:dev"]