import { ArrowRight, Calendar, History as HistoryIcon, MapPin } from 'lucide-react';
import { cn } from '../lib/utils';

export const HistoryView = () => (
  <div className="space-y-10 pb-32">
    <div>
      <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Attendance Logs</span>
      <h2 className="mt-2 font-headline text-4xl font-extrabold text-primary">Work History</h2>
      <p className="mt-2 max-w-lg text-on-surface-variant">Review your professional timeline, clock-in records, and operational presence across all site locations.</p>
    </div>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="flex flex-col justify-between rounded-2xl bg-surface-container-low p-6 md:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-headline text-lg font-bold text-primary">Timeframe Selection</h3>
          <Calendar className="text-primary/40" size={20} />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 rounded-xl bg-surface-container-lowest px-4 py-3 shadow-sm">
            <label className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">From Date</label>
            <input type="text" value="Oct 01, 2023" readOnly className="w-full border-none bg-transparent p-0 text-sm font-medium focus:ring-0" />
          </div>
          <ArrowRight className="text-outline-variant" size={20} />
          <div className="flex-1 rounded-xl bg-surface-container-lowest px-4 py-3 shadow-sm">
            <label className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">To Date</label>
            <input type="text" value="Oct 31, 2023" readOnly className="w-full border-none bg-transparent p-0 text-sm font-medium focus:ring-0" />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center rounded-2xl bg-primary-container p-6 text-center text-on-primary-container">
        <span className="mb-1 text-[10px] font-bold uppercase tracking-tighter opacity-80">Monthly Total</span>
        <div className="font-headline text-4xl font-black">164.5</div>
        <span className="text-xs font-medium">Verified Hours</span>
      </div>
    </div>

    <div className="space-y-4">
      {[
        { day: 'Tuesday, Oct 24', date: '24', loc: 'Innovation Hub • West Wing', duration: '8h 23m', interval: '08:52 AM — 05:15 PM', status: 'COMPLETED' },
        { day: 'Monday, Oct 23', date: '23', loc: 'South Logistics Center', duration: '9h 07m', interval: '09:05 AM — 06:12 PM' },
        { day: 'Friday, Oct 20', date: '20', loc: 'Remote • Home Office', duration: '8h 30m', interval: '08:00 AM — 04:30 PM' },
        { day: 'Thursday, Oct 19', date: '19', loc: 'Innovation Hub • West Wing', duration: '8h 47m', interval: '08:58 AM — 05:45 PM' },
      ].map((entry, i) => (
        <div 
          key={i} 
          className={cn(
            "group flex flex-col justify-between rounded-2xl p-5 transition-shadow hover:shadow-md md:flex-row md:items-center",
            i % 2 === 0 ? "bg-surface-container-lowest shadow-[0px_4px_12px_rgba(26,28,28,0.02)]" : "bg-surface-container-low"
          )}
        >
          <div className="flex items-center gap-5">
            <div className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-full font-headline text-xs font-black",
              entry.status ? "bg-tertiary/10 text-tertiary" : "bg-surface-container-high text-on-surface-variant"
            )}>
              {entry.date}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-headline font-bold text-on-surface">{entry.day}</h4>
                {entry.status && <span className="rounded-full bg-tertiary px-2 py-0.5 text-[10px] font-bold text-on-tertiary">{entry.status}</span>}
              </div>
              <p className="mt-0.5 flex items-center gap-1 text-sm text-on-surface-variant">
                <MapPin size={14} /> {entry.loc}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-surface-container-low pt-4 md:mt-0 md:justify-end md:gap-8 md:border-t-0 md:pt-0">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-outline">Interval</span>
              <span className="text-sm font-semibold text-on-surface">{entry.interval}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-outline">Duration</span>
              <div className={cn(
                "font-headline text-lg font-extrabold",
                entry.status ? "text-primary" : "text-on-surface-variant"
              )}>{entry.duration}</div>
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className="mt-8 flex justify-center">
      <button className="flex items-center gap-2 rounded-full bg-surface-container-high px-8 py-3 font-headline font-bold text-primary transition-all hover:bg-surface-container-highest active:scale-95">
        Load Previous Records <HistoryIcon size={16} />
      </button>
    </div>
  </div>
);
