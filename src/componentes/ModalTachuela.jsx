// src/componentes/ModalTachuela.jsx
import React, { useState } from 'react';
import { X, Trash2, MapPin, Loader2 } from 'lucide-react'; // <-- IMPORTAMOS LOADER2
import { useAlertas } from '../context/ContextoAlertas'; // <-- IMPORTAMOS EL CONTEXTO DE ALERTAS

export function ModalFormularioTachuela({ alGuardar, alCancelar }) {
  const [titulo, setTitulo] = useState('');
  const [notas, setNotas] = useState('');
  const [guardando, setGuardando] = useState(false); // <-- ESTADO DE CARGA

  const { mostrarAlerta } = useAlertas(); // <-- EXTRAEMOS ALERTA

  const manejarSubmit = async (e) => {
    e.preventDefault();
    
    if (!titulo.trim()) {
      // REEMPLAZAMOS EL ALERT NATIVO
      mostrarAlerta("Atención", "El título o aviso es obligatorio", "warning");
      return;
    }
    
    if (guardando) return; // Evitar doble clic
    
    setGuardando(true);
    try {
      await alGuardar({ titulo, notas });
    } finally {
      // Usamos finally por si ocurre un error y el componente no se desmonta
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
              disabled={guardando} // Deshabilitar botón cerrar si está guardando
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
                disabled={guardando} // Deshabilitar input si está guardando
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-500 text-slate-800 dark:text-slate-100 disabled:opacity-50" 
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Observaciones</label>
              <textarea 
                value={notas} 
                onChange={(e) => setNotas(e.target.value)} 
                placeholder="Ej: Nos quedamos en la casa verde de la esquina..." 
                rows="3" 
                disabled={guardando} // Deshabilitar textarea si está guardando
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-500 resize-none text-slate-800 dark:text-slate-100 disabled:opacity-50" 
              />
            </div>

            <button 
              type="submit" 
              disabled={guardando} // Deshabilitar botón submit
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

export function ModalInfoTachuela({ tachuela, puedeEliminar, alEliminar, alCerrar }) {
  const [eliminando, setEliminando] = useState(false); // <-- ESTADO DE CARGA AL ELIMINAR
  const { mostrarConfirmacion } = useAlertas(); // <-- EXTRAEMOS ALERTA DE CONFIRMACIÓN

  const manejarEliminar = async () => {
    if (eliminando) return; // Prevenir doble clic

    // REEMPLAZAMOS EL CONFIRM NATIVO O AÑADIMOS UNO SI NO HABÍA
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
      // Aunque normalmente el modal se cierra al eliminar, es buena práctica resetear
      setEliminando(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[4000] transition-opacity" onClick={alCerrar} />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl z-[4001] animate-slide-up overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-black text-xl text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <MapPin size={24} className="text-cyan-600 fill-cyan-600" /> {tachuela.titulo}
            </h3>
            <button 
              onClick={alCerrar} 
              disabled={eliminando} // Deshabilitar cerrar mientras elimina
              className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500 disabled:opacity-50 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          
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

          <div className="flex gap-2 mt-6">
            {puedeEliminar && (
              <button 
                onClick={manejarEliminar} 
                disabled={eliminando} // Deshabilitar botón borrar
                className="flex-1 py-3.5 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 font-bold rounded-xl transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {eliminando ? (
                  <><Loader2 size={16} className="animate-spin" /> Borrando...</>
                ) : (
                  <><Trash2 size={16} /> Borrar</>
                )}
              </button>
            )}
            <button 
              onClick={alCerrar} 
              disabled={eliminando} // Deshabilitar botón aceptar mientras elimina
              className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl disabled:opacity-50 transition-colors"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}