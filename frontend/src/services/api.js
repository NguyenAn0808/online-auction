import axios from "axios";

// Create base axios instance for app API calls
const baseURL = import.meta.env.VITE_API_URL || "/";

const api = axios.create({
  baseURL,
  // We recommend the backend sets HttpOnly refresh tokens in cookies and
  // accepts requests with credentials. Set withCredentials when calling
  // refresh so the browser sends HttpOnly cookies.
  withCredentials: true,
});

// ---------- Token helpers ----------
// Access token storage key. We store the short-lived access token in
// localStorage or sessionStorage depending on user's 'remember me'.
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken"; // only used if backend requires storing it client-side

export function getStoredAccessToken() {
  // Prefer localStorage if present, otherwise fallback to sessionStorage
  return (
    localStorage.getItem(ACCESS_TOKEN_KEY) ||
    sessionStorage.getItem(ACCESS_TOKEN_KEY)
  );
}

export function saveAccessToken(token, remember = true) {
  try {
    if (remember) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
  } catch (e) {
    // Storage may be unavailable in some environments; swallow error
    console.warn("Could not save access token:", e);
  }
}

export function clearAuthTokens() {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    // IMPORTANT: do NOT store refresh tokens in localStorage in production.
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    // If you stored a refresh token (not recommended), remove it as well.
  } catch (e) {
    console.warn("Error clearing auth tokens:", e);
  }
}

export function setAuthHeader(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

// Initialize header from storage on load
const initialToken = getStoredAccessToken();
if (initialToken) setAuthHeader(initialToken);

// ---------- Refresh handling (queue + single refresh) ----------
let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(newToken) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

function redirectToLogin() {
  clearAuthTokens();
  // Redirect user to login page
  window.location.href = "/auth/login";
}

// Make a refresh request (without using the intercepted instance to avoid loops)
function requestRefreshToken() {
  // Use a fresh axios instance for the refresh call so interceptors don't run again
  const refreshClient = axios.create({ baseURL, withCredentials: true });

  // Prefer server-side HttpOnly cookie for refresh token (no body needed). If
  // your backend needs the refresh token in request body and you stored it in
  // localStorage (not recommended), include it here.
  const storedRefresh = localStorage.getItem(REFRESH_TOKEN_KEY);
  const payload = storedRefresh ? { refreshToken: storedRefresh } : {};

  return refreshClient.post("/auth/refresh", payload);
}

// ---------- Response interceptor ----------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { config, response } = error;

    // If there's no response (network error) or this request already tried refresh, reject
    if (!response) return Promise.reject(error);

    // We're interested in 401 Unauthorized responses (expired token)
    const status = response.status;
    const originalRequest = config;

    if (status === 401) {
      // Prevent multiple simultaneous refresh attempts
      if (!isRefreshing) {
        isRefreshing = true;

        return requestRefreshToken()
          .then((res) => {
            // Expect backend to respond with { accessToken: '...' }
            const newAccessToken = res.data?.accessToken;
            if (!newAccessToken) {
              throw new Error("No access token returned by refresh endpoint");
            }

            // Save and set header for subsequent requests
            // NOTE: pass `remember` according to your app's logic; here we use localStorage by default
            saveAccessToken(newAccessToken, true);
            setAuthHeader(newAccessToken);

            isRefreshing = false;
            onRefreshed(newAccessToken);

            // Retry the original request with new token
            originalRequest.headers[
              "Authorization"
            ] = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          })
          .catch((refreshError) => {
            // Refresh failed -> clear tokens and redirect to login
            console.warn("Refresh token invalid or expired:", refreshError);
            isRefreshing = false;
            redirectToLogin();
            return Promise.reject(refreshError);
          });
      }

      // If a refresh call is already in progress, return a promise that resolves
      // once the token is refreshed and then retries the original request.
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((token) => {
          // Update the header and retry
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    // For other statuses, just reject
    return Promise.reject(error);
  }
);

export default api;

// ---------- Usage notes (for maintainers) ----------
/*
Integration steps:

1. Replace direct `axios` imports in your components/services with this module:
   import api from '../services/api';

2. Make requests using `api.get('/path')`, `api.post('/path', data)` etc. The
   Authorization header will be attached automatically when an access token is
   present in storage.

3. Authentication flow:
   - On sign-in, your backend should return an access token (JWT) and set a
     HttpOnly refresh token cookie. Save the access token client-side using
     `saveAccessToken(token, remember)` and call `setAuthHeader(token)` if you
     need immediate header update.
   - The interceptor listens for 401 responses. On 401 it attempts to call
     POST /auth/refresh (with credentials) to get a new access token. If the
     refresh succeeds it updates storage and retries the failed request.
   - If the refresh fails (invalid/expired refresh token) the user is
     redirected to `/auth/login` and tokens are cleared.

Security notes:
 - Prefer HttpOnly cookies for refresh tokens (handled automatically via
   `withCredentials: true`). Avoid storing refresh tokens in localStorage.
 - Access tokens (short-lived) are stored in localStorage/sessionStorage so
   JavaScript can attach them to Authorization headers. Make sure expiry is
   short and rotate tokens frequently.

Concurrency:
 - This implementation queues requests while a refresh is in progress and
   retries them once the new token arrives. That avoids issuing multiple
   simultaneous refresh calls.

*/
