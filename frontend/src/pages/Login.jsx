import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../services/format';
import { ErrorText } from '../components/ui';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const from = useLocation().state?.from?.pathname || '/';
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-brand px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-3xl bg-paper p-6 shadow-xl">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">ScholarNet</h1>
          <p className="mt-1 text-sm text-ink/70">Sign in with your campus email.</p>
        </div>
        <div><label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" required autoComplete="email" className="input" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div><label className="label" htmlFor="pw">Password</label>
          <input id="pw" type="password" required autoComplete="current-password" className="input" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
        <ErrorText>{error}</ErrorText>
        <button className="btn-dark w-full" disabled={busy}>{busy ? 'Signing in' : 'Sign in'}</button>
        <p className="text-center text-sm">New here? <Link to="/register" className="font-semibold underline">Create an account</Link></p>
      </form>
    </div>
  );
}
