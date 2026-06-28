export type View = 'login' | 'dashboard' | 'manager' | 'history' | 'settings' | 'registration' | 'checkout' | 'locations' | 'team' | 'shifts' | 'today' | 'today-active' | 'today-late' | 'today-absent' | 'schedule';

export type ApiUser = {
  id: number;
  nombre: string;
  correo: string;
  rol: 'admin' | 'supervisor' | 'empleado';
};

export type Session = {
  token: string;
  user: ApiUser;
};

export type UserType = 'employee' | 'manager';
