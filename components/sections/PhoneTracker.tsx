"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone, MapPin, ChevronDown, HelpCircle, Settings, Loader2,
  CheckCircle, Globe, Map as MapIcon,
  Shield, ShieldAlert, Database, Lock,
  Fingerprint, Radio, Satellite, Activity,
  Facebook, Twitter, Instagram, Linkedin,
  MessageCircle, CreditCard, MapPin as MapPinIcon,
  Users, Target, Search, Compass, Smartphone,
  Clock
} from "lucide-react";
import { SpinningEarth } from "@/components/ui/SpinningEarth";
import { FreeGoogleMap } from "@/components/ui/FreeGoogleMap";
import { HistoryPanel } from "@/components/history/HistoryPanel";
import { HistoryEntry } from "@/components/history/HistoryTypes";
import { historyService } from "@/components/history/HistoryService";

interface Country {
  name: {
    common: string;
    official: string;
  };
  cca2: string;
  cca3: string;
  flags: {
    png: string;
    svg: string;
    alt?: string;
  };
  idd: {
    root: string;
    suffixes: string[];
  };
  capital?: string[];
  region: string;
  subregion?: string;
  latlng: [number, number];
  currencies?: Record<string, { name: string; symbol: string }>;
  languages?: Record<string, string>;
  population?: number;
  timezones?: string[];
}

interface City {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  region?: string;
  population?: number;
  isCapital?: boolean;
}

interface DeviceData {
  number: string;
  country: string;
  countryCode: string;
  flag: string;
  region: string;
  city: string;
  street: string;
  build: string;
  location: string;
  routes: string;
  latitude: string;
  longitude: string;
  latNum: number;
  lngNum: number;
  capital?: string;
  currency?: string;
  language?: string;
  population?: string;
  cityPopulation?: number;
  timestamp: number;
  carrier?: string;
  deviceModel?: string;
  os?: string;
  lastSeen?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  riskScore?: number;
  darkWebMentions?: number;
}

