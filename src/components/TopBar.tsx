import { Bell, LogOut } from 'lucide-react';
import type { Session, UserType, View } from '../types/auth';

export const TopBar = ({
  title,
  userType,
  session,
  onViewChange,
}: {
  title: string;
  userType: UserType;
  session: Session;
  onViewChange: (v: View) => void;
}) => (
  <header className="sticky top-0 z-40 w-full bg-surface/80 backdrop-blur-md">
    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button
          className="h-10 w-10 overflow-hidden rounded-full bg-primary/10"
          onClick={() => onViewChange(userType === 'employee' ? 'dashboard' : 'manager')}
        >
          <img
            src={session.user.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.nombre)}&background=0A4A5C&color=fff`}
            alt={session.user.nombre}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        </button>
        <h1 className="font-headline text-lg font-bold tracking-tight text-primary">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low">
          <Bell size={20} />
        </button>
        <button
          onClick={() => onViewChange('login')}
          className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low"
        >
          <LogOut size={20} />
        </button>
      </div>
    </div>
  </header>
);
