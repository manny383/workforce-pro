import { Bell, LogOut } from 'lucide-react';
import type { UserType, View } from '../types/auth';

export const TopBar = ({ title, userType, onViewChange }: { title: string, userType: 'employee' | 'manager', onViewChange: (v: View) => void }) => (
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
