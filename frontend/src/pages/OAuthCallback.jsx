import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function OAuthCallback() {
  const navigate = useNavigate();
  const ranOnce = useRef(false);
  const { loginWithToken } = useAuth();
  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;
    console.log("🔵 OAuth Callback started...");
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const userJson = params.get("user");

    if (accessToken && userJson) {
      try {
        console.log("🟢 Tokens found. Saving...");
        const userData = JSON.parse(decodeURIComponent(userJson));

        if (loginWithToken) {
          loginWithToken(userData, accessToken);
        } else {
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("user", JSON.stringify(userData));
        }
        console.log("OAuth Login Success. hasPassword =", userData.hasPassword);
        navigate("/");
      } catch (error) {
        console.error("Error parsing OAuth callback data:", error);
        navigate("/auth/signin", { replace: true });
      }
    } else {
      // No tokens in URL, redirect to login
      navigate("/auth/signin", { replace: true });
    }
  }, [navigate, loginWithToken]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}

export default OAuthCallback;
