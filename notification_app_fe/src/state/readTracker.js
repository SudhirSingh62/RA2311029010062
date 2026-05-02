const STORE_KEY = 'campus_read_receipts';

export const hasRead = (id) => {
  if (typeof window === 'undefined') return false;
  try {
    const set = new Set(JSON.parse(localStorage.getItem(STORE_KEY) || '[]'));
    return set.has(id);
  } catch {
    return false;
  }
};

export const markAsRead = (id) => {
  if (typeof window === 'undefined') return;
  try {
    const set = new Set(JSON.parse(localStorage.getItem(STORE_KEY) || '[]'));
    set.add(id);
    localStorage.setItem(STORE_KEY, JSON.stringify([...set]));
  } catch {}
};

export const fetchAllReadIds = () => {
  if (typeof window === 'undefined') return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(STORE_KEY) || '[]'));
  } catch {
    return new Set();
  }
};
