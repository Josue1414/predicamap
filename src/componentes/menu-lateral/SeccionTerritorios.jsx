// src/componentes/menu-lateral/SeccionTerritorios.jsx
import React, { useState } from 'react';
import { List, ChevronUp, ChevronDown, Star, UserCheck, Navigation, CheckCircle2, RefreshCcw, Trash2, Edit3 } from 'lucide-react';

const PALETA_COLORES = [
  { nombre: 'Carmesí', hex: '#e11d48' },   { nombre: 'Rojo', hex: '#715605' },
  { nombre: 'Naranja', hex: '#f97316' },   { nombre: 'Ámbar', hex: '#f59e0b' },
  { nombre: 'Amarillo', hex: '#eab308' },  { nombre: 'Lima', hex: '#84cc16' },
  { nombre: 'Verde', hex: '#22c55e' },     { nombre: 'Esmeralda', hex: '#10b981' },
  { nombre: 'Verde Mar', hex: '#14b8a6' }, { nombre: 'Cian', hex: '#06b6d4' },
  { nombre: 'Celeste', hex: '#0ea5e9' },   { nombre: 'Azul', hex: '#3b82f6' },
  { nombre: 'Índigo', hex: '#6366f1' },    { nombre: 'Violeta', hex: '#8b5cf6' },
  { nombre: 'Morado', hex: '#a855f7' },    { nombre: 'Fucsia', hex: '#d946ef' },
  { nombre: 'Rosa', hex: '#ec4899' },      { nombre: 'Rosa Palo', hex: '#f43fe8' },
  { nombre: 'Marrón', hex: '#a8a29e' },    { nombre: 'Pizarra', hex: '#64748b' }
];

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
  alReordenarTerritorio,
  actualizarDetallesSeccionEnBD, // <-- NUEVA PROP
  acordeonActivo,
  alternarAcordeon,
  alCerrar
}) {
  // Estados para manejar la edición del territorio
  const [modoEdicionId, setModoEdicionId] = useState(null);
  const [editNombre, setEditNombre] = useState('');
  const [editColor, setEditColor] = useState('');

  const guardarEdicion = async (id) => {
    if (!editNombre.trim()) return;
    await actualizarDetallesSeccionEnBD(id, editNombre, editColor);
    setModoEdicionId(null);
  };

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
            territoriosOrdenados.map((sec, index) => {
              const casasDeEstaSeccion = edificiosGuardados?.filter(e => e.seccion_id === sec.id) || [];
              const totalCasas = casasDeEstaSeccion.length;
              const casasCompletadas = casasDeEstaSeccion.filter(e => e.estado === 'completado').length;
              
              let porcentaje = 0;
              if (totalCasas > 0) {
                porcentaje = Math.round((casasCompletadas / totalCasas) * 100);
              } else {
                porcentaje = sec.estado === 'completado' ? 100 : 0;
              }
              
              const esMio = sec.asignado_a === perfilUsuario?.id;

              const usuariosAsignables = usuariosEquipo.filter(u => {
                if (esAdminOperativo) return true; 
                if (esCapitanYSuperior) {
                  return u.id === perfilUsuario?.id || u.rol === 'Precursor';
                }
                return false;
              });

              return (
                <div key={sec.id} className={`border rounded-lg overflow-hidden shadow-sm transition-colors ${esMio ? 'border-amber-400 dark:border-amber-600/50' : 'border-slate-100 dark:border-slate-800'}`}>
                  <div onClick={() => setTerritorioExpandido(territorioExpandido === sec.id ? null : sec.id)} className={`p-2.5 flex items-center justify-between cursor-pointer ${esMio ? 'bg-amber-50/50 dark:bg-amber-900/10 hover:bg-amber-100/50 dark:hover:bg-amber-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-900'}`}>
                    <div className="flex items-center gap-2 w-full pr-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: sec.colorHex }} />
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-none">
                            <span className="text-slate-400 mr-1">#{index + 1}</span> {sec.nombre}
                          </span>
                          {esMio && <span className="flex items-center gap-0.5 text-[9px] bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 px-1.5 py-0.5 rounded-md font-bold uppercase"><Star size={10}/> Mi Asignación</span>}
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1 mt-0.5 overflow-hidden">
                          <div className="bg-emerald-500 h-1 rounded-full transition-all duration-500" style={{ width: `${porcentaje}%` }}></div>
                        </div>
                      </div>
                    </div>
                    <ChevronDown size={14} className={`text-slate-400 flex-shrink-0 transition-transform ${territorioExpandido === sec.id ? 'rotate-180' : ''}`} />
                  </div>
                  
                  {territorioExpandido === sec.id && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                      
                      {/* ★ REORDENAR (Exclusivo Administrador) ★ */}
                      {esAdminOperativo && (
                        <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/50 p-2.5 rounded-lg mb-3 border border-slate-200 dark:border-slate-700">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <List size={14}/> Ordenar en Lista
                          </span>
                          <div className="flex gap-1.5">
                            <button disabled={index === 0} onClick={() => alReordenarTerritorio(sec.id, 'arriba')} className="p-1.5 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded shadow-sm hover:text-indigo-500 disabled:opacity-30 transition-colors">
                              <ChevronUp size={14} />
                            </button>
                            <button disabled={index === territoriosOrdenados.length - 1} onClick={() => alReordenarTerritorio(sec.id, 'abajo')} className="p-1.5 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded shadow-sm hover:text-indigo-500 disabled:opacity-30 transition-colors">
                              <ChevronDown size={14} />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ★ MODO EDICIÓN (Exclusivo Administrador) ★ */}
                      {modoEdicionId === sec.id ? (
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-blue-200 dark:border-blue-800 mb-3 space-y-3 shadow-sm">
                          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Editar Territorio</span>
                          
                          <input
                            type="text"
                            value={editNombre}
                            onChange={e => setEditNombre(e.target.value)}
                            className="w-full p-2 text-xs border rounded-lg bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700 outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Nombre del territorio..."
                          />
                          
                          <div className="grid grid-cols-5 gap-2">
                            {PALETA_COLORES.map(color => (
                              <button
                                key={color.hex}
                                onClick={() => setEditColor(color.hex)}
                                className={`h-6 rounded-md border-2 transition-transform ${editColor === color.hex ? 'border-slate-900 dark:border-white scale-110 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                style={{ backgroundColor: color.hex }}
                                title={color.nombre}
                              />
                            ))}
                          </div>
                          
                          <div className="flex gap-2 pt-1">
                            <button onClick={() => guardarEdicion(sec.id)} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold py-2 rounded-lg transition-colors">
                              Guardar Cambios
                            </button>
                            <button onClick={() => setModoEdicionId(null)} className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-[10px] font-bold py-2 rounded-lg transition-colors">
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
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
                            <span>{totalCasas > 0 ? `${casasCompletadas} de ${totalCasas} completadas` : 'Sin puntos dibujados'}</span>
                            <span className={porcentaje === 100 ? 'text-emerald-500' : ''}>{porcentaje}% Listo</span>
                          </div>

                          {esCapitanYSuperior && (
                            <div className="mb-3">
                              <label className="text-[10px] font-bold text-slate-500 mb-1 flex items-center gap-1"><UserCheck size={12}/> Asignar a:</label>
                              <select 
                                value={sec.asignado_a || ''} 
                                onChange={(e) => asignarTerritorioEnBD(sec.id, e.target.value)}
                                className="w-full p-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none"
                              >
                                <option value="">-- Opcional: Sin asignar --</option>
                                {usuariosAsignables.map(u => (
                                  <option key={u.id} value={u.id}>{u.nombre} ({u.rol})</option>
                                ))}
                              </select>
                            </div>
                          )}

                          <div className="grid grid-cols-1 gap-2">
                            {/* ★ BOTÓN EDITAR NOMBRE Y COLOR (Solo Admin) ★ */}
                            {esAdminOperativo && (
                              <button onClick={() => { setModoEdicionId(sec.id); setEditNombre(sec.nombre); setEditColor(sec.colorHex); }} className="flex justify-center items-center gap-1.5 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg font-bold text-xs hover:bg-blue-100 transition-colors">
                                <Edit3 size={14} /> Editar Nombre y Color
                              </button>
                            )}

                            <button onClick={() => { alVolarATerritorio(sec.coordenadas); alCerrar(); }} className="flex justify-center items-center gap-1.5 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg font-bold text-xs hover:bg-indigo-100 transition-colors">
                              <Navigation size={14} /> Volar al Territorio
                            </button>
                            
                            <button disabled={porcentaje === 100} onClick={() => alCompletarTerritorio(sec.id)} className="flex justify-center items-center gap-1.5 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg font-bold text-xs hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                              <CheckCircle2 size={14} /> {porcentaje === 100 ? 'Territorio Terminado' : (totalCasas === 0 ? 'Marcar Territorio Completado' : 'Marcar TODO Completado')}
                            </button>
                            
                            {esCapitanYSuperior && porcentaje > 0 && (
                              <button onClick={() => reiniciarTerritorioEnBD(sec.id)} className="flex justify-center items-center gap-1.5 py-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg font-bold text-xs hover:bg-amber-100 transition-colors">
                                <RefreshCcw size={14} /> Reiniciar Territorio
                              </button>
                            )}

                            {esAdminOperativo && (
                              <button onClick={() => alEliminarSeccion(sec.id)} className="flex justify-center items-center gap-1.5 py-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg font-bold text-xs hover:bg-rose-100 transition-colors">
                                <Trash2 size={14} /> Eliminar Territorio
                              </button>
                            )}
                          </div>
                        </>
                      )}
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