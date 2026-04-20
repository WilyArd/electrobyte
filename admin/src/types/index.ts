export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
}
