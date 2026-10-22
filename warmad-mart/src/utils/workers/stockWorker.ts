import { Request, Response } from "express";
import { lowStockNotification } from "../../services/email.service.js";
import prisma from "../../config/db.js";

import dotenv from "dotenv";

dotenv.config();

export async function handleStockNotification(req: Request, res: Response) {
  try {
    const { title, stock } = req.body;

    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: { lte: stock },
        deletedAt: null,
      },
    });

    console.log(
      "[WORKER] Memproses pengiriman notifikasi email untuk produk: ",
      title,
    );

    const adminEmail = process.env.EMAIL_USER;

    if (!adminEmail) {
      return res.status(400).json({
        message: "EMAIL_USER belum dikonfigurasi di environment variable",
      });
    }

    // konfigurasi email
    await lowStockNotification(lowStockProducts, adminEmail);

    console.log(
      "[WORKER] Email notifikasi berhasil dikirim untuk produk: ",
      title,
    );
  } catch (error) {
    console.error("[WORKER] Gagal mengirim email via worker: ", error);
    return res.status(500).send({
      success: false,
      error: "Internal server error",
    });
  }
}