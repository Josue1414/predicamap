// src/componentes/menu-lateral/SeccionMasterCongregaciones.jsx
import React from 'react';
import { MapPin, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';

export default function SeccionMasterCongregaciones({
  listaCongregaciones,
  congregacionExpandida,
  setCongregacionExpandido,
  congregacionContextoId,
  alSeleccionarCongregacionContexto,
  acordeonActivo,
  alternarAcordeon,
  alCerrar,
  // PROP DE ELIMINACIÓN TOTAL
  alEliminarCongregacion
}) {
  return (
    <div className="bg-white dark:bg-slate-950 rounded-xl border border-indigo-100 dark:border-indigo-950 overflow-hidden shadow-sm mb-2">
      <button onClick={() => alternarAcordeon('master_congregaciones')} className="w-full p-3 flex justify-between items-center bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors">
        <span className="font-bold text-xs text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
          <MapPin size={16} className="text-indigo-500"/> Congregaciones Globales ({listaCongregaciones?.length || 0})
        </span>
        {acordeonActivo === 'master_congregaciones' ? <ChevronUp size={16} className="text-indigo-400" /> : <ChevronDown size={16} className="text-indigo-400" />}
      </button>
      
      {acordeonActivo === 'master_congregaciones' && (
        <div className="p-3 bg-white dark:bg-slate-950 max-h-60 overflow-y-auto space-y-2 scroll-limpio">
          {(!listaCongregaciones || listaCongregaciones.length === 0) ? (
            <p className="text-xs text-slate-400 text-center py-2">No se encontraron registros globales.</p>
          ) : (
            listaCongregaciones.map(cong => (
              <div key={cong.id} className="border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden">
                <div onClick={() => setCongregacionExpandido(congregacionExpandida === cong.id ? null : cong.id)} className="p-2 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{cong.nombre}</span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${congregacionExpandida === cong.id ? 'rotate-180' : ''}`} />
                </div>
                {congregacionExpandida === cong.id && (
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-[11px] space-y-2">
                    <p className="text-slate-500">ID de Sistema: <span className="font-mono text-[10px] text-slate-700 dark:text-slate-400">{cong.id}</span></p>
                    
                    <div className="grid grid-cols-1 gap-2 pt-1">
                      {congregacionContextoId === cong.id ? (
                        <button onClick={() => alSeleccionarCongregacionContexto(null)} className="w-full py-1.5 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-500 transition-colors text-xs shadow-sm">
                          Salir de Vista de Simulación
                        </button>
                      ) : (
                        <button onClick={() => { alSeleccionarCongregacionContexto(cong.id); alCerrar(); }} className="w-full py-1.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 transition-colors text-xs shadow-sm">
                          Entrar como Administrador
                        </button>
                      )}

                      {/* 🗑️ BOTÓN DE BORRADO FÍSICO DE CONGREGACIÓN */}
                      <button 
                        onClick={() => alEliminarCongregacion(cong.id)}
                        className="w-full py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg font-bold transition-all text-xs flex justify-center items-center gap-1 border border-transparent hover:border-rose-100 dark:hover:border-rose-900"
                      >
                        <Trash2 size={12} /> Eliminar de Raíz
                      </button>
                    </div>

                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}