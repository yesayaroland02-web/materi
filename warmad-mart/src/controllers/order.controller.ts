import { Request, Response, NextFunction } from "express";
import * as orderService from "../services/order.service.js";

/**
 * 1. Handler untuk membuat order baru
 */
export async function createOrderHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { items } = req.body;

    const newOrder = await orderService.createOrder({ items });

    return res.status(201).send({
      message: "Order berhasil dibuat.",
      data: newOrder,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 2. Handler untuk memperbarui status order
 */
export async function updateOrderStatusHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // TODO: Ambil `id` dari req.params dan `status` dari req.body
    // TODO: Validasi apakah status sesuai dengan pilihan yang diizinkan ('PENDING', 'PAID', 'CANCELLED', 'COMPLETED')
    // Jika tidak valid, kembalikan status 400
    // TODO: Panggil orderService.updateOrderStatus(id, status)
    // TODO: Kembalikan response JSON status 200 dengan data order yang telah diperbarui
  } catch (error) {
    next(error);
  }
}

/**
 * 3. Handler untuk mengambil detail order berdasarkan ID
 */
export async function getOrderByIdHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // TODO: Ambil `id` dari req.params
    // TODO: Panggil orderService.getOrderById(id)
    // TODO: Jika order tidak ditemukan, kembalikan response status 404
    // Jika ditemukan, kembalikan response JSON status 200 beserta datanya
  } catch (error) {
    next(error);
  }
}

/**
 * 4. Handler untuk mengambil seluruh daftar order
 */
export async function getAllOrdersHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // TODO: Panggil orderService.getAllOrders()
    // TODO: Kembalikan response JSON status 200 beserta daftar orders
  } catch (error) {
    next(error);
  }
}
