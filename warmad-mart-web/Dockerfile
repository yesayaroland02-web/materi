# menggunakan base image Node.js versi 22 yang stabil
FROM node:22-alpine

# menentukan folder utama di dalam container
WORKDIR /app

# salin file konfig dependensi terlebih dahulu agar proses caching optimal
COPY package*.json ./

# install semua package yang dibutuhkan
RUN npm install

# salin seluruh kode project ke dalam container
COPY . .

# build aplikasi Next.js
RUN npm run build

# membuka port bawaan next.js
EXPOSE 3000

# perintah untuk menjalankan aplikasi dalam mode production
CMD ["npm", "start"]