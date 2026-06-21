// src/componentes/CabeceraCongregacion.jsx
import React from 'react';
import { MapPin, Moon, Sun, Menu } from 'lucide-react';

export default function CabeceraCongregacion({ nombreCongregacion, modoOscuro, alCambiarModo, alAbrirMenu }) {
  return (
    <header className="w-full h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 fixed top-0 left-0 z-[2000] shadow-sm transition-colors duration-200">
      <div className="flex items-center gap-2">
        {/* Eliminamos el md:hidden para que siempre se vea el menú hamburguesa */}
        <button 
          onClick={alAbrirMenu}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
          <MapPin size={22} className="animate-pulse" />
          <div>
            <h1 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white leading-none">PredicaMap</h1>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{nombreCongregacion}</span>
          </div>
        </div>
      </div>

      <button
        onClick={alCambiarModo}
        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-500 transition-colors"
      >
        {modoOscuro ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </header>
  );
}