import { useMutation } from "@tanstack/react-query";
import { login as loginApi, register as registerApi } from "../services/auth";
import type { LoginUserRequest, RegisterUserRequest } from "../types/user";

export function useLoginMutation() {
  return useMutation({
    mutationFn: (credentials: LoginUserRequest) => loginApi(credentials),
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (userData: RegisterUserRequest) => registerApi(userData),
  });
}
