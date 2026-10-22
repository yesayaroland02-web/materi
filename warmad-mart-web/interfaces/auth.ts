export interface AuthPayload {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
}

export interface AuthResponse {
  message: string;
  data: {
    token?: string;
    user?: User;
  };
}