import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Phone,
  Navigation,
  Loader2,
  AlertCircle,
  Stethoscope,
  RefreshCw,
  Clock,
  Search,
  LocateFixed,
} from 'lucide-react';

// ── Config ───────────────────────────────────────────────────────────────
// Uses OpenStreetMap's free Overpass API (search) and Nominatim (geocoding
// for manual location entry) — no key, no billing required for either.
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const SEARCH_RADIUS_METERS = 15000; // 15km

function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function buildQuery(lat, lon) {
  // Prioritizes dermatology-tagged facilities, falls back to general
  // doctors/clinics/hospitals — checks both common OSM tagging schemes
  // (amenity=* and healthcare=*) since mappers use either inconsistently.
  return `
    [out:json][timeout:25];
    (
      node["healthcare:speciality"~"dermatology",i](around:${SEARCH_RADIUS_METERS},${lat},${lon});
      way["healthcare:speciality"~"dermatology",i](around:${SEARCH_RADIUS_METERS},${lat},${lon});
      node["amenity"="doctors"](around:${SEARCH_RADIUS_METERS},${lat},${lon});
      node["amenity"="clinic"](around:${SEARCH_RADIUS_METERS},${lat},${lon});
      node["amenity"="hospital"](around:${SEARCH_RADIUS_METERS},${lat},${lon});
      way["amenity"="hospital"](around:${SEARCH_RADIUS_METERS},${lat},${lon});
      node["healthcare"="doctor"](around:${SEARCH_RADIUS_METERS},${lat},${lon});
      node["healthcare"="clinic"](around:${SEARCH_RADIUS_METERS},${lat},${lon});
      node["healthcare"="hospital"](around:${SEARCH_RADIUS_METERS},${lat},${lon});
      way["healthcare"="hospital"](around:${SEARCH_RADIUS_METERS},${lat},${lon});
    );
    out center tags;
  `;
}

function parseElement(el, userLat, userLon) {
  const lat = el.lat || el.center?.lat;
  const lon = el.lon || el.center?.lon;
  if (!lat || !lon) return null;

  const tags = el.tags || {};
  const name = tags.name || 'Unnamed clinic';
  const isDermatology = /dermatolog/i.test(tags['healthcare:speciality'] || '');
  const addressParts = [tags['addr:housenumber'], tags['addr:street'], tags['addr:city']]
    .filter(Boolean)
    .join(', ');
  const phone = tags.phone || tags['contact:phone'] || null;

  return {
    id: el.id,
    name,
    isDermatology,
    address: addressParts || null,
    phone,
    lat,
    lon,
    distanceKm: haversineDistanceKm(userLat, userLon, lat, lon),
  };
}

