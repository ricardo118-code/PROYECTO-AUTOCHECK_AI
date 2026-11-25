import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, User, Edit3, Plus, Lock, Unlock, Mail, Trash2, AlertTriangle, X, Search, Key, Eye, EyeOff } from 'lucide-react';
import { ConfirmModal } from '../components/ConfirmModal';
import { AlertBanner } from '../components/AlertBanner';
import { normalizarTexto } from '../utils/formatters';
import { ThemeToggle } from '../components/ThemeToggle';

interface UsersRolesProps {
  onNavigate: (page: string, params?: any) => void;
  onBack?: () => void;
}

interface UsuarioData {
  id: number;
  nombre_completo: string;
  email: string;
  rol: 'PROPIETARIO' | 'OPERADOR' | 'ADMINISTRADOR';
  rol_display: string;
  bloqueado: boolean;
  total_vehiculos?: number;
  total_inspecciones_vehiculos?: number;
  total_inspecciones_realizadas?: number;
}

export const UsersRoles: React.FC<UsersRolesProps> = ({ onNavigate, onBack }) => {
  const { user: currentUser, updateUser } = useAuth();
  const [usuarios, setUsuarios] = useState<UsuarioData[]>([]);
  const [loading, setLoading] = useState(true);
  const [usuarioEditando, setUsuarioEditando] = useState<UsuarioData | null>(null);
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [nuevoRol, setNuevoRol] = useState<string>('OPERADOR');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState('');
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState<string>('TODOS');

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/usuarios/');
      setUsuarios(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const usuariosFiltrados = useMemo(() => {
    const query = normalizarTexto(busqueda.trim());
    const terminos = query.split(/\s+/).filter(Boolean);

    return usuarios.filter((u) => {
      if (filtroRol === 'BLOQUEADOS') {
        if (!u.bloqueado) return false;
      } else if (filtroRol !== 'TODOS' && u.rol !== filtroRol) {
        return false;
      }

      if (terminos.length === 0) return true;

      const corpus = normalizarTexto(
        `${u.nombre_completo} ${u.email} ${u.rol_display || ''} ${u.rol} ${u.bloqueado ? 'bloqueado' : 'activo'}`
      );

      return terminos.every((termino) => corpus.includes(termino));
    });
  }, [usuarios, busqueda, filtroRol]);

  const abrirEdicion = (u: UsuarioData) => {
    setUsuarioEditando(u);
    setNombreCompleto(u.nombre_completo);
    setEmail(u.email);
    setNuevoRol(u.rol);
    setNuevaPassword('');
    setMostrarPassword(false);
    setErrorModal('');
    setMostrarModalEliminar(false);
  };

  const handleGuardarCambios = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!usuarioEditando) return;
    setErrorModal('');

    const cleanNombre = nombreCompleto.trim();
    const palabrasNombre = cleanNombre.split(/\s+/).filter(Boolean);
    if (palabrasNombre.length < 2) {
      setErrorModal('Por favor ingresa nombres y apellidos completos (ej. Juan Pérez).');
      return;
    }

    if (palabrasNombre.some((p) => p.length < 2)) {
      setErrorModal('Cada nombre y apellido debe contener al menos 2 letras.');
      return;
    }

    const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'-]+$/;
    if (!nombreRegex.test(cleanNombre)) {
      setErrorModal('El nombre solo puede contener letras y espacios (sin números ni símbolos).');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorModal('Por favor ingresa un correo electrónico válido.');
      return;
    }

    if (nuevaPassword.trim() && nuevaPassword.trim().length < 6) {
      setErrorModal('La nueva contraseña debe contener al menos 6 caracteres.');
      return;
    }

    setGuardando(true);
    try {
      const payload: Record<string, any> = {
        nombre_completo: nombreCompleto.trim(),
        email: email.trim().toLowerCase(),
        rol: nuevoRol,
        bloqueado: false,
      };
      if (nuevaPassword.trim()) {
        payload.password = nuevaPassword.trim();
      }
      const res = await api.patch(`/auth/usuarios/${usuarioEditando.id}/`, payload);
      if (currentUser && currentUser.id === usuarioEditando.id && res.data?.usuario) {
        updateUser(res.data.usuario);
      }
      setUsuarioEditando(null);
      cargarUsuarios();
    } catch (err: any) {
      const msg =
        err.response?.data?.nombre_completo?.[0] ||
        err.response?.data?.email?.[0] ||
        err.response?.data?.rol?.[0] ||
        err.response?.data?.password?.[0] ||
        err.response?.data?.detail ||
        'Error al actualizar los datos del usuario.';
      setErrorModal(msg);
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarUsuario = async () => {
    if (!usuarioEditando) return;
    setEliminando(true);
    try {
      await api.delete(`/auth/usuarios/${usuarioEditando.id}/`);
      setMostrarModalEliminar(false);
      setUsuarioEditando(null);
      cargarUsuarios();
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'No se pudo eliminar el usuario.';
      setErrorModal(msg);
      setMostrarModalEliminar(false);
    } finally {
      setEliminando(false);
    }
  };

  const handleVolver = () => {
    if (onBack) onBack();
    else onNavigate('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28 md:pb-12 transition-colors duration-200">
      <header className="bg-slate-900 text-white sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-3.5 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleVolver}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white font-medium text-sm p-1.5 -ml-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              title="Volver al inicio"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline text-xs text-slate-400 hover:text-slate-200">Volver al inicio</span>
            </button>
            <div className="h-4 w-px bg-slate-700" />
            <h1 className="font-bold text-white text-base tracking-tight">Usuarios y roles</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => onNavigate('register', { from: 'users' })}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nuevo usuario
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 px-1">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Administración de permisos y datos del personal técnico y propietarios.
          </p>
          <span className="text-xs font-medium text-slate-400">
            {busqueda || filtroRol !== 'TODOS'
              ? `Mostrando ${usuariosFiltrados.length} de ${usuarios.length} usuarios`
              : `${usuarios.length} ${usuarios.length === 1 ? 'usuario registrado' : 'usuarios registrados'}`}
          </span>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, apellido, correo o rol..."
              className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-600 shadow-sm transition-colors"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda('')}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
                title="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-semibold">
            {[
              { id: 'TODOS', label: `Todos (${usuarios.length})` },
              { id: 'ADMINISTRADOR', label: `Administradores (${usuarios.filter((u) => u.rol === 'ADMINISTRADOR').length})` },
              { id: 'OPERADOR', label: `Operadores (${usuarios.filter((u) => u.rol === 'OPERADOR').length})` },
              { id: 'PROPIETARIO', label: `Propietarios (${usuarios.filter((u) => u.rol === 'PROPIETARIO').length})` },
              ...(usuarios.some((u) => u.bloqueado)
                ? [{ id: 'BLOQUEADOS', label: `Bloqueados (${usuarios.filter((u) => u.bloqueado).length})`, esAlerta: true }]
                : []),
            ].map((tab: any) => {
              const activo = filtroRol === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFiltroRol(tab.id)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    activo
                      ? tab.esAlerta
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-slate-900 dark:bg-brand-600 text-white shadow-xs'
                      : tab.esAlerta
                      ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50 hover:bg-red-100'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm space-y-3">
            <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Cargando lista de usuarios...</p>
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-3 shadow-sm">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <User className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                {busqueda || filtroRol !== 'TODOS' ? 'Sin coincidencias' : 'No hay usuarios registrados'}
              </h4>
              <p className="text-slate-500 dark:text-slate-400 text-xs max-w-sm mx-auto">
                {busqueda
                  ? `No se encontró ningún usuario que coincida con "${busqueda}".`
                  : filtroRol !== 'TODOS'
                  ? 'No hay usuarios registrados en la categoría seleccionada.'
                  : 'Aún no se han registrado cuentas en la plataforma.'}
              </p>
            </div>
            {(busqueda || filtroRol !== 'TODOS') && (
              <button
                type="button"
                onClick={() => {
                  setBusqueda('');
                  setFiltroRol('TODOS');
                }}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs transition-all cursor-pointer"
              >
                Restablecer búsqueda y filtros
              </button>
            )}
            {!busqueda && filtroRol === 'TODOS' && (
              <button
                type="button"
                onClick={() => onNavigate('register', { from: 'users' })}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-semibold hover:bg-brand-700 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Registrar el primer usuario
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {usuariosFiltrados.map((u) => {
              const esAdmin = u.rol === 'ADMINISTRADOR';
              const esOperador = u.rol === 'OPERADOR';
              return (
                <div
                  key={u.id}
                  onClick={() => abrirEdicion(u)}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4 hover:shadow-md hover:border-brand-400 dark:hover:border-brand-500 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-brand-50 dark:group-hover:bg-brand-950/40 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {u.nombre_completo.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{u.nombre_completo}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{u.email}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            esAdmin
                              ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60'
                              : esOperador
                              ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/60'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {u.rol_display || u.rol}
                        </span>
                        {u.bloqueado && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Bloqueado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      abrirEdicion(u);
                    }}
                    className="p-2 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                    title="Editar datos y rol del usuario"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {usuarios.length > 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-4 max-w-2xl mx-auto md:hidden">
          <button
            onClick={() => onNavigate('register', { from: 'users' })}
            className="w-full py-4 bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white font-bold rounded-2xl shadow-xl shadow-brand-600/30 flex items-center justify-center gap-2 text-base transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Nuevo usuario
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={mostrarModalEliminar && !!usuarioEditando}
        title="¿Eliminar usuario?"
        description={
          usuarioEditando ? (
            <>
              ¿Estás seguro de que deseas eliminar la cuenta de{' '}
              <strong className="text-slate-800 dark:text-white">{usuarioEditando.nombre_completo}</strong> ({usuarioEditando.email})?
            </>
          ) : null
        }
        isLoading={eliminando}
        onCancel={() => {
          setErrorModal('');
          setMostrarModalEliminar(false);
        }}
        onConfirm={handleEliminarUsuario}
      >
        {usuarioEditando && (
          <>
            {(usuarioEditando.total_vehiculos ?? 0) > 0 ? (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-left flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-amber-900 dark:text-amber-200">
                    Atención: Datos vehiculares asociados
                  </p>
                  <p className="text-amber-800 dark:text-amber-300 leading-relaxed text-xs">
                    Este usuario tiene registrado{' '}
                    <strong className="font-bold text-amber-950 dark:text-white">
                      {usuarioEditando.total_vehiculos}{' '}
                      {usuarioEditando.total_vehiculos === 1 ? 'vehículo' : 'vehículos'}
                    </strong>
                    {(usuarioEditando.total_inspecciones_vehiculos ?? 0) > 0 && (
                      <>
                        {' '}y{' '}
                        <strong className="font-bold text-amber-950 dark:text-white">
                          {usuarioEditando.total_inspecciones_vehiculos}{' '}
                          {usuarioEditando.total_inspecciones_vehiculos === 1
                            ? 'inspección técnica'
                            : 'inspecciones técnicas'}
                        </strong>
                      </>
                    )}
                    . Al eliminar la cuenta, dichos vehículos y su historial se borrarán de forma permanente.
                  </p>
                </div>
              </div>
            ) : (usuarioEditando.total_inspecciones_realizadas ?? 0) > 0 ? (
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-left flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-200 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  i
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-blue-900 dark:text-blue-200">
                    Inspecciones técnicas registradas
                  </p>
                  <p className="text-blue-800 dark:text-blue-300 leading-relaxed text-xs">
                    {usuarioEditando.rol === 'ADMINISTRADOR' ? 'Este administrador' : 'Este operador'} ha realizado{' '}
                    <strong className="font-bold text-blue-950 dark:text-white">
                      {usuarioEditando.total_inspecciones_realizadas}{' '}
                      {usuarioEditando.total_inspecciones_realizadas === 1 ? 'inspección' : 'inspecciones'}
                    </strong>
                    . Las inspecciones se conservarán en los vehículos correspondientes, pero quedarán sin {usuarioEditando.rol === 'ADMINISTRADOR' ? 'inspector' : 'operador'} asignado.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
                {usuarioEditando.rol === 'OPERADOR'
                  ? 'Este operador no tiene inspecciones técnicas registradas en el sistema. Esta acción no se puede deshacer.'
                  : usuarioEditando.rol === 'ADMINISTRADOR'
                  ? 'Esta cuenta de administrador no tiene registros asociados. Esta acción no se puede deshacer.'
                  : 'Esta cuenta no tiene vehículos asociados. Esta acción no se puede deshacer.'}
              </p>
            )}

            {errorModal && <AlertBanner type="error" message={errorModal} />}
          </>
        )}
      </ConfirmModal>

      {usuarioEditando && !mostrarModalEliminar && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Editar Usuario</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Modifica los datos personales y permisos de acceso.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUsuarioEditando(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorModal && (
              <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span>{errorModal}</span>
              </div>
            )}

            <form onSubmit={handleGuardarCambios} className="space-y-3.5">
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
                    placeholder="Ej. Juan Pérez"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-800 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-600 transition-all"
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
                    placeholder="usuario@autocheck.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-800 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-600 transition-all lowercase"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Rol asignado
                </label>
                <select
                  value={nuevoRol}
                  onChange={(e) => setNuevoRol(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-600 outline-none cursor-pointer"
                >
                  <option value="PROPIETARIO">Propietario</option>
                  <option value="OPERADOR">Operador técnico</option>
                  <option value="ADMINISTRADOR">Administrador</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Nueva contraseña (opcional)
                </label>
                <div className="relative">
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    value={nuevaPassword}
                    onChange={(e) => setNuevaPassword(e.target.value)}
                    placeholder="Dejar en blanco para mantener la actual"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-800 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-600 transition-all"
                  />
                  <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 cursor-pointer"
                    title={mostrarPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Solo escribe aquí si deseas cambiarle o resetearle la clave.
                </p>
              </div>

              {usuarioEditando.bloqueado && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
                  <Unlock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Esta cuenta está bloqueada por 3 intentos fallidos. Al guardar se desbloqueará automáticamente.</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUsuarioEditando(null)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-60"
                >
                  {guardando ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>

              {currentUser?.id !== usuarioEditando.id && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorModal('');
                      setMostrarModalEliminar(true);
                    }}
                    className="w-full py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Eliminar este usuario
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
