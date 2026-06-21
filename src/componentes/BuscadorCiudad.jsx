// src/componentes/BuscadorCiudad.jsx
import React from 'react';
import { Search, Map } from 'lucide-react';

export default function BuscadorCiudad({ 
  textoBusqueda, 
  alCambiarTexto, 
  alBuscar, 
  resultados, 
  alSeleccionarCiudad 
}) {
  
  const manejarEnvio = (evento) => {
    evento.preventDefault();
    alBuscar();
  };

  return (
    <div className="absolute top-18 left-4 right-4 md:left-20 md:right-auto md:w-80 z-[2000] flex flex-col gap-1.5">
      <form 
        onSubmit={manejarEnvio}
        className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center px-3 py-1.5 gap-2 transition-colors duration-200"
      >
        <Search size={16} className="text-slate-400 flex-shrink-0" />
        <input 
          type="text"
          value={textoBusqueda}
          onChange={(e) => alCambiarTexto(e.target.value)}
          placeholder="Buscar ciudad o municipio..."
          className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 focus:outline-none placeholder-slate-400 dark:placeholder-slate-500"
        />
        <button 
          type="submit"
          className="text-[11px] bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-2.5 py-1 rounded-md shadow-md shadow-indigo-600/20 transition-colors"
        >
          Ir
        </button>
      </form>

      {/* Lista Desplegable de Ciudades Encontradas */}
      {resultados.length > 0 && (
        <ul className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl max-h-48 overflow-y-auto scroll-limpio py-1 text-xs">
          {resultados.map((ciudad, indice) => (
            <li 
              key={indice}
              onClick={() => alSeleccionarCiudad(ciudad)}
              className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/50 last:border-0"
            >
              <Map size={14} className="text-indigo-500 flex-shrink-0" />
              <span className="truncate">{ciudad.display_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}