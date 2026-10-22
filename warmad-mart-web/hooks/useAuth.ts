import { useState } from "react";
import { api } from "@/config/axios";
import { AuthPayload, AuthResponse } from "@/interfaces/auth";

export function useAuth() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function register(payload: AuthPayload) {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post<AuthResponse>(
        "/api/auth/register",
        payload,
      );
      return response.data;
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.messagge ||
        "Gagal melakukan registrasi";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function login(payload: AuthPayload) {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post<AuthResponse>("/api/auth/login", payload);
      const data = response.data.data;

      // Simpan token ke localStorage setelah login berhasil
      if (data.token) {
        localStorage.setItem("accessToken", data.token);
      }

      return response.data;
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.messagge ||
        "Gagal melakukan login";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, register, login };
}