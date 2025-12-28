FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000

# Untuk development Next.js
CMD ["npm", "run", "dev"]
