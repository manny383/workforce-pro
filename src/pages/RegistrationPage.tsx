import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Camera, CheckCircle2, Fingerprint, LoaderCircle, MapPin, ShieldCheck, User } from 'lucide-react';
import { API_URL, readApiResponse } from '../config/api';
import { verifyBiometricPresence, type BiometricVerification } from '../lib/biometric';
import type { Session } from '../types/auth';

type TodayAssignment = {
  asignacion_id: number; locacion_id: number; locacion_nombre: string; nombre_turno: string;
  hora_entrada: string; hora_salida: string;
};
type ClockInLocation = { id: number; nombre: string; descripcion: string | null };

export const RegistrationView = ({ session, onComplete }: { session: Session; onComplete: (locationId: number, biometric: BiometricVerification) => Promise<void> }) => {
  const [showBioDetails, setShowBioDetails] = useState(false);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [assignments, setAssignments] = useState<TodayAssignment[]>([]);
  const [locations, setLocations] = useState<ClockInLocation[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/attendance/today-assignments`, { headers: { Authorization: `Bearer ${session.token}` } }).then(readApiResponse),
      fetch(`${API_URL}/api/attendance/locations`, { headers: { Authorization: `Bearer ${session.token}` } }).then(readApiResponse),
    ])
      .then(([assignmentData, locationData]) => {
        setAssignments(assignmentData);
        setLocations(locationData);
        setSelectedLocationId(assignmentData[0]?.locacion_id ?? locationData[0]?.id ?? null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'No se pudieron consultar las opciones de asistencia'))
      .finally(() => setIsLoading(false));
  }, [session.token]);

  const selectedAssignment = assignments.find((assignment) => assignment.locacion_id === selectedLocationId);
  const selectedLocation = locations.find((location) => location.id === selectedLocationId);

  const handleConfirm = async () => {
    setError('');
    setIsSaving(true);

    try {
      if (!selectedLocationId) throw new Error('Selecciona una ubicacion');
      const biometric = await verifyBiometricPresence(session.user);
      await onComplete(selectedLocationId, biometric);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar la asistencia');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-8 pb-32">
      <section className="space-y-1 text-center">
        <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{new Intl.DateTimeFormat('es', { dateStyle: 'full' }).format(new Date())}</p>
        <h2 className="font-headline text-6xl font-extrabold tracking-tighter text-primary">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h2>
        <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-tertiary/10 px-4 py-1.5 text-tertiary">
          <CheckCircle2 size={16} />
          <span className="font-sans text-xs font-semibold uppercase tracking-wider">{selectedAssignment ? `${selectedAssignment.hora_entrada.slice(0, 5)} - ${selectedAssignment.hora_salida.slice(0, 5)}` : 'Registro manual'}</span>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4">
        <div className="relative col-span-2 aspect-[4/5] overflow-hidden rounded-2xl bg-surface-container-low">
          <img 
            src="https://picsum.photos/seed/face/400/500" 
            alt="Face Preview" 
            className="h-full w-full object-cover brightness-90 grayscale-[20%]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 border-[24px] border-on-surface/60 backdrop-blur-[2px]">
            <div className="flex h-full w-full items-center justify-center rounded-lg border border-primary-fixed/20" />
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div className="glass-panel rounded-full px-3 py-1.5 shadow-sm">
              <span className="flex items-center gap-1 text-[10px] font-bold text-primary">
                <User size={14} /> VERIFICACION FACIAL
              </span>
            </div>
            <button className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg transition-transform active:scale-90">
              <Camera size={24} />
            </button>
          </div>
        </div>

        <button 
          onClick={() => setShowBioDetails(true)}
          className="flex flex-col items-center justify-center space-y-4 rounded-2xl bg-surface-container-low p-6 ring-1 ring-outline-variant/10 transition-all hover:bg-surface-container-high active:scale-95"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-outline-variant/20 bg-surface-container-lowest shadow-[0px_0px_20px_rgba(0,67,84,0.1)]">
            <Fingerprint className="text-primary" size={36} />
          </div>
          <p className="text-center text-[10px] font-bold leading-tight text-on-surface-variant uppercase tracking-wider">Entrada biometrica</p>
        </button>

        <div className="flex flex-col overflow-hidden rounded-2xl bg-surface-container-low ring-1 ring-outline-variant/10">
          <div className="relative h-24 w-full">
            <img 
              src="https://picsum.photos/seed/map3/200/100" 
              alt="Map" 
              className="h-full w-full object-cover brightness-75 contrast-125"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-4 w-4 animate-pulse rounded-full border-2 border-on-primary bg-primary" />
            </div>
          </div>
          <div className="p-3">
            <div className="flex items-center gap-1">
              <MapPin className="text-tertiary" size={12} />
              <span className="text-[10px] font-extrabold text-tertiary uppercase tracking-wider">In Zone</span>
            </div>
            <p className="truncate text-[9px] font-medium text-on-surface-variant">{selectedAssignment?.locacion_nombre || selectedLocation?.nombre || 'Sin ubicacion seleccionada'}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4">

        {isLoading ? (
          <div className="flex justify-center rounded-2xl bg-surface-container-low p-5"><LoaderCircle className="animate-spin text-primary" /></div>
        ) : locations.length > 0 ? (
          <label className="block rounded-2xl bg-surface-container-low p-4 text-xs font-bold text-on-surface-variant">
            Ubicacion para asistencia
            <select value={selectedLocationId ?? ''} onChange={(event) => setSelectedLocationId(Number(event.target.value))} className="mt-2 w-full rounded-xl bg-surface-container-lowest p-4 text-sm font-semibold text-on-surface outline-primary">
              {locations.map((location) => {
                const assignment = assignments.find((item) => item.locacion_id === location.id);
                return <option key={location.id} value={location.id}>{assignment ? `${assignment.locacion_nombre} - ${assignment.nombre_turno} (${assignment.hora_entrada.slice(0, 5)} a ${assignment.hora_salida.slice(0, 5)})` : `${location.nombre} - Registro manual`}</option>;
              })}
            </select>
          </label>
        ) : (
          <div className="rounded-xl bg-error/10 px-4 py-3 text-sm font-semibold text-error">No hay ubicaciones activas para registrar asistencia.</div>
        )}
        {error && (
          <div className="rounded-xl bg-error/10 px-4 py-3 text-sm font-semibold text-error">
            {error}
          </div>
        )}

        <button 
          onClick={handleConfirm}
          disabled={isSaving || isLoading || !selectedLocationId}
          className="flex h-[64px] w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-primary to-primary-container shadow-xl transition-all active:scale-95"
        >
          <span className="font-headline text-lg font-bold tracking-wide text-on-primary">
            {isSaving ? 'Verificando...' : 'Agregar asistencia'}
          </span>
          <ArrowRight className="text-on-primary" size={20} />
        </button>
        <p className="px-8 text-center text-[11px] font-medium leading-relaxed text-on-surface-variant">
          Antes de registrar se solicitara huella, rostro o bloqueo del dispositivo. Tambien autorizas capturar tu ubicacion GPS actual.
        </p>
      </div>

      <AnimatePresence>
        {showBioDetails && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBioDetails(false)}
              className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-surface-container-lowest p-8 shadow-2xl"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5">
                <ShieldCheck className="text-primary" size={28} />
              </div>
              <h3 className="font-headline text-xl font-bold text-primary">Verificacion biometrica</h3>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                La asistencia se registra solo despues de confirmar tu identidad con huella, rostro o el bloqueo seguro del dispositivo.
              </p>
              
              <div className="mt-6 space-y-4">
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container-low">
                    <Fingerprint size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface">Validacion requerida</p>
                    <p className="text-[11px] text-on-surface-variant">El sistema pedira la verificacion nativa disponible en tu telefono.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container-low">
                    <ShieldCheck size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface">Privacidad</p>
                    <p className="text-[11px] text-on-surface-variant">La aplicacion no recibe ni guarda tu huella o rostro; solo espera la confirmacion del dispositivo.</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowBioDetails(false)}
                className="mt-8 w-full rounded-xl bg-primary py-3 text-sm font-bold text-white transition-transform active:scale-[0.98]"
              >
                Entendido
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
