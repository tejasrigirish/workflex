import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { JobListing } from '../../types/job';
import { JobMapCard } from './JobMapCard';
import { Crosshair, MapPin, ZoomIn, ZoomOut, Search, Layers, Compass, Loader2 } from 'lucide-react';
import { createRoot } from 'react-dom/client';

export const CITY_COORDINATES: Record<string, { lat: number; lng: number; zoom: number }> = {
  Bengaluru: { lat: 12.9716, lng: 77.5946, zoom: 12 },
  Mysuru: { lat: 12.3168, lng: 76.6384, zoom: 13 },
  Mangaluru: { lat: 12.8750, lng: 74.8500, zoom: 13 },
  Hubballi: { lat: 15.3647, lng: 75.1240, zoom: 13 },
  Belagavi: { lat: 15.8497, lng: 74.4977, zoom: 13 },
  Tumakuru: { lat: 13.3392, lng: 77.1018, zoom: 14 },
  Shivamogga: { lat: 13.9299, lng: 75.5681, zoom: 14 },
  Davanagere: { lat: 14.4644, lng: 75.9218, zoom: 14 },
};

interface JobMapProps {
  jobs: JobListing[];
  selectedJob: JobListing | null;
  onSelectJob: (job: JobListing) => void;
  onViewJobDetails: (job: JobListing) => void;
  currentCity: string;
  onCityChange: (city: string) => void;
  onMapClickCoordinates?: (coords: { lat: number; lng: number; address?: string }) => void;
  interactivePinPlacement?: boolean;
}

