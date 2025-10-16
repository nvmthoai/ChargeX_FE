export interface User {
  sub: string;
  email: string;
  fullName?: string;
  role?: string;
  exp?: number;
  iat?: number;
}