// src/componentes/VentanaFlotante.jsx
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function VentanaFlotante({ abierta, alCerrar, titulo, children, icono: Icono }) {
  // Prevenir el scroll del fondo cuando la ventana está abierta
  useEffect(() => {
    if (abierta) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [abierta]);

  if (!abierta) return null;

  // createPortal inyecta este HTML directamente al final del <body>, por encima de todo.
  return createPortal(
    <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4 sm:p-6">
      
      {/* Fondo oscuro desenfocado. Al hacer clic aquí, se cierra la ventana. */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={alCerrar}
      />

      {/* Contenedor principal de la ventana */}
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] animate-slide-up border border-slate-200 dark:border-slate-800">
        
        {/* Cabecera flotante */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shrink-0">
          <div className="flex items-center gap-3">
            {Icono && <Icono size={22} className="text-indigo-600 dark:text-indigo-400" />}
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 tracking-tight">
              {titulo}
            </h3>
          </div>
          
          {/* Botón de cerrar para volver al menú */}
          <button 
            onClick={alCerrar}
            className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 hover:text-rose-600 dark:text-slate-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all active:scale-95"
            title="Volver al menú"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido scrolleable de tu sección */}
        <div className="p-4 overflow-y-auto scroll-limpio flex-1 bg-slate-50/50 dark:bg-slate-900/50">
          {children}
        </div>

      </div>
    </div>,
    document.body
  );
}