
import prisma from "../config/db.js";
import { redis } from "../config/redis.js";
import { enqueueLowStockNotification } from "../utils/queues/stockQueue.js";

/**
 * Interface untuk data input pembuatan produk baru
 */
export interface CreateProductInput {
  title: string;
  category: string;
  description?: string;
  imageUrl?: string;
  stock: number;
  price: number;
}

/**
 * Interface untuk data input pembaharuan produk
 */
export interface UpdateProductInput {
  title?: string;
  category?: string;
  description?: string;
  imageUrl?: string;
  stock?: number;
  price?: number;
}

// CREATE PRODUCT
export async function createProduct(data: CreateProductInput) {
  const product = await prisma.product.create({
    data: {
      title: data.title,
      category: data.category,
      description: data.description,
      imageUrl: data.imageUrl,
      stock: data.stock,
      price: data.price,
    },
  });

  // Notifikasi jika stok rendah
  if (product.stock <= 5) {
    await enqueueLowStockNotification(
      product.title,
      product.stock,
    );
  }

  // Invalidate Redis cache
  await redis.del("products:all");

  return product;
}

// GET ALL PRODUCTS
export async function getAllProducts() {
  const startTime = performance.now();
  const cacheKey = "products:all";

  // Periksa Redis cache
  const cachedData = await redis.get(cacheKey);

  if (cachedData) {
    const endTime = performance.now();

    return {
      source: "cache (Redis)",
      responseTime: `${(endTime - startTime).toFixed(2)} ms`,
      data: cachedData,
    };
  }

  // Ambil produk dari database
  const products = await prisma.product.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Simpan hasil ke Redis selama 60 detik
  await redis.set(cacheKey, products, {
    ex: 60,
  });

  const endTime = performance.now();

  return {
    source: "database",
    responseTime: `${(endTime - startTime).toFixed(2)} ms`,
    data: products,
  };
}

// GET PRODUCT BY ID
export async function getProductById(id: string) {
  return await prisma.product.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });
}

// UPDATE PRODUCT
export async function updateProduct(
  id: string,
  data: UpdateProductInput,
) {
  const product = await prisma.product.update({
    where: {
      id,
    },
    data,
  });

  // Invalidate Redis cache
  await redis.del("products:all");

  return product;
}

// SOFT DELETE PRODUCT
export async function softDeleteProduct(id: string) {
  const product = await prisma.product.update({
    where: {
      id,
    },
    data: {
      deletedAt: new Date(),
    },
  });

  // Invalidate Redis cache
  await redis.del("products:all");

  return product;
}

// RESTORE PRODUCT
export async function restoreProduct(id: string) {
  const product = await prisma.product.update({
    where: {
      id,
    },
    data: {
      deletedAt: null,
    },
  });

  // Invalidate Redis cache
  await redis.del("products:all");

  return product;
}
