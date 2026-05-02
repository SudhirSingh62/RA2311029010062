import { initializeLogger, Log } from '../logging_middleware/index';

const API_ENDPOINT = 'http://20.207.122.201/evaluation-service';
const BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJzczQ3MzZAc3JtaXN0LmVkdS5pbiIsImV4cCI6MTc3NzcwMzEzMCwiaWF0IjoxNzc3NzAyMjMwLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiOTVmMjBlMTAtNTcyOS00Nzk2LWFmOGYtMDIwNTM2ZGExZWE1IiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoic3VkaGlyIHNpbmdoIiwic3ViIjoiN2Y0YTY2YTUtNmFmMC00YWRjLWE1ZGItNzE4YjkzMzdjZTk1In0sImVtYWlsIjoic3M0NzM2QHNybWlzdC5lZHUuaW4iLCJuYW1lIjoic3VkaGlyIHNpbmdoIiwicm9sbE5vIjoicmEyMzExMDI5MDEwMDYyIiwiYWNjZXNzQ29kZSI6IlFrYnB4SCIsImNsaWVudElEIjoiN2Y0YTY2YTUtNmFmMC00YWRjLWE1ZGItNzE4YjkzMzdjZTk1IiwiY2xpZW50U2VjcmV0Ijoia3RYclZhY3lxV1hGRUVKVSJ9.UxdJHcdjYOR8xvlgObYh3DnKcKDGAC2p1cueoGH_5oM';

// Ensure logger works immediately
initializeLogger({ token: BEARER_TOKEN, baseUrl: API_ENDPOINT });

export interface NotificationRecord {
  ID: string;
  Type: 'Placement' | 'Result' | 'Event' | string;
  Message: string;
  Timestamp: string;
}

const PRIORITY_SCORES: Record<string, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

function compareUrgency(a: NotificationRecord, b: NotificationRecord): number {
  const scoreA = PRIORITY_SCORES[a.Type] || 0;
  const scoreB = PRIORITY_SCORES[b.Type] || 0;
  
  if (scoreA !== scoreB) {
    return scoreA - scoreB;
  }
  
  return new Date(a.Timestamp).getTime() - new Date(b.Timestamp).getTime();
}

class UrgentPriorityQueue {
  private buffer: NotificationRecord[];
  private maxSize: number;

  constructor(maxSize: number) {
    this.buffer = [];
    this.maxSize = maxSize;
  }

  insert(item: NotificationRecord) {
    if (this.buffer.length < this.maxSize) {
      this.buffer.push(item);
      this.bubbleUp(this.buffer.length - 1);
    } else {
      // @ts-ignore
      if (compareUrgency(item, this.buffer[0]) > 0) {
        this.buffer[0] = item;
        this.sinkDown(0);
      }
    }
  }

  extractAll(): NotificationRecord[] {
    return [...this.buffer].sort((a, b) => compareUrgency(b, a));
  }

  private bubbleUp(idx: number) {
    while (idx > 0) {
      const parentIdx = Math.floor((idx - 1) / 2);
      // @ts-ignore
      if (compareUrgency(this.buffer[parentIdx], this.buffer[idx]) <= 0) break;
      this.swap(idx, parentIdx);
      idx = parentIdx;
    }
  }

  private sinkDown(idx: number) {
    const len = this.buffer.length;
    while (true) {
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;
      let minIdx = idx;

      // @ts-ignore
      if (left < len && compareUrgency(this.buffer[left], this.buffer[minIdx]) < 0) minIdx = left;
      // @ts-ignore
      if (right < len && compareUrgency(this.buffer[right], this.buffer[minIdx]) < 0) minIdx = right;

      if (minIdx === idx) break;
      
      this.swap(idx, minIdx);
      idx = minIdx;
    }
  }

  private swap(i: number, j: number) {
    const temp = this.buffer[i];
    // @ts-ignore
    this.buffer[i] = this.buffer[j];
    // @ts-ignore
    this.buffer[j] = temp;
  }
}

async function fetchLiveFeed(): Promise<NotificationRecord[]> {
  await Log('frontend', 'info', 'api', 'Pulling batch stream for Stage 1 processing');

  try {
    const response = await fetch(`${API_ENDPOINT}/notifications`, {
      headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const payload = await response.json();
    return Array.isArray(payload.notifications) ? payload.notifications : (Array.isArray(payload) ? payload : []);
  } catch (err: any) {
    await Log('frontend', 'fatal', 'api', `Network request crashed: ${err.message}`);
    throw err;
  }
}

async function executeStage1() {
  try {
    await Log('frontend', 'info', 'utils', 'Booting up Priority Engine');

    const rawRecords = await fetchLiveFeed();
    
    // Simulate frontend tracking where no records are marked 'read'
    const viewedState = new Set<string>();
    const unreadStream = rawRecords.filter(item => !viewedState.has(item.ID));
    
    await Log('frontend', 'debug', 'utils', `Initializing min-heap for Top 10 selection`);
    const pq = new UrgentPriorityQueue(10);

    for (const record of unreadStream) {
      if (record && record.ID && record.Type) {
        pq.insert(record);
      }
    }

    const topNotifications = pq.extractAll();

    // Intentionally using console.log to print the CLI output, as required by "standalone typescript file implementing Stage 1... include sample output formatting"
    console.log(`\n=== TOP ${topNotifications.length} URGENT UPDATES ===\n`);
    topNotifications.forEach((notif, i) => {
      console.log(`#${i + 1} [${notif.Type.toUpperCase()}]`);
      console.log(`Message: ${notif.Message}`);
      console.log(`Received: ${notif.Timestamp}\n`);
    });

    await Log('frontend', 'info', 'utils', 'Priority extraction finalized');

  } catch (error: any) {
    // We log to API but also print to stderr since this is a CLI module
    await Log('frontend', 'fatal', 'utils', `Engine failure: ${error.message}`);
    console.error(`Fatal engine failure: ${error.message}`);
  }
}

executeStage1();
