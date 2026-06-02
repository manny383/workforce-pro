import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Camera, CheckCircle2, Fingerprint, MapPin, ShieldCheck, User } from 'lucide-react';

export const RegistrationView = ({ onComplete }: { onComplete: () => Promise<void> }) => {
  const [showBioDetails, setShowBioDetails] = useState(false);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleConfirm = async () => {
    setError('');
    setIsSaving(true);

    try {
      await onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar la asistencia');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-8 pb-32">
      <section className="space-y-1 text-center">
        <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Monday, Oct 23, 2023</p>
        <h2 className="font-headline text-6xl font-extrabold tracking-tighter text-primary">08:42</h2>
        <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-tertiary/10 px-4 py-1.5 text-tertiary">
          <CheckCircle2 size={16} />
          <span className="font-sans text-xs font-semibold uppercase tracking-wider">On Schedule</span>
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
                <User size={14} /> FACE VERIFICATION
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
          <p className="text-center text-[10px] font-bold leading-tight text-on-surface-variant uppercase tracking-wider">Biometric Entry</p>
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
            <p className="truncate text-[9px] font-medium text-on-surface-variant">Corporate HQ - Sector 4</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        {error && (
          <div className="rounded-xl bg-error/10 px-4 py-3 text-sm font-semibold text-error">
            {error}
          </div>
        )}

        <button 
          onClick={handleConfirm}
          disabled={isSaving}
          className="flex h-[64px] w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-primary to-primary-container shadow-xl transition-all active:scale-95"
        >
          <span className="font-headline text-lg font-bold tracking-wide text-on-primary">
            {isSaving ? 'Registering...' : 'Confirm Attendance'}
          </span>
          <ArrowRight className="text-on-primary" size={20} />
        </button>
        <p className="px-8 text-center text-[11px] font-medium leading-relaxed text-on-surface-variant">
          By clicking confirm, you authorize the capture of your current GPS location and biometric data for payroll compliance.
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
              <h3 className="font-headline text-xl font-bold text-primary">Biometric Verification</h3>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                Our enterprise security protocol ensures your identity is verified with the highest level of precision.
              </p>
              
              <div className="mt-6 space-y-4">
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container-low">
                    <Fingerprint size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface">Data Captured</p>
                    <p className="text-[11px] text-on-surface-variant">Encrypted fingerprint minutiae and 3D facial depth maps.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container-low">
                    <ShieldCheck size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface">Privacy First</p>
                    <p className="text-[11px] text-on-surface-variant">Biometric data never leaves your device's secure enclave hardware.</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowBioDetails(false)}
                className="mt-8 w-full rounded-xl bg-primary py-3 text-sm font-bold text-white transition-transform active:scale-[0.98]"
              >
                Got it
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
