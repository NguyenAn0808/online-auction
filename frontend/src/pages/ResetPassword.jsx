import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get email from sessionStorage (passed from ForgotPassword page)
  // Fallback to URL param for backward compatibility
  const initialEmail =
    sessionStorage.getItem("resetPasswordEmail") ||
    searchParams.get("email") ||
    "";

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOTP] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const t = searchParams.get("otp") || searchParams.get("t") || "";
    if (t) setOTP(t);

    // Clear the email from sessionStorage when component unmounts
    return () => {
      sessionStorage.removeItem("resetPasswordEmail");
    };
  }, [searchParams]);

  const onSubmit = async (e) => {
    e?.preventDefault();
    setError("");
    if (!email) return setError("Email is required");
    if (!otp) return setError("OTP code is required");
    if (password.length < 6)
      return setError("Password must be at least 6 characters");
    if (password !== confirm) return setError("Passwords do not match");

    setLoading(true);
    try {
      await api.post("/api/auth/reset-password", {
        email,
        otp,
        password,
        newPassword: password,
      });
      setSuccess(true);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Reset failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-50">
      {/* 1. Full Screen Background Image (Same as Forgot Password) */}
      <div className="absolute inset-0 z-0">
        <img
          alt="background"
          src="https://images.unsplash.com/photo-1496917756835-20cb06e75b4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1908&q=80"
          className="w-full h-full object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      </div>

      {/* 2. Centered Card Container */}
      <div className="relative z-10 w-full max-w-md p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-white/20">
          <div className="px-8 py-10">
            {/* Header */}
            <div className="text-center mb-8">
              <Link
                to="/"
                className="text-3xl font-bold text-gray-900 tracking-tight hover:opacity-80 transition-opacity"
              >
                eBid
              </Link>
              <h2 className="mt-4 text-xl font-bold text-gray-800">
                Set a new password
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Please enter the OTP sent to <strong>{email}</strong>
              </p>
            </div>

            {!success ? (
              /* Form State */
              <form onSubmit={onSubmit} className="space-y-5" noValidate>
                {/* OTP Field - Made larger and centered */}
                <div>
                  <label
                    htmlFor="otp"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                  >
                    Verification Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOTP(e.target.value)}
                    className="block w-full rounded-lg border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-midnight-ash focus:ring-midnight-ash text-lg tracking-widest font-mono text-center"
                    maxLength={6}
                    autoComplete="off"
                  />
                </div>

                {/* New Password Field - Full width row */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                  >
                    New Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-lg border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-midnight-ash focus:ring-midnight-ash sm:text-sm"
                  />
                </div>

                {/* Confirm Password Field - Full width row */}
                <div>
                  <label
                    htmlFor="confirm"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirm"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="block w-full rounded-lg border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-midnight-ash focus:ring-midnight-ash sm:text-sm"
                  />
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-100 flex items-center gap-2 justify-center">
                    <svg
                      className="w-4 h-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-gray-800 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 transform active:scale-[0.98]"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>
            ) : (
              /* Success State */
              <div className="rounded-lg bg-green-50 p-6 border border-green-100 text-center animate-fade-in">
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-green-100 p-3">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-green-800 mb-2">
                  Password Reset Successful!
                </h3>
                <p className="text-sm text-green-700">
                  Your password has been updated securely.
                </p>
              </div>
            )}

            <div className="text-center pt-6">
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
          </div>
        </div>
      </div>
    </div>
  );
}
