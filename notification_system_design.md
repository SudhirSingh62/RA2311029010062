# Notification System Design

## Stage 1

### Problem Statement
The system needs to efficiently find and maintain the top `n` highest-priority unread notifications from a continuous stream or large batch of data provided by an API, prioritizing based on categorical weight and recency.

### Objective
Process notifications from the API, filter out read notifications, and compute the top-n highest priority unread notifications using a scalable, performant approach that handles streaming data gracefully.

### Priority Inbox Logic & Ranking Strategy
Notifications are ranked using a composite priority calculation:
1. **Type Weight**: The primary sorting factor.
2. **Recency**: The secondary tie-breaking factor.

### Why Placement > Result > Event?
This weighting represents the typical hierarchy of urgency in a campus setting:
- **Placement (Weight: 3)**: Highly time-sensitive and life-impacting. Requires immediate attention.
- **Result (Weight: 2)**: Academically important but usually non-actionable immediately.
- **Event (Weight: 1)**: General campus updates, informational rather than critical.

### Recency Handling
When two notifications have the same type (and thus the same weight), the one with the newer timestamp takes precedence. This ensures that the most recent critical updates surface first.

### Unread Filtering
Before applying priority sorting, notifications are filtered against a client-side set of "read" notification IDs. Only IDs not present in the read set are considered for the priority inbox.

### Max-Heap / Priority Queue Approach
Instead of blindly sorting the entire array of unread notifications (which takes `O(M log M)` where M is the number of unread notifications), we utilize a **Min-Heap of size N**. 
- We want the Top N highest priority items.
- By keeping a Min-Heap of size N, the "lowest" priority item among our Top N is always at the root.
- As we stream through the dataset, if a new notification has a higher priority than the root, we pop the root and push the new notification in `O(log N)` time.
- At the end, the heap contains the exact top N notifications. We then extract and reverse them to display descending.

### Efficient Top-N Maintenance for Incoming Notifications
As new notifications arrive (e.g., via polling or WebSockets), they are simply evaluated against the root of the existing Min-Heap.
- If it's a lower priority than the root, it's discarded immediately `O(1)`.
- If it's higher, it replaces the root and the heap restructures `O(log N)`.
This makes the maintenance of the top N list extremely scalable for continuous real-time feeds without ever re-sorting the whole dataset.

### Complexity Analysis
- **Space Complexity**: `O(N)` where N is the configurable size of the priority inbox (e.g., 10, 20).
- **Time Complexity**: `O(M log N)` where M is the total number of incoming unread notifications. This is significantly faster than `O(M log M)` sorting when M is large.

### Scaling Considerations
- **Frontend Pagination**: The All Notifications view uses server-driven pagination to avoid client memory overload.
- **Client-Side Heap**: The priority inbox evaluates incoming pages locally using the heap structure to prevent heavy UI blocking operations.

### Assumptions
- Pre-authorized access token is available.
- Timestamps follow standard ISO 8601 formatting for easy Date parsing.
- There is no backend endpoint specifically for `GET /priority-unread`, requiring the client to handle the aggregation.

### Tradeoffs
- **Client-Side Aggregation**: Because there is no priority endpoint, the client must pull significant data to guarantee an accurate global top N. A tradeoff was made to process whatever is fetched rather than trying to fetch the entire database at once. 
- **Local Read State**: Read/Unread state is tracked locally. Tradeoff: If the user switches devices, read state will not sync.

### Logging Strategy
A reusable `Log(stack, level, package, message)` middleware is used comprehensively:
- **API**: Logs request starts, successes, and HTTP error failures.
- **Utils**: Logs processing steps like "Heap creation" and "Top-N extraction".
- **State/Hook**: Logs pagination changes, filter updates, and state mutations.
- **Component**: Catches and logs UI-level runtime errors.

### Failure Handling
- Safe execution: The logger never throws errors that crash the app.
- API failures are gracefully caught, logged as `error` or `fatal`, and user-friendly error states are presented.
- Invalid data shapes inside the notification stream are ignored and logged as `warn`, preventing the heap logic from breaking.
