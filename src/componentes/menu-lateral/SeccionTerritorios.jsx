// src/componentes/menu-lateral/SeccionTerritorios.jsx
import React, { useState } from 'react';
import { List, ChevronUp, ChevronDown, ChevronRight, Star, UserCheck, Users, Navigation, CheckCircle2, RefreshCcw, Trash2, Edit3, Settings, Save } from 'lucide-react';
import VentanaFlotante from '../VentanaFlotante'; 

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
  actualizarDetallesSeccionEnBD,
  acordeonActivo,
  alternarAcordeon,
  alCerrar
}) {
  const [modoEdicionId, setModoEdicionId] = useState(null);
  const [opcionesId, setOpcionesId] = useState(null); 
  const [editNombre, setEditNombre] = useState('');
  const [editColor, setEditColor] = useState('');
  
  // Estado local para los inputs de grupo
  const [gruposTemp, setGruposTemp] = useState({});

  const guardarEdicion = async (sec) => {
    if (!editNombre.trim()) return;
    // Reutilizamos la función existente, pasándole el grupo actual para que no se borre
    await actualizarDetallesSeccionEnBD(sec.id, editNombre, editColor, sec.grupo_asignado);
    setModoEdicionId(null);
  };

  const guardarGrupo = async (sec) => {
    const nuevoGrupo = gruposTemp[sec.id] !== undefined ? gruposTemp[sec.id] : sec.grupo_asignado;
    // Reutilizamos la función existente para guardar el grupo
    await actualizarDetallesSeccionEnBD(sec.id, sec.nombre, sec.colorHex, nuevoGrupo);
  };

  const estaAbierta = acordeonActivo === 'lista';

  return (
    <div className="mb-2">
      <button 
        onClick={() => alternarAcordeon('lista')} 
        className="w-full p-3 flex justify-between items-center rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 shadow-sm transition-colors"
      >
        <span className="font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <List size={16} className="text-indigo-500"/> Territorios ({territoriosOrdenados?.length || 0})
        </span>
        <ChevronRight size={16} className="text-slate-400" />
      </button>
      
      <VentanaFlotante
        abierta={estaAbierta}
        alCerrar={() => alternarAcordeon('lista')}
        titulo={`Territorios Disponibles (${territoriosOrdenados?.length || 0})`}
        icono={List}
      >
        <div className="p-4 space-y-3">
          {territoriosOrdenados?.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8 bg-white dark:bg-slate-950 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
              No hay territorios creados aún.
            </p>
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
                <div key={sec.id} className={`border rounded-xl overflow-hidden shadow-sm transition-colors ${esMio ? 'border-amber-400 dark:border-amber-600/50 bg-white dark:bg-slate-950' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950'}`}>
                  
                  <div onClick={() => {
                    setTerritorioExpandido(territorioExpandido === sec.id ? null : sec.id);
                    if (territorioExpandido !== sec.id) setOpcionesId(null); 
                  }} className={`p-4 flex items-center justify-between cursor-pointer ${esMio ? 'bg-amber-50/40 dark:bg-amber-900/10 hover:bg-amber-100/50 dark:hover:bg-amber-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-900'}`}>
                    <div className="flex items-start gap-3 w-full pr-3 mt-1">
                      <div className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm border border-black/10 dark:border-white/10" style={{ backgroundColor: sec.colorHex }} />
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-none">
                            <span className="text-slate-400 mr-1">#{index + 1}</span> {sec.nombre}
                          </span>
                          {esMio && <span className="flex items-center gap-1 text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider"><Star size={12}/> Mi Asignación</span>}
                        </div>
                        
                        {sec.grupo_asignado && (
                          <div className="mb-1.5">
                            <span className="text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                              Grupo Asignado: {sec.grupo_asignado}
                            </span>
                          </div>
                        )}

                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${porcentaje}%` }}></div>
                        </div>
                      </div>
                    </div>
                    <ChevronDown size={18} className={`text-slate-400 flex-shrink-0 transition-transform duration-300 ${territorioExpandido === sec.id ? 'rotate-180' : ''}`} />
                  </div>
                  
                  {territorioExpandido === sec.id && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 animate-slide-up">
                      
                      <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-900 px-4 py-2.5 rounded-lg text-xs text-slate-600 dark:text-slate-400 font-bold mb-4 border border-slate-200 dark:border-slate-800">
                        <span>{totalCasas > 0 ? `${casasCompletadas} de ${totalCasas} completadas` : 'Sin puntos dibujados'}</span>
                        <span className={`px-2 py-1 rounded-md ${porcentaje === 100 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400' : 'bg-white dark:bg-slate-800 shadow-sm'}`}>
                          {porcentaje}% Listo
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        <button 
                          onClick={() => { alVolarATerritorio(sec.coordenadas); alternarAcordeon(null); alCerrar(); }} 
                          className="flex justify-center items-center gap-2 py-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-xs hover:bg-indigo-100 transition-colors sm:col-span-full"
                        >
                          <Navigation size={16} /> Volar al Territorio
                        </button>
                        
                        <button disabled={porcentaje === 100} onClick={() => alCompletarTerritorio(sec.id)} className="flex justify-center items-center gap-2 py-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold text-xs hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                          <CheckCircle2 size={16} /> {porcentaje === 100 ? 'Terminado' : 'Marcar Todo Completo'}
                        </button>
                        
                        {esCapitanYSuperior && porcentaje > 0 && (
                          <button onClick={() => reiniciarTerritorioEnBD(sec.id)} className="flex justify-center items-center gap-2 py-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl font-bold text-xs hover:bg-amber-100 transition-colors">
                            <RefreshCcw size={16} /> Reiniciar
                          </button>
                        )}
                      </div>

                      <button 
                        onClick={() => setOpcionesId(opcionesId === sec.id ? null : sec.id)}
                        className="w-full flex justify-between items-center p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <span className="flex items-center gap-2"><Settings size={16} className="text-slate-400" /> Opciones del Territorio</span>
                        <ChevronDown size={16} className={`text-slate-400 transition-transform ${opcionesId === sec.id ? 'rotate-180' : ''}`} />
                      </button>

                      {opcionesId === sec.id && (
                        <div className="mt-3 space-y-4 p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900/50 animate-slide-up">
                          
                          {esAdminOperativo && (
                            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                              <div className="flex gap-1">
                                <button disabled={index === 0} onClick={() => alReordenarTerritorio(sec.id, 'arriba')} className="p-1.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md shadow-sm hover:text-indigo-500 disabled:opacity-30 transition-colors">
                                  <ChevronUp size={14} />
                                </button>
                                <button disabled={index === territoriosOrdenados.length - 1} onClick={() => alReordenarTerritorio(sec.id, 'abajo')} className="p-1.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md shadow-sm hover:text-indigo-500 disabled:opacity-30 transition-colors">
                                  <ChevronDown size={14} />
                                </button>
                              </div>
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                <List size={14}/> Ordenar en Lista
                              </span>
                            </div>
                          )}

                          <div>
                            <label className="text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider block">Notas del Territorio</label>
                            {esCapitanYSuperior ? (
                              <textarea 
                                defaultValue={sec.notas}
                                onBlur={(e) => actualizarNotasSeccionEnBD(sec.id, e.target.value)}
                                placeholder="Añadir notas sobre el territorio..."
                                className="w-full p-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/50 transition-colors text-slate-700 dark:text-slate-300 resize-none"
                                rows="2"
                              />
                            ) : (
                              <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                                <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                                  {sec.notas || 'Sin observaciones'}
                                </p>
                              </div>
                            )}
                          </div>

                          {esCapitanYSuperior && (
                            <div className="flex flex-col sm:flex-row gap-3">
                              <div className="flex-1">
                                <label className="text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1.5"><UserCheck size={12}/> Asignar a usuario:</label>
                                <select 
                                  value={sec.asignado_a || ''} 
                                  onChange={(e) => asignarTerritorioEnBD(sec.id, e.target.value)}
                                  className="w-full p-2.5 text-sm font-medium bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500/50 outline-none shadow-sm cursor-pointer"
                                >
                                  <option value="">-- Sin asignar --</option>
                                  {usuariosAsignables.map(u => (
                                    <option key={u.id} value={u.id}>{u.nombre} ({u.rol})</option>
                                  ))}
                                </select>
                              </div>

                              {esAdminOperativo && (
                                <div className="w-full sm:w-1/2">
                                  <label className="text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1.5"><Users size={12}/> Grupo asignado:</label>
                                  <div className="flex gap-2">
                                    <input 
                                      type="text"
                                      maxLength={2}
                                      value={gruposTemp[sec.id] !== undefined ? gruposTemp[sec.id] : (sec.grupo_asignado || '')}
                                      onChange={(e) => setGruposTemp({...gruposTemp, [sec.id]: e.target.value.replace(/\D/g, '')})}
                                      placeholder="Ej: 3"
                                      className="w-full p-2.5 text-sm font-medium bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500/50 outline-none shadow-sm text-center"
                                    />
                                    <button
                                      onClick={() => guardarGrupo(sec)}
                                      className="p-2.5 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:hover:bg-indigo-800/60 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors border border-indigo-200 dark:border-indigo-800 shadow-sm flex items-center justify-center shrink-0"
                                      title="Guardar Grupo"
                                    >
                                      <Save size={16} />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {esAdminOperativo && (
                            <div className="pt-2">
                              {modoEdicionId === sec.id ? (
                                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-blue-200 dark:border-blue-800/50 space-y-3">
                                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Edit3 size={12}/> Detalles Visuales
                                  </span>
                                  
                                  <input
                                    type="text"
                                    value={editNombre}
                                    onChange={e => setEditNombre(e.target.value)}
                                    className="w-full p-2.5 text-sm border rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-100 font-bold"
                                    placeholder="Nombre del territorio..."
                                  />
                                  
                                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                                    {PALETA_COLORES.map(color => (
                                      <button
                                        key={color.hex}
                                        onClick={() => setEditColor(color.hex)}
                                        className={`h-6 rounded-md border-2 transition-all ${editColor === color.hex ? 'border-slate-900 dark:border-white scale-110 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'}`}
                                        style={{ backgroundColor: color.hex }}
                                        title={color.nombre}
                                      />
                                    ))}
                                  </div>
                                  
                                  <div className="flex gap-2 pt-1">
                                    <button onClick={() => guardarEdicion(sec)} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2 rounded-lg transition-colors">
                                      Guardar
                                    </button>
                                    <button onClick={() => setModoEdicionId(null)} className="flex-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold py-2 rounded-lg transition-colors">
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                                  <button onClick={() => alEliminarSeccion(sec.id)} className="flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors px-2 py-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/30 shrink-0" title="Eliminar Territorio">
                                    <Trash2 size={14} /> Eliminar
                                  </button>
                                  
                                  <button onClick={() => { setModoEdicionId(sec.id); setEditNombre(sec.nombre); setEditColor(sec.colorHex); }} className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors px-2 py-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30">
                                    <Edit3 size={14} /> Editar Nombre / Color
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </VentanaFlotante>
    </div>
  );
}