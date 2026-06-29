// src/componentes/menu-lateral/SeccionSembrarCasas.jsx
import React from 'react';
import { MapPin, Info, ChevronUp, ChevronDown } from 'lucide-react';

export default function SeccionSembrarCasas({ 
  visible, 
  alActivarModoEdificios, 
  acordeonActivo, 
  alternarAcordeon, 
  alCerrar 
}) {
  if (!visible) return null;

  const estaExpandido = acordeonActivo === 'sembrar';

  const manejarInicioSembrado = () => {
    alActivarModoEdificios();
    alCerrar();
  };

  return (
    <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      
      <button 
        onClick={() => alternarAcordeon('sembrar')}
        className="w-full p-3 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
      >
        <span className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <MapPin size={16} className="text-emerald-500" /> Sembrar Calles / Casas
        </span>
        {estaExpandido ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      
      {estaExpandido && (
        <div className="p-4 space-y-4 text-xs bg-white dark:bg-slate-950 animate-fade-in">
          
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 shadow-sm border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
            <Info size={14} className="text-indigo-500 mt-0.5 flex-shrink-0" />
            <div className="text-[10px] text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
              <p>
                Toca sobre el mapa para sembrar puntos de referencia. Por defecto, representarán un <strong>Tramo de Calle o Banqueta</strong>.
              </p>
              <p>
                Si necesitas marcar un edificio o casa, podrás cambiar el tipo desde el menú que se abrirá al crear el punto.
              </p>
            </div>
          </div>

          <button 
            onClick={manejarInicioSembrado}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
          >
            <MapPin size={14} /> Ir al Mapa a Sembrar
          </button>

        </div>
      )}
    </div>
  );
}