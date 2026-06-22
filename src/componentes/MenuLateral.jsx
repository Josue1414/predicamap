// src/componentes/MenuLateral.jsx
import React, { useState } from 'react';
import { X, Search, Map, PenTool, LogOut, ChevronDown, ChevronUp, Trash2, Home, List, MapPin, CheckCircle2, Navigation, Settings, Users, Clock, Layers, Share2, UserPlus, Key, Star, UserCheck, RefreshCcw } from 'lucide-react';
import { supabase } from '../utilidades/clienteSupabase';

const PALETA_COLORES = [
  { nombre: 'Celeste', hex: '#00f0ff' }, { nombre: 'Rosa', hex: '#ff007f' },
  { nombre: 'Morado', hex: '#b000ff' }, { nombre: 'Amarillo', hex: '#ffea00' },
  { nombre: 'Naranja', hex: '#ff7c00' }, { nombre: 'Azul', hex: '#0040ff' },
  { nombre: 'Verde', hex: '#00e600' }, { nombre: 'Magenta', hex: '#ff00d0' },
];

export default function MenuLateral({
  abierto, alCerrar,
  nombreCongregacion, alCambiarNombreCongregacion,
  seccionesGuardadas, edificiosGuardados, alEliminarSeccion, alCompletarTerritorio, alVolarATerritorio,
  textoBusqueda, alCambiarTextoBusqueda, alBuscar, resultadosCiudades, alSeleccionarCiudad,
  nombreTerritorio, alCambiarNombre, colorTerritorio, alCambiarColor, notasTerritorio, alCambiarNotas, alEmpezarATrazar,
  alActivarModoEdificios,
  mostrarCalles, alCambiarMostrarCalles, mostrarLugares, alCambiarMostrarLugares,
  perfilUsuario, usuariosEquipo, alEliminarMiembro, alCrearLinkInvitacion,
  listaCongregaciones, congregacionContextoId, alSeleccionarCongregacionContexto,
  // Props Operativas
  asignarTerritorioEnBD, reiniciarTerritorioEnBD, actualizarNotasSeccionEnBD
}) {
  const [acordeonActivo, setAcordeonActivo] = useState('lista'); 
  const [territorioExpandido, setTerritorioExpandido] = useState(null);
  const [congregacionExpandida, setCongregacionExpandido] = useState(null);

  const alternarAcordeon = (seccion) => setAcordeonActivo(acordeonActivo === seccion ? null : seccion);

  // Jerarquía Oficial
  const esAdminMayor = perfilUsuario?.rol === 'Administrador Mayor';
  const esAdminOperativo = perfilUsuario?.rol === 'Administrador' || (esAdminMayor && congregacionContextoId);
  const esCapitanYSuperior = esAdminOperativo || perfilUsuario?.rol === 'Capitán';
  const esPrecursorYSuperior = esCapitanYSuperior || perfilUsuario?.rol === 'Precursor';

  const manejarRestablecerPassword = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return;
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/recuperar`,
      });
      if (error) throw error;
      alert("📧 Se ha enviado un correo de recuperación para reconfigurar la contraseña.");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  // Re-ordenamos para que los territorios asignados al usuario aparezcan primero
  const territoriosOrdenados = [...(seccionesGuardadas || [])].sort((a, b) => {
    if (a.asignado_a === perfilUsuario?.id && b.asignado_a !== perfilUsuario?.id) return -1;
    if (b.asignado_a === perfilUsuario?.id && a.asignado_a !== perfilUsuario?.id) return 1;
    return 0;
  });

  return (
    <>
      {abierto && <div className="fixed inset-0 bg-black/50 z-[3000] transition-opacity" onClick={alCerrar} />}

      <div className={`fixed top-0 left-0 h-full w-80 sm:w-96 bg-slate-50 dark:bg-slate-900 shadow-2xl z-[3001] transform transition-transform duration-300 flex flex-col ${abierto ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-950">
          <div className="flex flex-col">
            <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Settings size={18} className="text-slate-600" /> Panel de Control
            </h2>
            {perfilUsuario?.rol && (
              <span className="text-[9px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold px-2 py-0.5 rounded-full mt-1.5 w-max tracking-wider uppercase shadow-sm">
                Rango: {perfilUsuario.rol}
              </span>
            )}
          </div>
          <button onClick={alCerrar} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto scroll-limpio p-3 space-y-2">

          {/* =============================================================== */}
          {/* MÓDULO GLOBAL: EXCLUSIVO ADMINISTRADOR MAYOR */}
          {/* =============================================================== */}
          {esAdminMayor && !congregacionContextoId && (
            <>
              <div className="text-[10px] font-black uppercase text-indigo-500 tracking-wider mb-2 mt-1 px-1">Control Maestro Global</div>
              
              {/* ACORDEÓN: LISTA DE CONGREGACIONES */}
              <div className="bg-white dark:bg-slate-950 rounded-xl border border-indigo-100 dark:border-indigo-950 overflow-hidden shadow-sm mb-2">
                <button onClick={() => alternarAcordeon('master_congregaciones')} className="w-full p-3 flex justify-between items-center bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors">
                  <span className="font-bold text-xs text-indigo-900 dark:text-indigo-200 flex items-center gap-2"><MapPin size={16} className="text-indigo-500"/> Congregaciones Globales ({listaCongregaciones?.length || 0})</span>
                  {acordeonActivo === 'master_congregaciones' ? <ChevronUp size={16} className="text-indigo-400" /> : <ChevronDown size={16} className="text-indigo-400" />}
                </button>
                {acordeonActivo === 'master_congregaciones' && (
                  <div className="p-3 bg-white dark:bg-slate-950 max-h-60 overflow-y-auto space-y-2">
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
                              {congregacionContextoId === cong.id ? (
                                <button onClick={() => alSeleccionarCongregacionContexto(null)} className="w-full py-1.5 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-500 transition-colors text-xs shadow-sm">
                                  Salir de Vista de Simulación
                                </button>
                              ) : (
                                <button onClick={() => { alSeleccionarCongregacionContexto(cong.id); alCerrar(); }} className="w-full py-1.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 transition-colors text-xs shadow-sm">
                                  Entrar como Administrador
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* ACORDEÓN: REGISTRAR NUEVA CONGREGACIÓN */}
              <div className="bg-white dark:bg-slate-950 rounded-xl border border-emerald-100 dark:border-emerald-900/30 overflow-hidden shadow-sm">
                <button onClick={() => alternarAcordeon('master_nueva')} className="w-full p-3 flex justify-between items-center bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors">
                  <span className="font-bold text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2"><UserPlus size={16} className="text-emerald-500"/> Registrar Nueva Congregación</span>
                  {acordeonActivo === 'master_nueva' ? <ChevronUp size={16} className="text-emerald-400" /> : <ChevronDown size={16} className="text-emerald-400" />}
                </button>
                {acordeonActivo === 'master_nueva' && (
                  <div className="p-4 bg-white dark:bg-slate-950 space-y-3">
                    <p className="text-[11px] text-slate-500 leading-tight">Envía este enlace especial a un hermano para que cree su propia cuenta como Administrador e inicie una nueva congregación en el sistema.</p>
                    <a href={alCrearLinkInvitacion ? alCrearLinkInvitacion('Administrador', true) : '#'} target="_blank" rel="noreferrer" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg flex justify-center items-center gap-2 transition-all shadow-md shadow-emerald-600/20">
                      <Share2 size={14} /> Enviar Invitación por WhatsApp
                    </a>
                  </div>
                )}
              </div>
            </>
          )}

          {/* =============================================================== */}
          {/* BUSCADOR DE MAPA: SIEMPRE VISIBLE PARA TODOS LOS USUARIOS */}
          {/* =============================================================== */}
          {esPrecursorYSuperior && (
            <>
              <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 mt-4 px-1">Navegación</div>
              <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <button onClick={() => alternarAcordeon('buscar')} className="w-full p-3 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <span className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2"><Search size={16} className="text-slate-500"/> Buscar en el Mapa</span>
                  {acordeonActivo === 'buscar' ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </button>
                {acordeonActivo === 'buscar' && (
                  <div className="p-3 bg-white dark:bg-slate-950">
                    <form onSubmit={(e) => { e.preventDefault(); alBuscar(); }} className="flex gap-2">
                      <input type="text" value={textoBusqueda} onChange={(e) => alCambiarTextoBusqueda(e.target.value)} placeholder="Ej: Monterrey, México..." className="w-full border rounded-lg p-2 text-xs dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
                      <button type="submit" className="bg-slate-800 text-white px-3 rounded-lg text-xs font-bold">Ir</button>
                    </form>
                    {resultadosCiudades.length > 0 && (
                      <ul className="mt-2 border rounded-lg max-h-32 overflow-y-auto text-xs dark:border-slate-800 scroll-limpio">
                        {resultadosCiudades.map((c, i) => (
                          <li key={i} onClick={() => { alSeleccionarCiudad(c); alCerrar(); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer truncate dark:text-slate-300">{c.display_name}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* =============================================================== */}
          {/* SECCIÓN OPERATIVA (Activa para Precursores, Capitanes y Admins (simulando)) */}
          {/* =============================================================== */}
          {esPrecursorYSuperior && (!esAdminMayor || (esAdminMayor && congregacionContextoId)) && (
            <>
              <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 mt-4 px-1">Operación de Campo</div>

              {/* ACORDEÓN 1: LISTADO DE TERRITORIOS */}
              <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <button onClick={() => alternarAcordeon('lista')} className="w-full p-3 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <span className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2"><List size={16} className="text-indigo-500"/> Territorios ({territoriosOrdenados?.length || 0})</span>
                  {acordeonActivo === 'lista' ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </button>
                {acordeonActivo === 'lista' && (
                  <div className="p-3 bg-white dark:bg-slate-950 max-h-80 overflow-y-auto space-y-2">
                    {territoriosOrdenados?.length === 0 ? <p className="text-xs text-slate-400 text-center py-2">No hay territorios creados aún.</p> : (
                      territoriosOrdenados.map(sec => {
                        const casasDeEstaSeccion = edificiosGuardados?.filter(e => e.seccion_id === sec.id) || [];
                        const totalCasas = casasDeEstaSeccion.length;
                        const casasCompletadas = casasDeEstaSeccion.filter(e => e.estado === 'completado').length;
                        const porcentaje = totalCasas === 0 ? 0 : Math.round((casasCompletadas / totalCasas) * 100);
                        
                        const esMio = sec.asignado_a === perfilUsuario?.id;

                        return (
                          <div key={sec.id} className={`border rounded-lg overflow-hidden shadow-sm transition-colors ${esMio ? 'border-amber-400 dark:border-amber-600/50' : 'border-slate-100 dark:border-slate-800'}`}>
                            <div onClick={() => setTerritorioExpandido(territorioExpandido === sec.id ? null : sec.id)} className={`p-2.5 flex items-center justify-between cursor-pointer ${esMio ? 'bg-amber-50/50 dark:bg-amber-900/10 hover:bg-amber-100/50 dark:hover:bg-amber-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-900'}`}>
                              <div className="flex items-center gap-2 w-full pr-3">
                                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: sec.colorHex }} />
                                <div className="flex flex-col flex-1">
                                  <div className="flex items-center gap-1.5 mb-1.5">
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-none">{sec.nombre}</span>
                                    {esMio && <span className="flex items-center gap-0.5 text-[9px] bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 px-1.5 py-0.5 rounded-md font-bold uppercase"><Star size={10}/> Mi Asignación</span>}
                                  </div>
                                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1 mt-0.5">
                                    <div className="bg-emerald-500 h-1 rounded-full transition-all" style={{ width: `${porcentaje}%` }}></div>
                                  </div>
                                </div>
                              </div>
                              <ChevronDown size={14} className={`text-slate-400 flex-shrink-0 transition-transform ${territorioExpandido === sec.id ? 'rotate-180' : ''}`} />
                            </div>
                            
                            {/* DETALLES DEL TERRITORIO EXPANDIDO */}
                            {territorioExpandido === sec.id && (
                              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                                
                                {/* NOTAS (Editables por Precursor y Superior) */}
                                {esPrecursorYSuperior ? (
                                  <textarea 
                                    defaultValue={sec.notas}
                                    onBlur={(e) => actualizarNotasSeccionEnBD(sec.id, e.target.value)}
                                    placeholder="Añadir notas sobre el territorio..."
                                    className="w-full p-2 mb-3 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-indigo-500"
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
                                      className="w-full p-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
                                    >
                                      <option value="">-- Sin asignar --</option>
                                      {usuariosEquipo.map(u => (
                                        <option key={u.id} value={u.id}>{u.nombre} ({u.rol})</option>
                                      ))}
                                    </select>
                                  </div>
                                )}

                                {/* BOTONERIA */}
                                <div className="grid grid-cols-1 gap-2">
                                  <button onClick={() => { alVolarATerritorio(sec.coordenadas); alCerrar(); }} className="flex justify-center items-center gap-1.5 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg font-bold text-xs hover:bg-indigo-100 transition-colors"><Navigation size={14} /> Volar al Territorio</button>
                                  
                                  <button disabled={totalCasas === 0 || porcentaje === 100} onClick={() => alCompletarTerritorio(sec.id)} className="flex justify-center items-center gap-1.5 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg font-bold text-xs hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><CheckCircle2 size={14} /> {porcentaje === 100 ? 'Territorio Terminado' : 'Marcar TODO Completado'}</button>
                                  
                                  {/* REINICIO DE CASAS (Exclusivo Capitán y Superior) */}
                                  {esCapitanYSuperior && porcentaje > 0 && (
                                    <button onClick={() => reiniciarTerritorioEnBD(sec.id)} className="flex justify-center items-center gap-1.5 py-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg font-bold text-xs hover:bg-amber-100 transition-colors">
                                      <RefreshCcw size={14} /> Reiniciar Territorio
                                    </button>
                                  )}

                                  {/* ELIMINAR TERRITORIO (Exclusivo Admin Operativo) */}
                                  {esAdminOperativo && (
                                    <button onClick={() => alEliminarSeccion(sec.id)} className="flex justify-center items-center gap-1.5 py-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg font-bold text-xs hover:bg-rose-100 transition-colors"><Trash2 size={14} /> Eliminar Territorio</button>
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

              {/* ACORDEÓN 2: DIBUJAR TERRITORIO (Solo Admin) */}
              {esAdminOperativo && (
                <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <button onClick={() => alternarAcordeon('crear')} className="w-full p-3 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <span className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2"><PenTool size={16} className="text-indigo-500"/> Dibujar Territorio</span>
                    {acordeonActivo === 'crear' ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </button>
                  {acordeonActivo === 'crear' && (
                    <div className="p-4 space-y-3 text-xs bg-white dark:bg-slate-950">
                      <input type="text" value={nombreTerritorio} onChange={(e) => alCambiarNombre(e.target.value)} placeholder="Nombre (Ej: Sección 1)" className="w-full border rounded-lg p-2 dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
                      <div className="grid grid-cols-4 gap-2">
                        {PALETA_COLORES.map((color) => (
                          <button key={color.hex} type="button" onClick={() => alCambiarColor(color.hex)} className={`h-8 rounded-lg border-2 ${colorTerritorio === color.hex ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent opacity-60'}`} style={{ backgroundColor: color.hex }} />
                        ))}
                      </div>
                      <textarea value={notasTerritorio} onChange={(e) => alCambiarNotas(e.target.value)} placeholder="Notas..." rows="2" className="w-full border rounded-lg p-2 dark:bg-slate-900 dark:border-slate-700 dark:text-white resize-none" />
                      <button disabled={!nombreTerritorio.trim()} onClick={() => { alEmpezarATrazar(); alCerrar(); }} className="w-full py-2 bg-indigo-600 text-white font-bold rounded-lg disabled:opacity-50">Ir al Mapa a Dibujar</button>
                    </div>
                  )}
                </div>
              )}

              {/* ACORDEÓN 3: SEMBRAR CASAS (Capitán y Superior) */}
              {esCapitanYSuperior && (
                <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <button onClick={() => alternarAcordeon('casas')} className="w-full p-3 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <span className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2"><Home size={16} className="text-emerald-500"/> Sembrar Casas</span>
                    {acordeonActivo === 'casas' ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </button>
                  {acordeonActivo === 'casas' && (
                    <div className="p-4 bg-white dark:bg-slate-950">
                      <p className="text-[11px] text-slate-500 mb-3">Activa este modo para dar toques sobre los techos en el mapa satelital y crear puntos de predicación.</p>
                      <button onClick={() => { alActivarModoEdificios(); alCerrar(); }} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg shadow-emerald-600/20 text-xs flex justify-center items-center gap-2">
                        <Home size={14} /> Iniciar Siembra
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* =============================================================== */}
          {/* SECCIÓN ADMINISTRATIVO (Solo Admin Operativo) */}
          {/* =============================================================== */}
          {esAdminOperativo && (
            <>
              <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 mt-6 px-1">Ajustes Generales</div>

              {/* ACORDEÓN 5: GENERAL */}
              <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-2">
                <button onClick={() => alternarAcordeon('configuracion')} className="w-full p-3 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <span className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2"><MapPin size={16} className="text-blue-500"/> General</span>
                  {acordeonActivo === 'configuracion' ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </button>
                {acordeonActivo === 'configuracion' && (
                  <div className="p-4 bg-white dark:bg-slate-950 space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Nombre de la Congregación</label>
                      <input type="text" value={nombreCongregacion} onChange={(e) => alCambiarNombreCongregacion(e.target.value)} className="w-full border rounded-lg p-2 text-xs dark:bg-slate-900 dark:border-slate-700 dark:text-white focus:ring-1 focus:ring-indigo-500 font-bold" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 mb-2">Enlace para Publicadores:</p>
                      <a href={alCrearLinkInvitacion ? alCrearLinkInvitacion('Publicador') : '#'} target="_blank" rel="noreferrer" className="w-full py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 font-bold text-[11px] rounded-lg flex justify-center items-center gap-1.5 transition-colors">
                        <Share2 size={14} /> Compartir por WhatsApp
                      </a>
                    </div>
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-[11px] font-bold text-slate-500 mb-2 flex items-center gap-1"><Layers size={12} /> Capas del Mapa</p>
                      <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 mb-2 cursor-pointer">
                        <input type="checkbox" checked={mostrarCalles} onChange={(e) => alCambiarMostrarCalles(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                        Mostrar Calles y Rutas
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input type="checkbox" checked={mostrarLugares} onChange={(e) => alCambiarMostrarLugares(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                        Mostrar Nombres de Lugares
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ACORDEÓN 6: CAPITANES Y ACCESOS (Visible para Capitán y Superior) */}
          {esCapitanYSuperior && (!esAdminMayor || (esAdminMayor && congregacionContextoId)) && (
            <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-2">
              <button onClick={() => alternarAcordeon('capitanes')} className="w-full p-3 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <span className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2"><Users size={16} className="text-purple-500"/> Directorio y Accesos</span>
                {acordeonActivo === 'capitanes' ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
              </button>
              {acordeonActivo === 'capitanes' && (
                <div className="p-3 bg-white dark:bg-slate-950 space-y-4">
                  {/* GENERAR INVITACIONES (Solo Admin) */}
                  {esAdminOperativo && alCrearLinkInvitacion && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Generar Invitación de Rango</p>
                      <div className="grid grid-cols-1 gap-2">
                        <a href={alCrearLinkInvitacion('Administrador')} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold transition-colors">
                          <UserPlus size={14}/> Invitar Sub-Administrador
                        </a>
                        <a href={alCrearLinkInvitacion('Capitán')} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 text-xs font-bold transition-colors">
                          <UserPlus size={14}/> Invitar Capitán por WhatsApp
                        </a>
                        <a href={alCrearLinkInvitacion('Precursor')} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold transition-colors">
                          <UserPlus size={14}/> Invitar Precursor
                        </a>
                      </div>
                    </div>
                  )}

                  {/* LISTA DE EQUIPO (Visible para Capitán y Superior) */}
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Personal Autorizado ({usuariosEquipo?.length || 0})</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scroll-limpio">
                      {usuariosEquipo?.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No hay miembros registrados.</p>
                      ) : (
                        usuariosEquipo.map(miembro => (
                          <div key={miembro.id} className="flex items-center justify-between p-2 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{miembro.nombre}</span>
                              <span className="text-[10px] text-slate-500 font-semibold">{miembro.rol}</span>
                            </div>
                            {/* ELIMINAR (Solo Admin) */}
                            {esAdminOperativo && miembro.id !== perfilUsuario?.id && (
                              <button onClick={() => alEliminarMiembro(miembro.id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md transition-colors">
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =============================================================== */}
          {/* SECCIÓN PERSONAL E HISTORIAL */}
          {/* =============================================================== */}
          <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 mt-6 px-1">Cuenta de Usuario</div>

          {/* ACORDEÓN 7: MI PERFIL */}
          <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <button onClick={() => alternarAcordeon('mi_perfil')} className="w-full p-3 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <span className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2"><Users size={16} className="text-slate-500"/> Mi Perfil</span>
              {acordeonActivo === 'mi_perfil' ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </button>
            {acordeonActivo === 'mi_perfil' && (
              <div className="p-4 bg-white dark:bg-slate-950 space-y-4 text-xs">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Nombre</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border dark:border-slate-800">
                    {perfilUsuario?.nombre || 'Cargando...'}
                  </p>
                </div>
                <button onClick={manejarRestablecerPassword} className="w-full py-2 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-900 dark:text-indigo-400 dark:hover:bg-indigo-950/30 rounded-lg font-bold text-xs flex justify-center items-center gap-1.5 transition-colors">
                  <Key size={14} /> Restablecer Contraseña
                </button>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button onClick={async () => { await supabase.auth.signOut(); alCerrar(); }} className="w-full py-2.5 flex items-center justify-center gap-2 text-rose-500 bg-rose-50/50 hover:bg-rose-100 dark:bg-rose-950/20 border border-transparent hover:border-rose-200 rounded-xl font-bold transition-colors shadow-sm">
                    <LogOut size={16} /> Cerrar Sesión Segura
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ACORDEÓN 8: HISTORIAL (Visible para Capitan y superior) */}
          {esCapitanYSuperior && (!esAdminMayor || (esAdminMayor && congregacionContextoId)) && (
            <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden opacity-75 mt-2">
              <button onClick={() => alternarAcordeon('historial')} className="w-full p-3 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <span className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2"><Clock size={16} className="text-amber-500"/> Historial de Actividad</span>
                {acordeonActivo === 'historial' ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
              </button>
              {acordeonActivo === 'historial' && (
                <div className="p-4 bg-white dark:bg-slate-950 text-center">
                  <Clock size={32} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="text-xs text-slate-500 font-bold">Módulo Próximamente</p>
                  <p className="text-[10px] text-slate-400 mt-1">Registros de actividad y logs de auditoría de campo.</p>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </>
  );
}