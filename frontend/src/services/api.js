import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  withCredentials: true,
});

const TOKEN_KEY = "accessToken";

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export function saveAccessToken(token, remember = false) {
  try {
    if (remember) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
    }
  } catch {
    // ignore storage errors
  }
  setAuthHeader(token);
}

export function loadAccessToken() {
  try {
    return (
      localStorage.getItem(TOKEN_KEY) ||
      sessionStorage.getItem(TOKEN_KEY) ||
      null
    );
  } catch {
    return null;
  }
}

export function clearAccessToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore storage errors
  }
  setAuthHeader(null);
}

export function setAuthHeader(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

// initialize header from any stored token
const _existing = loadAccessToken();
if (_existing) setAuthHeader(_existing);

// Response interceptor for global error handling (401/403)
// Defined after clearAccessToken to avoid circular dependency
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const errorCode = error.response.data?.code;
      const errorMessage = error.response.data?.message;
      // Handle 401 Unauthorized - Token expired or invalid
      if (status === 401) {
        const isTokenError =
          errorCode === "TOKEN_EXPIRED" ||
          errorCode === "TOKEN_INVALID" ||
          errorCode === "UNAUTHORIZED" ||
          errorMessage?.toLowerCase().includes("token") ||
          errorMessage?.toLowerCase().includes("unauthorized");
        
        // Only redirect if user was actually logged in (had a token)
        // If guest user (no token), let the error propagate normally
        const hadToken = !!localStorage.getItem("access_token");
        
        if (isTokenError && hadToken) {
          clearAccessToken();
          localStorage.removeItem("user");
          if (window.location.pathname !== "/auth/signin") {
            window.location.href = "/auth/signin";
          }
        }
      }

      // Handle 403 Forbidden - User doesn't have permission
      if (status === 403) {
        // Log the error but don't redirect (user might want to see the error message)
        console.error(
          "403 Forbidden: User does not have permission for this action"
        );
      }
    }

    return Promise.reject(error);
  }
);

export default api;
