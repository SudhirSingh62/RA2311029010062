# Stage 1 — Priority Notification Processor

Fetches notifications from the API and outputs the top 10 by priority.

## Priority Logic

- **Type weight**: Placement (3) > Result (2) > Event (1)
- **Within same type**: newer timestamp ranks higher

## Efficient Top-N Strategy

For continuous incoming notifications, a **min-heap of size N** is the optimal approach:
- Maintain a heap ordered by priority score
- On each new notification: if it beats the heap minimum, replace it
- O(log N) per insert — scales regardless of total notification count

## Setup

```bash
cp .env.example .env
# Fill in AUTH_TOKEN and BASE_URL in .env

npm install
node index.js
```
