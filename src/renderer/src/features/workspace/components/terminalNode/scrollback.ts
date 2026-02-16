import { MAX_OVERLAP_PROBE_CHARS, MAX_SCROLLBACK_CHARS } from './constants'

export function truncateScrollback(snapshot: string): string {
  if (snapshot.length <= MAX_SCROLLBACK_CHARS) {
    return snapshot
  }

  return snapshot.slice(-MAX_SCROLLBACK_CHARS)
}

function calculateSuffixPrefixOverlap(left: string, right: string): number {
  const maxLength = Math.min(left.length, right.length, MAX_OVERLAP_PROBE_CHARS)

  for (let size = maxLength; size > 0; size -= 1) {
    if (left.slice(-size) === right.slice(0, size)) {
      return size
    }
  }

  return 0
}

export function mergeScrollbackSnapshots(persisted: string, live: string): string {
  const persistedSnapshot = truncateScrollback(persisted)
  const liveSnapshot = truncateScrollback(live)

  if (persistedSnapshot.length === 0) {
    return liveSnapshot
  }

  if (liveSnapshot.length === 0) {
    return persistedSnapshot
  }

  if (persistedSnapshot === liveSnapshot) {
    return liveSnapshot
  }

  if (liveSnapshot.includes(persistedSnapshot)) {
    return liveSnapshot
  }

  if (persistedSnapshot.includes(liveSnapshot)) {
    return persistedSnapshot
  }

  const overlap = calculateSuffixPrefixOverlap(persistedSnapshot, liveSnapshot)
  return truncateScrollback(`${persistedSnapshot}${liveSnapshot.slice(overlap)}`)
}
