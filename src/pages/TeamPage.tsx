import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowLeft, CalendarClock, Clock3, LoaderCircle, MapPin, Pencil, Plus, Search, ShieldCheck, UserCheck, UserX, X } from 'lucide-react';
import { API_URL } from '../config/api';
import type { ApiUser, Session } from '../types/auth';

type ManagedUser = ApiUser & {
  telefono: string | null;
  activo: number | boolean;
  ubicacion_hoy?: string | null;
  turno_hoy?: string | null;
  hora_entrada_hoy?: string | null;
  hora_salida_hoy?: string | null;
  asistencia_hoy_id?: number | null;
  entrada_hoy?: string | null;
  salida_hoy?: string | null;
  estatus_hoy?: 'presente' | 'retardo' | 'ausente' | string | null;
  ultima_entrada?: string | null;
  ultima_salida?: string | null;
  ultima_ubicacion?: string | null;
};

const emptyForm = { nombre: '', correo: '', password: '', telefono: '', rol: 'empleado' as ApiUser['rol'] };
const userToForm = (user: ManagedUser) => ({
  nombre: user.nombre,
  correo: user.correo,
  password: '',
  telefono: user.telefono || '',
  rol: user.rol,
});
const dayOptions = [
  { value: 1, label: 'Lun' }, { value: 2, label: 'Mar' }, { value: 3, label: 'Mie' },
  { value: 4, label: 'Jue' }, { value: 5, label: 'Vie' }, { value: 6, label: 'Sab' },
  { value: 7, label: 'Dom' },
];
type Shift = { id: number; nombre_turno: string; hora_entrada: string; hora_salida: string };
type Location = { id: number; nombre: string; activa: number | boolean };
type Assignment = {
  id: number; locacion_nombre: string; nombre_turno: string; hora_entrada: string; hora_salida: string;
  fecha_inicio: string; fecha_fin: string | null; dias_semana: number[]; activa: number | boolean;
};
const emptyAssignment = { locacion_id: '', turno_id: '', fecha_inicio: new Date().toISOString().slice(0, 10), fecha_fin: '', dias_semana: [1, 2, 3, 4, 5] };
const filterOptions = [
  { value: 'todos', label: 'Todos' },
  { value: 'activos', label: 'Activos' },
  { value: 'inactivos', label: 'Inactivos' },
  { value: 'programados', label: 'Programados hoy' },
  { value: 'sin-horario', label: 'Sin horario hoy' },
  { value: 'presentes', label: 'Presentes' },
  { value: 'retardos', label: 'Retardos' },
  { value: 'pendientes', label: 'Pendientes' },
] as const;
type TeamFilter = typeof filterOptions[number]['value'];

const formatTime = (value?: string | null) =>
  value ? new Date(value).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }) : '';
const formatHour = (value?: string | null) => value ? String(value).slice(0, 5) : '';
const isActive = (user: ManagedUser) => Boolean(user.activo);
const isScheduledToday = (user: ManagedUser) => Boolean(user.turno_hoy);
const hasAttendanceToday = (user: ManagedUser) => Boolean(user.asistencia_hoy_id);
const getTodayStatus = (user: ManagedUser) => {
  if (!isActive(user)) return { label: 'Inactivo', className: 'bg-error-container/40 text-error' };
  if (hasAttendanceToday(user) && !user.salida_hoy) return { label: user.estatus_hoy === 'retardo' ? 'Retardo en curso' : 'En turno', className: user.estatus_hoy === 'retardo' ? 'bg-error-container/40 text-error' : 'bg-tertiary/10 text-tertiary' };
  if (hasAttendanceToday(user)) return { label: user.estatus_hoy === 'retardo' ? 'Retardo' : 'Presente', className: user.estatus_hoy === 'retardo' ? 'bg-error-container/40 text-error' : 'bg-tertiary/10 text-tertiary' };
  if (isScheduledToday(user)) return { label: 'Pendiente', className: 'bg-primary/10 text-primary' };
  return { label: 'Sin horario hoy', className: 'bg-surface-container-low text-on-surface-variant' };
};

