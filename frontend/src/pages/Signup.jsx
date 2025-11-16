import { useState } from "react";
import api, { saveAccessToken, setAuthHeader } from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo.png";
import signupImg from "../assets/react.svg";

function Signup() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("personal");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    if (!firstName) return "First name is required";
    if (!lastName) return "Last name is required";
    if (!email) return "Email is required";
    const re = /^\S+@\S+\.\S+$/;
    if (!re.test(email)) return "Enter a valid email";
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    // at least one letter and one number
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password))
      return "Password must include letters and numbers";
    return null;
  };

  const normalizeApiOrigin = (rawBase) => {
    let apiOrigin = rawBase || "http://localhost:5174";
    try {
      apiOrigin = new URL(rawBase).origin;
    } catch (e) {
      apiOrigin = rawBase.replace(/\/login\/?$/i, "").replace(/\/+$/g, "");
    }
    return apiOrigin;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) return setError(v);
    setLoading(true);
    try {
      const payload = {
        firstName,
        lastName,
        email,
        password,
        accountType: tab,
      };
      // Use central api instance to make the request and leverage interceptor
      const res = await api.post(`/auth/signup`, payload);
      const token = res?.data?.token ?? res?.data?.accessToken ?? null;
      if (token) {
        // Default to remembering new users; change `true` to `false` to use sessionStorage
        saveAccessToken(token, true);
        setAuthHeader(token);
      }
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Signup failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const oauth = (provider) => {
    const rawBase = import.meta.env.VITE_API_URL || "http://localhost:5174";
    const apiOrigin = normalizeApiOrigin(rawBase);
    window.location.href = `${apiOrigin}/auth/${provider}`;
  };

  const isValid = !validate();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      {/* Logo top-left like Login */}
      <div className="absolute top-6 left-7">
        <img src={logo} alt="ebay" className="h-7 w-auto" />
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 items-stretch gap-6 min-h-screen">
        {/* Left column: image (full-height on desktop), hidden on small screens or shown scaled */}
        <div className="hidden md:block">
          <div className="h-full w-full overflow-hidden rounded-l-3xl">
            <img
              src={signupImg}
              alt="signup visual"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* On small screens show image above form */}
        <div className="md:hidden w-full mb-4">
          <div className="w-full h-52 overflow-hidden rounded-xl">
            <img
              src={signupImg}
              alt="signup visual"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Right column: form */}
        <div className="w-full flex items-center">
          <div className="w-full max-w-lg mx-auto">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">
                Create an account
              </h1>
              <div className="text-sm whitespace-nowrap">
                Already have an account?{" "}
                <Link
                  to="/auth/login"
                  className="text-blue-600 hover:underline"
                >
                  Sign in
                </Link>
              </div>
            </div>

            {/* Tab switch */}
            <div className="inline-flex rounded-full bg-gray-100 p-1 mb-6">
              <button
                type="button"
                onClick={() => setTab("personal")}
                className={`px-4 py-1 rounded-full text-sm font-medium ${
                  tab === "personal"
                    ? "bg-white text-gray-900"
                    : "text-gray-700"
                }`}
              >
                Personal
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    First name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full h-11 px-4 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0064d2]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Last name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full h-11 px-4 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0064d2]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-4 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0064d2]"
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
                    className="w-full h-11 px-4 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0064d2]"
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

              <div className="text-xs text-gray-500">
                By creating an account you agree to our{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  User Agreement
                </a>{" "}
                and acknowledge the{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Privacy Notice
                </a>
                .
              </div>

              {error && <div className="text-red-600 text-sm">{error}</div>}

              <button
                type="submit"
                disabled={!isValid || loading}
                className={`w-full rounded-full h-12 text-sm font-semibold ${
                  !isValid || loading
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                {loading
                  ? "Creating account..."
                  : tab === "personal"
                  ? "Create personal account"
                  : "Create personal account"}
              </button>
            </form>

            {/* Divider: or continue with */}
            <div className="flex items-center justify-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-200" />
              <div className="text-sm text-gray-500">or continue with</div>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* OAuth buttons in a row */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => oauth("google")}
                className="flex items-center gap-3 px-4 py-2 border border-gray-200 rounded-full text-sm w-full justify-center"
              >
                <img
                  src="https://www.svgrepo.com/show/355037/google.svg"
                  alt="Google"
                  className="w-5 h-5 ml-1"
                />
                <span className="font-semibold">Google</span>
              </button>

              <button
                onClick={() => oauth("facebook")}
                className="flex items-center gap-3 px-4 py-2 border border-gray-200 rounded-full text-sm w-full justify-center"
              >
                <img
                  src="https://www.svgrepo.com/show/448224/facebook.svg"
                  alt="Facebook"
                  className="w-5 h-5 ml-1"
                />
                <span className="font-semibold">Facebook</span>
              </button>

              <button
                onClick={() => oauth("github")}
                className="flex items-center gap-3 px-4 py-2 border border-gray-200 rounded-full text-sm w-full justify-center"
              >
                <img
                  src="https://www.svgrepo.com/show/448225/github.svg"
                  alt="GitHub"
                  className="w-5 h-5 ml-1"
                />
                <span className="font-semibold">GitHub</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
