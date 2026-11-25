import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, User, Mail, Lock, CheckCircle2, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

interface RegisterUserProps {
  onNavigate: (page: string, params?: any) => void;
  from?: string;
  onBack?: () => void;
}

export const RegisterUser: React.FC<RegisterUserProps> = ({ onNavigate, from, onBack }) => {
  const { user, register, isAdmin } = useAuth();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rol, setRol] = useState<'PROPIETARIO' | 'OPERADOR' | 'ADMINISTRADOR'>('PROPIETARIO');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  const esUsuarioConectado = !!user;

  const handleVolver = () => {
    if (esUsuarioConectado) {
      if (onBack) {
        onBack();
      } else if (from && from !== 'login' && from !== 'register') {
        onNavigate(from);
      } else if (isAdmin) {
        onNavigate('users');
      } else {
        onNavigate('dashboard');
      }
    } else {
      onNavigate('login');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);

    const cleanNombre = nombre.trim();
    const cleanEmail = email.trim().toLowerCase();

    const palabrasNombre = cleanNombre.split(/\s+/).filter(Boolean);
    if (palabrasNombre.length < 2) {
      setMensaje({
        tipo: 'error',
        texto: 'Por favor ingresa tus nombres y apellidos completos (ej. Juan Pérez).'
      });
      return;
    }

    if (palabrasNombre.some((p) => p.length < 2)) {
      setMensaje({
        tipo: 'error',
        texto: 'Cada nombre y apellido debe contener al menos 2 letras.'
      });
      return;
    }

    const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'-]+$/;
    if (!nombreRegex.test(cleanNombre)) {
      setMensaje({
        tipo: 'error',
        texto: 'El nombre solo puede contener letras y espacios (sin números ni símbolos).'
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setMensaje({ tipo: 'error', texto: 'Ingresa un correo electrónico válido (ejemplo: usuario@autocheck.ai).' });
      return;
    }

    if (password.length < 6) {
      setMensaje({ tipo: 'error', texto: 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }

    if (password !== confirmPassword) {
      setMensaje({ tipo: 'error', texto: 'Las contraseñas no coinciden. Por favor, verifícalas.' });
      return;
    }

    const rolFinal = isAdmin ? rol : 'PROPIETARIO';
    setLoading(true);

    try {
      await register(cleanNombre, cleanEmail, password, rolFinal);
      setMensaje({
        tipo: 'exito',
        texto: esUsuarioConectado
          ? '¡Usuario creado exitosamente y registrado en el sistema!'
          : '¡Cuenta registrada con éxito! Ya puedes iniciar sesión con tus credenciales.'
      });
      setTimeout(() => {
        handleVolver();
      }, 1400);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.email?.[0] ||
        err.response?.data?.nombre_completo?.[0] ||
        err.response?.data?.password?.[0] ||
        err.response?.data?.detail ||
        'Error al registrar el usuario.';
      setMensaje({ tipo: 'error', texto: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center px-4 py-8 relative transition-colors">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none p-6 md:p-8 border border-slate-100 dark:border-slate-800 transition-colors">
        <div className="mb-6">
          <button
            onClick={handleVolver}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-sm font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver</span>
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Registro de usuario</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Completa los datos para crear una cuenta en la plataforma.
          </p>
        </div>

        {mensaje && (
          <div
            className={`mb-6 p-4 rounded-2xl text-sm flex items-start gap-3 ${
              mensaje.tipo === 'exito'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
            }`}
          >
            {mensaje.tipo === 'exito' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500 dark:text-red-400 mt-0.5" />
            )}
            <span>{mensaje.texto}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Nombre completo
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  if (mensaje?.tipo === 'error') setMensaje(null);
                }}
                placeholder="María Delgado"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-600 transition-all text-sm"
              />
              <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Correo electrónico
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (mensaje?.tipo === 'error') setMensaje(null);
                }}
                placeholder="m.delgado@autocheck.ai"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-600 transition-all text-sm"
              />
              <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (mensaje?.tipo === 'error') setMensaje(null);
                }}
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-11 pr-11 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-600 transition-all text-sm"
              />
              <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Confirmar contraseña
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (mensaje?.tipo === 'error') setMensaje(null);
                }}
                placeholder="Repite la contraseña"
                className="w-full pl-11 pr-11 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-600 transition-all text-sm"
              />
              <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {confirmPassword && (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium">
                {password === confirmPassword ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Las contraseñas coinciden
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Las contraseñas no coinciden aún
                  </span>
                )}
              </div>
            )}
          </div>

          {isAdmin ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Rol de usuario
              </label>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700">
                {(['PROPIETARIO', 'OPERADOR', 'ADMINISTRADOR'] as const).map((r) => {
                  const label = r === 'PROPIETARIO' ? 'Propietario' : r === 'OPERADOR' ? 'Operador' : 'Administrador';
                  const selected = rol === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRol(r)}
                      className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                        selected
                          ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-2xl flex items-center gap-2.5 text-slate-700 dark:text-slate-300 text-xs">
              <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
              <span>Rol asignado: <strong>Propietario de vehículos</strong></span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white font-semibold rounded-2xl shadow-lg shadow-brand-600/30 transition-all disabled:opacity-60 cursor-pointer mt-4"
          >
            {loading ? 'Registrando...' : 'Registrar usuario'}
          </button>
        </form>
      </div>
    </div>
  );
};
