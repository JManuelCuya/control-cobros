FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Compile TypeScript to JavaScript
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Command to run the backend
CMD ["npm", "run", "start"]
