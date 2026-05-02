import { initializeLogger, Log } from '../logging_middleware/index.js';
const API_ENDPOINT = 'http://20.207.122.201/evaluation-service';
const BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJzczQ3MzZAc3JtaXN0LmVkdS5pbiIsImV4cCI6MTc3NzcwMDEyNywiaWF0IjoxNzc3Njk5MjI3LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiOGZjYWY3NmEtYmM4OC00MmQ5LTk0YWUtNWZkNjQ4NGNiYjhmIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoic3VkaGlyIHNpbmdoIiwic3ViIjoiN2Y0YTY2YTUtNmFmMC00YWRjLWE1ZGItNzE4YjkzMzdjZTk1In0sImVtYWlsIjoic3M0NzM2QHNybWlzdC5lZHUuaW4iLCJuYW1lIjoic3VkaGlyIHNpbmdoIiwicm9sbE5vIjoicmEyMzExMDI5MDEwMDYyIiwiYWNjZXNzQ29kZSI6IlFrYnB4SCIsImNsaWVudElEIjoiN2Y0YTY2YTUtNmFmMC00YWRjLWE1ZGItNzE4YjkzMzdjZTk1IiwiY2xpZW50U2VjcmV0Ijoia3RYclZhY3lxV1hGRUVKVSJ9.n5fiQVwiKiQOzcuBfq51WgQwknZZSL-_gSIS-iyNLhc';
initializeLogger({ token: BEARER_TOKEN, baseUrl: API_ENDPOINT });
const PRIORITY_SCORES = {
    Placement: 3,
    Result: 2,
    Event: 1,
};
function compareUrgency(a, b) {
    const scoreA = PRIORITY_SCORES[a.Type] || 0;
    const scoreB = PRIORITY_SCORES[b.Type] || 0;
    if (scoreA !== scoreB) {
        return scoreA - scoreB;
    }
    return new Date(a.Timestamp).getTime() - new Date(b.Timestamp).getTime();
}
class UrgentPriorityQueue {
    buffer;
    maxSize;
    constructor(maxSize) {
        this.buffer = [];
        this.maxSize = maxSize;
    }
    insert(item) {
        if (this.buffer.length < this.maxSize) {
            this.buffer.push(item);
            this.bubbleUp(this.buffer.length - 1);
        }
        else {
            if (compareUrgency(item, this.buffer[0]) > 0) {
                this.buffer[0] = item;
                this.sinkDown(0);
            }
        }
    }
    extractAll() {
        return [...this.buffer].sort((a, b) => compareUrgency(b, a));
    }
    bubbleUp(idx) {
        while (idx > 0) {
            const parentIdx = Math.floor((idx - 1) / 2);
            if (compareUrgency(this.buffer[parentIdx], this.buffer[idx]) <= 0)
                break;
            this.swap(idx, parentIdx);
            idx = parentIdx;
        }
    }
    sinkDown(idx) {
        const len = this.buffer.length;
        while (true) {
            const left = 2 * idx + 1;
            const right = 2 * idx + 2;
            let minIdx = idx;
            if (left < len && compareUrgency(this.buffer[left], this.buffer[minIdx]) < 0)
                minIdx = left;
            if (right < len && compareUrgency(this.buffer[right], this.buffer[minIdx]) < 0)
                minIdx = right;
            if (minIdx === idx)
                break;
            this.swap(idx, minIdx);
            idx = minIdx;
        }
    }
    swap(i, j) {
        const temp = this.buffer[i];
        this.buffer[i] = this.buffer[j];
        this.buffer[j] = temp;
    }
}
async function fetchLiveFeed() {
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
    }
    catch (err) {
        await Log('frontend', 'fatal', 'api', `Network request crashed: ${err.message}`);
        throw err;
    }
}
async function executeStage1() {
    try {
        await Log('frontend', 'info', 'utils', 'Booting up Priority Engine');
        const rawRecords = await fetchLiveFeed();
        // Simulate frontend tracking where no records are marked 'read'
        const viewedState = new Set();
        const unreadStream = rawRecords.filter(item => !viewedState.has(item.ID));
        await Log('frontend', 'debug', 'utils', `Initializing min-heap for Top 10 selection`);
        const pq = new UrgentPriorityQueue(10);
        for (const record of unreadStream) {
            if (record && record.ID && record.Type) {
                pq.insert(record);
            }
        }
        const topNotifications = pq.extractAll();
        console.log(`\n=== TOP ${topNotifications.length} URGENT UPDATES ===\n`);
        topNotifications.forEach((notif, i) => {
            console.log(`#${i + 1} [${notif.Type.toUpperCase()}]`);
            console.log(`Message: ${notif.Message}`);
            console.log(`Received: ${notif.Timestamp}\n`);
        });
        await Log('frontend', 'info', 'utils', 'Priority extraction finalized');
    }
    catch (error) {
        console.error('Fatal engine failure:', error.message);
    }
}
executeStage1();
