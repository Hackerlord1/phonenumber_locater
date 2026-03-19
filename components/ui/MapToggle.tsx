// components/ui/MapToggle.tsx
"use client";

import { useState } from "react";
import { Globe, Map as MapIcon } from "lucide-react";
import { SpinningEarth } from "./SpinningEarth";
import { FreeGoogleMap } from "./FreeGoogleMap";

interface MapToggleProps {
  isChecking: boolean;
  deviceData: any;
  latitude: number;
  longitude: number;
  locationName: string;
}

export function MapToggle({ isChecking, deviceData, latitude, longitude, locationName }: MapToggleProps) {
  const [mapType, setMapType] = useState<'3d' | 'google'>('google'); // Default to Google Maps

  return (
    <div className="relative w-full h-full">
      {/* Map Type Toggle */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-[#1e1f2c]/90 backdrop-blur-sm border border-gray-700/50 rounded-lg flex z-20">
        <button
          onClick={() => setMapType('google')}
          className={`px-4 py-2 text-sm rounded-l-lg flex items-center gap-2 transition ${
            mapType === 'google' 
              ? 'bg-blue-500/20 text-blue-500' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <MapIcon className="h-4 w-4" />
          Google Maps
        </button>
        <button
          onClick={() => setMapType('3d')}
          className={`px-4 py-2 text-sm rounded-r-lg flex items-center gap-2 transition ${
            mapType === '3d' 
              ? 'bg-blue-500/20 text-blue-500' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Globe className="h-4 w-4" />
          3D Earth
        </button>
      </div>

      {/* Map Content */}
      {mapType === '3d' ? (
        <SpinningEarth 
          isChecking={isChecking}
          showMarker={deviceData !== null}
          latitude={latitude}
          longitude={longitude}
        />
      ) : (
        <FreeGoogleMap
          latitude={latitude}
          longitude={longitude}
          zoom={15}
          markerTitle={locationName}
        />
      )}
    </div>
  );
}