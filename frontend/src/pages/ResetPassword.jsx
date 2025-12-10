import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const t = searchParams.get("token") || searchParams.get("t") || "";
    if (t) setToken(t);
  }, [searchParams]);

  const validate = () => {
    if (!token) return "Reset token is required";
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (password !== confirm) return "Passwords do not match";
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
      await api.post("/auth/reset-password", { token, password });
      setSuccess(true);
      // optional: navigate user to login after short delay
      setTimeout(() => navigate("/auth/login"), 1400);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Reset failed";
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
                Set a new password
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Enter the token from your reset email and choose a new password.
              </p>
            </div>

            <div className="mt-10">
              {!success && (
                <form onSubmit={onSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="token"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Reset token
                    </label>
                    <div className="mt-2">
                      <input
                        id="token"
                        name="token"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="Paste token from email"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-900"
                    >
                      New password
                    </label>
                    <div className="mt-2">
                      <input
                        id="password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="confirm"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Confirm password
                    </label>
                    <div className="mt-2">
                      <input
                        id="confirm"
                        name="confirm"
                        type="password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        autoComplete="new-password"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600 sm:text-sm"
                      />
                    </div>
                  </div>

                  {error && <div className="text-red-600 text-sm">{error}</div>}

                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-indigo-600"
                    >
                      {loading ? "Saving..." : "Save new password"}
                    </button>
                  </div>
                </form>
              )}

              {success && (
                <div className="rounded-md bg-green-50 p-4">
                  <p className="text-green-700">
                    Your password has been reset. You will be redirected to
                    login.
                  </p>
                </div>
              )}

              <p className="mt-6 text-center text-sm text-gray-500">
                <Link
                  to="/auth/login"
                  className="font-semibold text-indigo-600 hover:text-indigo-500"
                >
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
