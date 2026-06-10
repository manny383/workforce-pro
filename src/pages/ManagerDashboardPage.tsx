import { useEffect, useState } from 'react';
import { AlertCircle, BadgeCheck, Clock, History as HistoryIcon, LoaderCircle, MapPin, User } from 'lucide-react';
import { API_URL } from '../config/api';
import type { Session, View } from '../types/auth';

type ManagerData = {
  summary: { empleados: number; locaciones: number; activos: number; retardos: number; programados: number; presentes: number; ausentes: number };
  weekly: Array<{ fecha: string; presentes: number }>;
  alerts: Array<{ nombre: string; locacion_nombre: string; entrada: string; minutos_retardo: number }>;
  locations: Array<{ id: number; nombre: string; activos: number }>;
};

export const ManagerDashboardView = ({ session, onAction }: { session: Session; onAction: (v: View) => void }) => {
  const [data, setData] = useState<ManagerData | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    fetch(`${API_URL}/api/admin/dashboard`, { headers: { Authorization: `Bearer ${session.token}` } })
      .then(async (response) => { const body = await response.json(); if (!response.ok) throw new Error(body.message); setData(body); })
      .catch((err) => setError(err.message || 'No se pudo cargar el dashboard'));
  }, [session.token]);
  if (!data && !error) return <div className="flex justify-center py-24"><LoaderCircle className="animate-spin text-primary" /></div>;
  if (!data) return <div className="rounded-xl bg-error/10 p-5 font-semibold text-error">{error}</div>;
  const maxWeekly = Math.max(1, ...data.weekly.map((day) => Number(day.presentes)));

  return <div className="space-y-10 pb-32">
    <div><h2 className="font-headline text-4xl font-extrabold tracking-tight text-primary">Panel administrativo</h2><p className="font-medium text-on-surface-variant">{new Intl.DateTimeFormat('es', { dateStyle: 'full' }).format(new Date())}</p></div>
    <div className="grid gap-6 md:grid-cols-4">
      <div className="relative overflow-hidden rounded-2xl bg-surface-container-low p-8 md:col-span-2"><span className="inline-flex items-center gap-2 rounded-full bg-tertiary/10 px-3 py-1 text-[10px] font-bold uppercase text-tertiary"><span className="h-2 w-2 animate-pulse rounded-full bg-tertiary" /> En vivo</span><h3 className="mt-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Trabajadores activos</h3><div className="flex items-baseline gap-3"><span className="font-headline text-6xl font-extrabold text-primary">{data.summary.activos}</span><span className="text-lg text-on-surface-variant">/ {data.summary.empleados}</span></div><User className="absolute -bottom-5 -right-5 opacity-10" size={150} /></div>
      <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm"><AlertCircle className="mb-4 text-error" /><h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Retardos hoy</h3><p className="font-headline text-4xl font-bold">{data.summary.retardos}</p></div>
      <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm"><User className="mb-4 text-outline" /><h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Ausentes hoy</h3><p className="font-headline text-4xl font-bold">{data.summary.ausentes}</p><p className="mt-4 text-xs text-on-surface-variant">{data.summary.presentes} de {data.summary.programados} programados</p></div>
    </div>
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="space-y-8 lg:col-span-8">
        <section className="rounded-2xl bg-surface-container-low p-8"><h3 className="font-headline text-xl font-bold text-primary">Asistencia ultimos 7 dias</h3><div className="mt-8 flex h-52 items-end gap-3">{data.weekly.map((day) => <div key={day.fecha} className="flex flex-1 flex-col items-center justify-end gap-2"><span className="text-xs font-bold text-primary">{day.presentes}</span><div className="w-full rounded-t-lg bg-primary/30" style={{ height: `${Math.max(8, (Number(day.presentes) / maxWeekly) * 100)}%` }} /><span className="text-[10px] font-bold uppercase text-on-surface-variant">{new Date(day.fecha).toLocaleDateString('es', { weekday: 'short' })}</span></div>)}</div>{!data.weekly.length && <p className="mt-8 text-sm text-on-surface-variant">Todavia no hay registros esta semana.</p>}</section>
        <section><h3 className="mb-6 font-headline text-xl font-bold text-primary">Control administrativo</h3><div className="grid gap-4 md:grid-cols-3">{[{ label: 'Ubicaciones', sub: `${data.summary.locaciones} activas`, icon: MapPin, view: 'locations' }, { label: 'Empleados', sub: `${data.summary.empleados} activos`, icon: BadgeCheck, view: 'team' }, { label: 'Reportes', sub: 'Historial de asistencia', icon: HistoryIcon, view: 'history' }].map((item) => <button key={item.label} onClick={() => onAction(item.view as View)} className="flex flex-col items-start rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 hover:border-primary"><item.icon className="mb-4 text-primary" /><span className="font-bold">{item.label}</span><span className="mt-1 text-xs text-on-surface-variant">{item.sub}</span></button>)}</div></section>
      </div>
      <div className="space-y-6 lg:col-span-4"><section className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm"><h3 className="mb-5 font-headline text-lg font-bold">Retardos recientes</h3><div className="space-y-5">{data.alerts.map((alert) => <div key={`${alert.nombre}-${alert.entrada}`} className="flex gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-error/10"><Clock className="text-error" size={17} /></div><div><p className="text-sm font-bold">{alert.nombre}</p><p className="text-xs text-on-surface-variant">{alert.locacion_nombre || 'Sin ubicacion'} · {alert.minutos_retardo || 0} min</p></div></div>)}{!data.alerts.length && <p className="text-sm text-on-surface-variant">Sin retardos registrados hoy.</p>}</div></section><section className="rounded-2xl bg-surface-container-low p-6"><h3 className="mb-4 font-headline text-lg font-bold text-primary">Actividad por ubicacion</h3><div className="space-y-3">{data.locations.map((location) => <div key={location.id} className="flex justify-between text-sm"><span>{location.nombre}</span><span className="font-bold text-primary">{location.activos} activos</span></div>)}</div></section></div>
    </div>
  </div>;
};
