// src/componentes/ControlesTrazado.jsx
import React from 'react';
import { Undo, Trash2, Save, X } from 'lucide-react';

export default function ControlesTrazado({
  puntosContados, alDeshacer, alLimpiar, alGuardar, alCancelar
}) {
  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-sm z-[2000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-3 animate-slide-up">
      
      <div className="flex justify-between items-center mb-2 px-1">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
          📍 Tocando mapa: {puntosContados} puntos
        </span>
        <button onClick={alCancelar} className="text-xs flex items-center gap-1 text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/30 px-2 py-1 rounded-lg">
          <X size={14} /> Cancelar
        </button>
      </div>

      <div className="flex gap-2">
        <button disabled={puntosContados === 0} onClick={alDeshacer} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold disabled:opacity-50 flex justify-center items-center gap-1">
          <Undo size={14} /> Deshacer
        </button>
        <button disabled={puntosContados === 0} onClick={alLimpiar} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold disabled:opacity-50 flex justify-center items-center gap-1">
          <Trash2 size={14} /> Limpiar
        </button>
        <button disabled={puntosContados < 3} onClick={alGuardar} className="flex-[1.5] py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold disabled:bg-slate-300 dark:disabled:bg-slate-800 flex justify-center items-center gap-1 shadow-lg shadow-indigo-600/20">
          <Save size={14} /> Guardar
        </button>
      </div>
    </div>
  );
}