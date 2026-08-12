// src/componentes/ActualizacionPWA.jsx
import React from 'react';
// Este import viene directamente del plugin que instalamos
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';

export default function ActualizacionPWA() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('Service Worker registrado:', r);
    },
    onRegisterError(error) {
      console.error('Error al registrar el Service Worker:', error);
    },
  });

  // Si no hay necesidad de refrescar, no mostramos nada
  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[5000] bg-white dark:bg-slate-900 border border-indigo-500 rounded-xl shadow-2xl p-4 max-w-sm animate-slide-up flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
          ¡Nueva versión disponible!
        </h3>
        <button 
          onClick={() => setNeedRefresh(false)} 
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X size={16} />
        </button>
      </div>
      
      <p className="text-xs text-slate-600 dark:text-slate-400">
        Hemos agregado mejoras a la aplicación. <strong>GUARDA/HAZ UN RESPALDO</strong> de tus <strong>HORAS y REVISITAS</strong> antes de actualizar. Actualiza para obtener la última versión.
      </p>

      <p className="text-xs text-slate-600 dark:text-slate-400">
         <strong>Actualizacion: #Mejoras de guardado. Si se borra historial de navegador, no se borra el progreso de horas y revisitas</strong>
      </p>
      
      <button
        onClick={() => updateServiceWorker(true)}
        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
      >
        <RefreshCw size={14} />
        Actualizar ahora
      </button>
    </div>
  );
}