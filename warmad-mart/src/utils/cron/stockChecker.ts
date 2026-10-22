import cron from "node-cron";
import prisma from "../../config/db.js";
import { lowStockNotification } from "../../services/email.service.js";

export function initStockChecker() {
  cron.schedule(`* * * * *`, async () => {
    console.log("[CRON] Menjalankan pengecekan stock berkala ...");

    try {
      const lowStockProducts = await prisma.product.findMany({
        where: {
          stock: { lte: 5 },
          deletedAt: null,
        },
      });

      if (lowStockProducts.length > 0) {
        console.warn(
          `[CRON] Peringatan: Ada ${lowStockProducts.length} produk dengan stock menipis!`,
        );

        const adminEmail = process.env.EMAIL_USER;
        if (adminEmail) {
          console.log(
            "Mengirim pemberitahuan rekap stok menipis ke email admin ...",
          );

          // Kirim array sekaligus ke service
          await lowStockNotification(lowStockProducts, adminEmail);

          console.log("[CRON] Email rekap stok berhasil dikirim.");
        }
      } else {
        console.log("[CRON] Semua stok produk aman");
      }
    } catch (error) {
      console.error("[CRON] Gagal melakukan pengecekan stock: ", error);
    }
  });

  console.log("Stock Checker Cron Job berhasil diinisialisasi.");
}