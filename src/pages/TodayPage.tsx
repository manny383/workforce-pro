import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CalendarCheck, Clock3, LoaderCircle, MapPin, Search, UserCheck } from 'lucide-react';
import { API_URL, readApiResponse } from '../config/api';
import type { Session } from '../types/auth';

type TodayEmployee = {
  usuario_id: number;
  nombre: string;
  correo: string;
  telefono: string | null;
  asignacion_id: number;
  locacion_nombre: string;
  nombre_turno: string;
  hora_entrada: string;
  hora_salida: string;
  tolerancia_minutos: number;
  asistencia_id: number | null;
  entrada: string | null;
  salida: string | null;
  estatus: string | null;
  duracion_minutos: number | null;
  estado_hoy: TodayFilter;
};

type TodaySummary = {
  programados: number;
  presentes: number;
  retardos: number;
  pendientes: number;
  ausentes: number;
  enTurno: number;
};

type TodayData = {
  summary: TodaySummary;
  employees: TodayEmployee[];
};

type TodayUserFallback = {
  id: number;
  nombre: string;
  correo: string;
  telefono: string | null;
  activo: number | boolean;
  ubicacion_hoy?: string | null;
  turno_hoy?: string | null;
  hora_entrada_hoy?: string | null;
  hora_salida_hoy?: string | null;
  asistencia_hoy_id?: number | null;
  entrada_hoy?: string | null;
  salida_hoy?: string | null;
  estatus_hoy?: string | null;
};

type TodayFilter = 'todos' | 'presente' | 'en_turno' | 'retardo' | 'retardo_en_curso' | 'pendiente' | 'ausente';

const filterOptions: Array<{ value: TodayFilter; label: string }> = [
  { value: 'todos', label: 'Todos' },
  { value: 'en_turno', label: 'En turno' },
  { value: 'presente', label: 'Presentes' },
  { value: 'retardo', label: 'Retardos' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'ausente', label: 'Ausentes' },
];

const statusStyles: Record<TodayFilter, { label: string; className: string }> = {
  todos: { label: 'Todos', className: 'bg-surface-container-low text-on-surface-variant' },
  presente: { label: 'Presente', className: 'bg-tertiary/10 text-tertiary' },
  en_turno: { label: 'En turno', className: 'bg-tertiary/10 text-tertiary' },
  retardo: { label: 'Retardo', className: 'bg-error-container/40 text-error' },
  retardo_en_curso: { label: 'Retardo en curso', className: 'bg-error-container/40 text-error' },
  pendiente: { label: 'Pendiente', className: 'bg-primary/10 text-primary' },
  ausente: { label: 'Ausente', className: 'bg-error-container/40 text-error' },
};

const formatHour = (value: string) => String(value).slice(0, 5);
const formatTime = (value: string | null) =>
  value ? new Date(value).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }) : 'Sin registro';
const formatDuration = (minutes: number | null) =>
  minutes === null ? '0h 00m' : `${Math.floor(Number(minutes) / 60)}h ${String(Number(minutes) % 60).padStart(2, '0')}m`;

const getFallbackStatus = (user: TodayUserFallback): TodayFilter => {
  if (!user.asistencia_hoy_id && user.turno_hoy) return 'pendiente';
  if (user.asistencia_hoy_id && !user.salida_hoy && user.estatus_hoy === 'retardo') return 'retardo_en_curso';
  if (user.asistencia_hoy_id && !user.salida_hoy) return 'en_turno';
  if (user.asistencia_hoy_id && user.estatus_hoy === 'retardo') return 'retardo';
  if (user.asistencia_hoy_id) return 'presente';
  return 'pendiente';
};

const buildTodayFallback = (users: TodayUserFallback[]): TodayData => {
  const employees = users
    .filter((user) => Boolean(user.activo) && Boolean(user.turno_hoy))
    .map((user) => ({
      usuario_id: user.id,
      nombre: user.nombre,
      correo: user.correo,
      telefono: user.telefono,
      asignacion_id: user.id,
      locacion_nombre: user.ubicacion_hoy || 'Sin ubicacion',
      nombre_turno: user.turno_hoy || 'Sin turno',
      hora_entrada: user.hora_entrada_hoy || '',
      hora_salida: user.hora_salida_hoy || '',
      tolerancia_minutos: 0,
      asistencia_id: user.asistencia_hoy_id || null,
      entrada: user.entrada_hoy || null,
      salida: user.salida_hoy || null,
      estatus: user.estatus_hoy || null,
      duracion_minutos: null,
      estado_hoy: getFallbackStatus(user),
    }));
  const summary = employees.reduce((total, item) => {
    total.programados += 1;
    if (item.estado_hoy === 'presente' || item.estado_hoy === 'en_turno') total.presentes += 1;
    if (item.estado_hoy === 'retardo' || item.estado_hoy === 'retardo_en_curso') total.retardos += 1;
    if (item.estado_hoy === 'pendiente') total.pendientes += 1;
    if (item.estado_hoy === 'ausente') total.ausentes += 1;
    if (item.estado_hoy === 'en_turno' || item.estado_hoy === 'retardo_en_curso') total.enTurno += 1;
    return total;
  }, { programados: 0, presentes: 0, retardos: 0, pendientes: 0, ausentes: 0, enTurno: 0 });

  return { summary, employees };
};