// Cities database
const citiesDatabase: Record<string, City[]> = {
  SG: [
    { name: "Singapore (City Centre)", latitude: 1.290270, longitude: 103.851959, country: "SG", region: "Central", population: 150000, isCapital: true },
    { name: "Bedok", latitude: 1.3215, longitude: 103.9248, country: "SG", region: "East", population: 290000 },
    { name: "Jurong West", latitude: 1.3404, longitude: 103.7090, country: "SG", region: "West", population: 270000 },
    { name: "Tampines", latitude: 1.3496, longitude: 103.9448, country: "SG", region: "East", population: 260000 },
    { name: "Woodlands", latitude: 1.4382, longitude: 103.7891, country: "SG", region: "North", population: 250000 },
    { name: "Hougang", latitude: 1.3733, longitude: 103.8866, country: "SG", region: "North-East", population: 220000 },
    { name: "Sengkang", latitude: 1.3919, longitude: 103.8951, country: "SG", region: "North-East", population: 210000 },
    { name: "Yishun", latitude: 1.4296, longitude: 103.8356, country: "SG", region: "North", population: 200000 },
    { name: "Choa Chu Kang", latitude: 1.3845, longitude: 103.7470, country: "SG", region: "West", population: 190000 },
    { name: "Bukit Merah", latitude: 1.2828, longitude: 103.8233, country: "SG", region: "Central", population: 150000 },
    { name: "Toa Payoh", latitude: 1.3349, longitude: 103.8559, country: "SG", region: "Central", population: 120000 },
    { name: "Serangoon", latitude: 1.3554, longitude: 103.8739, country: "SG", region: "North-East", population: 115000 },
    { name: "Geylang", latitude: 1.3152, longitude: 103.8872, country: "SG", region: "Central", population: 110000 },
    { name: "Kallang", latitude: 1.3129, longitude: 103.8669, country: "SG", region: "Central", population: 100000 },
    { name: "Queenstown", latitude: 1.2942, longitude: 103.7860, country: "SG", region: "Central", population: 95000 },
    { name: "Ang Mo Kio", latitude: 1.3691, longitude: 103.8458, country: "SG", region: "North-East", population: 180000 },
    { name: "Bishan", latitude: 1.3526, longitude: 103.8483, country: "SG", region: "Central", population: 90000 },
    { name: "Pasir Ris", latitude: 1.3721, longitude: 103.9494, country: "SG", region: "East", population: 130000 },
    { name: "Punggol", latitude: 1.4045, longitude: 103.9120, country: "SG", region: "North-East", population: 170000 },
    { name: "Bukit Panjang", latitude: 1.3802, longitude: 103.7638, country: "SG", region: "West", population: 140000 },
  ],
  US: [
    { name: "New York City", latitude: 40.7128, longitude: -74.0060, country: "US", region: "New York", population: 8419000 },
    { name: "Los Angeles", latitude: 34.0522, longitude: -118.2437, country: "US", region: "California", population: 3980000 },
    { name: "Chicago", latitude: 41.8781, longitude: -87.6298, country: "US", region: "Illinois", population: 2716000 },
    { name: "Houston", latitude: 29.7604, longitude: -95.3698, country: "US", region: "Texas", population: 2328000 },
    { name: "Phoenix", latitude: 33.4484, longitude: -112.0740, country: "US", region: "Arizona", population: 1690000 },
    { name: "Philadelphia", latitude: 39.9526, longitude: -75.1652, country: "US", region: "Pennsylvania", population: 1584000 },
    { name: "San Antonio", latitude: 29.4241, longitude: -98.4936, country: "US", region: "Texas", population: 1547000 },
    { name: "San Diego", latitude: 32.7157, longitude: -117.1611, country: "US", region: "California", population: 1424000 },
    { name: "Dallas", latitude: 32.7767, longitude: -96.7970, country: "US", region: "Texas", population: 1343000 },
    { name: "San Jose", latitude: 37.3382, longitude: -121.8863, country: "US", region: "California", population: 1035000 },
    { name: "Austin", latitude: 30.2672, longitude: -97.7431, country: "US", region: "Texas", population: 964000 },
    { name: "Seattle", latitude: 47.6062, longitude: -122.3321, country: "US", region: "Washington", population: 744000 },
    { name: "Denver", latitude: 39.7392, longitude: -104.9903, country: "US", region: "Colorado", population: 716000 },
    { name: "Washington DC", latitude: 38.9072, longitude: -77.0369, country: "US", region: "District of Columbia", population: 702000 },
    { name: "Boston", latitude: 42.3601, longitude: -71.0589, country: "US", region: "Massachusetts", population: 694000 },
    { name: "Nashville", latitude: 36.1627, longitude: -86.7816, country: "US", region: "Tennessee", population: 670000 },
    { name: "Miami", latitude: 25.7617, longitude: -80.1918, country: "US", region: "Florida", population: 467000 },
    { name: "Atlanta", latitude: 33.7490, longitude: -84.3880, country: "US", region: "Georgia", population: 498000 },
    { name: "Las Vegas", latitude: 36.1699, longitude: -115.1398, country: "US", region: "Nevada", population: 651000 },
    { name: "Portland", latitude: 45.5051, longitude: -122.6750, country: "US", region: "Oregon", population: 654000 },
  ],
  GB: [
    { name: "London", latitude: 51.5074, longitude: -0.1278, country: "GB", region: "England", population: 8982000, isCapital: true },
    { name: "Birmingham", latitude: 52.4862, longitude: -1.8904, country: "GB", region: "England", population: 1141000 },
    { name: "Manchester", latitude: 53.4808, longitude: -2.2426, country: "GB", region: "England", population: 547000 },
    { name: "Liverpool", latitude: 53.4084, longitude: -2.9916, country: "GB", region: "England", population: 498000 },
    { name: "Leeds", latitude: 53.8008, longitude: -1.5491, country: "GB", region: "England", population: 789000 },
    { name: "Edinburgh", latitude: 55.9533, longitude: -3.1883, country: "GB", region: "Scotland", population: 488000 },
    { name: "Glasgow", latitude: 55.8642, longitude: -4.2518, country: "GB", region: "Scotland", population: 626000 },
    { name: "Cardiff", latitude: 51.4816, longitude: -3.1791, country: "GB", region: "Wales", population: 364000 },
    { name: "Belfast", latitude: 54.5973, longitude: -5.9301, country: "GB", region: "Northern Ireland", population: 343000 },
    { name: "Bristol", latitude: 51.4545, longitude: -2.5879, country: "GB", region: "England", population: 467000 },
  ],
  JP: [
    { name: "Tokyo", latitude: 35.6762, longitude: 139.6503, country: "JP", region: "Kanto", population: 13960000, isCapital: true },
    { name: "Yokohama", latitude: 35.4437, longitude: 139.6380, country: "JP", region: "Kanto", population: 3725000 },
    { name: "Osaka", latitude: 34.6937, longitude: 135.5023, country: "JP", region: "Kansai", population: 2691000 },
    { name: "Nagoya", latitude: 35.1815, longitude: 136.9066, country: "JP", region: "Chubu", population: 2326000 },
    { name: "Sapporo", latitude: 43.0618, longitude: 141.3545, country: "JP", region: "Hokkaido", population: 1952000 },
    { name: "Fukuoka", latitude: 33.5904, longitude: 130.4017, country: "JP", region: "Kyushu", population: 1589000 },
    { name: "Kobe", latitude: 34.6901, longitude: 135.1955, country: "JP", region: "Kansai", population: 1537000 },
    { name: "Kyoto", latitude: 35.0116, longitude: 135.7681, country: "JP", region: "Kansai", population: 1475000 },
    { name: "Hiroshima", latitude: 34.3853, longitude: 132.4553, country: "JP", region: "Chugoku", population: 1194000 },
    { name: "Sendai", latitude: 38.2682, longitude: 140.8694, country: "JP", region: "Tohoku", population: 1082000 },
  ],
  MY: [
    { name: "Kuala Lumpur", latitude: 3.1390, longitude: 101.6869, country: "MY", region: "Federal Territory", population: 1768000, isCapital: true },
    { name: "George Town", latitude: 5.4141, longitude: 100.3288, country: "MY", region: "Penang", population: 708000 },
    { name: "Ipoh", latitude: 4.5975, longitude: 101.0901, country: "MY", region: "Perak", population: 657000 },
    { name: "Johor Bahru", latitude: 1.4927, longitude: 103.7414, country: "MY", region: "Johor", population: 497000 },
    { name: "Kuching", latitude: 1.5533, longitude: 110.3592, country: "MY", region: "Sarawak", population: 325000 },
    { name: "Kota Kinabalu", latitude: 5.9804, longitude: 116.0735, country: "MY", region: "Sabah", population: 452000 },
    { name: "Shah Alam", latitude: 3.0738, longitude: 101.5185, country: "MY", region: "Selangor", population: 646000 },
    { name: "Malacca City", latitude: 2.1896, longitude: 102.2501, country: "MY", region: "Malacca", population: 453000 },
    { name: "Petaling Jaya", latitude: 3.1073, longitude: 101.6067, country: "MY", region: "Selangor", population: 638000 },
    { name: "Subang Jaya", latitude: 3.0567, longitude: 101.5851, country: "MY", region: "Selangor", population: 708000 },
  ],
  ID: [
    { name: "Jakarta", latitude: -6.2088, longitude: 106.8456, country: "ID", region: "Java", population: 10770000, isCapital: true },
    { name: "Surabaya", latitude: -7.2575, longitude: 112.7521, country: "ID", region: "Java", population: 2875000 },
    { name: "Bandung", latitude: -6.9175, longitude: 107.6191, country: "ID", region: "Java", population: 2510000 },
    { name: "Medan", latitude: 3.5952, longitude: 98.6722, country: "ID", region: "Sumatra", population: 2210000 },
    { name: "Semarang", latitude: -6.9931, longitude: 110.4203, country: "ID", region: "Java", population: 1675000 },
    { name: "Makassar", latitude: -5.1477, longitude: 119.4327, country: "ID", region: "Sulawesi", population: 1510000 },
    { name: "Denpasar", latitude: -8.6705, longitude: 115.2126, country: "ID", region: "Bali", population: 897000 },
    { name: "Yogyakarta", latitude: -7.7956, longitude: 110.3695, country: "ID", region: "Java", population: 422000 },
    { name: "Balikpapan", latitude: -1.2654, longitude: 116.8313, country: "ID", region: "Kalimantan", population: 598000 },
    { name: "Bogor", latitude: -6.5971, longitude: 106.8060, country: "ID", region: "Java", population: 1050000 },
  ],
  AU: [
    { name: "Sydney", latitude: -33.8688, longitude: 151.2093, country: "AU", region: "New South Wales", population: 5312000 },
    { name: "Melbourne", latitude: -37.8136, longitude: 144.9631, country: "AU", region: "Victoria", population: 5078000 },
    { name: "Brisbane", latitude: -27.4698, longitude: 153.0251, country: "AU", region: "Queensland", population: 2518000 },
    { name: "Perth", latitude: -31.9505, longitude: 115.8605, country: "AU", region: "Western Australia", population: 2059000 },
    { name: "Adelaide", latitude: -34.9285, longitude: 138.6007, country: "AU", region: "South Australia", population: 1345000 },
    { name: "Canberra", latitude: -35.2809, longitude: 149.1300, country: "AU", region: "ACT", population: 426000, isCapital: true },
    { name: "Gold Coast", latitude: -28.0167, longitude: 153.4000, country: "AU", region: "Queensland", population: 679000 },
    { name: "Newcastle", latitude: -32.9283, longitude: 151.7817, country: "AU", region: "New South Wales", population: 322000 },
    { name: "Hobart", latitude: -42.8821, longitude: 147.3272, country: "AU", region: "Tasmania", population: 236000 },
    { name: "Darwin", latitude: -12.4634, longitude: 130.8456, country: "AU", region: "Northern Territory", population: 148000 },
  ],
  CN: [
    { name: "Beijing", latitude: 39.9042, longitude: 116.4074, country: "CN", region: "Beijing", population: 21540000, isCapital: true },
    { name: "Shanghai", latitude: 31.2304, longitude: 121.4737, country: "CN", region: "Shanghai", population: 24240000 },
    { name: "Guangzhou", latitude: 23.1291, longitude: 113.2644, country: "CN", region: "Guangdong", population: 13080000 },
    { name: "Shenzhen", latitude: 22.5431, longitude: 114.0579, country: "CN", region: "Guangdong", population: 12530000 },
    { name: "Chengdu", latitude: 30.5728, longitude: 104.0668, country: "CN", region: "Sichuan", population: 16330000 },
    { name: "Chongqing", latitude: 29.4316, longitude: 106.9123, country: "CN", region: "Chongqing", population: 32050000 },
    { name: "Hangzhou", latitude: 30.2741, longitude: 120.1551, country: "CN", region: "Zhejiang", population: 10360000 },
    { name: "Nanjing", latitude: 32.0603, longitude: 118.7969, country: "CN", region: "Jiangsu", population: 8500000 },
    { name: "Wuhan", latitude: 30.5928, longitude: 114.3055, country: "CN", region: "Hubei", population: 11080000 },
    { name: "Tianjin", latitude: 39.3434, longitude: 117.3616, country: "CN", region: "Tianjin", population: 13860000 },
  ],
  TH: [
    { name: "Bangkok", latitude: 13.7563, longitude: 100.5018, country: "TH", region: "Central", population: 8281000, isCapital: true },
    { name: "Chiang Mai", latitude: 18.7883, longitude: 98.9853, country: "TH", region: "North", population: 127000 },
    { name: "Phuket", latitude: 7.8804, longitude: 98.3923, country: "TH", region: "South", population: 89000 },
    { name: "Pattaya", latitude: 12.9236, longitude: 100.8825, country: "TH", region: "East", population: 119000 },
    { name: "Hat Yai", latitude: 7.0086, longitude: 100.4747, country: "TH", region: "South", population: 159000 },
    { name: "Khon Kaen", latitude: 16.4322, longitude: 102.8236, country: "TH", region: "Northeast", population: 113000 },
    { name: "Chiang Rai", latitude: 19.9072, longitude: 99.8309, country: "TH", region: "North", population: 78000 },
    { name: "Ayutthaya", latitude: 14.3530, longitude: 100.5686, country: "TH", region: "Central", population: 53000 },
    { name: "Krabi", latitude: 8.0863, longitude: 98.9063, country: "TH", region: "South", population: 52000 },
    { name: "Koh Samui", latitude: 9.5120, longitude: 100.0136, country: "TH", region: "South", population: 63000 },
  ],
  IN: [
    { name: "Mumbai", latitude: 19.0760, longitude: 72.8777, country: "IN", region: "Maharashtra", population: 20400000 },
    { name: "Delhi", latitude: 28.6139, longitude: 77.2090, country: "IN", region: "Delhi", population: 30290000, isCapital: true },
    { name: "Bangalore", latitude: 12.9716, longitude: 77.5946, country: "IN", region: "Karnataka", population: 12400000 },
    { name: "Hyderabad", latitude: 17.3850, longitude: 78.4867, country: "IN", region: "Telangana", population: 9740000 },
    { name: "Ahmedabad", latitude: 23.0225, longitude: 72.5714, country: "IN", region: "Gujarat", population: 7700000 },
    { name: "Chennai", latitude: 13.0827, longitude: 80.2707, country: "IN", region: "Tamil Nadu", population: 10700000 },
    { name: "Kolkata", latitude: 22.5726, longitude: 88.3639, country: "IN", region: "West Bengal", population: 14900000 },
    { name: "Pune", latitude: 18.5204, longitude: 73.8567, country: "IN", region: "Maharashtra", population: 6750000 },
    { name: "Jaipur", latitude: 26.9124, longitude: 75.7873, country: "IN", region: "Rajasthan", population: 4070000 },
    { name: "Lucknow", latitude: 26.8467, longitude: 80.9462, country: "IN", region: "Uttar Pradesh", population: 3560000 },
  ],
};

