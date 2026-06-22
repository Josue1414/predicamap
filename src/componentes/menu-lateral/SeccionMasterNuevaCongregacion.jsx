// src/componentes/menu-lateral/SeccionMasterNuevaCongregacion.jsx
import React from 'react';
import { UserPlus, Share2, ChevronUp, ChevronDown } from 'lucide-react';

export default function SeccionMasterNuevaCongregacion({
  alCrearLinkInvitacion,
  acordeonActivo,
  alternarAcordeon
}) {
  return (
    <div className="bg-white dark:bg-slate-950 rounded-xl border border-emerald-100 dark:border-emerald-900/30 overflow-hidden shadow-sm">
      <button onClick={() => alternarAcordeon('master_nueva')} className="w-full p-3 flex justify-between items-center bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors">
        <span className="font-bold text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
          <UserPlus size={16} className="text-emerald-500"/> Registrar Nueva Congregación
        </span>
        {acordeonActivo === 'master_nueva' ? <ChevronUp size={16} className="text-emerald-400" /> : <ChevronDown size={16} className="text-emerald-400" />}
      </button>
      
      {acordeonActivo === 'master_nueva' && (
        <div className="p-4 bg-white dark:bg-slate-950 space-y-3">
          <p className="text-[11px] text-slate-500 leading-tight">
            Envía este enlace especial a un hermano para que cree su propia cuenta como Administrador e inicie una nueva congregación en el sistema.
          </p>
          <a href={alCrearLinkInvitacion ? alCrearLinkInvitacion('Administrador', true) : '#'} target="_blank" rel="noreferrer" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg flex justify-center items-center gap-2 transition-all shadow-md shadow-emerald-600/20">
            <Share2 size={14} /> Enviar Invitación por WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}