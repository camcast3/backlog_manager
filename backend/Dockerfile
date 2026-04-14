FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
EXPOSE 3001
CMD ["sh", "-c", "node src/db/migrate.js && node src/server.js"]
