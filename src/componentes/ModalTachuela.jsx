// src/componentes/ModalTachuela.jsx
import React, { useState } from 'react';
import { X, Trash2, MapPin, Loader2, Edit2, Save } from 'lucide-react'; 
import { useAlertas } from '../context/ContextoAlertas'; 

export function ModalFormularioTachuela({ alGuardar, alCancelar }) {
  const [titulo, setTitulo] = useState('');
  const [notas, setNotas] = useState('');
  const [guardando, setGuardando] = useState(false); 

  const { mostrarAlerta } = useAlertas(); 

  const manejarSubmit = async (e) => {
    e.preventDefault();
    if (!titulo.trim()) {
      mostrarAlerta("Atención", "El título o aviso es obligatorio", "warning");
      return;
    }
    if (guardando) return; 
    setGuardando(true);
    try {
      await alGuardar({ titulo, notas });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[4000] transition-opacity" onClick={alCancelar} />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl z-[4001] animate-slide-up overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex justify-between items-start mb-5">
            <h3 className="font-black text-xl text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
              <MapPin size={24} className="fill-cyan-600 dark:fill-cyan-400" /> Nuevo Aviso
            </h3>
            <button 
              onClick={alCancelar} 
              disabled={guardando} 
              className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500 disabled:opacity-50 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          
          <form onSubmit={manejarSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Título / Aviso *</label>
              <input 
                type="text" 
                value={titulo} 
                onChange={(e) => setTitulo(e.target.value)} 
                placeholder="Ej: Continuar aquí mañana..." 
                autoFocus 
                disabled={guardando} 
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-800 dark:text-slate-100 disabled:opacity-50 transition-all font-semibold" 
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Observaciones</label>
              <textarea 
                value={notas} 
                onChange={(e) => setNotas(e.target.value)} 
                placeholder="Ej: Nos quedamos en la casa verde de la esquina..." 
                rows="3" 
                disabled={guardando} 
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none text-slate-800 dark:text-slate-100 disabled:opacity-50 transition-all" 
              />
            </div>

            <button 
              type="submit" 
              disabled={guardando} 
              className="w-full mt-2 py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:active:scale-100"
            >
              {guardando ? (
                <><Loader2 size={18} className="animate-spin" /> Guardando...</>
              ) : (
                'Fijar en el Mapa'
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

// ★ ACTUALIZADO PARA SOPORTAR EDICIÓN ★
export function ModalInfoTachuela({ tachuela, puedeEliminar, alEliminar, alEditar, alCerrar }) {
  const [eliminando, setEliminando] = useState(false); 
  const [editando, setEditando] = useState(false); // Estado para cambiar la vista
  const [guardando, setGuardando] = useState(false);
  
  // Estados para los inputs de edición
  const [tituloEdit, setTituloEdit] = useState(tachuela.titulo);
  const [notasEdit, setNotasEdit] = useState(tachuela.notas || '');

  const { mostrarConfirmacion, mostrarAlerta } = useAlertas(); 

  const manejarEliminar = async () => {
    if (eliminando || guardando) return; 
    const confirmado = await mostrarConfirmacion(
      "Eliminar Aviso",
      `¿Estás seguro de eliminar el aviso "${tachuela.titulo}"?`,
      "danger",
      "Sí, eliminar"
    );

    if (!confirmado) return;
    setEliminando(true);
    try {
      await alEliminar(tachuela.id);
    } finally {
      setEliminando(false);
    }
  };

  const manejarGuardarEdicion = async () => {
    if (!tituloEdit.trim()) {
      mostrarAlerta("Atención", "El título es obligatorio", "warning");
      return;
    }
    setGuardando(true);
    try {
      // Llamamos a la función que pasaremos desde el dashboard
      await alEditar(tachuela.id, { titulo: tituloEdit, notas: notasEdit });
      setEditando(false); // Salimos del modo edición
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[4000] transition-opacity" onClick={alCerrar} />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl z-[4001] animate-slide-up overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-black text-xl text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <MapPin size={24} className="text-cyan-600 fill-cyan-600" /> 
              {editando ? 'Editar Aviso' : tachuela.titulo}
            </h3>
            <button 
              onClick={alCerrar} 
              disabled={eliminando || guardando} 
              className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500 disabled:opacity-50 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          
          {editando ? (
            <div className="space-y-4 mb-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Título / Aviso *</label>
                <input 
                  type="text" 
                  value={tituloEdit} 
                  onChange={(e) => setTituloEdit(e.target.value)} 
                  disabled={guardando} 
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-800 dark:text-slate-100 font-semibold" 
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Observaciones</label>
                <textarea 
                  value={notasEdit} 
                  onChange={(e) => setNotasEdit(e.target.value)} 
                  rows="3" 
                  disabled={guardando} 
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none text-slate-800 dark:text-slate-100" 
                />
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tipo</label>
                <div className="font-black text-sm uppercase text-cyan-600">Aviso Grupal</div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Notas u Observaciones</label>
                <div className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm text-slate-700 dark:text-slate-200 min-h-[80px] whitespace-pre-wrap">
                  {tachuela.notas ? tachuela.notas : <span className="italic text-slate-400">Sin detalles...</span>}
                </div>
              </div>
            </>
          )}

          {/* BOTONES ADAPTADOS AL MODO */}
          {editando ? (
            <div className="flex gap-2 mt-6">
              <button 
                onClick={() => setEditando(false)} 
                disabled={guardando}
                className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button 
                onClick={manejarGuardarEdicion} 
                disabled={guardando}
                className="flex-1 py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-colors flex justify-center items-center gap-2 shadow-lg shadow-cyan-600/20 disabled:opacity-50"
              >
                {guardando ? <><Loader2 size={16} className="animate-spin" /> Guardando</> : <><Save size={16} /> Guardar</>}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 mt-6">
              {puedeEliminar ? (
                <>
                  <button 
                    onClick={() => setEditando(true)} 
                    disabled={eliminando} 
                    className="py-3.5 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                  >
                    <Edit2 size={16} /> Editar
                  </button>
                  <button 
                    onClick={manejarEliminar} 
                    disabled={eliminando} 
                    className="py-3.5 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 font-bold rounded-xl transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                  >
                    {eliminando ? <Loader2 size={16} className="animate-spin" /> : <><Trash2 size={16} /> Borrar</>}
                  </button>
                </>
              ) : (
                <button 
                  onClick={alCerrar} 
                  disabled={eliminando} 
                  className="col-span-2 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  Aceptar
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}