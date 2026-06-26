// src/componentes/menu-lateral/SeccionHistorial.jsx
import React, { useEffect } from 'react';
import { History, ChevronUp, ChevronDown, Activity, User } from 'lucide-react';

export default function SeccionHistorial({
  visible,
  acordeonActivo,
  alternarAcordeon,
  logs = [],
  cargandoLogs,
  recargarLogs
}) {
  if (!visible) return null;

  const abierto = acordeonActivo === 'historial';

  // Forzar recarga de los datos frescos cada vez que el usuario despliega esta sección
  useEffect(() => {
    if (abierto && recargarLogs) {
      recargarLogs();
    }
  }, [abierto, recargarLogs]);

  // Utilidad rápida para dar formato a la fecha: "15 oct, 04:30 PM"
  const formatearFecha = (fechaIso) => {
    const fecha = new Date(fechaIso);
    return fecha.toLocaleString('es-MX', { 
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
    });
  };

  const obtenerIconoAccion = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case 'territorio': return <span className="text-emerald-500 text-sm">🗺️</span>;
      case 'casa': return <span className="text-orange-500 text-sm">🏠</span>;
      case 'tachuela': return <span className="text-cyan-500 text-sm">📌</span>;
      case 'sistema': return <span className="text-purple-500 text-sm">⚙️</span>;
      default: return <Activity size={14} className="text-indigo-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-2 shadow-sm">
      <button onClick={() => alternarAcordeon('historial')} className="w-full p-3 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
        <span className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <History size={16} className="text-indigo-500"/> Historial de Actividad
        </span>
        {abierto ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      
      {abierto && (
        <div className="p-4 bg-white dark:bg-slate-950 max-h-80 overflow-y-auto scroll-limpio">
          {cargandoLogs ? (
            <p className="text-xs text-slate-400 text-center py-4 animate-pulse font-bold">Cargando registros...</p>
          ) : logs.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4 font-bold">Aún no hay actividad registrada.</p>
          ) : (
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent">
              {logs.map((log) => (
                <div key={log.id} className="relative flex items-start gap-3">
                  {/* Círculo del Icono */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 z-10 shrink-0 shadow-sm">
                    {obtenerIconoAccion(log.entidad_tipo)}
                  </div>
                  
                  {/* Tarjeta de Contenido */}
                  <div className="flex-1 bg-slate-50 dark:bg-slate-900/40 rounded-xl p-3 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide">{log.accion}</span>
                      <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap ml-2">{formatearFecha(log.creado_en)}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
                      {log.detalles}
                    </p>
                    <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-800/60">
                      <User size={10} className="text-slate-400" />
                      <span className="text-[9px] text-slate-500 font-bold truncate">
                        {log.perfiles?.nombre || 'Usuario Desconocido'} <span className="text-indigo-400 opacity-70">({log.perfiles?.rol || 'N/A'})</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}