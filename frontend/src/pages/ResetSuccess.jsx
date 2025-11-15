import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function ResetSuccess() {
  return (
    <div className="relative min-h-screen bg-white flex items-center justify-center px-4 py-12">
      {/* Logo top-left */}
      <div className="absolute top-6 left-7">
        <img src={logo} alt="ebid" className="h-7 w-auto" />
      </div>

      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 mx-auto mb-5">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 6L9 17l-5-5"
                stroke="#059669"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Your password has been reset
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            You can now sign in with your new password.
          </p>

          <div className="mt-6">
            <Link
              to="/auth/signin"
              aria-label="Sign in"
              className="w-full inline-flex items-center justify-center h-12 bg-[#0064d2] hover:bg-[#0057b8] text-white hover:text-white font-semibold rounded-full"
              style={{ color: "#fff" }}
            >
              Sign in
            </Link>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            <p>
              Didn't request this change?{" "}
              <Link
                to="/auth/forgot-password"
                className="text-blue-600 font-medium"
              >
                Get help
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
