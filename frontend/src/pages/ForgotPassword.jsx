import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

function ForgotPassword() {
  const [value, setValue] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    let t;
    if (toastVisible) t = setTimeout(() => setToastVisible(false), 3000);
    return () => clearTimeout(t);
  }, [toastVisible]);

  const onSubmit = (e) => {
    e.preventDefault();
    // No API call by request — show toast only
    setToastVisible(true);
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

        <form onSubmit={onSubmit} className="w-full space-y-6">
          <div>
            <label htmlFor="identifier" className="sr-only">
              Email or username
            </label>
            <input
              id="identifier"
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="block w-full h-12 px-4 text-sm border border-gray-200 rounded-full bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0064d2]"
              placeholder="Email or username"
              required
            />
          </div>

          <button
            type="submit"
            className={`w-full h-12 rounded-full font-semibold text-white ${
              !value
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-[#0064d2] hover:bg-[#0057b8]"
            }`}
            disabled={!value}
          >
            Continue
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

        {/* Toast */}
        {toastVisible && (
          <div className="fixed right-6 top-6 z-50">
            <div className="bg-white px-4 py-2 rounded shadow">
              <span className="text-sm text-gray-800">
                Password reset instructions sent
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
