// src/componentes/menu-lateral/SeccionBuscarMapa.jsx
import React from 'react';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';

export default function SeccionBuscarMapa({
  textoBusqueda,
  alCambiarTextoBusqueda,
  alBuscar,
  resultadosCiudades,
  alSeleccionarCiudad,
  acordeonActivo,
  alternarAcordeon,
  alCerrar
}) {
  return (
    <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <button onClick={() => alternarAcordeon('buscar')} className="w-full p-3 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
        <span className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <Search size={16} className="text-slate-500"/> Buscar en el Mapa
        </span>
        {acordeonActivo === 'buscar' ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      
      {acordeonActivo === 'buscar' && (
        <div className="p-3 bg-white dark:bg-slate-950">
          <form onSubmit={(e) => { e.preventDefault(); alBuscar(); }} className="flex gap-2">
            <input 
              type="text" 
              value={textoBusqueda} 
              onChange={(e) => alCambiarTextoBusqueda(e.target.value)} 
              placeholder="Ej: Monterrey, México..." 
              className="w-full border rounded-lg p-2 text-xs dark:bg-slate-900 dark:border-slate-700 dark:text-white" 
            />
            <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white px-3 rounded-lg text-xs font-bold transition-colors">
              Ir
            </button>
          </form>
          {resultadosCiudades.length > 0 && (
            <ul className="mt-2 border rounded-lg max-h-32 overflow-y-auto text-xs dark:border-slate-800 scroll-limpio">
              {resultadosCiudades.map((c, i) => (
                <li key={i} onClick={() => { alSeleccionarCiudad(c); alCerrar(); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer truncate dark:text-slate-300 transition-colors">
                  {c.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}