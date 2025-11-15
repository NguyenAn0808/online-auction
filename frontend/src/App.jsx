import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Signup from "./pages/Signup";
import Signout from "./pages/Signout";
import ChangePassword from "./pages/ChangePassword";
import ForgotPassword from "./pages/ForgotPassword";
import CompleteAccount from "./pages/CompleteAccount";
import ResetSuccess from "./pages/ResetSuccess";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/signin" element={<Login />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/signup" element={<Signup />} />
        <Route path="/auth/signout" element={<Signout />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/change-password" element={<ChangePassword />} />
        <Route path="/auth/complete-account" element={<CompleteAccount />} />
        <Route path="/auth/reset-success" element={<ResetSuccess />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Navigate to="/auth/signin" replace />} />
        {/* Fallback for unknown routes */}
        <Route path="*" element={<Navigate to="/auth/signin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
