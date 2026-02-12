/**
 * Format a byte count into a human-readable file size string.
 * Examples: "1.5 KB", "3.2 MB", "0 B"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const base = 1024;
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(base));
  const clampedIndex = Math.min(unitIndex, units.length - 1);
  const value = bytes / Math.pow(base, clampedIndex);

  // Show decimals only for KB and above
  if (clampedIndex === 0) {
    return `${bytes} B`;
  }

  return `${value.toFixed(1)} ${units[clampedIndex]}`;
}

/**
 * Format an ISO date string to a locale-friendly display string.
 * Example: "Jan 15, 2025, 3:42 PM"
 */
export function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format an ISO date string to a relative time description.
 * Examples: "just now", "2 min ago", "3h ago", "yesterday", "5 days ago"
 */
export function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) {
      return 'just now';
    }
    if (diffMinutes < 60) {
      return `${diffMinutes} min ago`;
    }
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }
    if (diffDays === 1) {
      return 'yesterday';
    }
    if (diffDays < 30) {
      return `${diffDays} days ago`;
    }

    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) {
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    }

    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
  } catch {
    return dateStr;
  }
}

/**
 * Truncate a file path to a maximum length, preserving the filename
 * and showing an ellipsis in the middle of the directory portion.
 * Example: "C:/Users/.../Documents/file.txt"
 */
export function truncatePath(path: string, maxLen: number): string {
  if (path.length <= maxLen) {
    return path;
  }

  const separator = path.includes('\\') ? '\\' : '/';
  const parts = path.split(separator);

  if (parts.length <= 2) {
    // Cannot meaningfully truncate; just clip with ellipsis
    return path.substring(0, maxLen - 3) + '...';
  }

  const fileName = parts[parts.length - 1];
  const root = parts[0];

  // Ensure we have room for root + ellipsis + filename
  const fixed = root + separator + '...' + separator + fileName;
  if (fixed.length >= maxLen) {
    // Even the minimal form is too long; truncate the filename
    return '...' + separator + fileName.substring(0, maxLen - 4);
  }

  // Build from both ends, adding directories until we hit maxLen
  let left = root;
  let right = fileName;
  let leftIdx = 1;
  let rightIdx = parts.length - 2;

  while (leftIdx <= rightIdx) {
    const candidate =
      left +
      separator +
      parts[leftIdx] +
      separator +
      '...' +
      separator +
      right;
    if (candidate.length > maxLen) break;
    left = left + separator + parts[leftIdx];
    leftIdx++;
  }

  // Try adding from the right side
  while (rightIdx >= leftIdx) {
    const candidate =
      left + separator + '...' + separator + parts[rightIdx] + separator + right;
    if (candidate.length > maxLen) break;
    right = parts[rightIdx] + separator + right;
    rightIdx--;
  }

  if (leftIdx > rightIdx) {
    return path; // All parts fit
  }

  return left + separator + '...' + separator + right;
}
