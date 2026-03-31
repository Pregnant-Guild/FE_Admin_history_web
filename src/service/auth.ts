import axiosInstance from "@/config/axiosInstance";
import { API } from "../../api";
import api from "@/config/config";

export const apiCreateOTP = async (email : string) => {
  const token_type = 2;
  const response = await fetch(API.Auth.CREATEOTP, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, token_type }),
  });
  return response.json();
};

export const apiVerifyOTP = async (email: string, token: string) => {
  const body = { email, token, token_type: 2 };
  const response = await fetch(API.Auth.VERIFYOTP, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return response.json(); 
};

export const apiSignUp = async (payload: any) => {
  const response = await fetch(API.Auth.SIGNUP, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json();
};

export const apiSignIn = async (payload: any) => {
  const response = await fetch(API.Auth.SIGNIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return response.json();
};

export const apiGetCurrentUser = async () => {
  const response = await fetch(API.User.CURRENT,{
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  return response.json();
};

export interface ApiResponse<T> {
  status: boolean
  data: T
  message?: string
}