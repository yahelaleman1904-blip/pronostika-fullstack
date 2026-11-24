import { useState } from 'react';
import {
  Trophy,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { authApi } from '../services/api';

const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#._-]).{8,}$/;

export default function LoginPage({ onLoginSuccess }) {
  const [mode, setMode] = useState('login');

  // Estados de formulario
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Estados de validación y carga
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Modal de ¿Olvidaste tu contraseña?
  const [forgotOpen, setForgotOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryMsg, setRecoveryMsg] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (mode === 'register') {
      if (!nombre.trim()) {
        errors.nombre = 'Ingresa tu nombre.';
        isValid = false;
      }
      if (!apellido.trim()) {
        errors.apellido = 'Ingresa tu apellido.';
        isValid = false;
      }
    }

    if (!email.trim() || !email.includes('@')) {
      errors.email = 'Ingresa un correo electrónico válido.';
      isValid = false;
    }

    if (!password.trim()) {
      errors.password = 'Ingresa tu contraseña.';
      isValid = false;
    } else if (mode === 'register' && !STRONG_PASSWORD_REGEX.test(password)) {
      errors.password =
        'Mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo (@$!%*?&#._-).';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccessMsg('');

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (mode === 'login') {
        const userData = await authApi.login(email.trim(), password);
        onLoginSuccess(userData);
      } else {
        const newUser = await authApi.register({
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          email: email.trim(),
          telefono: telefono.trim() || null,
          password,
        });
        onLoginSuccess(newUser);
      }
    } catch (error) {
      setApiError(error.message || 'Correo o contraseña incorrectos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) return;
    setRecoveryLoading(true);
    try {
      const res = await authApi.recuperarPassword(recoveryEmail.trim());
      setRecoveryMsg(res?.mensaje || 'Si el correo existe, recibirás instrucciones.');
    } catch (error) {
      setRecoveryMsg(error.message || 'No se pudo procesar la solicitud.');
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0F172A] text-[#F8FAFC]">
      {/* Mitad Izquierda: Estadio Nocturno */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 flex-col justify-between p-12">
        <img
          src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1400&q=80"
          alt="Estadio nocturno"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/60 to-transparent" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#10B981]/15 border border-[#10B981]/40 flex items-center justify-center text-[#10B981]">
            <Trophy className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Pronostika</span>
        </div>

        <div className="relative z-10 max-w-lg my-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-semibold tracking-wider uppercase mb-6">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            TEMPORADA 2026/27 EN VIVO
          </div>
          <h1 className="text-5xl font-extrabold leading-tight mb-4">
            Tus pronósticos merecen <span className="text-[#10B981]">ganar</span>
          </h1>
          <p className="text-[#94A3B8] text-lg leading-relaxed">
            Analiza cada partido con datos en tiempo real y convierte tu conocimiento del fútbol en victorias.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-12 pt-6 border-t border-slate-800/80">
          <div>
            <p className="text-3xl font-bold text-white">1.2M+</p>
            <p className="text-sm text-[#94A3B8]">Pronósticos</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">40+</p>
            <p className="text-sm text-[#94A3B8]">Ligas</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#10B981]">87%</p>
            <p className="text-sm text-[#94A3B8]">Precisión IA</p>
          </div>
        </div>
      </div>

      {/* Mitad Derecha: Login / Registro */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-[#0F172A] overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">
              {mode === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta gratis'}
            </h2>
            <p className="text-[#94A3B8] text-sm">
              {mode === 'login'
                ? 'Inicia sesión con tu correo para continuar.'
                : 'Regístrate y comienza a armar tus pronósticos y quinielas.'}
            </p>
          </div>

          {apiError && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center gap-3 text-[#10B981] text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {mode === 'register' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-200 mb-1.5">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej. Carlos"
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-[#1E293B] border ${
                        fieldErrors.nombre ? 'border-red-500' : 'border-[#334155]'
                      } text-white text-sm focus:outline-none focus:border-[#10B981]`}
                    />
                    {fieldErrors.nombre && (
                      <p className="mt-1 text-xs text-red-400">{fieldErrors.nombre}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-200 mb-1.5">
                      Apellido
                    </label>
                    <input
                      type="text"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      placeholder="Ej. Alemán"
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-[#1E293B] border ${
                        fieldErrors.apellido ? 'border-red-500' : 'border-[#334155]'
                      } text-white text-sm focus:outline-none focus:border-[#10B981]`}
                    />
                    {fieldErrors.apellido && (
                      <p className="mt-1 text-xs text-red-400">{fieldErrors.apellido}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1.5">
                    Teléfono (opcional, para alertas SMS/WhatsApp)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="+52 951 123 4567"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1E293B] border border-[#334155] text-white text-sm focus:outline-none focus:border-[#10B981]"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Correo electrónico */}
            <div>
              <label className="block text-xs font-medium text-slate-200 mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1E293B] border ${
                    fieldErrors.email ? 'border-red-500' : 'border-[#334155]'
                  } text-white text-sm focus:outline-none focus:border-[#10B981]`}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-200">Contraseña</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setForgotOpen(true);
                      setRecoveryMsg('');
                      setRecoveryEmail(email);
                    }}
                    className="text-xs text-[#10B981] hover:underline cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#1E293B] border ${
                    fieldErrors.password ? 'border-red-500' : 'border-[#334155]'
                  } text-white text-sm focus:outline-none focus:border-[#10B981]`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[#10B981] hover:bg-[#059669] text-slate-950 font-bold text-sm transition cursor-pointer disabled:opacity-60"
            >
              {isLoading
                ? 'Procesando...'
                : mode === 'login'
                ? 'Entrar'
                : 'Registrarme y Entrar'}
            </button>
          </form>

          {/* Cambiar entre Login y Registro */}
          <p className="mt-6 text-center text-sm text-[#94A3B8]">
            {mode === 'login' ? (
              <>
                ¿Primera vez en Pronostika?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setApiError('');
                    setFieldErrors({});
                  }}
                  className="text-[#10B981] font-semibold cursor-pointer hover:underline"
                >
                  Regístrate gratis
                </button>
              </>
            ) : (
              <>
                ¿Ya tienes una cuenta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setApiError('');
                    setFieldErrors({});
                  }}
                  className="text-[#10B981] font-semibold cursor-pointer hover:underline"
                >
                  Inicia sesión aquí
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Modal de Recuperación de Contraseña */}
      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#1E293B] border border-[#334155] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Recuperar contraseña</h3>
              <button
                onClick={() => setForgotOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {recoveryMsg ? (
              <div className="text-center py-4">
                <CheckCircle2 className="w-10 h-10 text-[#10B981] mx-auto mb-3" />
                <p className="text-sm text-white font-semibold mb-1">Solicitud enviada</p>
                <p className="text-xs text-[#94A3B8] mb-4">{recoveryMsg}</p>
                <button
                  onClick={() => setForgotOpen(false)}
                  className="w-full py-2 rounded-xl bg-[#10B981] text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            ) : (
              <form onSubmit={handleRecoverySubmit} className="space-y-3">
                <p className="text-xs text-[#94A3B8]">
                  Ingresa tu correo y te enviaremos instrucciones para restablecer tu acceso.
                </p>
                <input
                  type="email"
                  required
                  placeholder="tu@correo.com"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-[#334155] text-white text-sm focus:outline-none focus:border-[#10B981]"
                />
                <button
                  type="submit"
                  disabled={recoveryLoading}
                  className="w-full py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-slate-950 font-bold text-sm cursor-pointer disabled:opacity-60"
                >
                  {recoveryLoading ? 'Enviando...' : 'Enviar enlace'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}