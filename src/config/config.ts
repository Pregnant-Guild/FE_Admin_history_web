import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// Prefer same-origin requests. Next.js will proxy API paths via `next.config.ts` rewrites.
export const baseURL = "/";

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface QueueItem {
  resolve: () => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let queue: QueueItem[] = [];

const processQueue = (error: unknown = null) => {
  queue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve();
  });
  queue = [];
};

const skipRefreshUrls = [
  "/auth/signin",
  "/auth/signup",
  "/auth/logout",
  "/auth/refresh",
  "/auth/forgot-password",
  "/auth/token/create",
  "/auth/token/verify",
];

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const originalRequest = err.config as CustomAxiosRequestConfig;

    const url = originalRequest?.url || "";

    const shouldSkip = skipRefreshUrls?.some((path) =>
      url?.includes(path)
    );

    if (
      err.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !shouldSkip
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({
            resolve: () => resolve(api(originalRequest)),
            reject: (queueErr) => reject(queueErr),
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post("/auth/refresh", {}, { withCredentials: true });

        processQueue(null);

        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr);

        window.location.href = "/auth/signin"

        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);
