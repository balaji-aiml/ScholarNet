import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, CheckCheck, Send } from 'lucide-react';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { Avatar, Empty, ErrorText, RoleBadge, Spinner } from '../components/ui';
import { errMsg, fmtTime } from '../services/format';

const sortContacts = (list) =>
  [...list].sort((a, b) => {
    const ta = a.lastMessage ? new Date(a.lastMessage.createdAt) : 0;
    const tb = b.lastMessage ? new Date(b.lastMessage.createdAt) : 0;
    return tb - ta || a.user.name.localeCompare(b.user.name);
  });

export default function Messages() {
  const { user: me } = useAuth();
  const [params] = useSearchParams();
  const [contacts, setContacts] = useState(null);
  const [active, setActive] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [typing, setTyping] = useState({});
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const activeRef = useRef(null);
  const contactsRef = useRef([]);
  const typingTimer = useRef(null);
  const typingSent = useRef(false);
  const bottomRef = useRef(null);
  activeRef.current = active;
  contactsRef.current = contacts || [];

  const loadContacts = useCallback(async () => {
    try {
      const [{ data: convos }, { data: links }] = await Promise.all([api.get('/messages/conversations'), api.get('/connections')]);
      const map = new Map(convos.map((c) => [c.user._id, c]));
      links.forEach((u) => {
        if (u.connection.status === 'accepted' && !map.has(u._id)) map.set(u._id, { user: u, lastMessage: null, unread: 0 });
      });
      setContacts(sortContacts([...map.values()]));
    } catch (e) {
      setError(errMsg(e));
      setContacts([]);
    }
  }, []);

  const open = useCallback(async (id) => {
    setActive(id);
    setMsgs([]);
    setError('');
    try {
      const { data } = await api.get(`/messages/${id}`);
      if (activeRef.current !== id) return;
      setMsgs(data);
      setContacts((cs) => cs.map((c) => (c.user._id === id ? { ...c, unread: 0 } : c)));
      getSocket()?.emit('message:read', { from: id });
    } catch (e) {
      setError(errMsg(e));
    }
  }, []);

  useEffect(() => { loadContacts(); }, [loadContacts]);

  // Deep link from a "Message" button: /messages?to=<userId>
  const to = params.get('to');
  useEffect(() => {
    if (to && contacts && !activeRef.current && contacts.some((c) => c.user._id === to)) open(to);
  }, [to, contacts, open]);

  // Live events
  useEffect(() => {
    const s = getSocket();
    if (!s) return undefined;

    const onNew = (m) => {
      const incoming = m.sender !== me._id;
      const partner = incoming ? m.sender : m.recipient;
      const isActive = activeRef.current === partner;
      if (isActive) {
        setMsgs((prev) => (prev.some((x) => x._id === m._id) ? prev : [...prev, m]));
        if (incoming) s.emit('message:read', { from: partner });
      }
      if (incoming) setTyping((t) => ({ ...t, [partner]: false }));
      if (!contactsRef.current.some((c) => c.user._id === partner)) return loadContacts();
      setContacts((cs) => sortContacts(cs.map((c) => (c.user._id === partner
        ? { ...c, lastMessage: m, unread: incoming && !isActive ? c.unread + 1 : c.unread } : c))));
    };
    const onTyping = ({ from, isTyping }) => setTyping((t) => ({ ...t, [from]: isTyping }));
    const onRead = ({ by }) => setMsgs((prev) => prev.map((m) => (m.recipient === by && !m.read ? { ...m, read: true } : m)));

    s.on('message:new', onNew);
    s.on('typing', onTyping);
    s.on('message:read', onRead);
    return () => { s.off('message:new', onNew); s.off('typing', onTyping); s.off('message:read', onRead); };
  }, [me._id, loadContacts]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, typing[active]]);

  const stopTyping = () => {
    clearTimeout(typingTimer.current);
    if (typingSent.current && active) getSocket()?.emit('typing', { to: active, isTyping: false });
    typingSent.current = false;
  };

  const onInput = (e) => {
    setText(e.target.value);
    const s = getSocket();
    if (!active || !s) return;
    if (!typingSent.current) {
      typingSent.current = true;
      s.emit('typing', { to: active, isTyping: true });
    }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(stopTyping, 1500);
  };

  const submit = (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || !active) return;
    setError('');
    getSocket()?.emit('message:send', { to: active, text: body }, (r) => { if (!r?.ok) setError(r?.error || 'Message not sent'); });
    stopTyping();
    setText('');
  };

  const partner = contacts?.find((c) => c.user._id === active)?.user;

  return (
    <div className="chat-shell grid overflow-hidden rounded-2xl border border-ink/10 bg-white md:grid-cols-[320px_1fr]">
      {/* Conversation list */}
      <aside className={`${active ? 'hidden md:flex' : 'flex'} flex-col overflow-y-auto border-ink/10 md:border-r`} aria-label="Conversations">
        <h1 className="sticky top-0 border-b border-ink/10 bg-white px-4 py-3 text-xl font-extrabold">Messages</h1>
        {contacts === null ? <Spinner /> : contacts.length === 0 ? (
          <div className="p-4"><Empty title="No one to message yet">Messaging unlocks once a connection request is accepted.</Empty></div>
        ) : contacts.map(({ user, lastMessage, unread }) => (
          <button key={user._id} onClick={() => open(user._id)}
            className={`flex items-center gap-3 px-4 py-3 text-left transition hover:bg-brand-50 ${active === user._id ? 'bg-brand-100' : ''}`}>
            <Avatar name={user.name} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-semibold">{user.name}</span>
                {lastMessage && <span className="shrink-0 text-xs text-ink/50">{fmtTime(lastMessage.createdAt)}</span>}
              </div>
              <p className={`truncate text-sm ${unread ? 'font-semibold' : 'text-ink/60'}`}>
                {typing[user._id] ? 'typing...' : lastMessage ? `${lastMessage.sender === me._id ? 'You: ' : ''}${lastMessage.text}` : 'Say hello'}
              </p>
            </div>
            {unread > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-xs font-bold">{unread}</span>}
          </button>
        ))}
      </aside>

      {/* Chat pane */}
      <section className={`${active ? 'flex' : 'hidden md:flex'} min-h-0 flex-col bg-paper`} aria-label="Chat">
        {!partner ? (
          <div className="m-auto p-6 text-center text-ink/60">Pick a conversation to start chatting.</div>
        ) : (
          <>
            <header className="flex items-center gap-3 border-b border-ink/10 bg-white px-3 py-2.5">
              <button onClick={() => setActive(null)} className="rounded-full p-2 hover:bg-brand-100 md:hidden" aria-label="Back to conversations"><ArrowLeft size={18} /></button>
              <Avatar name={partner.name} size="sm" />
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-semibold leading-tight">{partner.name} <RoleBadge role={partner.role} /></p>
                <p className="h-4 text-xs text-ink/60">{typing[active] ? 'typing...' : partner.department}</p>
              </div>
            </header>

            <div className="flex-1 space-y-2 overflow-y-auto px-3 py-4">
              {msgs.map((m) => {
                const mine = m.sender === me._id;
                return (
                  <div key={m._id} className={`flex animate-rise ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${mine ? 'rounded-br-md bg-brand' : 'rounded-bl-md border border-ink/10 bg-white'}`}>
                      <p className="whitespace-pre-wrap break-words">{m.text}</p>
                      <p className="mt-0.5 flex items-center justify-end gap-1 text-[11px] text-ink/60">
                        {fmtTime(m.createdAt)}
                        {mine && (m.read
                          ? <CheckCheck size={14} aria-label="Read" className="text-ink" />
                          : <Check size={14} aria-label="Sent" />)}
                      </p>
                    </div>
                  </div>
                );
              })}
              {typing[active] && (
                <div className="flex justify-start" aria-label={`${partner.name} is typing`}>
                  <div className="flex gap-1 rounded-2xl rounded-bl-md border border-ink/10 bg-white px-4 py-3">
                    {[0, 150, 300].map((d) => <span key={d} style={{ animationDelay: `${d}ms` }} className="h-1.5 w-1.5 animate-dot rounded-full bg-ink/50" />)}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="border-t border-ink/10 bg-white p-3">
              <ErrorText>{error}</ErrorText>
              <form onSubmit={submit} className="flex gap-2">
                <input className="input" value={text} onChange={onInput} placeholder="Write a message" aria-label="Write a message" maxLength={2000} autoComplete="off" />
                <button className="btn-dark" aria-label="Send message" disabled={!text.trim()}><Send size={16} /></button>
              </form>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
