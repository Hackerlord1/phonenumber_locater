"use client";

import { motion } from "framer-motion";
import { 
  Globe, MapPin, Phone, Mail, Building, 
  Users, Clock, Flag, Map, Navigation 
} from "lucide-react";

interface LocationDetailsProps {
  countryInfo: any;
  locationInfo: any;
  selectedCity: any;
  inputType: "phone" | "email";
  inputValue: string;
}

export function LocationDetails({ 
  countryInfo, 
  locationInfo, 
  selectedCity, 
  inputType, 
  inputValue 
}: LocationDetailsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b">
        {countryInfo?.flags?.svg && (
          <motion.img
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            src={countryInfo.flags.svg}
            alt={countryInfo.flags.alt || `Flag of ${countryInfo.name.common}`}
            className="w-16 h-12 object-cover rounded-lg shadow-md"
          />
        )}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {countryInfo?.name?.common || "Location Found"}
          </h2>
          <p className="text-gray-500 text-sm break-all">{inputValue}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-blue-50 rounded-lg p-3 text-center"
        >
          <MapPin className="h-5 w-5 text-blue-600 mx-auto mb-1" />
          <p className="text-xs text-gray-500">Capital</p>
          <p className="font-semibold text-sm truncate">{countryInfo?.capital?.[0] || "N/A"}</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-green-50 rounded-lg p-3 text-center"
        >
          <Users className="h-5 w-5 text-green-600 mx-auto mb-1" />
          <p className="text-xs text-gray-500">Population</p>
          <p className="font-semibold text-sm">{countryInfo?.population?.toLocaleString()?.slice(0, 8) || "N/A"}</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-purple-50 rounded-lg p-3 text-center"
        >
          <Clock className="h-5 w-5 text-purple-600 mx-auto mb-1" />
          <p className="text-xs text-gray-500">Timezone</p>
          <p className="font-semibold text-sm truncate">{countryInfo?.timezones?.[0] || "N/A"}</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-orange-50 rounded-lg p-3 text-center"
        >
          <Globe className="h-5 w-5 text-orange-600 mx-auto mb-1" />
          <p className="text-xs text-gray-500">Region</p>
          <p className="font-semibold text-sm">{countryInfo?.region || "N/A"}</p>
        </motion.div>
      </div>

      {/* Detailed Info */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <motion.div
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className="flex items-start gap-3"
          >
            <Map className="h-5 w-5 text-blue-600 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Location Details</p>
              <p className="font-semibold">
                {selectedCity ? (
                  <>
                    {selectedCity.name}, {selectedCity.region || countryInfo?.subregion}
                  </>
                ) : (
                  <>
                    {countryInfo?.capital?.[0]}, {countryInfo?.subregion || countryInfo?.region}
                  </>
                )}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-start gap-3"
          >
            <Navigation className="h-5 w-5 text-blue-600 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Coordinates</p>
              <p className="font-semibold">
                {selectedCity ? (
                  `${selectedCity.latitude.toFixed(4)}°N, ${selectedCity.longitude.toFixed(4)}°W`
                ) : (
                  countryInfo?.latlng && `${countryInfo.latlng[0].toFixed(2)}°N, ${countryInfo.latlng[1].toFixed(2)}°W`
                )}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-start gap-3"
          >
            <Flag className="h-5 w-5 text-blue-600 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Country Code</p>
              <p className="font-semibold">{countryInfo?.cca2 || "N/A"}</p>
            </div>
          </motion.div>
        </div>

        <div className="space-y-4">
          {inputType === "phone" && countryInfo?.idd && (
            <motion.div
              initial={{ x: 20 }}
              animate={{ x: 0 }}
              className="flex items-start gap-3"
            >
              <Phone className="h-5 w-5 text-blue-600 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Calling Code</p>
                <p className="font-semibold">
                  {countryInfo.idd.root}{countryInfo.idd.suffixes?.[0] || ""}
                </p>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ x: 20 }}
            animate={{ x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-start gap-3"
          >
            <Building className="h-5 w-5 text-blue-600 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Currency</p>
              {countryInfo?.currencies && Object.entries(countryInfo.currencies).map(([code, currency]: any) => (
                <p key={code} className="font-semibold">
                  {currency.name} ({currency.symbol})
                </p>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 20 }}
            animate={{ x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-start gap-3"
          >
            <Mail className="h-5 w-5 text-blue-600 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Domain</p>
              <p className="font-semibold">.{countryInfo?.cca2?.toLowerCase()}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}