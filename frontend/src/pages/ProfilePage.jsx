import { useCallback, useEffect, useState } from 'react';
import {
  UserCircle2,
  Mail,
  Phone,
  ShieldCheck,
  CalendarDays,
  Image as ImageIcon,
  MessageCircle,
  Save,
  Pencil,
  X,
} from 'lucide-react';
import Toast from '../components/Toast';
import { fetchProfile, updateProfile } from '../services/profileService';
import { getErrorMessage } from '../services/http';

const PHONE_REGEX = /^\+?[0-9]{10,15}$/;
const URL_REGEX = /^https?:\/\/.+/;

const ROLE_LABELS = {
  ADMIN: 'Administrador',
  ANALISTA: 'Analista',
  USUARIO: 'Usuario',
};

const avatarFor = (p) =>
  p?.avatarUrl ||
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(`${p?.nombre ?? ''} ${p?.apellido ?? ''}`)}`;

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—';

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0F172A] border border-[#334155]">
      <div className="w-9 h-9 rounded-lg bg-[#10B981]/10 text-[#10B981] flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm text-white font-medium truncate">{value || '—'}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [telefono, setTelefono] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const closeToast = useCallback(() => setToast({ message: '', type: 'success' }), []);
  const isLoading = !profile && !loadError;

  useEffect(() => {
    let active = true;
    fetchProfile()
      .then((data) => {
        if (active) setProfile(data);
      })
      .catch((error) => {
        if (active) setLoadError(getErrorMessage(error, 'No se pudo cargar tu perfil.'));
      });
    return () => {
      active = false;
    };
  }, []);

  const startEditing = () => {
    setTelefono(profile?.telefono || '');
    setAvatarUrl(profile?.avatarUrl || '');
    setFieldErrors({});
    setIsEditing(true);
  };

  const validate = () => {
    const errors = {};
    const phone = telefono.trim();
    if (phone && !PHONE_REGEX.test(phone)) {
      errors.telefono = 'Usa de 10 a 15 dígitos, con + opcional. Ej. +529511234567';
    }
    const url = avatarUrl.trim();
    if (url && !URL_REGEX.test(url)) {
      errors.avatarUrl = 'La URL debe iniciar con http:// o https://';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSaving(true);
    try {
      const updated = await updateProfile({
        telefono: telefono.trim(),
        avatarUrl: avatarUrl.trim(),
      });
      setProfile(updated);
      setIsEditing(false);
      setToast({ message: 'Tu perfil se actualizó correctamente.', type: 'success' });
    } catch (error) {
      const campos = error?.response?.data?.campos;
      if (campos) setFieldErrors(campos);
      setToast({ message: getErrorMessage(error, 'No se pudo guardar tu perfil.'), type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] p-6 lg:p-8">
        <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-3">
          <div className="h-72 rounded-2xl bg-[#1E293B] border border-[#334155] animate-pulse" />
          <div className="md:col-span-2 h-72 rounded-2xl bg-[#1E293B] border border-[#334155] animate-pulse" />
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#0F172A] p-6 lg:p-8 flex items-center justify-center">
        <div className="max-w-md w-full rounded-2xl bg-[#1E293B] border border-red-500/30 p-6 text-center">
          <p className="text-red-300 text-sm">{loadError}</p>
        </div>
      </div>
    );
  }

  const hasPhone = Boolean(profile.telefono);

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-[#10B981]/15 border border-[#10B981]/40 flex items-center justify-center text-[#10B981]">
            <UserCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Mi perfil</h1>
            <p className="text-xs text-[#94A3B8]">Tus datos y cómo te avisamos de tus quinielas</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Tarjeta de avatar */}
          <div className="rounded-2xl bg-[#1E293B] border border-[#334155] p-6 flex flex-col items-center text-center">
            <img
              src={avatarFor(profile)}
              alt={`Avatar de ${profile.nombre}`}
              className="w-28 h-28 rounded-full object-cover border-2 border-[#10B981] bg-[#0F172A] mb-4"
            />
            <h2 className="text-lg font-bold text-white">
              {profile.nombre} {profile.apellido}
            </h2>
            <p className="text-sm text-[#94A3B8] break-all">{profile.email}</p>
            <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              {ROLE_LABELS[profile.rol] || profile.rol}
            </span>

            <div
              className={`mt-6 w-full p-3.5 rounded-xl border text-left text-xs ${
                hasPhone
                  ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
                  : 'bg-amber-500/10 border-amber-500/40 text-amber-300'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold mb-1">
                <MessageCircle className="w-4 h-4" />
                {hasPhone ? 'Notificaciones activas' : 'Sin teléfono registrado'}
              </div>
              <p className="text-slate-300">
                {hasPhone
                  ? 'Recibirás la confirmación de cada quiniela por SMS y WhatsApp.'
                  : 'Agrega tu teléfono para recibir tus confirmaciones por SMS y WhatsApp.'}
              </p>
            </div>
          </div>

          {/* Datos y edición */}
          <div className="md:col-span-2 rounded-2xl bg-[#1E293B] border border-[#334155] p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">Información de la cuenta</h3>
              {!isEditing && (
                <button
                  onClick={startEditing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#10B981]/15 hover:bg-[#10B981]/25 border border-[#10B981]/30 text-[#10B981] text-xs font-semibold cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Editar
                </button>
              )}
            </div>

            {!isEditing ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoRow icon={UserCircle2} label="Nombre" value={`${profile.nombre} ${profile.apellido}`} />
                <InfoRow icon={Mail} label="Correo" value={profile.email} />
                <InfoRow icon={Phone} label="Teléfono (SMS / WhatsApp)" value={profile.telefono} />
                <InfoRow icon={ShieldCheck} label="Rol" value={ROLE_LABELS[profile.rol] || profile.rol} />
                <InfoRow icon={CalendarDays} label="Miembro desde" value={formatDate(profile.createdAt)} />
                <InfoRow icon={ImageIcon} label="Avatar" value={profile.avatarUrl ? 'Personalizado' : 'Generado'} />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="telefono" className="block text-xs font-medium text-slate-300 mb-1">
                    Teléfono para SMS y WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="telefono"
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="+529511234567"
                      className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#0F172A] border text-white text-sm focus:outline-none ${
                        fieldErrors.telefono ? 'border-red-500' : 'border-[#334155] focus:border-[#10B981]'
                      }`}
                    />
                  </div>
                  {fieldErrors.telefono ? (
                    <p className="text-xs text-red-400 mt-1">{fieldErrors.telefono}</p>
                  ) : (
                    <p className="text-xs text-slate-500 mt-1">
                      Incluye la lada del país (México: +52). Déjalo vacío para no recibir mensajes.
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="avatarUrl" className="block text-xs font-medium text-slate-300 mb-1">
                    URL del avatar
                  </label>
                  <div className="relative">
                    <ImageIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="avatarUrl"
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://..."
                      className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#0F172A] border text-white text-sm focus:outline-none ${
                        fieldErrors.avatarUrl ? 'border-red-500' : 'border-[#334155] focus:border-[#10B981]'
                      }`}
                    />
                  </div>
                  {fieldErrors.avatarUrl && <p className="text-xs text-red-400 mt-1">{fieldErrors.avatarUrl}</p>}
                </div>

                <div className="p-3.5 rounded-xl bg-[#0F172A] border border-[#334155] text-xs text-[#94A3B8]">
                  El nombre, correo y rol solo los puede cambiar un administrador.
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-slate-950 text-sm font-bold cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <Toast message={toast.message} type={toast.type} onClose={closeToast} />
    </div>
  );
}
