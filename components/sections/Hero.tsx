"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { EmailInput } from "@/components/ui/EmailInput";
import { Button } from "@/components/ui/Button";
import { SearchAnimation } from "@/components/ui/SearchAnimation";
import { FreeGoogleMap } from "@/components/ui/FreeGoogleMap"
import { LocationDetails } from "@/components/ui/LocationDetails";
import { 
  Globe, 
  Shield, 
  Zap, 
  Phone, 
  Mail, 
  MapPin,
  Building,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface CountryInfo {
  name: {
    common: string;
    official: string;
  };
  capital: string[];
  currencies: Record<string, { name: string; symbol: string }>;
  flags: {
    png: string;
    svg: string;
    alt?: string;
  };
  latlng: [number, number];
  region: string;
  subregion: string;
  population: number;
  timezones: string[];
  maps: {
    googleMaps: string;
    openStreetMaps: string;
  };
  idd: {
    root: string;
    suffixes: string[];
  };
  cca2: string;
}

interface CityInfo {
  name: string;
  region?: string;
  latitude: number;
  longitude: number;
  population?: number;
}

interface LocationInfo {
  country?: string;
  countryCode?: string;
  flag?: string;
  cities?: CityInfo[];
  region?: string;
}

export function Hero() {
  const [inputType, setInputType] = useState<"phone" | "email">("phone");
  const [inputValue, setInputValue] = useState("");
  const [countryInfo, setCountryInfo] = useState<CountryInfo | null>(null);
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCity, setSelectedCity] = useState<CityInfo | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [showCities, setShowCities] = useState(false);

  const detectCountryFromCode = async (phoneNumber: string) => {
    const match = phoneNumber.match(/^(\+\d+)/);
    if (!match) return null;

    const countryCode = match[1];
    
    try {
      const response = await fetch(
        `https://restcountries.com/v3.1/all?fields=name,capital,currencies,flags,latlng,region,subregion,population,timezones,maps,idd,cca2`
      );
      
      if (!response.ok) throw new Error("Failed to fetch countries");
      
      const countries = await response.json();
      
      // Find country that matches the calling code
      const matchedCountry = countries.find((c: any) => 
        c.idd?.root && countryCode.startsWith(c.idd.root) &&
        c.idd?.suffixes?.some((suffix: string) => 
          countryCode === c.idd.root + suffix
        )
      );

      return matchedCountry || null;
    } catch (err) {
      console.error("Error detecting country:", err);
      return null;
    }
  };

  const fetchCities = async (countryCode: string) => {
    try {
      // Using OpenStreetMap Nominatim API to get major cities
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=${countryCode}&featureClass=P&type=city&limit=20`
      );
      const data = await response.json();
      
      const cities: CityInfo[] = data.map((item: any) => ({
        name: item.display_name.split(',')[0],
        region: item.display_name.split(',').slice(1, 3).join(',').trim(),
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon)
      }));
      
      return cities;
    } catch (err) {
      console.error("Failed to fetch cities:", err);
      return [];
    }
  };

  const handleLocate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setCountryInfo(null);
    setLocationInfo(null);
    setSelectedCity(null);
    setShowMap(false);
    setShowCities(false);

    try {
      // Simulate API delay for animation (remove in production)
      await new Promise(resolve => setTimeout(resolve, 3000));

      if (inputType === "phone") {
        const country = await detectCountryFromCode(inputValue);
        
        if (!country) {
          throw new Error("Could not detect country from this phone number");
        }

        setCountryInfo(country);
        
        // Fetch cities for this country
        const cities = await fetchCities(country.cca2);
        
        setLocationInfo({
          country: country.name.common,
          countryCode: country.cca2,
          flag: country.flags.svg,
          cities: cities,
          region: country.subregion || country.region
        });

      } else {
        // Email handling
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(inputValue)) {
          throw new Error("Please enter a valid email address");
        }

        const domain = inputValue.split('@')[1];
        const tld = domain.split('.').pop()?.toUpperCase();

        // Try to get country from TLD
        if (tld && tld.length === 2) {
          try {
            const response = await fetch(
              `https://restcountries.com/v3.1/alpha/${tld}?fields=name,capital,currencies,flags,latlng,region,subregion,population,timezones,maps,cca2`
            );
            
            if (response.ok) {
              const countryData = await response.json();
              setCountryInfo(countryData);
              
              const cities = await fetchCities(tld);
              setLocationInfo({
                country: countryData.name.common,
                countryCode: tld,
                flag: countryData.flags.svg,
                cities: cities,
                region: countryData.subregion || countryData.region
              });
            }
          } catch (err) {
            // If country not found by TLD, show email info only
            setLocationInfo({
              country: "Unknown",
              countryCode: tld,
              cities: []
            });
          }
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setShowMap(true);
    }
  };

  const handleCitySelect = (city: CityInfo) => {
    setSelectedCity(city);
  };

  const toggleCities = () => {
    setShowCities(!showCities);
  };

  return (
    <>
      <SearchAnimation 
        isSearching={loading} 
        inputType={inputType} 
        inputValue={inputValue} 
      />

      <section className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto mb-12"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Geolocate by{" "}
              <span className="text-blue-600 relative">
                Phone or Email
                <motion.span
                  className="absolute -bottom-2 left-0 w-full h-1 bg-blue-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                />
              </span>
            </h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-xl text-gray-600 mb-8"
            >
              Track any device worldwide. Get detailed information with interactive maps.
              <span className="block text-sm text-blue-600 mt-2 font-semibold">
                📍 250+ countries supported • Real-time tracking • Interactive maps
              </span>
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex justify-center gap-4 mb-8"
            >
              {[
                { type: "phone", icon: Phone, label: "Phone Number" },
                { type: "email", icon: Mail, label: "Email Address" }
              ].map((item, index) => (
                <motion.button
                  key={item.type}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setInputType(item.type as "phone" | "email");
                    setInputValue("");
                    setCountryInfo(null);
                    setLocationInfo(null);
                    setSelectedCity(null);
                    setShowMap(false);
                  }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                    inputType === item.type
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </motion.button>
              ))}
            </motion.div>

            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              onSubmit={handleLocate} 
              className="max-w-2xl mx-auto mb-8"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  {inputType === "phone" ? (
                    <PhoneInput 
                      value={inputValue}
                      onChange={setInputValue}
                      placeholder="+1 (555) 000-0000"
                    />
                  ) : (
                    <EmailInput
                      value={inputValue}
                      onChange={setInputValue}
                      placeholder="user@example.com"
                    />
                  )}
                </div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={loading || !inputValue}
                    className="w-full sm:w-auto"
                  >
                    {loading ? "Searching..." : "Start Tracking"}
                  </Button>
                </motion.div>
              </div>
            </motion.form>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-red-50 text-red-600 p-4 rounded-lg max-w-2xl mx-auto mb-8 border border-red-200"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-wrap justify-center gap-8 text-sm text-gray-500"
            >
              {[
                { icon: Globe, text: "250+ countries", color: "text-blue-500" },
                { icon: Shield, text: "100% anonymous", color: "text-green-500" },
                { icon: Zap, text: "Real-time tracking", color: "text-purple-500" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -2 }}
                  className="flex items-center gap-2"
                >
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Results with Map */}
          <AnimatePresence mode="wait">
            {countryInfo && locationInfo && showMap && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5 }}
                className="max-w-6xl mx-auto space-y-6"
              >
                {/* Location Details */}
                <LocationDetails
                  countryInfo={countryInfo}
                  locationInfo={locationInfo}
                  selectedCity={selectedCity}
                  inputType={inputType}
                  inputValue={inputValue}
                />

                {/* Cities Section */}
                {locationInfo.cities && locationInfo.cities.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden"
                  >
                    <button
                      onClick={toggleCities}
                      className="w-full p-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center gap-2">
                        <Building className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold text-gray-900">
                          Major Cities in {countryInfo.name.common}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({locationInfo.cities.length} found)
                        </span>
                      </div>
                      {showCities ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </button>

                    <AnimatePresence>
                      {showCities && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {locationInfo.cities.map((city: CityInfo, index: number) => (
                              <motion.button
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.02 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleCitySelect(city)}
                                className={`p-3 rounded-lg border text-left transition ${
                                  selectedCity?.name === city.name
                                    ? "border-blue-500 bg-blue-50 shadow-md"
                                    : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                                }`}
                              >
                                <p className="font-semibold text-gray-900">{city.name}</p>
                                {city.region && (
                                  <p className="text-xs text-gray-500 mt-1 truncate">
                                    {city.region}
                                  </p>
                                )}
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* Interactive Map */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden"
                >
                  <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      {selectedCity 
                        ? `${selectedCity.name}, ${countryInfo.name.common}` 
                        : `${countryInfo.name.common} - ${countryInfo.capital?.[0] || "Capital"}`}
                    </h3>
                    {selectedCity && (
                      <button
                        onClick={() => setSelectedCity(null)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        View Country
                      </button>
                    )}
                  </div>
                  <div className="h-[450px] w-full">
                    <FreeGoogleMap
                      latitude={selectedCity?.latitude || countryInfo.latlng[0]}
                      longitude={selectedCity?.longitude || countryInfo.latlng[1]}
                      markerTitle={selectedCity?.name || countryInfo.name.common}
                      zoom={selectedCity ? 12 : 6}
                    />
                  </div>
                </motion.div>

                {/* Google Maps Link */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-center"
                >
                  <a
                    href={countryInfo.maps.googleMaps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 underline"
                  >
                    <Globe className="h-4 w-4" />
                    View {selectedCity?.name || countryInfo.name.common} on Google Maps
                  </a>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}