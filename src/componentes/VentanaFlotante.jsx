// src/componentes/VentanaFlotante.jsx
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function VentanaFlotante({ abierta, alCerrar, titulo, children, icono: Icono }) {
  const alCerrarRef = useRef(alCerrar);
  // Creamos un ID único para el historial de esta ventana específica
  const modalId = useRef(`modal_${Date.now()}_${Math.random()}`).current;

  useEffect(() => { alCerrarRef.current = alCerrar; }, [alCerrar]);

  useEffect(() => {
    if (abierta) {
      document.body.style.overflow = 'hidden';
      
      // ★ 1. Nos anotamos en la lista global de ventanas
      window.modalesAbiertos = window.modalesAbiertos || [];
      window.modalesAbiertos.push(alCerrarRef);

      // ★ 2. Agregamos un estado al historial EXCLUSIVO para esta ventana
      window.history.pushState({ modalId }, "");

      const manejarBotonAtrasCelular = () => {
        // Verificamos si esta ventana es la que está hasta arriba
        const isTop = window.modalesAbiertos[window.modalesAbiertos.length - 1] === alCerrarRef;
        if (isTop) {
          alCerrarRef.current(); // Cerramos la ventana
        }
      };

      window.addEventListener('popstate', manejarBotonAtrasCelular);

      return () => {
        window.removeEventListener('popstate', manejarBotonAtrasCelular);
        
        // ★ 3. Al destruirse, nos borramos de la lista global
        window.modalesAbiertos = window.modalesAbiertos.filter(ref => ref !== alCerrarRef);
        
        // ★ 4. Si el historial aún tiene el ID de esta ventana (significa que la cerraste con la "X"), 
        // retrocedemos manualmente, pero le avisamos al Dashboard que lo ignore.
        if (window.history.state && window.history.state.modalId === modalId) {
          window.ignorarSiguientePopstate = true;
          window.history.back();
          // Limpiamos la bandera de ignorar por seguridad
          setTimeout(() => { window.ignorarSiguientePopstate = false; }, 100);
        }
        
        document.body.style.overflow = 'unset';
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [abierta, modalId]);

  if (!abierta) return null;

  return createPortal(
    <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4 sm:p-6">
      
      {/* Fondo oscuro desenfocado */}
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
          
          <button 
            onClick={alCerrar}
            className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 hover:text-rose-600 dark:text-slate-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all active:scale-95"
            title="Volver al menú"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-4 overflow-y-auto scroll-limpio flex-1 bg-slate-50/50 dark:bg-slate-900/50">
          {children}
        </div>

      </div>
    </div>,
    document.body
  );
}