// src/componentes/ModalesRevisita.jsx
import React, { useState } from 'react';
import { BookmarkPlus, X } from 'lucide-react';

export function ModalFormularioRevisita({ marcadorEditando, alGuardar, alCancelar }) {
  const [titulo, setTitulo] = useState(marcadorEditando?.titulo || '');
  const [fecha, setFecha] = useState(marcadorEditando?.fechaProgramada || '');
  const [notas, setNotas] = useState(marcadorEditando?.notas || '');

  const manejarSubmit = (e) => {
    e.preventDefault();
    if (!titulo.trim()) return alert("El título o nombre es obligatorio");
    alGuardar({ titulo, fechaProgramada: fecha, notas });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[4000] transition-opacity" onClick={alCancelar} />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl z-[4001] animate-slide-up overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex justify-between items-start mb-5">
            <h3 className="font-black text-xl text-purple-700 dark:text-purple-400 flex items-center gap-2">
              <BookmarkPlus size={24} /> {marcadorEditando ? 'Editar Revisita' : 'Guardar Revisita'}
            </h3>
            <button onClick={alCancelar} className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500 transition-colors"><X size={18} /></button>
          </div>
          <form onSubmit={manejarSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Nombre / Título *</label>
              <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej: Familia López, Casa Azul..." autoFocus className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-500 text-slate-800 dark:text-slate-100" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Día programado (Opcional)</label>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-500 text-slate-800 dark:text-slate-100" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Observaciones / Hora</label>
              <textarea value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Ej: Visitar por la tarde a las 5:00 PM, llevar folleto..." rows="3" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-500 resize-none text-slate-800 dark:text-slate-100" />
            </div>
            <button type="submit" className="w-full mt-2 py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/20 active:scale-95 transition-all">
              {marcadorEditando ? 'Actualizar Datos' : 'Guardar en mi Mapa'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export function ModalInfoLecturaRevisita({ titulo, fechaProgramada, notas, alCerrar }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[4000] transition-opacity" onClick={alCerrar} />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl z-[4001] animate-slide-up overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-black text-xl text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <BookmarkPlus size={24} className="text-purple-500" /> {titulo}
            </h3>
            <button onClick={alCerrar} className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500 transition-colors"><X size={18} /></button>
          </div>
          <div className="mb-4">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Estado de Visita</label>
            <div className="font-black text-sm uppercase text-purple-500">
              {fechaProgramada ? `Agendado: ${fechaProgramada}` : 'Sin fecha específica'}
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Notas u Observaciones</label>
            <div className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm text-slate-700 dark:text-slate-200 min-h-[80px] whitespace-pre-wrap">
              {notas ? notas : <span className="italic text-slate-400">Sin detalles registrados...</span>}
            </div>
          </div>
          <button onClick={alCerrar} className="w-full mt-6 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors">
            Aceptar
          </button>
        </div>
      </div>
    </>
  );
}