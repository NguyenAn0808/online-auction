import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const userJson = searchParams.get("user");

    if (accessToken && userJson) {
      try {
        const user = JSON.parse(decodeURIComponent(userJson));

        // Store in localStorage
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("user", JSON.stringify(user));

        // Redirect to dashboard - the AuthContext will pick up the user from localStorage
        navigate("/dashboard", { replace: true });
      } catch (error) {
        console.error("Error parsing OAuth callback data:", error);
        navigate("/auth/login", { replace: true });
      }
    } else {
      // No tokens in URL, redirect to login
      navigate("/auth/login", { replace: true });
    }
  }, [searchParams, navigate]);

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