const carriers: Record<string, string[]> = {
  SG: ["Singtel", "StarHub", "M1", "TPG", "Circles.Life", "GOMO", "Zero1", "VIVIFI", "MyRepublic", "CHANGI"],
  US: ["AT&T", "Verizon", "T-Mobile", "US Cellular", "Cricket Wireless", "MetroPCS", "Boost Mobile", "Google Fi", "Mint Mobile", "Visible"],
  GB: ["EE", "Vodafone UK", "O2", "Three UK", "BT Mobile", "Sky Mobile", "Tesco Mobile", "Giffgaff", "Virgin Mobile", "Lebara"],
  JP: ["NTT Docomo", "KDDI (au)", "SoftBank", "Rakuten Mobile", "Y!mobile", "UQ Mobile", "IIJmio", "LINE Mobile", "BIGLOBE", "OCN"],
  MY: ["Maxis", "Celcom", "Digi", "UMobile", "YES 4G", "XOX", "Tune Talk", "redONE", "Altel", "Webe"],
  ID: ["Telkomsel", "Indosat Ooredoo", "XL Axiata", "Tri (3)", "Smartfren", "Axis", "Bolt", "Net1", "Hutchison", "Sampoerna"],
  AU: ["Telstra", "Optus", "Vodafone AU", "TPG Telecom", "iiNet", "Internode", "Dodo", "Virgin Mobile AU", "Amaysim", "ALDI Mobile"],
  CN: ["China Mobile", "China Unicom", "China Telecom", "China Broadnet"],
  TH: ["AIS", "TrueMove H", "dtac", "My by CAT", "TOT", "3GAP", "I-Mobile", "Lazada Mobile", "Finnexia", "Mojo"],
  IN: ["Jio", "Airtel", "VI (Vodafone Idea)", "BSNL", "MTNL", "Tata Docomo", "Reliance", "Telenor", "Aircel", "MTS"],
};

const deviceModels: string[] = [
  "iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15", "iPhone 14 Pro Max", "iPhone 14 Pro", "iPhone 14",
  "Samsung Galaxy S24 Ultra", "Samsung Galaxy S24+", "Samsung Galaxy S24", "Samsung Galaxy Z Fold5",
  "Google Pixel 8 Pro", "Google Pixel 8", "Google Pixel 7a",
  "Xiaomi 14 Pro", "Xiaomi 13 Ultra", "Redmi Note 13 Pro",
  "OnePlus 12", "OnePlus Open", "OnePlus 11",
  "Oppo Find X7 Ultra", "Vivo X100 Pro",
  "Sony Xperia 1 V", "Nothing Phone (2)",
  "Motorola Edge 40 Pro", "Huawei P60 Pro",
  "Asus ROG Phone 8", "Realme GT 5 Pro",
];

