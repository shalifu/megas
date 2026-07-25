import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(`/dashboard/${user.role}`);
    }
  }, [user, navigate]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 text-slate-200 shadow-2xl shadow-slate-950/30">Redirecting to your dashboard…</div>;
}

export default Dashboard;
