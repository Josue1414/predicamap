// src/componentes/menu-lateral/SeccionMisRevisitas.jsx
import React, { useRef } from 'react';
import { BookmarkPlus, ChevronRight, ChevronDown, Navigation, Share2, Edit, Trash2, Download, Upload, Info } from 'lucide-react';
import VentanaFlotante from '../VentanaFlotante';

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

  const estaAbierta = acordeonActivo === 'revisitas';

  return (
    <div className="mb-2">
      {/* BOTÓN DEL MENÚ LATERAL */}
      <button 
        onClick={() => alternarAcordeon('revisitas')} 
        className="w-full p-3 flex justify-between items-center rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-purple-50 dark:hover:bg-purple-900/10 shadow-sm transition-colors"
      >
        <span className="font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <BookmarkPlus size={16} className="text-purple-500"/> 
          Mis Revisitas ({marcadoresOrdenados.length})
        </span>
        <ChevronRight size={16} className="text-slate-400" />
      </button>
      
      {/* VENTANA FLOTANTE */}
      <VentanaFlotante
        abierta={estaAbierta}
        alCerrar={() => alternarAcordeon('revisitas')}
        titulo={`Mis Revisitas (${marcadoresOrdenados.length})`}
        icono={BookmarkPlus}
      >
        <div className="flex flex-col h-full">
          <div className="bg-amber-50 dark:bg-amber-900/20 px-4 py-3 border-b border-amber-100 dark:border-amber-900/50 flex items-start gap-2 shrink-0">
            <Info size={16} className="text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase leading-snug">
              Tus revisitas solo viven en tu dispositivo, no se muestran a los demás.
            </p>
          </div>
          
          <div className="p-4 space-y-3">
            {marcadoresOrdenados.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8 bg-white dark:bg-slate-950 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                Toca el botón "+ Revisita" en el mapa para agendar. Solo tú podrás verla.
              </p>
            ) : (
              marcadoresOrdenados.map(m => {
                const esHoy = m.fechaProgramada === hoyStr;
                return (
                  <div key={m.id} className={`border rounded-xl overflow-hidden shadow-sm transition-colors ${esHoy ? 'border-amber-400 dark:border-amber-600/50 bg-amber-50/20 dark:bg-amber-900/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950'}`}>
                    <div onClick={() => setRevisitaExpandida(revisitaExpandida === m.id ? null : m.id)} className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                      <div className="flex flex-col flex-1 pr-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight">{m.titulo}</span>
                          {esHoy && <span className="bg-amber-400 text-white text-[10px] px-2 py-0.5 rounded uppercase font-black animate-pulse">¡HOY!</span>}
                        </div>
                        <span className="text-xs text-slate-500">{m.fechaProgramada ? `Agendado: ${m.fechaProgramada}` : 'Sin fecha específica'}</span>
                      </div>
                      <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${revisitaExpandida === m.id ? 'rotate-180' : ''}`} />
                    </div>
                    
                    {revisitaExpandida === m.id && (
                      <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 animate-slide-up">
                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-4 whitespace-pre-wrap italic bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                          "{m.notas || 'Sin notas especiales'}"
                        </p>
                        
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          {/* ★ BOTÓN VOLAR ACTUALIZADO ★ */}
                          <button 
                            onClick={() => {
                              alVolarARevisita(m);
                              alternarAcordeon(null);
                            }} 
                            className="flex justify-center items-center gap-2 py-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-xs hover:bg-indigo-100 transition-colors"
                          >
                            <Navigation size={14}/> Volar
                          </button>
                          
                          <button onClick={() => alCompartirRevisita(m)} className="flex justify-center items-center gap-2 py-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-colors">
                            <Share2 size={14}/> Enviar
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {/* ★ BOTÓN EDITAR ACTUALIZADO ★ */}
                          <button 
                            onClick={() => {
                              alEditarRevisita(m);
                              alternarAcordeon(null);
                            }} 
                            className="flex justify-center items-center gap-2 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-300 transition-colors"
                          >
                            <Edit size={14}/> Editar
                          </button>
                          
                          <button onClick={() => alEliminarRevisita(m.id)} className="flex justify-center items-center gap-2 py-2.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl font-bold text-xs hover:bg-rose-100 transition-colors">
                            <Trash2 size={14}/> Borrar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
            
            <div className="flex gap-3 pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
              <button onClick={alExportarBackup} className="flex-1 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
                <Download size={16}/> Backup
              </button>
              <input type="file" accept=".json" ref={inputImportarRef} onChange={alImportarBackup} className="hidden" />
              <button onClick={() => inputImportarRef.current.click()} className="flex-1 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
                <Upload size={16}/> Cargar
              </button>
            </div>
          </div>
        </div>
      </VentanaFlotante>
    </div>
  );
}