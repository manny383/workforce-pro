import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowLeft, Clock3, LoaderCircle, Pencil, Plus, Search, Timer, X } from 'lucide-react';
import { API_URL } from '../config/api';
import type { Session } from '../types/auth';

type Shift = {
  id: number;
  nombre_turno: string;
  hora_entrada: string;
  hora_salida: string;
  tolerancia_minutos: number;
};

const emptyForm = { nombre_turno: '', hora_entrada: '08:00', hora_salida: '17:00', tolerancia_minutos: '10' };
const shiftToForm = (shift: Shift) => ({
  nombre_turno: shift.nombre_turno,
  hora_entrada: String(shift.hora_entrada).slice(0, 5),
  hora_salida: String(shift.hora_salida).slice(0, 5),
  tolerancia_minutos: String(shift.tolerancia_minutos ?? 10),
});
const formatHour = (value: string) => String(value).slice(0, 5);

export const ShiftsView = ({ session, onBack }: { session: Session; onBack: () => void }) => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [form, setForm] = useState(emptyForm);

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
    request('/shifts')
      .then(setShifts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const term = query.toLowerCase().trim();
    return shifts.filter((shift) => !term || `${shift.nombre_turno} ${shift.hora_entrada} ${shift.hora_salida}`.toLowerCase().includes(term));
  }, [query, shifts]);

  const closeForm = () => {
    setShowForm(false);
    setEditingShift(null);
    setForm(emptyForm);
  };

  const openCreate = () => {
    setError('');
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (shift: Shift) => {
    setError('');
    setEditingShift(shift);
    setForm(shiftToForm(shift));
  };

  const saveShift = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError('');
      const payload = { ...form, tolerancia_minutos: Number(form.tolerancia_minutos) };
      const saved = await request(editingShift ? `/shifts/${editingShift.id}` : '/shifts', {
        method: editingShift ? 'PATCH' : 'POST',
        body: JSON.stringify(payload),
      });
      setShifts((current) => {
        const next = editingShift
          ? current.map((shift) => shift.id === editingShift.id ? saved : shift)
          : [...current, saved];
        return next.sort((a, b) => String(a.hora_entrada).localeCompare(String(b.hora_entrada)));
      });
      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el turno');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-32">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <button onClick={onBack} className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-primary"><ArrowLeft size={16} /> Volver al panel</button>
          <h2 className="font-headline text-4xl font-extrabold text-primary">Turnos</h2>
          <p className="mt-2 text-on-surface-variant">Administra horarios base y tolerancia de entrada.</p>
        </div>
        <button onClick={openCreate} className="flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg"><Plus size={18} /> Nuevo turno</button>
      </div>

      {error && <div className="rounded-xl bg-error-container/40 px-5 py-4 text-sm font-semibold text-error">{error}</div>}

      <div className="flex items-center gap-3 rounded-2xl bg-surface-container-lowest px-5 py-4 shadow-sm ring-1 ring-outline-variant/10">
        <Search size={19} className="text-outline" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar turno u horario" className="w-full border-0 bg-transparent text-sm outline-none" />
        <span className="text-xs font-bold text-on-surface-variant">{filtered.length} turnos</span>
      </div>

      {loading ? <div className="flex justify-center py-20"><LoaderCircle className="animate-spin text-primary" /></div> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((shift) => (
            <article key={shift.id} className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm ring-1 ring-outline-variant/10">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"><Clock3 size={22} /></div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase text-primary">{shift.tolerancia_minutos} min tolerancia</span>
              </div>
              <h3 className="mt-5 font-headline text-lg font-bold text-on-surface">{shift.nombre_turno}</h3>
              <div className="mt-4 rounded-xl bg-surface-container-low p-4">
                <p className="flex items-center gap-2 font-headline text-2xl font-extrabold text-primary">
                  <Timer size={20} /> {formatHour(shift.hora_entrada)} - {formatHour(shift.hora_salida)}
                </p>
                <p className="mt-2 text-xs text-on-surface-variant">Este horario se usa al asignar turnos a empleados.</p>
              </div>
              <button onClick={() => openEdit(shift)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-surface-container-low py-3 text-xs font-bold text-on-surface-variant">
                <Pencil size={16} /> Editar turno
              </button>
            </article>
          ))}
        </div>
      )}

      {(showForm || editingShift) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/30 p-5 backdrop-blur-sm">
          <form onSubmit={saveShift} className="w-full max-w-lg rounded-3xl bg-surface-container-lowest p-7 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-headline text-2xl font-bold text-primary">{editingShift ? 'Editar turno' : 'Nuevo turno'}</h3>
                <p className="text-sm text-on-surface-variant">Define el horario y minutos de tolerancia.</p>
              </div>
              <button type="button" onClick={closeForm} className="rounded-full bg-surface-container-low p-2"><X size={18} /></button>
            </div>
            <div className="grid gap-4">
              <input required placeholder="Nombre del turno" value={form.nombre_turno} onChange={(e) => setForm({ ...form, nombre_turno: e.target.value })} className="rounded-xl bg-surface-container-low p-4 text-sm outline-primary" />
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs font-bold text-on-surface-variant">Entrada<input required type="time" value={form.hora_entrada} onChange={(e) => setForm({ ...form, hora_entrada: e.target.value })} className="mt-2 w-full rounded-xl bg-surface-container-low p-4 text-sm outline-primary" /></label>
                <label className="text-xs font-bold text-on-surface-variant">Salida<input required type="time" value={form.hora_salida} onChange={(e) => setForm({ ...form, hora_salida: e.target.value })} className="mt-2 w-full rounded-xl bg-surface-container-low p-4 text-sm outline-primary" /></label>
              </div>
              <input required type="number" min="0" placeholder="Tolerancia en minutos" value={form.tolerancia_minutos} onChange={(e) => setForm({ ...form, tolerancia_minutos: e.target.value })} className="rounded-xl bg-surface-container-low p-4 text-sm outline-primary" />
              <button disabled={saving} className="mt-2 flex items-center justify-center gap-2 rounded-full bg-primary py-4 font-bold text-white disabled:opacity-60">
                {saving && <LoaderCircle size={18} className="animate-spin" />} {editingShift ? 'Guardar cambios' : 'Crear turno'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
