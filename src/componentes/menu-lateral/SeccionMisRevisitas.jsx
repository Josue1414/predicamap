// src/componentes/menu-lateral/SeccionMisRevisitas.jsx
import React, { useRef } from 'react';
import { BookmarkPlus, ChevronUp, ChevronDown, Navigation, Share2, Edit, Trash2, Download, Upload } from 'lucide-react';

export default function SeccionMisRevisitas({
  visible,
  acordeonActivo,
  alternarAcordeon,
  marcadoresPersonales = [],
  alVolarARevisita,
  alEditarRevisita,
  alEliminarRevisita,
  alCompartirRevisita,
  alExportarBackup,
  alImportarBackup,
  revisitaExpandida,
  setRevisitaExpandida
}) {
  const inputImportarRef = useRef(null);

  if (!visible) return null;

  const hoyStr = new Date().toISOString().split('T')[0];
  const marcadoresOrdenados = [...marcadoresPersonales].sort((a, b) => {
    if (a.fechaProgramada === hoyStr && b.fechaProgramada !== hoyStr) return -1;
    if (b.fechaProgramada === hoyStr && a.fechaProgramada !== hoyStr) return 1;
    return new Date(a.fechaProgramada || '2099-01-01') - new Date(b.fechaProgramada || '2099-01-01');
  });

  return (
    <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-2 shadow-sm">
      <button onClick={() => alternarAcordeon('revisitas')} className="w-full p-3 flex justify-between items-center bg-purple-50 dark:bg-purple-900/10 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
        <span className="font-bold text-xs text-purple-700 dark:text-purple-400 flex items-center gap-2">
          <BookmarkPlus size={16} className="text-purple-500"/> Mis Revisitas ({marcadoresOrdenados.length})
        </span>
        {acordeonActivo === 'revisitas' ? <ChevronUp size={16} className="text-purple-400" /> : <ChevronDown size={16} className="text-purple-400" />}
      </button>
      
      {acordeonActivo === 'revisitas' && (
        <div className="p-3 bg-white dark:bg-slate-950 max-h-96 overflow-y-auto space-y-2 scroll-limpio border-t border-purple-100 dark:border-purple-900/20">
          {marcadoresOrdenados.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">Toca el botón "+ Revisita" en el mapa para agendar. Solo tú podrás verla.</p>
          ) : (
            marcadoresOrdenados.map(m => {
              const esHoy = m.fechaProgramada === hoyStr;
              return (
                <div key={m.id} className={`border rounded-lg overflow-hidden shadow-sm transition-colors ${esHoy ? 'border-amber-400 dark:border-amber-600/50 bg-amber-50/20 dark:bg-amber-900/10' : 'border-slate-100 dark:border-slate-800'}`}>
                  <div onClick={() => setRevisitaExpandida(revisitaExpandida === m.id ? null : m.id)} className="p-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <div className="flex flex-col flex-1 pr-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-tight">{m.titulo}</span>
                        {esHoy && <span className="bg-amber-400 text-white text-[9px] px-1.5 py-0.5 rounded uppercase font-black animate-pulse">¡HOY!</span>}
                      </div>
                      <span className="text-[10px] text-slate-500 mt-0.5">{m.fechaProgramada ? `Agendado: ${m.fechaProgramada}` : 'Sin fecha específica'}</span>
                    </div>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${revisitaExpandida === m.id ? 'rotate-180' : ''}`} />
                  </div>
                  
                  {revisitaExpandida === m.id && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 whitespace-pre-wrap">"{m.notas || 'Sin notas especiales'}"</p>
                      
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <button onClick={() => alVolarARevisita(m)} className="flex justify-center items-center gap-1.5 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg font-bold text-[10px] hover:bg-indigo-100 transition-colors"><Navigation size={12}/> Volar</button>
                        <button onClick={() => alCompartirRevisita(m)} className="flex justify-center items-center gap-1.5 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg font-bold text-[10px] hover:bg-emerald-100 transition-colors"><Share2 size={12}/> Enviar</button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => alEditarRevisita(m)} className="flex justify-center items-center gap-1.5 py-2 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg font-bold text-[10px] hover:bg-slate-300 transition-colors"><Edit size={12}/> Editar</button>
                        <button onClick={() => alEliminarRevisita(m.id)} className="flex justify-center items-center gap-1.5 py-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg font-bold text-[10px] hover:bg-rose-100 transition-colors"><Trash2 size={12}/> Borrar</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
          
          <div className="flex gap-2 pt-3 mt-2 border-t border-slate-100 dark:border-slate-800">
            <button onClick={alExportarBackup} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 hover:bg-slate-200 transition-colors">
              <Download size={14}/> Backup
            </button>
            <input type="file" accept=".json" ref={inputImportarRef} onChange={alImportarBackup} className="hidden" />
            <button onClick={() => inputImportarRef.current.click()} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 hover:bg-slate-200 transition-colors">
              <Upload size={14}/> Cargar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}