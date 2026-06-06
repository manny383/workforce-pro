import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowLeft, Crosshair, LoaderCircle, MapPin, Plus, Radar, Search, ToggleLeft, ToggleRight, X } from 'lucide-react';
import { GoogleLocationPicker } from '../components/GoogleLocationPicker';
import { API_URL } from '../config/api';
import { getCurrentPosition } from '../lib/geo';
import type { Session } from '../types/auth';

type Location = {
  id: number;
  nombre: string;
  descripcion: string | null;
  latitud: number | string;
  longitud: number | string;
  radio_permitido: number;
  activa: number | boolean;
};

const emptyForm = { nombre: '', descripcion: '', latitud: '', longitud: '', radio_permitido: '100' };

export const LocationsView = ({ session, onBack }: { session: Session; onBack: () => void }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [findingPosition, setFindingPosition] = useState(false);

  const request = async (path: string, options?: RequestInit) => {
    const response = await fetch(`${API_URL}/api/admin${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}`, ...options?.headers },
    });
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await response.json() : null;
    if (!response.ok) throw new Error(data?.message || 'La API administrativa no esta disponible');
    if (!data) throw new Error('La API devolvio una respuesta inesperada');
    return data;
  };

  useEffect(() => {
    request('/locations')
      .then(setLocations)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const term = query.toLowerCase().trim();
    return locations.filter((location) => !term || `${location.nombre} ${location.descripcion || ''}`.toLowerCase().includes(term));
  }, [locations, query]);

  const createLocation = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError('');
      const location = await request('/locations', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          latitud: Number(form.latitud),
          longitud: Number(form.longitud),
          radio_permitido: Number(form.radio_permitido),
        }),
      });
      setLocations((current) => [...current, location].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      setForm(emptyForm);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la locacion');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (location: Location) => {
    try {
      setError('');
      const activa = !Boolean(location.activa);
      await request(`/locations/${location.id}/status`, { method: 'PATCH', body: JSON.stringify({ activa }) });
      setLocations((current) => current.map((item) => item.id === location.id ? { ...item, activa } : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la locacion');
    }
  };

  const useCurrentLocation = async () => {
    setFindingPosition(true);
    setError('');
    const position = await getCurrentPosition();
    setFindingPosition(false);

    if (!position) {
      setError('No se pudo obtener la ubicacion. Activa el GPS y concede permiso a la aplicacion.');
      return;
    }

    setForm((current) => ({
      ...current,
      latitud: position.coords.latitude.toFixed(8),
      longitud: position.coords.longitude.toFixed(8),
    }));
  };

  const selectMapPosition = (latitude: number, longitude: number, address?: string) => {
    setForm((current) => ({
      ...current,
      descripcion: current.descripcion || address || '',
      latitud: latitude.toFixed(8),
      longitud: longitude.toFixed(8),
    }));
  };

  return (
    <div className="space-y-8 pb-32">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <button onClick={onBack} className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-primary"><ArrowLeft size={16} /> Volver al panel</button>
          <h2 className="font-headline text-4xl font-extrabold text-primary">Locaciones</h2>
          <p className="mt-2 text-on-surface-variant">Configura los sitios autorizados para registrar asistencia.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg"><Plus size={18} /> Nueva locacion</button>
      </div>

      {error && <div className="rounded-xl bg-error-container/40 px-5 py-4 text-sm font-semibold text-error">{error}</div>}

      <div className="flex items-center gap-3 rounded-2xl bg-surface-container-lowest px-5 py-4 shadow-sm ring-1 ring-outline-variant/10">
        <Search size={19} className="text-outline" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar locacion" className="w-full border-0 bg-transparent text-sm outline-none" />
        <span className="text-xs font-bold text-on-surface-variant">{filtered.length} sitios</span>
      </div>

      {loading ? <div className="flex justify-center py-20"><LoaderCircle className="animate-spin text-primary" /></div> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((location) => (
            <article key={location.id} className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm ring-1 ring-outline-variant/10">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"><MapPin size={22} /></div>
                <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${location.activa ? 'bg-tertiary/10 text-tertiary' : 'bg-error-container/40 text-error'}`}>{location.activa ? 'Activa' : 'Inactiva'}</span>
              </div>
              <h3 className="mt-5 font-headline text-lg font-bold text-on-surface">{location.nombre}</h3>
              <p className="mt-1 min-h-10 text-sm text-on-surface-variant">{location.descripcion || 'Sin descripcion'}</p>
              <div className="mt-4 rounded-xl bg-surface-container-low p-3 text-xs text-on-surface-variant">
                <p>{Number(location.latitud).toFixed(6)}, {Number(location.longitud).toFixed(6)}</p>
                <p className="mt-1 flex items-center gap-1 font-bold text-primary"><Radar size={14} /> Radio: {location.radio_permitido} m</p>
              </div>
              <button onClick={() => void toggleStatus(location)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-surface-container-low py-3 text-xs font-bold text-on-surface-variant">
                {location.activa ? <ToggleRight size={18} /> : <ToggleLeft size={18} />} {location.activa ? 'Desactivar' : 'Activar'}
              </button>
            </article>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/30 p-5 backdrop-blur-sm">
          <form onSubmit={createLocation} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-surface-container-lowest p-7 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div><h3 className="font-headline text-2xl font-bold text-primary">Nueva locacion</h3><p className="text-sm text-on-surface-variant">Define su zona autorizada.</p></div>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-full bg-surface-container-low p-2"><X size={18} /></button>
            </div>
            <div className="grid gap-4">
              <input required placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="rounded-xl bg-surface-container-low p-4 text-sm outline-primary" />
              <textarea placeholder="Descripcion (opcional)" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="rounded-xl bg-surface-container-low p-4 text-sm outline-primary" />
              <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4">
                <div className="mb-3 flex justify-end">
                  <button type="button" disabled={findingPosition} onClick={() => void useCurrentLocation()} className="flex items-center justify-center gap-2 rounded-full bg-tertiary px-5 py-3 text-xs font-bold text-white disabled:opacity-60">
                    {findingPosition ? <LoaderCircle size={16} className="animate-spin" /> : <Crosshair size={16} />} Mi ubicacion
                  </button>
                </div>
                <GoogleLocationPicker latitude={form.latitud} longitude={form.longitud} onChange={selectMapPosition} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input required type="number" step="any" min="-90" max="90" placeholder="Latitud" value={form.latitud} onChange={(e) => setForm({ ...form, latitud: e.target.value })} className="rounded-xl bg-surface-container-low p-4 text-sm outline-primary" />
                <input required type="number" step="any" min="-180" max="180" placeholder="Longitud" value={form.longitud} onChange={(e) => setForm({ ...form, longitud: e.target.value })} className="rounded-xl bg-surface-container-low p-4 text-sm outline-primary" />
              </div>
              <input required type="number" min="1" placeholder="Radio permitido en metros" value={form.radio_permitido} onChange={(e) => setForm({ ...form, radio_permitido: e.target.value })} className="rounded-xl bg-surface-container-low p-4 text-sm outline-primary" />
              <button disabled={saving} className="mt-2 flex items-center justify-center gap-2 rounded-full bg-primary py-4 font-bold text-white disabled:opacity-60">{saving && <LoaderCircle size={18} className="animate-spin" />} Crear locacion</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
