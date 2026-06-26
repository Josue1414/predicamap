// src/componentes/menu-lateral/SeccionMiPerfil.jsx
import React, { useState, useEffect } from 'react';
import { Users, Key, LogOut, ChevronUp, ChevronDown, Mail, Edit2, Save, X } from 'lucide-react';
import { supabase } from '../../utilidades/clienteSupabase';

export default function SeccionMiPerfil({
  perfilUsuario,
  manejarRestablecerPassword,
  actualizarNombrePerfilBD, // <-- RECIBIMOS LA NUEVA PROP
  alCerrar,
  acordeonActivo,
  alternarAcordeon
}) {
  const [editandoNombre, setEditandoNombre] = useState(false);
  const [nombreTemp, setNombreTemp] = useState('');

  // Sincroniza el input si el usuario cancela o llegan datos nuevos
  useEffect(() => {
    if (perfilUsuario?.nombre) {
      setNombreTemp(perfilUsuario.nombre);
    }
  }, [perfilUsuario]);

  const manejarGuardado = async () => {
    if (nombreTemp.trim() && nombreTemp !== perfilUsuario?.nombre) {
      await actualizarNombrePerfilBD(nombreTemp);
    }
    setEditandoNombre(false);
  };

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
          
          {/* CAMPO DE CORREO ELECTRÓNICO (Solo Lectura) */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <Mail size={12} /> Correo Electrónico
            </p>
            <div className="font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 truncate">
              {perfilUsuario?.email || 'Cargando correo...'}
            </div>
          </div>

          {/* CAMPO DE NOMBRE DE USUARIO (Editable) */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <Users size={12} /> Nombre
            </p>
            
            {editandoNombre ? (
              <div className="flex items-center gap-2 animate-slide-up">
                <input 
                  type="text" 
                  value={nombreTemp} 
                  onChange={(e) => setNombreTemp(e.target.value)} 
                  autoFocus
                  className="flex-1 bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-500/50 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold"
                />
                <button onClick={manejarGuardado} className="p-2.5 bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 rounded-lg transition-colors">
                  <Save size={14} />
                </button>
                <button onClick={() => { setEditandoNombre(false); setNombreTemp(perfilUsuario?.nombre); }} className="p-2.5 bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 group">
                <span className="font-bold text-slate-700 dark:text-slate-300 truncate">
                  {perfilUsuario?.nombre || 'Cargando...'}
                </span>
                <button onClick={() => setEditandoNombre(true)} className="text-slate-400 hover:text-indigo-500 transition-colors p-1" title="Editar nombre">
                  <Edit2 size={14} />
                </button>
              </div>
            )}
          </div>
          
          <div className="pt-2">
            <button 
              onClick={manejarRestablecerPassword} 
              className="w-full py-2.5 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-900 dark:text-indigo-400 dark:hover:bg-indigo-950/30 rounded-xl font-bold text-xs flex justify-center items-center gap-1.5 transition-colors"
            >
              <Key size={14} /> Restablecer Contraseña
            </button>
          </div>
          
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