import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// TODO 1: Definisi Interface UserPayload untuk data user di dalam JWT Token
export interface UserPayload {
  id: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
}

// TODO 2: Declaration Merging untuk menambahkan properti `user` pada Express Request
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

/**
 * Middleware 1: Authentication (Cek & Verifikasi Token)
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    // TODO 3: Ambil header 'authorization' & validasi format 'Bearer <token>'
    const authHeader = req.headers.authorization;

    // Hint: Jika tidak ada, return res.status(401)
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).send({
        message: "Akses ditolak. Token tidak ditemukan.",
      });
    }

    // TODO 4: Ekstrak token dari string 'Bearer <token>'
    const token = authHeader.split(" ")[1];
    const secretKey = process.env.JWT_SECRET;

    // TODO 5: Verifikasi token menggunakan jwt.verify() & secretKey
    const decoded = jwt.verify(token, secretKey) as UserPayload;

    // TODO 6: Simpan payload yang di-decode ke req.user, lalu panggil next()
    req.user = decoded;

    next();
  } catch (error) {
    // TODO 7: Tangani error jika token invalid/expired -> return res.status(401)
    return res
      .status(401)
      .send({ message: "Token tidak valid atau kadaluarsa" });
  }
}

/**
 * Middleware 2: Authorization / RBAC (Cek Role User)
 */
export function authorizeRoles(...allowedRoles: Array<"CUSTOMER" | "ADMIN">) {
  return (req: Request, res: Response, next: NextFunction) => {
    // TODO 8: Pastikan req.user sudah ada (sudah lolos middleware authenticate)
    // Hint: Jika belum ada, return res.status(401)
    if (!req.user) {
      return res.status(401).send({ message: "Pengguna belum terautentikasi" });
    }

    // TODO 9: Cek apakah req.user.role termasuk dalam allowedRoles
    // Hint: Gunakan allowedRoles.includes(req.user.role). Jika tidak cocok, return res.status(403)
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).send({
        message:
          "Akses ditolak. Anda tidak memiliki izin untuk mengakses fitur ini.",
      });
    }

    // TODO 10: Jika cocok, panggil next()
    next();
  };
}