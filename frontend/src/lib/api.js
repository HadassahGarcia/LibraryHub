import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("library_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failQueue = [];

function processQueue(error, token) {
  failQueue.forEach((p) => (token ? p.resolve(token) : p.reject(error)));
  failQueue = [];
}

api.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === "object" && "success" in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      const refreshToken = localStorage.getItem("library_refresh_token");
      if (refreshToken) {
        try {
          const res = await axios.post(`${import.meta.env.VITE_API_URL || "/api"}/auth/refresh`, { refreshToken });
          const newToken = res.data?.data?.id_token;
          if (newToken) {
            localStorage.setItem("library_token", newToken);
            const newRefresh = res.data?.data?.refresh_token;
            if (newRefresh) localStorage.setItem("library_refresh_token", newRefresh);
            processQueue(null, newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          localStorage.removeItem("library_token");
          localStorage.removeItem("library_refresh_token");
          localStorage.removeItem("library_user");
          window.location.href = "/login";
        } finally {
          isRefreshing = false;
        }
      }
    }
    const message = error.response?.data?.message || "Ocurrió un error inesperado.";
    return Promise.reject(new Error(message));
  },
);

export default api;
