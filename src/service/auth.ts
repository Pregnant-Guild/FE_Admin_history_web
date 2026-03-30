import { API } from "../../api";

export const apiCreateOTP = async (email : string) => {
  const token_type = 2;
  const response = await fetch(API.User.CREATEOTP, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, token_type }),
  });
  return response.json();
};

export const apiVerifyOTP = async (email: string, token: string) => {
  const body = { email, token, token_type: 2 };
  console.log("Request Body for Verify OTP:", body); // Log body trước khi gửi yêu cầu
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