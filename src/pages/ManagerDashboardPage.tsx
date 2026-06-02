import { AlertCircle, BadgeCheck, CheckCircle2, Clock, History as HistoryIcon, MapPin, Plus, User } from 'lucide-react';
import { cn } from '../lib/utils';
import type { View } from '../types/auth';

export const ManagerDashboardView = ({ onAction }: { onAction: (v: View) => void }) => (
  <div className="space-y-10 pb-32">
    <div>
      <h2 className="font-headline text-4xl font-extrabold tracking-tight text-primary">Manager Dashboard</h2>
      <p className="font-medium text-on-surface-variant">Overview for Monday, Oct 23rd</p>
    </div>

    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
      <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-surface-container-low p-8 md:col-span-2">
        <div className="relative z-10">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-tertiary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-tertiary">
            <span className="h-2 w-2 animate-pulse rounded-full bg-tertiary" /> Live Status
          </span>
          <h3 className="mb-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Currently Active</h3>
          <div className="flex items-baseline gap-3">
            <span className="font-headline text-6xl font-extrabold text-primary">142</span>
            <span className="text-lg text-on-surface-variant">/ 150</span>
          </div>
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10 transition-transform duration-500 group-hover:scale-110">
          <User size={160} strokeWidth={1} />
        </div>
      </div>

      <div className="flex flex-col justify-between rounded-2xl bg-surface-container-lowest p-6 shadow-[0px_12px_32px_rgba(26,28,28,0.04)] ring-1 ring-outline-variant/10">
        <div>
          <AlertCircle className="mb-4 text-error" size={24} />
          <h3 className="mb-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Late Arrivals</h3>
          <p className="font-headline text-4xl font-bold text-on-surface">08</p>
        </div>
        <p className="mt-4 text-xs text-on-surface-variant">+3 from yesterday</p>
      </div>

      <div className="flex flex-col justify-between rounded-2xl bg-surface-container-lowest p-6 shadow-[0px_12px_32px_rgba(26,28,28,0.04)] ring-1 ring-outline-variant/10">
        <div>
          <User className="mb-4 text-outline" size={24} />
          <h3 className="mb-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Absences</h3>
          <p className="font-headline text-4xl font-bold text-on-surface">04</p>
        </div>
        <p className="mt-4 text-xs text-tertiary">2 pre-approved</p>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <div className="space-y-8 lg:col-span-8">
        <section className="rounded-2xl bg-surface-container-low p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h3 className="font-headline text-xl font-bold text-primary">Weekly Trends</h3>
              <p className="text-sm text-on-surface-variant">Average attendance rate: 94.2%</p>
            </div>
            <div className="flex rounded-full bg-surface-container-high p-1">
              <button className="rounded-full bg-surface-container-lowest px-4 py-1 text-xs font-bold text-primary shadow-sm">Week</button>
              <button className="px-4 py-1 text-xs font-medium text-on-surface-variant">Month</button>
            </div>
          </div>
          <div className="flex h-64 items-end justify-between gap-2">
            {[60, 85, 70, 95, 90, 75, 0].map((h, i) => (
              <div 
                key={i} 
                className={cn(
                  "group relative flex-1 rounded-t-lg transition-colors",
                  i === 5 ? "bg-primary/40" : "bg-primary/10 hover:bg-primary/20"
                )}
                style={{ height: `${h}%` }}
              >
                {h > 0 && (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    {h}%
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between px-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <span key={d}>{d}</span>)}
          </div>
        </section>

        <section>
          <h3 className="mb-6 font-headline text-xl font-bold text-primary">Administrative Control</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { label: 'Manage Locations', sub: '12 active sites', icon: MapPin, view: 'locations' },
              { label: 'Manage Employees', sub: 'Edit profiles & access', icon: BadgeCheck, view: 'team' },
              { label: 'View Reports', sub: 'Payroll & compliance', icon: HistoryIcon, view: 'history' },
            ].map((item) => (
              <button 
                key={item.label}
                onClick={() => onAction(item.view as View)}
                className="group flex flex-col items-start rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 transition-all duration-300 hover:border-primary hover:bg-primary"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/5 transition-colors group-hover:bg-white/10">
                  <item.icon className="text-primary transition-colors group-hover:text-white" size={24} />
                </div>
                <span className="font-bold text-on-surface transition-colors group-hover:text-white">{item.label}</span>
                <span className="mt-1 text-xs text-on-surface-variant transition-colors group-hover:text-white/70">{item.sub}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="space-y-8 lg:col-span-4">
        <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-[0px_12px_32px_rgba(26,28,28,0.04)]">
          <h3 className="mb-6 font-headline text-lg font-bold text-on-surface">Recent Alerts</h3>
          <div className="space-y-6">
            {[
              { name: 'Alex Rivera', time: '15m Late', sub: 'Downtown Hub - Shift A', type: 'error' },
              { name: 'Sarah Chen', time: '22m Late', sub: 'West Warehouse - Shift B', type: 'error' },
              { name: 'New Location Added', time: 'Success', sub: 'North Plaza is now live', type: 'success' },
            ].map((alert, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                  alert.type === 'error' ? "bg-error-container/30" : "bg-tertiary-container/30"
                )}>
                  {alert.type === 'error' ? <Clock className="text-error" size={18} /> : <CheckCircle2 className="text-tertiary" size={18} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-bold text-on-surface">{alert.name}</h4>
                    <span className={cn(
                      "text-[10px] font-bold uppercase",
                      alert.type === 'error' ? "text-error" : "text-tertiary"
                    )}>{alert.time}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-on-surface-variant">{alert.sub}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-8 w-full rounded-full bg-primary/5 py-3 text-[10px] font-bold uppercase tracking-widest text-primary transition-colors hover:bg-primary/10">
            See all alerts
          </button>
        </div>

        <div className="relative h-64 overflow-hidden rounded-2xl bg-surface-container-low">
          <img 
            src="https://picsum.photos/seed/map2/400/300" 
            alt="Map" 
            className="h-full w-full object-cover grayscale opacity-60"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="glass-panel flex items-center justify-between rounded-xl p-3">
              <div>
                <h4 className="text-xs font-bold text-primary">Main Campus</h4>
                <p className="text-[10px] text-on-surface-variant">88 Active Workers</p>
              </div>
              <button className="rounded-full bg-primary p-2 text-white shadow-lg">
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <button className="signature-gradient fixed right-8 bottom-24 z-40 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-xl transition-all hover:scale-105 active:scale-95">
      <Plus size={24} />
    </button>
  </div>
);
