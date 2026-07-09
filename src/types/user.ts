export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  loginAt: string;
  loginCount: number;
  registeredAt: string;
}
