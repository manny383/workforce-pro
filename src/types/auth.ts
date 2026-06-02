export type View = 'login' | 'dashboard' | 'manager' | 'history' | 'settings' | 'registration' | 'locations' | 'team' | 'schedule';

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
