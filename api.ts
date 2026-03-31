export const API_URL_ROOT = process.env.NEXT_PUBLIC_API_URL_ROOT || "";

export const API = {
  User : {
    CURRENT: `${API_URL_ROOT}/users/current`
  },
  Auth : {
    SIGNUP: `${API_URL_ROOT}/auth/signup`,
    SIGNIN: `${API_URL_ROOT}/auth/signin`,
    CREATEOTP: `${API_URL_ROOT}/auth/token/create`,
    VERIFYOTP: `${API_URL_ROOT}/auth/token/verify`,
    REFRESH: `${API_URL_ROOT}/auth/refresh`,
    GOOGLE_LOGIN: `${API_URL_ROOT}/auth/google/login`
  }
}