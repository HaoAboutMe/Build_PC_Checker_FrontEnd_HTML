import axios from "axios";

const API_BASE_URL = "http://localhost:8080/identity";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding the bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling token refresh
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Token expired code 1007 (from legacy project logic)
    // Adjust logic if your API returns 401 instead
    const responseData = error.response?.data;
    if (responseData?.code === 1007 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const currentToken = localStorage.getItem("token");
      return new Promise(function (resolve, reject) {
        axios
          .post(`${API_BASE_URL}/auth/refresh`, { token: currentToken })
          .then(({ data }) => {
            if (data.code === 1000 && data.result.token) {
              localStorage.setItem("token", data.result.token);
              apiClient.defaults.headers.common["Authorization"] =
                "Bearer " + data.result.token;
              originalRequest.headers["Authorization"] =
                "Bearer " + data.result.token;
              processQueue(null, data.result.token);
              resolve(apiClient(originalRequest));
            } else {
              throw new Error("Refresh failed");
            }
          })
          .catch((err) => {
            processQueue(err, null);
            localStorage.removeItem("token");
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient;
