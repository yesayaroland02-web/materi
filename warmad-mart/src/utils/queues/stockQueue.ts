import { qstash } from "../../config/qstash.js";
import dotenv from "dotenv";

dotenv.config();

export async function enqueueLowStockNotification(
  productTitle: string,
  currentStock: number,
) {
  try {
    // mendaftarkan task/tugas ke QStash untuk dikirim ke endpoint internal worker kita
    await qstash.publishJSON({
      url: `${process.env.QUEUE_API}/api/queues/stock-notification`,
      body: {
        title: productTitle,
        stock: currentStock,
        timestamp: new Date().toISOString(),
      },
    });

    console.log(
      "[QUEUE] Berhasil memasukkan notifikasi stok untuk produk: ",
      productTitle,
    );
  } catch (error) {
    console.error("[QUEUE] Gagal memasukkan tugas ke antrean: ", error);
  }
}