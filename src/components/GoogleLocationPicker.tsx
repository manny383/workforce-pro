import { useEffect, useRef, useState } from 'react';
import { LoaderCircle, MapPinned } from 'lucide-react';

declare global {
  interface Window {
    google?: any;
    initWorkforceGoogleMap?: () => void;
    gm_authFailure?: () => void;
  }
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

type Props = {
  latitude: string;
  longitude: string;
  onChange: (latitude: number, longitude: number, address?: string) => void;
};

export const GoogleLocationPicker = ({ latitude, longitude, onChange }: Props) => {
  const mapElement = useRef<HTMLDivElement>(null);
  const searchElement = useRef<HTMLInputElement>(null);
  const map = useRef<any>(null);
  const marker = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const initializeMap = () => {
    if (!mapElement.current || !window.google?.maps) return;
    const center = {
      lat: Number(latitude) || 19.7,
      lng: Number(longitude) || -101.184,
    };

    map.current = new window.google.maps.Map(mapElement.current, {
      center,
      zoom: 16,
      mapTypeControl: false,
      streetViewControl: false,
    });
    marker.current = new window.google.maps.Marker({
      map: map.current,
      position: center,
      draggable: true,
    });

    const selectPosition = (position: any) => {
      const lat = position.lat();
      const lng = position.lng();
      marker.current.setPosition(position);
      map.current.panTo(position);
      onChange(lat, lng);
    };

    map.current.addListener('click', (event: any) => selectPosition(event.latLng));
    marker.current.addListener('dragend', (event: any) => selectPosition(event.latLng));

    if (searchElement.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(searchElement.current, {
        fields: ['formatted_address', 'geometry', 'name'],
      });
      autocomplete.bindTo('bounds', map.current);
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry?.location) return;
        marker.current.setPosition(place.geometry.location);
        map.current.panTo(place.geometry.location);
        map.current.setZoom(17);
        onChange(place.geometry.location.lat(), place.geometry.location.lng(), place.formatted_address || place.name);
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setError('Configura VITE_GOOGLE_MAPS_API_KEY para mostrar Google Maps.');
      setLoading(false);
      return;
    }

    if (window.google?.maps) {
      initializeMap();
      return;
    }

    window.initWorkforceGoogleMap = initializeMap;
    window.gm_authFailure = () => {
      setError('Google Maps rechazo la clave. Habilita facturacion, Maps JavaScript API y Places API, y revisa las restricciones de la clave.');
      setLoading(false);
    };
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-workforce-google-maps]');
    if (existingScript) return;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initWorkforceGoogleMap`;
    script.async = true;
    script.defer = true;
    script.dataset.workforceGoogleMaps = 'true';
    script.onerror = () => {
      setError('No se pudo cargar Google Maps. Verifica la clave y sus restricciones.');
      setLoading(false);
    };
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!map.current || !marker.current || !latitude || !longitude) return;
    const position = { lat: Number(latitude), lng: Number(longitude) };
    marker.current.setPosition(position);
    map.current.panTo(position);
  }, [latitude, longitude]);

  if (error) {
    return <div className="flex h-56 items-center justify-center rounded-xl bg-error-container/30 px-6 text-center text-sm font-semibold text-error">{error}</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-xl bg-surface-container-lowest px-3">
        <MapPinned size={17} className="text-outline" />
        <input ref={searchElement} placeholder="Buscar en Google Maps" className="w-full bg-transparent py-3 text-sm outline-none" />
      </div>
      <div className="relative">
        <div ref={mapElement} className="h-64 w-full rounded-xl" />
        {loading && <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-surface-container-low"><LoaderCircle className="animate-spin text-primary" /></div>}
      </div>
      <p className="text-[11px] text-on-surface-variant">Haz clic en el mapa o arrastra el marcador para elegir la ubicacion exacta.</p>
    </div>
  );
};
