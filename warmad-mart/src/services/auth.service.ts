import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";
import { RegisterInput, LoginInput } from "../interfaces/auth.interface.js";
import { Role } from "../generated/prisma/index.js";

/**
 * Service: Registrasi Customer
 */
export async function registerCustomer(data: RegisterInput) {
  // cek apakah email sudah terdaftar atau belum
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    const error: any = new Error("Email sudah terdaftar");
    error.statusCode = 400;
    throw error;
  }

  // kalau lolos pengecekan, lanjut ke hash password menggunakan bcrypt
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // simpan ke database dengan role CUSTOMER
  const newUser = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      role: Role.CUSTOMER, // dipaksa selalu CUSTOMER
    },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return newUser;
}

/**
 * Service: Login User
 */
export async function loginUser(data: LoginInput) {
  // cek apakah email sudah terdaftar atau belum
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    const error: any = new Error("Email atau password salah");
    error.statusCode = 401;
    throw error;
  }

  // verifikasi password dengan hash di DB
  const isPasswordValid = await bcrypt.compare(data.password, user.password);
  if (!isPasswordValid) {
    const error: any = new Error("Password tidak sesuai");
    error.statusCode = 401;
    throw error;
  }

  // buat jwt access token (standarnya, kita kasih expired 1 hari)
  const secretKey = process.env.JWT_SECRET;
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    secretKey,
    { expiresIn: "1d" },
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
}