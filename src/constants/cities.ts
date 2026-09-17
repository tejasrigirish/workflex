// src/constants/cities.ts
// Centralized city coordinates & geocoding helpers for WorkFlex

export interface CityData {
  lat: number;
  lng: number;
  zoom: number;
}

export const CITY_COORDINATES: Record<string, CityData> = {
  // Karnataka Hubs
  Bengaluru: { lat: 12.9716, lng: 77.5946, zoom: 12 },
  Mysuru: { lat: 12.3168, lng: 76.6384, zoom: 13 },
  Mangaluru: { lat: 12.8750, lng: 74.8500, zoom: 13 },
  Hubballi: { lat: 15.3647, lng: 75.1240, zoom: 13 },
  Belagavi: { lat: 15.8497, lng: 74.4977, zoom: 13 },
  Tumakuru: { lat: 13.3392, lng: 77.1018, zoom: 14 },
  Shivamogga: { lat: 13.9299, lng: 75.5681, zoom: 14 },
  Davanagere: { lat: 14.4644, lng: 75.9218, zoom: 14 },

  // Major Metros across India (Supported in Landing Page & Filters)
  Mumbai: { lat: 19.0760, lng: 72.8777, zoom: 12 },
  'Delhi NCR': { lat: 28.6139, lng: 77.2090, zoom: 12 },
  Delhi: { lat: 28.6139, lng: 77.2090, zoom: 12 },
  Pune: { lat: 18.5204, lng: 73.8567, zoom: 12 },
  Hyderabad: { lat: 17.3850, lng: 78.4867, zoom: 12 },
  Chennai: { lat: 13.0827, lng: 80.2707, zoom: 12 },
  Kolkata: { lat: 22.5726, lng: 88.3639, zoom: 12 },
  Ahmedabad: { lat: 23.0225, lng: 72.5714, zoom: 12 },
};

export const DEFAULT_CITY = 'Bengaluru';
export const DEFAULT_COORDINATES: CityData = CITY_COORDINATES['Bengaluru'];

/**
 * Parses an unknown coordinate value into a strictly finite number,
 * rejecting null, undefined, NaN, empty strings, "NaN", Infinity, etc.
 */
export function parseCoordinate(val: unknown): number | null {
  if (val === null || val === undefined || typeof val === 'boolean') {
    return null;
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed || trimmed.toLowerCase() === 'nan' || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'undefined') {
      return null;
    }
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || Number.isNaN(parsed)) {
      return null;
    }
    return parsed;
  }
  if (typeof val === 'number') {
    if (!Number.isFinite(val) || Number.isNaN(val)) {
      return null;
    }
    return val;
  }
  return null;
}

/**
 * Validates whether latitude and longitude are valid, finite numbers within valid earth bounds:
 * Latitude: -90 to +90
 * Longitude: -180 to +180
 */
export function isValidCoordinate(lat: unknown, lng: unknown): boolean {
  const parsedLat = parseCoordinate(lat);
  const parsedLng = parseCoordinate(lng);
  if (parsedLat === null || parsedLng === null) return false;
  if (parsedLat < -90 || parsedLat > 90) return false;
  if (parsedLng < -180 || parsedLng > 180) return false;
  return true;
}

/**
 * Returns strictly validated coordinates or null if invalid
 */
export function getSafeCoordinate(lat: unknown, lng: unknown): { lat: number; lng: number } | null {
  const parsedLat = parseCoordinate(lat);
  const parsedLng = parseCoordinate(lng);
  if (parsedLat === null || parsedLng === null) return null;
  if (parsedLat < -90 || parsedLat > 90 || parsedLng < -180 || parsedLng > 180) return null;
  return { lat: parsedLat, lng: parsedLng };
}

/**
 * Extracts and strictly validates coordinates from a job object or coordinate container
 */
export function extractJobCoordinates(source: any): { lat: number; lng: number } | null {
  if (!source) return null;

  // If array [lat, lng]
  if (Array.isArray(source) && source.length >= 2) {
    return getSafeCoordinate(source[0], source[1]);
  }

  if (typeof source === 'object') {
    // Direct latitude/longitude properties
    const lat = source.lat ?? source.latitude;
    const lng = source.lng ?? source.longitude ?? source.lon;
    const directSafe = getSafeCoordinate(lat, lng);
    if (directSafe) return directSafe;

    // Nested coordinates object
    if (source.coordinates && typeof source.coordinates === 'object') {
      return extractJobCoordinates(source.coordinates);
    }
  }

  return null;
}

/**
 * Safely resolves city center coordinates with guaranteed non-NaN output
 */
export function getCityCoordinates(cityName?: string): CityData {
  if (!cityName || typeof cityName !== 'string') return DEFAULT_COORDINATES;
  const directMatch = CITY_COORDINATES[cityName];
  if (directMatch && isValidCoordinate(directMatch.lat, directMatch.lng)) {
    return directMatch;
  }

  // Case-insensitive lookup
  const lower = cityName.toLowerCase().trim();
  for (const [key, data] of Object.entries(CITY_COORDINATES)) {
    if (key.toLowerCase() === lower && isValidCoordinate(data.lat, data.lng)) {
      return data;
    }
  }

  return DEFAULT_COORDINATES;
}

/**
 * Sanitizes any raw coordinate input into guaranteed valid, finite coordinates
 * with safe city-center fallback
 */
export function sanitizeCoordinates(
  coords: any,
  fallbackCity?: string
): { lat: number; lng: number } {
  const cityFallback = getCityCoordinates(fallbackCity);
  const safe = extractJobCoordinates(coords);
  if (safe) {
    return safe;
  }
  return { lat: cityFallback.lat, lng: cityFallback.lng };
}
