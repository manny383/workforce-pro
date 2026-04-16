import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  History as HistoryIcon, 
  Calendar, 
  Settings as SettingsIcon,
  LogOut,
  Bell,
  Menu,
  User,
  Clock,
  MapPin,
  Fingerprint,
  Camera,
  ArrowRight,
  Plus,
  Search,
  Filter,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  Mail,
  MessageSquare,
  BadgeCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './lib/utils';

// --- Types ---
type View = 'login' | 'dashboard' | 'manager' | 'history' | 'settings' | 'registration' | 'locations' | 'team';

// --- Shared Components ---

const TopBar = ({ title, userType, onViewChange }: { title: string, userType: 'employee' | 'manager', onViewChange: (v: View) => void }) => (
  <header className="sticky top-0 z-40 w-full bg-surface/80 backdrop-blur-md">
    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div 
          className="h-10 w-10 overflow-hidden rounded-full bg-surface-container-high cursor-pointer"
          onClick={() => onViewChange(userType === 'employee' ? 'dashboard' : 'manager')}
        >
          <img 
            src={userType === 'employee' 
              ? "https://picsum.photos/seed/marcus/100/100" 
              : "https://picsum.photos/seed/manager/100/100"} 
            alt="Profile" 
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <h1 className="font-headline text-lg font-bold tracking-tight text-primary">Workforce Pro</h1>
      </div>
      <div className="flex items-center gap-2">
        <button className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low transition-colors">
          <Bell size={20} />
        </button>
        <button 
          onClick={() => onViewChange('login')}
          className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low transition-colors"
        >
          <LogOut size={20} />
        </button>
      </div>
    </div>
  </header>
);

const BottomNav = ({ currentView, onViewChange }: { currentView: View, onViewChange: (v: View) => void }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'history', label: 'History', icon: HistoryIcon },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full rounded-t-2xl bg-surface-container-lowest/85 px-4 pt-2 pb-safe backdrop-blur-xl shadow-[0px_-4px_16px_rgba(26,28,28,0.04)]">
      <div className="flex items-center justify-around">
       
        {navItems.map((item) => {
          const isActive = currentView === item.id || (item.id === 'dashboard' && currentView === 'manager');
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as View)}
              className={cn(
                "flex flex-col items-center justify-center px-5 py-1.5 transition-all duration-200",
                isActive 
                  ? "rounded-2xl bg-primary-container/10 text-primary" 
                  : "text-on-surface-variant hover:bg-surface-container-low"
              )}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="mt-1 font-sans text-[11px] font-medium uppercase tracking-wider">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

// --- Views ---

const LoginView = ({ onLogin }: { onLogin: (type: 'employee' | 'manager') => void }) => (
  <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6">
    <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary-fixed-dim/20 blur-3xl" />
    <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-tertiary-fixed-dim/20 blur-3xl" />
    
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="z-10 w-full max-w-[420px]"
    >
      <div className="mb-10 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-sm">
          <ShieldCheck className="text-on-primary" size={32} />
        </div>
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-primary">Workforce Pro</h1>
        <p className="mt-2 font-medium text-on-surface-variant">Enterprise Attendance Management</p>
      </div>

      <div className="rounded-2xl bg-surface-container-lowest p-8 shadow-[0px_12px_32px_rgba(26,28,28,0.04)] ring-1 ring-outline-variant/10">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="ml-1 block font-sans text-sm font-semibold text-on-surface">Employee ID / Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={20} />
              <input 
                type="text" 
                placeholder="e.g. EMP-2409"
                className="h-14 w-full rounded-xl border-none bg-surface-container-low pl-12 pr-4 text-on-surface transition-all focus:bg-surface-bright focus:ring-2 focus:ring-primary-fixed"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className="block font-sans text-sm font-semibold text-on-surface">Password</label>
              <button className="text-xs font-bold text-primary hover:underline">Forgot Password?</button>
            </div>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={20} />
              <input 
                type="password" 
                placeholder="••••••••"
                className="h-14 w-full rounded-xl border-none bg-surface-container-low pl-12 pr-4 text-on-surface transition-all focus:bg-surface-bright focus:ring-2 focus:ring-primary-fixed"
              />
            </div>
          </div>

          <button 
            onClick={() => onLogin('employee')}
            className="signature-gradient flex h-[56px] w-full items-center justify-center gap-2 rounded-xl font-headline text-lg font-bold text-on-primary shadow-lg transition-transform active:scale-[0.98]"
          >
            Login as Employee <ArrowRight size={20} />
          </button>

          <button 
            onClick={() => onLogin('manager')}
            className="flex h-[56px] w-full items-center justify-center gap-2 rounded-xl border border-outline-variant/30 font-headline text-lg font-bold text-primary transition-transform active:scale-[0.98]"
          >
            Login as Manager
          </button>

          <div className="mt-8 border-t border-outline-variant/10 pt-8">
            <button className="flex w-full items-center justify-center gap-3 rounded-full bg-surface-container-high py-3 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-highest">
              <Fingerprint size={20} /> Biometric Sign-in
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  </div>
);

const DashboardView = ({ onAction }: { onAction: (v: View) => void }) => (
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

      <button className="flex h-[180px] flex-col justify-between rounded-2xl bg-surface-container-high p-6 text-left transition-transform active:scale-95">
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

const ManagerDashboardView = ({ onAction }: { onAction: (v: View) => void }) => (
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

const HistoryView = () => (
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

const SettingsView = () => (
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

const RegistrationView = ({ onComplete }: { onComplete: () => void }) => {
  const [showBioDetails, setShowBioDetails] = useState(false);

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
        <button 
          onClick={onComplete}
          className="flex h-[64px] w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-primary to-primary-container shadow-xl transition-all active:scale-95"
        >
          <span className="font-headline text-lg font-bold tracking-wide text-on-primary">Confirm Attendance</span>
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

// --- Main App Component ---

export default function App() {
  const [view, setView] = useState<View>('login');
  const [userType, setUserType] = useState<'employee' | 'manager'>('employee');

  const handleLogin = (type: 'employee' | 'manager') => {
    setUserType(type);
    setView(type === 'employee' ? 'dashboard' : 'manager');
  };

  const renderView = () => {
    switch (view) {
      case 'login': return <LoginView onLogin={handleLogin} />;
      case 'dashboard': return <DashboardView onAction={setView} />;
      case 'manager': return <ManagerDashboardView onAction={setView} />;
      case 'history': return <HistoryView />;
      case 'settings': return <SettingsView />;
      case 'registration': return <RegistrationView onComplete={() => setView('dashboard')} />;
      case 'locations': 
      case 'team':
        return (
          <div className="flex h-[60vh] flex-col items-center justify-center text-center p-8">
            <ShieldCheck size={48} className="text-primary/20 mb-4" />
            <h2 className="font-headline text-2xl font-bold text-primary">Module Under Construction</h2>
            <p className="text-on-surface-variant mt-2">The {view} management interface is being finalized for enterprise deployment.</p>
            <button onClick={() => setView('manager')} className="mt-6 text-primary font-bold hover:underline">Return to Dashboard</button>
          </div>
        );
      default: return <DashboardView onAction={setView} />;
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      {view !== 'login' && (
        <TopBar 
          title="Workforce Pro" 
          userType={userType} 
          onViewChange={setView} 
        />
      )}
      
      <main className={cn("mx-auto max-w-7xl px-6", view !== 'login' && "pt-8")}>
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {view !== 'login' && view !== 'registration' && (
        <BottomNav currentView={view} onViewChange={setView} />
      )}
    </div>
  );
}
