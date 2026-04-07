export const API_URL_ROOT = process.env.NEXT_PUBLIC_API_URL_ROOT || "";
export const URL_MEDIA = "https://cdn.kain.id.vn/history-app/"
export const HOME_URL = "http://localhost:3000"
export const API = {
  User : {
    CURRENT: `${API_URL_ROOT}/users/current`,
    MEDIA: `${API_URL_ROOT}/users/current/media`,
    Update:  (Id: number | string) => `${API_URL_ROOT}/users/${Id}`,
    CHANGE_PASSWORD: (Id: number | string) => `${API_URL_ROOT}/users/${Id}/password`,
  },
  Media:{
    PRESIGNED: `${API_URL_ROOT}/media/presigned`
  },
  Auth : {
    SIGNUP: `${API_URL_ROOT}/auth/signup`,
    SIGNIN: `${API_URL_ROOT}/auth/signin`,
    CREATEOTP: `${API_URL_ROOT}/auth/token/create`,
    VERIFYOTP: `${API_URL_ROOT}/auth/token/verify`,
    REFRESH: `${API_URL_ROOT}/auth/refresh`,
    GOOGLE_LOGIN: `${API_URL_ROOT}/auth/google/login`
  },
  Admin:{
    GET_LIST_USERS: `${API_URL_ROOT}/users`,
  }
}