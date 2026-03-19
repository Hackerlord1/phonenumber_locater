// components/ui/GoogleMapsProvider.tsx
"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface GoogleMapsProviderProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  markerTitle?: string;
}

export function GoogleMapsProvider({ 
  latitude, 
  longitude, 
  zoom = 15, 
  markerTitle 
}: GoogleMapsProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey) {
      setError("Google Maps API key is not configured");
      setIsLoading(false);
      return;
    }

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google) {
        try {
          const mapElement = document.getElementById('google-map');
          if (mapElement) {
            const newMap = new window.google.maps.Map(mapElement, {
              center: { lat: latitude, lng: longitude },
              zoom: zoom,
              mapTypeId: 'hybrid',
              mapTypeControl: true,
              fullscreenControl: true,
              streetViewControl: true,
              zoomControl: true,
              styles: [
                {
                  featureType: 'poi',
                  elementType: 'labels',
                  stylers: [{ visibility: 'off' }]
                }
              ]
            });

            // Add marker
            new window.google.maps.Marker({
              position: { lat: latitude, lng: longitude },
              map: newMap,
              title: markerTitle,
              animation: window.google.maps.Animation.DROP,
            });

            setMap(newMap);
            setIsLoading(false);
          }
        } catch (err) {
          setError('Failed to initialize Google Maps');
          setIsLoading(false);
        }
      }
    };

    script.onerror = () => {
      setError('Failed to load Google Maps');
      setIsLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [latitude, longitude, zoom, markerTitle, apiKey]);

  if (error) {
    return (
      <div className="w-full h-full min-h-[600px] bg-gray-900 rounded-xl flex flex-col items-center justify-center">
        <p className="text-red-400 mb-2">{error}</p>
        <p className="text-gray-400 text-sm">Using fallback 3D Earth view</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[600px] rounded-xl overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center z-10">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
          <p className="text-gray-400">Loading Google Maps...</p>
        </div>
      )}
      <div id="google-map" className="w-full h-full" />
    </div>
  );
}