import React, { useEffect, useRef, useState, Component, ErrorInfo, ReactNode } from 'react';
import L from 'leaflet';
import { JobListing } from '../../types/job';
import { JobMapCard } from './JobMapCard';
import {
  Crosshair,
  MapPin,
  ZoomIn,
  ZoomOut,
  Search,
  Layers,
  Compass,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { createRoot } from 'react-dom/client';
import {
  CITY_COORDINATES,
  getCityCoordinates,
  isValidCoordinate,
  sanitizeCoordinates,
  extractJobCoordinates,
  parseCoordinate,
  getSafeCoordinate,
} from '../../constants/cities';

// Re-export for backward compatibility across existing files
export { CITY_COORDINATES };

// Bulletproof runtime interceptors for Leaflet
if (typeof window !== 'undefined' && L) {
  // 1. Guard Map.prototype.flyTo against zero-dimension containers (e.g. mobile tab hidden)
  // In Leaflet, if container width or height is 0, flyTo divides by zero in its curve algorithm, generating (NaN, NaN)
  if (L.Map && L.Map.prototype) {
    const originalFlyTo = L.Map.prototype.flyTo;
    L.Map.prototype.flyTo = function (targetCenter: any, targetZoom?: number, options?: any) {
      try {
        const size = this.getSize();
        const safeTarget = extractJobCoordinates(targetCenter) || sanitizeCoordinates(targetCenter);
        if (!size || size.x <= 0 || size.y <= 0) {
          // Zero-dimension container: bypass animation to prevent division by zero NaN
          return this.setView([safeTarget.lat, safeTarget.lng], targetZoom ?? this.getZoom());
        }
        return originalFlyTo.call(this, [safeTarget.lat, safeTarget.lng], targetZoom, options);
      } catch (err) {
        console.warn('[WorkFlex Leaflet Safeguard] Handled flyTo safely:', err);
        return this;
      }
    };

    const originalPanTo = L.Map.prototype.panTo;
    L.Map.prototype.panTo = function (targetCenter: any, options?: any) {
      try {
        const size = this.getSize();
        const safeTarget = extractJobCoordinates(targetCenter) || sanitizeCoordinates(targetCenter);
        if (!size || size.x <= 0 || size.y <= 0) {
          return this.setView([safeTarget.lat, safeTarget.lng], this.getZoom());
        }
        return originalPanTo.call(this, [safeTarget.lat, safeTarget.lng], options);
      } catch (err) {
        console.warn('[WorkFlex Leaflet Safeguard] Handled panTo safely:', err);
        return this;
      }
    };
  }

  // 2. Guard L.latLng factory function
  if ((L as any).latLng) {
    const originalLatLng = (L as any).latLng;
    (L as any).latLng = function (a: any, b: any, c: any) {
      // If called with array [lat, lng]
      if (Array.isArray(a)) {
        const safe = getSafeCoordinate(a[0], a[1]);
        if (!safe) {
          return originalLatLng(12.9716, 77.5946);
        }
        return originalLatLng(safe.lat, safe.lng);
      }
      // If called with (lat, lng)
      if (typeof a === 'number' || typeof a === 'string') {
        const safe = getSafeCoordinate(a, b);
        if (!safe) {
          return originalLatLng(12.9716, 77.5946);
        }
        return originalLatLng(safe.lat, safe.lng, c);
      }
      // If called with object { lat, lng }
      if (a && typeof a === 'object') {
        const safe = extractJobCoordinates(a);
        if (!safe) {
          return originalLatLng(12.9716, 77.5946);
        }
        return originalLatLng(safe.lat, safe.lng);
      }
      try {
        return originalLatLng.apply(this, arguments as any);
      } catch {
        return originalLatLng(12.9716, 77.5946);
      }
    };
  }
}

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

// Internal Error Boundary strictly protecting the Map widget from ever crashing the page
interface MapBoundaryState {
  hasError: boolean;
  errorMessage: string | null;
}

class MapErrorBoundary extends Component<{ children: ReactNode; onRetry: () => void }, MapBoundaryState> {
  public state: MapBoundaryState = { hasError: false, errorMessage: null };

  public static getDerivedStateFromError(error: Error): MapBoundaryState {
    return { hasError: true, errorMessage: error?.message || 'Map rendering error' };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('[WorkFlex Map Error Protected]:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="relative w-full h-full min-h-[420px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-[#080C14] flex flex-col items-center justify-center p-6 text-center text-slate-300">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-white">Map View Temporarily Unavailable</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            All active job shifts and filters remain fully accessible on the list.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, errorMessage: null });
              this.props.onRetry();
            }}
            className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer border border-cyan-500/20"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload Map</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const JobMapInner: React.FC<JobMapProps> = ({
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

  const popupRootsRef = useRef<any[]>([]);

  // Compute number of jobs that genuinely have valid map coordinates
  const validMarkersCount = (jobs || []).filter((job) => {
    if (!job || !job.id || job.hasValidCoordinates === false) return false;
    const coords = extractJobCoordinates(job.coordinates ?? { lat: (job as any).latitude, lng: (job as any).longitude });
    return coords !== null;
  }).length;

  // Cleanup popup roots on unmount
  useEffect(() => {
    return () => {
      popupRootsRef.current.forEach((root) => {
        try {
          root.unmount();
        } catch {}
      });
      popupRootsRef.current = [];
    };
  }, []);

  // Initialize Map with guaranteed valid center coordinates
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

      const initialCoords = getCityCoordinates(currentCity);

      const map = L.map(container, {
        center: [initialCoords.lat, initialCoords.lng],
        zoom: initialCoords.zoom || 12,
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

      // Handle container resize gracefully (especially for mobile orientation / tab switch)
      const resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.invalidateSize();
          } catch {}
        }
      });
      resizeObserver.observe(container);

      // Safe click handler for interactive pin placement
      map.on('click', (e: L.LeafletMouseEvent) => {
        try {
          if (!e || !e.latlng) return;
          const { lat, lng } = e.latlng;
          if (!isValidCoordinate(lat, lng)) return;

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
        } catch (err) {
          console.warn('Error handling map click:', err);
        }
      });

      return () => {
        resizeObserver.disconnect();
        try {
          map.remove();
        } catch {}
        mapInstanceRef.current = null;
      };
    } catch (err) {
      console.error('Failed to initialize Leaflet OpenStreetMap:', err);
      setMapError(true);
    }
  }, []);

  // Safe view change when city changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    try {
      const cityData = getCityCoordinates(currentCity);
      if (isValidCoordinate(cityData.lat, cityData.lng)) {
        const container = mapContainerRef.current;
        if (!container || container.clientWidth <= 0 || container.clientHeight <= 0) {
          map.setView([cityData.lat, cityData.lng], cityData.zoom || 12);
        } else {
          map.flyTo([cityData.lat, cityData.lng], cityData.zoom || 12, { duration: 1 });
        }
      }
    } catch (err) {
      console.warn('Error moving to city:', err);
    }
  }, [currentCity]);

  // Safe view change when selected job changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedJob) return;

    try {
      if (selectedJob.hasValidCoordinates === false) return;
      const coords = extractJobCoordinates(selectedJob.coordinates ?? { lat: (selectedJob as any).latitude, lng: (selectedJob as any).longitude });
      if (!coords) return;

      const container = mapContainerRef.current;
      if (!container || container.clientWidth <= 0 || container.clientHeight <= 0) {
        // Zero-dimension container on mobile: avoid flyTo animation
        map.setView([coords.lat, coords.lng], 15);
      } else {
        map.flyTo([coords.lat, coords.lng], 15, { duration: 0.8 });
      }
    } catch (err) {
      console.warn('Error flying to selected job:', err);
    }
  }, [selectedJob]);

  // Safely render job markers with zero NaN risk
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    try {
      // Clean up previous popup roots before clearing layers
      popupRootsRef.current.forEach((root) => {
        try {
          root.unmount();
        } catch {}
      });
      popupRootsRef.current = [];

      markersLayer.clearLayers();

      (jobs || []).forEach((job) => {
        // Exclude jobs without genuinely valid coordinates
        if (!job || !job.id || job.hasValidCoordinates === false) return;

        const coords = extractJobCoordinates(job.coordinates ?? { lat: (job as any).latitude, lng: (job as any).longitude });
        if (!coords) {
          return;
        }

        const isSelected = selectedJob?.id === job.id;
        const paymentShort = `₹${job.paymentAmount || 0}${job.paymentType === 'per_hour' ? '/h' : ''}`;

        const icon = L.divIcon({
          className: 'leaflet-custom-div-icon',
          html: `
            <div class="custom-map-marker ${isSelected ? 'active-marker' : ''}" id="map-marker-${job.id}">
              <span class="price-tag">${paymentShort}</span>
              <span style="max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${(job.title || 'Shift').slice(0, 14)}
              </span>
            </div>
          `,
          iconSize: [110, 30],
          iconAnchor: [55, 15],
        });

        const marker = L.marker([coords.lat, coords.lng], { icon });

        const popupDiv = document.createElement('div');
        const root = createRoot(popupDiv);
        popupRootsRef.current.push(root);

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
    } catch (err) {
      console.warn('Error updating job markers:', err);
    }
  }, [jobs, selectedJob, onSelectJob, onViewJobDetails, currentCity]);

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

        if (isValidCoordinate(lat, lon)) {
          const map = mapInstanceRef.current;
          if (map) {
            map.flyTo([lat, lon], 15, { duration: 1.2 });
            setLocationStatus(topResult.display_name.slice(0, 35) + '...');
          }
        } else {
          setLocationStatus('Invalid coordinates received.');
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

  // Safe GPS Geolocation
  const handleUseMyLocation = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    setLocationStatus('Getting GPS coordinates...');

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos?.coords?.latitude;
          const lng = pos?.coords?.longitude;

          if (!isValidCoordinate(lat, lng)) {
            setLocationStatus('GPS returned invalid coordinates.');
            setTimeout(() => setLocationStatus(null), 3000);
            return;
          }

          try {
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
          } catch (err) {
            console.warn('Error setting GPS location:', err);
            setLocationStatus('Could not center map on GPS.');
          } finally {
            setTimeout(() => setLocationStatus(null), 3000);
          }
        },
        () => {
          setLocationStatus('GPS permission denied or unavailable.');
          setTimeout(() => setLocationStatus(null), 3000);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setLocationStatus('GPS not supported on this device.');
      setTimeout(() => setLocationStatus(null), 3000);
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
          <button
            onClick={() => {
              setMapError(false);
              const container = mapContainerRef.current;
              if (container && (container as any)._leaflet_id) {
                delete (container as any)._leaflet_id;
              }
            }}
            className="mt-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-cyan-400 rounded-lg transition cursor-pointer"
          >
            Retry Map
          </button>
        </div>
      )}

      {/* Top Map Floating Search & Controls */}
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* City Selector */}
        <div className="pointer-events-auto flex items-center gap-1.5 glass-card-static border border-white/10 p-1 sm:p-1.5 rounded-2xl shadow-2xl min-h-[40px]">
          <MapPin className="w-4 h-4 text-emerald-400 ml-1.5 shrink-0" />
          <select
            value={currentCity}
            onChange={(e) => onCityChange(e.target.value)}
            className="bg-transparent text-xs font-bold text-white focus:outline-none pr-2 cursor-pointer max-w-[110px] sm:max-w-none truncate"
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
          className="pointer-events-auto flex items-center gap-1 glass-card-static border border-white/10 p-1 rounded-2xl shadow-2xl flex-1 sm:flex-initial max-w-[220px] sm:max-w-xs min-h-[40px]"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search address..."
            className="bg-transparent pl-2.5 pr-1 py-1 text-xs text-white placeholder-slate-400 focus:outline-none w-full sm:w-44"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="p-2 min-h-[34px] min-w-[34px] rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer flex items-center justify-center"
            aria-label="Search map location"
          >
            {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
          </button>
        </form>

        {/* Real Map status indicator */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-2xl glass-card-static border border-white/10 text-xs font-semibold text-slate-200 shadow-2xl flex items-center gap-1.5 min-h-[40px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-bold text-white">{validMarkersCount}</span>
            <span className="text-slate-400 text-[11px] hidden sm:inline">active pins</span>
          </div>
        </div>
      </div>

      {/* Empty State Banner when 0 jobs have valid coordinates */}
      {validMarkersCount === 0 && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 px-3.5 py-2 max-w-[90%] rounded-2xl glass-card-static border border-cyan-500/30 text-xs font-medium text-slate-300 shadow-xl backdrop-blur-md flex items-center gap-2 pointer-events-none text-center">
          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>No active jobs with available locations yet.</span>
        </div>
      )}

      {/* Floating Status Notification Toast */}
      {locationStatus && (
        <div className="absolute top-26 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-2xl glass-card-static border border-emerald-400/40 text-xs font-semibold text-emerald-300 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-150">
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
          aria-label="Detect GPS location"
        >
          <Crosshair className="w-4 h-4" />
        </button>

        {/* Map Tile Mode Switcher (Dark vs OSM Standard) */}
        <button
          onClick={() => setTileMode(tileMode === 'dark' ? 'standard' : 'dark')}
          title="Toggle map style"
          className="p-3 rounded-2xl glass-card-static hover:bg-slate-800/80 text-slate-300 hover:text-white border border-white/15 shadow-2xl transition cursor-pointer"
          aria-label="Toggle map style"
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* Zoom Controls */}
        <div className="flex flex-col rounded-2xl overflow-hidden glass-card-static border border-white/15 shadow-2xl">
          <button
            onClick={() => {
              try {
                mapInstanceRef.current?.zoomIn();
              } catch {}
            }}
            className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-800/80 transition cursor-pointer"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-full h-px bg-white/10" />
          <button
            onClick={() => {
              try {
                mapInstanceRef.current?.zoomOut();
              } catch {}
            }}
            className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-800/80 transition cursor-pointer"
            aria-label="Zoom out"
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

// Export JobMap wrapped in MapErrorBoundary
export const JobMap: React.FC<JobMapProps> = (props) => {
  const [resetKey, setResetKey] = useState(0);
  return (
    <MapErrorBoundary key={resetKey} onRetry={() => setResetKey((k) => k + 1)}>
      <JobMapInner {...props} />
    </MapErrorBoundary>
  );
};
