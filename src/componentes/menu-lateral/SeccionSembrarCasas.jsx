// src/componentes/menu-lateral/SeccionSembrarCasas.jsx
import React from 'react';
import { MapPin, Info, ChevronDown } from 'lucide-react';

export default function SeccionSembrarCasas({ 
  visible, 
  alActivarModoEdificios, 
  acordeonActivo, 
  alternarAcordeon, 
  alCerrar 
}) {
  // Si no tiene permisos, no renderiza nada
  if (visible === false) return null;

  // Verificamos si este acordeón en particular está abierto
  const estaExpandido = acordeonActivo === 'sembrar';

  // Función que activa el modo mapa y cierra el menú lateral
  const manejarInicioSembrado = () => {
    alActivarModoEdificios();
    alCerrar(); // Cierra el menú lateral para dejar ver el mapa en celulares
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 transition-colors overflow-hidden">
      
      {/* BOTÓN DEL ACORDEÓN (CABECERA) */}
      <button 
        onClick={() => alternarAcordeon('sembrar')}
        className="w-full flex items-center justify-between p-4 focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <MapPin size={16} />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Sembrar Calles / Casas</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Añade marcadores al territorio</p>
          </div>
        </div>
        <ChevronDown size={18} className={`text-slate-400 transition-transform duration-200 ${estaExpandido ? 'rotate-180' : ''}`} />
      </button>
      
      {/* CONTENIDO DESPLEGABLE */}
      {estaExpandido && (
        <div className="px-4 pb-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm border border-slate-100 dark:border-slate-700 mb-4 flex items-start gap-2.5">
            <Info size={14} className="text-indigo-500 mt-0.5 flex-shrink-0" />
            <div className="text-[10px] text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
              <p>
                Toca sobre el mapa para sembrar puntos de referencia. Por defecto, cada punto representará un <strong>Tramo de Calle o Banqueta</strong>.
              </p>
              <p>
                Si necesitas marcar un edificio o casa en particular, podrás cambiar el tipo desde el menú que se abrirá al crear el punto.
              </p>
            </div>
          </div>

          <button 
            onClick={manejarInicioSembrado}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl transition-all shadow-lg shadow-slate-200 dark:shadow-none flex items-center justify-center gap-2"
          >
            <MapPin size={14} /> Iniciar Sembrado de Mapa
          </button>
        </div>
      )}
    </div>
  );
}