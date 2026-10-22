import prisma from "../config/db.js";

export interface OrderItemInput {
  productId: string;
  quantity: number;
  price?: number;
}

export interface CreateOrderInput {
  items: OrderItemInput[];
}

export interface UpdateOrderStatusInput {
  status: "PENDING" | "PAID" | "CANCELLED" | "COMPLETED";
}

/**
 * 1. Membuat Order Baru (Menggunakan Interactive Transaction)
 */
export async function createOrder(data: CreateOrderInput) {
  // gunakan interactive transaction untuk menjamin atomic
  return await prisma.$transaction(async (tx) => {
    let totalAmount: number = 0;
    const orderItemsToCreate: any[] = [];

    for (const item of data.items) {
      // 1. ambil produk dan cek ketersediaan produk
      const product = await tx.product.findFirst({
        where: {
          id: item.productId,
          deletedAt: null,
        },
      });

      if (!product) {
        throw new Error(`Produk dengan ID ${item.productId} tidak ditemukan.`);
      }

      if (product.stock < item.quantity) {
        throw new Error(
          `Stok produk "${product.title}" tidak mencukupi (Tersisa: ${product.stock})`,
        );
      }

      // 2. potong stok produk secara atomik
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });

      // 3. hitung harga item & total amount
      const itemPrice = Number(product.price);
      totalAmount += itemPrice * item.quantity;

      orderItemsToCreate.push({
        productId: item.productId,
        quantity: item.quantity,
        price: Number(product.price),
      });

      // 4. buat record order beserta OrderItems
      const order = await tx.order.create({
        data: {
          totalAmount,
          status: "PENDING",
          items: {
            create: orderItemsToCreate,
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  price: true,
                },
              },
            },
          },
        },
      });
      return order;
    }
  });
}

/**
 * 2. Memperbarui Status Order & Restock jika Dibatalkan
 */
export async function updateOrderStatus(
  orderId: string,
  status: UpdateOrderStatusInput["status"],
) {
  // TODO: Gunakan prisma.$transaction(async (tx) => { ... })
  // Step 1: Cari order berdasarkan orderId beserta items-nya
  // Step 2: Jika status diubah menjadi 'CANCELLED' dan status sebelumnya bukan 'CANCELLED',
  //        kembalikan stok produk (tx.product.update dengan increment)
  // Step 3: Update status order (tx.order.update)

  return null as any; // Temporary return agar controller tidak error
}

/**
 * 3. Mengambil Detail Order Berdasarkan ID
 */
export async function getOrderById(id: string) {
  // TODO: Gunakan prisma.order.findUnique()
  // Ambil detail order beserta items dan informasi dasar produk terkait (id, title, price)

  return null; // Temporary return agar controller tidak error
}

/**
 * 4. Mengambil Semua Daftar Order
 */
export async function getAllOrders() {
  // TODO: Gunakan prisma.order.findMany()
  // Urutkan berdasarkan createdAt secara descending dan include items-nya

  return []; // Temporary return agar controller tidak error
}
