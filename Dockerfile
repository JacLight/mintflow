# Use an official Node.js image
FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose port 3000 (or the port your app uses)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
