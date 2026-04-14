# Use the official Node.js image as the base image
FROM node:22-alpine 

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and pnpm-lock.yaml to the container
COPY package.json pnpm-lock.yaml ./

# Install pnpm globally and install dependencies
RUN npm install -g pnpm && pnpm install

# Copy the rest of the application code
COPY . .

# Copy environment file
COPY .env .env

# Generate Prisma client
# RUN npx prisma generate
RUN pnpm prisma generate --schema=app/src/prisma/schema.prisma

# Build the TypeScript code
RUN pnpm build

# Expose the port the backend listens on
EXPOSE 4000

# Start the backend server
CMD ["pnpm", "start"] 