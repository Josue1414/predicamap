// src/componentes/menu-lateral/SeccionAjustesGenerales.jsx
import React, { useState, useEffect } from 'react';
import { MapPin, Layers, Share2, ChevronUp, ChevronDown, Save } from 'lucide-react';

export default function SeccionAjustesGenerales({
  visible,
  nombreCongregacion,
  alCambiarNombreCongregacion,
  alCrearLinkInvitacion,
  mostrarCalles,
  alCambiarMostrarCalles,
  mostrarLugares,
  alCambiarMostrarLugares,
  acordeonActivo,
  alternarAcordeon
}) {
  // Estado local para escribir sin afectar la BD al instante
  const [nombreTemp, setNombreTemp] = useState('');

  // Sincroniza el nombre local si cambia desde afuera
  useEffect(() => {
    setNombreTemp(nombreCongregacion || '');
  }, [nombreCongregacion]);

  if (!visible) return null;

  const manejarGuardado = () => {
    if (nombreTemp.trim() !== '') {
      alCambiarNombreCongregacion(nombreTemp.trim());
    }
  };

  return (
    <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-2">
      <button onClick={() => alternarAcordeon('configuracion')} className="w-full p-3 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
        <span className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <MapPin size={16} className="text-blue-500"/> General
        </span>
        {acordeonActivo === 'configuracion' ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      
      {acordeonActivo === 'configuracion' && (
        <div className="p-4 bg-white dark:bg-slate-950 space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Nombre de la Congregación</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={nombreTemp} 
                onChange={(e) => setNombreTemp(e.target.value)} 
                className="w-full border rounded-lg p-2 text-xs dark:bg-slate-900 dark:border-slate-700 dark:text-white focus:ring-1 focus:ring-indigo-500 font-bold outline-none" 
              />
              <button 
                onClick={manejarGuardado}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Save size={14} />
              </button>
            </div>
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
  );
}