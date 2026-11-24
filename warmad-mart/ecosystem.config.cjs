module.exports = {
  apps: [
    {
      name: "warmad-mart",
      script: "npm",
      args: "run dev",
      // Mengaktifkan watch agar otomatis restart jika ada perubahan file config (opsional)
      watch: false, 
      env: {
        NODE_ENV: "development"
      },
    },
  ],
};