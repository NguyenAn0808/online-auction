import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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
      await api.post("/auth/forgot-password", { email });
      setSuccess(true);
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Request failed";
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
                Reset your password
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Enter your email address and we will send you a link to reset
                your password.
              </p>
            </div>

            <div className="mt-10">
              {!success && (
                <form onSubmit={onSubmit} className="space-y-6">
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
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-midnight-ash outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-midnight-ash sm:text-sm"
                      />
                    </div>
                  </div>

                  {error && <div className="text-red-600 text-sm">{error}</div>}

                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex w-full justify-center rounded-md btn-primary px-3 py-1.5 text-sm font-semibold text-white shadow-xs focus-visible:outline-2 focus-visible:outline-midnight-ash"
                    >
                      {loading ? "Sending..." : "Send reset link"}
                    </button>
                  </div>
                </form>
              )}

              {success && (
                <div className="rounded-md bg-green-50 p-4">
                  <p className="text-green-700">
                    If that email is registered, we've sent a reset link. Check
                    your inbox.
                  </p>
                </div>
              )}

              <p className="mt-6 text-center text-sm text-gray-500">
                <Link to="/auth/signin" className="font-semibold ">
                  Back to Login
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="relative hidden w-0 flex-1 lg:block">
          <img
            alt="background"
            src="https://images.unsplash.com/photo-1496917756835-20cb06e75b4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1908&q=80"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>
    </>
  );
}
