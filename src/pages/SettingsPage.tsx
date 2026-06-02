import { AlertCircle, Clock, History as HistoryIcon, LogOut, Mail, MessageSquare, ShieldCheck, Smartphone } from 'lucide-react';
import { cn } from '../lib/utils';

export const SettingsView = () => (
  <div className="space-y-10 pb-32">
    <div>
      <h2 className="font-headline text-4xl font-extrabold tracking-tight text-primary">Notification Settings</h2>
      <p className="font-sans text-on-surface-variant">Customize how and when you receive updates about your shifts and reports.</p>
    </div>

    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:col-span-8">
        {[
          { title: 'Clock-in Reminders', sub: 'Get notified 15 minutes before your scheduled shift starts.', icon: Clock, active: true },
          { title: 'Clock-out Reminders', sub: 'Receive a prompt to end your session at the end of shift hours.', icon: LogOut, active: true },
          { title: 'Daily Reports', sub: 'Summarized daily attendance and activity report sent at 6:00 PM.', icon: HistoryIcon, active: false, wide: true },
          { title: 'System Alerts', sub: 'Critical updates regarding server maintenance and policy changes.', icon: AlertCircle, active: true, wide: true },
        ].map((item, i) => (
          <div 
            key={i} 
            className={cn(
              "flex flex-col justify-between rounded-2xl bg-surface-container-low p-8",
              item.wide ? "md:col-span-2 md:flex-row md:items-center md:gap-6" : "min-h-[200px]"
            )}
          >
            <div className={cn("flex items-center gap-6", !item.wide && "flex-col items-start gap-0")}>
              <div className="rounded-full bg-primary-container/20 p-4">
                <item.icon className="text-primary" size={item.wide ? 32 : 24} />
              </div>
              <div>
                <h3 className="mt-4 font-headline text-xl font-bold text-primary md:mt-0">{item.title}</h3>
                <p className="mt-1 text-sm text-on-surface-variant">{item.sub}</p>
              </div>
            </div>
            <div className={cn("mt-6 md:mt-0", !item.wide && "self-end")}>
              <div className={cn(
                "h-7 w-14 rounded-full p-1 transition-colors cursor-pointer",
                item.active ? "bg-primary" : "bg-surface-container-highest"
              )}>
                <div className={cn(
                  "h-5 w-5 rounded-full bg-white transition-transform",
                  item.active ? "translate-x-7" : "translate-x-0"
                )} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6 lg:col-span-4">
        <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-highest/30 p-6">
          <h4 className="mb-6 text-[10px] font-bold uppercase tracking-widest text-primary">Delivery Channels</h4>
          <div className="space-y-4">
            {[
              { label: 'Push Notifications', icon: Smartphone, status: 'Active', type: 'tertiary' },
              { label: 'Email Updates', icon: Mail, status: 'Paused', type: 'surface' },
              { label: 'SMS Alerts', icon: MessageSquare, status: 'Off', type: 'surface' },
            ].map((ch) => (
              <div key={ch.label} className="flex items-center justify-between rounded-xl bg-surface-container-lowest p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <ch.icon className="text-on-surface-variant" size={18} />
                  <span className="text-sm font-medium">{ch.label}</span>
                </div>
                <span className={cn(
                  "rounded-full px-2 py-1 text-[10px] font-bold uppercase",
                  ch.type === 'tertiary' ? "bg-tertiary/10 text-tertiary" : "bg-surface-container-high text-on-surface-variant"
                )}>{ch.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="signature-gradient relative overflow-hidden rounded-2xl p-8 text-white">
          <div className="relative z-10">
            <h4 className="mb-2 font-headline text-xl font-bold">Need help?</h4>
            <p className="mb-6 text-sm text-primary-fixed/80">Contact the IT desk if you aren't receiving your mandated system alerts.</p>
            <button className="w-full rounded-xl bg-white py-3 text-sm font-bold text-primary transition-colors hover:bg-primary-fixed">
              Contact Support
            </button>
          </div>
          <ShieldCheck className="absolute -right-8 -bottom-8 opacity-10" size={160} />
        </div>
      </div>
    </div>
  </div>
);
