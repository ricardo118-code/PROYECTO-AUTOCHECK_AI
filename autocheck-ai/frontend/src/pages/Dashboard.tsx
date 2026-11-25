import React, { useState, useEffect, useRef, useMemo } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Car,
  PlusCircle,
  Clock,
  FileText,
  Users,
  ChevronRight,
  LogOut,
  User,
  Mail,
  Lock,
  Pencil,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck
} from 'lucide-react';

import { NotificationBell } from '../components/NotificationBell';
import { ThemeToggle } from '../components/ThemeToggle';

interface DashboardProps {
  onNavigate: (page: string, params?: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user, logout, isAdmin, updateUser, refreshProfile } = useAuth();

  const [mostrarModalPerfil, setMostrarModalPerfil] = useState(false);
  const timeoutPerfilRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contenedorPerfilRef = useRef<HTMLDivElement>(null);
  const [nombreCompleto, setNombreCompleto] = useState(user?.nombre_completo || '');
  const [email, setEmail] = useState(user?.email || '');
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNuevo, setPasswordNuevo] = useState('');
  const [showPasswordActual, setShowPasswordActual] = useState(false);
  const [showPasswordNuevo, setShowPasswordNuevo] = useState(false);
  const [cambiarClave, setCambiarClave] = useState(false);
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [errorPerfil, setErrorPerfil] = useState('');

  useEffect(() => {
    if (user) {
      setNombreCompleto(user.nombre_completo || '');
      setEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (timeoutPerfilRef.current) {
        clearTimeout(timeoutPerfilRef.current);
      }
    };
  }, []);

  const iniciales = user?.nombre_completo
    ? user.nombre_completo.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'US';

  const esPropietario = user?.rol === 'PROPIETARIO';
  const esOperador = user?.rol === 'OPERADOR';
  const esAdmin = user?.rol === 'ADMINISTRADOR';

  const saludo = useMemo(() => {
    const nombre = user?.nombre_completo ? user.nombre_completo.split(' ')[0] : 'Usuario';
    const esReingreso = sessionStorage.getItem('autocheck_reingreso_reciente') === 'true';
    if (esReingreso) return `¡Hola de nuevo, ${nombre}!`;

    const esNuevo = sessionStorage.getItem('autocheck_usuario_nuevo') === 'true' || (
      (user as any)?.total_inspecciones_realizadas === 0 &&
      (user as any)?.total_vehiculos === 0 &&
      (user as any)?.fecha_creacion &&
      (Date.now() - new Date((user as any).fecha_creacion).getTime() < 24 * 60 * 60 * 1000)
    );
    if (esNuevo) return `¡Bienvenido a AutoCheck AI, ${nombre}!`;

    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) return `Buenos días, ${nombre}`;
    if (hora >= 12 && hora < 19) return `Buenas tardes, ${nombre}`;
    return `Buenas noches, ${nombre}`;
  }, [user]);

  const resetearCamposPerfil = () => {
    setNombreCompleto(user?.nombre_completo || '');
    setEmail(user?.email || '');
    setPasswordActual('');
    setPasswordNuevo('');
    setShowPasswordActual(false);
    setShowPasswordNuevo(false);
    setCambiarClave(false);
    setErrorPerfil('');
    setMensajeExito('');
  };

  const abrirPerfil = async () => {
    resetearCamposPerfil();
    setMostrarModalPerfil(true);

    const freshUser = await refreshProfile();
    if (freshUser) {
      setNombreCompleto(freshUser.nombre_completo || '');
      setEmail(freshUser.email || '');
    }
  };

  const cerrarPerfil = () => {
    if (timeoutPerfilRef.current) {
      clearTimeout(timeoutPerfilRef.current);
      timeoutPerfilRef.current = null;
    }
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setMostrarModalPerfil(false);
    resetearCamposPerfil();
  };

  const handlePerfilMouseEnter = () => {
    if (timeoutPerfilRef.current) {
      clearTimeout(timeoutPerfilRef.current);
      timeoutPerfilRef.current = null;
    }
    if (!mostrarModalPerfil) {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      resetearCamposPerfil();
      setMostrarModalPerfil(true);
    }
  };

  const handlePerfilMouseLeave = () => {
    timeoutPerfilRef.current = setTimeout(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      setMostrarModalPerfil(false);
      resetearCamposPerfil();
    }, 250);
  };

  const handlePerfilClick = () => {
    if (timeoutPerfilRef.current) {
      clearTimeout(timeoutPerfilRef.current);
      timeoutPerfilRef.current = null;
    }
    if (mostrarModalPerfil) {
      cerrarPerfil();
    } else {
      abrirPerfil();
    }
  };

  useEffect(() => {
    const handleClickAfueraPerfil = (event: MouseEvent) => {
      if (
        contenedorPerfilRef.current &&
        !contenedorPerfilRef.current.contains(event.target as Node)
      ) {
        cerrarPerfil();
      }
    };
    if (mostrarModalPerfil) {
      document.addEventListener('mousedown', handleClickAfueraPerfil);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickAfueraPerfil);
    };
  }, [mostrarModalPerfil]);

  const handleGuardarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorPerfil('');
    setMensajeExito('');

    const cleanNombre = nombreCompleto.trim();
    const palabrasNombre = cleanNombre.split(/\s+/).filter(Boolean);
    if (palabrasNombre.length < 2) {
      setErrorPerfil('Por favor ingresa tus nombres y apellidos completos (ej. Juan Pérez).');
      return;
    }

    if (palabrasNombre.some((p) => p.length < 2)) {
      setErrorPerfil('Cada nombre y apellido debe contener al menos 2 letras.');
      return;
    }

    const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'-]+$/;
    if (!nombreRegex.test(cleanNombre)) {
      setErrorPerfil('El nombre solo puede contener letras y espacios (sin números ni símbolos).');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorPerfil('Por favor ingresa un correo electrónico válido.');
      return;
    }

    if (cambiarClave) {
      if (!passwordActual) {
        setErrorPerfil('Debes ingresar tu contraseña actual.');
        return;
      }
      if (!passwordNuevo || passwordNuevo.length < 6) {
        setErrorPerfil('La nueva contraseña debe tener al menos 6 caracteres.');
        return;
      }
    }

    setGuardandoPerfil(true);
    try {
      const payload: any = {
        nombre_completo: nombreCompleto.trim(),
        email: email.trim().toLowerCase(),
      };
      if (cambiarClave && passwordNuevo) {
        payload.password_actual = passwordActual;
        payload.password_nuevo = passwordNuevo;
      }

      const res = await api.patch('/auth/perfil/', payload);
      if (res.data?.usuario) {
        updateUser(res.data.usuario);
      }
      setMensajeExito('¡Perfil actualizado exitosamente!');
      setPasswordActual('');
      setPasswordNuevo('');
      setCambiarClave(false);
      setTimeout(() => {
        cerrarPerfil();
        setMensajeExito('');
      }, 1200);
    } catch (err: any) {
      const msg =
        err.response?.data?.nombre_completo?.[0] ||
        err.response?.data?.email?.[0] ||
        err.response?.data?.password_actual?.[0] ||
        err.response?.data?.password_nuevo?.[0] ||
        err.response?.data?.detail ||
        'Error al actualizar el perfil. Revisa los datos.';
      setErrorPerfil(msg);
    } finally {
      setGuardandoPerfil(false);
    }
  };

  const menuItems: any[] = [];

  menuItems.push({
    id: 'vehicles',
    titulo: esPropietario ? 'Mis vehículos' : 'Catálogo vehicular',
    descripcion: esPropietario ? 'Ver mis unidades registradas' : 'Ver y gestionar unidades del catálogo',
    icono: Car,
    color: 'text-blue-500 bg-blue-50',
  });

  if (!esPropietario) {
    menuItems.push({
      id: 'new_inspection',
      titulo: 'Nueva inspección',
      descripcion: 'Escanear vehículo con Inteligencia Artificial',
      icono: PlusCircle,
      color: 'text-brand-600 bg-brand-50',
    });
  }

  menuItems.push({
    id: 'history',
    titulo: 'Historial',
    descripcion: esPropietario ? 'Consultar revisiones y daños de mis autos' : 'Revisiones previas y comparación',
    icono: Clock,
    color: 'text-indigo-500 bg-indigo-50',
  });

  if (isAdmin) {
    menuItems.push({
      id: 'reports',
      titulo: 'Reportes',
      descripcion: 'Generación de informes técnicos y comparativas en PDF',
      icono: FileText,
      color: 'text-teal-500 bg-teal-50',
    });
  }

  if (isAdmin) {
    menuItems.push({
      id: 'users',
      titulo: 'Usuarios y roles',
      descripcion: 'Gestión de permisos y desbloqueo',
      icono: Users,
      color: 'text-violet-500 bg-violet-50',
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12 transition-colors duration-200">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-3.5 transition-colors duration-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-slate-900 dark:bg-slate-800/90 border border-slate-200/20 dark:border-slate-700/80 rounded-xl flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-4.5 h-4.5 text-brand-500" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">AutoCheck AI</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationBell onNavigate={onNavigate} />

            <ThemeToggle />

            <button
              onClick={logout}
              title="Cerrar sesión"
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl shadow-slate-900/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="relative"
              ref={contenedorPerfilRef}
              onMouseEnter={handlePerfilMouseEnter}
              onMouseLeave={handlePerfilMouseLeave}
            >
              <button
                onClick={handlePerfilClick}
                title="Mi perfil (ver y editar)"
                className="w-14 h-14 bg-brand-600 hover:bg-brand-500 active:scale-95 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md hover:ring-4 hover:ring-brand-500/30 transition-all cursor-pointer relative group shrink-0"
              >
                {iniciales}
                <span className="absolute bottom-0 right-0 w-5 h-5 bg-white text-slate-800 rounded-full flex items-center justify-center shadow-xs text-[10px] group-hover:scale-110 transition-transform">
                  <Pencil className="w-2.5 h-2.5 text-brand-600" />
                </span>
              </button>

              <div
                className={`fixed inset-0 bg-slate-900/20 sm:hidden z-40 transition-opacity ease-out ${
                  mostrarModalPerfil
                    ? 'opacity-100 pointer-events-auto duration-[350ms]'
                    : 'opacity-0 pointer-events-none duration-500'
                }`}
                onClick={cerrarPerfil}
              />
              <div
                className={`fixed left-3 right-3 top-24 sm:absolute sm:left-0 sm:right-auto sm:top-full sm:pt-2 sm:w-[440px] z-50 ${
                  mostrarModalPerfil ? 'pointer-events-auto' : 'pointer-events-none'
                }`}
              >
                <div
                  className={`bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl p-6 space-y-4 max-h-[calc(100vh-100px)] overflow-y-auto transform-gpu transition-all ease-out ${
                    mostrarModalPerfil
                      ? 'opacity-100 translate-y-0 duration-[350ms]'
                      : 'opacity-0 translate-y-2.5 duration-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-brand-600 text-white rounded-full flex items-center justify-center font-bold text-base shadow-sm">
                        {iniciales}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Mi Perfil</h3>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {user?.rol_display || user?.rol || 'Usuario'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {errorPerfil && (
                    <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                      <span>{errorPerfil}</span>
                    </div>
                  )}

                  {mensajeExito && (
                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>{mensajeExito}</span>
                    </div>
                  )}

                  <form onSubmit={handleGuardarPerfil} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Nombre completo
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={nombreCompleto}
                          onChange={(e) => setNombreCompleto(e.target.value)}
                          placeholder="Tu nombre completo"
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-600 transition-all font-medium bg-white dark:bg-slate-800"
                        />
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Correo electrónico
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="tu_correo@autocheck.com"
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-600 transition-all lowercase bg-white dark:bg-slate-800"
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          const nuevoEstado = !cambiarClave;
                          setCambiarClave(nuevoEstado);
                          if (!nuevoEstado) {
                            setPasswordActual('');
                            setPasswordNuevo('');
                            setShowPasswordActual(false);
                            setShowPasswordNuevo(false);
                            setErrorPerfil('');
                          }
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <KeyRound className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                          ¿Deseas cambiar tu contraseña?
                        </span>
                        <span className="text-brand-600 dark:text-brand-400 font-bold">{cambiarClave ? 'Ocultar' : 'Cambiar'}</span>
                      </button>

                      {cambiarClave && (
                        <div className="space-y-3 mt-3 p-3 bg-slate-50/70 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                              Contraseña actual
                            </label>
                            <div className="relative">
                              <input
                                type={showPasswordActual ? 'text' : 'password'}
                                value={passwordActual}
                                onChange={(e) => setPasswordActual(e.target.value)}
                                placeholder="Tu clave actual"
                                className="w-full pl-10 pr-10 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-600 bg-white dark:bg-slate-800"
                              />
                              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                              <button
                                type="button"
                                onClick={() => setShowPasswordActual(!showPasswordActual)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                                title={showPasswordActual ? 'Ocultar contraseña' : 'Ver contraseña'}
                              >
                                {showPasswordActual ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                              Nueva contraseña (mínimo 6 caracteres)
                            </label>
                            <div className="relative">
                              <input
                                type={showPasswordNuevo ? 'text' : 'password'}
                                value={passwordNuevo}
                                onChange={(e) => setPasswordNuevo(e.target.value)}
                                placeholder="Tu nueva clave segura"
                                className="w-full pl-10 pr-10 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-600 bg-white dark:bg-slate-800"
                              />
                              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                              <button
                                type="button"
                                onClick={() => setShowPasswordNuevo(!showPasswordNuevo)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                                title={showPasswordNuevo ? 'Ocultar contraseña' : 'Ver contraseña'}
                              >
                                {showPasswordNuevo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={cerrarPerfil}
                        className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={guardandoPerfil}
                        className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-60"
                      >
                        {guardandoPerfil ? 'Guardando...' : 'Guardar cambios'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                {saludo}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="inline-block px-3 py-0.5 rounded-full bg-slate-800 text-xs text-slate-300 font-medium border border-slate-700">
                  {user?.rol_display || user?.rol || 'Usuario'}
                </span>
                <span className="text-xs text-slate-400">
                  {esPropietario
                    ? 'Monitoreo y consulta de mis vehículos registrados'
                    : esOperador
                    ? 'Flujo operativo de inspección técnica vehicular'
                    : 'Panel de administración general'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4 px-1">
            Accesos directos
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item) => {
              const Icon = item.icono;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'new_inspection' || item.id === 'upload_photos') {
                      sessionStorage.removeItem('autocheck_upload_vehiculo');
                      onNavigate('upload_photos', { vehiculo: null });
                      return;
                    }
                    if (item.id === 'history' || item.id === 'inspection_history') {
                      sessionStorage.removeItem('autocheck_history_vehiculo');
                      onNavigate('history', { vehiculo: null });
                      return;
                    }
                    if (item.id === 'reports' || item.id === 'generate_report') {
                      sessionStorage.removeItem('autocheck_report_vehiculo');
                      onNavigate('reports', { vehiculo: null });
                      return;
                    }
                    onNavigate(item.id);
                  }}
                  className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-left flex items-center justify-between transition-all hover:border-brand-500 hover:ring-2 hover:ring-brand-500/20 hover:shadow-md cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.color} group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white text-base group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {item.titulo}
                      </h4>
                      <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{item.descripcion}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-brand-600 dark:group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};
