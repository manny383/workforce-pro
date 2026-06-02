import { ArrowRight, Bell, Clock, LogOut, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import type { View } from '../types/auth';

export const DashboardView = ({ onAction, onClockOut }: { onAction: (v: View) => void, onClockOut: () => void }) => (
  <div className="space-y-8 pb-32">
    {/* Reminder Banner */}
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between gap-4 rounded-xl border border-primary/10 bg-primary-fixed-dim/20 p-4 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Bell className="text-primary" size={20} />
        </div>
        <div>
          <p className="font-headline text-sm font-bold text-primary">Time to Clock In!</p>
          <p className="font-sans text-xs text-on-surface-variant">You are near Headquarters - Zone A.</p>
        </div>
      </div>
      <button 
        onClick={() => onAction('registration')}
        className="shrink-0 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-primary-container"
      >
        Clock In
      </button>
    </motion.div>

    <section className="space-y-2">
      <div className="flex flex-col gap-1">
        <span className="font-sans text-sm font-medium text-on-surface-variant">Monday, Oct 24</span>
        <h2 className="font-headline text-3xl font-extrabold tracking-tight text-primary">Good morning, Marcus</h2>
      </div>
      
      <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-6">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Current Status</p>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-error" />
            <span className="font-headline text-xl font-bold">Not Checked In</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Last activity</p>
          <p className="font-sans font-medium">Friday, 17:04</p>
        </div>
      </div>
    </section>

    <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <button 
        onClick={() => onAction('registration')}
        className="signature-gradient flex h-[180px] flex-col justify-between rounded-2xl p-6 text-left transition-transform active:scale-95"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
          <Clock className="text-white" size={24} />
        </div>
        <div>
          <h3 className="font-headline text-2xl font-bold text-white">Register Entry</h3>
          <p className="text-sm text-primary-fixed/80">Start your shift now</p>
        </div>
      </button>

      <button
        onClick={onClockOut}
        className="flex h-[180px] flex-col justify-between rounded-2xl bg-surface-container-high p-6 text-left transition-transform active:scale-95"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-on-surface/5">
          <LogOut className="text-on-surface" size={24} />
        </div>
        <div>
          <h3 className="font-headline text-2xl font-bold text-on-surface">Register Exit</h3>
          <p className="text-sm text-on-surface-variant">End your working day</p>
        </div>
      </button>
    </section>

    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-[0px_4px_16px_rgba(26,28,28,0.02)] md:col-span-2">
        <div className="mb-6 flex items-start justify-between">
          <h3 className="font-headline text-lg font-bold">Today's Hours</h3>
          <span className="rounded-full bg-tertiary/10 px-3 py-1 text-xs font-bold text-tertiary">On Track</span>
        </div>
        <div className="flex items-end gap-3">
          <span className="font-headline text-5xl font-extrabold text-primary">0:00</span>
          <span className="pb-2 font-sans text-on-surface-variant">/ 8h 00m</span>
        </div>
        <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
          <div className="h-full w-[5%] bg-primary" />
        </div>
      </div>

      <div className="flex flex-col justify-between rounded-2xl bg-surface-container-lowest p-6 shadow-[0px_4px_16px_rgba(26,28,28,0.02)]">
        <div>
          <h3 className="mb-4 font-headline text-lg font-bold">History</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-on-surface-variant">Oct 21</span>
              <span className="font-medium">8h 12m</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-on-surface-variant">Oct 20</span>
              <span className="font-medium">7h 45m</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => onAction('history')}
          className="mt-4 flex items-center gap-1 text-sm font-bold text-primary hover:underline"
        >
          View all <ArrowRight size={14} />
        </button>
      </div>
    </section>

    <section className="relative h-48 overflow-hidden rounded-2xl bg-surface-container-high">
      <div className="absolute inset-0 grayscale opacity-40">
        <img 
          src="https://picsum.photos/seed/map/800/400" 
          alt="Map" 
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="glass-panel absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <MapPin className="text-primary" size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Workplace</p>
            <p className="font-sans font-semibold">Headquarters - Zone A</p>
          </div>
        </div>
        <span className="text-xs font-bold text-tertiary">IN RANGE</span>
      </div>
    </section>
  </div>
);
