import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Moon,
  RefreshCw,
  ShieldCheck,
  Sun,
} from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  User,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { DOMAIN_IMAGES } from '../data/initialData';
import { BusinessType } from '../types/credit';
import { RegistrationExtras } from '../services/firestoreService';

interface AuthScreenProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onEnterDemoMode: () => void;
  onRegisterSuccess: (user: User, extras: RegistrationExtras) => Promise<void>;
  verificationUser?: User | null;
  onRefreshVerification?: () => Promise<void>;
  onSignOut?: () => Promise<void>;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  isDark,
  onToggleTheme,
  onEnterDemoMode,
  onRegisterSuccess,
  verificationUser,
  onRefreshVerification,
  onSignOut,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Extra Registration fields
  const [fullName, setFullName] = useState('');
  const [dni, setDni] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>(BusinessType.BODEGA);
  const [zone, setZone] = useState('Barinas · Zona Centro');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const mapFirebaseError = (code: string, message: string): string => {
    switch (code) {
      case 'auth/operation-not-allowed':
        return 'El acceso con correo y contraseña aún no está habilitado en Firebase Console. Usa "Continuar con Google" o habilita Correo/Contraseña en Authentication > Sign-in method.';
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Correo o contraseña incorrectos. Verifica tus datos.';
      case 'auth/email-already-in-use':
        return 'Ya existe una cuenta registrada con ese correo electrónico.';
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres.';
      case 'auth/invalid-email':
        return 'Ingresa un correo electrónico válido.';
      case 'auth/popup-closed-by-user':
        return 'Cerraste la ventana de Google antes de completar el acceso.';
      default:
        return message || 'No se pudo completar la autenticación.';
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await onRegisterSuccess(cred.user, {});
    } catch (err: unknown) {
      const fbErr = err as { code?: string; message?: string };
      setErrorMsg(mapFirebaseError(fbErr.code || '', fbErr.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Ingresa tu correo y contraseña para continuar.');
      return;
    }

    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      await onRegisterSuccess(cred.user, {});
    } catch (err: unknown) {
      const fbErr = err as { code?: string; message?: string };
      setErrorMsg(mapFirebaseError(fbErr.code || '', fbErr.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!fullName.trim() || !dni.trim() || !businessName.trim() || !phone.trim()) {
      setErrorMsg('Completa tus datos personales y de tu bodega o abasto.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Ingresa un correo electrónico válido.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: fullName.trim() });
      await sendEmailVerification(cred.user);
      await onRegisterSuccess(cred.user, {
        fullName: fullName.trim(),
        dni: dni.trim(),
        businessName: businessName.trim(),
        businessType,
        zone: zone.trim(),
        address: zone.trim(),
        phone: phone.trim(),
      });
    } catch (err: unknown) {
      const fbErr = err as { code?: string; message?: string };
      setErrorMsg(mapFirebaseError(fbErr.code || '', fbErr.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setErrorMsg('');
    setInfoMsg('');
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Escribe tu correo electrónico arriba para enviarte el enlace de recuperación.');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setInfoMsg('Enviamos un enlace de recuperación a tu correo electrónico.');
    } catch (err: unknown) {
      const fbErr = err as { code?: string; message?: string };
      setErrorMsg(mapFirebaseError(fbErr.code || '', fbErr.message || ''));
    } finally {
      setLoading(false);
    }
  };

  if (verificationUser) {
    return (
      <div className="min-h-screen bg-[#F4F7F7] dark:bg-[#080B0B] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#121718] border border-slate-200 dark:border-white/[0.08] space-y-5 text-center shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-500/15 text-teal-600 dark:text-[#00D1C1] flex items-center justify-center mx-auto">
            <Mail className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              Verifica tu correo electrónico
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Enviamos un enlace de confirmación a{' '}
              <strong className="text-slate-800 dark:text-slate-200">
                {verificationUser.email}
              </strong>
              . Ábrelo para activar tu línea de crédito de forma segura.
            </p>
          </div>

          {infoMsg && (
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {infoMsg}
            </p>
          )}
          {errorMsg && (
            <p className="text-xs font-medium text-rose-500">{errorMsg}</p>
          )}

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={onRefreshVerification}
              className="w-full min-h-[48px] rounded-2xl bg-teal-600 dark:bg-[#00D1C1] text-white dark:text-[#041413] font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Ya verifiqué mi correo</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                try {
                  await sendEmailVerification(verificationUser);
                  setInfoMsg('Correo de verificación reenviado.');
                } catch (err: unknown) {
                  const fbErr = err as { code?: string; message?: string };
                  setErrorMsg(mapFirebaseError(fbErr.code || '', fbErr.message || ''));
                }
              }}
              className="w-full min-h-[44px] rounded-2xl border border-slate-200 dark:border-white/[0.1] text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              Reenviar enlace de verificación
            </button>

            <button
              type="button"
              onClick={onSignOut}
              className="w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
            >
              Usar otra cuenta
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F7] dark:bg-[#080B0B] text-slate-900 dark:text-slate-100 flex flex-col justify-center p-4 sm:p-6 lg:p-10 relative">
      {/* Top Bar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between mb-6">
        <span className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-teal-600 dark:text-[#00D1C1]">
          KreceAgro
        </span>

        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Cambiar tema"
          className="min-h-[42px] px-3.5 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#121718] text-xs font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-200 cursor-pointer"
        >
          {isDark ? <Sun className="w-4 h-4 text-teal-400" /> : <Moon className="w-4 h-4" />}
          <span>{isDark ? 'Claro' : 'Oscuro'}</span>
        </button>
      </div>

      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Visual Column on Desktop */}
        <div className="hidden lg:flex lg:col-span-6 rounded-3xl overflow-hidden relative border border-slate-200 dark:border-white/[0.08]">
          <img
            src={DOMAIN_IMAGES.bodega}
            alt="Emprendedora en abasto y bodega con vitrina refrigerada"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15 p-8 flex flex-col justify-end text-white space-y-4">
            <h1 className="font-display text-3xl font-extrabold leading-tight text-balance">
              Abastece tu bodega con crédito avícola y porcícola en minutos
            </h1>
            <p className="text-sm text-slate-200 leading-relaxed max-w-lg">
              Diseñado para bodegueros, abastos, charcuterías y revendedores en zonas de
              alta demanda local. Retira en mataderos aliados y paga en cuotas semanales.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="flex items-center gap-2 text-teal-300 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Líneas desde $250 a $3,500+</span>
              </div>
              <div className="flex items-center gap-2 text-teal-300 font-semibold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Seguro de Cadena de Frío</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Auth Card */}
        <div className="lg:col-span-6 flex items-center">
          <div className="w-full rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#121718] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-6">
            {/* Segmented Switch: Iniciar sesión | Crear cuenta */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-[#0B0F0F] border border-slate-200 dark:border-white/[0.06]">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                  setInfoMsg('');
                }}
                className={`min-h-[44px] rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white dark:bg-[#182122] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg('');
                  setInfoMsg('');
                }}
                className={`min-h-[44px] rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white dark:bg-[#182122] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Crear cuenta
              </button>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                {mode === 'login'
                  ? 'Bienvenido de nuevo'
                  : 'Registra tu bodega o abasto'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {mode === 'login'
                  ? 'Accede a tu línea disponible, despachos QR y próximas cuotas.'
                  : 'Crea tu cuenta comercial para solicitar lotes de pollo y cerdo.'}
              </p>
            </div>

            {errorMsg && (
              <div
                role="alert"
                className="rounded-2xl p-3.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/25 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {infoMsg && (
              <div className="rounded-2xl p-3.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{infoMsg}</span>
              </div>
            )}

            {/* Google Primary OAuth Button */}
            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleAuth}
              className="w-full min-h-[48px] px-4 rounded-2xl border border-slate-200 dark:border-white/[0.14] bg-white dark:bg-[#171E20] hover:bg-slate-50 dark:hover:bg-[#1D2628] text-sm font-bold text-slate-800 dark:text-white flex items-center justify-center gap-3 transition-colors cursor-pointer disabled:opacity-50"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                />
              </svg>
              <span>
                {mode === 'login' ? 'Continuar con Google' : 'Registrarme con Google'}
              </span>
            </button>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <div className="h-px flex-1 bg-slate-200 dark:bg-white/[0.08]" />
              <span>o con tu correo electrónico</span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-white/[0.08]" />
            </div>

            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="auth-login-email"
                    className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
                  >
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="auth-login-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="bodega@correo.com"
                      className="w-full min-h-[46px] pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-[#161C1D] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="auth-login-password"
                      className="text-xs font-semibold text-slate-600 dark:text-slate-300"
                    >
                      Contraseña
                    </label>
                    <button
                      type="button"
                      onClick={handlePasswordReset}
                      className="text-xs font-semibold text-teal-600 dark:text-[#00D1C1] hover:underline cursor-pointer"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="auth-login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full min-h-[46px] pl-10 pr-11 rounded-xl bg-slate-50 dark:bg-[#161C1D] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      aria-label="Mostrar u ocultar contraseña"
                      className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[48px] rounded-2xl bg-teal-600 hover:bg-teal-500 dark:bg-[#00D1C1] dark:hover:bg-[#1EE0D0] text-white dark:text-[#041413] font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <span>{loading ? 'Ingresando...' : 'Iniciar sesión'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="reg-fullname"
                      className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1"
                    >
                      Nombre completo *
                    </label>
                    <input
                      id="reg-fullname"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ej. María Pérez"
                      className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-[#161C1D] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="reg-dni"
                      className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1"
                    >
                      DNI / Cédula *
                    </label>
                    <input
                      id="reg-dni"
                      type="text"
                      required
                      value={dni}
                      onChange={(e) => setDni(e.target.value)}
                      placeholder="Ej. 20.145.889"
                      className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-[#161C1D] border border-slate-200 dark:border-white/[0.1] font-mono text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="reg-bizname"
                      className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1"
                    >
                      Nombre del negocio *
                    </label>
                    <input
                      id="reg-bizname"
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Bodega El Progreso"
                      className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-[#161C1D] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="reg-biztype"
                      className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1"
                    >
                      Tipo de negocio *
                    </label>
                    <select
                      id="reg-biztype"
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                      className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-[#161C1D] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-900 dark:text-white"
                    >
                      {Object.values(BusinessType).map((bt) => (
                        <option key={bt} value={bt}>
                          {bt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="reg-phone"
                      className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1"
                    >
                      Teléfono / WhatsApp *
                    </label>
                    <input
                      id="reg-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+58 414-0000000"
                      className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-[#161C1D] border border-slate-200 dark:border-white/[0.1] font-mono text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="reg-zone"
                      className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1"
                    >
                      Zona de alta demanda *
                    </label>
                    <input
                      id="reg-zone"
                      type="text"
                      required
                      value={zone}
                      onChange={(e) => setZone(e.target.value)}
                      placeholder="Sector / Mercado local"
                      className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-[#161C1D] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="reg-email"
                    className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1"
                  >
                    Correo electrónico *
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="comercio@correo.com"
                    className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-[#161C1D] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="reg-pass"
                      className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1"
                    >
                      Contraseña *
                    </label>
                    <input
                      id="reg-pass"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-[#161C1D] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="reg-pass2"
                      className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1"
                    >
                      Confirmar contraseña *
                    </label>
                    <input
                      id="reg-pass2"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite la contraseña"
                      className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-[#161C1D] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[48px] mt-1 rounded-2xl bg-teal-600 hover:bg-teal-500 dark:bg-[#00D1C1] dark:hover:bg-[#1EE0D0] text-white dark:text-[#041413] font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <span>{loading ? 'Creando cuenta...' : 'Crear cuenta de emprendedor'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                ¿Solo quieres probar la app?
              </span>
              <button
                type="button"
                onClick={onEnterDemoMode}
                className="font-bold text-teal-600 dark:text-[#00D1C1] hover:underline cursor-pointer"
              >
                Explorar modo demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
