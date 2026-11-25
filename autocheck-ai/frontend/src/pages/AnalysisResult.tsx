import React from 'react';
import { ArrowLeft, CheckCircle2, ShieldCheck, Download, RefreshCw, User, Cpu } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';

interface AnalysisResultProps {
  vehiculo: any;
  inspeccion: any;
  from?: string;
  origenPrevio?: string;
  onNavigate: (page: string, params?: any) => void;
  onBack?: () => void;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({
  vehiculo,
  inspeccion,
  from,
  origenPrevio,
  onNavigate,
  onBack,
}) => {
  const { user, isAdmin } = useAuth();
  const esPropietario = user?.rol === 'PROPIETARIO';
  const esDesdeHistorial = from === 'history';
  const resultados = inspeccion?.resultados || [];
  const bannerTiempo = inspeccion?.banner_tiempo || `Análisis completado en ${inspeccion?.tiempo_total_seg || 4.2}s`;

  const textoVolver =
    from === 'upload_photos'
      ? 'Volver a cargar fotos'
      : from === 'history' || origenPrevio === 'history'
      ? 'Volver al historial'
      : origenPrevio === 'vehicles'
      ? 'Volver al catálogo vehicular'
      : 'Volver al inicio';

  const handleVolver = () => {
    if (from === 'upload_photos') {
      onNavigate('upload_photos', {
        vehiculo,
        from: origenPrevio,
      });
      return;
    }
    if (from === 'history' || origenPrevio === 'history') {
      onNavigate('history', {
        vehiculo,
        from: origenPrevio === 'vehicles' ? 'vehicles' : undefined,
      });
      return;
    }
    if (origenPrevio === 'vehicles') {
      onNavigate('vehicles');
      return;
    }
    onNavigate('dashboard');
  };

  const handleNuevaInspeccion = () => {
    sessionStorage.removeItem('autocheck_upload_vehiculo');
    onNavigate('upload_photos', {
      vehiculo: null,
      from: 'dashboard',
    });
  };

  const handleDescargarPDF = async () => {
    if (!inspeccion?.id) return;
    try {
      const response = await api.get(`/reportes/individual/${inspeccion.id}/`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `reporte_inspeccion_${vehiculo?.placa || inspeccion?.vehiculo_placa || 'autocheck'}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Error al descargar el PDF:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12 transition-colors">
      <header className="bg-slate-900 text-white sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-3.5 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleVolver}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white font-medium text-sm p-1.5 -ml-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              title={textoVolver}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline text-xs text-slate-400 hover:text-slate-200">
                {textoVolver}
              </span>
            </button>
            <div className="h-4 w-px bg-slate-700" />
            <h1 className="font-bold text-white text-base tracking-tight">Resultado del análisis</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="text-xs bg-slate-800 text-brand-400 px-3 py-1 rounded-full font-mono font-bold border border-slate-700">
              {vehiculo?.placa || inspeccion?.vehiculo_placa}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 space-y-4">
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{bannerTiempo}</span>
          </div>
          <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-900/60 px-2.5 py-0.5 rounded-full">
            Diagnóstico verificado
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              <strong>Usuario responsable:</strong> {inspeccion?.usuario_nombre || user?.nombre_completo || 'Usuario del sistema'}
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <Cpu className="w-4 h-4 text-brand-500 shrink-0" />
            <span>
              <strong>Modelo IA:</strong> {inspeccion?.version_modelo || 'v1.3'}
            </span>
          </div>
          <div className="text-slate-400 font-mono text-[11px]">
            {inspeccion?.fecha_inspeccion
              ? new Date(inspeccion.fecha_inspeccion).toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'short' })
              : 'Auditoría registrada'}
          </div>
        </div>

        {resultados.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-3 shadow-sm transition-colors">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="text-base font-bold text-slate-800 dark:text-white">Inspección completada</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              No se registraron daños críticos en la carrocería de la unidad.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {resultados.map((res: any) => {
              const esSinDano = res.categoria === 'SIN_DANO';
              return (
                <div
                  key={res.id}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    {res.imagen_url ? (
                      <img
                        src={res.imagen_url}
                        alt={res.titulo_tarjeta}
                        className="w-14 h-14 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 shrink-0">
                        <ShieldCheck className="w-7 h-7" />
                      </div>
                    )}

                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">
                        {esSinDano
                          ? `Sin daño detectado · ${res.imagen_zona?.toLowerCase() || 'zona'}`
                          : (res.titulo_tarjeta || `${res.categoria_display} · ${res.imagen_zona?.toLowerCase()}`)}
                      </h4>
                      <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-bold border ${
                        esSinDano
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200/80 dark:border-amber-800'
                      }`}>
                        {esSinDano
                          ? `Superficie óptima (${res.porcentaje_confianza || `${Math.round((res.confianza || 0) * 100)}%`})`
                          : `Confianza ${res.porcentaje_confianza || `${Math.round((res.confianza || 0) * 100)}%`}`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className={`flex flex-col sm:flex-row items-center gap-3 pt-2 ${!isAdmin || (esDesdeHistorial && !isAdmin) ? 'justify-center' : ''}`}>
          {isAdmin && (
            <button
              onClick={handleDescargarPDF}
              className={`w-full sm:w-auto flex-1 py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-sm transition-all cursor-pointer ${
                esDesdeHistorial
                  ? 'bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white font-bold shadow-lg shadow-brand-600/20'
                  : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-white font-semibold shadow-sm'
              }`}
            >
              <Download className={`w-4 h-4 ${esDesdeHistorial ? 'text-white' : 'text-brand-600 dark:text-brand-400'}`} />
              Descargar reporte técnico en PDF
            </button>
          )}
          {esDesdeHistorial ? (
            <button
              onClick={handleVolver}
              className={`w-full sm:w-auto py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm transition-all cursor-pointer ${
                isAdmin
                  ? 'flex-1 px-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-white font-semibold shadow-sm'
                  : 'px-6 bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white font-bold shadow-lg shadow-brand-600/20'
              }`}
            >
              <ArrowLeft className={`w-4 h-4 ${isAdmin ? 'text-slate-700 dark:text-slate-300' : 'text-white'}`} />
              Volver al historial
            </button>
          ) : !esPropietario ? (
            <button
              onClick={handleNuevaInspeccion}
              className={`w-full sm:w-auto py-3.5 bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white font-bold rounded-2xl shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2 text-sm transition-all cursor-pointer ${
                isAdmin ? 'flex-1 px-4' : 'px-6'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              Nueva inspección
            </button>
          ) : (
            <button
              onClick={handleVolver}
              className="w-full sm:w-auto px-6 py-3.5 bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white font-bold rounded-2xl shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2 text-sm transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al historial
            </button>
          )}
        </div>
      </main>
    </div>
  );
};
