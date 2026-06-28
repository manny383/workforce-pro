import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Clock, Fingerprint, Info, LoaderCircle, LogOut, MapPin, Navigation, ShieldCheck } from 'lucide-react';
import { API_URL, readApiResponse } from '../config/api';
import { verifyBiometricPresence } from '../lib/biometric';
import type { Session } from '../types/auth';

type DashboardData = {
  checkedIn: boolean;
  latestAttendance: null | { entrada: string; salida: string | null; locacion_nombre: string };
};

const formatDateTime = (value?: string | null) => value
  ? new Date(value).toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' })
  : 'Sin entrada activa';

export const CheckoutView = ({ session, onComplete }: { session: Session; onComplete: () => Promise<void> }) => {
  const [showBioDetails, setShowBioDetails] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/attendance/dashboard`, { headers: { Authorization: `Bearer ${session.token}` } })
      .then(readApiResponse)
      .then(setData)
      .catch((err) => setError(err.message || 'No se pudo cargar la salida'))
      .finally(() => setIsLoading(false));
  }, [session.token]);

  const currentDate = new Intl.DateTimeFormat('es', { dateStyle: 'full' }).format(new Date());
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const canCheckout = Boolean(data?.checkedIn);

  const handleConfirm = async () => {
    setError('');
    setIsSaving(true);

    try {
      if (!canCheckout) throw new Error('No tienes una entrada abierta');
      await verifyBiometricPresence(session.user);
      await onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar la salida');
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
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary/10 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-primary">
            <LogOut size={15} />
            Salida
          </span>
        </div>
      </section>

      <section className="mt-5 overflow-hidden rounded-2xl bg-surface-container-high text-on-surface shadow-sm ring-1 ring-outline-variant/10">
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Entrada activa</p>
              <h3 className="mt-2 font-headline text-2xl font-extrabold text-primary">{data?.latestAttendance?.locacion_nombre || 'Sin ubicacion'}</h3>
              <p className="mt-1 text-sm font-semibold text-on-surface-variant">{formatDateTime(data?.latestAttendance?.entrada)}</p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Clock size={24} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 border-t border-outline-variant/20">
          <button
            type="button"
            onClick={() => setShowBioDetails(true)}
            className="flex items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-surface-container-low active:bg-surface-container"
          >
            <Fingerprint size={20} className="text-primary" />
            <span className="text-xs font-bold uppercase tracking-wide">Biometria</span>
          </button>
          <div className="flex items-center gap-3 border-l border-outline-variant/20 px-5 py-4">
            <Navigation size={20} className="text-primary" />
            <span className="truncate text-xs font-bold uppercase tracking-wide">GPS activo</span>
          </div>
        </div>
      </section>

      <section className="mt-5 space-y-4">
        {isLoading && (
          <div className="flex justify-center rounded-2xl bg-surface-container-low p-5"><LoaderCircle className="animate-spin text-primary" /></div>
        )}

        {!isLoading && !canCheckout && (
          <div className="rounded-xl bg-error/10 px-4 py-3 text-sm font-semibold text-error">No tienes una entrada abierta para registrar salida.</div>
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
                Para registrar salida se solicitara la misma verificacion del dispositivo y se capturara tu ubicacion GPS actual.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleConfirm}
          disabled={isSaving || isLoading || !canCheckout}
          className="flex h-[60px] w-full items-center justify-center gap-3 rounded-2xl bg-primary shadow-xl transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving && <LoaderCircle className="animate-spin text-on-primary" size={20} />}
          <span className="font-headline text-lg font-bold tracking-wide text-on-primary">
            {isSaving ? 'Verificando...' : 'Registrar salida'}
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
              <h3 className="font-headline text-xl font-bold text-primary">Verificacion para salida</h3>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                La salida se registra solo despues de confirmar tu identidad con huella, rostro o el bloqueo seguro del dispositivo.
              </p>
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
