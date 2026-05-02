import { initializeLogger, Log as Logger } from 'logging_middleware';

const ENDPOINT = process.env.NEXT_PUBLIC_BASE_URL || '';
const TOKEN = process.env.NEXT_PUBLIC_AUTH_TOKEN || '';

export async function fetchPaginatedFeed({ page = 1, size = 10, type = '' } = {}) {
  initializeLogger({ token: TOKEN, baseUrl: ENDPOINT });
  await Logger('frontend', 'info', 'api', `Loading feed - page: ${page}, type: ${type || 'all'}`);

  const query = new URLSearchParams({ page: page.toString(), limit: size.toString() });
  if (type) query.set('notification_type', type);

  try {
    const res = await fetch(`${ENDPOINT}/notifications?${query}`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });

    if (!res.ok) throw new Error(`Server returned ${res.status}`);

    return await res.json();
  } catch (error: any) {
    await Logger('frontend', 'error', 'api', `Failed to load feed: ${error.message}`);
    throw error;
  }
}

export async function fetchRawStream(typeFilter = '') {
  initializeLogger({ token: TOKEN, baseUrl: ENDPOINT });
  await Logger('frontend', 'info', 'api', 'Pulling batch stream for client sorting');
  
  const query = new URLSearchParams({ page: '1', limit: '100' });
  if (typeFilter) query.set('notification_type', typeFilter);
  
  try {
    const res = await fetch(`${ENDPOINT}/notifications?${query}`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });

    if (!res.ok) throw new Error(`Server returned ${res.status}`);

    const payload = await res.json();
    return payload.notifications || payload || [];
  } catch (error: any) {
    await Logger('frontend', 'error', 'api', `Stream pull failed: ${error.message}`);
    throw error;
  }
}

// Inline log wrapper to export for other components
export async function Log(...args: Parameters<typeof Logger>) {
  initializeLogger({ token: TOKEN, baseUrl: ENDPOINT });
  return Logger(...args);
}
