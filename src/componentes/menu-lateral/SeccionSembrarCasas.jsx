// src/componentes/menu-lateral/SeccionSembrarCasas.jsx
import React from 'react';
import { Home, ChevronUp, ChevronDown } from 'lucide-react';

export default function SeccionSembrarCasas({
  visible,
  alActivarModoEdificios,
  acordeonActivo,
  alternarAcordeon,
  alCerrar
}) {
  if (!visible) return null;

  return (
    <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <button onClick={() => alternarAcordeon('casas')} className="w-full p-3 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
        <span className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <Home size={16} className="text-emerald-500"/> Sembrar Casas
        </span>
        {acordeonActivo === 'casas' ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      
      {acordeonActivo === 'casas' && (
        <div className="p-4 bg-white dark:bg-slate-950">
          <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
            Activa este modo para dar toques sobre los techos en el mapa satelital y crear puntos de predicación dentro de los territorios dibujados.
          </p>
          <button 
            onClick={() => { alActivarModoEdificios(); alCerrar(); }} 
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg shadow-emerald-600/20 text-xs flex justify-center items-center gap-2 transition-transform active:scale-95"
          >
            <Home size={14} /> Iniciar Siembra
          </button>
        </div>
      )}
    </div>
  );
}