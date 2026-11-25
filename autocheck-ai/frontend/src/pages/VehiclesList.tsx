import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Search, Plus, Camera, CheckCircle2, AlertCircle, Clock, Car, X, Pencil } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { normalizarTexto } from '../utils/formatters';

interface Vehiculo {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  propietario?: number;
  propietario_nombre?: string;
  propietario_email?: string;
  estado_inspeccion: 'PENDIENTE' | 'INSPECCIONADO';
  estado_display: string;
}

interface VehiclesListProps {
  onNavigate: (page: string, params?: any) => void;
  onBack?: () => void;
}

export const VehiclesList: React.FC<VehiclesListProps> = ({ onNavigate, onBack }) => {
  const { user } = useAuth();
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'TODOS' | 'INSPECCIONADOS' | 'PENDIENTES'>('TODOS');
  const [loading, setLoading] = useState(true);

  const esPropietario = user?.rol === 'PROPIETARIO';

  const handleVolver = () => {
    onNavigate('dashboard');
  };

  const cargarVehiculos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vehiculos/');
      setVehiculos(response.data || []);
    } catch (error) {
      console.error('Error al cargar vehículos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarVehiculos();
  }, []);

  const vehiculosFiltrados = useMemo(() => {
    const query = normalizarTexto(search.trim());
    const terminos = query.split(/\s+/).filter(Boolean);

    return vehiculos.filter((v) => {
      if (filtroEstado === 'INSPECCIONADOS' && v.estado_inspeccion !== 'INSPECCIONADO') return false;
      if (filtroEstado === 'PENDIENTES' && v.estado_inspeccion === 'INSPECCIONADO') return false;

      if (terminos.length === 0) return true;

      const corpus = normalizarTexto(
        `${v.placa} ${v.marca} ${v.modelo} ${v.anio} ${v.propietario_nombre || ''} ${v.estado_inspeccion || ''} ${v.estado_display || ''}`
      );

      return terminos.every((termino) => corpus.includes(termino));
    });
  }, [vehiculos, search, filtroEstado]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 transition-colors duration-200">
      
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
            <h1 className="font-bold text-white text-base tracking-tight">
              {esPropietario ? 'Mis vehículos' : 'Catálogo vehicular'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {vehiculos.length > 0 && (
              <button
                onClick={() => onNavigate('vehicle_form')}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Registrar vehículo
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 px-1">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {esPropietario
              ? 'Consulta el estado técnico y administra la información de tus unidades.'
              : 'Administra, filtra y consulta todas las unidades registradas en la plataforma.'}
          </p>
          <span className="text-xs font-medium text-slate-400">
            {search || filtroEstado !== 'TODOS'
              ? `Mostrando ${vehiculosFiltrados.length} de ${vehiculos.length} vehículos`
              : `${vehiculos.length} ${vehiculos.length === 1 ? 'vehículo registrado' : 'vehículos registrados'}`}
          </span>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por placa, marca o modelo..."
              className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-600 shadow-sm transition-colors"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
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
              { id: 'INSPECCIONADOS', label: `Inspeccionados (${vehiculos.filter((v) => v.estado_inspeccion === 'INSPECCIONADO').length})` },
              { id: 'PENDIENTES', label: `Pendientes (${vehiculos.filter((v) => v.estado_inspeccion !== 'INSPECCIONADO').length})`, esAlerta: vehiculos.some((v) => v.estado_inspeccion !== 'INSPECCIONADO') },
            ].map((tab: any) => {
              const activo = filtroEstado === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFiltroEstado(tab.id)}
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
          <div className="text-center py-12 text-slate-400 text-sm space-y-3">
            <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Cargando catálogo vehicular...</p>
          </div>
        ) : vehiculosFiltrados.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-4 shadow-sm">
            <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <Car className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-800 dark:text-white">
                {search || filtroEstado !== 'TODOS'
                  ? 'Sin coincidencias'
                  : esPropietario
                    ? 'No tienes vehículos registrados'
                    : 'No hay vehículos en el catálogo'}
              </h4>
              <p className="text-slate-500 dark:text-slate-400 text-xs max-w-sm mx-auto">
                {search
                  ? `No se encontró ningún vehículo con la placa, marca o modelo "${search}".`
                  : filtroEstado !== 'TODOS'
                  ? 'No hay unidades registradas en la categoría seleccionada.'
                  : esPropietario
                    ? 'Registra tu vehículo para consultar su estado e inspecciones.'
                    : 'Registra una unidad para comenzar a gestionar sus inspecciones.'}
              </p>
            </div>
            {search || filtroEstado !== 'TODOS' ? (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setFiltroEstado('TODOS');
                }}
                className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 font-semibold cursor-pointer underline"
              >
                Restablecer búsqueda y filtros
              </button>
            ) : (
              <button
                onClick={() => onNavigate('vehicle_form')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-semibold hover:bg-brand-700 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {esPropietario ? 'Registrar mi vehículo' : 'Registrar vehículo'}
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
                  className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-brand-400 dark:hover:border-brand-500 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">

                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm rounded-xl tracking-wider border border-slate-200/60 dark:border-slate-700 font-mono group-hover:bg-brand-50 dark:group-hover:bg-brand-950/40 group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors">
                        {v.placa}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            esInspeccionado
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {esInspeccionado ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          )}
                          {esInspeccionado ? 'Inspeccionado' : 'Pendiente'}
                        </span>
                        <button
                          onClick={() => onNavigate('vehicle_form', { vehiculo: v })}
                          title="Editar datos del vehículo"
                          className="p-1.5 rounded-xl text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {v.marca} {v.modelo}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Año: {v.anio}
                        {!esPropietario && v.propietario_nombre && (
                          <span> · Propietario: {v.propietario_nombre}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    {esPropietario ? (
                      esInspeccionado ? (
                        <button
                          onClick={() => onNavigate('history', { vehiculo: v, from: 'vehicles' })}
                          className="flex-1 py-2.5 px-4 rounded-xl border border-brand-600 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm shadow-brand-600/20"
                        >
                          <Clock className="w-4 h-4" />
                          Ver historial de inspecciones
                        </button>
                      ) : (
                        <div className="w-full py-2.5 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-medium text-center flex items-center justify-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Pendiente de inspección técnica.</span>
                        </div>
                      )
                    ) : (
                      <>
                        <button
                          onClick={() => onNavigate('upload_photos', { vehiculo: v, from: 'vehicles' })}
                          className="flex-1 py-2.5 px-3 rounded-xl border border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-950/40 hover:bg-brand-100/60 dark:hover:bg-brand-900/60 text-brand-700 dark:text-brand-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Camera className="w-4 h-4 text-brand-600" />
                          Cargar fotos
                        </button>
                        {esInspeccionado && (
                          <button
                            onClick={() => onNavigate('history', { vehiculo: v, from: 'vehicles' })}
                            className="py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                          >
                            Historial
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {vehiculos.length > 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-4 max-w-md mx-auto z-10 md:hidden">
          <button
            onClick={() => onNavigate('vehicle_form')}
            className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-2xl shadow-xl shadow-brand-600/30 flex items-center justify-center gap-2 text-base transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Registrar vehículo
          </button>
        </div>
      )}
    </div>
  );
};
