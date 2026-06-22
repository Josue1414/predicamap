// src/componentes/menu-lateral/SeccionMiPerfil.jsx
import React from 'react';
import { Users, Key, LogOut, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '../../utilidades/clienteSupabase';

export default function SeccionMiPerfil({
  perfilUsuario,
  manejarRestablecerPassword,
  alCerrar,
  acordeonActivo,
  alternarAcordeon
}) {
  return (
    <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <button onClick={() => alternarAcordeon('mi_perfil')} className="w-full p-3 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
        <span className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <Users size={16} className="text-slate-500"/> Mi Perfil
        </span>
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
          
          <button 
            onClick={manejarRestablecerPassword} 
            className="w-full py-2 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-900 dark:text-indigo-400 dark:hover:bg-indigo-950/30 rounded-lg font-bold text-xs flex justify-center items-center gap-1.5 transition-colors"
          >
            <Key size={14} /> Restablecer Contraseña
          </button>
          
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={async () => { await supabase.auth.signOut(); alCerrar(); }} 
              className="w-full py-2.5 flex items-center justify-center gap-2 text-rose-500 bg-rose-50/50 hover:bg-rose-100 dark:bg-rose-950/20 border border-transparent hover:border-rose-200 rounded-xl font-bold transition-colors shadow-sm"
            >
              <LogOut size={16} /> Cerrar Sesión Segura
            </button>
          </div>
        </div>
      )}
    </div>
  );
}