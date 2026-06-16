import { useEffect, useMemo, useState } from 'react';
import { LoaderCircle, MapPin } from 'lucide-react';
import { API_URL, readApiResponse } from '../config/api';
import type { Session } from '../types/auth';

type Attendance = {
  id: number;
  entrada: string;
  salida: string | null;
  estatus: string;
  origen: string;
  locacion_nombre: string;
  duracion_minutos: number;
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('es', { dateStyle: 'full' });

const formatTime = (value: string | null) =>
  value ? new Date(value).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }) : 'En curso';

const formatDuration = (minutes: number) =>
  `${Math.floor(Number(minutes) / 60)}h ${String(Number(minutes) % 60).padStart(2, '0')}m`;

export const HistoryView = ({ session }: { session: Session }) => {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/attendance/me`, {
      headers: { Authorization: `Bearer ${session.token}` },
    })
      .then(readApiResponse)
      .then(setAttendance)
      .catch((err) => setError(err instanceof Error ? err.message : 'No se pudo cargar el historial'))
      .finally(() => setIsLoading(false));
  }, [session.token]);

  const totalMinutes = useMemo(
    () => attendance.reduce((total, item) => total + Number(item.duracion_minutos), 0),
    [attendance]
  );

  if (isLoading) {
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
        <p className="mt-2 text-on-surface-variant">Consulta las entradas y salidas registradas en el sistema.</p>
      </div>

      <div className="rounded-2xl bg-primary-container p-6 text-on-primary-container">
        <span className="text-[10px] font-bold uppercase opacity-80">Total registrado</span>
        <div className="font-headline text-4xl font-black">{formatDuration(totalMinutes)}</div>
      </div>

      {attendance.length === 0 ? (
        <div className="rounded-2xl bg-surface-container-low p-8 text-center text-on-surface-variant">
          Todavia no hay asistencias registradas.
        </div>
      ) : (
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
