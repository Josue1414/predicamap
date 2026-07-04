// src/componentes/menu-lateral/SeccionBuscarMapa.jsx
import React from 'react';
import { Search, ChevronRight, MapPin } from 'lucide-react';
import VentanaFlotante from '../VentanaFlotante'; // IMPORTAMOS LA VENTANA FLOTANTE

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
  
  const estaAbierta = acordeonActivo === 'buscar';

  return (
    <div className="mb-2">
      {/* BOTÓN DEL MENÚ LATERAL */}
      <button 
        onClick={() => alternarAcordeon('buscar')} 
        className="w-full p-3 flex justify-between items-center rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 shadow-sm transition-colors"
      >
        <span className="font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Search size={16} className="text-slate-500"/> Buscar en el Mapa
        </span>
        <ChevronRight size={16} className="text-slate-400" />
      </button>
      
      {/* NUEVA VENTANA FLOTANTE */}
      <VentanaFlotante
        abierta={estaAbierta}
        alCerrar={() => alternarAcordeon('buscar')}
        titulo="Buscar en el Mapa"
        icono={Search}
      >
        <div className="p-5 flex flex-col h-full bg-slate-50 dark:bg-slate-950 flex-1">
          
          <form onSubmit={(e) => { e.preventDefault(); alBuscar(); }} className="flex gap-3 mb-2">
            <input 
              type="text" 
              value={textoBusqueda} 
              onChange={(e) => alCambiarTextoBusqueda(e.target.value)} 
              placeholder="Ej: Monterrey, Nuevo León..." 
              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-3.5 text-sm dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow shadow-sm font-medium" 
            />
            <button 
              type="submit" 
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 rounded-xl text-sm font-bold transition-colors shadow-md shadow-indigo-600/20 active:scale-95"
            >
              Ir
            </button>
          </form>
          
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 ml-1">Escribe la ciudad, municipio o colonia que deseas buscar.</p>

          {resultadosCiudades.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resultados ({resultadosCiudades.length})</span>
              </div>
              <ul className="overflow-y-auto max-h-[50vh] scroll-limpio">
                {resultadosCiudades.map((c, i) => (
                  <li 
                    key={i} 
                    onClick={() => { alSeleccionarCiudad(c); alCerrar(); alternarAcordeon('buscar'); }} 
                    className="p-4 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer dark:text-slate-300 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0 flex items-start gap-3 group"
                  >
                    <MapPin size={18} className="text-slate-400 group-hover:text-indigo-500 mt-0.5 shrink-0 transition-colors" />
                    <span className="text-sm font-medium leading-snug group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                      {c.display_name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Estado vacío cuando no hay resultados y el usuario ya buscó algo */}
          {resultadosCiudades.length === 0 && textoBusqueda.trim().length > 3 && (
            <div className="flex-1 flex flex-col items-center justify-center mt-10">
               <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
                 <Search size={24} className="text-slate-300 dark:text-slate-600" />
               </div>
               <p className="text-sm text-slate-500 font-medium">Presiona "Ir" para buscar lugares</p>
            </div>
          )}

        </div>
      </VentanaFlotante>
    </div>
  );
}