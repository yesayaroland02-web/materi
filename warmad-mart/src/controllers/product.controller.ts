
import { Request, Response, NextFunction } from "express";
import * as productService from "../services/product.service.js";
import prisma from "../config/db.js";

import { uploadToCloudinary } from "../services/cloudinary.service.js";
import { sendNewProductNotification } from "../services/email.service.js";

import { MulterRequest } from "../middlewares/upload.middleware.js";

// CREATE PRODUCT
export async function createProductHandler(
  req: MulterRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { title, category, description } = req.body;

    const stock = Number(req.body.stock);
    const price = Number(req.body.price);

    if (!Number.isFinite(stock) || !Number.isInteger(stock) || stock < 0) {
      return res.status(400).json({
        message: "Stock harus berupa angka bulat dan tidak boleh minus.",
      });
    }

    if (!Number.isFinite(price) || price <= 0) {
      return res.status(400).json({
        message: "Price harus berupa angka lebih besar dari 0.",
      });
    }

    let imageUrl: string | undefined;

    // Upload gambar ke Cloudinary jika file tersedia
    if (req.file) {
      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        "warmad-products",
      );

      imageUrl = uploadResult.secure_url;
    }

    const product = await productService.createProduct({
      title,
      category,
      description,
      imageUrl,
      stock,
      price,
    });

    // Notifikasi email berjalan secara asynchronous
    const adminEmail = process.env.EMAIL_USER;

    if (adminEmail) {
      sendNewProductNotification({
        to: adminEmail,
        productTitle: product.title,
        category: product.category,
        price: Number(product.price),
        stock: product.stock,
        imageUrl: product.imageUrl || undefined,
      }).catch((error) => {
        console.error(
          "Gagal mengirim email notifikasi:",
          error.message,
        );
      });
    }

    return res.status(201).json({
      message: "Produk berhasil dibuat",
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

// GET ALL PRODUCTS
export async function getAllProductsHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const products = await productService.getAllProducts();

    return res.status(200).json({
      source: products.source,
      responseTime: products.responseTime,
      data: products.data,
    });
  } catch (error) {
    next(error);
  }
}

// GET PRODUCT BY ID
export async function getProductByIdHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;

    const product = await productService.getProductById(String(id));

    if (!product) {
      return res.status(404).json({
        message: "Produk tidak ditemukan.",
      });
    }

    return res.status(200).json({
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

// UPDATE PRODUCT
export async function updateProductHandler(
  req: MulterRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;

    const existingProduct = await productService.getProductById(
      String(id),
    );

    if (!existingProduct) {
      return res.status(404).json({
        message: "Produk tidak ditemukan.",
      });
    }

    const updateData: productService.UpdateProductInput = {};

    if (req.body.title !== undefined) {
      updateData.title = req.body.title;
    }

    if (req.body.category !== undefined) {
      updateData.category = req.body.category;
    }

    if (req.body.description !== undefined) {
      updateData.description = req.body.description;
    }

    if (req.body.price !== undefined) {
      const price = Number(req.body.price);

      if (!Number.isFinite(price) || price <= 0) {
        return res.status(400).json({
          message: "Price harus lebih besar dari 0.",
        });
      }

      updateData.price = price;
    }

    if (req.body.stock !== undefined) {
      const stock = Number(req.body.stock);

      if (
        !Number.isFinite(stock) ||
        !Number.isInteger(stock) ||
        stock < 0
      ) {
        return res.status(400).json({
          message: "Stock harus berupa angka bulat dan tidak boleh minus.",
        });
      }

      updateData.stock = stock;
    }

    // Upload gambar baru jika admin memilih file
    if (req.file) {
      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        "warmad-products",
      );

      updateData.imageUrl = uploadResult.secure_url;
    }

    const updatedProduct = await productService.updateProduct(
      String(id),
      updateData,
    );

    return res.status(200).json({
      message: "Produk berhasil diperbarui",
      data: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
}

// SOFT DELETE PRODUCT
export async function deleteProductHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;

    const existingProduct = await productService.getProductById(
      String(id),
    );

    if (!existingProduct) {
      return res.status(404).json({
        message: "Produk tidak ditemukan.",
      });
    }

    await productService.softDeleteProduct(String(id));

    return res.status(200).json({
      message: "Produk berhasil dihapus.",
    });
  } catch (error) {
    next(error);
  }
}

// RESTORE PRODUCT
export async function restoreProductHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;

    const existingProduct = await prisma.product.findFirst({
      where: {
        id: String(id),
      },
    });

    if (!existingProduct) {
      return res.status(404).json({
        message: "Produk tidak ditemukan.",
      });
    }

    await productService.restoreProduct(String(id));

    return res.status(200).json({
      message: "Produk berhasil dikembalikan.",
    });
  } catch (error) {
    next(error);
  }
}
