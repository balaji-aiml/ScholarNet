export const escapeRegex = (s = '') => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Accepts ["a","b"] or "a, b" and returns a clean string array.
export const toList = (v) => {
  const arr = Array.isArray(v) ? v : typeof v === 'string' ? v.split(',') : [];
  return [...new Set(arr.map((s) => String(s).trim()).filter(Boolean))];
};
