import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Signup from "./pages/Signup";
import Signout from "./pages/Signout";
import ChangePassword from "./pages/ChangePassword";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyResetOTP from "./pages/VerifyResetOTP";
import CompleteAccount from "./pages/CompleteAccount";
import ResetSuccess from "./pages/ResetSuccess";
import OAuthCallback from "./pages/OAuthCallback";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/auth/signin" element={<Login />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/auth/signout" element={<Signout />} />
          <Route path="/auth/callback" element={<OAuthCallback />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/verify-reset-otp" element={<VerifyResetOTP />} />
          <Route path="/auth/change-password" element={<ChangePassword />} />
          <Route path="/auth/complete-account" element={<CompleteAccount />} />
          <Route path="/auth/reset-success" element={<ResetSuccess />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Navigate to="/auth/signin" replace />} />
          {/* Fallback for unknown routes */}
          <Route path="*" element={<Navigate to="/auth/signin" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
