export interface User {
  sub: string;
  email: string;
  fullname?: string;
  role?: string;
  exp?: number;
  iat?: number;
}