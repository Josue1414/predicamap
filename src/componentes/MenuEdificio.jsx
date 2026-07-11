// src/componentes/MenuEdificio.jsx
import React, { useState } from 'react';
import { X, CheckCircle2, AlertOctagon, Clock, Save, Trash2, Home, MapPin, Edit3, Check } from 'lucide-react';

export default function MenuEdificio({
  edificio, 
  perfilUsuario, 
  alCerrar, 
  alCambiarEstado, 
  alCambiarDireccion,
  alCambiarTipo, 
  notasTemp, 
  alCambiarNotasTemp, 
  alGuardar, 
  alEliminar 
}) {
  const [modoEdicionDir, setModoEdicionDir] = useState(false);

  if (!edificio) return null;

  const esCapitanYSuperior = perfilUsuario?.rol === 'Capitán' || perfilUsuario?.rol === 'Administrador' || perfilUsuario?.rol === 'Administrador Mayor';
  const esCalle = edificio.tipo_edificio === 'calle';

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[4000] transition-opacity" onClick={alCerrar} />
      
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl z-[4001] animate-slide-up border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        
        <div className="p-6 space-y-5">
          
          {/* ★ CAMBIO: SELECTOR DE TIPO SÓLO SE MUESTRA SI ES NUEVO (SIN ID) ★ */}
          {!edificio.id && (
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shadow-inner">
              <button 
                onClick={() => {
                  alCambiarTipo('calle');
                  if (edificio.estado === 'no_responde') alCambiarEstado('pendiente'); 
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${esCalle ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
              >
                🛣️ Calle / Banqueta
              </button>
              <button 
                onClick={() => alCambiarTipo('casa')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${!esCalle ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
              >
                🏠 Casa / Edificio
              </button>
            </div>
          )}

          {/* CABECERA Y EDICIÓN DE DIRECCIÓN */}
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-4">
              {esCapitanYSuperior ? (
                modoEdicionDir ? (
                  <div className="flex flex-col animate-fade-in">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Editando Identificador</label>
                    <div className="flex items-center gap-2">
                      {esCalle ? <MapPin size={18} className="text-slate-400" /> : <Home size={18} className="text-slate-400" />}
                      <input
                        autoFocus
                        type="text"
                        value={edificio.direccion || ''}
                        onChange={(e) => alCambiarDireccion(e.target.value)}
                        placeholder={esCalle ? "Ej: Lado Norte..." : "Ej: Edificio A, Casa 5..."}
                        className="w-full font-black text-lg text-slate-800 dark:text-slate-100 bg-transparent border-b-2 border-indigo-500 focus:outline-none py-1 transition-colors"
                      />
                      <button 
                        onClick={() => setModoEdicionDir(false)} 
                        className="p-1.5 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-500/20 text-emerald-600 rounded-lg transition-colors"
                      >
                        <Check size={18} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 group">
                    <h3 className="font-black text-xl text-slate-800 dark:text-slate-100 flex items-center gap-2 leading-tight">
                      {esCalle ? "🛣️" : "🏠"} {edificio.direccion || (esCalle ? "Nueva Calle" : "Nueva Casa")}
                    </h3>
                    <button 
                      onClick={() => setModoEdicionDir(true)} 
                      className="p-1.5 bg-slate-100 hover:bg-indigo-100 dark:bg-slate-800 text-slate-500 rounded-lg transition-colors"
                    >
                      <Edit3 size={14} />
                    </button>
                  </div>
                )
              ) : (
                <div>
                  <h3 className="font-black text-xl text-slate-800 dark:text-slate-100 flex items-center gap-2 leading-tight">
                    {esCalle ? "🛣️" : "🏠"} {edificio.direccion || (esCalle ? "Nueva Calle" : "Nueva Casa")}
                  </h3>
                </div>
              )}
            </div>
            <button onClick={alCerrar} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500 transition-colors flex-shrink-0">
              <X size={18} />
            </button>
          </div>

          {/* ESTADOS DE VISITA */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Estado del Sector</label>
            <div className={`grid gap-2 ${esCapitanYSuperior && !esCalle ? 'grid-cols-3' : 'grid-cols-2'}`}>
              
              <button onClick={() => alCambiarEstado('pendiente')} className={`flex flex-col items-center justify-center py-3 rounded-xl border-2 transition-all ${edificio.estado === 'pendiente' ? 'bg-orange-50 border-orange-500 text-orange-600 dark:bg-orange-500/10' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}>
                <Clock size={22} className="mb-1.5" />
                <span className="text-[10px] font-bold">Faltante</span>
              </button>

              {esCapitanYSuperior && !esCalle && (
                <button onClick={() => alCambiarEstado('no_responde')} className={`flex flex-col items-center justify-center py-3 rounded-xl border-2 transition-all ${edificio.estado === 'no_responde' ? 'bg-rose-50 border-rose-500 text-rose-600 dark:bg-rose-500/10' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}>
                  <AlertOctagon size={22} className="mb-1.5" />
                  <span className="text-[10px] font-bold leading-tight text-center px-1">No Visitar</span>
                </button>
              )}

              <button onClick={() => alCambiarEstado('completado')} className={`flex flex-col items-center justify-center py-3 rounded-xl border-2 transition-all ${edificio.estado === 'completado' ? 'bg-emerald-50 border-emerald-500 text-emerald-600 dark:bg-emerald-500/10' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}>
                <CheckCircle2 size={22} className="mb-1.5" />
                <span className="text-[10px] font-bold">Completado</span>
              </button>
            </div>
          </div>

          {/* OBSERVACIONES */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Observaciones</label>
            {/* ★ CAMBIO: SÓLO CAPITANES Y SUPERIORES PUEDEN EDITAR NOTAS ★ */}
            {esCapitanYSuperior ? (
              <textarea 
                value={notasTemp} 
                onChange={(e) => alCambiarNotasTemp(e.target.value)} 
                placeholder={esCalle ? "Ej: Perros sueltos, calle cerrada..." : "Ej: Tocar fuerte..."}
                rows="2" 
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 resize-none text-slate-800 dark:text-slate-100 transition-colors" 
              />
            ) : (
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                  "{notasTemp || 'Sin observaciones'}"
                </p>
              </div>
            )}
          </div>

          {/* BOTONERÍA FINAL */}
          <div className="flex gap-2 pt-2">
            {esCapitanYSuperior && edificio.id && (
              <button onClick={() => alEliminar(edificio.id)} className="flex items-center justify-center p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl transition-all">
                <Trash2 size={18} />
              </button>
            )}
            <button onClick={alGuardar} className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20">
              <Save size={18} /> Confirmar Cambios
            </button>
          </div>

        </div>
      </div>
    </>
  );
}