import { useState } from 'react';
import { X } from 'lucide-react';
import api from '../services/api';
import { EVENT_CATEGORIES } from '@shared/constants.js';
import { cap, errMsg, toLocalInput } from '../services/format';
import { ErrorText } from './ui';

export default function EventForm({ event, onSaved, onClose }) {
  const [form, setForm] = useState({
    title: event?.title || '',
    description: event?.description || '',
    date: event ? toLocalInput(event.date) : '',
    location: event?.location || '',
    category: event?.category || 'other',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const body = { ...form, date: new Date(form.date).toISOString() };
      const { data } = event ? await api.put(`/events/${event._id}`, body) : await api.post('/events', body);
      onSaved(data, !!event);
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={event ? 'Edit notice' : 'Post a notice'}
        className="max-h-[92dvh] w-full max-w-lg animate-rise space-y-3 overflow-y-auto rounded-t-3xl bg-paper p-5 sm:rounded-3xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{event ? 'Edit notice' : 'Post a notice'}</h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-brand-100" aria-label="Close"><X size={18} /></button>
        </div>
        <div><label className="label" htmlFor="t">Title</label>
          <input id="t" className="input" required maxLength={120} value={form.title} onChange={set('title')} /></div>
        <div><label className="label" htmlFor="d">Description</label>
          <textarea id="d" className="input min-h-28" required maxLength={2000} value={form.description} onChange={set('description')} /></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className="label" htmlFor="dt">Date and time</label>
            <input id="dt" type="datetime-local" className="input" required value={form.date} onChange={set('date')} /></div>
          <div><label className="label" htmlFor="c">Category</label>
            <select id="c" className="input" value={form.category} onChange={set('category')}>
              {EVENT_CATEGORIES.map((c) => <option key={c} value={c}>{cap(c)}</option>)}
            </select></div>
        </div>
        <div><label className="label" htmlFor="l">Location</label>
          <input id="l" className="input" value={form.location} onChange={set('location')} /></div>
        <ErrorText>{error}</ErrorText>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={busy}>{event ? 'Save changes' : 'Publish notice'}</button>
        </div>
      </form>
    </div>
  );
}
