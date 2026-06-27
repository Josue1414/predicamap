import React, { useState } from 'react';
import { Users, UserPlus, Trash2, ChevronUp, ChevronDown, Map } from 'lucide-react';

export default function SeccionDirectorio({
  visible,
  esAdminOperativo,
  usuariosEquipo,
  perfilUsuario,
  alEliminarMiembro,
  alCrearLinkInvitacion,
  acordeonActivo,
  alternarAcordeon,
  territorios // <-- Recibimos los territorios para buscar asignaciones
}) {
  const [miembroExpandido, setMiembroExpandido] = useState(null);

  if (!visible) return null;

  const rol = perfilUsuario?.rol;
  const esAdmin = esAdminOperativo; 
  const esCapitan = rol === 'Capitán';
  const esPrecursor = rol === 'Precursor' || rol === 'Precursor Especial';

  return (
    <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-2">
      <button onClick={() => alternarAcordeon('directorio')} className="w-full p-3 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
        <span className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <Users size={16} className="text-purple-500"/> Directorio y Accesos
        </span>
        {acordeonActivo === 'directorio' ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      
      {acordeonActivo === 'directorio' && (
        <div className="p-3 bg-white dark:bg-slate-950 space-y-5">
          
          {/* GENERAR INVITACIONES */}
          {alCrearLinkInvitacion && (
            <div>
              <p className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Generar Invitación de Rango</p>
              <div className="grid grid-cols-1 gap-2">
                
                {esAdmin && (
                  <>
                    <a href={alCrearLinkInvitacion('Administrador')} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold transition-colors">
                      <UserPlus size={14}/> Invitar Sub-Administrador
                    </a>
                    <a href={alCrearLinkInvitacion('Capitán')} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 text-xs font-bold transition-colors">
                      <UserPlus size={14}/> Invitar Capitán
                    </a>
                  </>
                )}

                {(esAdmin || esCapitan) && (
                  <a href={alCrearLinkInvitacion('Precursor')} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold transition-colors">
                    <UserPlus size={14}/> Invitar Precursor
                  </a>
                )}

                {(esAdmin || esCapitan || esPrecursor) && (
                  <a href={alCrearLinkInvitacion('Publicador')} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold transition-colors shadow-sm">
                    <UserPlus size={14}/> Invitar Publicador (Enlace General)
                  </a>
                )}
              </div>
            </div>
          )}

          {/* LISTA DE EQUIPO */}
          {(esAdmin || esCapitan) && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Personal Autorizado ({usuariosEquipo?.length || 0})</p>
              
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scroll-limpio">
                {usuariosEquipo?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No hay miembros registrados.</p>
                ) : (
                  usuariosEquipo.map(miembro => {
                    // ★ SOLUCIÓN: Buscar por miembro.id en lugar de miembro.nombre ★
                    const territoriosAsignados = territorios?.filter(t => t.asignado_a === miembro.id) || [];

                    return (
                      <div key={miembro.id} className="flex flex-col rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 overflow-hidden transition-all">
                        
                        <div 
                          className="flex items-center justify-between p-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          onClick={() => setMiembroExpandido(miembroExpandido === miembro.id ? null : miembro.id)}
                        >
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{miembro.nombre}</span>
                            <span className="text-[10px] text-slate-500 font-semibold">{miembro.rol}</span>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {esAdmin && miembro.id !== perfilUsuario?.id && (
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  alEliminarMiembro(miembro.id); 
                                }} 
                                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md transition-colors" 
                                title="Revocar Acceso"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                            {miembroExpandido === miembro.id ? <ChevronUp size={14} className="text-slate-400"/> : <ChevronDown size={14} className="text-slate-400"/>}
                          </div>
                        </div>

                        {miembroExpandido === miembro.id && (
                          <div className="p-3 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 animate-slide-up">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                              <Map size={12} /> Territorios Asignados
                            </p>
                            
                            {territoriosAsignados.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {territoriosAsignados.map(t => (
                                  <span key={t.id} className="text-[9.5px] font-bold px-2 py-1 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
                                    {t.nombre}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[10px] text-slate-400 italic">No tiene ningún territorio asignado actualmente.</p>
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
      )}
    </div>
  );
}