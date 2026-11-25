import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ArrowLeft, AlertTriangle, CheckCircle2, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';

interface CompareInspectionsProps {
  vehiculo: any;
  inspeccion_1_id: number;
  inspeccion_2_id: number;
  from?: string;
  onNavigate: (page: string, params?: any) => void;
  onBack?: () => void;
}

export const CompareInspections: React.FC<CompareInspectionsProps> = ({
  vehiculo,
  inspeccion_1_id,
  inspeccion_2_id,
  from,
  onNavigate,
  onBack,
}) => {
  const { isAdmin } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const handleVolver = () => {
    onNavigate('history', { vehiculo, from });
  };

  useEffect(() => {
    const comparar = async () => {
      try {
        setLoading(true);
        const res = await api.post('/historial/comparar/', {
          inspeccion_1_id,
          inspeccion_2_id,
        });
        setData(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (!inspeccion_1_id || !inspeccion_2_id) {
      setLoading(false);
      return;
    }

    comparar();
  }, [inspeccion_1_id, inspeccion_2_id]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between pb-10 transition-colors duration-200">

      <header className="bg-slate-900 text-white sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-3.5 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleVolver}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white font-medium text-sm p-1.5 -ml-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              title="Volver al historial"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline text-xs text-slate-400 hover:text-slate-200">Volver al historial</span>
            </button>
            <div className="h-4 w-px bg-slate-700" />
            <h1 className="font-bold text-white text-base tracking-tight">Comparar inspecciones</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="text-xs bg-slate-800 text-brand-400 px-3 py-1 rounded-full font-mono font-bold border border-slate-700">
              {vehiculo?.placa || data?.vehiculo_placa}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6 flex-1">
        {!inspeccion_1_id || !inspeccion_2_id ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-3">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
            <h4 className="text-base font-bold text-slate-800 dark:text-white">Selección de inspecciones incompleta</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Debes marcar dos inspecciones en el historial para contrastar la evolución de la carrocería.
            </p>
            <button
              onClick={() => onNavigate('history', { vehiculo })}
              className="mt-2 px-5 py-2.5 bg-brand-600 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer hover:bg-brand-700"
            >
              Volver al historial
            </button>
          </div>
        ) : loading ? (
          <div className="text-center py-16 text-slate-400 text-sm space-y-3">
            <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Comparando inspecciones de carrocería...</p>
          </div>
        ) : (
          <>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
     
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 block">
                      Más reciente
                    </span>
                    {data?.inspeccion_reciente?.id && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-100 dark:border-brand-900/60">
                        Inspección #{data.inspeccion_reciente.id}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    {data?.inspeccion_reciente?.fecha || '12 sept 2026'}
                  </h4>
                </div>
                {data?.inspeccion_reciente?.items?.length === 0 ? (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 py-1">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> Sin daños registrados
                  </p>
                ) : (
                  <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
                    {data?.inspeccion_reciente?.items?.map((item: string, i: number) => (
                      <li key={i} className="flex items-center gap-2 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                      Anterior
                    </span>
                    {data?.inspeccion_anterior?.id && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        Inspección #{data.inspeccion_anterior.id}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    {data?.inspeccion_anterior?.fecha || '01 sept 2026'}
                  </h4>
                </div>
                {data?.inspeccion_anterior?.items?.length === 0 ? (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 py-1">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> Sin daños registrados
                  </p>
                ) : (
                  <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
                    {data?.inspeccion_anterior?.items?.map((item: string, i: number) => (
                      <li key={i} className="flex items-center gap-2 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div
              className={`p-4 rounded-2xl border text-sm font-bold flex items-center gap-3 shadow-sm ${
                data?.tiene_danos_nuevos
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300'
              }`}
            >
              {data?.tiene_danos_nuevos ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              )}
              <span>{data?.alerta_diferencial || '⚠️ Nuevo daño detectado: Rayón en puerta derecha'}</span>
            </div>

            <div className={`flex flex-col sm:flex-row items-center gap-3 pt-2 ${!isAdmin ? 'justify-center' : ''}`}>
              {isAdmin && (
                <button
                  onClick={() =>
                    onNavigate('generate_report', {
                      vehiculo,
                      tipoReporte: 'comparativo',
                      from: 'compare',
                      inspeccion_1_id,
                      inspeccion_2_id,
                      fechaDesde: data?.fecha_desde,
                      fechaHasta: data?.fecha_hasta,
                    })
                  }
                  className="w-full sm:w-auto flex-1 py-3.5 px-4 bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white font-bold rounded-2xl shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2 text-sm transition-all cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  Generar reporte comparativo
                </button>
              )}
              <button
                onClick={handleVolver}
                className={`w-full sm:w-auto py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm transition-all cursor-pointer ${
                  isAdmin
                    ? 'flex-1 px-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold shadow-sm'
                    : 'px-6 bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white font-bold shadow-lg shadow-brand-600/20'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al historial
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
