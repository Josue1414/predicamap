// src/componentes/menu-lateral/SeccionDirectorio.jsx
import React, { useState } from 'react';
import { Users, UserPlus, Trash2, ChevronUp, ChevronDown, ChevronRight, Map, Shield, Settings2 } from 'lucide-react';
import VentanaFlotante from '../VentanaFlotante'; 
import { useAlertas } from '../../context/ContextoAlertas'; 

export default function SeccionDirectorio({
  visible,
  esAdminOperativo,
  usuariosEquipo,
  perfilUsuario,
  alEliminarMiembro,
  alActualizarPermisoMiembro,
  alCrearLinkInvitacion,
  acordeonActivo,
  alternarAcordeon,
  territorios,
  congregacionActiva,
  alActualizarPermisoCongregacion
}) {
  const [miembroExpandido, setMiembroExpandido] = useState(null);

  const { mostrarConfirmacion } = useAlertas();

  if (!visible) return null;

  const rol = perfilUsuario?.rol;
  const esAdmin = esAdminOperativo; 
  const esCapitan = rol === 'Capitán';
  const esPrecursor = rol === 'Precursor' || rol === 'Precursor Especial';

  const estaAbierta = acordeonActivo === 'directorio';

  const manejarEliminar = async (miembro) => {
    const confirmado = await mostrarConfirmacion(
      "Revocar Acceso",
      `¿Estás seguro de eliminar a "${miembro.nombre}"? Se revocará su acceso por completo.`,
      "danger",
      "Sí, eliminar"
    );
    if (confirmado) {
      alEliminarMiembro(miembro.id);
    }
  };

  const manejarCambioPermisoIndividual = (miembro, campo, valor) => {
    if (alActualizarPermisoMiembro) {
      alActualizarPermisoMiembro(miembro.id, campo, valor);
    }
  };

  const manejarCambioPermisoGeneral = (campo, valor) => {
    if (alActualizarPermisoCongregacion) {
      alActualizarPermisoCongregacion(campo, valor);
    }
  };

  return (
    <div className="mb-2">
      <button 
        onClick={() => alternarAcordeon('directorio')} 
        className="w-full p-3 flex justify-between items-center rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-purple-50 dark:hover:bg-purple-900/10 shadow-sm transition-colors"
      >
        <span className="font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Users size={16} className="text-purple-500"/> Directorio y Accesos
        </span>
        <ChevronRight size={16} className="text-slate-400" />
      </button>
      
      <VentanaFlotante
        abierta={estaAbierta}
        alCerrar={() => alternarAcordeon('directorio')}
        titulo="Directorio y Accesos"
        icono={Users}
      >
        <div className="p-5 bg-white dark:bg-slate-950 space-y-6 flex-1 overflow-y-auto scroll-limpio">
          
          {/* GENERAR INVITACIONES */}
          {alCrearLinkInvitacion && (
            <div>
              <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                <UserPlus size={16} className="text-slate-400" /> Generar Invitación de Rango
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {esAdmin && (
                  <>
                    <a href={alCrearLinkInvitacion('Administrador')} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold transition-colors shadow-sm border border-blue-100 dark:border-blue-800/50">
                      <UserPlus size={16}/> Sub-Administrador
                    </a>
                    <a href={alCrearLinkInvitacion('Capitán')} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 p-3 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 text-xs font-bold transition-colors shadow-sm border border-purple-100 dark:border-purple-800/50">
                      <UserPlus size={16}/> Invitar Capitán
                    </a>
                    <a href={alCrearLinkInvitacion('Precursor')} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 p-3 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold transition-colors shadow-sm border border-amber-100 dark:border-amber-800/50">
                      <UserPlus size={16}/> Invitar Precursor
                    </a>
                  </>
                )}
                {(esAdmin || esCapitan || esPrecursor) && (
                  <a href={alCrearLinkInvitacion('Publicador')} target="_blank" rel="noreferrer" className={`flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold transition-colors shadow-sm border border-emerald-100 dark:border-emerald-800/50 ${!esAdmin ? 'sm:col-span-2' : ''}`}>
                    <UserPlus size={16}/> Invitar Publicador (General)
                  </a>
                )}
              </div>
            </div>
          )}

          {/* PERMISOS GENERALES DE CONGREGACIÓN (SOLO ADMIN) */}
          {esAdmin && congregacionActiva && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                <Settings2 size={16} className="text-slate-400" /> Permisos Generales
              </p>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 transition-colors">Precursores pueden editar calles</span>
                    <span className="text-[10px] text-slate-500">Permite cambiar casas a verde o rojo.</span>
                  </div>
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 accent-emerald-600 rounded cursor-pointer shrink-0" 
                    checked={congregacionActiva.permiso_precursores_editar ?? false} 
                    onChange={(e) => manejarCambioPermisoGeneral('permiso_precursores_editar', e.target.checked)} 
                  />
                </label>

                <div className="h-px bg-slate-200 dark:bg-slate-700 w-full"></div>

                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 transition-colors">Capitanes pueden sembrar casas</span>
                    <span className="text-[10px] text-slate-500">Habilita el modo de trazado para ellos.</span>
                  </div>
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 accent-indigo-600 rounded cursor-pointer shrink-0" 
                    checked={congregacionActiva.permiso_capitanes_sembrar ?? true} 
                    onChange={(e) => manejarCambioPermisoGeneral('permiso_capitanes_sembrar', e.target.checked)} 
                  />
                </label>

              </div>
            </div>
          )}

          {/* LISTA DE EQUIPO */}
          {(esAdmin || esCapitan) && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                <Users size={16} className="text-slate-400" /> Personal Autorizado ({usuariosEquipo?.length || 0})
              </p>
              
              <div className="space-y-3">
                {usuariosEquipo?.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                    No hay miembros registrados.
                  </p>
                ) : (
                  usuariosEquipo.map(miembro => {
                    const territoriosAsignados = territorios?.filter(t => t.asignado_a === miembro.id) || [];

                    return (
                      <div key={miembro.id} className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 overflow-hidden transition-all shadow-sm">
                        
                        <div 
                          className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          onClick={() => setMiembroExpandido(miembroExpandido === miembro.id ? null : miembro.id)}
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{miembro.nombre}</span>
                            <span className="text-xs text-slate-500 font-semibold mt-0.5">{miembro.rol}</span>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            {miembroExpandido === miembro.id ? <ChevronUp size={18} className="text-slate-400"/> : <ChevronDown size={18} className="text-slate-400"/>}
                          </div>
                        </div>

                        {/* ZONA DESPLEGADA */}
                        {miembroExpandido === miembro.id && (
                          <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 animate-slide-up space-y-4">
                            
                            <div>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                <Map size={12} /> Territorios Asignados
                              </p>
                              
                              {territoriosAsignados.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {territoriosAsignados.map(t => (
                                    <span key={t.id} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
                                      {t.nombre}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-500 italic bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                                  No tiene ningún territorio asignado actualmente.
                                </p>
                              )}
                            </div>

                            {/* PERMISOS INDIVIDUALES (SOLO ADMIN) */}
                            {esAdmin && miembro.id !== perfilUsuario?.id && (
                              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/50 flex flex-col gap-4">
                                
                                <div className="flex flex-col gap-3">
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                    <Shield size={12} /> Permiso Individual
                                  </p>

                                  <label className="flex items-center justify-between cursor-pointer group">
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 transition-colors">Ver Informes de Servicio</span>
                                    <input 
                                      type="checkbox" 
                                      className="w-4 h-4 accent-indigo-600 rounded cursor-pointer" 
                                      checked={miembro.permiso_informes || false} 
                                      onChange={(e) => manejarCambioPermisoIndividual(miembro, 'permiso_informes', e.target.checked)} 
                                    />
                                  </label>
                                </div>

                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/50">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); manejarEliminar(miembro); }} 
                                    className="w-full flex items-center justify-center gap-2 p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/40 rounded-xl transition-colors border border-rose-100 dark:border-rose-800/30"
                                    title="Revocar Acceso"
                                  >
                                    <Trash2 size={16} /> <span className="text-xs font-bold">Revocar Acceso</span>
                                  </button>
                                </div>

                              </div>
                            )}

                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </VentanaFlotante>
    </div>
  );
}