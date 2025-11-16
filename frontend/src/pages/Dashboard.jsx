import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("auth");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("auth");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-2xl w-full card">
        <div className="p-8">
          <h2 className="text-xl font-semibold">Dashboard</h2>
          <p className="mt-4">Welcome — you're signed in.</p>
          <div className="mt-6">
            <button onClick={logout} className="btn-primary">
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
