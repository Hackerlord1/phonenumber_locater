// components/history/HistoryPanel.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  History, X, Search, Trash2, Download, Upload, 
  ShieldAlert, ChevronDown, ChevronUp, Clock, Globe,
  Phone, MapPin, Database, TrendingUp, Filter, RefreshCw
} from "lucide-react";
import { historyService } from "./HistoryService";
import { HistoryEntry, HistoryStats } from "./HistoryTypes";

interface HistoryPanelProps {
  onSelectEntry: (entry: HistoryEntry) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function HistoryPanel({ onSelectEntry, isOpen, onClose }: HistoryPanelProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredHistory, setFilteredHistory] = useState<HistoryEntry[]>([]);
  const [showStats, setShowStats] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Load history on mount and when opened
  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = () => {
    const items = historyService.getHistory();
    setHistory(items);
    setFilteredHistory(items);
    setStats(historyService.getStats());
  };

  // Handle search
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = historyService.searchHistory(searchQuery);
      setFilteredHistory(results);
    } else {
      setFilteredHistory(history);
    }
  }, [searchQuery, history]);

  const handleDeleteEntry = (phoneNumber: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(phoneNumber);
  };

  const confirmDelete = (phoneNumber: string) => {
    historyService.removeEntry(phoneNumber);
    loadHistory();
    setShowDeleteConfirm(null);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all history? This cannot be undone.')) {
      historyService.clearHistory();
      loadHistory();
      setSelectedEntries([]);
    }
  };

  const handleExport = () => {
    const jsonData = historyService.exportHistory();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phone-tracker-history-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const jsonString = event.target?.result as string;
          const success = historyService.importHistory(jsonString);
          if (success) {
            loadHistory();
            alert('History imported successfully!');
          } else {
            alert('Failed to import history. Invalid format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const toggleEntrySelection = (phoneNumber: string) => {
    setSelectedEntries(prev =>
      prev.includes(phoneNumber)
        ? prev.filter(p => p !== phoneNumber)
        : [...prev, phoneNumber]
    );
  };

  const deleteSelected = () => {
    if (selectedEntries.length === 0) return;
    
    if (window.confirm(`Delete ${selectedEntries.length} selected entries?`)) {
      selectedEntries.forEach(phoneNumber => {
        historyService.removeEntry(phoneNumber);
      });
      loadHistory();
      setSelectedEntries([]);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed top-0 right-0 w-[500px] h-full bg-[#1a1f2e] border-l border-gray-800/50 shadow-2xl z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-800/50 flex items-center justify-between bg-gradient-to-r from-blue-600/10 to-purple-600/10">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-white">History Directory</h2>
          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
            {history.length} records
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-800/50 rounded-lg transition"
        >
          <X className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      {/* Stats Bar */}
      {stats && (
        <div className="p-3 border-b border-gray-800/50 bg-gray-900/30">
          <button
            onClick={() => setShowStats(!showStats)}
            className="w-full flex items-center justify-between text-sm text-gray-400 hover:text-white transition"
          >
            <span className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Statistics
            </span>
            {showStats ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          <AnimatePresence>
            {showStats && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 grid grid-cols-2 gap-2 overflow-hidden"
              >
                <div className="bg-gray-800/50 rounded p-2">
                  <p className="text-xs text-gray-500">Total Searches</p>
                  <p className="text-lg font-semibold text-white">{stats.totalSearches}</p>
                </div>
                <div className="bg-gray-800/50 rounded p-2">
                  <p className="text-xs text-gray-500">Countries</p>
                  <p className="text-lg font-semibold text-white">{stats.uniqueCountries}</p>
                </div>
                <div className="bg-gray-800/50 rounded p-2">
                  <p className="text-xs text-gray-500">Most Searched</p>
                  <p className="text-sm font-semibold text-white truncate">{stats.mostSearchedCountry}</p>
                </div>
                <div className="bg-gray-800/50 rounded p-2">
                  <p className="text-xs text-gray-500">Avg Risk Score</p>
                  <p className="text-lg font-semibold" style={{
                    color: stats.averageRiskScore > 85 ? '#ef4444' : stats.averageRiskScore > 70 ? '#eab308' : '#22c55e'
                  }}>{stats.averageRiskScore}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Search and Actions */}
      <div className="p-4 border-b border-gray-800/50">
        <div className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by number, country or city..."
              className="w-full bg-[#1e1f2c] border border-gray-700/50 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500/50 outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition text-gray-400 hover:text-white"
              title="Export History"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={handleImport}
              className="p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition text-gray-400 hover:text-white"
              title="Import History"
            >
              <Upload className="h-4 w-4" />
            </button>
            <button
              onClick={loadHistory}
              className="p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition text-gray-400 hover:text-white"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            {selectedEntries.length > 0 && (
              <button
                onClick={deleteSelected}
                className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition text-sm flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete {selectedEntries.length}
              </button>
            )}
            <button
              onClick={handleClearAll}
              className="px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 rounded-lg transition text-sm flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="overflow-y-auto h-[calc(100%-220px)] p-4">
        <AnimatePresence mode="popLayout">
          {filteredHistory.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <History className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No history entries found</p>
              <p className="text-sm text-gray-600 mt-2">
                {searchQuery ? 'Try a different search term' : 'Searches will appear here'}
              </p>
            </motion.div>
          ) : (
            filteredHistory.map((entry) => (
              <motion.div
                key={entry.number + entry.timestamp}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className={`mb-3 rounded-lg border ${
                  selectedEntries.includes(entry.number)
                    ? 'border-blue-500/50 bg-blue-500/10'
                    : 'border-gray-800/50 bg-[#1e1f2c] hover:bg-[#252634]'
                } transition cursor-pointer group relative`}
                onClick={() => onSelectEntry(entry)}
              >
                {/* Delete button */}
                <button
                  onClick={(e) => handleDeleteEntry(entry.number, e)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500/20 hover:bg-red-500/40 rounded opacity-0 group-hover:opacity-100 transition z-10"
                >
                  <Trash2 className="h-3 w-3 text-red-400" />
                </button>

                {/* Selection checkbox */}
                <div className="absolute top-2 left-2">
                  <input
                    type="checkbox"
                    checked={selectedEntries.includes(entry.number)}
                    onChange={() => toggleEntrySelection(entry.number)}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-0"
                  />
                </div>

                {/* Delete confirmation */}
                {showDeleteConfirm === entry.number && (
                  <div className="absolute inset-0 bg-black/90 rounded-lg flex items-center justify-center z-20">
                    <div className="text-center">
                      <p className="text-sm text-white mb-2">Delete this entry?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => confirmDelete(entry.number)}
                          className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          className="px-3 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600"
                        >
                          No
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-3 pl-8">
                  {/* Header with flag and number */}
                  <div className="flex items-center gap-2 mb-2">
                    {entry.flag && (
                      <img src={entry.flag} alt={entry.country} className="w-6 h-4 object-cover rounded" />
                    )}
                    <span className="text-sm font-medium text-white">{entry.number}</span>
                    <span className="text-xs text-gray-500 ml-auto">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                    <MapPin className="h-3 w-3" />
                    <span>{entry.city}, {entry.country}</span>
                  </div>

                  {/* Device and carrier */}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Phone className="h-3 w-3" />
                    <span>{entry.carrier || 'Unknown'} • {entry.deviceModel || 'Unknown'}</span>
                  </div>

                  {/* Risk indicator */}
                  {entry.riskScore && (
                    <div className="absolute bottom-2 right-2 flex items-center gap-1">
                      <ShieldAlert className={`h-3 w-3 ${
                        entry.riskScore > 85 ? 'text-red-500' : 
                        entry.riskScore > 70 ? 'text-yellow-500' : 
                        'text-green-500'
                      }`} />
                      <span className={`text-xs ${
                        entry.riskScore > 85 ? 'text-red-400' : 
                        entry.riskScore > 70 ? 'text-yellow-400' : 
                        'text-green-400'
                      }`}>
                        Risk: {entry.riskScore}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}