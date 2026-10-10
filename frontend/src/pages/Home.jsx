import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import UserCard from '../components/UserCard';
import { Empty, ErrorText, Spinner } from '../components/ui';
import { errMsg } from '../services/format';

export default function Home() {
  const { user } = useAuth();
  const [events, setEvents] = useState(null);
  const [people, setPeople] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/events', { params: { upcoming: true, limit: 4 } }), api.get('/users')])
      .then(([e, u]) => { setEvents(e.data); setPeople(u.data); })
      .catch((e) => { setError(errMsg(e)); setEvents([]); });
  }, []);

  const incoming = people.filter((p) => p.connection?.status === 'pending' && p.connection.direction === 'incoming');
  const suggestions = people.filter((p) => !p.connection).slice(0, 4);
  const updateEvent = (ev) => setEvents((list) => list.map((x) => (x._id === ev._id ? ev : x)));
  const updatePerson = (id, connection) => setPeople((l) => l.map((p) => (p._id === id ? { ...p, connection } : p)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Hi, {user.name.split(' ')[0]}</h1>
        <p className="text-ink/70">Here is what is coming up on campus.</p>
      </div>

      {incoming.length > 0 && (
        <Link to="/connections" className="block rounded-2xl bg-brand px-4 py-3 text-sm font-semibold transition hover:bg-brand-300">
          {incoming.length} connection {incoming.length === 1 ? 'request is' : 'requests are'} waiting for you. Review them.
        </Link>
      )}
      <ErrorText>{error}</ErrorText>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-4 lg:col-span-2" aria-label="Upcoming events">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-bold">Upcoming events</h2>
            <Link to="/events" className="text-sm font-semibold underline">All events</Link>
          </div>
          {events === null ? <Spinner /> : events.length === 0
            ? <Empty title="Nothing scheduled yet">Seniors and admins can post notices from the Events page.</Empty>
            : events.map((ev) => <EventCard key={ev._id} event={ev} user={user} onUpdate={updateEvent}
                onEdit={() => {}} onDelete={() => {}} />)}
        </section>

        <aside className="space-y-4" aria-label="People to connect with">
          <h2 className="text-xl font-bold">People to meet</h2>
          {suggestions.length === 0
            ? <Empty title="You know everyone here">New students will show up as they join.</Empty>
            : suggestions.map((p) => <UserCard key={p._id} user={p} compact onConnectionChange={updatePerson} />)}
        </aside>
      </div>
    </div>
  );
}
