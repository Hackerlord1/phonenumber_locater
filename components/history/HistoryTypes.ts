// components/history/HistoryTypes.ts
export interface HistoryEntry {
  number: string;
  country: string;
  countryCode: string;
  flag: string;
  region: string;
  city: string;
  street: string;
  location: string;
  latitude: string;
  longitude: string;
  latNum: number;
  lngNum: number;
  carrier?: string;
  deviceModel?: string;
  os?: string;
  lastSeen?: string;
  cityPopulation?: number;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  riskScore?: number;
  darkWebMentions?: number;
  timestamp: number;
}

export interface HistoryStats {
  totalSearches: number;
  uniqueCountries: number;
  lastSearchDate: number | null;
  mostSearchedCountry: string;
  averageRiskScore: number;
}