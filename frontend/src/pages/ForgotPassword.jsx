import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import api from "../services/api";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/forgot-password", { email });
      
      if (response.data.success) {
        // Navigate to verify OTP page with email in state
        navigate("/auth/verify-reset-otp", { 
          state: { email, expiresIn: response.data.data.expiresIn } 
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-white flex items-center justify-center px-4">
      {/* Logo top-left */}
      <div className="absolute top-6 left-7">
        <img src={logo} alt="ebay" className="h-7 w-auto" />
      </div>

      <div className="w-full max-w-md">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-center">
          Reset your password
        </h1>

        <p className="text-sm text-gray-600 text-center mb-6">
          Enter the email address or username associated with your account and
          we'll send you instructions to reset your password.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="w-full space-y-6">
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full h-12 px-4 text-sm border border-gray-200 rounded-full bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0064d2]"
              placeholder="Email address"
              required
            />
          </div>

          <button
            type="submit"
            className={`w-full h-12 rounded-full font-semibold text-white ${
              !email || loading
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-[#0064d2] hover:bg-[#0057b8]"
            }`}
            disabled={!email || loading}
          >
            {loading ? "Sending..." : "Continue"}
          </button>
        </form>

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

export default ForgotPassword;
