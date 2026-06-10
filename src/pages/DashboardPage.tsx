import { useEffect, useState } from 'react';
import { ArrowRight, Bell, Clock, LoaderCircle, LogOut, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_URL, readApiResponse } from '../config/api';
import type { Session, View } from '../types/auth';

type DashboardData = {
  checkedIn: boolean;
  todayMinutes: number;
  latestAttendance: null | { entrada: string; salida: string | null; estatus: string; locacion_nombre: string };
  assignments: Array<{ asignacion_id: number; locacion_nombre: string; nombre_turno: string; hora_entrada: string; hora_salida: string }>;
  recent: Array<{ id: number; entrada: string; duracion_minutos: number; locacion_nombre: string }>;
};
const duration = (minutes = 0) => `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
const dateTime = (value?: string | null) => value ? new Date(value).toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' }) : 'Sin actividad';

export const DashboardView = ({ session, onAction, onClockOut }: { session: Session; onAction: (v: View) => void; onClockOut: () => void }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    fetch(`${API_URL}/api/attendance/dashboard`, { headers: { Authorization: `Bearer ${session.token}` } })
      .then(readApiResponse)
      .then(setData)
      .catch((err) => setError(err.message || 'No se pudo cargar el dashboard'));
  }, [session.token]);

  if (!data && !error) return <div className="flex justify-center py-24"><LoaderCircle className="animate-spin text-primary" /></div>;
  if (!data) return <div className="rounded-xl bg-error/10 p-5 font-semibold text-error">{error}</div>;
  const assignment = data.assignments[0];
  const targetMinutes = assignment ? 480 : 0;
  const progress = targetMinutes ? Math.min(100, Math.round((data.todayMinutes / targetMinutes) * 100)) : 0;

  return <div className="space-y-8 pb-32">
    {!data.checkedIn && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-4 rounded-xl border border-primary/10 bg-primary-fixed-dim/20 p-4 shadow-sm">
      <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"><Bell className="text-primary" size={20} /></div><div><p className="font-headline text-sm font-bold text-primary">Registra tu entrada</p><p className="text-xs text-on-surface-variant">{assignment ? `${assignment.locacion_nombre} - ${assignment.nombre_turno}` : 'No tienes horario asignado para hoy'}</p></div></div>
      <button disabled={!assignment} onClick={() => onAction('registration')} className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-white disabled:opacity-40">Entrada</button>
    </motion.div>}

    <section className="space-y-4">
      <div><span className="text-sm font-medium text-on-surface-variant">{new Intl.DateTimeFormat('es', { dateStyle: 'full' }).format(new Date())}</span><h2 className="font-headline text-3xl font-extrabold tracking-tight text-primary">Hola, {session.user.nombre}</h2></div>
      <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-6"><div><p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Estado actual</p><div className="mt-1 flex items-center gap-2"><div className={`h-3 w-3 rounded-full ${data.checkedIn ? 'bg-tertiary' : 'bg-error'}`} /><span className="font-headline text-xl font-bold">{data.checkedIn ? 'Trabajando' : 'Sin entrada activa'}</span></div></div><div className="text-right"><p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Ultima actividad</p><p className="text-sm font-medium">{dateTime(data.latestAttendance?.salida || data.latestAttendance?.entrada)}</p></div></div>
    </section>

    <section className="grid gap-4 md:grid-cols-2">
      <button disabled={data.checkedIn || !assignment} onClick={() => onAction('registration')} className="signature-gradient flex h-[160px] flex-col justify-between rounded-2xl p-6 text-left disabled:opacity-40"><Clock className="text-white" /><div><h3 className="font-headline text-2xl font-bold text-white">Registrar entrada</h3><p className="text-sm text-primary-fixed/80">{assignment ? `${assignment.hora_entrada.slice(0, 5)} - ${assignment.hora_salida.slice(0, 5)}` : 'Sin turno hoy'}</p></div></button>
      <button disabled={!data.checkedIn} onClick={onClockOut} className="flex h-[160px] flex-col justify-between rounded-2xl bg-surface-container-high p-6 text-left disabled:opacity-40"><LogOut /><div><h3 className="font-headline text-2xl font-bold">Registrar salida</h3><p className="text-sm text-on-surface-variant">{data.checkedIn ? data.latestAttendance?.locacion_nombre : 'No tienes una entrada abierta'}</p></div></button>
    </section>

    <section className="grid gap-4 md:grid-cols-3">
      <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm md:col-span-2"><div className="mb-6 flex justify-between"><h3 className="font-headline text-lg font-bold">Horas de hoy</h3><span className="rounded-full bg-tertiary/10 px-3 py-1 text-xs font-bold text-tertiary">{progress}%</span></div><div className="font-headline text-5xl font-extrabold text-primary">{duration(data.todayMinutes)}</div><div className="mt-6 h-2 overflow-hidden rounded-full bg-surface-container-high"><div className="h-full bg-primary" style={{ width: `${progress}%` }} /></div></div>
      <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm"><h3 className="mb-4 font-headline text-lg font-bold">Recientes</h3><div className="space-y-3">{data.recent.slice(0, 2).map((item) => <div key={item.id} className="flex justify-between text-sm"><span className="text-on-surface-variant">{new Date(item.entrada).toLocaleDateString('es', { month: 'short', day: 'numeric' })}</span><span className="font-medium">{duration(item.duracion_minutos)}</span></div>)}</div><button onClick={() => onAction('history')} className="mt-5 flex items-center gap-1 text-sm font-bold text-primary">Ver historial <ArrowRight size={14} /></button></div>
    </section>

    <section className="rounded-2xl bg-surface-container-high p-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"><MapPin className="text-primary" size={20} /></div><div><p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Ubicacion de hoy</p><p className="font-semibold">{assignment?.locacion_nombre || 'Sin ubicacion asignada'}</p></div></div></section>
  </div>;
};
