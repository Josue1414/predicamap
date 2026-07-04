// src/componentes/menu-lateral/SeccionSembrarCasas.jsx
import React from 'react';
import { MapPin, Info, ChevronRight } from 'lucide-react';
import VentanaFlotante from '../VentanaFlotante'; // IMPORTAMOS LA VENTANA FLOTANTE

export default function SeccionSembrarCasas({ 
  visible, 
  alActivarModoEdificios, 
  acordeonActivo, 
  alternarAcordeon, 
  alCerrar 
}) {
  if (!visible) return null;

  const estaAbierta = acordeonActivo === 'sembrar';

  const manejarInicioSembrado = () => {
    alActivarModoEdificios(); // 1. Activa la herramienta en el mapa
    alternarAcordeon('sembrar'); // 2. Cierra la ventana flotante
    alCerrar(); // 3. Cierra el menú lateral completo
  };

  return (
    <div className="mb-2">
      {/* BOTÓN DEL MENÚ LATERAL */}
      <button 
        onClick={() => alternarAcordeon('sembrar')}
        className="w-full p-3 flex justify-between items-center rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 shadow-sm transition-colors focus:outline-none"
      >
        <span className="font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <MapPin size={16} className="text-emerald-500" /> Sembrar Calles / Casas
        </span>
        <ChevronRight size={16} className="text-slate-400" />
      </button>
      
      {/* NUEVA VENTANA FLOTANTE */}
      <VentanaFlotante
        abierta={estaAbierta}
        alCerrar={() => alternarAcordeon('sembrar')}
        titulo="Sembrar Calles o Casas"
        icono={MapPin}
      >
        <div className="flex flex-col h-full">
          
          {/* BANNER DE INSTRUCCIONES CLARAS */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 px-4 py-3 border-b border-indigo-100 dark:border-indigo-800/50 flex items-start gap-3 shrink-0">
            <Info size={20} className="text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
            <div className="text-xs text-indigo-800 dark:text-indigo-300 leading-snug space-y-2">
              <p>
                <strong>Instrucciones:</strong> Toca el interior de un territorio en el mapa para sembrar puntos de referencia. Por defecto, representarán un <strong>Tramo de Calle o Banqueta</strong>.
              </p>
              <p>
                Si necesitas marcar un edificio o casa específica, podrás cambiar el tipo de inmueble desde el menú que se abrirá justo al crear el punto.
              </p>
            </div>
          </div>

          {/* CONTENEDOR DEL BOTÓN DE ACCIÓN */}
          <div className="p-5 space-y-5 text-sm bg-white dark:bg-slate-950 flex-1 overflow-y-auto scroll-limpio">
            
            <button 
              onClick={manejarInicioSembrado}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
            >
              <MapPin size={18} /> Ir al Mapa a Sembrar
            </button>

          </div>
        </div>
      </VentanaFlotante>
    </div>
  );
}