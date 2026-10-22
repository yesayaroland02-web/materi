# menggunakan base image node 22
FROM node:22-alpine

# menentukan folder utama
WORKDIR /app

# salin file package json
COPY package*.json ./

# install dependensi
RUN npm install --ignore-scripts

# salin seluruh kode project
COPY . .

# generate prisma client agar koneksi ke db siap digunakan
RUN npx prisma generate

# Menyiapkan folder uploads agar bisa dipasangkan volume
RUN mkdir -p /app/uploads

# membuka port server backend
EXPOSE 8000

# menjalankan aplikasi
CMD ["npm", "run", "dev"]