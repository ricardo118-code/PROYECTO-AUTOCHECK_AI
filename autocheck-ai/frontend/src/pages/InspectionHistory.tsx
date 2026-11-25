import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Clock, FileText, GitCompare, Check, AlertCircle, Car, ChevronRight, Trash2, Search, X, Plus, User, Cpu } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { normalizarTexto } from '../utils/formatters';

interface InspectionHistoryProps {
  vehiculo?: any;
  from?: string;
  onNavigate: (page: string, params?: any) => void;
  onBack?: () => void;
}

interface ItemHistorial {
  id: number;
  fecha_legible: string;
  subtitulo: string;
  total_danos: number;
  tiempo_seg: number;
  version_modelo: string;
  usuario_responsable?: string;
  inspeccion_completa: any;
}

export const InspectionHistory: React.FC<InspectionHistoryProps> = ({
  vehiculo: vehiculoInicial,
  from,
  onNavigate,
}) => {
  const { user, isAdmin } = useAuth();
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [vehiculoActual, setVehiculoActual] = useState<any>(() => {
    if (vehiculoInicial) return vehiculoInicial;
    try {
      const raw = sessionStorage.getItem('autocheck_history_vehiculo');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [busquedaVehiculo, setBusquedaVehiculo] = useState('');
  const [filtroEstadoVehiculo, setFiltroEstadoVehiculo] = useState<'TODOS' | 'INSPECCIONADOS' | 'PENDIENTES'>('TODOS');
  const [historial, setHistorial] = useState<ItemHistorial[]>([]);
  const [busquedaInspeccion, setBusquedaInspeccion] = useState('');
  const [filtroDanos, setFiltroDanos] = useState<'TODAS' | 'CON_DANOS' | 'SIN_DANOS'>('TODAS');
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [inspeccionAEliminar, setInspeccionAEliminar] = useState<ItemHistorial | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const esPropietario = user?.rol === 'PROPIETARIO';

  useEffect(() => {
    const inicializar = async () => {
      try {
        setLoading(true);
        const resVehiculos = await api.get('/vehiculos/');
        const listaVehiculos = resVehiculos.data || [];
        setVehiculos(listaVehiculos);

        const vTarget = vehiculoInicial || (() => {
          try {
            const raw = sessionStorage.getItem('autocheck_history_vehiculo');
            return raw ? JSON.parse(raw) : null;
          } catch {
            return null;
          }
        })();

        if (vTarget) {
          const vSeleccionado = listaVehiculos.find((v: any) => v.id === vTarget.id) || vTarget;
          setVehiculoActual(vSeleccionado);
          sessionStorage.setItem('autocheck_history_vehiculo', JSON.stringify(vSeleccionado));
          if (vSeleccionado?.id) {
            await cargarHistorialDeVehiculo(vSeleccionado.id);
          }
        } else {
          setVehiculoActual(null);
          setHistorial([]);
          sessionStorage.removeItem('autocheck_history_vehiculo');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error al inicializar historial:', err);
        setLoading(false);
      }
    };

    inicializar();
  }, [vehiculoInicial]);

  const cargarHistorialDeVehiculo = async (vehiculoId: number) => {
    try {
      setLoading(true);
      setSeleccionados([]);
      const res = await api.get(`/historial/vehiculo/${vehiculoId}/`);
      setHistorial(res.data.historial || []);
    } catch (e) {
      console.error(e);
      setHistorial([]);
    } finally {
      setLoading(false);
    }
  };

  const cambiarVehiculo = (v: any) => {
    if (v) {
      sessionStorage.setItem('autocheck_history_vehiculo', JSON.stringify(v));
      setVehiculoActual(v);
      if (v?.id) {
        cargarHistorialDeVehiculo(v.id);
      }
      setBusquedaVehiculo('');
      onNavigate('history', {
        vehiculo: v,
        from: from || 'dashboard',
      });
    } else {
      sessionStorage.removeItem('autocheck_history_vehiculo');
      setVehiculoActual(null);
      setHistorial([]);
      setSeleccionados([]);
      setBusquedaVehiculo('');
      onNavigate('history', {
        vehiculo: null,
        from: from || 'dashboard',
      });
    }
  };

  const toggleSeleccion = (id: number) => {
    setSeleccionados((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const handleComparar = () => {
    if (seleccionados.length === 2 && vehiculoActual) {
      onNavigate('compare_inspections', {
        vehiculo: vehiculoActual,
        inspeccion_1_id: seleccionados[0],
        inspeccion_2_id: seleccionados[1],
        from,
      });
    }
  };

  const handleEliminarInspeccion = async () => {
    if (!inspeccionAEliminar) return;
    try {
      setEliminando(true);
      await api.delete(`/analisis/inspeccion/${inspeccionAEliminar.id}/`);
      setHistorial((prev) => prev.filter((item) => item.id !== inspeccionAEliminar.id));
      setSeleccionados((prev) => prev.filter((id) => id !== inspeccionAEliminar.id));
      setInspeccionAEliminar(null);
    } catch (err) {
      console.error('Error al eliminar inspección:', err);
      alert('No se pudo eliminar la inspección. Inténtalo nuevamente.');
    } finally {
      setEliminando(false);
    }
  };

  const vehiculosFiltrados = useMemo(() => {
    const query = normalizarTexto(busquedaVehiculo.trim());
    const terminos = query.split(/\s+/).filter(Boolean);

    return vehiculos.filter((v) => {
      if (filtroEstadoVehiculo === 'INSPECCIONADOS' && v.estado_inspeccion !== 'INSPECCIONADO') return false;
      if (filtroEstadoVehiculo === 'PENDIENTES' && v.estado_inspeccion === 'INSPECCIONADO') return false;

      if (terminos.length === 0) return true;

      const corpus = normalizarTexto(
        `${v.placa} ${v.marca} ${v.modelo} ${v.anio} ${v.propietario_nombre || ''} ${v.estado_inspeccion || ''}`
      );

      return terminos.every((termino) => corpus.includes(termino));
    });
  }, [vehiculos, busquedaVehiculo, filtroEstadoVehiculo]);

  const historialFiltrado = useMemo(() => {
    const query = normalizarTexto(busquedaInspeccion.trim());
    const terminos = query.split(/\s+/).filter(Boolean);

    return historial.filter((item) => {
      if (filtroDanos === 'CON_DANOS' && item.total_danos === 0) return false;
      if (filtroDanos === 'SIN_DANOS' && item.total_danos > 0) return false;

      if (terminos.length === 0) return true;

      const corpus = normalizarTexto(
        `${item.fecha_legible} ${item.subtitulo} ${item.total_danos} ${item.total_danos === 0 ? 'sin danos' : 'con danos'} ${item.version_modelo || ''} ${item.usuario_responsable || ''}`
      );

      return terminos.every((termino) => corpus.includes(termino));
    });
  }, [historial, busquedaInspeccion, filtroDanos]);

  const handleVolverASeleccionar = () => {
    cambiarVehiculo(null);
  };

  const botonVolverHeader = vehiculoActual
    ? from === 'vehicles'
      ? {
          action: () => onNavigate('vehicles'),
          text: 'Volver al catálogo',
          title: 'Volver al catálogo vehicular',
        }
      : {
          action: handleVolverASeleccionar,
          text: 'Volver a vehículos',
          title: 'Volver a seleccionar vehículo',
        }
    : {
        action: () => {
          sessionStorage.removeItem('autocheck_history_vehiculo');
          onNavigate('dashboard');
        },
        text: 'Volver al inicio',
        title: 'Volver al inicio',
      };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-36 sm:pb-24 transition-colors duration-200">
      <header className="bg-slate-900 text-white sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-3.5 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={botonVolverHeader.action}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white font-medium text-sm p-1.5 -ml-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              title={botonVolverHeader.title}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline text-xs text-slate-400 hover:text-slate-200">
                {botonVolverHeader.text}
              </span>
            </button>
            <div className="h-4 w-px bg-slate-700" />
            <h1 className="font-bold text-white text-base tracking-tight">Historial de inspecciones</h1>
          </div>
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            {vehiculoActual && (
              <span className="text-xs bg-slate-800 text-brand-400 px-3 py-1 rounded-full font-mono border border-slate-700 font-bold">
                {vehiculoActual.placa}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 space-y-4">
        {!vehiculoActual ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 px-1">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Selecciona el vehículo para ver historial
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Consulta las revisiones previas, diagnósticos de daño y comparación evolutiva.
                </p>
              </div>
              <span className="text-xs font-medium text-slate-400">
                {busquedaVehiculo || filtroEstadoVehiculo !== 'TODOS'
                  ? `Mostrando ${vehiculosFiltrados.length} de ${vehiculos.length} vehículos`
                  : `${vehiculos.length} ${vehiculos.length === 1 ? 'vehículo registrado' : 'vehículos registrados'}`}
              </span>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={busquedaVehiculo}
                  onChange={(e) => setBusquedaVehiculo(e.target.value)}
                  placeholder="Buscar por placa, marca o modelo..."
                  className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-600 shadow-sm transition-colors"
                />
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                {busquedaVehiculo && (
                  <button
                    type="button"
                    onClick={() => setBusquedaVehiculo('')}
                    className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
                    title="Limpiar búsqueda"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-semibold">
                {[
                  { id: 'TODOS', label: `Todos (${vehiculos.length})` },
                  { id: 'INSPECCIONADOS', label: `Con historial (${vehiculos.filter((v) => v.estado_inspeccion === 'INSPECCIONADO').length})` },
                  { id: 'PENDIENTES', label: `Pendientes (${vehiculos.filter((v) => v.estado_inspeccion !== 'INSPECCIONADO').length})`, esAlerta: vehiculos.some((v) => v.estado_inspeccion !== 'INSPECCIONADO') },
                ].map((tab: any) => {
                  const activo = filtroEstadoVehiculo === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setFiltroEstadoVehiculo(tab.id)}
                      className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                        activo
                          ? 'bg-slate-900 dark:bg-brand-600 text-white shadow-xs'
                          : tab.esAlerta
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50 hover:bg-amber-100'
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
              <div className="text-center py-16 text-slate-400 text-sm space-y-3">
                <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Cargando vehículos...</p>
              </div>
            ) : vehiculosFiltrados.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-3 shadow-sm">
                <Car className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                <h4 className="text-base font-bold text-slate-800 dark:text-white">
                  {busquedaVehiculo || filtroEstadoVehiculo !== 'TODOS'
                    ? 'Sin coincidencias'
                    : esPropietario
                      ? 'Sin vehículos en tu historial'
                      : 'No hay vehículos para consultar'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {busquedaVehiculo || filtroEstadoVehiculo !== 'TODOS'
                    ? 'No se encontraron vehículos que coincidan con la búsqueda o filtros aplicados.'
                    : esPropietario
                      ? 'Registra tu vehículo para consultar su historial técnico.'
                      : 'Registra una unidad para revisar su historial técnico.'}
                </p>
                {busquedaVehiculo || filtroEstadoVehiculo !== 'TODOS' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setBusquedaVehiculo('');
                      setFiltroEstadoVehiculo('TODOS');
                    }}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Restablecer búsqueda y filtros
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onNavigate('vehicle_form')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{esPropietario ? 'Registrar mi vehículo' : 'Registrar vehículo'}</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vehiculosFiltrados.map((v) => {
                  const esInspeccionado = v.estado_inspeccion === 'INSPECCIONADO';
                  return (
                    <div
                      key={v.id}
                      onClick={() => cambiarVehiculo(v)}
                      className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-brand-400 dark:hover:border-brand-500 transition-all flex flex-col justify-between space-y-4 cursor-pointer group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm rounded-xl tracking-wider border border-slate-200/60 dark:border-slate-700 font-mono group-hover:bg-brand-50 dark:group-hover:bg-brand-950/40 group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors">
                            {v.placa}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              esInspeccionado
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            }`}
                          >
                            {esInspeccionado ? 'Inspeccionado' : 'Pendiente'}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                            {v.marca} {v.modelo}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Año: {v.anio}
                            {v.propietario_nombre && (
                              <span> · Propietario: {v.propietario_nombre}</span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-brand-600 dark:text-brand-400 font-bold">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          Ver historial de revisiones
                        </span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Historial de peritajes
              </span>
              <span className="text-xs text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 dark:border-brand-900/60 px-2.5 py-1 rounded-xl font-mono font-bold">
                Unidad: {vehiculoActual.placa} ({vehiculoActual.marca} {vehiculoActual.modelo})
              </span>
            </div>

        {vehiculoActual && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs text-slate-500 dark:text-slate-400 px-1">
            <span>
              Inspecciones de <b>{vehiculoActual.marca} {vehiculoActual.modelo} ({vehiculoActual.placa})</b>
            </span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-400">
                {busquedaInspeccion || filtroDanos !== 'TODAS'
                  ? `Mostrando ${historialFiltrado.length} de ${historial.length} inspecciones`
                  : `${historial.length} ${historial.length === 1 ? 'inspección registrada' : 'inspecciones registradas'}`}
              </span>
              <span>•</span>
              <span>Selecciona 2 para comparar</span>
            </div>
          </div>
        )}

        {historial.length === 1 && (
          <div className="p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Se requieren al menos 2 inspecciones registradas para comparar la evolución de daños en el tiempo.</span>
          </div>
        )}

        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={busquedaInspeccion}
              onChange={(e) => setBusquedaInspeccion(e.target.value)}
              placeholder="Buscar en inspecciones (fecha, subtítulo, daños)..."
              className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-600 shadow-sm transition-colors"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            {busquedaInspeccion && (
              <button
                type="button"
                onClick={() => setBusquedaInspeccion('')}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
                title="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-semibold">
            {[
              { id: 'TODAS', label: `Todas (${historial.length})` },
              { id: 'CON_DANOS', label: `Con daños (${historial.filter((i) => i.total_danos > 0).length})`, esAlerta: historial.some((i) => i.total_danos > 0) },
              { id: 'SIN_DANOS', label: `Sin daños (${historial.filter((i) => i.total_danos === 0).length})` },
            ].map((tab: any) => {
              const activo = filtroDanos === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFiltroDanos(tab.id)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    activo
                      ? 'bg-slate-900 dark:bg-brand-600 text-white shadow-xs'
                      : tab.esAlerta
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50 hover:bg-amber-100'
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
          <div className="text-center py-16 text-slate-400 text-sm space-y-3">
            <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Cargando historial de inspecciones...</p>
          </div>
        ) : historial.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-3">
                <Clock className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
                <h4 className="text-base font-bold text-slate-800 dark:text-white">Sin inspecciones registradas</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {esPropietario
                    ? 'Tu vehículo aún no cuenta con inspecciones técnicas.'
                    : 'Esta unidad aún no cuenta con inspecciones técnicas.'}
                </p>
                {!esPropietario && (
                  <button
                    onClick={() => onNavigate('upload_photos', { vehiculo: vehiculoActual })}
                    className="mt-2 px-5 py-2.5 bg-brand-600 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer hover:bg-brand-700"
                  >
                    Realizar primera inspección
                  </button>
                )}
              </div>
            ) : historialFiltrado.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-3 shadow-sm">
                <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                <h4 className="text-base font-bold text-slate-800 dark:text-white">Sin coincidencias</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  No se encontraron revisiones técnicas que coincidan con la búsqueda o filtro seleccionado.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setBusquedaInspeccion('');
                    setFiltroDanos('TODAS');
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Restablecer filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {historialFiltrado.map((item) => {
                  const estaSeleccionado = seleccionados.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() =>
                        onNavigate('analysis_result', {
                          vehiculo: vehiculoActual,
                          inspeccion: item.inspeccion_completa,
                          from: 'history',
                          origenPrevio: from,
                        })
                      }
                      className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 shadow-sm hover:shadow-md ${
                        estaSeleccionado
                          ? 'border-brand-500 ring-2 ring-brand-500/20 bg-brand-50/20 dark:bg-brand-950/30'
                          : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                            {item.fecha_legible}
                          </h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {item.total_danos === 0 ? 'Sin daños' : `${item.total_danos} daño${item.total_danos > 1 ? 's' : ''}`}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.subtitulo}</p>

                        <div className="flex flex-wrap items-center gap-2.5 mt-2.5 text-xs text-slate-500 dark:text-slate-400">
                          {(item.usuario_responsable || item.inspeccion_completa?.usuario_nombre) && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[130px] sm:max-w-[170px]">
                                {item.usuario_responsable || item.inspeccion_completa?.usuario_nombre}
                              </span>
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                            <Cpu className="w-3 h-3 text-brand-500 shrink-0" />
                            {item.version_modelo || item.inspeccion_completa?.version_modelo || 'v1.3'}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                            IA: {item.tiempo_seg}s
                          </span>
                        </div>

                        <div className="mt-2">
                          <span className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline inline-flex items-center gap-0.5">
                            Ver resultados <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSeleccion(item.id);
                          }}
                          title={estaSeleccionado ? 'Deseleccionar de la comparación' : 'Seleccionar para comparar'}
                          className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer ${
                            estaSeleccionado
                              ? 'border-brand-600 bg-brand-600 text-white shadow-sm ring-2 ring-brand-500/20'
                              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-brand-400'
                          }`}
                        >
                          {estaSeleccionado && <Check className="w-4 h-4 stroke-[3]" />}
                        </div>

                        {!esPropietario && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspeccionAEliminar(item);
                            }}
                            title="Eliminar esta inspección"
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {historial.length > 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-4 max-w-4xl mx-auto z-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleComparar}
            disabled={seleccionados.length !== 2}
            className={`w-full sm:flex-1 max-w-md sm:max-w-none py-3.5 px-6 font-bold rounded-2xl flex items-center justify-center gap-2.5 text-sm transition-all ${
              seleccionados.length === 2
                ? 'bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white shadow-xl shadow-brand-600/30 cursor-pointer'
                : 'bg-brand-600/40 text-white/70 cursor-not-allowed shadow-none'
            }`}
          >
            <GitCompare className="w-5 h-5 shrink-0" />
            <span>Comparar seleccionadas ({seleccionados.length}/2)</span>
          </button>

          {isAdmin && (
            <button
              onClick={() =>
                onNavigate('generate_report', {
                  vehiculo: vehiculoActual,
                  inspeccionId: seleccionados[0] || historial[0]?.id,
                  from,
                })
              }
              className="w-full sm:flex-1 max-w-md sm:max-w-none py-3.5 px-6 font-bold rounded-2xl flex items-center justify-center gap-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-white shadow-lg shadow-slate-900/10 dark:shadow-slate-950/40 transition-all cursor-pointer"
            >
              <FileText className="w-5 h-5 shrink-0 text-brand-600 dark:text-brand-400" />
              <span>Generar reporte PDF</span>
            </button>
          )}
        </div>
      )}

      {inspeccionAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">¿Eliminar inspección?</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                ¿Estás seguro de que deseas eliminar la inspección del{' '}
                <strong className="text-slate-900 dark:text-white font-semibold">{inspeccionAEliminar.fecha_legible}</strong>?
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
                Esta acción no se puede deshacer y borrará los diagnósticos de IA asociados.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                disabled={eliminando}
                onClick={() => setInspeccionAEliminar(null)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={eliminando}
                onClick={handleEliminarInspeccion}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {eliminando ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Sí, eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
