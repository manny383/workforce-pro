import { useState, type ChangeEvent } from 'react';
import { Camera, LoaderCircle, Save, ShieldCheck } from 'lucide-react';
import { API_URL, readApiResponse } from '../config/api';
import { saveStoredSession } from '../lib/sessionStorage';
import type { Session } from '../types/auth';

const resizeImage = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => {
    const image = new Image();
    image.onload = () => {
      const size = 320;
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('No se pudo preparar la imagen'));
        return;
      }
      canvas.width = size;
      canvas.height = size;
      const sourceSize = Math.min(image.width, image.height);
      const sourceX = (image.width - sourceSize) / 2;
      const sourceY = (image.height - sourceSize) / 2;
      context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    image.onerror = () => reject(new Error('No se pudo leer la imagen'));
    image.src = String(reader.result);
  };
  reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
  reader.readAsDataURL(file);
});

export const SettingsView = ({
  session,
  onSessionChange,
}: {
  session: Session;
  onSessionChange: (session: Session) => void;
}) => {
  const [photo, setPhoto] = useState(session.user.foto_url || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const selectPhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError('');
      setMessage('');
      if (!file.type.startsWith('image/')) throw new Error('Selecciona un archivo de imagen');
      setPhoto(await resizeImage(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la foto');
    }
  };

  const savePhoto = async () => {
    try {
      setSaving(true);
      setError('');
      setMessage('');
      const response = await fetch(`${API_URL}/api/auth/photo`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ foto_url: photo }),
      });
      const data = await readApiResponse(response);
      const nextSession = {
        ...session,
        user: { ...session.user, foto_url: data.foto_url },
      };
      saveStoredSession(nextSession);
      onSessionChange(nextSession);
      setMessage('Foto actualizada');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la foto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-32">
      <div>
        <h2 className="font-headline text-4xl font-extrabold tracking-tight text-primary">Perfil</h2>
        <p className="font-sans text-on-surface-variant">Actualiza tu foto y datos visibles en Workforce Pro.</p>
      </div>

      {error && <div className="rounded-xl bg-error-container/40 px-5 py-4 text-sm font-semibold text-error">{error}</div>}
      {message && <div className="rounded-xl bg-tertiary/10 px-5 py-4 text-sm font-semibold text-tertiary">{message}</div>}

      <section className="grid gap-8 lg:grid-cols-[minmax(280px,420px)_1fr]">
        <div className="rounded-2xl bg-surface-container-lowest p-7 shadow-sm ring-1 ring-outline-variant/10">
          <div className="flex flex-col items-center text-center">
            <div className="h-32 w-32 overflow-hidden rounded-full bg-primary/10">
              <img
                src={photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.nombre)}&background=0A4A5C&color=fff&size=256`}
                alt={session.user.nombre}
                className="h-full w-full object-cover"
              />
            </div>
            <h3 className="mt-5 font-headline text-xl font-bold text-primary">{session.user.nombre}</h3>
            <p className="mt-1 text-sm text-on-surface-variant">{session.user.correo}</p>
            <span className="mt-3 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase text-primary">{session.user.rol}</span>
          </div>

          <div className="mt-7 grid gap-3">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-surface-container-low px-5 py-3 text-sm font-bold text-on-surface-variant">
              <Camera size={18} /> Elegir foto
              <input type="file" accept="image/*" onChange={selectPhoto} className="hidden" />
            </label>
            <button
              onClick={() => void savePhoto()}
              disabled={saving || !photo}
              className="flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              {saving ? <LoaderCircle size={18} className="animate-spin" /> : <Save size={18} />} Guardar foto
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-surface-container-low p-7">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary/10 p-4">
              <ShieldCheck className="text-primary" size={24} />
            </div>
            <div>
              <h3 className="font-headline text-xl font-bold text-primary">Foto de perfil</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">
                La imagen se recorta en formato cuadrado y se guarda en tu perfil. Se mostrara en la barra superior y puede usarse en vistas administrativas.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
