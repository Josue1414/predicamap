// src/componentes/menu-lateral/SeccionTerritorios.jsx
import React from 'react';
import { List, ChevronUp, ChevronDown, Star, UserCheck, Navigation, CheckCircle2, RefreshCcw, Trash2 } from 'lucide-react';

export default function SeccionTerritorios({
  territoriosOrdenados,
  edificiosGuardados,
  perfilUsuario,
  territorioExpandido,
  setTerritorioExpandido,
  esPrecursorYSuperior,
  esCapitanYSuperior,
  esAdminOperativo,
  usuariosEquipo,
  actualizarNotasSeccionEnBD,
  asignarTerritorioEnBD,
  reiniciarTerritorioEnBD,
  alEliminarSeccion,
  alCompletarTerritorio,
  alVolarATerritorio,
  acordeonActivo,
  alternarAcordeon,
  alCerrar
}) {
  return (
    <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <button onClick={() => alternarAcordeon('lista')} className="w-full p-3 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
        <span className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <List size={16} className="text-indigo-500"/> Territorios ({territoriosOrdenados?.length || 0})
        </span>
        {acordeonActivo === 'lista' ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      
      {acordeonActivo === 'lista' && (
        <div className="p-3 bg-white dark:bg-slate-950 max-h-80 overflow-y-auto space-y-2 scroll-limpio">
          {territoriosOrdenados?.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-2">No hay territorios creados aún.</p>
          ) : (
            territoriosOrdenados.map(sec => {
              const casasDeEstaSeccion = edificiosGuardados?.filter(e => e.seccion_id === sec.id) || [];
              const totalCasas = casasDeEstaSeccion.length;
              const casasCompletadas = casasDeEstaSeccion.filter(e => e.estado === 'completado').length;
              const porcentaje = totalCasas === 0 ? 0 : Math.round((casasCompletadas / totalCasas) * 100);
              
              const esMio = sec.asignado_a === perfilUsuario?.id;

              return (
                <div key={sec.id} className={`border rounded-lg overflow-hidden shadow-sm transition-colors ${esMio ? 'border-amber-400 dark:border-amber-600/50' : 'border-slate-100 dark:border-slate-800'}`}>
                  {/* CABECERA DEL TERRITORIO */}
                  <div onClick={() => setTerritorioExpandido(territorioExpandido === sec.id ? null : sec.id)} className={`p-2.5 flex items-center justify-between cursor-pointer ${esMio ? 'bg-amber-50/50 dark:bg-amber-900/10 hover:bg-amber-100/50 dark:hover:bg-amber-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-900'}`}>
                    <div className="flex items-center gap-2 w-full pr-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: sec.colorHex }} />
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-none">{sec.nombre}</span>
                          {esMio && <span className="flex items-center gap-0.5 text-[9px] bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 px-1.5 py-0.5 rounded-md font-bold uppercase"><Star size={10}/> Mi Asignación</span>}
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1 mt-0.5 overflow-hidden">
                          <div className="bg-emerald-500 h-1 rounded-full transition-all duration-500" style={{ width: `${porcentaje}%` }}></div>
                        </div>
                      </div>
                    </div>
                    <ChevronDown size={14} className={`text-slate-400 flex-shrink-0 transition-transform ${territorioExpandido === sec.id ? 'rotate-180' : ''}`} />
                  </div>
                  
                  {/* DETALLES DEL TERRITORIO EXPANDIDO */}
                  {territorioExpandido === sec.id && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                      
                      {/* NOTAS EDITABLES */}
                      {esPrecursorYSuperior ? (
                        <textarea 
                          defaultValue={sec.notas}
                          onBlur={(e) => actualizarNotasSeccionEnBD(sec.id, e.target.value)}
                          placeholder="Añadir notas sobre el territorio..."
                          className="w-full p-2 mb-3 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-indigo-500 transition-colors"
                          rows="2"
                        />
                      ) : (
                        <p className="text-xs text-slate-500 mb-3 italic">"{sec.notas || 'Sin observaciones'}"</p>
                      )}
                      
                      <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400 font-bold mb-3">
                        <span>{casasCompletadas} de {totalCasas} completadas</span>
                        <span className={porcentaje === 100 ? 'text-emerald-500' : ''}>{porcentaje}% Listo</span>
                      </div>

                      {/* ASIGNACIÓN DE TERRITORIO (Capitán y Superior) */}
                      {esCapitanYSuperior && (
                        <div className="mb-3">
                          <label className="text-[10px] font-bold text-slate-500 mb-1 flex items-center gap-1"><UserCheck size={12}/> Asignar a:</label>
                          <select 
                            value={sec.asignado_a || ''} 
                            onChange={(e) => asignarTerritorioEnBD(sec.id, e.target.value)}
                            className="w-full p-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none"
                          >
                            <option value="">-- Sin asignar --</option>
                            {usuariosEquipo.map(u => (
                              <option key={u.id} value={u.id}>{u.nombre} ({u.rol})</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* BOTONERÍA DE ACCIONES */}
                      <div className="grid grid-cols-1 gap-2">
                        <button onClick={() => { alVolarATerritorio(sec.coordenadas); alCerrar(); }} className="flex justify-center items-center gap-1.5 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg font-bold text-xs hover:bg-indigo-100 transition-colors">
                          <Navigation size={14} /> Volar al Territorio
                        </button>
                        
                        <button disabled={totalCasas === 0 || porcentaje === 100} onClick={() => alCompletarTerritorio(sec.id)} className="flex justify-center items-center gap-1.5 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg font-bold text-xs hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                          <CheckCircle2 size={14} /> {porcentaje === 100 ? 'Territorio Terminado' : 'Marcar TODO Completado'}
                        </button>
                        
                        {/* REINICIAR (Exclusivo Capitán y Superior) */}
                        {esCapitanYSuperior && porcentaje > 0 && (
                          <button onClick={() => reiniciarTerritorioEnBD(sec.id)} className="flex justify-center items-center gap-1.5 py-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg font-bold text-xs hover:bg-amber-100 transition-colors">
                            <RefreshCcw size={14} /> Reiniciar Territorio
                          </button>
                        )}

                        {/* ELIMINAR (Exclusivo Admin) */}
                        {esAdminOperativo && (
                          <button onClick={() => alEliminarSeccion(sec.id)} className="flex justify-center items-center gap-1.5 py-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg font-bold text-xs hover:bg-rose-100 transition-colors">
                            <Trash2 size={14} /> Eliminar Territorio
                          </button>
                        )}
                      </div>

                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}