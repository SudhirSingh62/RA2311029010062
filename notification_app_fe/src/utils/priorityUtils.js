const URGENCY_MAP = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

export function getRankDiff(a, b) {
  const w1 = URGENCY_MAP[a.Type] || 0;
  const w2 = URGENCY_MAP[b.Type] || 0;
  
  if (w1 !== w2) return w1 - w2;
  
  const t1 = new Date(a.Timestamp).getTime();
  const t2 = new Date(b.Timestamp).getTime();
  return t1 - t2;
}

export class MinHeapQueue {
  constructor(sizeLimit) {
    this.buffer = [];
    this.sizeLimit = sizeLimit;
  }

  enqueue(item) {
    if (this.buffer.length < this.sizeLimit) {
      this.buffer.push(item);
      this.trickleUp(this.buffer.length - 1);
    } else {
      if (getRankDiff(item, this.buffer[0]) > 0) {
        this.buffer[0] = item;
        this.trickleDown(0);
      }
    }
  }

  dumpSorted() {
    return [...this.buffer].sort((a, b) => getRankDiff(b, a));
  }

  trickleUp(i) {
    while (i > 0) {
      let parent = Math.floor((i - 1) / 2);
      if (getRankDiff(this.buffer[parent], this.buffer[i]) <= 0) break;
      this.swap(i, parent);
      i = parent;
    }
  }

  trickleDown(i) {
    const len = this.buffer.length;
    while (true) {
      let left = 2 * i + 1;
      let right = 2 * i + 2;
      let minIdx = i;

      if (left < len && getRankDiff(this.buffer[left], this.buffer[minIdx]) < 0) minIdx = left;
      if (right < len && getRankDiff(this.buffer[right], this.buffer[minIdx]) < 0) minIdx = right;

      if (minIdx === i) break;
      
      this.swap(i, minIdx);
      i = minIdx;
    }
  }

  swap(x, y) {
    const tmp = this.buffer[x];
    this.buffer[x] = this.buffer[y];
    this.buffer[y] = tmp;
  }
}
