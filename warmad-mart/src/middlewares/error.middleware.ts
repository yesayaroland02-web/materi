
import { Request, Response, NextFunction } from "express";
import { Prisma } from "../generated/prisma/client.js";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Tampilkan detail error di Cloudflare Workers Logs
  console.error("========== ERROR DETAIL ==========");
  console.error("URL:", req.originalUrl);
  console.error("METHOD:", req.method);
  console.error("MESSAGE:", err?.message);
  console.error("NAME:", err?.name);
  console.error("STACK:", err?.stack);
  console.error("==================================");

  // Error Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": {
        const targetList = Array.isArray(err.meta?.target)
          ? err.meta.target.join(", ")
          : (err.meta?.target as string) || "Field";

        return res.status(409).json({
          message: `Data dengan ${targetList} tersebut sudah ada / terdaftar.`,
        });
      }

      case "P2025":
        return res.status(404).json({
          message: "Data yang dicari tidak ditemukan.",
        });

      case "P2003":
        return res.status(400).json({
          message: "Relasi data tidak valid atau referensi data tidak ditemukan.",
        });

      default:
        return res.status(400).json({
          message: "Terjadi kesalahan pada permintaan data.",
          code: err.code,
        });
    }
  }

  // Error validasi Prisma
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      message: "Format data yang dikirimkan tidak sesuai.",
    });
  }

  // Error lainnya
  return res.status(500).json({
    message: "Terjadi kesalahan internal pada server.",
  });
}
