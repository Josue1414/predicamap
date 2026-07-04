import React, { useState, useEffect } from 'react';
import { Users, Key, LogOut, ChevronRight, Mail, Edit2, Save, X, Layers, Map, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../utilidades/clienteSupabase';
import VentanaFlotante from '../VentanaFlotante';

export default function SeccionMiPerfil({
  perfilUsuario,
  manejarRestablecerPassword,
  actualizarNombrePerfilBD, 
  alCerrar,
  acordeonActivo,
  alternarAcordeon,
  mostrarCalles,
  alCambiarMostrarCalles,
  mostrarLugares,
  alCambiarMostrarLugares,
  estiloMapa,
  alCambiarEstiloMapa
}) {
  const [editandoNombre, setEditandoNombre] = useState(false);
  const [nombreTemp, setNombreTemp] = useState('');

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

  const estaAbierta = acordeonActivo === 'mi_perfil';

  // ★ ARREGLO DE OPCIONES PARA EL MAPA ★
  const opcionesMapa = [
    { id: 'satelite_hibrido', label: 'Satélite (Con Calles)', icono: '🌍' },
    { id: 'satelite_puro', label: 'Satélite (Sin Calles)', icono: '🛰️' },
    { id: 'gris', label: 'Claro (Gris moderno)', icono: '🏙️' },
    { id: 'calles', label: 'Calles (Beige clásico)', icono: '🗺️' },
    { id: 'oscuro', label: 'Modo Oscuro', icono: '🌙' }
  ];

  return (
    <div className="mb-2">
      {/* BOTÓN DEL MENÚ LATERAL */}
      <button 
        onClick={() => alternarAcordeon('mi_perfil')} 
        className="w-full p-3 flex justify-between items-center rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 shadow-sm transition-colors"
      >
        <span className="font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Users size={16} className="text-slate-500"/> Mi Perfil
        </span>
        <ChevronRight size={16} className="text-slate-400" />
      </button>
      
      {/* NUEVA VENTANA FLOTANTE */}
      <VentanaFlotante
        abierta={estaAbierta}
        alCerrar={() => alternarAcordeon('mi_perfil')}
        titulo="Mi Perfil"
        icono={Users}
      >
        <div className="p-5 bg-white dark:bg-slate-950 space-y-6 flex-1 overflow-y-auto scroll-limpio text-sm">
          
          {/* SECCIÓN: INFORMACIÓN DEL USUARIO */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                <Mail size={14} /> Correo Electrónico
              </label>
              <div className="font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 truncate">
                {perfilUsuario?.email || 'Cargando correo...'}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                <Users size={14} /> Nombre
              </label>
              {editandoNombre ? (
                <div className="flex items-center gap-2 animate-slide-up">
                  <input 
                    type="text" value={nombreTemp} onChange={(e) => setNombreTemp(e.target.value)} autoFocus
                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-indigo-300 dark:border-indigo-500/50 rounded-xl p-3 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold shadow-sm"
                  />
                  <button onClick={manejarGuardado} className="p-3 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:hover:bg-emerald-900/60 rounded-xl transition-colors shadow-sm"><Save size={18} /></button>
                  <button onClick={() => { setEditandoNombre(false); setNombreTemp(perfilUsuario?.nombre); }} className="p-3 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl transition-colors shadow-sm"><X size={18} /></button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 group shadow-sm">
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate text-base">{perfilUsuario?.nombre || 'Cargando...'}</span>
                  <button onClick={() => setEditandoNombre(true)} className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1" title="Editar nombre">
                    <Edit2 size={16} />
                  </button>
                </div>
              )}
            </div>
            
            <div className="pt-2">
              <button onClick={manejarRestablecerPassword} className="w-full py-3 bg-white dark:bg-slate-950 border border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-900/30 rounded-xl font-bold flex justify-center items-center gap-2 transition-colors shadow-sm">
                <Key size={16} /> Restablecer Contraseña
              </button>
            </div>
          </div>

          {/* SECCIÓN: CAPAS DEL MAPA */}
          <div className="pt-5 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Layers size={16} /> Capas y Estilo del Mapa
            </h4>

            {/* ★ NUEVO SELECTOR VISUAL DE MAPA ★ */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">
                <Map size={14} className="text-slate-400" /> Elige el Estilo de Vista
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {opcionesMapa.map((opcion) => {
                  const estaSeleccionado = estiloMapa === opcion.id;
                  return (
                    <button
                      key={opcion.id}
                      onClick={() => alCambiarEstiloMapa(opcion.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                        estaSeleccionado 
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-400 shadow-sm' 
                          : 'border-slate-100 bg-white dark:bg-slate-900 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800'
                      }`}
                    >
                      <span className="text-xl shrink-0">{opcion.icono}</span>
                      <span className={`text-xs font-bold flex-1 ${estaSeleccionado ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400'}`}>
                        {opcion.label}
                      </span>
                      {estaSeleccionado && (
                        <CheckCircle2 size={18} className="text-indigo-500 dark:text-indigo-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm mt-4">
              <label className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <input 
                  type="checkbox" 
                  checked={mostrarCalles} 
                  onChange={(e) => alCambiarMostrarCalles(e.target.checked)} 
                  className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 dark:bg-slate-800" 
                />
                Mostrar Calles y Rutas
              </label>
              <label className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <input 
                  type="checkbox" 
                  checked={mostrarLugares} 
                  onChange={(e) => alCambiarMostrarLugares(e.target.checked)} 
                  className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 dark:bg-slate-800" 
                />
                Mostrar Nombres de Lugares
              </label>
            </div>
          </div>
          
          {/* SECCIÓN: CERRAR SESIÓN */}
          <div className="pt-6 mt-4 border-t border-slate-200 dark:border-slate-800">
            <button 
              onClick={async () => { await supabase.auth.signOut(); alCerrar(); }} 
              className="w-full py-3.5 flex items-center justify-center gap-2 text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50 hover:border-rose-200 rounded-xl font-bold transition-colors shadow-sm"
            >
              <LogOut size={18} /> Cerrar Sesión Segura
            </button>
          </div>
        </div>
      </VentanaFlotante>
    </div>
  );
}