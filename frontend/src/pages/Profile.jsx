import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ConnectButton from '../components/ConnectButton';
import { Avatar, Chip, ErrorText, RoleBadge, Spinner } from '../components/ui';
import { DEPARTMENTS, YEARS } from '@shared/constants.js';
import { errMsg } from '../services/format';

export default function Profile() {
  const { id } = useParams();
  const { user: me, setUser, logout } = useAuth();
  const isMe = !id || id === me._id;
  const [other, setOther] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setOther(null);
    setEditing(false);
    setError('');
    if (!isMe) api.get(`/users/${id}`).then(({ data }) => setOther(data)).catch((e) => setError(errMsg(e)));
  }, [id, isMe]);

  const p = isMe ? me : other;
  if (!p) return error ? <ErrorText>{error}</ErrorText> : <Spinner />;

  const startEdit = () => {
    setForm({ name: p.name, department: p.department || '', year: p.year || '', bio: p.bio || '', skills: (p.skills || []).join(', '), interests: (p.interests || []).join(', ') });
    setEditing(true);
  };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      setUser((await api.put('/users/me', form)).data);
      setEditing(false);
    } catch (err) {
      setError(errMsg(err));
    }
    setBusy(false);
  };

  const deleteAccount = async () => {
    if (!window.confirm('Delete your account, messages and posts? This cannot be undone.')) return;
    try {
      await api.delete('/users/me');
      logout();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  if (editing) {
    return (
      <form onSubmit={save} className="card mx-auto max-w-2xl space-y-3">
        <h1 className="text-2xl font-extrabold">Edit profile</h1>
        <div><label className="label" htmlFor="n">Name</label><input id="n" required className="input" value={form.name} onChange={set('name')} /></div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2"><label className="label" htmlFor="d">Department</label>
            <select id="d" className="input" value={form.department} onChange={set('department')}>
              <option value="">Not set</option>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</select></div>
          <div><label className="label" htmlFor="y">Year</label>
            <select id="y" className="input" value={form.year} onChange={set('year')}>
              <option value="">Not set</option>{YEARS.map((y) => <option key={y}>{y}</option>)}</select></div>
        </div>
        <div><label className="label" htmlFor="b">Bio</label><textarea id="b" maxLength={500} className="input min-h-24" value={form.bio} onChange={set('bio')} /></div>
        <div><label className="label" htmlFor="s">Skills (comma separated)</label><input id="s" className="input" value={form.skills} onChange={set('skills')} /></div>
        <div><label className="label" htmlFor="i">Interests (comma separated)</label><input id="i" className="input" value={form.interests} onChange={set('interests')} /></div>
        <ErrorText>{error}</ErrorText>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
          <button className="btn-primary" disabled={busy}>Save changes</button>
        </div>
      </form>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <section className="card space-y-4">
        <div className="flex items-start gap-4">
          <Avatar name={p.name} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="flex flex-wrap items-center gap-2 text-2xl font-extrabold">{p.name} <RoleBadge role={p.role} /></h1>
            <p className="text-ink/70">{[p.department, p.year && `Year ${p.year}`].filter(Boolean).join(', ')}</p>
            {isMe && <p className="text-sm text-ink/50">{p.email}</p>}
          </div>
          {isMe && <button className="btn-ghost" onClick={startEdit}><Pencil size={15} /> Edit</button>}
        </div>
        {p.bio && <p className="leading-relaxed">{p.bio}</p>}
        {!isMe && <ConnectButton user={p} onChange={(_id, connection) => setOther({ ...other, connection })} />}
      </section>

      {[['Skills', p.skills], ['Interests', p.interests]].map(([title, items]) => (
        <section key={title} className="card">
          <h2 className="mb-2 text-lg font-bold">{title}</h2>
          {items?.length ? <div className="flex flex-wrap gap-1.5">{items.map((s) => <Chip key={s}>{s}</Chip>)}</div>
            : <p className="text-sm text-ink/60">{isMe ? `Add ${title.toLowerCase()} so people can find you.` : 'Nothing added yet.'}</p>}
        </section>
      ))}

      {isMe && (
        <section className="flex flex-wrap justify-between gap-2 pt-2">
          <button className="btn-ghost" onClick={logout}>Sign out</button>
          <button className="btn-ghost text-red-800 hover:border-red-800 hover:bg-red-50" onClick={deleteAccount}>Delete account</button>
        </section>
      )}
      <ErrorText>{error}</ErrorText>
    </div>
  );
}
