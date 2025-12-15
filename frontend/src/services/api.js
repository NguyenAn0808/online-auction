import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  timeout: 10000,
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
  } catch (e) {
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
  } catch (e) {
    return null;
  }
}

export function clearAccessToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  } catch (e) {}
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

export default api;
