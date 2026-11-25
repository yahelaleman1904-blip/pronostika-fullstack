import GoalAnimationCanvas from '../components/GoalAnimationCanvas';
import { useState } from 'react';
import {
  Trophy,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  X,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { authApi } from '../services/api';

const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#._-]).{8,}$/;

const COUNTRY_CODES = [
  { code: '+52', flag: '🇲🇽', label: 'MX (+52)' },
  { code: '+1', flag: '🇺🇸', label: 'US/CA (+1)' },
  { code: '+34', flag: '🇪🇸', label: 'ES (+34)' },
  { code: '+57', flag: '🇨🇴', label: 'CO (+57)' },
  { code: '+54', flag: '🇦🇷', label: 'AR (+54)' },
  { code: '+56', flag: '🇨🇱', label: 'CL (+56)' },
  { code: '+51', flag: '🇵🇪', label: 'PE (+51)' },
  { code: '+593', flag: '🇪🇨', label: 'EC (+593)' },
  { code: '+502', flag: '🇬🇹', label: 'GT (+502)' },
  { code: '+58', flag: '🇻🇪', label: 'VE (+58)' },
];

export default function LoginPage({ onLogin, onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);

  // Campos de formulario
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [countryCode, setCountryCode] = useState('+52');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal de recuperación de contraseña (2 pasos)
  const [forgotOpen, setForgotOpen] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState(1);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [recoveryNewPass, setRecoveryNewPass] = useState('');
  const [recoveryMsg, setRecoveryMsg] = useState('');
  const [recoveryError, setRecoveryError] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  const notifyAuthSuccess = (data) => {
    const callback = onLoginSuccess || onLogin;
    if (callback) callback(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (isRegister && !STRONG_PASSWORD_REGEX.test(password)) {
      setErrorMsg(
        'La contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y símbolo (@$!%*?&#._-).'
      );
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        const cleanPhone = telefono.replace(/\D/g, '');
        const fullPhone = cleanPhone ? `${countryCode}${cleanPhone}` : '';

        const data = await authApi.register({
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          email: email.trim(),
          password,
          telefono: fullPhone,
        });
        notifyAuthSuccess(data);
      } else {
        const data = await authApi.login(email.trim(), password);
        notifyAuthSuccess(data);
      }
    } catch (error) {
      setErrorMsg(error.message || 'Credenciales incorrectas o error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) return;
    setRecoveryLoading(true);
    setRecoveryError('');
    try {
      const res = await authApi.recuperarPassword(recoveryEmail.trim());
      setRecoveryMsg(res?.mensaje || 'Código enviado a tu correo y WhatsApp.');
      setRecoveryStep(2);
    } catch (error) {
      setRecoveryError(error.message || 'No se pudo procesar la solicitud.');
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setRecoveryError('');
    if (!STRONG_PASSWORD_REGEX.test(recoveryNewPass)) {
      setRecoveryError(
        'Mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo (@$!%*?&#._-).'
      );
      return;
    }
    setRecoveryLoading(true);
    try {
      const res = await authApi.restablecerPassword(
        recoveryEmail.trim(),
        recoveryCode.trim(),
        recoveryNewPass
      );
      setSuccessMsg(res?.mensaje || 'Contraseña actualizada. Ya puedes iniciar sesión.');
      setForgotOpen(false);
      setRecoveryStep(1);
      setRecoveryCode('');
      setRecoveryNewPass('');
      setRecoveryEmail('');
    } catch (error) {
      setRecoveryError(error.message || 'Código inválido o expirado.');
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0F172A] text-[#F8FAFC]">
{/* Panel izquierdo decorativo con estadio + animación de gol en la escuadra */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0B1120] border-r border-white/8 p-12 flex-col justify-between">
        {/* Imagen de estadio de fondo */}
        <img
          src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1600&q=80"
          alt="Estadio de fútbol iluminado"
          className="absolute inset-0 w-full h-full object-cover opacity-35 scale-105"
        />

        {/* Gradientes oscuros para mantener contraste */}
        <div className="absolute inset-0 bg-linear-to-t from-[#0F172A] via-[#0F172A]/70 to-[#0B1120]/60 pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#10B981]/15 blur-[120px] pointer-events-none" />

        {/* Animación Canvas: disparo con comba a la escuadra + red ondeando en loop */}
        <GoalAnimationCanvas />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#10B981]/15 border border-[#10B981]/40 flex items-center justify-center text-[#10B981] shadow-lg shadow-[#10B981]/15 backdrop-blur-md">
            <Trophy className="w-6 h-6" />
          </div>
          <span className="font-display text-2xl font-extrabold tracking-tight text-white">
            Pronostika
          </span>
        </div>

        <div className="relative z-10 max-w-md space-y-5 mt-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/15 border border-[#10B981]/35 text-[#10B981] text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <ShieldCheck className="w-3.5 h-3.5" />
            Plataforma de Análisis Deportivo
          </div>
          <h1 className="font-display text-4xl font-extrabold text-white leading-tight drop-shadow-md">
            Pronósticos inteligentes y quinielas en tiempo real.
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Consulta probabilidades impulsadas por datos, sigue tus ligas favoritas y compite en
            el ranking de analistas cada jornada.
          </p>
        </div>

        <p className="relative z-10 text-xs text-slate-400">
          © 2026 Pronostika · Temporada 2026/27
        </p>
      </div>

      {/* Panel derecho: Formulario */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-6">
          {/* Logo móvil */}
          <div className="flex lg:hidden items-center justify-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 border border-[#10B981]/40 flex items-center justify-center text-[#10B981]">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="font-display text-2xl font-extrabold text-white">Pronostika</span>
          </div>

          <div className="glass-panel rounded-3xl p-7 sm:p-8 shadow-2xl">
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold text-white">
                {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
              </h2>
              <p className="text-xs text-[#94A3B8] mt-1">
                {isRegister
                  ? 'Regístrate para guardar tus pronósticos y recibir alertas.'
                  : 'Ingresa tus credenciales para acceder al panel.'}
              </p>
            </div>

            {/* Selector Login / Registro */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-[#0F172A]/80 border border-white/8 mb-6">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setErrorMsg('');
                }}
                className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  !isRegister
                    ? 'bg-[#10B981] text-slate-950 shadow-sm'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setErrorMsg('');
                }}
                className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  isRegister
                    ? 'bg-[#10B981] text-slate-950 shadow-sm'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Crear cuenta
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                        Nombre
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          placeholder="Carlos"
                          value={nombre}
                          onChange={(e) => setNombre(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-[#334155] text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#10B981]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                        Apellido
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Alemán"
                        value={apellido}
                        onChange={(e) => setApellido(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-[#334155] text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#10B981]"
                      />
                    </div>
                  </div>

                  {/* Selector de lada con banderas + Teléfono */}
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                      Teléfono (WhatsApp)
                    </label>
                    <div className="flex rounded-xl overflow-hidden border border-[#334155] focus-within:border-[#10B981] bg-[#0F172A] transition">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        aria-label="Código de país"
                        className="bg-[#1E293B] text-white text-xs font-semibold px-2.5 py-2.5 border-r border-[#334155] focus:outline-none cursor-pointer"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option
                            key={c.code}
                            value={c.code}
                            className="bg-[#0F172A] text-white"
                          >
                            {c.flag} {c.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        placeholder="951 123 4567"
                        value={telefono}
                        onChange={(e) =>
                          setTelefono(e.target.value.replace(/[^\d\s-]/g, ''))
                        }
                        className="flex-1 px-3.5 py-2.5 bg-transparent text-white text-sm placeholder-slate-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-[#334155] text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#10B981]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-[#94A3B8]">
                    Contraseña
                  </label>
                  {!isRegister && (
                    <button
                      type="button"
                      onClick={() => {
                        setForgotOpen(true);
                        setRecoveryStep(1);
                        setRecoveryError('');
                        setRecoveryEmail(email);
                      }}
                      className="text-xs font-semibold text-[#10B981] hover:underline cursor-pointer"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0F172A] border border-[#334155] text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#10B981]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#10B981] hover:bg-[#059669] text-slate-950 font-bold text-sm transition shadow-lg shadow-[#10B981]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <span>
                  {loading
                    ? 'Procesando...'
                    : isRegister
                    ? 'Crear mi cuenta'
                    : 'Entrar a Pronostika'}
                </span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Modal de Recuperación de Contraseña (2 pasos) */}
      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#1E293B] border border-[#334155] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-base font-bold text-white">
                {recoveryStep === 1 ? 'Recuperar contraseña' : 'Ingresa tu código'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setForgotOpen(false);
                  setRecoveryStep(1);
                  setRecoveryError('');
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {recoveryError && (
              <div className="mb-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {recoveryError}
              </div>
            )}

            {recoveryStep === 1 ? (
              <form onSubmit={handleRecoverySubmit} className="space-y-3">
                <p className="text-xs text-[#94A3B8]">
                  Ingresa tu correo registrado. Te enviaremos un código de 6 dígitos por correo y
                  WhatsApp.
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
                  {recoveryLoading ? 'Enviando código...' : 'Enviar código de seguridad'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
                <p className="text-xs text-[#10B981]">{recoveryMsg}</p>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="Código de 6 dígitos"
                  value={recoveryCode}
                  onChange={(e) => setRecoveryCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-[#334155] text-white text-sm tracking-widest text-center font-bold focus:outline-none focus:border-[#10B981]"
                />
                <input
                  type="password"
                  required
                  placeholder="Nueva contraseña segura"
                  value={recoveryNewPass}
                  onChange={(e) => setRecoveryNewPass(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-[#334155] text-white text-sm focus:outline-none focus:border-[#10B981]"
                />
                <button
                  type="submit"
                  disabled={recoveryLoading}
                  className="w-full py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-slate-950 font-bold text-sm cursor-pointer disabled:opacity-60"
                >
                  {recoveryLoading ? 'Actualizando...' : 'Cambiar contraseña'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}