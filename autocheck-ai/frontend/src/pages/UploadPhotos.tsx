import React, { useState, useEffect, useRef, useMemo } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Car,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Camera,
  Trash2,
  ShieldCheck,
  RefreshCw,
  X,
  Plus,
  Search
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { normalizarTexto } from '../utils/formatters';

interface UploadPhotosProps {
  vehiculo?: any;
  inspeccion?: any;
  from?: string;
  origenPrevio?: string;
  origenSecundario?: string;
  onNavigate: (page: string, params?: any) => void;
  onBack?: () => void;
}

interface ImagenCargada {
  id: number;
  zona: string;
  zona_display: string;
  archivo_url: string;
  tamano_mb: number;
  resolucion?: string;
  score_nitidez?: number;
  estado_calidad: string;
  estado_display: string;
  motivo_rechazo?: string;
  ya_analizada?: boolean;
}

export const UploadPhotos: React.FC<UploadPhotosProps> = ({
  vehiculo: vehiculoInicial,
  inspeccion: inspeccionInicial,
  from,
  origenPrevio,
  origenSecundario,
  onNavigate,
}) => {
  const { user } = useAuth();
  const esPropietario = user?.rol === 'PROPIETARIO';
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [vehiculoActual, setVehiculoActual] = useState<any>(() => {
    if (vehiculoInicial) return vehiculoInicial;
    try {
      const raw = sessionStorage.getItem('autocheck_upload_vehiculo');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [cargandoVehiculos, setCargandoVehiculos] = useState(true);
  const [busquedaVehiculo, setBusquedaVehiculo] = useState('');
  const [filtroEstadoVehiculo, setFiltroEstadoVehiculo] = useState<'TODOS' | 'PENDIENTES' | 'INSPECCIONADOS'>('TODOS');
  const [imagenes, setImagenes] = useState<ImagenCargada[]>([]);
  const [imagenActiva, setImagenActiva] = useState<ImagenCargada | null>(null);
  const [zonaSeleccionada, setZonaSeleccionada] = useState('FRONTAL');
  const [subiendo, setSubiendo] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [analizando, setAnalizando] = useState(false);
  const [errorSubida, setErrorSubida] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const zonas = [
    { id: 'FRONTAL', nombre: 'Frontal' },
    { id: 'LATERAL_DERECHO', nombre: 'Lateral derecho' },
    { id: 'LATERAL_IZQUIERDO', nombre: 'Lateral izquierdo' },
    { id: 'POSTERIOR', nombre: 'Posterior' },
    { id: 'CAPO', nombre: 'Capó' },
  ];

  useEffect(() => {
    const inicializarVehiculo = async () => {
      try {
        setCargandoVehiculos(true);
        const res = await api.get('/vehiculos/');
        const listaVehiculos = res.data || [];
        setVehiculos(listaVehiculos);

        const vTarget = vehiculoInicial || (() => {
          try {
            const raw = sessionStorage.getItem('autocheck_upload_vehiculo');
            return raw ? JSON.parse(raw) : null;
          } catch {
            return null;
          }
        })();

        if (vTarget) {
          const vSeleccionado = listaVehiculos.find((v: any) => v.id === vTarget.id) || vTarget;
          setVehiculoActual(vSeleccionado);
          sessionStorage.setItem('autocheck_upload_vehiculo', JSON.stringify(vSeleccionado));
          if (vSeleccionado?.id) {
            cargarImagenesExistentes(vSeleccionado.id);
          }
        } else {
          setVehiculoActual(null);
          setImagenes([]);
          setImagenActiva(null);
          sessionStorage.removeItem('autocheck_upload_vehiculo');
        }
      } catch (e) {
        console.error('Error al cargar catálogo de vehículos:', e);
      } finally {
        setCargandoVehiculos(false);
      }
    };

    inicializarVehiculo();
  }, [vehiculoInicial]);

  const cargarImagenesExistentes = async (vehiculoId: number) => {
    if (!vehiculoId) return;
    try {
      const res = await api.get(`/imagenes/vehiculo/${vehiculoId}/`);
      setImagenes(res.data);

      setImagenActiva(null);
    } catch (e) {
      console.error('Error al cargar imágenes existentes:', e);
    }
  };

  const cambiarVehiculo = (v: any) => {
    if (v) {
      sessionStorage.setItem('autocheck_upload_vehiculo', JSON.stringify(v));
      setVehiculoActual(v);
      cargarImagenesExistentes(v.id);
      setErrorSubida('');
      setBusquedaVehiculo('');
      onNavigate('upload_photos', {
        vehiculo: v,
        inspeccion: inspeccionInicial,
        from: from || 'dashboard',
        origenPrevio,
        origenSecundario,
      });
    } else {
      sessionStorage.removeItem('autocheck_upload_vehiculo');
      setVehiculoActual(null);
      setImagenes([]);
      setImagenActiva(null);
      setErrorSubida('');
      setBusquedaVehiculo('');
      onNavigate('upload_photos', {
        vehiculo: null,
        inspeccion: null,
        from: from || 'dashboard',
        origenPrevio,
        origenSecundario,
      });
    }
  };

  const procesarArchivo = async (file: File) => {
    if (!file || !vehiculoActual?.id) {
      setErrorSubida('Por favor selecciona un vehículo antes de subir una fotografía.');
      return;
    }

    setErrorSubida('');
    setSubiendo(true);

    const formData = new FormData();
    formData.append('vehiculo', vehiculoActual.id.toString());
    formData.append('zona', zonaSeleccionada);
    formData.append('archivo', file);

    try {
      const response = await api.post('/imagenes/subir/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const nuevaImg = response.data.imagen;
      setImagenes(prev => [nuevaImg, ...prev.filter(img => img.id !== nuevaImg.id)]);

      if (nuevaImg.estado_calidad === 'RECHAZADA') {
        
        setImagenActiva(null);
        onNavigate('analysis_error', {
          vehiculo: vehiculoActual,
          motivo: nuevaImg.motivo_rechazo || 'La imagen no cumple con la calidad mínima requerida (desenfoque o baja resolución).'
        });
      } else {
        
        setImagenActiva(nuevaImg);
      }
    } catch (err: any) {
      const msg = err.response?.data?.archivo?.[0] || err.response?.data?.detail || 'Error al subir la fotografía.';
      setErrorSubida(msg);
    } finally {
      setSubiendo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      procesarArchivo(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      procesarArchivo(e.dataTransfer.files[0]);
    }
  };

  const handleEliminarImagen = async (id: number) => {
    try {
      await api.delete(`/imagenes/${id}/`);
      setImagenes(prev => {
        const filtradas = prev.filter(img => img.id !== id);
        if (imagenActiva?.id === id) {
          setImagenActiva(filtradas[0] || null);
        }
        return filtradas;
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleAnalizarConIA = async () => {
    if (!vehiculoActual?.id || !imagenActiva?.id) return;
    setAnalizando(true);

    try {
      const response = await api.post('/analisis/ejecutar/', {
        vehiculo_id: vehiculoActual.id,
        imagenes_ids: [imagenActiva.id]
      });

      setImagenActiva(null);
      sessionStorage.removeItem('autocheck_upload_vehiculo');

      onNavigate('analysis_result', {
        vehiculo: vehiculoActual,
        inspeccion: response.data.inspeccion,
        from: 'upload_photos',
        origenPrevio: from,
      });
    } catch (err: any) {
      sessionStorage.removeItem('autocheck_upload_vehiculo');
      const msg = err.response?.data?.detail || 'Error al ejecutar el análisis con IA.';
      onNavigate('analysis_error', {
        vehiculo: vehiculoActual,
        motivo: msg
      });
    } finally {
      setAnalizando(false);
    }
  };

  const vehiculosFiltrados = useMemo(() => {
    const query = normalizarTexto(busquedaVehiculo.trim());
    const terminos = query.split(/\s+/).filter(Boolean);

    return vehiculos.filter((v) => {
      if (filtroEstadoVehiculo === 'PENDIENTES' && v.estado_inspeccion === 'INSPECCIONADO') return false;
      if (filtroEstadoVehiculo === 'INSPECCIONADOS' && v.estado_inspeccion !== 'INSPECCIONADO') return false;

      if (terminos.length === 0) return true;

      const corpus = normalizarTexto(
        `${v.placa} ${v.marca} ${v.modelo} ${v.anio} ${v.propietario_nombre || ''} ${v.estado_inspeccion || ''}`
      );

      return terminos.every((termino) => corpus.includes(termino));
    });
  }, [vehiculos, busquedaVehiculo, filtroEstadoVehiculo]);

  const handleVolverASeleccionar = () => {
    cambiarVehiculo(null);
  };

  const botonVolverHeader = vehiculoActual
    ? from === 'analysis_result'
      ? {
          action: () =>
            onNavigate('analysis_result', {
              vehiculo: vehiculoActual,
              inspeccion: inspeccionInicial,
              from: origenSecundario || 'history',
              origenPrevio,
            }),
          text: 'Volver al resultado',
          title: 'Volver al resultado del análisis',
        }
      : from === 'vehicles'
        ? {
            action: () => onNavigate('vehicles'),
            text: 'Volver al catálogo',
            title: 'Volver al catálogo vehicular',
          }
        : from === 'history'
          ? {
              action: () => onNavigate('history', { vehiculo: vehiculoActual }),
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
          sessionStorage.removeItem('autocheck_upload_vehiculo');
          onNavigate('dashboard');
        },
        text: 'Volver al inicio',
        title: 'Volver al inicio',
      };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28 transition-colors duration-200">
     
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
            <h1 className="font-bold text-white text-base tracking-tight">Cargar fotografías</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {vehiculoActual && (
              <span className="text-xs bg-slate-800 text-brand-400 font-mono font-bold px-3 py-1 rounded-full border border-slate-700">
                {vehiculoActual.placa}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-44 lg:pb-12 space-y-4">
        {!vehiculoActual ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 px-1">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Selecciona el vehículo a inspeccionar
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Elige una unidad del catálogo para habilitar la captura de fotos y el análisis de daños con IA.
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
                  { id: 'PENDIENTES', label: `Pendientes (${vehiculos.filter((v) => v.estado_inspeccion !== 'INSPECCIONADO').length})`, esAlerta: vehiculos.some((v) => v.estado_inspeccion !== 'INSPECCIONADO') },
                  { id: 'INSPECCIONADOS', label: `Inspeccionados (${vehiculos.filter((v) => v.estado_inspeccion === 'INSPECCIONADO').length})` },
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
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-3 shadow-sm">
                <Car className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                <h4 className="text-base font-bold text-slate-800 dark:text-white">
                  {busquedaVehiculo || filtroEstadoVehiculo !== 'TODOS'
                    ? 'Sin coincidencias'
                    : esPropietario
                      ? 'No tienes vehículos para inspeccionar'
                      : 'No hay vehículos para inspeccionar'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {busquedaVehiculo || filtroEstadoVehiculo !== 'TODOS'
                    ? 'No se encontraron vehículos que coincidan con la búsqueda o filtros aplicados.'
                    : esPropietario
                      ? 'Registra tu vehículo para solicitar una inspección técnica.'
                      : 'Registra una unidad para iniciar su inspección con IA.'}
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
                          <Camera className="w-4 h-4" />
                          Seleccionar para inspección
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
                Captura de fotografías
              </span>
              <span className="text-xs text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 dark:border-brand-900/60 px-2.5 py-1 rounded-xl font-mono font-bold">
                Unidad: {vehiculoActual.placa} ({vehiculoActual.marca} {vehiculoActual.modelo})
              </span>
            </div>

            <div className="lg:grid lg:grid-cols-12 lg:gap-6 items-start space-y-4 lg:space-y-0">

              <div className="lg:col-span-5 space-y-4">
               
              <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-md flex items-center gap-3.5">
                <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center shrink-0 text-white">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg tracking-wider font-mono">
                    {vehiculoActual.placa}
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {vehiculoActual.marca} {vehiculoActual.modelo} · {vehiculoActual.anio}
                  </p>
                </div>
              </div>

              {!imagenActiva && (
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Zona a fotografiar
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {zonas.map(z => (
                      <button
                        key={z.id}
                        type="button"
                        onClick={() => setZonaSeleccionada(z.id)}
                        className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                          zonaSeleccionada === z.id
                            ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {z.nombre}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 text-blue-900 dark:text-blue-200 text-xs flex items-center gap-3">
                <Cpu className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />
                <span>La inteligencia artificial validará automáticamente el encuadre y calidad de las tomas.</span>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative rounded-3xl border-2 transition-all overflow-hidden ${
                  isDragging
                    ? 'border-brand-600 bg-brand-100/60 dark:bg-brand-950/60 ring-4 ring-brand-500/20 scale-[1.01]'
                    : imagenActiva
                    ? 'border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-900 shadow-md'
                    : 'border-dashed border-brand-300 dark:border-brand-700/80 hover:border-brand-500 dark:hover:border-brand-400 bg-brand-50/20 dark:bg-slate-900/60 hover:bg-brand-50/40 dark:hover:bg-slate-800/80 p-8 text-center cursor-pointer'
                }`}
                onClick={() => {
                  if (!imagenActiva) {
                    fileInputRef.current?.click();
                  }
                }}
              >
                {subiendo ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">
                      Validando resolución y nitidez...
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-300">
                      Verificando que la foto no esté desenfocada
                    </p>
                  </div>
                ) : imagenActiva ? (
                  <div className="relative group">
                    <div className="relative h-64 sm:h-80 w-full bg-slate-950 flex items-center justify-center overflow-hidden">
                      <img
                        src={imagenActiva.archivo_url}
                        alt={imagenActiva.zona_display}
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-black/30 pointer-events-none" />

                      <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5 max-w-[58%] sm:max-w-none">
                          <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] sm:text-xs font-bold border border-white/20 shrink-0">
                            Zona: {imagenActiva.zona_display}
                          </span>
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-white text-[11px] sm:text-xs font-bold flex items-center gap-1 shadow-sm shrink-0">
                            <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            Excelente ({imagenActiva.tamano_mb} MB)
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 pt-0.5 sm:pt-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setImagenActiva(null);
                            }}
                            className="px-2.5 py-1 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white text-[11px] sm:text-xs font-semibold backdrop-blur-md shadow-md flex items-center gap-1 transition-all cursor-pointer"
                            title="Cerrar visor"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Cerrar</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                            className="px-2.5 py-1 rounded-xl bg-white/90 hover:bg-white text-slate-800 text-[11px] sm:text-xs font-bold backdrop-blur-md shadow-md flex items-center gap-1 transition-all cursor-pointer hover:scale-105"
                            title="Cambiar fotografía"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-brand-600" />
                            <span>Cambiar</span>
                          </button>
                        </div>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 text-white text-xs">
                        <div className="font-mono text-slate-300 text-[10px] sm:text-xs leading-tight">
                          <div>Res: {imagenActiva.resolucion || 'HD'}</div>
                          <div className="text-slate-400">Nitidez: {imagenActiva.score_nitidez || 95}</div>
                        </div>
                        {imagenActiva.ya_analizada ? (
                          <span className="bg-amber-500/90 text-white px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shadow-sm shrink-0 text-[11px] sm:text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            Ya analizada con IA
                          </span>
                        ) : (
                          <span className="bg-brand-600/90 px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shadow-sm shrink-0 text-[11px] sm:text-xs">
                            <ShieldCheck className="w-3.5 h-3.5 text-brand-200" />
                            Lista para analizar
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 group cursor-pointer">
                    <div className="w-14 h-14 mx-auto bg-brand-100/80 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">
                        {isDragging ? '¡Suelta la imagen aquí!' : 'Arrastrar o seleccionar fotos'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Formatos JPG, PNG (Máximo 10 MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>


              {errorSubida && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                  <span>{errorSubida}</span>
                </div>
              )}


              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Fotografías cargadas ({imagenes.length})
                  </h4>
                  {imagenes.length > 0 && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Selecciona una imagen para verla en el visor
                    </span>
                  )}
                </div>

                {imagenes.length === 0 ? (
                  <div className="p-6 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-xs">
                    <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Esperando captura de fotografías...
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {imagenes.map(img => {
                      const esAprobada = img.estado_calidad === 'APROBADA';
                      const esActiva = imagenActiva?.id === img.id;
                      return (
                        <div
                          key={img.id}
                          onClick={() => {
                            if (imagenActiva?.id === img.id) {
                              setImagenActiva(null);
                            } else if (esAprobada) {
                              setImagenActiva(img);
                              if (img.zona) setZonaSeleccionada(img.zona);
                            }
                          }}
                          className={`p-3.5 rounded-2xl border shadow-sm flex items-center justify-between gap-3 transition-all cursor-pointer ${
                            esActiva
                              ? 'border-brand-500 bg-brand-50/30 dark:bg-brand-950/40 ring-2 ring-brand-500/20'
                              : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {img.archivo_url ? (
                              <img
                                src={img.archivo_url}
                                alt={img.zona_display}
                                className="w-12 h-12 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500">
                                <Camera className="w-6 h-6" />
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="font-bold text-slate-900 dark:text-white text-sm">{img.zona_display}</h5>
                                {esActiva && (
                                  <span className="text-[10px] bg-brand-100 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-bold px-2 py-0.5 rounded-full">
                                    En visor
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{img.tamano_mb} MB · Cargada</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {img.ya_analizada ? (
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-amber-600" />
                                Ya analizada
                              </span>
                            ) : (
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  esAprobada
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                    : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                                }`}
                              >
                                {esAprobada ? 'Excelente' : 'Rechazada'}
                              </span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEliminarImagen(img.id);
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="hidden lg:block pt-3 space-y-2">
                <button
                  onClick={handleAnalizarConIA}
                  disabled={analizando || !imagenActiva || imagenActiva.estado_calidad !== 'APROBADA' || Boolean(imagenActiva.ya_analizada)}
                  className="w-full py-4 bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white font-bold rounded-2xl shadow-xl shadow-brand-600/30 flex items-center justify-center gap-2.5 text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
                >
                  {imagenActiva?.ya_analizada ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                      <span>Fotografía ya analizada</span>
                    </>
                  ) : (
                    <>
                      <Cpu className="w-5 h-5" />
                      <span>{analizando ? 'Analizando imágenes con IA...' : 'Analizar con IA'}</span>
                    </>
                  )}
                </button>
                {imagenActiva?.ya_analizada && (
                  <p className="text-center text-xs text-slate-500 font-medium">
                    Esta foto ya cuenta con inspección registrada. Para un nuevo análisis de esta unidad, sube una foto reciente.
                  </p>
                )}
              </div>
            </div>
          </div>
          </div>
        )}
      </main>

      {vehiculoActual && (
        <div className="lg:hidden fixed bottom-6 left-0 right-0 px-4 max-w-md mx-auto z-10 space-y-2.5">
          <button
            type="button"
            disabled={subiendo}
            onClick={() => cameraInputRef.current?.click()}
            className="w-full py-3.5 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-white font-bold rounded-2xl shadow-lg shadow-slate-900/10 dark:shadow-slate-950/40 flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Camera className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <span>{subiendo ? 'Subiendo fotografía...' : 'Tomar foto con la cámara'}</span>
          </button>

          <button
            onClick={handleAnalizarConIA}
            disabled={analizando || !imagenActiva || imagenActiva.estado_calidad !== 'APROBADA' || Boolean(imagenActiva.ya_analizada)}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white font-bold rounded-2xl shadow-xl shadow-brand-600/30 flex items-center justify-center gap-2.5 text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
          >
            {imagenActiva?.ya_analizada ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                <span>Fotografía ya analizada</span>
              </>
            ) : (
              <>
                <Cpu className="w-5 h-5" />
                <span>{analizando ? 'Analizando imágenes con IA...' : 'Analizar con IA'}</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
