"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface Country {
  code: string;
  country: string;
  flag: string;
  name: string;
}

// This would ideally come from the API, but we'll use a static list for now
const countries: Country[] = [
  { code: "+1", country: "US", flag: "🇺🇸", name: "United States" },
  { code: "+44", country: "GB", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+86", country: "CN", flag: "🇨🇳", name: "China" },
  { code: "+91", country: "IN", flag: "🇮🇳", name: "India" },
  { code: "+81", country: "JP", flag: "🇯🇵", name: "Japan" },
  { code: "+49", country: "DE", flag: "🇩🇪", name: "Germany" },
  { code: "+33", country: "FR", flag: "🇫🇷", name: "France" },
  { code: "+7", country: "RU", flag: "🇷🇺", name: "Russia" },
  { code: "+55", country: "BR", flag: "🇧🇷", name: "Brazil" },
  { code: "+61", country: "AU", flag: "🇦🇺", name: "Australia" },
  { code: "+39", country: "IT", flag: "🇮🇹", name: "Italy" },
  { code: "+34", country: "ES", flag: "🇪🇸", name: "Spain" },
  { code: "+52", country: "MX", flag: "🇲🇽", name: "Mexico" },
  { code: "+82", country: "KR", flag: "🇰🇷", name: "South Korea" },
  { code: "+65", country: "SG", flag: "🇸🇬", name: "Singapore" },
  { code: "+852", country: "HK", flag: "🇭🇰", name: "Hong Kong" },
  { code: "+971", country: "AE", flag: "🇦🇪", name: "UAE" },
  { code: "+966", country: "SA", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+27", country: "ZA", flag: "🇿🇦", name: "South Africa" },
  { code: "+54", country: "AR", flag: "🇦🇷", name: "Argentina" },
  { code: "+57", country: "CO", flag: "🇨🇴", name: "Colombia" },
  { code: "+56", country: "CL", flag: "🇨🇱", name: "Chile" },
  { code: "+51", country: "PE", flag: "🇵🇪", name: "Peru" },
  { code: "+593", country: "EC", flag: "🇪🇨", name: "Ecuador" },
  { code: "+58", country: "VE", flag: "🇻🇪", name: "Venezuela" },
  { code: "+254", country: "KE", flag: "🇰🇪", name: "Kenya" }
];

export function PhoneInput({ value, onChange, placeholder }: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState(countries[2]); // Default to China (+86)
  const [isOpen, setIsOpen] = useState(false);

  // Auto-detect country from input when it starts with a code
  useEffect(() => {
    const match = value.match(/^(\+\d+)/);
    if (match) {
      const code = match[1];
      const country = countries.find(c => c.code === code);
      if (country && country.code !== selectedCountry.code) {
        setSelectedCountry(country);
      }
    }
  }, [value]);

  return (
    <div className="relative flex">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 hover:bg-gray-100 transition"
      >
        <span className="text-xl">{selectedCountry.flag}</span>
        <span className="text-gray-700">{selectedCountry.code}</span>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute top-12 left-0 w-72 max-h-80 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl z-50">
          {countries.map((country) => (
            <button
              key={country.code}
              type="button"
              className="flex items-center space-x-3 w-full px-4 py-2 hover:bg-blue-50 transition"
              onClick={() => {
                setSelectedCountry(country);
                setIsOpen(false);
                // Update phone number with new country code
                const numberPart = value.replace(/^\+\d+/, "");
                onChange(`${country.code}${numberPart}`);
              }}
            >
              <span className="text-xl">{country.flag}</span>
              <span className="text-gray-700">{country.name}</span>
              <span className="text-gray-500 ml-auto">{country.code}</span>
            </button>
          ))}
        </div>
      )}

      <input
        type="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
      />
    </div>
  );
}