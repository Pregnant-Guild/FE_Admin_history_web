import { API } from "../../api";

export const apiCreateOTP = async (email : string) => {
  const token_type = 1;
  const response = await fetch(API.User.CREATEOTP, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, token_type }),
  });
  return response.json();
};

export const apiVerifyOTP = async (email: string, otp: string) => {

  const body = { email, otp, token_type: 1 };

  const response = await fetch(API.User.VERIFYOTP, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return response.json(); 
};

export const apiSignUp = async (payload: any) => {
  const response = await fetch(API.User.SIGNUP, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json();
};