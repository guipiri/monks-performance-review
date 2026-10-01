export interface User {
  id: number;
  name: string;
  email: string;
  position_name?: string;
  created_at?: string;
}

export interface RegisterUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginUserRequest {
  email: string;
  password: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}

