import { httpClient } from "../http/client";
import type {
  AuthToken,
  LoginUserRequest,
  RegisterUserRequest,
  User,
} from "../types/user";

export async function login(data: LoginUserRequest): Promise<AuthToken> {
  const response = await httpClient.post<AuthToken>("/auth/login/json", data);
  return response.data;
}

export async function register(data: RegisterUserRequest): Promise<User> {
  const response = await httpClient.post<User>("/auth/register", data);
  return response.data;
}

export async function getMe(): Promise<User> {
  const response = await httpClient.get<User>("/users/me");
  return response.data;
}
