import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, MapPin, Pencil, Trash2, Send } from 'lucide-react';
import api from '../services/api';
import { cap, errMsg, fmtTime } from '../services/format';
import { Avatar, ErrorText, RoleBadge } from './ui';

export default function EventCard({ event, user, onUpdate, onDelete, onEdit }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const d = new Date(event.date);
  const past = d < new Date();
  const canManage = user.role === 'admin' || event.organizer?._id === user._id;

  const call = async (fn) => {
    setError('');
    try {
      onUpdate((await fn()).data);
    } catch (e) {
      setError(errMsg(e));
    }
  };
  const like = () => call(() => api.post(`/events/${event._id}/like`));
  const comment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await call(() => api.post(`/events/${event._id}/comments`, { text }));
    setText('');
  };
  const removeComment = (id) => call(() => api.delete(`/events/${event._id}/comments/${id}`));

  return (
    <article className={`card flex gap-4 transition-colors duration-200 hover:border-ink/30 ${past ? 'opacity-75' : ''}`}>
      {/* Date stamp: the one loud element on the board */}
      <div className="flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-brand text-ink sm:h-20 sm:w-16">
        <span className="text-xs font-semibold uppercase leading-none">{d.toLocaleDateString([], { month: 'short' })}</span>
        <span className="font-display text-2xl font-extrabold leading-tight sm:text-3xl">{d.getDate()}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip">{cap(event.category)}</span>
          {past && <span className="text-xs font-semibold text-ink/60">Past event</span>}
        </div>
        <h3 className="mt-1 text-lg font-bold leading-snug">{event.title}</h3>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-ink/70">
          <span>{fmtTime(event.date)}</span>
          {event.location && <span className="flex items-center gap-1"><MapPin size={13} /> {event.location}</span>}
        </p>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{event.description}</p>

        <p className="mt-3 flex flex-wrap items-center gap-1.5 text-sm text-ink/70">
          Posted by
          <Link to={`/profile/${event.organizer?._id}`} className="font-semibold text-ink hover:underline">{event.organizer?.name}</Link>
          <RoleBadge role={event.organizer?.role} />
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-ink/10 pt-3">
          <button onClick={like} aria-pressed={event.liked}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition hover:bg-brand-100 active:scale-95">
            <Heart size={18} className={event.liked ? 'animate-pop fill-brand stroke-ink' : ''} />
            {event.likeCount}
          </button>
          <button onClick={() => setOpen((o) => !o)} aria-expanded={open}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition hover:bg-brand-100 active:scale-95">
            <MessageSquare size={18} /> {event.comments.length}
          </button>
          {canManage && (
            <div className="ml-auto flex gap-1">
              <button onClick={() => onEdit(event)} className="rounded-full p-2 transition hover:bg-brand-100" aria-label="Edit notice"><Pencil size={16} /></button>
              <button onClick={() => window.confirm('Delete this notice?') && onDelete(event._id)}
                className="rounded-full p-2 transition hover:bg-red-100" aria-label="Delete notice"><Trash2 size={16} /></button>
            </div>
          )}
        </div>

        {open && (
          <div className="mt-3 animate-rise space-y-3">
            {event.comments.length === 0 && <p className="text-sm text-ink/60">No comments yet. Ask the organizer something.</p>}
            {event.comments.map((c) => (
              <div key={c._id} className="flex items-start gap-2">
                <Avatar name={c.user?.name} size="sm" />
                <div className="min-w-0 flex-1 rounded-xl bg-brand-50 px-3 py-2 text-sm">
                  <span className="font-semibold">{c.user?.name}</span> <RoleBadge role={c.user?.role} />
                  <p className="break-words">{c.text}</p>
                </div>
                {(c.user?._id === user._id || canManage) && (
                  <button onClick={() => removeComment(c._id)} className="rounded-full p-1.5 transition hover:bg-red-100" aria-label="Delete comment"><Trash2 size={14} /></button>
                )}
              </div>
            ))}
            <form onSubmit={comment} className="flex gap-2">
              <input className="input" value={text} onChange={(e) => setText(e.target.value)} maxLength={500} placeholder="Write a comment" aria-label="Write a comment" />
              <button className="btn-dark" aria-label="Post comment"><Send size={16} /></button>
            </form>
          </div>
        )}
        <ErrorText>{error}</ErrorText>
      </div>
    </article>
  );
}
