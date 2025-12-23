import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import api from "../services/api";

export default function Signup() {
  const navigate = useNavigate();

  // Form fields
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [birthdate, setBirthdate] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("form"); // form | otp | done
  const [error, setError] = useState("");
  const [otp, setOtp] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  const siteKey =
    import.meta.env.VITE_RECAPTCHA_SITE_KEY ||
    "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"; // test key

  const verifyOtp = async (email, otp) => {
    return api.post("/api/auth/verify-otp", { email, otp });
  };
  useEffect(() => {
    setError("");
  }, [stage, fullName, email, password, otp]);

  const validateForm = () => {
    if (!username) return "Username is required";
    if (!phone) return "Phone number is required";
    if (!birthdate) return "Birthdate is required";
    if (!fullName) return "Full name is required";
    if (!email) return "Email is required";
    const re = /^\S+@\S+\.\S+$/;
    if (!re.test(email)) return "Enter a valid email";
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (!recaptchaToken) return "Please complete the reCAPTCHA";
    return null;
  };

  const onSubmit = async (e) => {
    e?.preventDefault();
    setError("");
    const v = validateForm();
    if (v) {
      setError(v);
      return;
    }
    setLoading(true);
    try {
      // Send registration to backend (backend should hash password)
      const payload = {
        username,
        password,
        email,
        fullName,
        phone,
        address,
        birthdate,
        recaptchaToken,
      };
      console.log("Signup payload (debug):", {
        username,
        password,
        email,
        fullName,
        phone,
        address,
        birthdate,
        recaptchaToken,
      });
      await api.post("/api/auth/signup", payload);
      // server should send OTP to email — enter OTP stage
      setStage("otp");
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Signup failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOtp = async () => {
    setError("");
    if (!otp) {
      setError("Enter the OTP sent to your email");
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(email, otp);
      setStage("done");
      // small delay to let user read message, then navigate to login
      setTimeout(() => {
        navigate("/auth/signin");
      }, 900);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "OTP verification failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex min-h-screen flex-1">
        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div>
              <Link to="/" className="navbar-logo">
                eBid
              </Link>
              <h2 className="mt-8 text-2xl font-bold tracking-tight text-gray-900">
                Create your account
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Users must register to place bids.
              </p>
            </div>
            <div className="mt-10">
              {stage === "form" && (
                <form onSubmit={onSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-gray-900"
                    >
                      User name
                    </label>
                    <div className="mt-2">
                      <input
                        id="username"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete="username"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base
                        border border-gray-300
                        placeholder:text-gray-400
                        focus:border-midnight-ash focus:ring-1 focus:ring-midnight-ash
                        sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Full name
                    </label>
                    <div className="mt-2">
                      <input
                        id="fullName"
                        name="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        autoComplete="name"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base
                        border border-gray-300
                        placeholder:text-gray-400
                        focus:border-midnight-ash focus:ring-1 focus:ring-midnight-ash
                        sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Phone number
                    </label>
                    <div className="mt-2">
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        autoComplete="tel"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base
                        border border-gray-300
                        placeholder:text-gray-400
                        focus:border-midnight-ash focus:ring-1 focus:ring-midnight-ash
                        sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Address
                    </label>
                    <div className="mt-2">
                      <input
                        id="address"
                        name="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        autoComplete="address-line1"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base
                        border border-gray-300
                        placeholder:text-gray-400
                        focus:border-midnight-ash focus:ring-1 focus:ring-midnight-ash
                        sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="birthdate"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Birthdate
                    </label>
                    <div className="mt-2">
                      <input
                        id="birthdate"
                        name="birthdate"
                        type="date"
                        value={birthdate}
                        onChange={(e) => setBirthdate(e.target.value)}
                        autoComplete="bday"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base
                        border border-gray-300
                        placeholder:text-gray-400
                        focus:border-midnight-ash focus:ring-1 focus:ring-midnight-ash
                        sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Email address
                    </label>
                    <div className="mt-2">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base
                        border border-gray-300
                        placeholder:text-gray-400
                        focus:border-midnight-ash focus:ring-1 focus:ring-midnight-ash
                        sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Password
                    </label>
                    <div className="mt-2">
                      <input
                        id="password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base
                        border border-gray-300
                        placeholder:text-gray-400
                        focus:border-midnight-ash focus:ring-1 focus:ring-midnight-ash
                        sm:text-sm"
                      />
                    </div>
                  </div>

                  {siteKey && (
                    <div className="pt-2">
                      <ReCAPTCHA
                        sitekey={siteKey}
                        onChange={(token) => setRecaptchaToken(token)}
                      />
                    </div>
                  )}

                  {error && <div className="text-red-600 text-sm">{error}</div>}

                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex w-full justify-center rounded-md btn-primary px-3 py-1.5 text-sm font-semibold text-white shadow-xs"
                    >
                      {loading ? "Creating..." : "Create account"}
                    </button>
                  </div>
                </form>
              )}

              {stage === "otp" && (
                <div className="flex flex-col items-center space-y-6 text-center">
                  <div className="rounded-full bg-green-100 p-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-6 w-6 text-green-600"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                      />
                    </svg>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Verify your email
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 max-w-xs mx-auto">
                      We've sent a 6-digit code to <br />
                      <span className="font-semibold text-gray-900">
                        {email}
                      </span>
                    </p>
                  </div>

                  <div className="w-full">
                    <input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="000000"
                      maxLength={6}
                      className="block w-full text-center text-3xl font-bold tracking-[0.5em] rounded-md border-gray-300 py-3 text-gray-900 shadow-sm placeholder:text-gray-300 focus:border-midnight-ash focus:ring-midnight-ash sm:text-2xl"
                    />
                  </div>

                  {error && (
                    <div className="w-full rounded-md bg-red-50 p-2 text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  <div className="w-full space-y-3">
                    <button
                      onClick={onVerifyOtp}
                      disabled={loading}
                      className="flex w-full justify-center rounded-md btn-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      {loading ? "Verifying..." : "Confirm & Create Account"}
                    </button>

                    <button
                      onClick={() => setStage("form")}
                      className="w-full text-sm text-gray-500 hover:text-gray-900"
                    >
                      Wrong email? Go back
                    </button>
                  </div>
                </div>
              )}

              {stage === "done" && (
                <div className="flex flex-col items-center justify-center space-y-4 py-8">
                  <div className="rounded-full bg-green-100 p-3">
                    <svg
                      className="h-8 w-8 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-gray-900">
                    Account verified!
                  </p>
                  <p className="text-sm text-gray-500">
                    Redirecting to login...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="relative hidden w-0 flex-1 lg:block">
          <img
            alt="signup background"
            src="https://images.unsplash.com/photo-1496917756835-20cb06e75b4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1908&q=80"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>
    </>
  );
}
