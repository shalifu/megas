import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Signup() {
  const { signup } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await signup({ username, email, password, confirmPassword });
      setSuccess('Signup successful! Wait for admin approval.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create account');
    }
  };

  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/30">
      <h2 className="text-3xl font-semibold text-white">Create your account</h2>
      <p className="mt-3 text-slate-400">Register to submit orders, apply for jobs, and access your dashboard.</p>
      {error && <p className="mt-4 rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p>}
      {success && <p className="mt-4 rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{success}</p>}
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <label className="block text-sm text-slate-300">
          Full name
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            required
            className="mt-3 w-full rounded-3xl border border-slate-800 bg-slate-950/90 p-4 text-white outline-none transition focus:border-brand-500"
          />
        </label>
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
        <label className="block text-sm text-slate-300">
          Confirm Password
          <input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
            required
            className="mt-3 w-full rounded-3xl border border-slate-800 bg-slate-950/90 p-4 text-white outline-none transition focus:border-brand-500"
          />
        </label>
        <button type="submit" className="w-full rounded-3xl bg-brand-500 px-5 py-4 text-sm font-semibold text-white transition hover:bg-brand-400">
          Create account
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account? <Link className="text-brand-400 hover:text-brand-300" to="/login">Login</Link>
      </p>
    </div>
  );
}

export default Signup;