export const TeamView = ({ session, onBack }: { session: Session; onBack: () => void }) => {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [query, setQuery] = useState('');
  const [teamFilter, setTeamFilter] = useState<TeamFilter>('todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [scheduleUser, setScheduleUser] = useState<ManagedUser | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [assignmentForm, setAssignmentForm] = useState(emptyAssignment);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const request = async (path: string, options?: RequestInit) => {
    const response = await fetch(`${API_URL}/api/admin${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`,
        ...options?.headers,
      },
    });

    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await response.json()
      : null;

    if (!response.ok) {
      if (data?.message) throw new Error(data.message);
      if (response.status === 404 || !contentType.includes('application/json')) {
        throw new Error('La API administrativa no esta disponible. Verifica que el backend actualizado este desplegado.');
      }
      throw new Error(`No se pudo completar la operacion (${response.status})`);
    }

    if (!data) {
      throw new Error('La API devolvio una respuesta inesperada. Verifica VITE_API_URL.');
    }

    return data;
  };

  const loadUsers = async () => {
    try {
      setError('');
      setUsers(await request('/users'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadUsers(); }, []);

  const filteredUsers = useMemo(() => {
    const term = query.toLowerCase().trim();
    return users.filter((user) => {
      const matchesTerm = !term || `${user.nombre} ${user.correo} ${user.rol} ${user.ubicacion_hoy || ''} ${user.turno_hoy || ''}`.toLowerCase().includes(term);
      if (!matchesTerm) return false;

      if (teamFilter === 'activos') return isActive(user);
      if (teamFilter === 'inactivos') return !isActive(user);
      if (teamFilter === 'programados') return isScheduledToday(user);
      if (teamFilter === 'sin-horario') return !isScheduledToday(user);
      if (teamFilter === 'presentes') return hasAttendanceToday(user) && user.estatus_hoy !== 'retardo';
      if (teamFilter === 'retardos') return user.estatus_hoy === 'retardo';
      if (teamFilter === 'pendientes') return isActive(user) && isScheduledToday(user) && !hasAttendanceToday(user);
      return true;
    });
  }, [query, teamFilter, users]);

  const teamStats = useMemo(() => ({
    scheduled: users.filter((user) => isActive(user) && isScheduledToday(user)).length,
    present: users.filter((user) => hasAttendanceToday(user) && user.estatus_hoy !== 'retardo').length,
    late: users.filter((user) => user.estatus_hoy === 'retardo').length,
    pending: users.filter((user) => isActive(user) && isScheduledToday(user) && !hasAttendanceToday(user)).length,
  }), [users]);

  const createUser = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError('');
      const user = await request('/users', { method: 'POST', body: JSON.stringify(form) });
      setUsers((current) => [...current, user].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      setForm(emptyForm);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el usuario');
    } finally {
      setSaving(false);
    }
  };

  const openEditUser = (user: ManagedUser) => {
    setError('');
    setEditingUser(user);
    setForm(userToForm(user));
  };

  const closeUserForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setForm(emptyForm);
  };

  const updateUser = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingUser) return;

    try {
      setSaving(true);
      setError('');
      const payload = {
        ...form,
        password: form.password.trim() ? form.password : undefined,
      };
      const updatedUser = await request(`/users/${editingUser.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      setUsers((current) => current
        .map((user) => user.id === editingUser.id ? { ...user, ...updatedUser } : user)
        .sort((a, b) => a.nombre.localeCompare(b.nombre)));
      closeUserForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el usuario');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (user: ManagedUser) => {
    try {
      setError('');
      const activo = !Boolean(user.activo);
      await request(`/users/${user.id}/status`, { method: 'PATCH', body: JSON.stringify({ activo }) });
      setUsers((current) => current.map((item) => item.id === user.id ? { ...item, activo } : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el usuario');
    }
  };

  const openSchedule = async (user: ManagedUser) => {
    try {
      setScheduleUser(user);
      setScheduleLoading(true);
      setError('');
      const [nextAssignments, nextLocations, nextShifts] = await Promise.all([
        request(`/users/${user.id}/assignments`), request('/locations'), request('/shifts'),
      ]);
      setAssignments(nextAssignments);
      setLocations(nextLocations.filter((location: Location) => Boolean(location.activa)));
      setShifts(nextShifts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los horarios');
      setScheduleUser(null);
    } finally {
      setScheduleLoading(false);
    }
  };

  const createAssignment = async (event: FormEvent) => {
    event.preventDefault();
    if (!scheduleUser) return;
    try {
      setSaving(true);
      setError('');
      await request(`/users/${scheduleUser.id}/assignments`, {
        method: 'POST',
        body: JSON.stringify({
          ...assignmentForm,
          locacion_id: Number(assignmentForm.locacion_id),
          turno_id: Number(assignmentForm.turno_id),
          fecha_fin: assignmentForm.fecha_fin || null,
        }),
      });
      setAssignments(await request(`/users/${scheduleUser.id}/assignments`));
      setAssignmentForm(emptyAssignment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo asignar el horario');
    } finally {
      setSaving(false);
    }
  };

  const toggleAssignment = async (assignment: Assignment) => {
    if (!scheduleUser) return;
    try {
      const activa = !Boolean(assignment.activa);
      await request(`/assignments/${assignment.id}/status`, { method: 'PATCH', body: JSON.stringify({ activa }) });
      setAssignments((current) => current.map((item) => item.id === assignment.id ? { ...item, activa } : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el horario');
    }
  };

  return (
    <div className="space-y-8 pb-32">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <button onClick={onBack} className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-primary">
            <ArrowLeft size={16} /> Volver al panel
          </button>
          <h2 className="font-headline text-4xl font-extrabold text-primary">Equipo</h2>
          <p className="mt-2 text-on-surface-variant">Administra perfiles y acceso al sistema.</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setShowForm(true); }} className="flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg">
          <Plus size={18} /> Nuevo usuario
        </button>
      </div>

      {error && <div className="rounded-xl bg-error-container/40 px-5 py-4 text-sm font-semibold text-error">{error}</div>}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Programados hoy', value: teamStats.scheduled },
          { label: 'Presentes', value: teamStats.present },
          { label: 'Retardos', value: teamStats.late },
          { label: 'Pendientes', value: teamStats.pending },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm ring-1 ring-outline-variant/10">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{stat.label}</span>
            <p className="mt-2 font-headline text-3xl font-extrabold text-primary">{stat.value}</p>
          </div>
        ))}
      </section>

      <div className="flex items-center gap-3 rounded-2xl bg-surface-container-lowest px-5 py-4 shadow-sm ring-1 ring-outline-variant/10">
        <Search size={19} className="text-outline" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre, correo, rol, turno o ubicacion" className="w-full border-0 bg-transparent text-sm outline-none" />
        <span className="text-xs font-bold text-on-surface-variant">{filteredUsers.length} usuarios</span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setTeamFilter(option.value)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${teamFilter === option.value ? 'bg-primary text-white' : 'bg-surface-container-lowest text-on-surface-variant ring-1 ring-outline-variant/10'}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoaderCircle className="animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => {
            const todayStatus = getTodayStatus(user);
            return (
              <article key={user.id} className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm ring-1 ring-outline-variant/10">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-headline text-lg font-extrabold text-primary">
                    {user.nombre.slice(0, 2).toUpperCase()}
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${todayStatus.className}`}>
                    {todayStatus.label}
                  </span>
                </div>
                <h3 className="mt-5 font-headline text-lg font-bold text-on-surface">{user.nombre}</h3>
                <p className="mt-1 truncate text-sm text-on-surface-variant">{user.correo}</p>

                <div className="mt-5 grid gap-3 rounded-2xl bg-surface-container-low p-4">
                  <div className="flex items-start gap-2">
                    <CalendarClock size={16} className="mt-0.5 text-primary" />
                    <div>
                      <p className="text-xs font-bold text-on-surface">{user.turno_hoy || 'Sin turno para hoy'}</p>
                      <p className="text-xs text-on-surface-variant">
                        {user.turno_hoy ? `${formatHour(user.hora_entrada_hoy)} - ${formatHour(user.hora_salida_hoy)}` : 'No hay asignacion activa este dia'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="mt-0.5 text-primary" />
                    <p className="text-xs text-on-surface-variant">{user.ubicacion_hoy || user.ultima_ubicacion || 'Sin ubicacion registrada'}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock3 size={16} className="mt-0.5 text-primary" />
                    <p className="text-xs text-on-surface-variant">
                      {user.entrada_hoy ? `Entrada hoy ${formatTime(user.entrada_hoy)}${user.salida_hoy ? `, salida ${formatTime(user.salida_hoy)}` : ', en curso'}`
                        : user.ultima_entrada ? `Ultimo registro ${formatTime(user.ultima_entrada)}` : 'Sin registros de asistencia'}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-outline-variant/10 pt-4">
                  <span className="flex items-center gap-2 text-xs font-bold capitalize text-primary"><ShieldCheck size={15} /> {user.rol}</span>
                  <button disabled={user.id === session.user.id} onClick={() => void toggleStatus(user)} className="flex items-center gap-2 rounded-full bg-surface-container-low px-3 py-2 text-xs font-bold text-on-surface-variant disabled:cursor-not-allowed disabled:opacity-40">
                    {user.activo ? <UserX size={15} /> : <UserCheck size={15} />} {user.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
                <button onClick={() => void openSchedule(user)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-primary/10 py-3 text-xs font-bold text-primary">
                  <CalendarClock size={16} /> Administrar horarios
                </button>
                <button onClick={() => openEditUser(user)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-surface-container-low py-3 text-xs font-bold text-on-surface-variant">
                  <Pencil size={16} /> Editar datos
                </button>
              </article>
            );
          })}
        </div>
      )}

      {(showForm || editingUser) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/30 p-5 backdrop-blur-sm">
          <form onSubmit={editingUser ? updateUser : createUser} className="w-full max-w-lg rounded-3xl bg-surface-container-lowest p-7 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-headline text-2xl font-bold text-primary">{editingUser ? 'Editar usuario' : 'Nuevo usuario'}</h3>
                <p className="text-sm text-on-surface-variant">{editingUser ? 'Actualiza sus datos de acceso.' : 'Crea sus credenciales de acceso.'}</p>
              </div>
              <button type="button" onClick={closeUserForm} className="rounded-full bg-surface-container-low p-2"><X size={18} /></button>
            </div>
            <div className="grid gap-4">
              <input required placeholder="Nombre completo" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="rounded-xl bg-surface-container-low p-4 text-sm outline-primary" />
              <input required type="email" placeholder="Correo" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} className="rounded-xl bg-surface-container-low p-4 text-sm outline-primary" />
              <input required={!editingUser} minLength={8} type="password" placeholder={editingUser ? 'Nuevo password (opcional)' : 'Password (minimo 8 caracteres)'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="rounded-xl bg-surface-container-low p-4 text-sm outline-primary" />
              <input placeholder="Telefono (opcional)" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="rounded-xl bg-surface-container-low p-4 text-sm outline-primary" />
              <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value as ApiUser['rol'] })} className="rounded-xl bg-surface-container-low p-4 text-sm outline-primary">
                <option value="empleado">Empleado</option>
                {session.user.rol === 'admin' && <option value="supervisor">Supervisor</option>}
                {session.user.rol === 'admin' && <option value="admin">Administrador</option>}
              </select>
              <button disabled={saving} className="mt-2 flex items-center justify-center gap-2 rounded-full bg-primary py-4 font-bold text-white disabled:opacity-60">
                {saving && <LoaderCircle size={18} className="animate-spin" />} {editingUser ? 'Guardar cambios' : 'Crear usuario'}
              </button>
            </div>
          </form>
        </div>
      )}

      {scheduleUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/30 p-5 backdrop-blur-sm">
          <div className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-surface-container-lowest p-7 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div><h3 className="font-headline text-2xl font-bold text-primary">Horarios de {scheduleUser.nombre}</h3><p className="text-sm text-on-surface-variant">Asigna turnos por ubicacion y dias.</p></div>
              <button onClick={() => setScheduleUser(null)} className="rounded-full bg-surface-container-low p-2"><X size={18} /></button>
            </div>

            {scheduleLoading ? <div className="flex justify-center py-16"><LoaderCircle className="animate-spin text-primary" /></div> : (
              <div className="grid gap-7 lg:grid-cols-2">
                <form onSubmit={createAssignment} className="grid content-start gap-4 rounded-2xl bg-surface-container-low p-5">
                  <h4 className="font-headline text-lg font-bold text-primary">Nueva asignacion</h4>
                  <select required value={assignmentForm.locacion_id} onChange={(e) => setAssignmentForm({ ...assignmentForm, locacion_id: e.target.value })} className="rounded-xl bg-surface-container-lowest p-4 text-sm outline-primary">
                    <option value="">Selecciona ubicacion</option>
                    {locations.map((location) => <option key={location.id} value={location.id}>{location.nombre}</option>)}
                  </select>
                  <select required value={assignmentForm.turno_id} onChange={(e) => setAssignmentForm({ ...assignmentForm, turno_id: e.target.value })} className="rounded-xl bg-surface-container-lowest p-4 text-sm outline-primary">
                    <option value="">Selecciona turno</option>
                    {shifts.map((shift) => <option key={shift.id} value={shift.id}>{shift.nombre_turno} ({shift.hora_entrada.slice(0, 5)} - {shift.hora_salida.slice(0, 5)})</option>)}
                  </select>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="text-xs font-bold text-on-surface-variant">Desde<input required type="date" value={assignmentForm.fecha_inicio} onChange={(e) => setAssignmentForm({ ...assignmentForm, fecha_inicio: e.target.value })} className="mt-2 w-full rounded-xl bg-surface-container-lowest p-3 text-sm" /></label>
                    <label className="text-xs font-bold text-on-surface-variant">Hasta (opcional)<input type="date" min={assignmentForm.fecha_inicio} value={assignmentForm.fecha_fin} onChange={(e) => setAssignmentForm({ ...assignmentForm, fecha_fin: e.target.value })} className="mt-2 w-full rounded-xl bg-surface-container-lowest p-3 text-sm" /></label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {dayOptions.map((day) => <button key={day.value} type="button" onClick={() => setAssignmentForm((current) => ({ ...current, dias_semana: current.dias_semana.includes(day.value) ? current.dias_semana.filter((value) => value !== day.value) : [...current.dias_semana, day.value] }))} className={`rounded-full px-3 py-2 text-xs font-bold ${assignmentForm.dias_semana.includes(day.value) ? 'bg-primary text-white' : 'bg-surface-container-lowest text-on-surface-variant'}`}>{day.label}</button>)}
                  </div>
                  <button disabled={saving || assignmentForm.dias_semana.length === 0} className="flex items-center justify-center gap-2 rounded-full bg-primary py-3 font-bold text-white disabled:opacity-50">{saving && <LoaderCircle size={17} className="animate-spin" />} Asignar horario</button>
                </form>

                <div className="space-y-3">
                  <h4 className="font-headline text-lg font-bold text-primary">Asignaciones</h4>
                  {!assignments.length && <p className="rounded-2xl bg-surface-container-low p-5 text-sm text-on-surface-variant">Este trabajador aun no tiene horarios asignados.</p>}
                  {assignments.map((assignment) => (
                    <article key={assignment.id} className={`rounded-2xl border p-4 ${assignment.activa ? 'border-primary/20 bg-primary/5' : 'border-outline-variant/20 bg-surface-container-low opacity-60'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div><p className="font-bold text-on-surface">{assignment.nombre_turno}</p><p className="mt-1 flex items-center gap-1 text-xs text-on-surface-variant"><MapPin size={13} /> {assignment.locacion_nombre}</p></div>
                        <button onClick={() => void toggleAssignment(assignment)} className="rounded-full bg-surface-container-lowest px-3 py-2 text-[10px] font-bold uppercase text-primary">{assignment.activa ? 'Desactivar' : 'Activar'}</button>
                      </div>
                      <p className="mt-3 text-sm font-semibold text-primary">{assignment.hora_entrada.slice(0, 5)} - {assignment.hora_salida.slice(0, 5)}</p>
                      <p className="mt-1 text-xs text-on-surface-variant">{assignment.dias_semana.map((day) => dayOptions.find((option) => option.value === day)?.label).join(', ')}</p>
                      <p className="mt-1 text-xs text-on-surface-variant">Desde {String(assignment.fecha_inicio).slice(0, 10)}{assignment.fecha_fin ? ` hasta ${String(assignment.fecha_fin).slice(0, 10)}` : ', sin fecha final'}</p>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