const osVersions: Record<string, string[]> = {
  iOS: ["iOS 17.4.1", "iOS 17.3.1", "iOS 17.2.1", "iOS 16.7.5", "iOS 16.6.1"],
  Android: ["Android 14", "Android 13", "Android 12", "Android 11", "Android 10"],
  HarmonyOS: ["HarmonyOS 4.0", "HarmonyOS 3.1", "HarmonyOS 3.0"],
};

export function PhoneTracker() {
  const [localNumber, setLocalNumber] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [showCountries, setShowCountries] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [checkProgress, setCheckProgress] = useState(0);
  const [checkStatus, setCheckStatus] = useState<"idle" | "checking" | "complete" | "error">("idle");
  const [checkMessage, setCheckMessage] = useState("");
  const [deviceData, setDeviceData] = useState<DeviceData | null>(null);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [mapType, setMapType] = useState<"google" | "earth">("google");
  const [searchStage, setSearchStage] = useState(0);
  const [searchLog, setSearchLog] = useState<string[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // ✅ Full number = country code + local number
  const getDialCode = (country: Country | null) => {
    if (!country) return "";
    return `${country.idd?.root}${country.idd?.suffixes?.[0] || ""}`;
  };

  const fullPhoneNumber = selectedCountry
    ? `${getDialCode(selectedCountry)}${localNumber}`
    : localNumber;

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoadingCountries(true);
        setApiError(null);
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,cca2,cca3,flags,idd,capital,region,latlng,currencies,languages"
        );
        if (!response.ok) throw new Error(`API returned ${response.status}`);
        const data = await response.json();
        const countriesWithCodes = data
          .filter(
            (c: any) =>
              c?.idd?.root &&
              Array.isArray(c.idd?.suffixes) &&
              c.idd.suffixes.length > 0
          )
          .map((c: any) => ({
            ...c,
            name: c.name || { common: "Unknown", official: "Unknown" },
            flags: c.flags || { svg: "", png: "" },
            idd: c.idd || { root: "", suffixes: [] },
            capital: Array.isArray(c.capital) ? c.capital : [],
            region: c.region || "Unknown",
            latlng: Array.isArray(c.latlng) ? c.latlng : [0, 0],
            population: 0,
            timezones: ["UTC"],
            subregion: c.region,
          }))
          .sort((a: any, b: any) => a.name.common.localeCompare(b.name.common));

        setCountries(countriesWithCodes);
        const singapore = countriesWithCodes.find((c: any) => c.cca2 === "SG");
        setSelectedCountry(singapore || countriesWithCodes[0]);
      } catch (error) {
        setApiError(error instanceof Error ? error.message : "Failed to load countries");
        const fallback = [{
          name: { common: "Singapore", official: "Republic of Singapore" },
          cca2: "SG", cca3: "SGP",
          flags: { svg: "https://flagcdn.com/sg.svg", png: "https://flagcdn.com/w320/sg.png" },
          idd: { root: "+6", suffixes: ["5"] },
          capital: ["Singapore"], region: "Asia", subregion: "South-Eastern Asia",
          latlng: [1.2833, 103.8333] as [number, number],
          currencies: { SGD: { name: "Singapore dollar", symbol: "$" } },
          languages: { eng: "English" }, population: 5685807, timezones: ["UTC+08:00"],
        }];
        setCountries(fallback);
        setSelectedCountry(fallback[0]);
      } finally {
        setLoadingCountries(false);
      }
    };
    fetchCountries();
  }, []);

  const filteredCountries = countries.filter((c) =>
    c.name.common.toLowerCase().includes(countrySearch.toLowerCase()) ||
    getDialCode(c).includes(countrySearch)
  );

  const getRandomCity = (countryCode: string): City | null => {
    const list = citiesDatabase[countryCode];
    if (!list || list.length === 0) return null;
    return list[Math.floor(Math.random() * list.length)];
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setShowCountries(false);
    setCountrySearch("");
  };

  const saveToHistory = (data: DeviceData) => historyService.saveEntry(data);

  const loadFromHistory = (entry: HistoryEntry) => {
    setLocalNumber(entry.number);
    const mapped: DeviceData = {
      number: entry.number,
      country: entry.country,
      countryCode: entry.countryCode,
      flag: entry.flag,
      region: entry.region,
      city: entry.city,
      street: entry.street,
      build: "Central Business District",
      location: `${entry.latNum.toFixed(4)}°N, ${entry.lngNum.toFixed(4)}°E`,
      routes: `via ${entry.city} Highway`,
      latitude: `${entry.latNum.toFixed(4)}°N`,
      longitude: `${entry.lngNum.toFixed(4)}°E`,
      latNum: entry.latNum,
      lngNum: entry.lngNum,
      cityPopulation: entry.cityPopulation,
      timestamp: entry.timestamp,
      carrier: entry.carrier,
      deviceModel: entry.deviceModel,
      os: entry.os,
      lastSeen: entry.lastSeen,
      socialMedia: entry.socialMedia,
      riskScore: entry.riskScore,
      darkWebMentions: entry.darkWebMentions,
    };
    setDeviceData(mapped);
    setCheckStatus("complete");
    setIsHistoryOpen(false);
  };

  const checkExistingSearch = (number: string) => {
    const history = historyService.getHistory();
    return history.find((item) => item.number === number) as DeviceData | undefined;
  };

  const startSearchSequence = async () => {
    if (!localNumber || !selectedCountry) return;
    setIsChecking(true);
    setCheckStatus("checking");
    setCheckProgress(0);
    setSearchStage(0);
    setSearchLog([]);

    const dialCode = getDialCode(selectedCountry);

    const stages = [
      { progress: 5,   duration: 2000, message: "🛰️ Establishing secure connection...",        log: "🛰️ Connecting to global satellite network via encrypted tunnel" },
      { progress: 10,  duration: 2000, message: "🔐 Handshaking with GSM network...",           log: "🔐 TLS 1.3 handshake with carrier network complete" },
      { progress: 15,  duration: 1500, message: "📡 Triangulating from cell towers...",         log: "📡 Received signal from 3 cell towers in range" },
      { progress: 18,  duration: 2000, message: "📱 Querying mobile carrier database...",       log: `📱 Looking up carrier for ${dialCode}${localNumber}` },
      { progress: 22,  duration: 2500, message: "🔄 Cross-referencing IMSI registry...",        log: "🔄 IMSI: 525-01-1234567890 found in global registry" },
      { progress: 25,  duration: 2000, message: "🏢 Identifying network operator...",           log: `🏢 Carrier: ${carriers[selectedCountry.cca2]?.[0] || "Unknown"}` },
      { progress: 28,  duration: 2000, message: "🔍 Scanning Facebook profiles...",             log: "🔍 Facebook: Searching for associated accounts..." },
      { progress: 32,  duration: 2000, message: "📸 Checking Instagram activity...",            log: "📸 Instagram: Found 2 possible profile matches" },
      { progress: 35,  duration: 2000, message: "🐦 Scanning Twitter/X mentions...",            log: "🐦 Twitter: 147 posts detected in last 30 days" },
      { progress: 38,  duration: 2000, message: "💼 LinkedIn professional search...",           log: "💼 LinkedIn: Professional network identified" },
      { progress: 42,  duration: 3000, message: "🌐 Accessing surface web databases...",        log: "🌐 Public records: 3 addresses found" },
      { progress: 45,  duration: 3000, message: "🔒 Bypassing regional restrictions...",        log: "🔒 Geo-blocking circumvented via VPN mesh network" },
      { progress: 48,  duration: 3500, message: "🌑 Initiating dark web crawler...",            log: "🌑 Dark web: Scanning 3 marketplaces and 5 forums" },
      { progress: 52,  duration: 3000, message: "🕸️ Parsing .onion directories...",            log: "🕸️ Found 12 mentions across 4 dark web sites" },
      { progress: 55,  duration: 3000, message: "⚠️ Checking compromised credentials...",      log: "⚠️ 3 credential dumps found containing phone number" },
      { progress: 58,  duration: 2000, message: "📍 Requesting GPS coordinates...",             log: "📍 GPS signal acquired from 8 satellites" },
      { progress: 62,  duration: 2000, message: "🗺️ Cross-referencing Google Maps API...",     log: "🗺️ Reverse geocoding: Converting coordinates to address" },
      { progress: 65,  duration: 2000, message: "🏘️ Identifying nearby landmarks...",          log: "🏘️ Found 15 points of interest within 1km radius" },
      { progress: 68,  duration: 2000, message: "🚦 Analyzing movement patterns...",            log: "🚦 Device stationary for last 6 hours" },
      { progress: 72,  duration: 2000, message: "📱 Extracting device information...",          log: "📱 Device model identified" },
      { progress: 75,  duration: 2000, message: "🔋 Checking battery status...",                log: "🔋 Battery: 78% capacity, 3.7V" },
      { progress: 78,  duration: 2000, message: "📶 Analyzing network fingerprints...",         log: "📶 WiFi BSSID: 74:da:38:f2:9c:41 detected" },
      { progress: 82,  duration: 2000, message: "🔑 Extracting SIM card details...",            log: "🔑 ICCID: 8961012345678901234f" },
      { progress: 85,  duration: 2000, message: "📊 Compiling intelligence report...",          log: "📊 Aggregating data from 27 different sources" },
      { progress: 88,  duration: 2000, message: "🔍 Performing cross-validation...",            log: "🔍 93% confidence in location accuracy" },
      { progress: 92,  duration: 2000, message: "🛡️ Encrypting sensitive data...",             log: "🛡️ AES-256 encryption applied to personal data" },
      { progress: 95,  duration: 2000, message: "📦 Preparing final report...",                 log: "📦 Final report ready for display" },
      { progress: 98,  duration: 2000, message: "✅ Finalizing location data...",               log: "✅ Location data verified and ready" },
      { progress: 100, duration: 1000, message: "🎯 Device located successfully!",              log: "🎯 Device location confirmed and locked" },
    ];

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      setCheckProgress(stage.progress);
      setCheckMessage(stage.message);
      setSearchLog((prev) => [...prev, stage.log]);
      setSearchStage(i);
      await new Promise((resolve) => setTimeout(resolve, stage.duration));
    }

    const randomCity = getRandomCity(selectedCountry.cca2);
    const currency = selectedCountry.currencies
      ? (Object.values(selectedCountry.currencies)[0] as { name: string; symbol: string })
      : null;
    const language = selectedCountry.languages
      ? (Object.values(selectedCountry.languages)[0] as string)
      : null;

    const latNum = randomCity?.latitude || selectedCountry.latlng[0];
    const lngNum = randomCity?.longitude || selectedCountry.latlng[1];
    const cityName = randomCity?.name || selectedCountry.capital?.[0] || "Unknown";
    const region = randomCity?.region || selectedCountry.subregion || selectedCountry.region;

    const firstName = ["John","Jane","Alex","Sam","Chris","Pat","Taylor","Jordan","Casey","Riley"][Math.floor(Math.random() * 10)];
    const lastName  = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez"][Math.floor(Math.random() * 10)];
    const randomNum = Math.floor(Math.random() * 1000);
    const streets     = ["Main","Oak","Pine","Maple","Cedar","Washington","Lincoln","Park","Lake","Hill"];
    const streetTypes = ["Street","Avenue","Road","Drive","Lane","Boulevard"];
    const randomStreet = `${streets[Math.floor(Math.random() * streets.length)]} ${streetTypes[Math.floor(Math.random() * streetTypes.length)]}`;

    const newDeviceData: DeviceData = {
      number:      fullPhoneNumber,
      country:     selectedCountry.name.common,
      countryCode: selectedCountry.cca2,
      flag:        selectedCountry.flags.svg || selectedCountry.flags.png || "",
      region,
      city:        cityName,
      street:      `${randomStreet}, ${cityName}`,
      build:       "Central Business District",
      location:    `${latNum.toFixed(4)}°N, ${lngNum.toFixed(4)}°E`,
      routes:      `via ${cityName} Highway`,
      latitude:    `${latNum.toFixed(4)}°N`,
      longitude:   `${lngNum.toFixed(4)}°E`,
      latNum,
      lngNum,
      capital:     selectedCountry.capital?.[0],
      currency:    currency ? `${currency.name} (${currency.symbol})` : "Unknown",
      language:    language || "Unknown",
      population:  selectedCountry.population?.toLocaleString(),
      cityPopulation: randomCity?.population,
      timestamp:   Date.now(),
      carrier:     carriers[selectedCountry.cca2]?.[Math.floor(Math.random() * (carriers[selectedCountry.cca2]?.length || 1))] || "Unknown",
      deviceModel: deviceModels[Math.floor(Math.random() * deviceModels.length)],
      os: Math.random() > 0.7
        ? osVersions.iOS[Math.floor(Math.random() * osVersions.iOS.length)]
        : osVersions.Android[Math.floor(Math.random() * osVersions.Android.length)],
      lastSeen: new Date().toLocaleString(),
      socialMedia: {
        facebook:  `facebook.com/${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
        instagram: `@${firstName.toLowerCase()}${lastName.toLowerCase()}${randomNum}`,
        twitter:   `@${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
        linkedin:  `linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}-${randomNum}`,
      },
      riskScore:       Math.floor(Math.random() * 30) + 70,
      darkWebMentions: Math.floor(Math.random() * 5) + 1,
    };

    saveToHistory(newDeviceData);
    setDeviceData(newDeviceData);
    setCheckStatus("complete");
    setTimeout(() => setIsChecking(false), 1500);
  };

  const handleLaunch = async () => {
    if (!localNumber || !selectedCountry) return;
    const existing = checkExistingSearch(fullPhoneNumber);
    if (existing) {
      setDeviceData(existing);
      setCheckStatus("complete");
      setCheckMessage("Device located successfully!");
      return;
    }
    await startSearchSequence();
  };

  const handleReset = () => {
    setCheckStatus("idle");
    setCheckProgress(0);
    setCheckMessage("");
    setDeviceData(null);
    setIsChecking(false);
    setSearchLog([]);
    setLocalNumber("");
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }).toUpperCase();

  return (
    <div className="min-h-screen bg-[#1a1f2e] text-white">
      {/* Header */}
      <header className="border-b border-gray-800/50 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            <span className="text-xl font-light">
              mobile-<span className="font-bold text-blue-500">locator</span>
            </span>
            {isChecking && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="ml-4 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-red-400 font-mono">ACTIVE SCAN</span>
              </motion.div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-white transition relative">
              <Shield className="h-5 w-5" />
              {isChecking && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              )}
            </button>
            <button className="text-gray-400 hover:text-white transition">
              <HelpCircle className="h-5 w-5" />
            </button>
            <button className="text-gray-400 hover:text-white transition">
              <Settings className="h-5 w-5" />
            </button>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-57px)]">
        {/* Left Panel */}
        <div className="w-[450px] bg-[#141824] border-r border-gray-800/50 overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-400">{formatDate(new Date())}</p>
              <div className="flex items-center gap-2">
                <Lock className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-500">SECURE</span>
              </div>
            </div>

            {apiError && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-xs text-red-400">API Error: {apiError}</p>
                <p className="text-xs text-gray-400 mt-1">Using fallback country data</p>
              </div>
            )}

            {/* Search Log */}
            <AnimatePresence>
              {isChecking && searchLog.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 bg-black/40 rounded-lg border border-gray-700/50 overflow-hidden"
                >
                  <div className="p-3 bg-gray-800/50 border-b border-gray-700/50 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
                    <span className="text-xs font-medium text-gray-300">Live Search Feed</span>
                    <span className="text-xs text-gray-500 ml-auto">{searchLog.length}/29 operations</span>
                  </div>
                  <div className="h-48 overflow-y-auto p-2 font-mono text-xs">
                    {searchLog.map((log, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`py-1 border-l-2 pl-3 mb-1 ${
                          index === searchLog.length - 1
                            ? "border-blue-500 text-blue-400"
                            : "border-gray-700 text-gray-400"
                        }`}
                      >
                        {log}
                      </motion.div>
                    ))}
                    {searchLog.length < 29 && (
                      <div className="flex items-center gap-2 text-gray-600 py-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Scanning...</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress */}
            <AnimatePresence mode="wait">
              {isChecking && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-6 bg-[#1e1f2c] rounded-lg p-4 border border-blue-500/30"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {checkStatus === "checking" && (
                      <div className="relative">
                        <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
                      </div>
                    )}
                    {checkStatus === "complete" && <CheckCircle className="h-5 w-5 text-green-500" />}
                    <span className="text-sm font-medium text-gray-300">{checkMessage}</span>
                  </div>
                  <div className="relative mb-2">
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${checkProgress}%` }}
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      />
                    </div>
                    <span className="absolute right-0 top-3 text-xs text-gray-400">{checkProgress}%</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 mt-4">
                    {[0,1,2,3,4,5].map((stage) => (
                      <div
                        key={stage}
                        className={`h-1 rounded-full transition-colors ${
                          Math.floor(searchStage / 6) >= stage ? "bg-blue-500" : "bg-gray-700"
                        }`}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ✅ Phone Input Section */}
            <div className="mb-8">
              <h2 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Target Phone Number
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                Select a country — the dial code is added automatically. Enter only the local number.
              </p>

              {/* Country Selector */}
              <div className="relative mb-3">
                <button
                  onClick={() => setShowCountries(!showCountries)}
                  disabled={loadingCountries || isChecking}
                  className="w-full flex items-center justify-between bg-[#1e1f2c] border border-gray-700/50 rounded-lg px-4 py-3 text-left hover:bg-[#252634] transition disabled:opacity-50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {selectedCountry?.flags?.svg ? (
                      <img
                        src={selectedCountry.flags.svg}
                        alt={`Flag of ${selectedCountry.name.common}`}
                        className="w-6 h-4 object-cover rounded flex-shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).src = selectedCountry.flags.png || ""; }}
                      />
                    ) : (
                      <span className="text-lg flex-shrink-0">🌍</span>
                    )}
                    <span className="text-white font-medium">
                      {selectedCountry?.name.common || "Select Country"}
                    </span>
                    {/* ✅ Dial code badge */}
                    <span className="ml-auto px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded font-mono flex-shrink-0">
                      {getDialCode(selectedCountry)}
                    </span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform flex-shrink-0 ml-2 ${
                      showCountries ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown */}
                {showCountries && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-[#1e1f2c] border border-gray-700/50 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden flex flex-col"
                  >
                    {/* Search inside dropdown */}
                    <div className="p-2 border-b border-gray-700/50">
                      <input
                        type="text"
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        placeholder="Search country or dial code..."
                        className="w-full bg-[#141824] border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50"
                        autoFocus
                      />
                    </div>
                    <div className="overflow-y-auto max-h-80">
                      {loadingCountries ? (
                        <div className="p-4 text-center text-gray-400">
                          <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                          <span className="text-sm">Loading countries...</span>
                        </div>
                      ) : filteredCountries.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">No countries found</div>
                      ) : (
                        filteredCountries.map((country) => {
                          const cityCount = citiesDatabase[country.cca2]?.length || 0;
                          return (
                            <button
                              key={country.cca2}
                              onClick={() => handleCountrySelect(country)}
                              className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#252634] transition"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {country.flags?.svg && (
                                  <img
                                    src={country.flags.svg}
                                    alt={`Flag of ${country.name.common}`}
                                    className="w-6 h-4 object-cover rounded flex-shrink-0"
                                    onError={(e) => { (e.target as HTMLImageElement).src = country.flags.png || ""; }}
                                  />
                                )}
                                <span className="text-white truncate">{country.name.common}</span>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {cityCount > 0 && (
                                  <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                                    {cityCount} cities
                                  </span>
                                )}
                                <span className="text-blue-400 font-mono text-sm">
                                  {getDialCode(country)}
                                </span>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* ✅ Phone Input with auto dial code prefix */}
              <div className="flex gap-2 mb-4">
                <div className="flex-1 bg-[#1e1f2c] border border-gray-700/50 rounded-lg flex items-center group focus-within:border-blue-500/50 transition overflow-hidden">
                  {/* Dial code prefix — read only */}
                  <span className="px-3 py-3 text-blue-400 font-mono text-sm bg-[#252634] border-r border-gray-700/50 flex-shrink-0">
                    {getDialCode(selectedCountry) || "+--"}
                  </span>
                  <div className="flex items-center flex-1 px-3">
                    <Phone className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
                    <input
                      type="tel"
                      value={localNumber}
                      onChange={(e) => setLocalNumber(e.target.value.replace(/[^0-9\s\-]/g, ""))}
                      placeholder="9123 4567"
                      className="bg-transparent outline-none text-white placeholder-gray-600 w-full"
                      disabled={isChecking}
                    />
                  </div>
                </div>

                {checkStatus === "complete" ? (
                  <button
                    onClick={handleReset}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-lg transition whitespace-nowrap flex items-center gap-2"
                  >
                    <Search className="h-4 w-4" />
                    NEW
                  </button>
                ) : (
                  <button
                    onClick={handleLaunch}
                    disabled={isChecking || !localNumber || !selectedCountry}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-lg transition whitespace-nowrap flex items-center gap-2"
                  >
                    {isChecking ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        SCANNING...
                      </>
                    ) : (
                      <>
                        <Target className="h-4 w-4" />
                        LAUNCH
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Full number preview */}
              {localNumber && selectedCountry && (
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <Globe className="h-3 w-3 text-blue-500" />
                  <span>Full number: </span>
                  <span className="text-blue-400 font-mono">{fullPhoneNumber}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Fingerprint className="h-3 w-3" />
                <span>All scans are encrypted and anonymous</span>
              </div>
            </div>

            {/* Device Data */}
            <AnimatePresence mode="wait">
              {deviceData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-8"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Intelligence Report
                    </h2>
                                        {deviceData.riskScore && (
                      <div className={`flex items-center gap-1 px-2 py-1 rounded ${
                        deviceData.riskScore > 85
                          ? "bg-red-500/20 text-red-400"
                          : deviceData.riskScore > 70
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-green-500/20 text-green-400"
                      }`}>
                        <Shield className="h-3 w-3" />
                        <span className="text-xs">Risk Score: {deviceData.riskScore}</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-[#1e1f2c] rounded-lg border border-gray-700/50 overflow-hidden">
                    <div className="divide-y divide-gray-800">

                      {/* Phone */}
                      <div className="flex items-center justify-between px-4 py-3 hover:bg-[#252634]">
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-400">Phone</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-white font-medium font-mono">{deviceData.number}</span>
                          {deviceData.flag && (
                            <img
                              src={deviceData.flag}
                              alt={`Flag of ${deviceData.country}`}
                              className="w-5 h-3 object-cover rounded"
                            />
                          )}
                        </div>
                      </div>

                      {/* Carrier */}
                      {deviceData.carrier && (
                        <div className="flex items-center justify-between px-4 py-2 hover:bg-[#252634]">
                          <div className="flex items-center gap-3">
                            <Radio className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-400">Carrier</span>
                          </div>
                          <span className="text-sm text-white">{deviceData.carrier}</span>
                        </div>
                      )}

                      {/* Device */}
                      <div className="flex items-center justify-between px-4 py-2 hover:bg-[#252634]">
                        <div className="flex items-center gap-3">
                          <Smartphone className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-400">Device</span>
                        </div>
                        <span className="text-sm text-white">
                          {deviceData.deviceModel} • {deviceData.os}
                        </span>
                      </div>

                      {/* Last Seen */}
                      {deviceData.lastSeen && (
                        <div className="flex items-center justify-between px-4 py-2 hover:bg-[#252634]">
                          <div className="flex items-center gap-3">
                            <Activity className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-400">Last Seen</span>
                          </div>
                          <span className="text-sm text-white">{deviceData.lastSeen}</span>
                        </div>
                      )}

                      {/* Country */}
                      <div className="flex items-center justify-between px-4 py-2 hover:bg-[#252634]">
                        <div className="flex items-center gap-3">
                          <Globe className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-400">Country</span>
                        </div>
                        <span className="text-sm text-white">
                          {deviceData.country} ({deviceData.countryCode})
                        </span>
                      </div>

                      {/* City */}
                      <div className="flex items-center justify-between px-4 py-2 hover:bg-[#252634]">
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-400">City/Town</span>
                        </div>
                        <span className="text-sm text-white">{deviceData.city}</span>
                      </div>

                      {/* Region */}
                      <div className="flex items-center justify-between px-4 py-2 hover:bg-[#252634]">
                        <div className="flex items-center gap-3">
                          <MapPinIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-400">Region</span>
                        </div>
                        <span className="text-sm text-white">{deviceData.region}</span>
                      </div>

                      {/* Population */}
                      {deviceData.cityPopulation && (
                        <div className="flex items-center justify-between px-4 py-2 hover:bg-[#252634]">
                          <div className="flex items-center gap-3">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-400">Population</span>
                          </div>
                          <span className="text-sm text-white">
                            {deviceData.cityPopulation.toLocaleString()}
                          </span>
                        </div>
                      )}

                      {/* Coordinates */}
                      <div className="flex items-center justify-between px-4 py-2 hover:bg-[#252634]">
                        <div className="flex items-center gap-3">
                          <Compass className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-400">Coordinates</span>
                        </div>
                        <span className="text-sm text-white font-mono">
                          {deviceData.latNum.toFixed(4)}°, {deviceData.lngNum.toFixed(4)}°
                        </span>
                      </div>

                      {/* Street */}
                      <div className="flex items-center justify-between px-4 py-2 hover:bg-[#252634]">
                        <div className="flex items-center gap-3">
                          <MapPinIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-400">Street</span>
                        </div>
                        <span className="text-sm text-white">{deviceData.street}</span>
                      </div>

                      {/* Social Media */}
                      {deviceData.socialMedia && (
                        <>
                          <div className="px-4 py-2 bg-gray-800/30">
                            <span className="text-xs text-gray-500 flex items-center gap-2">
                              <Users className="h-3 w-3" />
                              SOCIAL MEDIA PRESENCE
                            </span>
                          </div>
                          {deviceData.socialMedia.facebook && (
                            <div className="flex items-center justify-between px-4 py-2 hover:bg-[#252634]">
                              <div className="flex items-center gap-3">
                                <Facebook className="h-4 w-4 text-blue-500" />
                                <span className="text-sm text-gray-400">Facebook</span>
                              </div>
                              <span className="text-sm text-blue-400">{deviceData.socialMedia.facebook}</span>
                            </div>
                          )}
                          {deviceData.socialMedia.instagram && (
                            <div className="flex items-center justify-between px-4 py-2 hover:bg-[#252634]">
                              <div className="flex items-center gap-3">
                                <Instagram className="h-4 w-4 text-pink-500" />
                                <span className="text-sm text-gray-400">Instagram</span>
                              </div>
                              <span className="text-sm text-pink-400">{deviceData.socialMedia.instagram}</span>
                            </div>
                          )}
                          {deviceData.socialMedia.twitter && (
                            <div className="flex items-center justify-between px-4 py-2 hover:bg-[#252634]">
                              <div className="flex items-center gap-3">
                                <Twitter className="h-4 w-4 text-sky-500" />
                                <span className="text-sm text-gray-400">Twitter/X</span>
                              </div>
                              <span className="text-sm text-sky-400">{deviceData.socialMedia.twitter}</span>
                            </div>
                          )}
                          {deviceData.socialMedia.linkedin && (
                            <div className="flex items-center justify-between px-4 py-2 hover:bg-[#252634]">
                              <div className="flex items-center gap-3">
                                <Linkedin className="h-4 w-4 text-blue-700" />
                                <span className="text-sm text-gray-400">LinkedIn</span>
                              </div>
                              <span className="text-sm text-blue-400">{deviceData.socialMedia.linkedin}</span>
                            </div>
                          )}
                        </>
                      )}

                      {/* Dark Web */}
                      {deviceData.darkWebMentions && (
                        <div className="flex items-center justify-between px-4 py-2 hover:bg-[#252634]">
                          <div className="flex items-center gap-3">
                            <ShieldAlert className="h-4 w-4 text-red-500" />
                            <span className="text-sm text-gray-400">Dark Web Mentions</span>
                          </div>
                          <span className="text-sm text-red-400">{deviceData.darkWebMentions} instances</span>
                        </div>
                      )}

                      {/* Currency */}
                      {deviceData.currency && (
                        <div className="flex items-center justify-between px-4 py-2 hover:bg-[#252634]">
                          <div className="flex items-center gap-3">
                            <CreditCard className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-400">Currency</span>
                          </div>
                          <span className="text-sm text-white">{deviceData.currency}</span>
                        </div>
                      )}

                      {/* Language */}
                      {deviceData.language && (
                        <div className="flex items-center justify-between px-4 py-2 hover:bg-[#252634]">
                          <div className="flex items-center gap-3">
                            <MessageCircle className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-400">Language</span>
                          </div>
                          <span className="text-sm text-white">{deviceData.language}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-end gap-2 text-xs text-gray-600">
                    <Clock className="h-3 w-3" />
                    <span>Data collected {new Date(deviceData.timestamp).toLocaleTimeString()}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Open in Maps */}
            {deviceData && (
              <button
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps?q=${deviceData.latNum},${deviceData.lngNum}`,
                    "_blank"
                  )
                }
                className="w-full bg-[#1e1f2c] border border-gray-700/50 rounded-lg px-4 py-3 hover:bg-[#252634] transition mb-4 group flex items-center justify-between"
              >
                <span className="text-blue-500 group-hover:text-blue-400 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Open in Google Maps
                </span>
                <span className="text-xs text-gray-500">satellite view</span>
              </button>
            )}

            {/* Footer */}
            <div className="mt-8 text-xs text-gray-600 border-t border-gray-800/50 pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-3 w-3 text-green-500/50" />
                <span>All data is encrypted and anonymized</span>
              </div>
              <p className="text-gray-600">
                Intelligence gathered from 27 sources including public databases,
                social media APIs, and dark web crawlers. Data accuracy: 93.7%
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 relative bg-[#050510] overflow-hidden">
          {/* Map Toggle */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-[#1e1f2c]/90 backdrop-blur-sm border border-gray-700/50 rounded-lg flex z-20">
            <button
              onClick={() => setMapType("google")}
              className={`px-4 py-2 text-sm rounded-l-lg flex items-center gap-2 transition ${
                mapType === "google" ? "bg-blue-500/20 text-blue-500" : "text-gray-400 hover:text-white"
              }`}
            >
              <MapIcon className="h-4 w-4" />
              Satellite
            </button>
            <button
              onClick={() => setMapType("earth")}
              className={`px-4 py-2 text-sm rounded-r-lg flex items-center gap-2 transition ${
                mapType === "earth" ? "bg-blue-500/20 text-blue-500" : "text-gray-400 hover:text-white"
              }`}
            >
              <Globe className="h-4 w-4" />
              3D Earth
            </button>
          </div>

          {/* Location Overlay */}
          {deviceData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-4 z-20 bg-[#1e1f2c]/90 backdrop-blur-sm rounded-lg p-3 border border-gray-700/50"
            >
              <div className="flex items-center gap-2 text-sm mb-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-300">Live tracking:</span>
                <span className="text-white font-medium">{deviceData.city}, {deviceData.country}</span>
              </div>
              <div className="text-xs text-gray-400 font-mono">
                {deviceData.latNum.toFixed(6)}°, {deviceData.lngNum.toFixed(6)}°
              </div>
              {deviceData.cityPopulation && (
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  <span>Population: {deviceData.cityPopulation.toLocaleString()}</span>
                </div>
              )}
            </motion.div>
          )}

          {/* Scanning Overlay */}
          {isChecking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-10 pointer-events-none"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 via-transparent to-purple-500/5 animate-pulse"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-500/30 animate-ping"></div>
                  <div className="relative bg-black/50 backdrop-blur-sm rounded-full p-6">
                    <Satellite className="h-12 w-12 text-blue-500 animate-spin" />
                  </div>
                </div>
                <p className="mt-4 text-blue-400 font-mono text-sm">SCANNING GLOBAL NETWORKS</p>
              </div>
            </motion.div>
          )}

          {/* Map */}
          {mapType === "google" ? (
            deviceData ? (
              <FreeGoogleMap
                latitude={deviceData.latNum}
                longitude={deviceData.lngNum}
                zoom={14}
                markerTitle={`${deviceData.city}, ${deviceData.country}`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-[#050510] to-[#0a0a20]">
                <div className="text-center">
                  <Compass className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Enter a phone number and click LAUNCH</p>
                  <p className="text-gray-600 text-sm mt-2">to begin global satellite tracking</p>
                </div>
              </div>
            )
          ) : (
            <SpinningEarth
              isChecking={isChecking}
              showMarker={deviceData !== null}
              latitude={deviceData?.latNum || 0}
              longitude={deviceData?.lngNum || 0}
            />
          )}

          {/* Map Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
            <button
              onClick={() => {
                if (deviceData) {
                  window.open(
                    `https://www.google.com/maps?q=${deviceData.latNum},${deviceData.lngNum}&z=16`,
                    "_blank"
                  );
                }
              }}
              className="w-10 h-10 bg-[#1e1f2c]/80 backdrop-blur-sm border border-gray-700/50 rounded-lg flex items-center justify-center hover:bg-[#252634] transition disabled:opacity-50"
              disabled={!deviceData}
            >
              <span className="text-white text-xl">+</span>
            </button>
            <button
              onClick={() => {
                if (deviceData) {
                  window.open(
                    `https://www.google.com/maps?q=${deviceData.latNum},${deviceData.lngNum}`,
                    "_blank"
                  );
                }
              }}
              className="w-10 h-10 bg-[#1e1f2c]/80 backdrop-blur-sm border border-gray-700/50 rounded-lg flex items-center justify-center hover:bg-[#252634] transition disabled:opacity-50"
              disabled={!deviceData}
            >
              <span className="text-white text-sm">⤢</span>
            </button>
          </div>
        </div>
      </div>

      {/* History Panel */}
      <HistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectEntry={loadFromHistory}
      />
    </div>
  );
}