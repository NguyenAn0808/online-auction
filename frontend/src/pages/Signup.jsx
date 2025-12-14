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

  // UI state
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("form"); // form | otp | done
  const [error, setError] = useState("");
  const [otp, setOtp] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  const verifyOtp = async (email, otp) => {
    return api.post("/auth/verify-otp", { email, otp });
  };
  useEffect(() => {
    setError("");
  }, [stage, fullName, email, password, otp]);

  const validateForm = () => {
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
        fullName: fullName,
        address,
        email,
        password,
        recaptchaToken,
      };
      console.log("Signup payload (debug):", {
        fullName,
        email,
        address,
        recaptchaToken: !!recaptchaToken,
      });
      await api.post("/auth/signup", payload);
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
      <div className="flex min-h-full flex-1">
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
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-midnight-ash outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-midnight-ash sm:text-sm"
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
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-midnight-ash outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-midnight-ash sm:text-sm"
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
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-midnight-ash outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-midnight-ash sm:text-sm"
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
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-midnight-ash outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-midnight-ash sm:text-sm"
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
                <div className="space-y-4">
                  <p className="text-sm text-gray-700">
                    An OTP was sent to <strong>{email}</strong>. Enter it below
                    to confirm your account.
                  </p>
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-midnight-ash outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-midnight-ash sm:text-sm"
                  />
                  {error && <div className="text-red-600 text-sm">{error}</div>}
                  <div className="flex gap-2">
                    <button
                      onClick={onVerifyOtp}
                      disabled={loading}
                      className="flex-1 rounded-md btn-primary px-3 py-1.5 text-white"
                    >
                      {loading ? "Verifying..." : "Verify OTP"}
                    </button>
                    <button
                      onClick={() => setStage("form")}
                      className="flex-1 rounded-md border px-3 py-1.5"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}

              {stage === "done" && (
                <div className="text-center">
                  <p className="text-green-700">
                    Account created — redirecting to login...
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
