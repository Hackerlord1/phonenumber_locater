// components/history/HistoryService.ts
import { HistoryEntry, HistoryStats } from './HistoryTypes';

const HISTORY_STORAGE_KEY = 'phone_tracker_history';
const MAX_HISTORY_ITEMS = 50;

class HistoryService {
  // Get all history entries
  getHistory(): HistoryEntry[] {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }
    return [];
  }

  // Save a new entry
  saveEntry(entry: HistoryEntry): void {
    try {
      const history = this.getHistory();
      
      // Check if entry already exists (by phone number)
      const existingIndex = history.findIndex(e => e.number === entry.number);
      
      if (existingIndex !== -1) {
        // Update existing entry with new timestamp
        history[existingIndex] = { ...entry, timestamp: Date.now() };
      } else {
        // Add new entry
        history.unshift(entry);
      }
      
      // Limit history size
      const trimmedHistory = history.slice(0, MAX_HISTORY_ITEMS);
      
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(trimmedHistory));
    } catch (e) {
      console.error('Failed to save history:', e);
    }
  }

  // Remove a specific entry by phone number
  removeEntry(phoneNumber: string): void {
    try {
      const history = this.getHistory();
      const filtered = history.filter(entry => entry.number !== phoneNumber);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.error('Failed to remove history entry:', e);
    }
  }

  // Clear all history
  clearHistory(): void {
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear history:', e);
    }
  }

  // Get history stats
  getStats(): HistoryStats {
    const history = this.getHistory();
    
    if (history.length === 0) {
      return {
        totalSearches: 0,
        uniqueCountries: 0,
        lastSearchDate: null,
        mostSearchedCountry: 'None',
        averageRiskScore: 0
      };
    }

    // Count countries
    const countryCount: Record<string, number> = {};
    let totalRiskScore = 0;
    let riskScoreCount = 0;

    history.forEach(entry => {
      countryCount[entry.country] = (countryCount[entry.country] || 0) + 1;
      
      if (entry.riskScore) {
        totalRiskScore += entry.riskScore;
        riskScoreCount++;
      }
    });

    // Find most searched country
    let mostSearched = 'None';
    let maxCount = 0;
    Object.entries(countryCount).forEach(([country, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostSearched = country;
      }
    });

    return {
      totalSearches: history.length,
      uniqueCountries: Object.keys(countryCount).length,
      lastSearchDate: history[0]?.timestamp || null,
      mostSearchedCountry: mostSearched,
      averageRiskScore: riskScoreCount > 0 ? Math.round(totalRiskScore / riskScoreCount) : 0
    };
  }

  // Search history by phone number or country
  searchHistory(query: string): HistoryEntry[] {
    const history = this.getHistory();
    const lowercaseQuery = query.toLowerCase();
    
    return history.filter(entry => 
      entry.number.toLowerCase().includes(lowercaseQuery) ||
      entry.country.toLowerCase().includes(lowercaseQuery) ||
      entry.city.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Export history as JSON
  exportHistory(): string {
    const history = this.getHistory();
    return JSON.stringify(history, null, 2);
  }

  // Import history from JSON
  importHistory(jsonString: string): boolean {
    try {
      const history = JSON.parse(jsonString);
      if (Array.isArray(history)) {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, MAX_HISTORY_ITEMS)));
        return true;
      }
    } catch (e) {
      console.error('Failed to import history:', e);
    }
    return false;
  }
}

// Create a singleton instance
export const historyService = new HistoryService();