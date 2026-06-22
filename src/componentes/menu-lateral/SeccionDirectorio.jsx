// src/componentes/menu-lateral/SeccionDirectorio.jsx
import React from 'react';
import { Users, UserPlus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

export default function SeccionDirectorio({
  visible,
  esAdminOperativo,
  usuariosEquipo,
  perfilUsuario,
  alEliminarMiembro,
  alCrearLinkInvitacion,
  acordeonActivo,
  alternarAcordeon
}) {
  if (!visible) return null;

  return (
    <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-2">
      <button onClick={() => alternarAcordeon('capitanes')} className="w-full p-3 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
        <span className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <Users size={16} className="text-purple-500"/> Directorio y Accesos
        </span>
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
                      <button onClick={() => alEliminarMiembro(miembro.id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md transition-colors" title="Revocar Acceso">
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
  );
}