import { useState, useEffect, useCallback } from 'react';
import { fetchRawStream, Log } from '../api/notifications';
import { MinHeapQueue } from '../utils/priorityUtils.js';
import { fetchAllReadIds } from '../state/readTracker.js';

export function usePriorityQueue({ limit = 10, category = '' } = {}) {
  const [items, setItems] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null);

  const hydrateQueue = useCallback(async () => {
    setIsFetching(true);
    setErrorStatus(null);
    try {
      await Log('frontend', 'info', 'hook', `usePriorityQueue hydrating top ${limit}`);
      const stream = await fetchRawStream(category);
      
      const seenIds = fetchAllReadIds();
      const freshItems = stream.filter(x => !seenIds.has(x.ID));

      const mq = new MinHeapQueue(limit);
      for (const notif of freshItems) {
        if (notif?.ID) mq.enqueue(notif);
      }

      const urgencyList = mq.dumpSorted();
      setItems(urgencyList);
      
      await Log('frontend', 'debug', 'state', `Queue built with ${urgencyList.length} items`);
    } catch (err) {
      setErrorStatus('Could not build priority queue. Please refresh.');
      await Log('frontend', 'error', 'hook', `Queue hydration failed: ${err.message}`);
    } finally {
      setIsFetching(false);
    }
  }, [limit, category]);

  useEffect(() => {
    hydrateQueue();
  }, [hydrateQueue]);

  return { urgentItems: items, isFetching, errorStatus, reload: hydrateQueue };
}