export const JobMap: React.FC<JobMapProps> = ({
  jobs,
  selectedJob,
  onSelectJob,
  onViewJobDetails,
  currentCity,
  onCityChange,
  onMapClickCoordinates,
  interactivePinPlacement = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const placedPinRef = useRef<L.Marker | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [tileMode, setTileMode] = useState<'dark' | 'standard'>('dark');
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [mapError, setMapError] = useState<boolean>(false);

  // Initialize Map with official OpenStreetMap tiles
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    try {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if ((container as any)._leaflet_id) {
        delete (container as any)._leaflet_id;
      }

      const initialCoords = CITY_COORDINATES[currentCity] || CITY_COORDINATES['Bengaluru'];

      const map = L.map(container, {
        center: [initialCoords.lat, initialCoords.lng],
        zoom: initialCoords.zoom,
        zoomControl: false,
        attributionControl: true,
      });

      // Official OpenStreetMap tile layer with required attribution
      const osmTileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      L.tileLayer(osmTileUrl, {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;
      setMapError(false);

      // Handle container resize gracefully (e.g. responsive mobile/desktop toggle)
      const resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(container);

      // Click handler for pin placement (used in Post a Job or interactive coordinate select)
      map.on('click', async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        if (interactivePinPlacement || onMapClickCoordinates) {
          if (placedPinRef.current) {
            placedPinRef.current.setLatLng([lat, lng]);
          } else {
            const pinIcon = L.divIcon({
              className: 'placed-pin-icon',
              html: `
                <div class="flex items-center justify-center -translate-y-4">
                  <div class="w-8 h-8 rounded-full bg-emerald-500 text-black font-black flex items-center justify-center border-2 border-white shadow-xl animate-bounce">
                    📍
                  </div>
                </div>
              `,
              iconSize: [32, 32],
              iconAnchor: [16, 32],
            });
            placedPinRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
          }

          if (onMapClickCoordinates) {
            onMapClickCoordinates({ lat, lng });
          }
        }
      });

      return () => {
        resizeObserver.disconnect();
        map.remove();
        mapInstanceRef.current = null;
      };
    } catch (err) {
      console.error('Failed to initialize Leaflet OpenStreetMap:', err);
      setMapError(true);
    }
  }, []);

  // Center on city changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const cityData = CITY_COORDINATES[currentCity];
    if (cityData) {
      map.flyTo([cityData.lat, cityData.lng], cityData.zoom, { duration: 1 });
    }
  }, [currentCity]);

  // Center on selected job
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedJob) return;

    map.flyTo([selectedJob.coordinates.lat, selectedJob.coordinates.lng], 15, {
      duration: 0.8,
    });
  }, [selectedJob]);

  // Render job markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    jobs.forEach((job) => {
      const isSelected = selectedJob?.id === job.id;
      const paymentShort = `₹${job.paymentAmount}${job.paymentType === 'per_hour' ? '/h' : ''}`;

      const icon = L.divIcon({
        className: 'leaflet-custom-div-icon',
        html: `
          <div class="custom-map-marker ${isSelected ? 'active-marker' : ''}" id="map-marker-${job.id}">
            <span class="price-tag">${paymentShort}</span>
            <span style="max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${job.title.slice(0, 14)}
            </span>
          </div>
        `,
        iconSize: [110, 30],
        iconAnchor: [55, 15],
      });

      const marker = L.marker([job.coordinates.lat, job.coordinates.lng], { icon });

      const popupDiv = document.createElement('div');
      const root = createRoot(popupDiv);
      root.render(
        <JobMapCard
          job={job}
          onViewDetails={(j) => {
            onViewJobDetails(j);
            marker.closePopup();
          }}
          onClose={() => marker.closePopup()}
        />
      );

      marker.bindPopup(popupDiv, {
        maxWidth: 320,
        className: 'custom-leaflet-popup',
      });

      marker.on('click', () => {
        onSelectJob(job);
      });

      markersLayer.addLayer(marker);
    });
  }, [jobs, selectedJob, onSelectJob, onViewJobDetails]);

  // Real-world address geocoding search via OpenStreetMap Nominatim API
  const handleSearchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setLocationStatus('Searching map...');

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery + `, ${currentCity}, India`
        )}`
      );
      const results = await response.json();

      if (results && results.length > 0) {
        const topResult = results[0];
        const lat = parseFloat(topResult.lat);
        const lon = parseFloat(topResult.lon);

        const map = mapInstanceRef.current;
        if (map) {
          map.flyTo([lat, lon], 15, { duration: 1.2 });
          setLocationStatus(topResult.display_name.slice(0, 35) + '...');
        }
      } else {
        setLocationStatus('Location not found, try nearby landmark.');
      }
    } catch {
      setLocationStatus('Geocoding service unavailable.');
    } finally {
      setIsSearching(false);
      setTimeout(() => setLocationStatus(null), 4000);
    }
  };

  // Real GPS Geolocation
  const handleUseMyLocation = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    setLocationStatus('Getting GPS coordinates...');

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng([lat, lng]);
          } else {
            const userIcon = L.divIcon({
              className: 'user-location-marker',
              html: `
                <div class="relative flex items-center justify-center">
                  <div class="absolute w-8 h-8 rounded-full bg-emerald-500/30 animate-ping"></div>
                  <div class="w-4 h-4 rounded-full bg-emerald-400 border-2 border-white shadow-lg"></div>
                </div>
              `,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            });
            userMarkerRef.current = L.marker([lat, lng], { icon: userIcon }).addTo(map);
          }

          if (radiusCircleRef.current) {
            radiusCircleRef.current.setLatLng([lat, lng]);
          } else {
            radiusCircleRef.current = L.circle([lat, lng], {
              radius: 2500,
              color: '#10B981',
              fillColor: '#10B981',
              fillOpacity: 0.08,
              weight: 1.5,
              dashArray: '4, 6',
            }).addTo(map);
          }

          map.flyTo([lat, lng], 14, { duration: 1 });
          setLocationStatus('Centered on your location!');
          setTimeout(() => setLocationStatus(null), 3000);
        },
        () => {
          setLocationStatus('GPS permission denied or unavailable.');
          setTimeout(() => setLocationStatus(null), 3000);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-[#080C14]">
      {/* Live Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Fallback Display if Map Fails to Load */}
      {mapError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#080C14] text-slate-300 z-30">
          <MapPin className="w-8 h-8 text-emerald-400 mb-2" />
          <p className="font-bold text-sm text-white">Interactive Job Map</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Unable to load map tiles at this moment. You can still discover and apply for verified job listings on the right.
          </p>
        </div>
      )}

      {/* Top Map Floating Search & Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* City Selector */}
        <div className="pointer-events-auto flex items-center gap-2 glass-card-static border border-white/10 p-1.5 rounded-2xl shadow-2xl">
          <MapPin className="w-4 h-4 text-emerald-400 ml-2 shrink-0" />
          <select
            value={currentCity}
            onChange={(e) => onCityChange(e.target.value)}
            className="bg-transparent text-xs font-bold text-white focus:outline-none pr-3 cursor-pointer"
          >
            {Object.keys(CITY_COORDINATES).map((city) => (
              <option key={city} value={city} className="bg-[#0D121D] text-white">
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Real Live Location Geocoder Search */}
        <form
          onSubmit={handleSearchLocation}
          className="pointer-events-auto flex items-center gap-1 glass-card-static border border-white/10 p-1 rounded-2xl shadow-2xl max-w-xs"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search address or street..."
            className="bg-transparent pl-3 pr-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-none w-44"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          >
            {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
          </button>
        </form>

        {/* Real Map status indicator */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-2xl glass-card-static border border-white/10 text-xs font-semibold text-slate-200 shadow-2xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white">{jobs.length}</span>
            <span className="text-slate-400 text-[11px]">active pins</span>
          </div>
        </div>
      </div>

      {/* Floating Status Notification Toast */}
      {locationStatus && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-2xl glass-card-static border border-emerald-400/40 text-xs font-semibold text-emerald-300 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-150">
          {locationStatus}
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-6 right-4 z-20 flex flex-col items-center gap-2.5">
        {/* Real GPS locator */}
        <button
          onClick={handleUseMyLocation}
          title="Detect my location"
          className="p-3 rounded-2xl glass-card-static hover:bg-slate-800/80 text-emerald-400 border border-white/15 shadow-2xl transition transform hover:scale-105 cursor-pointer"
        >
          <Crosshair className="w-4 h-4" />
        </button>

        {/* Map Tile Mode Switcher (Dark vs OSM Standard) */}
        <button
          onClick={() => setTileMode(tileMode === 'dark' ? 'standard' : 'dark')}
          title="Toggle map style"
          className="p-3 rounded-2xl glass-card-static hover:bg-slate-800/80 text-slate-300 hover:text-white border border-white/15 shadow-2xl transition cursor-pointer"
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* Zoom Controls */}
        <div className="flex flex-col rounded-2xl overflow-hidden glass-card-static border border-white/15 shadow-2xl">
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-800/80 transition cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-full h-px bg-white/10" />
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-800/80 transition cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Live Map attribution indicator */}
      <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl glass-card-static border border-white/10 text-[10px] text-slate-400 shadow-xl">
        <Compass className="w-3.5 h-3.5 text-emerald-400" />
        <span>Live OpenStreetMap • Geocoding</span>
      </div>
    </div>
  );
};
