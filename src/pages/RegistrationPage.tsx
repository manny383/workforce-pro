import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CalendarClock, CheckCircle2, Fingerprint, Info, LoaderCircle, MapPin, Navigation, ShieldCheck } from 'lucide-react';
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
  const currentDate = new Intl.DateTimeFormat('es', { dateStyle: 'full' }).format(new Date());
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const selectedSchedule = selectedAssignment
    ? `${selectedAssignment.hora_entrada.slice(0, 5)} - ${selectedAssignment.hora_salida.slice(0, 5)}`
    : 'Registro manual';

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
    <div className="mx-auto max-w-lg pb-32">
      <section className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm ring-1 ring-outline-variant/10">
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{currentDate}</p>
        <div className="mt-3 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-headline text-5xl font-extrabold tracking-tight text-primary">{currentTime}</h2>
            <p className="mt-1 text-sm font-semibold text-on-surface-variant">{session.user.nombre}</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-tertiary/10 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-tertiary">
            <CheckCircle2 size={15} />
            Listo
          </span>
        </div>
      </section>

      <section className="mt-5 overflow-hidden rounded-2xl bg-primary text-on-primary shadow-lg">
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-fixed/80">Turno seleccionado</p>
              <h3 className="mt-2 font-headline text-2xl font-extrabold">{selectedAssignment?.nombre_turno || 'Entrada manual'}</h3>
              <p className="mt-1 text-sm font-semibold text-primary-fixed/85">{selectedSchedule}</p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/12">
              <CalendarClock size={24} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => setShowBioDetails(true)}
            className="flex items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-white/10 active:bg-white/15"
          >
            <Fingerprint size={20} />
            <span className="text-xs font-bold uppercase tracking-wide">Biometria</span>
          </button>
          <div className="flex items-center gap-3 border-l border-white/10 px-5 py-4">
            <Navigation size={20} />
            <span className="truncate text-xs font-bold uppercase tracking-wide">GPS activo</span>
          </div>
        </div>
      </section>

      <section className="mt-5 space-y-4">
        {isLoading ? (
          <div className="flex justify-center rounded-2xl bg-surface-container-low p-5"><LoaderCircle className="animate-spin text-primary" /></div>
        ) : locations.length > 0 ? (
          <label className="block rounded-2xl bg-surface-container-lowest p-5 text-xs font-bold text-on-surface-variant shadow-sm ring-1 ring-outline-variant/10">
            <span className="flex items-center gap-2 uppercase tracking-widest"><MapPin size={15} /> Ubicacion para asistencia</span>
            <select value={selectedLocationId ?? ''} onChange={(event) => setSelectedLocationId(Number(event.target.value))} className="mt-3 w-full rounded-xl bg-surface-container-low p-4 text-sm font-semibold text-on-surface outline-primary">
              {locations.map((location) => {
                const assignment = assignments.find((item) => item.locacion_id === location.id);
                return <option key={location.id} value={location.id}>{assignment ? `${assignment.locacion_nombre} - ${assignment.nombre_turno} (${assignment.hora_entrada.slice(0, 5)} a ${assignment.hora_salida.slice(0, 5)})` : `${location.nombre} - Registro manual`}</option>;
              })}
            </select>
            <div className="mt-4 rounded-xl bg-surface-container-low px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Lugar actual</p>
              <p className="mt-1 truncate text-sm font-bold text-primary">{selectedAssignment?.locacion_nombre || selectedLocation?.nombre || 'Sin ubicacion seleccionada'}</p>
              {selectedLocation?.descripcion && <p className="mt-1 text-xs font-medium text-on-surface-variant">{selectedLocation.descripcion}</p>}
            </div>
          </label>
        ) : (
          <div className="rounded-xl bg-error/10 px-4 py-3 text-sm font-semibold text-error">No hay ubicaciones activas para registrar asistencia.</div>
        )}

        {error && (
          <div className="rounded-xl bg-error/10 px-4 py-3 text-sm font-semibold text-error">
            {error}
          </div>
        )}

        <div className="rounded-2xl bg-surface-container-low p-5">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Info size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-on-surface">Confirmacion segura</h4>
              <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
                Antes de registrar se solicitara huella, rostro o bloqueo del dispositivo. Tambien autorizas capturar tu ubicacion GPS actual.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleConfirm}
          disabled={isSaving || isLoading || !selectedLocationId}
          className="flex h-[60px] w-full items-center justify-center gap-3 rounded-2xl bg-primary shadow-xl transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving && <LoaderCircle className="animate-spin text-on-primary" size={20} />}
          <span className="font-headline text-lg font-bold tracking-wide text-on-primary">
            {isSaving ? 'Verificando...' : 'Agregar asistencia'}
          </span>
          {!isSaving && <ArrowRight className="text-on-primary" size={20} />}
        </button>
      </section>

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
