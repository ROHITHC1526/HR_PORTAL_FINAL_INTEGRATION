export interface User {
  id: number | string;
  name: string;
  email: string;
  role: string;
  created_at?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
  message?: string;
}
