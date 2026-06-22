// src/componentes/menu-lateral/SeccionDibujarTerritorio.jsx
import React from 'react';
import { PenTool, ChevronUp, ChevronDown } from 'lucide-react';

export default function SeccionDibujarTerritorio({
  visible,
  nombreTerritorio,
  alCambiarNombre,
  colorTerritorio,
  alCambiarColor,
  notasTerritorio,
  alCambiarNotas,
  alEmpezarATrazar,
  PALETA_COLORES,
  acordeonActivo,
  alternarAcordeon,
  alCerrar
}) {
  if (!visible) return null;

  return (
    <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <button onClick={() => alternarAcordeon('crear')} className="w-full p-3 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
        <span className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <PenTool size={16} className="text-indigo-500"/> Dibujar Territorio
        </span>
        {acordeonActivo === 'crear' ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      
      {acordeonActivo === 'crear' && (
        <div className="p-4 space-y-3 text-xs bg-white dark:bg-slate-950">
          <input 
            type="text" 
            value={nombreTerritorio} 
            onChange={(e) => alCambiarNombre(e.target.value)} 
            placeholder="Nombre (Ej: Sección 1)" 
            className="w-full border rounded-lg p-2 dark:bg-slate-900 dark:border-slate-700 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none" 
          />
          
          <div className="grid grid-cols-4 gap-2">
            {PALETA_COLORES.map((color) => (
              <button 
                key={color.hex} 
                type="button" 
                onClick={() => alCambiarColor(color.hex)} 
                className={`h-8 rounded-lg border-2 transition-transform ${colorTerritorio === color.hex ? 'border-slate-900 dark:border-white scale-110 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`} 
                style={{ backgroundColor: color.hex }} 
                title={color.nombre}
              />
            ))}
          </div>
          
          <textarea 
            value={notasTerritorio} 
            onChange={(e) => alCambiarNotas(e.target.value)} 
            placeholder="Anotaciones sobre este nuevo territorio..." 
            rows="2" 
            className="w-full border rounded-lg p-2 dark:bg-slate-900 dark:border-slate-700 dark:text-white resize-none focus:ring-1 focus:ring-indigo-500 outline-none" 
          />
          
          <button 
            disabled={!nombreTerritorio.trim()} 
            onClick={() => { alEmpezarATrazar(); alCerrar(); }} 
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg disabled:opacity-50 transition-colors shadow-md shadow-indigo-600/20"
          >
            Ir al Mapa a Dibujar
          </button>
        </div>
      )}
    </div>
  );
}