import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DEPARTMENTS, YEARS } from '@shared/constants.js';
import { errMsg } from '../services/format';
import { ErrorText } from '../components/ui';
import PasswordInput from '../components/PasswordInput';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', department: DEPARTMENTS[0], year: 1, skills: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace />;
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register(form);
      navigate('/', { replace: true });
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-brand px-4 py-8">
      <form onSubmit={submit} className="w-full max-w-md space-y-3 rounded-3xl bg-paper p-6 shadow-xl">
        <h1 className="text-3xl font-extrabold tracking-tight">Join ScholarNet</h1>
        <div><label className="label" htmlFor="n">Full name</label><input id="n" required className="input" value={form.name} onChange={set('name')} /></div>
        <div><label className="label" htmlFor="e">Email</label><input id="e" type="email" required className="input" value={form.email} onChange={set('email')} /></div>
        <div><label className="label" htmlFor="p">Password (6+ characters)</label><PasswordInput id="p" minLength={6} autoComplete="new-password" value={form.password} onChange={set('password')} /></div>
        <fieldset>
          <legend className="label">I am a</legend>
          <div className="flex gap-2">
            {['student', 'senior'].map((r) => (
              <label key={r} className={`flex-1 cursor-pointer rounded-xl border px-3 py-2 text-center text-sm font-semibold capitalize transition ${form.role === r ? 'border-ink bg-brand' : 'border-ink/20 bg-white hover:bg-brand-50'}`}>
                <input type="radio" name="role" value={r} checked={form.role === r} onChange={set('role')} className="sr-only" />{r}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2"><label className="label" htmlFor="dep">Department</label>
            <select id="dep" className="input" value={form.department} onChange={set('department')}>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</select></div>
          <div><label className="label" htmlFor="y">Year</label>
            <select id="y" className="input" value={form.year} onChange={set('year')}>{YEARS.map((y) => <option key={y}>{y}</option>)}</select></div>
        </div>
        <div><label className="label" htmlFor="s">Skills (comma separated)</label><input id="s" className="input" placeholder="React, Python, CAD" value={form.skills} onChange={set('skills')} /></div>
        <ErrorText>{error}</ErrorText>
        <button className="btn-dark w-full" disabled={busy}>{busy ? 'Creating account' : 'Create account'}</button>
        <p className="text-center text-sm">Already a member? <Link to="/login" className="font-semibold underline">Sign in</Link></p>
      </form>
    </div>
  );
}
