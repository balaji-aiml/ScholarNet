import { NavLink, Link } from 'react-router-dom';
import { Home, Users, CalendarDays, MessageCircle, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './ui';

const links = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/connections', label: 'Connections', icon: Users },
  { to: '/events', label: 'Events', icon: CalendarDays },
  { to: '/messages', label: 'Messages', icon: MessageCircle },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-brand">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <Link to="/" className="font-display text-xl font-extrabold tracking-tight">ScholarNet</Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition duration-150 ${
                    isActive ? 'bg-ink text-brand' : 'hover:bg-brand-300'
                  }`}>
                <Icon size={16} /> {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/profile" aria-label="Your profile" className="transition hover:scale-105"><Avatar name={user?.name} size="sm" /></Link>
            <button onClick={logout} className="rounded-full p-2 transition hover:bg-brand-300" aria-label="Sign out" title="Sign out">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <nav aria-label="Main" className="mobile-nav fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-ink/10 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold transition ${isActive ? 'text-ink' : 'text-ink/50'}`}>
            {({ isActive }) => (
              <>
                <span className={`rounded-full px-4 py-1 transition ${isActive ? 'bg-brand' : ''}`}><Icon size={20} /></span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
