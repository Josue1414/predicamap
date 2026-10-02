// src/juego/ControlesMoviles.jsx
import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Hand } from 'lucide-react';

export default function ControlesMoviles({ mover, accion, paso }) {
  return (
    <div className="absolute bottom-6 left-0 w-full px-6 flex justify-between items-end z-[6000] md:hidden">
      
      {/* D-Pad */}
      <div className="grid grid-cols-3 gap-2 bg-slate-900/60 p-3 rounded-full backdrop-blur-md border border-slate-700">
        <div /> 
        <button 
          onClick={() => mover(0, -paso)} 
          className="bg-slate-700 text-white p-4 rounded-xl active:bg-indigo-500 shadow-md transition-colors">
          <ArrowUp size={24} />
        </button>
        <div />
        
        <button 
          onClick={() => mover(-paso, 0)} 
          className="bg-slate-700 text-white p-4 rounded-xl active:bg-indigo-500 shadow-md transition-colors">
          <ArrowLeft size={24} />
        </button>
        <button 
          onClick={() => mover(0, paso)} 
          className="bg-slate-700 text-white p-4 rounded-xl active:bg-indigo-500 shadow-md transition-colors">
          <ArrowDown size={24} />
        </button>
        <button 
          onClick={() => mover(paso, 0)} 
          className="bg-slate-700 text-white p-4 rounded-xl active:bg-indigo-500 shadow-md transition-colors">
          <ArrowRight size={24} />
        </button>
      </div>

      {/* Botón de Acción */}
      <div className="flex gap-3">
        <button 
          onClick={accion}
          className="bg-emerald-600 text-white w-16 h-16 rounded-full font-black active:bg-emerald-500 shadow-lg border-b-4 border-emerald-800 flex items-center justify-center transition-all active:translate-y-1 active:border-b-0">
          <Hand size={28} />
        </button>
      </div>

    </div>
  );
}