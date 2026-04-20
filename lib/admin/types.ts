export interface AdminUser {
  userId: string;
  name: string;
  email: string;
  role: "ADMIN";
  avatarUrl?: string | null;
}

export interface AdminSession {
  user: AdminUser;
}

export interface VerifyPayload {
  userId: string;
  email: string;
  role: "ADMIN";
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}
