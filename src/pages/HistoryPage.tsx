import { useEffect, useMemo, useState } from 'react';
import { LoaderCircle, MapPin, Search } from 'lucide-react';
import { API_URL, readApiResponse } from '../config/api';
import { isManagerRole } from '../routes/routeUtils';
import type { ApiUser, Session } from '../types/auth';

type Attendance = {
  id: number;
  entrada: string;
  salida: string | null;
  estatus: string;
  origen: string;
  locacion_nombre: string;
  duracion_minutos: number;
};

type ManagedUser = ApiUser & {
  activo: number | boolean;
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('es', { dateStyle: 'full' });

const formatTime = (value: string | null) =>
  value ? new Date(value).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }) : 'En curso';

const formatDuration = (minutes: number) =>
  `${Math.floor(Number(minutes) / 60)}h ${String(Number(minutes) % 60).padStart(2, '0')}m`;

export const HistoryView = ({ session }: { session: Session }) => {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState(session.user.id);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const canSelectUser = isManagerRole(session.user.rol);

  useEffect(() => {
    if (!canSelectUser) return;

    setIsLoadingUsers(true);
    fetch(`${API_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${session.token}` },
    })
      .then(readApiResponse)
      .then((data: ManagedUser[]) => {
        setUsers(data);
        const firstEmployee = data.find((user) => user.rol === 'empleado' && Boolean(user.activo));
        setSelectedUserId(firstEmployee?.id ?? data[0]?.id ?? session.user.id);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'No se pudieron cargar los usuarios'))
      .finally(() => setIsLoadingUsers(false));
  }, [canSelectUser, session.token, session.user.id]);

  useEffect(() => {
    const attendancePath = canSelectUser ? `/api/attendance/${selectedUserId}` : '/api/attendance/me';

    setIsLoading(true);
    setError('');
    fetch(`${API_URL}${attendancePath}`, {
      headers: { Authorization: `Bearer ${session.token}` },
    })
      .then(readApiResponse)
      .then(setAttendance)
      .catch((err) => setError(err instanceof Error ? err.message : 'No se pudo cargar el historial'))
      .finally(() => setIsLoading(false));
  }, [canSelectUser, selectedUserId, session.token]);

  const totalMinutes = useMemo(
    () => attendance.reduce((total, item) => total + Number(item.duracion_minutos), 0),
    [attendance]
  );
  const selectedUser = users.find((user) => user.id === selectedUserId);
  const filteredUsers = useMemo(() => {
    const term = query.trim().toLowerCase();
    return users.filter((user) => !term || `${user.nombre} ${user.correo} ${user.rol}`.toLowerCase().includes(term));
  }, [query, users]);

  if (isLoading && !canSelectUser) {
    return <div className="flex justify-center py-24"><LoaderCircle className="animate-spin text-primary" /></div>;
  }

  if (error) {
    return <div className="rounded-xl bg-error/10 p-5 font-semibold text-error">{error}</div>;
  }

  return (
    <div className="space-y-8 pb-32">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Registros de asistencia</span>
        <h2 className="mt-2 font-headline text-4xl font-extrabold text-primary">Historial</h2>
        <p className="mt-2 text-on-surface-variant">
          {canSelectUser ? 'Selecciona un usuario para consultar sus entradas y salidas.' : 'Consulta las entradas y salidas registradas en el sistema.'}
        </p>
      </div>

      {canSelectUser && (
        <section className="grid gap-4 lg:grid-cols-[minmax(260px,360px)_1fr]">
          <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm ring-1 ring-outline-variant/10">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Usuario</label>
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-surface-container-low px-4 py-3">
              <Search size={17} className="text-outline" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar usuario" className="w-full bg-transparent text-sm outline-none" />
            </div>
            <select value={selectedUserId} onChange={(event) => setSelectedUserId(Number(event.target.value))} disabled={isLoadingUsers} className="mt-3 w-full rounded-xl bg-surface-container-low p-4 text-sm font-semibold outline-primary disabled:opacity-50">
              {filteredUsers.map((user) => <option key={user.id} value={user.id}>{user.nombre} - {user.rol}</option>)}
            </select>
          </div>

          <div className="rounded-2xl bg-primary-container p-6 text-on-primary-container">
            <span className="text-[10px] font-bold uppercase opacity-80">{selectedUser?.nombre || 'Usuario seleccionado'}</span>
            <div className="font-headline text-4xl font-black">{formatDuration(totalMinutes)}</div>
            <p className="mt-1 text-sm font-medium opacity-80">Total registrado</p>
          </div>
        </section>
      )}

      {!canSelectUser && (
        <div className="rounded-2xl bg-primary-container p-6 text-on-primary-container">
          <span className="text-[10px] font-bold uppercase opacity-80">Total registrado</span>
          <div className="font-headline text-4xl font-black">{formatDuration(totalMinutes)}</div>
        </div>
      )}

      {isLoading && <div className="flex justify-center py-16"><LoaderCircle className="animate-spin text-primary" /></div>}

      {!isLoading && attendance.length === 0 ? (
        <div className="rounded-2xl bg-surface-container-low p-8 text-center text-on-surface-variant">
          Todavia no hay asistencias registradas.
        </div>
      ) : !isLoading && (
        <div className="space-y-4">
          {attendance.map((entry) => (
            <div key={entry.id} className="flex flex-col justify-between gap-4 rounded-2xl bg-surface-container-lowest p-5 shadow-sm md:flex-row md:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-headline font-bold capitalize">{formatDate(entry.entrada)}</h3>
                  <span className="rounded-full bg-tertiary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-tertiary">{entry.estatus}</span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">{entry.origen}</span>
                </div>
                <p className="mt-1 flex items-center gap-1 text-sm text-on-surface-variant"><MapPin size={14} /> {entry.locacion_nombre}</p>
              </div>
              <div className="flex gap-8">
                <div><span className="text-[10px] font-bold uppercase text-outline">Horario</span><p className="text-sm font-semibold">{formatTime(entry.entrada)} - {formatTime(entry.salida)}</p></div>
                <div className="text-right"><span className="text-[10px] font-bold uppercase text-outline">Duracion</span><p className="font-headline text-lg font-extrabold text-primary">{formatDuration(entry.duracion_minutos)}</p></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
