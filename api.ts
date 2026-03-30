export const API_URL_ROOT = process.env.NEXT_PUBLIC_API_URL_ROOT || "";

export const API = {
  User : {
    SIGNUP: `${API_URL_ROOT}/auth/signup`,
    SIGNIN: `${API_URL_ROOT}/auth/signin`,
    CREATEOTP: `${API_URL_ROOT}/auth/token/create`,
    VERIFYOTP: `${API_URL_ROOT}/auth/token/verify`,
  }
}