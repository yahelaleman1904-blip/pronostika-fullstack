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
  Check,
} from 'lucide-react';
import { authApi } from '../services/api';
import GoalAnimationCanvas from '../components/GoalAnimationCanvas';

const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#._-]).{8,}$/;

const COUNTRY_CODES = [
  { code: '+52', label: 'MX (+52)' },
  { code: '+1', label: 'US/CA (+1)' },
  { code: '+34', label: 'ES (+34)' },
  { code: '+57', label: 'CO (+57)' },
  { code: '+54', label: 'AR (+54)' },
  { code: '+56', label: 'CL (+56)' },
  { code: '+51', label: 'PE (+51)' },
  { code: '+593', label: 'EC (+593)' },
  { code: '+502', label: 'GT (+502)' },
  { code: '+58', label: 'VE (+58)' },
];

const STRENGTH_LEVELS = [
  null,
  { label: 'Te van a hackear', barColor: 'bg-red-500', textColor: 'text-red-400' },
  { label: 'Va mejorando', barColor: 'bg-orange-500', textColor: 'text-orange-400' },
  { label: 'Es buena', barColor: 'bg-amber-400', textColor: 'text-amber-300' },
  { label: 'Esta sí está mejor', barColor: 'bg-lime-400', textColor: 'text-lime-300' },
  { label: 'Invulnerable', barColor: 'bg-[#10B981]', textColor: 'text-[#10B981]' },
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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal de verificación de correo en registro (Anti-Bot)
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Modal de recuperación de contraseña (2 pasos)
  const [forgotOpen, setForgotOpen] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState(1);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [recoveryNewPass, setRecoveryNewPass] = useState('');
  const [recoveryMsg, setRecoveryMsg] = useState('');
  const [recoveryError, setRecoveryError] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  // Validaciones en tiempo real de contraseña
  const passwordChecks = [
    { key: 'length', label: 'Mínimo 8 elementos', valid: password.length >= 8 },
    { key: 'upper', label: 'Mayúsculas (A-Z)', valid: /[A-Z]/.test(password) },
    { key: 'lower', label: 'Minúsculas (a-z)', valid: /[a-z]/.test(password) },
    { key: 'number', label: 'Números (0-9)', valid: /\d/.test(password) },
    {
      key: 'special',
      label: 'Caracteres especiales (@$!%*?&#._-)',
      valid: /[@$!%*?&#._-]/.test(password),
    },
  ];

  const strengthScore = passwordChecks.filter((item) => item.valid).length;
  const currentStrength =
    password.length === 0 ? null : STRENGTH_LEVELS[Math.max(1, strengthScore)];
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  const notifyAuthSuccess = (data) => {
    const callback = onLoginSuccess || onLogin;
    if (callback) callback(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (isRegister) {
      if (!STRONG_PASSWORD_REGEX.test(password)) {
        setErrorMsg(
          'Tu contraseña debe cumplir todos los requisitos obligatorios.'
        );
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Las contraseñas no coinciden. Verifica e intenta de nuevo.');
        return;
      }
    }

    setLoading(true);
    try {
      if (isRegister) {
        await authApi.enviarCodigoEmail(email.trim(), nombre.trim());
        setVerifyCode('');
        setVerifyError('');
        setVerifyModalOpen(true);
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

  const handleVerifyEmailAndRegister = async (e) => {
    e.preventDefault();
    setVerifyError('');
    setVerifyLoading(true);
    try {
      await authApi.verificarCodigoEmail(email.trim(), verifyCode.trim());
      const cleanPhone = telefono.replace(/\D/g, '');
      const fullPhone = cleanPhone ? `${countryCode}${cleanPhone}` : '';

      const data = await authApi.register({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim(),
        password,
        telefono: fullPhone,
      });
      setVerifyModalOpen(false);
      notifyAuthSuccess(data);
    } catch (error) {
      setVerifyError(error.message || 'Código inválido.');
    } finally {
      setVerifyLoading(false);
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
      {/* Panel izquierdo decorativo con estadio + escuadra 3D + difuminación */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0F172A] p-12 flex-col justify-between">
        <img
          src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1600&q=80"
          alt="Estadio de fútbol iluminado"
          className="absolute inset-0 w-full h-full object-cover opacity-35 scale-105"
        />

        <div className="absolute inset-0 bg-linear-to-t from-[#0F172A] via-[#0F172A]/70 to-[#0B1120]/60 pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#10B981]/15 blur-[120px] pointer-events-none" />

        <GoalAnimationCanvas />

        {/* Difuminación suave hacia el panel derecho */}
        <div className="absolute inset-y-0 right-0 w-44 bg-linear-to-r from-transparent via-[#0F172A]/75 to-[#0F172A] pointer-events-none z-5" />

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
                  setConfirmPassword('');
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

                  {/* Selector de lada limpio + Teléfono */}
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                      Teléfono (WhatsApp)
                    </label>
                    <div className="flex rounded-xl overflow-hidden border border-[#334155] focus-within:border-[#10B981] bg-[#0F172A] transition">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        aria-label="Código de país"
                        className="bg-[#1E293B] text-white text-xs font-semibold px-3 py-2.5 border-r border-[#334155] focus:outline-none cursor-pointer"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option
                            key={c.code}
                            value={c.code}
                            className="bg-[#0F172A] text-white"
                          >
                            {c.label}
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

                {/* Medidor de seguridad + Checklist (solo en Crear cuenta) */}
                {isRegister && (
                  <div className="mt-3 p-3.5 rounded-xl bg-[#0F172A]/85 border border-white/8 space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#94A3B8] font-medium">
                          Seguridad de la contraseña
                        </span>
                        <span
                          className={`font-bold ${
                            currentStrength ? currentStrength.textColor : 'text-slate-500'
                          }`}
                        >
                          {currentStrength ? currentStrength.label : 'Sin contraseña'}
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5">
                        {[1, 2, 3, 4, 5].map((level) => {
                          const active = password.length > 0 && level <= Math.max(1, strengthScore);
                          return (
                            <div
                              key={level}
                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                active && currentStrength
                                  ? currentStrength.barColor
                                  : 'bg-slate-800'
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>

                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                      {passwordChecks.map((req) => (
                        <li
                          key={req.key}
                          className={`flex items-center gap-1.5 transition-colors ${
                            req.valid ? 'text-[#10B981]' : 'text-slate-400'
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center border shrink-0 ${
                              req.valid
                                ? 'bg-[#10B981]/15 border-[#10B981]/40 text-[#10B981]'
                                : 'border-slate-700 text-slate-600'
                            }`}
                          >
                            <Check className="w-2.5 h-2.5" />
                          </span>
                          <span>{req.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Confirmar contraseña (solo en Crear cuenta) */}
              {isRegister && (
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                    Repetir contraseña
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Repite tu contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0F172A] border text-white text-sm placeholder-slate-500 focus:outline-none transition ${
                        passwordsMismatch
                          ? 'border-red-500/70 focus:border-red-500'
                          : passwordsMatch
                          ? 'border-[#10B981]/70 focus:border-[#10B981]'
                          : 'border-[#334155] focus:border-[#10B981]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {passwordsMismatch && (
                    <p className="text-[11px] text-red-400 mt-1.5">
                      Las contraseñas no coinciden.
                    </p>
                  )}
                  {passwordsMatch && (
                    <p className="text-[11px] text-[#10B981] mt-1.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Las contraseñas coinciden.
                    </p>
                  )}
                </div>
              )}

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

      {/* Modal de Verificación de Correo (Anti-Bot) */}
      {verifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#1E293B] border border-[#334155] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-base font-bold text-white">
                Verifica tu correo
              </h3>
              <button
                type="button"
                onClick={() => setVerifyModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {verifyError && (
              <div className="mb-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {verifyError}
              </div>
            )}

            <form onSubmit={handleVerifyEmailAndRegister} className="space-y-3">
              <p className="text-xs text-[#94A3B8]">
                Enviamos un código de 6 dígitos a{' '}
                <strong className="text-white">{email.trim()}</strong>. Ingrésalo para confirmar
                tu cuenta y continuar.
              </p>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="000000"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-[#334155] text-white text-base tracking-[0.35em] text-center font-bold focus:outline-none focus:border-[#10B981]"
              />
              <button
                type="submit"
                disabled={verifyLoading || verifyCode.length < 6}
                className="w-full py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-slate-950 font-bold text-sm cursor-pointer disabled:opacity-60"
              >
                {verifyLoading ? 'Verificando...' : 'Confirmar código y registrarme'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}