import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import api from '../services/api';
import UserCard from '../components/UserCard';
import { Empty, ErrorText, Spinner } from '../components/ui';
import { DEPARTMENTS, YEARS } from '@shared/constants.js';
import { errMsg } from '../services/format';

const TABS = [['discover', 'Discover'], ['network', 'My network'], ['requests', 'Requests']];

export default function Connections() {
  const [tab, setTab] = useState('discover');
  const [filters, setFilters] = useState({ q: '', skills: '', department: '', year: '' });
  const [list, setList] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setList(null);
    setError('');
    const t = setTimeout(async () => {
      try {
        if (tab === 'discover') {
          const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
          setList((await api.get('/users', { params })).data);
        } else {
          setList((await api.get('/connections')).data);
        }
      } catch (e) {
        setError(errMsg(e));
        setList([]);
      }
    }, tab === 'discover' ? 300 : 0); // debounce search typing
    return () => clearTimeout(t);
  }, [tab, filters]);

  const onChange = (id, connection) =>
    setList((l) => (connection === null && tab !== 'discover' ? l.filter((u) => u._id !== id) : l.map((u) => (u._id === id ? { ...u, connection } : u))));

  const setF = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));
  const accepted = (list || []).filter((u) => u.connection?.status === 'accepted');
  const incoming = (list || []).filter((u) => u.connection?.status === 'pending' && u.connection.direction === 'incoming');
  const sent = (list || []).filter((u) => u.connection?.status === 'pending' && u.connection.direction === 'outgoing');

  const grid = (users) => <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{users.map((u) => <UserCard key={u._id} user={u} onConnectionChange={onChange} />)}</div>;

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-extrabold tracking-tight">Connections</h1>

      <div role="tablist" className="flex gap-1 rounded-full bg-brand-100 p-1 sm:w-fit">
        {TABS.map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
            className={`flex-1 rounded-full px-4 py-1.5 text-sm font-semibold transition sm:flex-none ${tab === id ? 'bg-ink text-brand' : 'hover:bg-brand-200'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'discover' && (
        <div className="card grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/50" />
            <input className="input pl-9" placeholder="Search name or interest" aria-label="Search people" value={filters.q} onChange={setF('q')} />
          </div>
          <input className="input" placeholder="Skills, e.g. React, Python" aria-label="Filter by skills" value={filters.skills} onChange={setF('skills')} />
          <select className="input" aria-label="Department" value={filters.department} onChange={setF('department')}>
            <option value="">All departments</option>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
          </select>
          <select className="input" aria-label="Year" value={filters.year} onChange={setF('year')}>
            <option value="">Any year</option>{YEARS.map((y) => <option key={y} value={y}>Year {y}</option>)}
          </select>
        </div>
      )}

      <ErrorText>{error}</ErrorText>
      {list === null ? <Spinner /> : (
        <>
          {tab === 'discover' && (list.length ? grid(list) : <Empty title="No one matches those filters">Try fewer filters or a different skill.</Empty>)}
          {tab === 'network' && (accepted.length ? grid(accepted) : <Empty title="No connections yet">Send a request from the Discover tab.</Empty>)}
          {tab === 'requests' && (
            <div className="space-y-6">
              <section><h2 className="mb-3 text-lg font-bold">Waiting for you</h2>
                {incoming.length ? grid(incoming) : <Empty title="No incoming requests" />}</section>
              <section><h2 className="mb-3 text-lg font-bold">Sent by you</h2>
                {sent.length ? grid(sent) : <Empty title="No pending requests sent" />}</section>
            </div>
          )}
        </>
      )}
    </div>
  );
}
