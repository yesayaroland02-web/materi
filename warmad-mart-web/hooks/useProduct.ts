
import { useState, useEffect, useCallback } from "react";
import { api } from "@/config/axios";

import {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
} from "@/interfaces/product";

interface ProductApiResponse {
  message?: string;
  data?: Product | Product[];
  products?: Product[];
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshProducts = useCallback(async () => {
    const response = await api.get<ProductApiResponse | Product[]>(
      "/api/products/",
    );

    const result = response.data;

    const productList = Array.isArray(result)
      ? result
      : Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result?.products)
          ? result.products
          : [];

    setProducts(productList);
  }, []);

  async function getProducts() {
    setLoading(true);
    setError(null);

    try {
      await refreshProducts();
    } catch (err: any) {
      console.error("Gagal mengambil produk:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Gagal mengambil produk",
      );
    } finally {
      setLoading(false);
    }
  }

  // CREATE PRODUCT
  async function createProduct(
    payload: CreateProductPayload,
    imageFile?: File,
  ) {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();

      formData.append("title", payload.title);
      formData.append("category", payload.category);
      formData.append("description", payload.description || "");
      formData.append("price", String(payload.price));
      formData.append("stock", String(payload.stock));

      if (imageFile) {
        formData.append("imageUrl", imageFile);
      }

      const response = await api.post<ProductApiResponse>(
        "/api/products/",
        formData,
      );

      await refreshProducts();

      return response.data.data ?? response.data;
    } catch (err: any) {
      console.error("Gagal menambahkan produk:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Gagal menambahkan produk",
      );

      return null;
    } finally {
      setLoading(false);
    }
  }

  // UPDATE PRODUCT
  async function updateProduct(
    payload: UpdateProductPayload,
    id: string,
    imageFile?: File,
  ) {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();

      if (payload.title !== undefined) {
        formData.append("title", payload.title);
      }

      if (payload.category !== undefined) {
        formData.append("category", payload.category);
      }

      if (payload.description !== undefined) {
        formData.append("description", payload.description);
      }

      if (payload.price !== undefined) {
        formData.append("price", String(payload.price));
      }

      if (payload.stock !== undefined) {
        formData.append("stock", String(payload.stock));
      }

      if (imageFile) {
        formData.append("imageUrl", imageFile);
      }

      const response = await api.put<ProductApiResponse>(
        `/api/products/${id}`,
        formData,
      );

      await refreshProducts();

      return response.data.data ?? response.data;
    } catch (err: any) {
      console.error("Gagal mengubah produk:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Gagal mengubah produk",
      );

      return null;
    } finally {
      setLoading(false);
    }
  }

  // SOFT DELETE
  async function softDelete(id: string) {
    setLoading(true);
    setError(null);

    try {
      const response = await api.delete(
        `/api/products/${id}/soft-delete`,
      );

      await refreshProducts();

      return response.data;
    } catch (err: any) {
      console.error("Gagal menghapus produk:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Gagal menghapus produk",
      );

      return null;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getProducts();
  }, [refreshProducts]);

  return {
    products,
    error,
    loading,
    createProduct,
    updateProduct,
    softDelete,
  };
}
