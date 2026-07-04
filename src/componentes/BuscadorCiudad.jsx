// src/componentes/BuscadorCiudad.jsx
import React from 'react';
import { Search, MapPin } from 'lucide-react';

export default function BuscadorCiudad({
  textoBusqueda,
  alCambiarTextoBusqueda,
  alBuscar,
  resultadosCiudades = [],
  alSeleccionarCiudad
}) {

  // ★ AQUÍ SOLUCIONAMOS EL ERROR DEL ENTER ★
  const manejarEnvio = (e) => {
    e.preventDefault(); // Evitamos que la página se recargue en este componente
    if (alBuscar) {
      alBuscar(e); // <-- ¡LA CLAVE ESTÁ AQUÍ! Pasamos el evento 'e' hacia la función padre
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      
      {/* FORMULARIO DE BÚSQUEDA */}
      <form onSubmit={manejarEnvio} className="flex gap-3 mb-2">
        <input 
          type="text" 
          value={textoBusqueda} 
          onChange={(e) => alCambiarTextoBusqueda(e.target.value)} 
          placeholder="Ej: Zapopan, Jalisco..." 
          className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-3.5 text-sm bg-white dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow shadow-sm font-medium" 
        />
        <button 
          type="submit" 
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 rounded-xl text-sm font-bold transition-colors shadow-md shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2"
        >
          <Search size={16} /> Ir
        </button>
      </form>

      {/* LISTA DE RESULTADOS */}
      {resultadosCiudades && resultadosCiudades.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden mt-4 flex-1 flex flex-col animate-slide-up">
          <div className="bg-slate-50 dark:bg-slate-900/50 p-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Resultados ({resultadosCiudades.length})
            </span>
          </div>
          <ul className="overflow-y-auto max-h-[50vh] scroll-limpio">
            {resultadosCiudades.map((c, i) => (
              <li 
                key={i} 
                onClick={() => alSeleccionarCiudad(c)} 
                className="p-4 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer border-b border-slate-100 dark:border-slate-800 last:border-0 flex items-start gap-3 group transition-colors"
              >
                <MapPin size={18} className="text-slate-400 group-hover:text-indigo-500 mt-0.5 shrink-0 transition-colors" />
                <span className="text-sm font-medium leading-snug text-slate-700 dark:text-slate-300 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors text-left">
                  {c.display_name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ESTADO VACÍO */}
      {(!resultadosCiudades || resultadosCiudades.length === 0) && textoBusqueda.trim().length > 3 && (
        <div className="flex-1 flex flex-col items-center justify-center mt-10">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
            <Search size={24} className="text-slate-300 dark:text-slate-600" />
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Presiona "Ir" o "Enter" para buscar lugares
          </p>
        </div>
      )}
      
    </div>
  );
}