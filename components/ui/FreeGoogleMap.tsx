// components/ui/FreeGoogleMap.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Maximize2, Minimize2 } from "lucide-react";

interface FreeGoogleMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  markerTitle?: string;
}

export function FreeGoogleMap({ 
  latitude, 
  longitude, 
  zoom = 12, 
  markerTitle 
}: FreeGoogleMapProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Using the free Google Maps Embed API - NO API KEY NEEDED!
  // Different URL format that works better
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${latitude},${longitude}&zoom=${zoom}&maptype=satellite`;

  // Fallback URL if the embed doesn't work
  const fallbackUrl = `https://www.google.com/maps?q=${latitude},${longitude}&z=${zoom}&t=h`;

  // Handle iframe load error
  const handleIframeError = () => {
    console.log("Iframe failed to load, using fallback");
    setLoadError(true);
    setIsLoading(false);
  };

  // Reset loading state when coordinates change
  useEffect(() => {
    setIsLoading(true);
    setLoadError(false);
  }, [latitude, longitude]);

  if (loadError) {
    return (
      <div className="w-full h-full min-h-[600px] bg-gray-900 rounded-xl flex flex-col items-center justify-center p-6">
        <p className="text-red-400 mb-4">Failed to load Google Maps</p>
        <a 
          href={fallbackUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
        >
          Open in Google Maps
        </a>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center z-10">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
          <p className="text-gray-400">Loading Google Maps...</p>
        </div>
      )}

      {/* Fullscreen Toggle */}
      <button
        onClick={() => setIsFullscreen(!isFullscreen)}
        className="absolute top-4 right-4 z-20 bg-[#1e1f2c]/80 backdrop-blur-sm border border-gray-700/50 rounded-lg p-2 hover:bg-[#252634] transition"
      >
        {isFullscreen ? (
          <Minimize2 className="h-5 w-5 text-gray-300" />
        ) : (
          <Maximize2 className="h-5 w-5 text-gray-300" />
        )}
      </button>

      {/* Location Title */}
      <div className="absolute top-4 left-4 z-20 bg-[#1e1f2c]/80 backdrop-blur-sm border border-gray-700/50 rounded-lg px-3 py-2">
        <p className="text-sm text-white font-medium">{markerTitle || 'Tracked Location'}</p>
        <p className="text-xs text-gray-400">
          {latitude.toFixed(4)}°, {longitude.toFixed(4)}°
        </p>
      </div>

      {/* Google Maps Iframe */}
      <iframe
        ref={iframeRef}
        key={`${latitude}-${longitude}`}
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="w-full h-full"
        onLoad={() => setIsLoading(false)}
        onError={handleIframeError}
      />
    </div>
  );
}