import { initials } from '../services/format';

export function Avatar({ name, size = 'md' }) {
  const s = size === 'lg' ? 'h-20 w-20 text-2xl' : size === 'sm' ? 'h-8 w-8 text-xs' : 'h-11 w-11 text-sm';
  return (
    <div aria-hidden className={`${s} grid shrink-0 place-items-center rounded-full bg-brand font-display font-extrabold text-ink ring-2 ring-ink/10`}>
      {initials(name)}
    </div>
  );
}

export const RoleBadge = ({ role }) =>
  !role || role === 'student' ? null : (
    <span className="rounded-md bg-ink px-1.5 py-0.5 text-[11px] font-semibold capitalize text-brand">{role}</span>
  );

export const Chip = ({ children }) => <span className="chip">{children}</span>;

export const Spinner = () => (
  <div className="flex justify-center py-10" role="status" aria-label="Loading">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />
  </div>
);

export const Empty = ({ title, children }) => (
  <div className="rounded-2xl border border-dashed border-ink/25 bg-white/60 p-8 text-center">
    <p className="font-display text-lg font-semibold">{title}</p>
    {children && <p className="mt-1 text-sm text-ink/70">{children}</p>}
  </div>
);

export const ErrorText = ({ children }) =>
  children ? <p role="alert" className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{children}</p> : null;
