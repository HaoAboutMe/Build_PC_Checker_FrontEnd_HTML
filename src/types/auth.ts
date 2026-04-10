export interface User {
  id: string;
  username: string;
  email: string;
  firstname?: string;
  lastname?: string;
  dateOfBirth?: string;
  roles?: string[];
}

export interface AuthResponse {
  code: number;
  result: {
    token: string;
    user?: User;
  };
}
