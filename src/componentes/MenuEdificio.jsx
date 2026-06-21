// src/componentes/MenuEdificio.jsx
import React from 'react';
import { X, CheckCircle2, HelpCircle, AlertCircle, Save, Trash2 } from 'lucide-react';

export default function MenuEdificio({
  edificio, alCerrar, alCambiarEstado, notasTemp, alCambiarNotasTemp, alGuardar, alEliminar // <-- Nueva prop
}) {
  if (!edificio) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[4000] transition-opacity" onClick={alCerrar} />
      <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-[4001] animate-slide-up border-t border-slate-200 dark:border-slate-800">
        <div className="w-full flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
        </div>

        <div className="p-5 space-y-5">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                🏠 {edificio.direccion || "Nueva Casa"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Coord: {edificio.lat.toFixed(5)}, {edificio.lng.toFixed(5)}
              </p>
            </div>
            <button onClick={alCerrar} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500 transition-colors">
              <X size={18} />
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Estado de la Visita</label>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => alCambiarEstado('pendiente')} className={`flex flex-col items-center justify-center py-3 rounded-xl border-2 transition-all ${edificio.estado === 'pendiente' ? 'bg-orange-50 border-orange-500 text-orange-600' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}>
                <AlertCircle size={24} className="mb-1" />
                <span className="text-[10px] font-bold">Falta (Pendiente)</span>
              </button>
              <button onClick={() => alCambiarEstado('no_responde')} className={`flex flex-col items-center justify-center py-3 rounded-xl border-2 transition-all ${edificio.estado === 'no_responde' ? 'bg-orange-50 border-orange-500 text-orange-600' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}>
                <HelpCircle size={24} className="mb-1" />
                <span className="text-[10px] font-bold">Falta (No Resp.)</span>
              </button>
              <button onClick={() => alCambiarEstado('completado')} className={`flex flex-col items-center justify-center py-3 rounded-xl border-2 transition-all ${edificio.estado === 'completado' ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}>
                <CheckCircle2 size={24} className="mb-1" />
                <span className="text-[10px] font-bold">Completado</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Observaciones</label>
            <textarea value={notasTemp} onChange={(e) => alCambiarNotasTemp(e.target.value)} placeholder="Ej: Tocar fuerte, señora amable..." rows="2" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-slate-800 dark:text-slate-100" />
          </div>

          <div className="flex gap-2">
            {/* Solo muestra el botón eliminar si la casa ya existe en BD (tiene ID) */}
            {edificio.id && (
              <button onClick={() => alEliminar(edificio.id)} className="flex items-center justify-center p-3.5 bg-rose-100 hover:bg-rose-200 text-rose-600 rounded-xl transition-all">
                <Trash2 size={18} />
              </button>
            )}
            <button onClick={alGuardar} className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
              <Save size={18} /> Confirmar y Guardar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}