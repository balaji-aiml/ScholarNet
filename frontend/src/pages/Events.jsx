import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import EventForm from '../components/EventForm';
import { Empty, ErrorText, Spinner } from '../components/ui';
import { EVENT_CATEGORIES, POSTER_ROLES } from '@shared/constants.js';
import { cap, errMsg } from '../services/format';

export default function Events() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ q: '', category: 'all', from: '', to: '', upcoming: true });
  const [events, setEvents] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState(null); // null | {} (new) | event (edit)

  useEffect(() => {
    setError('');
    const t = setTimeout(async () => {
      const params = {};
      if (filters.q) params.q = filters.q;
      if (filters.category !== 'all') params.category = filters.category;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      if (filters.upcoming) params.upcoming = true;
      try {
        setEvents((await api.get('/events', { params })).data);
      } catch (e) {
        setError(errMsg(e));
        setEvents([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [filters]);

  const set = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const update = (ev) => setEvents((l) => l.map((x) => (x._id === ev._id ? ev : x)));
  const remove = async (id) => {
    try {
      await api.delete(`/events/${id}`);
      setEvents((l) => l.filter((x) => x._id !== id));
    } catch (e) {
      setError(errMsg(e));
    }
  };
  const saved = (ev, edited) => {
    setForm(null);
    setEvents((l) => (edited ? l.map((x) => (x._id === ev._id ? ev : x)) : [...l, ev].sort((a, b) => new Date(a.date) - new Date(b.date))));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight">Events</h1>
        {POSTER_ROLES.includes(user.role) && <button className="btn-dark" onClick={() => setForm({})}><Plus size={16} /> Post notice</button>}
      </div>

      <div className="card grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative lg:col-span-2">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/50" />
          <input className="input pl-9" placeholder="Search events" aria-label="Search events" value={filters.q} onChange={set('q')} />
        </div>
        <select className="input" aria-label="Category" value={filters.category} onChange={set('category')}>
          <option value="all">All categories</option>
          {EVENT_CATEGORIES.map((c) => <option key={c} value={c}>{cap(c)}</option>)}
        </select>
        <input type="date" className="input" aria-label="From date" value={filters.from} onChange={set('from')} />
        <input type="date" className="input" aria-label="To date" value={filters.to} onChange={set('to')} />
        <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2 lg:col-span-5">
          <input type="checkbox" className="h-4 w-4 accent-ink" checked={filters.upcoming} onChange={set('upcoming')} /> Hide past events
        </label>
      </div>

      <ErrorText>{error}</ErrorText>
      {events === null ? <Spinner /> : events.length === 0
        ? <Empty title="No events match">Clear a filter, or untick "Hide past events".</Empty>
        : <div className="space-y-4">{events.map((ev) => (
            <EventCard key={ev._id} event={ev} user={user} onUpdate={update} onDelete={remove} onEdit={setForm} />
          ))}</div>}

      {form && <EventForm event={form._id ? form : null} onSaved={saved} onClose={() => setForm(null)} />}
    </div>
  );
}
