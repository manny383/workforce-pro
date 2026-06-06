import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowLeft, LoaderCircle, Plus, Search, ShieldCheck, UserCheck, UserX, X } from 'lucide-react';
import { API_URL } from '../config/api';
import type { ApiUser, Session } from '../types/auth';

type ManagedUser = ApiUser & {
  telefono: string | null;
  activo: number | boolean;
};

const emptyForm = { nombre: '', correo: '', password: '', telefono: '', rol: 'empleado' as ApiUser['rol'] };

export const TeamView = ({ session, onBack }: { session: Session; onBack: () => void }) => {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

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
    return users.filter((user) => !term || `${user.nombre} ${user.correo} ${user.rol}`.toLowerCase().includes(term));
  }, [query, users]);

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
        <button onClick={() => setShowForm(true)} className="flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg">
          <Plus size={18} /> Nuevo usuario
        </button>
      </div>

      {error && <div className="rounded-xl bg-error-container/40 px-5 py-4 text-sm font-semibold text-error">{error}</div>}

      <div className="flex items-center gap-3 rounded-2xl bg-surface-container-lowest px-5 py-4 shadow-sm ring-1 ring-outline-variant/10">
        <Search size={19} className="text-outline" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre, correo o rol" className="w-full border-0 bg-transparent text-sm outline-none" />
        <span className="text-xs font-bold text-on-surface-variant">{filteredUsers.length} usuarios</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoaderCircle className="animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
            <article key={user.id} className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm ring-1 ring-outline-variant/10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-headline text-lg font-extrabold text-primary">
                  {user.nombre.slice(0, 2).toUpperCase()}
                </div>
                <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${user.activo ? 'bg-tertiary/10 text-tertiary' : 'bg-error-container/40 text-error'}`}>
                  {user.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <h3 className="mt-5 font-headline text-lg font-bold text-on-surface">{user.nombre}</h3>
              <p className="mt-1 truncate text-sm text-on-surface-variant">{user.correo}</p>
              <div className="mt-5 flex items-center justify-between border-t border-outline-variant/10 pt-4">
                <span className="flex items-center gap-2 text-xs font-bold capitalize text-primary"><ShieldCheck size={15} /> {user.rol}</span>
                <button disabled={user.id === session.user.id} onClick={() => void toggleStatus(user)} className="flex items-center gap-2 rounded-full bg-surface-container-low px-3 py-2 text-xs font-bold text-on-surface-variant disabled:cursor-not-allowed disabled:opacity-40">
                  {user.activo ? <UserX size={15} /> : <UserCheck size={15} />} {user.activo ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/30 p-5 backdrop-blur-sm">
          <form onSubmit={createUser} className="w-full max-w-lg rounded-3xl bg-surface-container-lowest p-7 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div><h3 className="font-headline text-2xl font-bold text-primary">Nuevo usuario</h3><p className="text-sm text-on-surface-variant">Crea sus credenciales de acceso.</p></div>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-full bg-surface-container-low p-2"><X size={18} /></button>
            </div>
            <div className="grid gap-4">
              <input required placeholder="Nombre completo" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="rounded-xl bg-surface-container-low p-4 text-sm outline-primary" />
              <input required type="email" placeholder="Correo" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} className="rounded-xl bg-surface-container-low p-4 text-sm outline-primary" />
              <input required minLength={8} type="password" placeholder="Password (minimo 8 caracteres)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="rounded-xl bg-surface-container-low p-4 text-sm outline-primary" />
              <input placeholder="Telefono (opcional)" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="rounded-xl bg-surface-container-low p-4 text-sm outline-primary" />
              <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value as ApiUser['rol'] })} className="rounded-xl bg-surface-container-low p-4 text-sm outline-primary">
                <option value="empleado">Empleado</option>
                {session.user.rol === 'admin' && <option value="supervisor">Supervisor</option>}
                {session.user.rol === 'admin' && <option value="admin">Administrador</option>}
              </select>
              <button disabled={saving} className="mt-2 flex items-center justify-center gap-2 rounded-full bg-primary py-4 font-bold text-white disabled:opacity-60">
                {saving && <LoaderCircle size={18} className="animate-spin" />} Crear usuario
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
