// Maximum number of repository IDs to store in history
const MAX_HISTORY_SIZE = 1000;

// Base key for localStorage
const SWIPE_HISTORY_BASE_KEY = 'star-or-swipe:history';

interface SwipeHistory {
  repositoryIds: number[];
  lastUpdated: number;
}

// Get the storage key for a specific user
function getStorageKey(userId?: string | null): string {
  return userId ? `${SWIPE_HISTORY_BASE_KEY}:${userId}` : SWIPE_HISTORY_BASE_KEY;
}

// Get the swipe history from localStorage
export function getSwipeHistory(userId?: string | null): Set<number> {
  try {
    const key = getStorageKey(userId);
    const historyString = localStorage.getItem(key);
    if (!historyString) {
      return new Set();
    }

    const history: SwipeHistory = JSON.parse(historyString);
    
    // Clear history if it's older than 7 days
    if (Date.now() - history.lastUpdated > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(key);
      return new Set();
    }

    return new Set(history.repositoryIds);
  } catch (error) {
    console.error('Error reading swipe history:', error);
    return new Set();
  }
}

// Add a repository ID to the swipe history
export function addToSwipeHistory(repositoryId: number, userId?: string | null) {
  try {
    const history = getSwipeHistory(userId);
    history.add(repositoryId);

    // Convert to array and keep only the most recent repositories
    const repositoryIds = Array.from(history).slice(-MAX_HISTORY_SIZE);

    const swipeHistory: SwipeHistory = {
      repositoryIds,
      lastUpdated: Date.now(),
    };

    const key = getStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(swipeHistory));
  } catch (error) {
    console.error('Error saving swipe history:', error);
  }
}

// Check if a repository has been swiped
export function hasBeenSwiped(repositoryId: number, userId?: string | null): boolean {
  return getSwipeHistory(userId).has(repositoryId);
}

// Clear the swipe history for a specific user
export function clearSwipeHistory(userId?: string | null) {
  const key = getStorageKey(userId);
  localStorage.removeItem(key);
} 