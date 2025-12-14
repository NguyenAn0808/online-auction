import { useState } from "react";
import api, { saveAccessToken, setAuthHeader } from "../services/api";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signin } = useAuth();
  const location = useLocation();
  const validate = () => {
    if (!email) return "Email is required";
    const re = /^\S+@\S+\.\S+$/;
    if (!re.test(email)) return "Enter a valid email";
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return null;
  };

  const from = location.state?.from?.pathname || "/";

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setLoading(true);
    // Use the AuthContext signin to ensure global state updates
    const result = await signin(email, password);

    setLoading(false);

    if (result.success) {
      // Redirect back to the page they came from (e.g., Product Details)
      navigate(from, { replace: true });
    } else {
      setError(result.message || "Signin failed");
    }
  };

  // OAuth redirect helper - explicit mappings
  const oauth = (provider) => {
    const base = import.meta.env.VITE_API_URL || "http://localhost:3000"; // Fallback to local API port if needed
    const map = {
      google: "google",
      github: "github",
      facebook: "facebook",
    };
    const p = map[provider] || provider;
    window.location.href = `${base}/auth/${p}`;
  };

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <Link to="/" className="navbar-logo inline-block text-2xl">
            eBid
          </Link>
          <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-white px-6 py-12 shadow-sm sm:rounded-lg sm:px-12">
            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Password
                </label>
                <div className="mt-2 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-midnight-ash outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-midnight-ash sm:text-sm/6"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label="Toggle password visibility"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-700"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-3 items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="appearance-none rounded-sm border border-gray-300 bg-white checked:border-midnight-ash checked:bg-midnight-ash focus-visible:outline-2 focus-visible:outline-midnight-ash"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <label
                    htmlFor="remember-me"
                    className="block text-sm/6 text-gray-900"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm/6">
                  <Link
                    to="/auth/forgot-password"
                    className="font-semibold text-midnight-ash hover:text-gray-800"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {error && <div className="text-red-600 text-sm">{error}</div>}

              <div>
                <button
                  type="submit"
                  onClick={() => {
                    navigate("/");
                  }}
                  className="flex w-full justify-center rounded-md btn-primary px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </div>
            </form>

            <div>
              <div className="relative mt-10">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 flex items-center"
                >
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm/6 font-medium">
                  <span className="bg-white px-6 text-gray-900">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4">
                <button
                  onClick={() => oauth("google")}
                  className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-midnight-ash ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus-visible:ring-transparent"
                  type="button"
                >
                  <img
                    src="https://www.svgrepo.com/show/355037/google.svg"
                    alt="Google"
                    className=" w-5 h-5"
                  />
                  <span className="flex-1 text-center text-gray-700">
                    Google
                  </span>
                </button>

                <button
                  onClick={() => oauth("github")}
                  className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus-visible:ring-transparent"
                  type="button"
                >
                  <img
                    src="https://www.svgrepo.com/show/448225/github.svg"
                    alt="GitHub"
                    className=" w-5 h-5"
                  />
                  <span className="flex-1 text-center text-gray-700">
                    GitHub
                  </span>
                </button>

                <button
                  onClick={() => oauth("facebook")}
                  className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus-visible:ring-transparent"
                  type="button"
                >
                  <img
                    src="https://www.svgrepo.com/show/448224/facebook.svg"
                    alt="Facebook"
                    className=" w-5 h-5"
                  />
                  <span className="flex-1 text-center text-gray-700">
                    Facebook
                  </span>
                </button>
              </div>
            </div>
          </div>

          <p className="mt-10 text-center text-sm/6 text-gray-500">
            Not a member?{" "}
            <Link
              to="/auth/signup"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
