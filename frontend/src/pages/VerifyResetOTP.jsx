import { useState } from "react";
import { useToast } from "../context/ToastContext";
import { useLocation, useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo.png";
import api from "../services/api";

function VerifyResetOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const email = location.state?.email || "";
  const expiresIn = location.state?.expiresIn || "10 minutes";

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);

  // Redirect if no email in state
  if (!email) {
    navigate("/auth/forgot-password", { replace: true });
    return null;
  }

  const handleResendOTP = async () => {
    setResending(true);
    setError("");
    try {
      await api.post("/auth/resend-otp", {
        email,
        purpose: "password-reset",
      });
      toast.success("New OTP sent to your email!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
      });

      if (response.data.success) {
        navigate("/auth/reset-success", { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-white flex items-center justify-center px-4">
      <div className="absolute top-6 left-7">
        <img src={logo} alt="ebay" className="h-7 w-auto" />
      </div>

      <div className="w-full max-w-md">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-center">
          Reset your password
        </h1>

        <p className="text-sm text-gray-600 text-center mb-6">
          We've sent a verification code to <strong>{email}</strong>
          <br />
          Code expires in {expiresIn}
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="w-full space-y-4" noValidate>
          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Verification code
            </label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="block w-full h-12 px-4 text-sm border border-gray-200 rounded-full bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0064d2]"
              placeholder="Enter 6-digit code"
              maxLength={6}
              required
            />
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              New password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="block w-full h-12 px-4 text-sm border border-gray-200 rounded-full bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0064d2]"
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-700"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full h-12 px-4 text-sm border border-gray-200 rounded-full bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0064d2]"
              placeholder="Confirm new password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !otp || !newPassword || !confirmPassword}
            className={`w-full h-12 rounded-full font-semibold text-white ${
              loading || !otp || !newPassword || !confirmPassword
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-[#0064d2] hover:bg-[#0057b8]"
            }`}
          >
            {loading ? "Resetting password..." : "Reset password"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={handleResendOTP}
            disabled={resending}
            className="text-sm text-blue-600 hover:underline disabled:text-gray-400"
          >
            {resending ? "Sending..." : "Didn't receive code? Resend"}
          </button>
        </div>

        <div className="flex items-center justify-center my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="px-3 text-sm text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="flex justify-center text-sm text-gray-500 gap-4">
          <Link to="/auth/signup" className="text-blue-600 hover:underline">
            Create an account
          </Link>
          <Link to="/auth/login" className="text-gray-700 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default VerifyResetOTP;
