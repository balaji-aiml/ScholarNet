import { Link } from 'react-router-dom';
import { Avatar, Chip, RoleBadge } from './ui';
import ConnectButton from './ConnectButton';

export default function UserCard({ user, onConnectionChange, compact = false }) {
  return (
    <article className="card-hover flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <Avatar name={user.name} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/profile/${user._id}`} className="truncate font-display font-semibold hover:underline">{user.name}</Link>
            <RoleBadge role={user.role} />
          </div>
          <p className="text-sm text-ink/70">
            {[user.department, user.year && `Year ${user.year}`].filter(Boolean).join(', ')}
          </p>
        </div>
      </div>
      {!compact && user.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {user.skills.slice(0, 5).map((s) => <Chip key={s}>{s}</Chip>)}
        </div>
      )}
      <ConnectButton user={user} onChange={onConnectionChange} />
    </article>
  );
}
