"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function AuthPage() {
  const router = useRouter();
  const { login, register, loading, error } = useAuth();

  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMsg(null);

    try {
      if (isLogin) {
        await login({ email, password });
        setSuccessMsg("Login berhasil! Mengalihkan...");
        setTimeout(() => {
          router.push("/products"); // Redireksi ke halaman produk
        }, 1000);
      } else {
        await register({ email, password });
        setSuccessMsg("Registrasi berhasil! Silakan login.");
        setIsLogin(true); // Pindah ke tab login
        setPassword("");
      }
    } catch (err) {
      // Error diproses di dalam hook useAuth
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md border border-gray-100">
        {/* Toggle Tab */}
        <div className="flex border-b mb-6">
          <button
            className={`flex-1 pb-3 text-center font-semibold ${
              isLogin
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
            onClick={() => {
              setIsLogin(true);
              setSuccessMsg(null);
            }}
          >
            Login
          </button>
          <button
            className={`flex-1 pb-3 text-center font-semibold ${
              !isLogin
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
            onClick={() => {
              setIsLogin(false);
              setSuccessMsg(null);
            }}
          >
            Register
          </button>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {isLogin ? "Masuk ke Warmad Mart" : "Daftar Akun Customer"}
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          {isLogin
            ? "Masukkan email & password akunmu"
            : "Buat akun baru untuk mulai berbelanja"}
        </p>

        {/* Alert Error / Success */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-200">
            {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="******"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
          >
            {loading ? "Memproses..." : isLogin ? "Masuk" : "Daftar Sekarang"}
          </button>
        </form>
      </div>
    </div>
  );
}