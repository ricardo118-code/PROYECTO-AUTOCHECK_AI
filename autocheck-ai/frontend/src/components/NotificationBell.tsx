import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import {
  Bell,
  CheckCheck,
  Trash2,
  Car,
  CheckCircle2,
  ShieldAlert,
  Info,
  ExternalLink
} from 'lucide-react';

interface NotificacionItem {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: 'VEHICULO' | 'INSPECCION' | 'SEGURIDAD' | 'SISTEMA';
  leida: boolean;
  enlace_accion?: string;
  metadata?: any;
  fecha_creacion: string;
  fecha_legible: string;
}

interface NotificationBellProps {
  onNavigate: (page: string, params?: any) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ onNavigate }) => {
  const [notificaciones, setNotificaciones] = useState<NotificacionItem[]>([]);
  const [totalNoLeidas, setTotalNoLeidas] = useState(0);
  const [abierto, setAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cargarNotificaciones = async () => {
    try {
      const res = await api.get('/notificaciones/');
      setNotificaciones(res.data.notificaciones || []);
      setTotalNoLeidas(res.data.total_no_leidas || 0);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    cargarNotificaciones();
    const interval = setInterval(() => {
      cargarNotificaciones();
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const cerrarNotificaciones = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setAbierto(false);
  };

  useEffect(() => {
    const handleClickAfuera = (event: MouseEvent) => {
      if (contenedorRef.current && !contenedorRef.current.contains(event.target as Node)) {
        cerrarNotificaciones();
      }
    };
    if (abierto) {
      document.addEventListener('mousedown', handleClickAfuera);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickAfuera);
    };
  }, [abierto]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (!abierto) {
      setAbierto(true);
    }
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setAbierto(false);
    }, 250);
  };

  const handleClickCampana = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (abierto) {
      cerrarNotificaciones();
    } else {
      setAbierto(true);
      cargarNotificaciones();
    }
  };

  const marcarComoLeida = async (id: number) => {
    try {
      await api.post(`/notificaciones/${id}/leer/`);
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
      setTotalNoLeidas((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const marcarTodasComoLeidas = async () => {
    try {
      setCargando(true);
      await api.post('/notificaciones/marcar-todas-leidas/');
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
      setTotalNoLeidas(0);
    } catch (e) {
      console.error(e);
    } finally {
      setCargando(false);
    }
  };

  const eliminarNotificacion = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await api.delete(`/notificaciones/${id}/`);
      const eliminada = notificaciones.find((n) => n.id === id);
      setNotificaciones((prev) => prev.filter((n) => n.id !== id));
      if (eliminada && !eliminada.leida) {
        setTotalNoLeidas((prev) => Math.max(0, prev - 1));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAccionNotificacion = (n: NotificacionItem) => {
    if (!n.leida) {
      marcarComoLeida(n.id);
    }
    cerrarNotificaciones();

    if (n.enlace_accion === 'history' && n.metadata?.vehiculo_id) {
      onNavigate('history', {
        vehiculo: {
          id: n.metadata.vehiculo_id,
          placa: n.metadata.placa || ''
        }
      });
    } else if (n.enlace_accion === 'vehicles') {
      onNavigate('vehicles');
    } else if (n.enlace_accion === 'users') {
      onNavigate('users');
    }
  };

  const renderIcono = (tipo: string) => {
    switch (tipo) {
      case 'VEHICULO':
        return (
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Car className="w-4 h-4" />
          </div>
        );
      case 'INSPECCION':
        return (
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        );
      case 'SEGURIDAD':
        return (
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div
      className="relative"
      ref={contenedorRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={handleClickCampana}
        title="Notificaciones"
        className={`relative p-2 rounded-xl transition-all cursor-pointer ${
          abierto
            ? 'bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-white'
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        <Bell className="w-5 h-5" />
        {totalNoLeidas > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center shadow-xs animate-pulse">
            {totalNoLeidas > 9 ? '9+' : totalNoLeidas}
          </span>
        )}
      </button>

      <div
        className={`fixed inset-0 bg-slate-900/20 sm:hidden z-40 transition-opacity ease-out ${
          abierto
            ? 'opacity-100 pointer-events-auto duration-[350ms]'
            : 'opacity-0 pointer-events-none duration-500'
        }`}
        onClick={cerrarNotificaciones}
      />
      <div
        className={`fixed left-3 right-3 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:pt-2 sm:w-96 z-50 ${
          abierto ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        <div
          className={`bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden transform-gpu transition-all ease-out ${
            abierto
              ? 'opacity-100 translate-y-0 duration-[350ms]'
              : 'opacity-0 translate-y-2.5 duration-500'
          }`}
        >
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/80">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Notificaciones</h3>
                {totalNoLeidas > 0 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-100 dark:border-brand-900/60">
                    {totalNoLeidas} nueva{totalNoLeidas > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {totalNoLeidas > 0 && (
                <button
                  onClick={marcarTodasComoLeidas}
                  disabled={cargando}
                  title="Marcar todas como leídas"
                  className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-white dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <CheckCheck className="w-4 h-4 text-brand-600" />
                  <span className="hidden sm:inline text-[11px]">Marcar todas</span>
                </button>
              )}
            </div>

            <div className="max-h-[calc(100vh-140px)] sm:max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {notificaciones.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 flex items-center justify-center mx-auto">
                  <Bell className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Sin notificaciones pendientes</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
                  No tienes novedades por el momento. Te avisaremos cuando se registre nueva actividad en la plataforma.
                </p>
              </div>
            ) : (
              notificaciones.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleAccionNotificacion(n)}
                  className={`p-4 transition-all flex items-start gap-3 group cursor-pointer ${
                    !n.leida
                      ? 'bg-blue-50/40 dark:bg-brand-950/20 hover:bg-blue-50/70 dark:hover:bg-brand-950/40 border-l-4 border-l-brand-600'
                      : 'hover:bg-slate-50/90 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {renderIcono(n.tipo)}

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs truncate ${!n.leida ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-700 dark:text-slate-300'}`}>
                        {n.titulo}
                      </h4>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono shrink-0">
                        {n.fecha_legible}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {n.mensaje}
                    </p>

                    {n.enlace_accion && (
                      <div className="pt-1 flex items-center gap-1 text-[11px] font-bold text-brand-600 group-hover:underline">
                        <span>Ver detalle</span>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  <button
                    onClick={(e) => eliminarNotificacion(e, n.id)}
                    title="Eliminar notificación"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
