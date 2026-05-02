import { useState, useEffect, useCallback } from 'react';
import { fetchPaginatedFeed, Log } from '../api/notifications';

export function useNoticeFeed({ page = 1, size = 10, filter = '' } = {}) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [totalItems, setTotalItems] = useState(0);

  const pullData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await Log('frontend', 'info', 'hook', `useNoticeFeed fetching p=${page}`);
      const payload = await fetchPaginatedFeed({ page, size, type: filter });
      
      const list = Array.isArray(payload.notifications) ? payload.notifications : (Array.isArray(payload) ? payload : []);
      setData(list);
      setTotalItems(payload.total || list.length);
      
      await Log('frontend', 'debug', 'state', `Loaded ${list.length} notices into feed`);
    } catch (err) {
      setErrorMsg('Failed to sync feed. Please try again.');
      await Log('frontend', 'error', 'hook', `Feed error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [page, size, filter]);

  useEffect(() => {
    pullData();
  }, [pullData]);

  return { notices: data, isLoading, errorMsg, totalItems, refresh: pullData };
}
