import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to log in');
    }
  };

  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/30">
      <h2 className="text-3xl font-semibold text-white">Sign in to your account</h2>
      <p className="mt-3 text-slate-400">Use your email to access the dashboard and admin features.</p>
      {error && <p className="mt-4 rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p>}
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <label className="block text-sm text-slate-300">
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            className="mt-3 w-full rounded-3xl border border-slate-800 bg-slate-950/90 p-4 text-white outline-none transition focus:border-brand-500"
          />
        </label>
        <label className="block text-sm text-slate-300">
          Password
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            className="mt-3 w-full rounded-3xl border border-slate-800 bg-slate-950/90 p-4 text-white outline-none transition focus:border-brand-500"
          />
        </label>
        <button type="submit" className="w-full rounded-3xl bg-brand-500 px-5 py-4 text-sm font-semibold text-white transition hover:bg-brand-400">
          Login
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">
        Need an account? <Link className="text-brand-400 hover:text-brand-300" to="/signup">Sign up</Link>
      </p>
    </div>
  );
}

export default Login;
