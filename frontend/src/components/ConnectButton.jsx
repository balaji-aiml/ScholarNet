import { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Check, X, MessageCircle, Clock } from 'lucide-react';
import api from '../services/api';
import { errMsg } from '../services/format';

// `user.connection` is null | {id, status: pending|accepted, direction: incoming|outgoing}
// onChange(userId, newConnection|null) lets the parent update its list.
export default function ConnectButton({ user, onChange }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const c = user.connection;

  const run = (fn) => async () => {
    setBusy(true);
    setError('');
    try {
      onChange(user._id, await fn());
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
    }
  };
  const connect = run(async () => (await api.post(`/connections/${user._id}`)).data);
  const accept = run(async () => (await api.put(`/connections/${c.id}/accept`)).data);
  const remove = run(async () => {
    await api.delete(`/connections/${c.id}`);
    return null;
  });

  let buttons;
  if (!c) {
    buttons = <button className="btn-primary" disabled={busy} onClick={connect}><UserPlus size={16} /> Connect</button>;
  } else if (c.status === 'accepted') {
    buttons = (
      <>
        <Link to={`/messages?to=${user._id}`} className="btn-primary"><MessageCircle size={16} /> Message</Link>
        <button className="btn-ghost" disabled={busy} onClick={remove} title="Remove connection"><Check size={16} /> Connected</button>
      </>
    );
  } else if (c.direction === 'incoming') {
    buttons = (
      <>
        <button className="btn-primary" disabled={busy} onClick={accept}><Check size={16} /> Accept</button>
        <button className="btn-ghost" disabled={busy} onClick={remove}><X size={16} /> Decline</button>
      </>
    );
  } else {
    buttons = (
      <button className="btn-ghost" disabled={busy} onClick={remove} title="Cancel request"><Clock size={16} /> Pending · Cancel</button>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">{buttons}</div>
      {error && <p role="alert" className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}
