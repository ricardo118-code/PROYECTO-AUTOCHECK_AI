import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { ArrowLeft, FileText, Download, CheckCircle2, Car, AlertCircle, Plus, Search, X } from 'lucide-react';
import { normalizarTexto } from '../utils/formatters';

interface GenerateReportProps {
  vehiculo?: any;
  inspeccionId?: number;
  tipoReporte?: 'individual' | 'comparativo';
  fechaDesdeInicial?: string;
  fechaHastaInicial?: string;
  from?: string;
  onNavigate: (page: string, params?: any) => void;
  onBack?: () => void;
}

export const GenerateReport: React.FC<GenerateReportProps> = ({
  vehiculo: vehiculoInicial,
  inspeccionId,
  tipoReporte: tipoReporteInicial,
  fechaDesdeInicial,
  fechaHastaInicial,
  from,
  onNavigate,
}) => {
  const { user } = useAuth();
  const esPropietario = user?.rol === 'PROPIETARIO';
  const vieneDesdeHistorial = from === 'history' || Boolean(vehiculoInicial);
  const [tipoReporte, setTipoReporte] = useState<'individual' | 'comparativo' | null>(() => {
    if (tipoReporteInicial) return tipoReporteInicial;
    if (inspeccionId) return 'individual';
    return null;
  });
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [vehiculoActual, setVehiculoActual] = useState<any>(() => {
    if (vehiculoInicial) return vehiculoInicial;
    try {
      const raw = sessionStorage.getItem('autocheck_report_vehiculo');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [cargandoVehiculos, setCargandoVehiculos] = useState(true);
  const [busquedaVehiculo, setBusquedaVehiculo] = useState('');
  const [filtroEstadoVehiculo, setFiltroEstadoVehiculo] = useState<'TODOS' | 'INSPECCIONADOS' | 'PENDIENTES'>('TODOS');
  const [inspecciones, setInspecciones] = useState<any[]>([]);
  const [inspeccionSeleccionadaId, setInspeccionSeleccionadaId] = useState<number | null>(inspeccionId || null);
  const [cargandoInspecciones, setCargandoInspecciones] = useState(false);
  const [desde, setDesde] = useState(fechaDesdeInicial || '');
  const [hasta, setHasta] = useState(fechaHastaInicial || '');
  const [generando, setGenerando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  useEffect(() => {
    if (fechaDesdeInicial) setDesde(fechaDesdeInicial);
    if (fechaHastaInicial) setHasta(fechaHastaInicial);
  }, [fechaDesdeInicial, fechaHastaInicial]);

  useEffect(() => {
    const cargarVehiculos = async () => {
      try {
        setCargandoVehiculos(true);
        const res = await api.get('/vehiculos/');
        const lista = res.data || [];
        setVehiculos(lista);
        const vGuardado = vehiculoInicial || (() => {
          try {
            const raw = sessionStorage.getItem('autocheck_report_vehiculo');
            return raw ? JSON.parse(raw) : null;
          } catch {
            return null;
          }
        })();

        if (vGuardado) {
          const vSeleccionado = lista.find((v: any) => v.id === vGuardado.id) || vGuardado;
          setVehiculoActual(vSeleccionado);
          sessionStorage.setItem('autocheck_report_vehiculo', JSON.stringify(vSeleccionado));
        } else {
          setVehiculoActual(null);
          setInspecciones([]);
          setInspeccionSeleccionadaId(null);
          sessionStorage.removeItem('autocheck_report_vehiculo');
        }
      } catch {
      } finally {
        setCargandoVehiculos(false);
      }
    };
    cargarVehiculos();
  }, [vehiculoInicial]);

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

  const handleVolverASeleccionar = () => {
    setVehiculoActual(null);
    setTipoReporte(null);
    setInspecciones([]);
    setInspeccionSeleccionadaId(null);
    setMensaje(null);
    setBusquedaVehiculo('');
    setDesde('');
    setHasta('');
    sessionStorage.removeItem('autocheck_report_vehiculo');
  };

  const cambiarVehiculo = (v: any) => {
    setVehiculoActual(v);
    setTipoReporte(null);
    setInspeccionSeleccionadaId(null);
    setInspecciones([]);
    setMensaje(null);
    setBusquedaVehiculo('');
    setDesde('');
    setHasta('');
    if (v) {
      sessionStorage.setItem('autocheck_report_vehiculo', JSON.stringify(v));
    } else {
      sessionStorage.removeItem('autocheck_report_vehiculo');
    }
  };

  useEffect(() => {
    const cargarInspecciones = async () => {
      if (!vehiculoActual?.id) return;
      try {
        setCargandoInspecciones(true);
        const res = await api.get(`/historial/vehiculo/${vehiculoActual.id}/`);
        const lista = res.data.historial || [];
        setInspecciones(lista);
        if (lista.length > 0 && inspeccionId && lista.some((item: any) => item.id === inspeccionId)) {
          setInspeccionSeleccionadaId(inspeccionId);
        } else {
          setInspeccionSeleccionadaId(null);
        }
      } catch (err) {
        console.error('Error al cargar inspecciones del vehículo:', err);
        setInspecciones([]);
        setInspeccionSeleccionadaId(null);
      } finally {
        setCargandoInspecciones(false);
      }
    };

    cargarInspecciones();
  }, [vehiculoActual?.id]);

  const handleGenerarPDF = async () => {
    if (!vehiculoActual?.id) {
      setMensaje({ tipo: 'error', texto: 'Por favor selecciona un vehículo para generar el reporte.' });
      return;
    }

    if (!tipoReporte) {
      setMensaje({
        tipo: 'error',
        texto: 'Por favor selecciona el tipo de reporte que deseas generar.'
      });
      return;
    }

    if (tipoReporte === 'individual' && !inspeccionSeleccionadaId) {
      setMensaje({
        tipo: 'error',
        texto: 'Por favor selecciona una inspección para exportar el reporte.'
      });
      return;
    }

    if (tipoReporte === 'comparativo' && (!desde || !hasta)) {
      setMensaje({
        tipo: 'error',
        texto: 'Por favor ingresa la fecha inicial y final para generar el reporte comparativo.'
      });
      return;
    }

    if (tipoReporte === 'comparativo' && desde > hasta) {
      setMensaje({
        tipo: 'error',
        texto: 'La fecha inicial de consulta no puede ser posterior a la fecha final.'
      });
      return;
    }

    setGenerando(true);
    setMensaje(null);

    try {
      let response;
      let filename = '';

      if (tipoReporte === 'individual') {
        response = await api.get(`/reportes/individual/${inspeccionSeleccionadaId}/`, {
          responseType: 'blob',
        });
        filename = `reporte_individual_${vehiculoActual.placa}.pdf`;
      } else {
        response = await api.post(
          '/reportes/comparativo/',
          {
            vehiculo_id: vehiculoActual.id,
            fecha_desde: desde,
            fecha_hasta: hasta,
          },
          { responseType: 'blob' }
        );
        filename = `reporte_comparativo_${vehiculoActual.placa}.pdf`;
      }

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setMensaje({
        tipo: 'exito',
        texto: `¡${tipoReporte === 'individual' ? 'Reporte individual' : 'Reporte comparativo'} generado y descargado con éxito!`
      });
    } catch (e: any) {
      console.error('Error al generar el PDF:', e);
      setMensaje({
        tipo: 'error',
        texto: 'No se pudo generar el reporte. Verifica que existan inspecciones en el rango seleccionado.'
      });
    } finally {
      setGenerando(false);
    }
  };

  const botonVolverHeader = vehiculoActual
    ? vieneDesdeHistorial
      ? {
          action: () => onNavigate('history', { vehiculo: vehiculoActual, from }),
          text: 'Volver al historial',
          title: 'Volver al historial',
        }
      : {
          action: handleVolverASeleccionar,
          text: 'Volver a vehículos',
          title: 'Volver a seleccionar vehículo',
        }
    : {
        action: () => {
          sessionStorage.removeItem('autocheck_report_vehiculo');
          onNavigate('dashboard');
        },
        text: 'Volver al inicio',
        title: 'Volver al inicio',
      };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between pb-10 transition-colors">
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
            <h1 className="font-bold text-white text-base tracking-tight">Generar reporte PDF</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {vehiculoActual && (
              <span className="text-xs bg-slate-800 text-brand-400 px-3 py-1 rounded-full font-mono font-bold border border-slate-700">
                {vehiculoActual.placa}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-5 flex-1">
        {!vehiculoActual ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 px-1">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Selecciona el vehículo para generar reporte
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Elige la unidad para generar el informe técnico individual o el comparativo evolutivo.
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
                  { id: 'INSPECCIONADOS', label: `Con inspección (${vehiculos.filter((v) => v.estado_inspeccion === 'INSPECCIONADO').length})` },
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

            {cargandoVehiculos ? (
              <div className="text-center py-16 text-slate-400 text-sm space-y-3">
                <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Cargando vehículos...</p>
              </div>
            ) : vehiculosFiltrados.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-3 shadow-sm transition-colors">
                <Car className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                <h4 className="text-base font-bold text-slate-800 dark:text-white">
                  {busquedaVehiculo || filtroEstadoVehiculo !== 'TODOS'
                    ? 'Sin coincidencias'
                    : esPropietario
                      ? 'No tienes vehículos registrados'
                      : 'No hay vehículos para generar reportes'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {busquedaVehiculo || filtroEstadoVehiculo !== 'TODOS'
                    ? 'No se encontraron vehículos que coincidan con la búsqueda o filtros aplicados.'
                    : esPropietario
                      ? 'Registra tu vehículo para descargar sus informes técnicos.'
                      : 'Registra una unidad para emitir sus informes técnicos.'}
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
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
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
                          <FileText className="w-4 h-4" />
                          Seleccionar para emitir reporte
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
                Parámetros de exportación
              </span>
              <span className="text-xs text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 dark:border-brand-800/60 px-2.5 py-1 rounded-xl font-mono font-bold">
                Unidad: {vehiculoActual.placa} ({vehiculoActual.marca} {vehiculoActual.modelo})
              </span>
            </div>
            {mensaje && (
              <div
                className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
                  mensaje.tipo === 'exito'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                }`}
              >
                {mensaje.tipo === 'exito' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0" />
                )}
                <span>{mensaje.texto}</span>
              </div>
            )}

            <div className="lg:grid lg:grid-cols-12 lg:gap-6 items-start space-y-5 lg:space-y-0">
              <div className="lg:col-span-7 space-y-4">
                <div className="space-y-3">
                  <div
                    onClick={() => setTipoReporte('individual')}
                    className={`p-5 rounded-3xl border transition-all cursor-pointer ${
                      tipoReporte === 'individual'
                        ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 ring-2 ring-brand-500/20 shadow-sm'
                        : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">Reporte individual</h4>
                      <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400 bg-brand-100/60 dark:bg-brand-950/60 px-2.5 py-0.5 rounded-full">
                        Inspección puntual
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                      Documento con los datos técnicos de una sola inspección: zonas revisadas, fotografías analizadas, diagnósticos de daño IA y nivel de confianza.
                    </p>
                  </div>

                  <div
                    onClick={() => setTipoReporte('comparativo')}
                    className={`p-5 rounded-3xl border transition-all cursor-pointer ${
                      tipoReporte === 'comparativo'
                        ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 ring-2 ring-brand-500/20 shadow-sm'
                        : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">Reporte comparativo y evolutivo</h4>
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100/60 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full">
                        Evolución temporal
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                      Informe temporal que compara la evolución de la carrocería en un período: tabla cronológica, matriz de daños nuevos vs reparados y dictamen de auditoría.
                    </p>
                  </div>
                </div>

                {tipoReporte === 'individual' ? (
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2 transition-colors">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Seleccionar inspección a exportar
                    </label>
                    {cargandoInspecciones ? (
                      <p className="text-xs text-slate-400 py-2">Consultando inspecciones...</p>
                    ) : inspecciones.length === 0 ? (
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs">
                        Este vehículo aún no cuenta con inspecciones para exportar. Realiza una inspección primero.
                      </div>
                    ) : (
                      <select
                        value={inspeccionSeleccionadaId || ''}
                        onChange={(e) => setInspeccionSeleccionadaId(e.target.value ? Number(e.target.value) : null)}
                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-white bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-600 outline-none cursor-pointer"
                      >
                        <option value="">Selecciona una inspección...</option>
                        {inspecciones.map((ins) => (
                          <option key={ins.id} value={ins.id}>
                            {ins.fecha_legible} — {ins.subtitulo?.replace(/\s*·\s*v[\d\.]+/i, '')} ({ins.total_danos} {ins.total_danos === 1 ? 'daño' : 'daños'})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ) : tipoReporte === 'comparativo' ? (
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 transition-colors">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Rango temporal de evaluación
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                          Desde
                        </label>
                        <input
                          type="date"
                          value={desde}
                          onChange={(e) => setDesde(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                          Hasta
                        </label>
                        <input
                          type="date"
                          value={hasta}
                          onChange={(e) => setHasta(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600 font-mono"
                        />
                      </div>
                    </div>
                    {desde && hasta && desde > hasta && (
                      <p className="text-xs text-rose-600 dark:text-rose-400 font-medium pt-1">
                        La fecha inicial no puede ser posterior a la fecha final.
                      </p>
                    )}
                  </div>
                ) : null}

                <p className="text-xs text-slate-400 dark:text-slate-500 text-center lg:text-left pt-2">
                  Registro certificado: incluye fecha de inspección, versión del modelo IA, usuario responsable y validación técnica
                </p>
              </div>

              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">Resumen de emisión</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Documento técnico oficial de AutoCheck AI</p>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-400 dark:text-slate-500 shrink-0">Unidad:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-right truncate">{vehiculoActual.placa} ({vehiculoActual.marca} {vehiculoActual.modelo})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 dark:text-slate-500">Tipo de informe:</span>
                      <span className="font-semibold text-brand-600 dark:text-brand-400">
                        {tipoReporte === 'individual'
                          ? 'Inspección técnica puntual'
                          : tipoReporte === 'comparativo'
                          ? 'Auditoría comparativa evolutiva'
                          : 'Pendiente de selección'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 dark:text-slate-500">Formato:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">PDF oficial con firmas y diagnóstico digital</span>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerarPDF}
                    disabled={
                      generando ||
                      cargandoInspecciones ||
                      !tipoReporte ||
                      (tipoReporte === 'individual' && !inspeccionSeleccionadaId) ||
                      (tipoReporte === 'comparativo' && (!desde || !hasta || desde > hasta))
                    }
                    title={
                      !tipoReporte
                        ? 'Selecciona un tipo de reporte para habilitar la descarga'
                        : tipoReporte === 'individual' && !inspeccionSeleccionadaId
                        ? 'Selecciona una inspección para generar el reporte'
                        : tipoReporte === 'comparativo' && (!desde || !hasta)
                        ? 'Ingresa las fechas de evaluación para habilitar la generación del reporte'
                        : tipoReporte === 'comparativo' && desde > hasta
                        ? 'La fecha inicial no puede ser posterior a la fecha final'
                        : undefined
                    }
                    className="w-full mt-2 py-4 bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white font-bold rounded-2xl shadow-xl shadow-brand-600/30 flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
                  >
                    <Download className="w-5 h-5" />
                    {generando
                      ? 'Compilando documento PDF...'
                      : cargandoInspecciones
                      ? 'Cargando inspecciones...'
                      : !tipoReporte
                      ? 'Generar Reporte'
                      : `Generar ${tipoReporte === 'individual' ? 'Reporte Individual' : 'Reporte Comparativo'}`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
