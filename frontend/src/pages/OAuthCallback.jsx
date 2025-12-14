import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function OAuthCallback() {
  const navigate = useNavigate();
  const ranOnce = useRef(false);

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
        const user = JSON.parse(decodeURIComponent(userJson));

        localStorage.setItem("accessToken", accessToken);
        // userJson is URI encoded, so we decode it first
        localStorage.setItem("user", decodeURIComponent(userJson));

        window.location.href = "/";
      } catch (error) {
        console.error("Error parsing OAuth callback data:", error);
        navigate("/auth/login", { replace: true });
      }
    } else {
      // No tokens in URL, redirect to login
      navigate("/auth/login", { replace: true });
    }
  }, [navigate]);

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
