import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const esOscuro = theme === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={esOscuro}
      onClick={(e) => {
        toggleTheme();
        (e.currentTarget as HTMLElement).blur();
      }}
      title={esOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-300 ease-in-out outline-none focus:outline-none focus:ring-0 active:outline-none active:ring-0 select-none ${
        esOscuro
          ? 'bg-slate-800 border border-slate-700 hover:bg-slate-750'
          : 'bg-slate-200 border border-slate-300 hover:bg-slate-300'
      }`}
    >
      <span className="sr-only">
        {esOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      </span>

      <span
        className={`absolute left-1 top-1/2 -translate-y-1/2 text-amber-500 transition-opacity duration-300 pointer-events-none ${
          esOscuro ? 'opacity-40' : 'opacity-0'
        }`}
      >
        <Sun className="w-3 h-3" />
      </span>

      <span
        className={`absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 transition-opacity duration-300 pointer-events-none ${
          esOscuro ? 'opacity-0' : 'opacity-40'
        }`}
      >
        <Moon className="w-3 h-3" />
      </span>

      <span
        className={`pointer-events-none flex h-5 w-5 items-center justify-center rounded-full shadow-md transform transition-all duration-300 ease-in-out ${
          esOscuro
            ? 'translate-x-6 bg-slate-900 text-indigo-300 border border-slate-700/80 shadow-slate-950/60'
            : 'translate-x-0 bg-white text-amber-500 border border-slate-200/80 shadow-slate-400/30'
        }`}
      >
        {esOscuro ? (
          <Moon className="w-3 h-3 fill-indigo-300/30 transition-transform duration-300" />
        ) : (
          <Sun className="w-3 h-3 fill-amber-500/30 transition-transform duration-300" />
        )}
      </span>
    </button>
  );
};
