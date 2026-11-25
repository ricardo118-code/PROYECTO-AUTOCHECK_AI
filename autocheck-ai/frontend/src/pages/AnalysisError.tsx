import React from 'react';
import { ArrowLeft, AlertOctagon, RotateCcw } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

interface AnalysisErrorProps {
  vehiculo: any;
  motivo?: string;
  onNavigate: (page: string, params?: any) => void;
  onBack?: () => void;
}

export const AnalysisError: React.FC<AnalysisErrorProps> = ({
  vehiculo,
  motivo,
  onNavigate,
  onBack,
}) => {
  const handleVolver = () => {
    if (onBack) {
      onBack();
    } else {
      onNavigate('upload_photos', { vehiculo });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between pb-10 transition-colors">
      <header className="bg-slate-900 text-white sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-3.5 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleVolver}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white font-medium text-sm p-1.5 -ml-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              title="Volver a cargar fotos"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline text-xs text-slate-400 hover:text-slate-200">Volver a cargar fotos</span>
            </button>
            <div className="h-4 w-px bg-slate-700" />
            <h1 className="font-bold text-white text-base tracking-tight">Error de calidad</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {vehiculo && (
              <span className="text-xs bg-slate-800 text-brand-400 px-3 py-1 rounded-full font-mono font-bold border border-slate-700">
                {vehiculo.placa}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6 flex-1 flex flex-col justify-center">
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-sm font-bold flex items-center gap-3 shadow-sm">
          <AlertOctagon className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>Error al procesar la imagen</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-center space-y-3 transition-colors">
          <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
            <AlertOctagon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Fotografía no apta para análisis
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            {motivo ||
              'La fotografía presenta desenfoque severo o una resolución inferior a la requerida (800x600 px).'}
          </p>
          <div className="pt-2 text-xs text-slate-400 dark:text-slate-500">
            Asegúrate de que la cámara esté bien enfocada y con buena iluminación.
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <button
            onClick={() => onNavigate('upload_photos', { vehiculo })}
            className="w-full sm:w-[calc(50%-6px)] py-3.5 px-4 bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white font-bold rounded-2xl shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2 text-sm transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Volver a intentar
          </button>
        </div>
      </main>
    </div>
  );
};
