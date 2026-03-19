// app/history/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  History, ArrowLeft, Search, Trash2, Download, Upload, 
  ShieldAlert, MapPin, Phone, Globe, Calendar, Filter,
  ChevronDown, ChevronUp, Database, RefreshCw, X,
  Facebook, Twitter, Instagram, Linkedin, Smartphone,
  Radio, Activity, Clock, AlertTriangle, CheckCircle,
  Loader2, Users
} from "lucide-react";
import Link from "next/link";
import { historyService } from "@/components/history/HistoryService";
import { HistoryEntry, HistoryStats } from "@/components/history/HistoryTypes";

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<HistoryEntry[]>([]);
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'country' | 'risk'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterCountry, setFilterCountry] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    setIsLoading(true);
    const items = historyService.getHistory();
    setHistory(items);
    applyFilters(items, searchQuery, filterCountry, filterRisk, sortBy, sortOrder);
    setStats(historyService.getStats());
    setIsLoading(false);
  };

  // Apply filters and sorting
  const applyFilters = (
    items: HistoryEntry[],
    query: string,
    country: string,
    risk: string,
    sort: 'date' | 'country' | 'risk',
    order: 'asc' | 'desc'
  ) => {
    let filtered = [...items];

    // Apply search
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.number.toLowerCase().includes(lowercaseQuery) ||
        entry.country.toLowerCase().includes(lowercaseQuery) ||
        entry.city.toLowerCase().includes(lowercaseQuery) ||
        entry.carrier?.toLowerCase().includes(lowercaseQuery)
      );
    }

    // Apply country filter
    if (country !== 'all') {
      filtered = filtered.filter(entry => entry.countryCode === country);
    }

    // Apply risk filter
    if (risk !== 'all') {
      const riskNum = parseInt(risk);
      filtered = filtered.filter(entry => {
        if (!entry.riskScore) return false;
        if (risk === 'high') return entry.riskScore > 85;
        if (risk === 'medium') return entry.riskScore > 70 && entry.riskScore <= 85;
        if (risk === 'low') return entry.riskScore <= 70;
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sort === 'date') {
        comparison = a.timestamp - b.timestamp;
      } else if (sort === 'country') {
        comparison = a.country.localeCompare(b.country);
      } else if (sort === 'risk') {
        comparison = (a.riskScore || 0) - (b.riskScore || 0);
      }
      return order === 'asc' ? comparison : -comparison;
    });

    setFilteredHistory(filtered);
  };

  // Handle search
  useEffect(() => {
    applyFilters(history, searchQuery, filterCountry, filterRisk, sortBy, sortOrder);
  }, [searchQuery, filterCountry, filterRisk, sortBy, sortOrder, history]);

  // Get unique countries for filter
  const uniqueCountries = [...new Set(history.map(entry => entry.countryCode))];

  const handleDeleteEntry = (phoneNumber: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(phoneNumber);
  };

  const confirmDelete = (phoneNumber: string) => {
    historyService.removeEntry(phoneNumber);
    loadHistory();
    setShowDeleteConfirm(null);
    setSelectedEntries(prev => prev.filter(p => p !== phoneNumber));
  };

  const handleClearAll = () => {
    historyService.clearHistory();
    loadHistory();
    setShowClearAllConfirm(false);
    setSelectedEntries([]);
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

  const toggleAllSelection = () => {
    if (selectedEntries.length === filteredHistory.length) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(filteredHistory.map(entry => entry.number));
    }
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

  const getRiskColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score > 85) return 'text-red-400';
    if (score > 70) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getRiskBg = (score?: number) => {
    if (!score) return 'bg-gray-500/20';
    if (score > 85) return 'bg-red-500/20';
    if (score > 70) return 'bg-yellow-500/20';
    return 'bg-green-500/20';
  };

  return (
    <div className="min-h-screen bg-[#1a1f2e] text-white">
      {/* Header */}
      <header className="border-b border-gray-800/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="p-2 hover:bg-gray-800/50 rounded-lg transition flex items-center gap-2 text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Tracker</span>
            </Link>
            <div className="w-px h-6 bg-gray-800/50"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <History className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-light">history <span className="font-bold text-blue-500">directory</span></span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition text-gray-300 hover:text-white flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <button
              onClick={handleImport}
              className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition text-gray-300 hover:text-white flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Import
            </button>
            <button
              onClick={loadHistory}
              className="p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition text-gray-400 hover:text-white"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Database className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-gray-400">Total Searches</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.totalSearches}</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-600/10 to-emerald-600/10 border border-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Globe className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-400">Countries</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.uniqueCountries}</p>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-600/10 to-orange-600/10 border border-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="h-5 w-5 text-yellow-500" />
                <span className="text-sm text-gray-400">Avg Risk Score</span>
              </div>
              <p className={`text-2xl font-bold ${getRiskColor(stats.averageRiskScore)}`}>
                {stats.averageRiskScore}
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 border border-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="h-5 w-5 text-purple-500" />
                <span className="text-sm text-gray-400">Last Search</span>
              </div>
              <p className="text-lg font-bold text-white">
                {stats.lastSearchDate ? new Date(stats.lastSearchDate).toLocaleDateString() : 'Never'}
              </p>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-[#1e1f2c] border border-gray-800/50 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by phone number, country, city or carrier..."
                  className="w-full bg-[#141824] border border-gray-700/50 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500/50 outline-none"
                />
              </div>
            </div>

            {/* Country Filter */}
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="bg-[#141824] border border-gray-700/50 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500/50 outline-none"
            >
              <option value="all">All Countries</option>
              {uniqueCountries.map(code => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>

            {/* Risk Filter */}
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="bg-[#141824] border border-gray-700/50 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500/50 outline-none"
            >
              <option value="all">All Risk Levels</option>
              <option value="high">High Risk (85+)</option>
              <option value="medium">Medium Risk (70-85)</option>
              <option value="low">Low Risk (below 70)</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'country' | 'risk')}
              className="bg-[#141824] border border-gray-700/50 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500/50 outline-none"
            >
              <option value="date">Sort by Date</option>
              <option value="country">Sort by Country</option>
              <option value="risk">Sort by Risk</option>
            </select>

            {/* Sort Order */}
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2 bg-[#141824] border border-gray-700/50 rounded-lg text-sm text-white hover:bg-[#1e1f2c] transition flex items-center gap-2"
            >
              {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </button>

            {/* Bulk Actions */}
            {selectedEntries.length > 0 && (
              <button
                onClick={deleteSelected}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete {selectedEntries.length} Selected
              </button>
            )}

            {/* Clear All */}
            <button
              onClick={() => setShowClearAllConfirm(true)}
              className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 rounded-lg transition flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="bg-[#1e1f2c] border border-gray-800/50 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 p-4 bg-gray-800/30 border-b border-gray-800/50 text-xs font-medium text-gray-400">
            <div className="col-span-1 flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedEntries.length === filteredHistory.length && filteredHistory.length > 0}
                onChange={toggleAllSelection}
                className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-0"
              />
            </div>
            <div className="col-span-2">Phone Number</div>
            <div className="col-span-2">Location</div>
            <div className="col-span-2">Device Info</div>
            <div className="col-span-2">Risk Score</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-1">Actions</div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="p-12 text-center">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading history...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredHistory.length === 0 && (
            <div className="p-12 text-center">
              <History className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No history entries found</p>
              <p className="text-sm text-gray-600 mt-2">
                {searchQuery ? 'Try adjusting your search filters' : 'Searches will appear here'}
              </p>
            </div>
          )}

          {/* History Items */}
          <AnimatePresence>
            {filteredHistory.map((entry) => (
              <motion.div
                key={entry.number + entry.timestamp}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -100 }}
                className="border-b border-gray-800/50 last:border-0"
              >
                {/* Main Row */}
                <div className="grid grid-cols-12 gap-4 p-4 hover:bg-[#252634] transition items-center">
                  <div className="col-span-1">
                    <input
                      type="checkbox"
                      checked={selectedEntries.includes(entry.number)}
                      onChange={() => toggleEntrySelection(entry.number)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-0"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      {entry.flag && (
                        <img src={entry.flag} alt={entry.country} className="w-5 h-3 object-cover rounded" />
                      )}
                      <span className="text-sm font-medium text-white">{entry.number}</span>
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <p className="text-sm text-white">{entry.city}</p>
                    <p className="text-xs text-gray-500">{entry.country}</p>
                  </div>
                  
                  <div className="col-span-2">
                    <p className="text-sm text-white">{entry.deviceModel || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{entry.carrier || 'Unknown'}</p>
                  </div>
                  
                  <div className="col-span-2">
                    {entry.riskScore ? (
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded ${getRiskBg(entry.riskScore)}`}>
                        <ShieldAlert className={`h-3 w-3 ${getRiskColor(entry.riskScore)}`} />
                        <span className={`text-xs font-medium ${getRiskColor(entry.riskScore)}`}>
                          {entry.riskScore} {entry.darkWebMentions ? `(${entry.darkWebMentions} DW)` : ''}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-600">No data</span>
                    )}
                  </div>
                  
                  <div className="col-span-2">
                    <p className="text-sm text-white">{new Date(entry.timestamp).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500">{new Date(entry.timestamp).toLocaleTimeString()}</p>
                  </div>
                  
                  <div className="col-span-1 flex items-center gap-2">
                    <button
                      onClick={() => setExpandedEntry(expandedEntry === entry.number ? null : entry.number)}
                      className="p-1.5 hover:bg-gray-700/50 rounded transition"
                    >
                      <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${
                        expandedEntry === entry.number ? 'rotate-180' : ''
                      }`} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteEntry(entry.number, e)}
                      className="p-1.5 hover:bg-red-500/20 rounded transition group"
                    >
                      <Trash2 className="h-4 w-4 text-gray-500 group-hover:text-red-400" />
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedEntry === entry.number && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-[#141824] border-t border-gray-800/50 p-4"
                    >
                      <div className="grid grid-cols-3 gap-6">
                        {/* Location Details */}
                        <div>
                          <h4 className="text-xs font-medium text-gray-500 mb-3 flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            LOCATION DETAILS
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Coordinates:</span>
                              <span className="text-white font-mono">
                                {entry.latNum.toFixed(4)}°, {entry.lngNum.toFixed(4)}°
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Street:</span>
                              <span className="text-white">{entry.street}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Region:</span>
                              <span className="text-white">{entry.region}</span>
                            </div>
                            {entry.cityPopulation && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Population:</span>
                                <span className="text-white">{entry.cityPopulation.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Device Details */}
                        <div>
                          <h4 className="text-xs font-medium text-gray-500 mb-3 flex items-center gap-2">
                            <Smartphone className="h-3 w-3" />
                            DEVICE DETAILS
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Model:</span>
                              <span className="text-white">{entry.deviceModel}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">OS:</span>
                              <span className="text-white">{entry.os}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Carrier:</span>
                              <span className="text-white">{entry.carrier}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Last Seen:</span>
                              <span className="text-white">{entry.lastSeen}</span>
                            </div>
                          </div>
                        </div>

                        {/* Social Media */}
                        {entry.socialMedia && (
                          <div>
                            <h4 className="text-xs font-medium text-gray-500 mb-3 flex items-center gap-2">
                              <Users className="h-3 w-3" />
                              SOCIAL MEDIA
                            </h4>
                            <div className="space-y-2">
                              {entry.socialMedia.facebook && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Facebook className="h-3 w-3 text-blue-500" />
                                  <span className="text-gray-400 truncate">{entry.socialMedia.facebook}</span>
                                </div>
                              )}
                              {entry.socialMedia.instagram && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Instagram className="h-3 w-3 text-pink-500" />
                                  <span className="text-gray-400 truncate">{entry.socialMedia.instagram}</span>
                                </div>
                              )}
                              {entry.socialMedia.twitter && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Twitter className="h-3 w-3 text-sky-500" />
                                  <span className="text-gray-400 truncate">{entry.socialMedia.twitter}</span>
                                </div>
                              )}
                              {entry.socialMedia.linkedin && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Linkedin className="h-3 w-3 text-blue-700" />
                                  <span className="text-gray-400 truncate">{entry.socialMedia.linkedin}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Risk Assessment */}
                      <div className="mt-4 pt-4 border-t border-gray-800/50">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <ShieldAlert className={`h-4 w-4 ${getRiskColor(entry.riskScore)}`} />
                            <span className={`text-sm font-medium ${getRiskColor(entry.riskScore)}`}>
                              Risk Score: {entry.riskScore}
                            </span>
                          </div>
                          {entry.darkWebMentions && (
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                              <span className="text-sm text-red-400">
                                Dark Web: {entry.darkWebMentions} mentions
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-400">
                              Tracked: {new Date(entry.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Delete confirmation */}
                      {showDeleteConfirm === entry.number && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center justify-between">
                          <span className="text-sm text-red-400">Delete this entry permanently?</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => confirmDelete(entry.number)}
                              className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                            >
                              Yes, Delete
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(null)}
                              className="px-3 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Footer Stats */}
        <div className="mt-4 flex items-center justify-between text-xs text-gray-600">
          <span>Showing {filteredHistory.length} of {history.length} entries</span>
          <span>Last updated: {new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* Clear All Confirmation Modal */}
      <AnimatePresence>
        {showClearAllConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1e1f2c] border border-gray-800/50 rounded-lg max-w-md w-full p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-white">Clear All History</h3>
              </div>
              
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete all history entries? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleClearAll}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                >
                  Yes, Clear All
                </button>
                <button
                  onClick={() => setShowClearAllConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}