
import type { Metadata } from "next";
import { api } from "@/config/axios";
import { Product } from "@/interfaces/product";
import AuthGuard from "@/components/AuthGuard";

export const metadata: Metadata = {
  title: "Katalog Produk Lengkap",
  description:
    "Jelajahi katalog produk lengkap Warmad Mart. Dapatkan Promo",
  keywords: [
    "katalog produk warmad mart",
    "belanja sembako online",
    "kebutuhan rumah tangga",
    "harga sembako murah",
    "diskon produk harian",
  ],
  openGraph: {
    title: "Katalog Produk Lengkap | Warmad Mart",
    description:
      "Jelajahi katalog produk lengkap Warmad Mart. Dapatkan Promo.",
    url: "/products",
    siteName: "Warmad Mart",
    locale: "id-ID",
    type: "website",
    images: [
      {
        url: "/comp_logo.jpg",
        width: 1200,
        height: 630,
        alt: "Katalog Produk Warmad Mart",
      },
    ],
  },
};

// Mengambil produk dari backend



async function getProducts(): Promise<Product[]> {
  try {
    const baseURL =
      process.env.WARMAD_INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_WARMAD_PROD_URL ||
      "http://localhost:8000";

    const response = await fetch(
      `${baseURL}/api/products/`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      console.error(
        "API produk gagal:",
        response.status,
        await response.text(),
      );
      return [];
    }

    const result = await response.json();

    console.log("Respons API produk:", result);

    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.data)) return result.data;
    if (Array.isArray(result?.products)) return result.products;

    console.error("Format respons tidak dikenali:", result);
    return [];
  } catch (error) {
    console.error("Gagal mengambil data produk:", error);
    return [];
  }
}




export default async function Products() {
  const products = await getProducts();

  return (
    <AuthGuard>
      <main className="min-h-screen bg-gray-50 px-5 py-10">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-gray-800">
              Katalog Warmad Mart
            </h1>

            <p className="text-gray-600">
              Pilih produk favoritmu dan temukan kebutuhan
              sehari-hari di Warmad Mart.
            </p>
          </div>

          {/* Daftar produk */}
          {products.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
              <h2 className="mb-2 text-xl font-semibold text-gray-700">
                Belum ada produk yang tersedia
              </h2>

              <p className="text-sm text-gray-500">
                Silakan kembali lagi nanti.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md transition-shadow duration-200 hover:shadow-lg"
                >
                  {/* Gambar produk */}
                  <div className="h-56 w-full overflow-hidden bg-gray-100">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={`Gambar ${product.title}`}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="40"
                          height="40"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <rect
                            x="3"
                            y="3"
                            width="18"
                            height="18"
                            rx="2"
                          />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="m21 15-5-5L5 21" />
                        </svg>

                        <span className="text-sm">
                          Gambar belum tersedia
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Informasi produk */}
                  <div className="flex flex-1 flex-col p-5">
                    <span className="mb-3 w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                      {product.category}
                    </span>

                    <h2 className="mb-2 line-clamp-2 text-lg font-bold text-gray-800">
                      {product.title}
                    </h2>

                    <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-gray-500">
                      {product.description}
                    </p>

                    {/* Harga dan stok */}
                    <div className="mt-auto border-t border-gray-100 pt-4">
                      <p className="mb-3 text-lg font-bold text-gray-900">
                        Rp{" "}
                        {Number(product.price).toLocaleString(
                          "id-ID",
                        )}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          Stok tersedia
                        </span>

                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            product.stock > 0
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {product.stock > 0
                            ? `${product.stock} unit`
                            : "Stok habis"}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}

