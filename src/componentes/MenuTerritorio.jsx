// src/componentes/MenuTerritorio.jsx
import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, RefreshCcw, Save, Map, CalendarCheck } from 'lucide-react';

export default function MenuTerritorio({
  territorio,
  edificios,
  perfilUsuario,
  alCerrar,
  alCompletar,
  alReiniciar,
  alGuardarNotas
}) {
  const [notasTemp, setNotasTemp] = useState('');

  useEffect(() => {
    if (territorio) setNotasTemp(territorio.notas || '');
  }, [territorio]);

  if (!territorio) return null;

  const casasDeEstaSeccion = edificios.filter(e => e.seccion_id === territorio.id);
  const totalCasas = casasDeEstaSeccion.length;
  const casasCompletadas = casasDeEstaSeccion.filter(e => e.estado === 'completado').length;
  
  let porcentaje = 0;
  if (totalCasas > 0) {
    porcentaje = Math.round((casasCompletadas / totalCasas) * 100);
  } else {
    porcentaje = territorio.estado === 'completado' ? 100 : 0;
  }

  const esCapitanYSuperior = perfilUsuario?.rol === 'Capitán' || perfilUsuario?.rol === 'Administrador' || perfilUsuario?.rol === 'Administrador Mayor';

  const manejarGuardar = () => {
    alGuardarNotas(territorio.id, notasTemp);
    alCerrar();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[4000] transition-opacity" onClick={alCerrar} />
      
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl z-[4001] animate-slide-up border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        
        <div className="p-6 space-y-5">
          <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex-1 pr-4">
              <h3 className="font-black text-xl text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Map size={20} className="text-indigo-500" /> {territorio.nombre}
              </h3>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${porcentaje}%` }}></div>
                </div>
                <span className="text-[10px] font-bold text-slate-500">{porcentaje}%</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">{totalCasas > 0 ? `${casasCompletadas} de ${totalCasas} casas completadas` : 'Territorio sin puntos marcados'}</p>
              
              {/* NUEVO: ETIQUETA DE FECHA CUANDO ESTÁ AL 100% */}
              {porcentaje === 100 && (
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-md border border-emerald-100 dark:border-emerald-800/50">
                  <CalendarCheck size={12} />
                  <span className="text-[9px] font-bold uppercase tracking-wider">
                    Terminado: {territorio.actualizado_en ? new Date(territorio.actualizado_en).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recientemente'}
                  </span>
                </div>
              )}
            </div>
            <button onClick={alCerrar} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500 transition-colors flex-shrink-0">
              <X size={18} />
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Notas del Territorio</label>
            <textarea 
              value={notasTemp} 
              onChange={(e) => setNotasTemp(e.target.value)} 
              placeholder="Ej: Zona con perros, iniciar por la calle principal..." 
              rows="3" 
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 resize-none text-slate-800 dark:text-slate-100 transition-colors" 
            />
          </div>

          <div className="grid grid-cols-1 gap-2 pt-2">
            <button 
              disabled={porcentaje === 100} 
              onClick={() => { alCompletar(territorio.id); alCerrar(); }} 
              className="flex justify-center items-center gap-1.5 py-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold text-sm hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-emerald-200 dark:border-emerald-800"
            >
              <CheckCircle2 size={16} /> {porcentaje === 100 ? 'Territorio Terminado' : (totalCasas === 0 ? 'Marcar Completado' : 'Marcar TODO Completado')}
            </button>

            {esCapitanYSuperior && porcentaje > 0 && (
              <button 
                onClick={() => { alReiniciar(territorio.id); alCerrar(); }} 
                className="flex justify-center items-center gap-1.5 py-3 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl font-bold text-sm hover:bg-orange-100 transition-colors border border-orange-200 dark:border-orange-800"
              >
                <RefreshCcw size={16} /> Reiniciar Territorio
              </button>
            )}

            <button onClick={manejarGuardar} className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
              <Save size={18} /> Guardar Notas
            </button>
          </div>
        </div>
      </div>
    </>
  );
}