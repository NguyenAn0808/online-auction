import { useState } from "react";
import logo from "../assets/logo.png";
import api, { saveAccessToken, setAuthHeader } from "../services/api";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    if (!email) return "Email is required";
    const re = /^\S+@\S+\.\S+$/;
    if (!re.test(email)) return "Enter a valid email";
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setLoading(true);
    try {
      // Use central `api` instance so the refresh interceptor and baseURL are used
      const res = await api.post(`/auth/signin`, { email, password });
      const token = res?.data?.token ?? res?.data?.accessToken ?? null;
      if (token) {
        // Save access token in storage (local or session) and set default header
        saveAccessToken(token, remember);
        setAuthHeader(token);
      }
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const oauth = (provider) => {
    const base = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
    window.location.href = `${base}/auth/${provider}`;
  };

  return (
    <div className="relative min-h-screen bg-white flex items-center justify-center px-4">
      {/* Make logo small positioned top-left with specified spacing */}
      <img src={logo} alt="eBid" className="absolute top-6 left-7 h-7 w-auto" />

      <div className="w-full max-w-md">
        <h1 className="text-8xl sm:text-4xl font-bold text-gray-900 mb-6 text-center">
          Sign in to your account
        </h1>

        {/* Create account bar inside form area */}
        <div className="bg-[#f5f6f7] rounded-md px-4 py-2 mb-4 flex items-center justify-between">
          <span className="text-sm text-gray-700">New to eBid?</span>
          <a
            href="#"
            className="text-sm text-gray-900 border border-gray-300 px-3 py-1 rounded-full bg-white"
          >
            Create account
          </a>
        </div>
        <div className="h-4" />
        <form onSubmit={onSubmit} className="w-full space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email or username
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full h-12 px-4 text-sm border border-gray-200 rounded-full bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0064d2]"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full h-12 px-4 text-sm border border-gray-200 rounded-full bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0064d2]"
              />

              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label="Toggle password visibility"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-700"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex justify-end mt-2">
            <a
              href="/auth/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot password?
            </a>
          </div>
          <div className="h-4" />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0064d2] hover:bg-[#0057b8] text-white font-semibold rounded-full text-base focus:outline-none disabled:opacity-60 h-12 mt-6 mb-6"
            style={{ minHeight: 48 }}
          >
            {loading ? "Signing in..." : "Continue"}
          </button>
        </form>
        <div className="h-4" />
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="px-3 text-sm text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="h-4" />
        <div className="w-full space-y-6">
          <button
            onClick={() => oauth("google")}
            className="w-full px-6 py-3 border border-gray-200 rounded-full bg-white text-sm flex items-center"
          >
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="Google"
              className="ml-3 w-5 h-5"
            />
            <span className="flex-1 text-center text-gray-700">
              Continue with Google
            </span>
          </button>
          <div className="h-4" />
          <button
            onClick={() => oauth("facebook")}
            className="w-full px-6 py-3 border border-gray-200 rounded-full bg-white text-sm flex items-center"
          >
            <img
              src="https://www.svgrepo.com/show/448224/facebook.svg"
              alt="Facebook"
              className="ml-3 w-5 h-5"
            />
            <span className="flex-1 text-center text-gray-700">
              Continue with Facebook
            </span>
          </button>
          <div className="h-4" />
          <button
            onClick={() => oauth("github")}
            className="w-full px-6 py-3 border border-gray-200 rounded-full bg-white text-sm flex items-center"
          >
            <img
              src="https://www.svgrepo.com/show/448225/github.svg"
              alt="GitHub"
              className="ml-3 w-5 h-5"
            />
            <span className="flex-1 text-center text-gray-700">
              Continue with GitHub
            </span>
          </button>
        </div>
        <div className="h-4" />
        <div className="flex items-center gap-3 mt-6">
          <input
            id="staySignedIn"
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-5 w-5 rounded-full border border-gray-300 text-[#0064d2]"
          />
          <label
            htmlFor="staySignedIn"
            className="font-semibold text-sm text-gray-700"
          >
            Stay signed in
          </label>
        </div>
      </div>

      {/* Footer centered at very bottom */}
      <div className="fixed bottom-3 left-0 right-0 flex justify-center pointer-events-none">
        <p className="text-xs text-gray-400">
          © 2025 eBid Inc. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}

export default Login;
