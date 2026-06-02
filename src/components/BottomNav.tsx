import { Calendar, History as HistoryIcon, LayoutDashboard, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import type { View } from '../types/auth';

export const BottomNav = ({ currentView, onViewChange }: { currentView: View, onViewChange: (v: View) => void }) => {
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
