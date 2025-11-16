import { useState, useEffect } from "react";
import logo from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";

function ChangePassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    let t;
    if (toastVisible) t = setTimeout(() => setToastVisible(false), 3000);
    return () => clearTimeout(t);
  }, [toastVisible]);

  const validate = () => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (password !== confirm) return "Passwords do not match";
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
      // Placeholder: call API to change password using token in URL
      // await api.post('/auth/change-password', { password, token });
      setToastVisible(true);
      // after success navigate to login
      setTimeout(() => navigate("/auth/login"), 1000);
    } catch (err) {
      setError(err?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-white flex items-center justify-center px-4">
      {/* Logo top-left */}
      <div className="absolute top-6 left-7">
        <img src={logo} alt="ebid" className="h-7 w-auto" />
      </div>

      <div className="w-full max-w-md">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 text-center">
          Create a new password
        </h1>
        <p className="text-sm text-gray-600 text-center mb-6">
          Enter your new password below to secure your account.
        </p>
        <div className="h-4" />
        <form onSubmit={onSubmit} className="w-full space-y-5">
          <div>
            <label htmlFor="password" className="sr-only">
              New password
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full h-12 px-4 text-sm border border-gray-200 rounded-full bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0064d2]"
              placeholder="New password"
            />
          </div>
          <div className="h-4" />
          <div>
            <label htmlFor="confirm" className="sr-only">
              Confirm password
            </label>
            <div className="relative">
              <input
                id="confirm"
                type={showPassword ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="block w-full h-12 px-4 text-sm border border-gray-200 rounded-full bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0064d2]"
                placeholder="Confirm password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-600"
                aria-label="Toggle password visibility"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="h-4" />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0064d2] hover:bg-[#0057b8] text-white font-semibold rounded-full text-base focus:outline-none disabled:opacity-60 h-12"
            style={{ minHeight: 48 }}
          >
            {loading ? "Saving..." : "Continue"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500">
          <Link to="/auth/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
          <span className="text-gray-300">|</span>
          <Link to="/auth/signup" className="text-blue-600 hover:underline">
            Create an account
          </Link>
        </div>

        {/* Toast */}
        {toastVisible && (
          <div className="fixed right-6 top-6 z-50">
            <div className="bg-white px-4 py-2 rounded shadow">
              <span className="text-sm text-gray-800">
                Password updated — redirecting to sign in
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChangePassword;
