export interface AuthRequest {
  userName: string;
  senha: string;
}

export interface AuthResponse {
  token: string;
}