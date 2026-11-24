import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
} from "@jest/globals";

// === fungsi mock (tiruan)
const mockProductCreate = jest.fn();
const mockProductFindMany = jest.fn();
const mockRedisGet = jest.fn();
const mockRedisSet = jest.fn();
const mockRedisDel = jest.fn();
const mockEnqueueLowStock = jest.fn();

// mock modul
jest.unstable_mockModule("../src/config/db.js", () => ({
  default: {
    product: {
      create: mockProductCreate,
      findMany: mockProductFindMany,
    },
  },
}));

jest.unstable_mockModule("../src/config/redis.js", () => ({
  redis: {
    get: mockRedisGet,
    set: mockRedisSet,
    del: mockRedisDel,
  },
}));

jest.unstable_mockModule("../src/utils/queues/stockQueue.js", () => ({
  enqueueLowStockNotification: mockEnqueueLowStock,
}));

// import service setelah mock terdaftar
const { createProduct, getAllProducts } =
  await import("../src/services/product.service.js");

describe("Product Service Unit Tests", () => {
  // resetAllMocks supaya mockResolveCalue dari test sebelumnya tidak bocor ke test berikutnya
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("createProduct", () => {
    it("harus berhasil membuat produk dan memicu antrean stok rendah jika stok <= 5", async () => {
      const inputData = {
        title: "Laptop Gaming",
        category: "Electronics",
        stock: 3,
        price: 15000000,
      };

      // mock data yang ada di tabel product
      const mockCreatedProduct = {
        id: "uuid-123",
        ...inputData,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockProductCreate.mockResolvedValue(mockCreatedProduct as never);
      const result = await createProduct(inputData);

      // ekspetasi untuk fitur create product
      expect(mockProductCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({ title: "Laptop Gaming", stock: 3 }),
      });

      // ekspetasi untuk trigger peringatan low stock
      expect(mockEnqueueLowStock).toHaveBeenCalledWith("Laptop Gaming", 3);

      // ekspetasi untuk invalidate cache
      expect(mockRedisDel).toHaveBeenCalledWith("products:all");

      // ekspetasi result yang diharapkan harus sesuai dengan mock data
      expect(result).toEqual(mockCreatedProduct);
    });
  });

  describe("getAllProducts", () => {
    const mockProducts = [
      { id: "uuid-1", title: "Laptop Gaming", stock: 3, price: 15000000 },
      { id: "uuid-2", title: "Mouse", stock: 20, price: 150000 },
    ];

    it("harus mengembalikan data dari cache Redis (cache hit) tanpa menyentuh database", async () => {
      // redis.get mengembalikan data -> berarti cache sudah ada
      mockRedisGet.mockResolvedValue(mockProducts as never);

      // action untuk ambil semua data product
      const result = await getAllProducts();

      // assert
      expect(mockRedisGet).toHaveBeenCalledWith("products:all");
      expect(result.source).toBe("cache (Redis)");
      expect(result.data).toEqual(mockProducts);
      expect(result.responseTime).toMatch(/^\d+(\.\d+)? ms$/);

      // db tidak boleh disentuh & cache tidak perlu ditulis ulang
      expect(mockProductFindMany).not.toHaveBeenCalled();
      expect(mockRedisSet).not.toHaveBeenCalledWith();
    });

    it("harus mengambil dari database lalu menyimpannya ke cache (cache miss)", async () => {
      // cache dalam keadaan kosong (null), DB mengembalikan produk
      mockRedisGet.mockResolvedValue(null as never);
      mockProductFindMany.mockResolvedValue(mockProducts as never);

      // action untuk mengambil dari db
      const result = await getAllProducts();

      // assert
      // 1. query db hanya untuk produk yang belum disoft-delete, urut terbaru
      expect(mockProductFindMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
      });

      // 2. hasil db disimpan ke redis dengan TTL (time to live) 60 detik
      expect(mockRedisSet).toHaveBeenCalledWith("products:all", mockProducts, {
        ex: 60,
      });

      // 3. respons menandakan data dari database
      expect(result.source).toBe("database");
      expect(result.data).toEqual(mockProducts);
      expect(result.responseTime).toMatch(/^\d+(\.\d+)? ms$/);
    });
  });
});