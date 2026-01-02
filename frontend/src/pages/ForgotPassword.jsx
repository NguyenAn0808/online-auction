import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const validate = () => {
    // if (!email) return "Email is required";
    // const re = /^\S+@\S+\.\S+$/;
    // if (!re.test(email)) return "Enter a valid email";
    return null;
  };

  const onSubmit = async (e) => {
    e?.preventDefault();
    setError("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setLoading(true);
    try {
      await api.post("/api/auth/forgot-password", { email });
      setSuccess(true);
      // Store email in sessionStorage instead of URL for better security
      sessionStorage.setItem("resetPasswordEmail", email);
      navigate("/auth/reset-password");
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Request failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-50">
      {/* 1. Full Screen Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          alt="background"
          src="https://images.unsplash.com/photo-1496917756835-20cb06e75b4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1908&q=80"
          className="w-full h-full object-cover"
        />
        {/* Dark overlay to make text readable */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      </div>

      {/* 2. Centered Card Container */}
      <div className="relative z-10 w-full max-w-md p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-white/20">
          <div className="px-8 py-10">
            {/* Logo & Header */}
            <div className="text-center mb-8">
              <Link
                to="/"
                className="text-3xl font-bold text-gray-900 tracking-tight"
              >
                eBid
              </Link>
              <h2 className="mt-4 text-xl font-bold text-gray-800">
                Reset your password
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Enter your email address and we will send you an OTP to reset your password.
              </p>
            </div>

            {/* Success State */}
            {success ? (
              <div className="rounded-lg bg-green-50 p-5 border border-green-100 text-center animate-fade-in">
                <div className="flex justify-center mb-3">
                  <svg
                    className="w-8 h-8 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-green-800">
                  Check your inbox
                </h3>
                <p className="mt-1 text-sm text-green-700">
                  If that email is registered, we've sent a reset OTP.
                </p>
                <div className="mt-6">
                  <Link
                    to="/auth/signin"
                    className="text-sm font-medium text-green-700 hover:text-green-600 underline"
                  >
                    Return to Login
                  </Link>
                </div>
              </div>
            ) : (
              /* Form State */
              <form onSubmit={onSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-lg border-gray-300 bg-gray-50 px-4 py-2.5 text-base text-gray-900 shadow-sm focus:border-midnight-ash focus:ring-midnight-ash sm:text-sm"
                    placeholder="you@example.com"
                  />
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-100">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? "Sending..." : "Send reset link"}
                </button>

                <div className="text-center pt-2">
                  <Link
                    to="/auth/signin"
                    className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center justify-center gap-1 group"
                  >
                    <svg
                      className="w-4 h-4 transition-transform group-hover:-translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Back to Login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
