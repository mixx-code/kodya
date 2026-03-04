FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Menggunakan npm install agar lebih toleran terhadap perubahan lock file
RUN npm install

COPY . .

# Pastikan port sesuai dengan yang kamu gunakan di Kodya
EXPOSE 3000

# Jika ingin running untuk produksi (direkomendasikan di server):
# RUN npm run build
# CMD ["npm", "run", "start"]

# Jika tetap ingin mode development:
CMD ["npm", "run", "dev"]
