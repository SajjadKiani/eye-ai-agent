# Use an official Node.js image as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy the local JSON server configuration and DB file into the container
COPY json-server.json /app/json-server.json
COPY db.json /app/db.json

# Expose the port the server will run on
EXPOSE 3000

CMD ["npx", "json-server", "db.json"]
