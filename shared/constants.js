// Single source of truth used by both backend (validation) and frontend (forms/filters).
export const ROLES = ['student', 'senior', 'admin'];
export const SELF_SIGNUP_ROLES = ['student', 'senior'];
export const POSTER_ROLES = ['senior', 'admin']; // may publish notices

export const EVENT_CATEGORIES = ['academic', 'cultural', 'sports', 'workshop', 'career', 'club', 'other'];

export const DEPARTMENTS = [
  'Computer Science', 'AI & ML', 'ECE', 'Mechanical', 'Civil', 'EEE', 'Cyber Security',
];

export const YEARS = [1, 2, 3, 4];
export const CONNECTION_STATUS = { PENDING: 'pending', ACCEPTED: 'accepted' };
