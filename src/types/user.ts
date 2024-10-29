export interface User {
  id?: string;
  uid: string;
  name: string;
  email: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
  token?: string; // Optional token field for login response
  password: string
}