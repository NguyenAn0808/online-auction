import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const navigate = useNavigate();
  const { user } = useAuth();

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

  // Per-field validation errors
  const [fieldErrors, setFieldErrors] = useState({});
  // Track touched fields for showing errors only after interaction
  const [touched, setTouched] = useState({});

  const siteKey =
    import.meta.env.VITE_RECAPTCHA_SITE_KEY ||
    "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"; // test key

  const verifyOtp = async (email, otp) => {
    return api.post("/api/auth/verify-otp", { email, otp });
  };
  useEffect(() => {
    setError("");
  }, [stage, fullName, email, password, otp]);

  // Email validation helper with comprehensive checks
  const validateEmail = (emailValue) => {
    if (!emailValue) return "Email is required";

    // Trim whitespace
    const trimmed = emailValue.trim();

    // Check for basic structure
    if (!trimmed.includes("@")) return "Email must contain '@' symbol";

    const [localPart, domain] = trimmed.split("@");

    // Validate local part
    if (!localPart || localPart.length === 0)
      return "Email username is missing";
    if (localPart.length > 64) return "Email username is too long";
    if (localPart.startsWith(".") || localPart.endsWith("."))
      return "Email cannot start or end with a dot";
    if (localPart.includes(".."))
      return "Email cannot contain consecutive dots";

    // Validate domain
    if (!domain || domain.length === 0) return "Email domain is missing";
    if (!domain.includes("."))
      return "Email domain must contain a dot (e.g., gmail.com)";
    if (domain.startsWith(".") || domain.endsWith("."))
      return "Email domain cannot start or end with a dot";
    if (domain.startsWith("-") || domain.endsWith("-"))
      return "Email domain cannot start or end with a hyphen";

    // Check domain extension
    const domainParts = domain.split(".");
    const tld = domainParts[domainParts.length - 1];
    if (tld.length < 2) return "Email domain extension is invalid";

    // Comprehensive RFC 5322 regex for final validation
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(trimmed)) return "Please enter a valid email address";

    // Check for common typos in popular domains
    const commonDomains = [
      "gmail.com",
      "yahoo.com",
      "hotmail.com",
      "outlook.com",
    ];
    const lowerDomain = domain.toLowerCase();
    const typoSuggestions = {
      "gmial.com": "gmail.com",
      "gmal.com": "gmail.com",
      "gamil.com": "gmail.com",
      "gmail.co": "gmail.com",
      "gmai.com": "gmail.com",
      "yaho.com": "yahoo.com",
      "yahooo.com": "yahoo.com",
      "hotmal.com": "hotmail.com",
      "hotmai.com": "hotmail.com",
      "outlok.com": "outlook.com",
      "outloo.com": "outlook.com",
    };
    if (typoSuggestions[lowerDomain]) {
      return `Did you mean ${localPart}@${typoSuggestions[lowerDomain]}?`;
    }

    return null; // Valid
  };

  // Real-time field validation
  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case "username":
        if (!value) return "Username is required";
        if (value.length < 3) return "Username must be at least 3 characters";
        if (!/^[a-zA-Z0-9_]+$/.test(value))
          return "Username can only contain letters, numbers, and underscores";
        return null;
      case "fullName":
        if (!value) return "Full name is required";
        if (value.length < 2) return "Name is too short";
        return null;
      case "phone":
        if (!value) return "Phone number is required";
        if (!/^[0-9+\-\s()]{8,15}$/.test(value))
          return "Enter a valid phone number";
        return null;
      case "birthdate":
        if (!value) return "Birthdate is required";
        const age =
          (new Date() - new Date(value)) / (365.25 * 24 * 60 * 60 * 1000);
        if (age < 18) return "You must be at least 18 years old";
        if (age > 120) return "Please enter a valid birthdate";
        return null;
      case "email":
        return validateEmail(value);
      case "password":
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        if (!/[A-Z]/.test(value))
          return "Password should contain at least one uppercase letter";
        if (!/[0-9]/.test(value))
          return "Password should contain at least one number";
        return null;
      default:
        return null;
    }
  };

  // Handle field blur to show validation
  const handleBlur = (fieldName, value) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    const error = validateField(fieldName, value);
    setFieldErrors((prev) => ({ ...prev, [fieldName]: error }));
  };

  // Handle field change with real-time validation for touched fields
  const handleFieldChange = (fieldName, value, setter) => {
    setter(value);
    if (touched[fieldName]) {
      const error = validateField(fieldName, value);
      setFieldErrors((prev) => ({ ...prev, [fieldName]: error }));
    }
  };

  const validateForm = () => {
    const fields = [
      "username",
      "fullName",
      "phone",
      "birthdate",
      "email",
      "password",
    ];
    const values = { username, fullName, phone, birthdate, email, password };
    const newErrors = {};
    let firstError = null;

    for (const field of fields) {
      const error = validateField(field, values[field]);
      if (error) {
        newErrors[field] = error;
        if (!firstError) firstError = error;
      }
    }

    // Mark all fields as touched
    setTouched(fields.reduce((acc, f) => ({ ...acc, [f]: true }), {}));
    setFieldErrors(newErrors);

    if (firstError) return firstError;
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
                      User name <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="username"
                        name="username"
                        value={username}
                        onChange={(e) =>
                          handleFieldChange(
                            "username",
                            e.target.value,
                            setUsername
                          )
                        }
                        onBlur={(e) => handleBlur("username", e.target.value)}
                        autoComplete="username"
                        className={`block w-full rounded-md bg-white px-3 py-1.5 text-base
                        border ${
                          touched.username && fieldErrors.username
                            ? "border-red-500 ring-1 ring-red-500"
                            : touched.username && !fieldErrors.username
                            ? "border-green-500"
                            : "border-gray-300"
                        }
                        placeholder:text-gray-400
                        focus:border-midnight-ash focus:ring-1 focus:ring-midnight-ash
                        sm:text-sm transition-colors`}
                      />
                    </div>
                    {touched.username && fieldErrors.username && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {fieldErrors.username}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Full name <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="fullName"
                        name="fullName"
                        value={fullName}
                        onChange={(e) =>
                          handleFieldChange(
                            "fullName",
                            e.target.value,
                            setFullName
                          )
                        }
                        onBlur={(e) => handleBlur("fullName", e.target.value)}
                        autoComplete="name"
                        className={`block w-full rounded-md bg-white px-3 py-1.5 text-base
                        border ${
                          touched.fullName && fieldErrors.fullName
                            ? "border-red-500 ring-1 ring-red-500"
                            : touched.fullName && !fieldErrors.fullName
                            ? "border-green-500"
                            : "border-gray-300"
                        }
                        placeholder:text-gray-400
                        focus:border-midnight-ash focus:ring-1 focus:ring-midnight-ash
                        sm:text-sm transition-colors`}
                      />
                    </div>
                    {touched.fullName && fieldErrors.fullName && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {fieldErrors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Phone number <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) =>
                          handleFieldChange("phone", e.target.value, setPhone)
                        }
                        onBlur={(e) => handleBlur("phone", e.target.value)}
                        autoComplete="tel"
                        className={`block w-full rounded-md bg-white px-3 py-1.5 text-base
                        border ${
                          touched.phone && fieldErrors.phone
                            ? "border-red-500 ring-1 ring-red-500"
                            : touched.phone && !fieldErrors.phone
                            ? "border-green-500"
                            : "border-gray-300"
                        }
                        placeholder:text-gray-400
                        focus:border-midnight-ash focus:ring-1 focus:ring-midnight-ash
                        sm:text-sm transition-colors`}
                      />
                    </div>
                    {touched.phone && fieldErrors.phone && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {fieldErrors.phone}
                      </p>
                    )}
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
                      Birthdate <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="birthdate"
                        name="birthdate"
                        type="date"
                        value={birthdate}
                        onChange={(e) =>
                          handleFieldChange(
                            "birthdate",
                            e.target.value,
                            setBirthdate
                          )
                        }
                        onBlur={(e) => handleBlur("birthdate", e.target.value)}
                        autoComplete="bday"
                        className={`block w-full rounded-md bg-white px-3 py-1.5 text-base
                        border ${
                          touched.birthdate && fieldErrors.birthdate
                            ? "border-red-500 ring-1 ring-red-500"
                            : touched.birthdate && !fieldErrors.birthdate
                            ? "border-green-500"
                            : "border-gray-300"
                        }
                        placeholder:text-gray-400
                        focus:border-midnight-ash focus:ring-1 focus:ring-midnight-ash
                        sm:text-sm transition-colors`}
                      />
                    </div>
                    {touched.birthdate && fieldErrors.birthdate && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {fieldErrors.birthdate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Email address <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-2 relative">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) =>
                          handleFieldChange("email", e.target.value, setEmail)
                        }
                        onBlur={(e) => handleBlur("email", e.target.value)}
                        autoComplete="email"
                        placeholder="you@example.com"
                        className={`block w-full rounded-md bg-white px-3 py-1.5 text-base
                        border ${
                          touched.email && fieldErrors.email
                            ? "border-red-500 ring-1 ring-red-500"
                            : touched.email && !fieldErrors.email
                            ? "border-green-500"
                            : "border-gray-300"
                        }
                        placeholder:text-gray-400
                        focus:border-midnight-ash focus:ring-1 focus:ring-midnight-ash
                        sm:text-sm transition-colors`}
                      />
                      {touched.email && !fieldErrors.email && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg
                            className="w-5 h-5 text-green-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    {touched.email && fieldErrors.email && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <svg
                          className="w-4 h-4 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(e) =>
                          handleFieldChange(
                            "password",
                            e.target.value,
                            setPassword
                          )
                        }
                        onBlur={(e) => handleBlur("password", e.target.value)}
                        autoComplete="new-password"
                        className={`block w-full rounded-md bg-white px-3 py-1.5 text-base
                        border ${
                          touched.password && fieldErrors.password
                            ? "border-red-500 ring-1 ring-red-500"
                            : touched.password && !fieldErrors.password
                            ? "border-green-500"
                            : "border-gray-300"
                        }
                        placeholder:text-gray-400
                        focus:border-midnight-ash focus:ring-1 focus:ring-midnight-ash
                        sm:text-sm transition-colors`}
                      />
                    </div>
                    {touched.password && fieldErrors.password && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <svg
                          className="w-4 h-4 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {fieldErrors.password}
                      </p>
                    )}
                    {touched.password && !fieldErrors.password && (
                      <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Password strength: Good
                      </p>
                    )}
                  </div>

                  {siteKey && (
                    <div className="pt-2">
                      <ReCAPTCHA
                        sitekey={siteKey}
                        onChange={(token) => setRecaptchaToken(token)}
                      />
                    </div>
                  )}

                  {error && (
                    <div className="rounded-md bg-red-50 border border-red-200 p-3">
                      <div className="flex items-start gap-2">
                        <svg
                          className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div className="text-sm text-red-700">{error}</div>
                      </div>
                    </div>
                  )}

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
