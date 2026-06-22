// src/componentes/menu-lateral/SeccionHistorial.jsx
import React from 'react';
import { Clock, ChevronUp, ChevronDown } from 'lucide-react';

export default function SeccionHistorial({
  visible,
  acordeonActivo,
  alternarAcordeon
}) {
  if (!visible) return null;

  return (
    <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden opacity-75 mt-2">
      <button onClick={() => alternarAcordeon('historial')} className="w-full p-3 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
        <span className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <Clock size={16} className="text-amber-500"/> Historial de Actividad
        </span>
        {acordeonActivo === 'historial' ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      
      {acordeonActivo === 'historial' && (
        <div className="p-4 bg-white dark:bg-slate-950 text-center">
          <Clock size={32} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
          <p className="text-xs text-slate-500 font-bold">Módulo Próximamente</p>
          <p className="text-[10px] text-slate-400 mt-1">Registros de actividad y logs de auditoría de campo.</p>
        </div>
      )}
    </div>
  );
}