const AppointmentBooking = () => {
  const { t } = useTranslation();
  const [status, setStatus] = useState('idle'); // idle | locating | searching | done | error
  const [errorMsg, setErrorMsg] = useState(null);
  const [results, setResults] = useState([]);
  const [coords, setCoords] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const [geocoding, setGeocoding] = useState(false);
  const hasSearchedOnce = useRef(false);

  // Core search — runs the Overpass query for a given lat/lon.
  const runSearch = useCallback(async (latitude, longitude, accuracy = null) => {
    setCoords({ latitude, longitude, accuracy });
    setStatus('searching');
    setErrorMsg(null);
    try {
      const response = await fetch(OVERPASS_URL, {
        method: 'POST',
        headers: { 'content-type': 'text/plain' },
        body: buildQuery(latitude, longitude),
      });

      if (!response.ok) throw new Error('Search service unavailable, please try again.');

      const data = await response.json();
      const parsed = (data.elements || [])
        .map((el) => parseElement(el, latitude, longitude))
        .filter(Boolean)
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, 12);

      setResults(parsed);
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Something went wrong while searching.');
    }
  }, []);

  // Uses the browser's GPS/network location.
  const searchByGeolocation = useCallback(() => {
    setStatus('locating');
    setErrorMsg(null);
    setResults([]);
    setCoords(null);
    hasSearchedOnce.current = true;

    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMsg('Your browser does not support location access.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        runSearch(latitude, longitude, accuracy);
      },
      () => {
        setStatus('error');
        setErrorMsg(
          'Location access was denied or unavailable. Try entering your area manually below instead.'
        );
      }
    );
  }, [runSearch]);

  // Uses a manually typed address/city, converted to coordinates via
  // Nominatim (free OpenStreetMap geocoding, no key needed).
  const searchByManualLocation = useCallback(
    async (e) => {
      e.preventDefault();
      const query = manualInput.trim();
      if (!query || geocoding) return;

      setGeocoding(true);
      setStatus('locating');
      setErrorMsg(null);
      setResults([]);
      setCoords(null);
      hasSearchedOnce.current = true;

      try {
        const geoResponse = await fetch(
          `${NOMINATIM_URL}?format=json&limit=1&q=${encodeURIComponent(query)}`
        );
        const geoData = await geoResponse.json();

        if (!geoData.length) {
          setStatus('error');
          setErrorMsg(`Couldn't find "${query}". Try a more specific area or city name.`);
          setGeocoding(false);
          return;
        }

        const { lat, lon } = geoData[0];
        await runSearch(parseFloat(lat), parseFloat(lon), null);
      } catch (err) {
        setStatus('error');
        setErrorMsg('Could not look up that location. Please try again.');
      } finally {
        setGeocoding(false);
      }
    },
    [manualInput, geocoding, runSearch]
  );

  const directionsUrl = (r) =>
    `https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lon}`;

  const isBusy = status === 'locating' || status === 'searching';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col min-h-[70vh]">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
            <Stethoscope className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-800 dark:text-white truncate">
              {t('dashboard.appointment.title', 'Find a Dermatologist')}
            </h2>
            <p className="text-xs text-slate-400 truncate">
              {t('dashboard.appointment.subtitle', 'Search by your location or GPS')}
            </p>
          </div>
        </div>
        <button
          onClick={searchByGeolocation}
          disabled={isBusy}
          className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-2 rounded-xl transition-all disabled:opacity-40 shrink-0"
        >
          <LocateFixed className={`w-3.5 h-3.5 ${isBusy ? 'animate-spin' : ''}`} />
          {t('dashboard.appointment.useGps', 'Use GPS')}
        </button>
      </div>

      {/* Manual location entry — the reliable fallback for inaccurate GPS */}
      <form onSubmit={searchByManualLocation} className="px-5 pt-4 flex gap-2">
        <input
          type="text"
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          placeholder={t(
            'dashboard.appointment.manualPlaceholder',
            'Enter your area, city, or pincode (e.g. Koramangala, Bangalore)'
          )}
          className="flex-1 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isBusy || !manualInput.trim()}
          className="shrink-0 inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold px-4 rounded-xl transition-all"
        >
          <Search className="w-4 h-4" />
          {t('dashboard.appointment.search', 'Search')}
        </button>
      </form>

      {coords && (
        <div className="px-5 pt-3 pb-0">
          <div className="flex items-center justify-between gap-2 text-[11px] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl px-3 py-2">
            <span className="text-slate-400">
              {t('dashboard.appointment.detectedLocation', 'Searching near')}: {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}
              {coords.accuracy ? ` (±${Math.round(coords.accuracy)}m)` : ''}
            </span>
            <a
              href={`https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 font-medium hover:underline shrink-0"
            >
              {t('dashboard.appointment.verifyOnMap', 'Verify on map')}
            </a>
          </div>
        </div>
      )}

      <div className="flex-1 p-5 overflow-auto">
        {!hasSearchedOnce.current && status === 'idle' && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center max-w-md mx-auto text-slate-400">
            <MapPin className="w-8 h-8" />
            <p className="text-sm">
              {t(
                'dashboard.appointment.startPrompt',
                'Type your city or area above, or tap "Use GPS" to find nearby dermatologists.'
              )}
            </p>
          </div>
        )}

        {isBusy && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-sm">
              {status === 'locating'
                ? t('dashboard.appointment.locating', 'Finding location...')
                : t('dashboard.appointment.searching', 'Searching for nearby dermatologists...')}
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center max-w-md mx-auto">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <p className="text-sm text-slate-500 dark:text-slate-400">{errorMsg}</p>
          </div>
        )}

        {status === 'done' && results.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center max-w-md mx-auto text-slate-400">
            <MapPin className="w-8 h-8" />
            <p className="text-sm">
              {t(
                'dashboard.appointment.empty',
                "No clinics found nearby. Try a different area name, or search online for dermatologists in your area."
              )}
            </p>
          </div>
        )}

        {status === 'done' && results.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-4">
            {results.map((r) => (
              <div
                key={r.id}
                className="border border-slate-100 dark:border-slate-700 rounded-2xl p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-slate-800 dark:text-white text-sm leading-snug">
                    {r.name}
                  </h3>
                  {r.isDermatology && (
                    <span className="shrink-0 text-[10px] font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-lg">
                      {t('dashboard.appointment.dermBadge', 'Dermatology')}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    {r.address || t('dashboard.appointment.noAddress', 'Address not listed')}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>{r.distanceKm.toFixed(1)} km {t('dashboard.appointment.away', 'away')}</span>
                </div>

                <div className="flex gap-2">
                  <a
                    href={directionsUrl(r)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-xl transition-all"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    {t('dashboard.appointment.directions', 'Directions')}
                  </a>
                  {r.phone && (
                    <a
                      href={`tel:${r.phone}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-xs font-semibold py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {t('dashboard.appointment.call', 'Call')}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 pb-4">
        <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
          {t(
            'dashboard.appointment.disclaimer',
            'Listings are sourced from OpenStreetMap and may not always be complete or current — please confirm details before visiting.'
          )}
        </p>
      </div>
    </div>
  );
};

export default AppointmentBooking;