export const TodayView = ({
  session,
  onBack,
  initialFilter = 'todos',
  title = 'Hoy',
}: {
  session: Session;
  onBack: () => void;
  initialFilter?: TodayFilter;
  title?: string;
}) => {
  const [data, setData] = useState<TodayData | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<TodayFilter>(initialFilter);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/admin/today`, { headers: { Authorization: `Bearer ${session.token}` } })
      .then(readApiResponse)
      .then(setData)
      .catch(() => fetch(`${API_URL}/api/admin/users`, { headers: { Authorization: `Bearer ${session.token}` } })
        .then(readApiResponse)
        .then((users: TodayUserFallback[]) => setData(buildTodayFallback(users)))
        .catch((err) => setError(err.message || 'No se pudo cargar la vista de hoy')));
  }, [session.token]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return (data?.employees || []).filter((employee) => {
      const statusMatch = filter === 'todos'
        || employee.estado_hoy === filter
        || (filter === 'retardo' && employee.estado_hoy === 'retardo_en_curso');
      const termMatch = !term || `${employee.nombre} ${employee.correo} ${employee.locacion_nombre} ${employee.nombre_turno}`.toLowerCase().includes(term);
      return statusMatch && termMatch;
    });
  }, [data?.employees, filter, query]);

  if (!data && !error) return <div className="flex justify-center py-24"><LoaderCircle className="animate-spin text-primary" /></div>;
  if (!data) return <div className="rounded-xl bg-error/10 p-5 font-semibold text-error">{error}</div>;

  return (
    <div className="space-y-8 pb-32">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <button onClick={onBack} className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-primary"><ArrowLeft size={16} /> Volver al panel</button>
          <h2 className="font-headline text-4xl font-extrabold text-primary">{title}</h2>
          <p className="mt-2 text-on-surface-variant">{new Intl.DateTimeFormat('es', { dateStyle: 'full' }).format(new Date())}</p>
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: 'Programados', value: data.summary.programados, icon: CalendarCheck },
          { label: 'En turno', value: data.summary.enTurno, icon: UserCheck },
          { label: 'Presentes', value: data.summary.presentes, icon: UserCheck },
          { label: 'Retardos', value: data.summary.retardos, icon: Clock3 },
          { label: 'Ausentes', value: data.summary.ausentes, icon: Clock3 },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm ring-1 ring-outline-variant/10">
            <item.icon className="mb-3 text-primary" size={20} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{item.label}</span>
            <p className="mt-2 font-headline text-3xl font-extrabold text-primary">{item.value}</p>
          </div>
        ))}
      </section>

      <div className="flex items-center gap-3 rounded-2xl bg-surface-container-lowest px-5 py-4 shadow-sm ring-1 ring-outline-variant/10">
        <Search size={19} className="text-outline" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar empleado, turno o ubicacion" className="w-full border-0 bg-transparent text-sm outline-none" />
        <span className="text-xs font-bold text-on-surface-variant">{filtered.length} registros</span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${filter === option.value ? 'bg-primary text-white' : 'bg-surface-container-lowest text-on-surface-variant ring-1 ring-outline-variant/10'}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {!filtered.length ? (
        <div className="rounded-2xl bg-surface-container-low p-8 text-center text-on-surface-variant">No hay empleados en esta vista.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((employee) => {
            const status = statusStyles[employee.estado_hoy] || statusStyles.pendiente;
            return (
              <article key={`${employee.usuario_id}-${employee.asignacion_id}`} className="grid gap-4 rounded-2xl bg-surface-container-lowest p-5 shadow-sm ring-1 ring-outline-variant/10 lg:grid-cols-[1.3fr_1fr_1fr_auto] lg:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-headline text-lg font-bold text-on-surface">{employee.nombre}</h3>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${status.className}`}>{status.label}</span>
                  </div>
                  <p className="mt-1 text-sm text-on-surface-variant">{employee.correo}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-outline">Turno</span>
                  <p className="mt-1 text-sm font-bold text-on-surface">{employee.nombre_turno}</p>
                  <p className="text-xs text-on-surface-variant">{formatHour(employee.hora_entrada)} - {formatHour(employee.hora_salida)} · {employee.tolerancia_minutos} min</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-outline">Registro</span>
                  <p className="mt-1 text-sm font-bold text-on-surface">{formatTime(employee.entrada)}{employee.salida ? ` - ${formatTime(employee.salida)}` : employee.entrada ? ' - En curso' : ''}</p>
                  <p className="text-xs text-on-surface-variant">{formatDuration(employee.duracion_minutos)}</p>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-primary lg:justify-end">
                  <MapPin size={16} /> {employee.locacion_nombre}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
