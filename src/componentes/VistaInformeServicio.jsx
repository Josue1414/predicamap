// src/componentes/VistaInformeServicio.jsx
import React from 'react';
import { X, Save, FileSpreadsheet, FileText, Trash2, Edit2, AlertTriangle, ArrowUp, ArrowDown, Clock } from 'lucide-react';
import { useInformes } from '../hooks/useInformes';

export default function VistaInformeServicio({ alCerrar }) {
  const {
    informes, tituloMes, formularioRef, alertaEliminar, alertaHoras, horasTemporales,
    editandoId, nombre, tipo, metaAuxiliar, metaRegular, metaManual, participo,
    horas, tieneEstudios, cantidadEstudios,
    setAlertaEliminar, setAlertaHoras, setHorasTemporales, setNombre, setTipo,
    setMetaAuxiliar, setMetaRegular, setMetaManual, setParticipo, setHoras,
    setTieneEstudios, setCantidadEstudios,
    manejarCambioTitulo, validarNumero, bloquearTeclasInvalidas, limpiarFormulario,
    manejarGuardar, cargarParaEditar, confirmarEliminarDefinitivo, moverArriba,
    moverAbajo, exportarExcel, exportarPDF
  } = useInformes();

  // Clases CSS puras para los Metales y Colores Estilizados
  const claseOro = 'efecto-metalico bg-gradient-to-b from-[#e4c580] via-[#fff4cc] to-[#c2963e] text-[#4a3600] border border-[#a87b22] font-bold tracking-wide rounded-sm';
  const clasePlata = 'efecto-metalico bg-gradient-to-b from-[#c0c5cb] via-[#fdfdfd] to-[#949a9f] text-[#1e293b] border border-[#7a828a] font-bold tracking-wide rounded-sm';

  const obtenerColorTipo = (tipo) => {
    if (tipo === 'Precursor Regular') return claseOro;
    if (tipo === 'Precursor Auxiliar') return clasePlata;
    return 'bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-700 font-bold rounded-sm';
  };

  const obtenerColorHoras = () => 'bg-purple-50 text-purple-700 border border-purple-300 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-700/50 font-bold rounded-sm';
  const obtenerColorEstudios = () => 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-700/50 font-bold rounded-sm';
  const obtenerColorMeta = () => 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/50 font-bold rounded-sm';

  return (
    <div className="fixed inset-0 z-[5000] flex flex-col bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-300">
      
      {/* Alerta Personalizada: Confirmar Eliminar */}
      {alertaEliminar && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl max-w-sm w-full shadow-2xl border border-rose-200 dark:border-rose-900/50 animate-in zoom-in-95">
            <div className="flex items-center gap-3 mb-3 text-rose-600 dark:text-rose-500">
              <AlertTriangle size={24} />
              <h4 className="text-lg font-black uppercase tracking-wider">Eliminar registro</h4>
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-6">
              ¿Estás seguro de que deseas eliminar permanentemente a <span className="font-bold text-slate-800 dark:text-slate-200">{nombre}</span>? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setAlertaEliminar(null)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors">
                Cancelar
              </button>
              <button onClick={confirmarEliminarDefinitivo} className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-600/30 transition-colors">
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alerta Personalizada: Horas en Cero */}
      {alertaHoras && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl max-w-sm w-full shadow-2xl border border-amber-200 dark:border-amber-900/50 animate-in zoom-in-95">
            <div className="flex items-center gap-3 mb-3 text-amber-500">
              <Clock size={24} />
              <h4 className="text-lg font-black uppercase tracking-wider">¿Faltan horas?</h4>
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-4">
              ¿El publicador no informará horas? Si se te olvidó poner ese dato, puedes ponerlo aquí:
            </p>
            <input 
              type="number" 
              min="0"
              onKeyDown={bloquearTeclasInvalidas}
              value={horasTemporales} 
              onChange={e => setHorasTemporales(validarNumero(e.target.value))} 
              placeholder="Escribe las horas..." 
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-xl font-black text-center text-indigo-600 dark:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-6"
            />
            <div className="flex gap-3">
              <button onClick={() => setAlertaHoras(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors">
                Cancelar
              </button>
              <button 
                onClick={() => { setHoras(horasTemporales); manejarGuardar(true, horasTemporales); }} 
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-colors"
              >
                Sí, seguir con {horasTemporales || '0'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Cabecera Cristal */}
      <div className="relative z-20 bg-indigo-600/90 dark:bg-indigo-900/90 backdrop-blur-xl px-5 py-4 border-b border-indigo-500/30 shadow-md flex items-center justify-between shrink-0">
        <h2 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2 drop-shadow-sm">
          <FileText size={18} /> Control de Informes
        </h2>
        <button onClick={alCerrar} className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-lg text-white backdrop-blur-md active:scale-95 transition-all border border-white/20">
          <X size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* Aviso de Privacidad */}
      <div className="bg-amber-100/80 dark:bg-amber-900/50 backdrop-blur-md border-b border-amber-200/50 dark:border-amber-800/50 px-5 py-3 flex items-center justify-center gap-3 shrink-0">
        <AlertTriangle size={18} className="text-amber-700 dark:text-amber-400" />
        <span className="text-[11px] sm:text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-widest text-center">
          Privacidad local: Esta información solo vive en tu dispositivo.
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:flex lg:gap-8 lg:justify-center">
        
        {/* Formulario Estilizado Glassmorphism */}
        <div ref={formularioRef} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md mb-6 lg:mb-0 lg:w-1/3 h-max relative overflow-hidden">
          
          <div className="relative z-10">
            {editandoId ? (
              <h3 className="font-serif italic text-indigo-600 dark:text-indigo-400 mb-6 text-3xl font-black tracking-wide border-b border-indigo-100 dark:border-indigo-900/50 pb-3">
                Modo Edición
              </h3>
            ) : (
              <h3 className="font-black text-slate-800 dark:text-slate-100 mb-6 uppercase tracking-widest text-sm">
                Añadir Informe
              </h3>
            )}
            
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Nombre del Publicador</label>
                <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej. Juan Pérez" className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md p-3 text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors shadow-sm" />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Privilegio de Servicio</label>
                <div className="flex flex-wrap gap-2">
                  {['Publicador', 'Precursor Auxiliar', 'Precursor Regular'].map(t => {
                    const seleccionado = tipo === t;
                    let clasesBtn = 'px-4 py-2.5 text-xs transition-all border shadow-sm ';
                    
                    if (seleccionado) {
                      if (t === 'Precursor Regular') clasesBtn += claseOro;
                      else if (t === 'Precursor Auxiliar') clasesBtn += clasePlata;
                      else clasesBtn += 'bg-indigo-600 border-indigo-600 text-white font-bold rounded-sm';
                    } else {
                      clasesBtn += 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-indigo-300 font-bold rounded-sm';
                    }

                    return (
                      <button key={t} onClick={() => setTipo(t)} className={clasesBtn}>
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {tipo === 'Precursor Auxiliar' && (
                <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2">Meta de Horas</label>
                  <div className="flex gap-2">
                    {['15', '30', 'Manual'].map(m => (
                      <button key={m} onClick={() => setMetaAuxiliar(m)} className={`flex-1 py-2 rounded-md text-xs font-bold transition-all border shadow-sm ${metaAuxiliar === m ? 'bg-slate-700 border-slate-700 text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                  {metaAuxiliar === 'Manual' && (
                    <input type="number" min="0" onKeyDown={bloquearTeclasInvalidas} value={metaManual} onChange={e => setMetaManual(validarNumero(e.target.value))} placeholder="Escribe la meta..." className="mt-3 w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md p-3 text-sm font-bold text-slate-800 dark:text-slate-100 outline-none shadow-sm" />
                  )}
                </div>
              )}

              {tipo === 'Precursor Regular' && (
                <div className="bg-yellow-50/50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-200/50 dark:border-yellow-800/30">
                  <label className="block text-[10px] font-bold text-yellow-700 dark:text-yellow-500 uppercase tracking-widest mb-2">Meta de Horas</label>
                  <div className="flex gap-2">
                    {['50', 'Manual'].map(m => (
                      <button key={m} onClick={() => setMetaRegular(m)} className={`flex-1 py-2 rounded-md text-xs font-bold transition-all border shadow-sm ${metaRegular === m ? 'bg-yellow-600 border-yellow-600 text-white' : 'bg-white dark:bg-slate-900 border-yellow-200 dark:border-yellow-800/50 text-yellow-700 dark:text-yellow-600'}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                  {metaRegular === 'Manual' && (
                    <input type="number" min="0" onKeyDown={bloquearTeclasInvalidas} value={metaManual} onChange={e => setMetaManual(validarNumero(e.target.value))} placeholder="Escribe la meta..." className="mt-3 w-full bg-white dark:bg-slate-950 border border-yellow-300 dark:border-yellow-700 rounded-md p-3 text-sm font-bold text-slate-800 dark:text-slate-100 outline-none shadow-sm" />
                  )}
                </div>
              )}

              {tipo === 'Publicador' ? (
                <div className="flex items-center gap-3 bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <input type="checkbox" id="chkParticipo" checked={participo} onChange={e => setParticipo(e.target.checked)} className="w-5 h-5 accent-indigo-600 rounded" />
                  <label htmlFor="chkParticipo" className="text-sm font-bold text-slate-700 dark:text-slate-300 select-none cursor-pointer">Participó en el ministerio</label>
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-bold text-purple-500 dark:text-purple-400 uppercase tracking-widest mb-1.5">Horas realizadas</label>
                  <input type="number" min="0" onKeyDown={bloquearTeclasInvalidas} value={horas} onChange={e => setHoras(validarNumero(e.target.value))} placeholder="Ej. 50" className="w-full bg-white dark:bg-slate-950 border border-purple-300 dark:border-purple-800/50 rounded-md p-3.5 text-lg font-black text-purple-600 dark:text-purple-400 focus:outline-none focus:border-purple-500 transition-all shadow-sm" />
                </div>
              )}

              <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-200/50 dark:border-emerald-800/30">
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="chkEstudios" checked={tieneEstudios} onChange={e => setTieneEstudios(e.target.checked)} className="w-5 h-5 accent-emerald-600 rounded" />
                  <label htmlFor="chkEstudios" className="text-sm font-bold text-emerald-800 dark:text-emerald-400 select-none cursor-pointer">Condujo Estudios Bíblicos</label>
                </div>
                {tieneEstudios && (
                  <input type="number" min="0" onKeyDown={bloquearTeclasInvalidas} value={cantidadEstudios} onChange={e => setCantidadEstudios(validarNumero(e.target.value))} placeholder="Cantidad de estudios" className="mt-4 w-full bg-white dark:bg-slate-950 border border-emerald-300 dark:border-emerald-700 rounded-md p-3 text-sm font-bold text-emerald-700 dark:text-emerald-400 outline-none shadow-sm focus:border-emerald-500" />
                )}
              </div>

              <div className="flex gap-3 pt-3">
                <button onClick={() => manejarGuardar(false)} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold uppercase tracking-widest text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md active:translate-y-0.5 transition-all">
                  <Save size={18} /> {editandoId ? 'Actualizar' : 'Guardar'}
                </button>
                {editandoId && (
                  <button onClick={limpiarFormulario} className="px-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl active:scale-95 transition-all shadow-sm">
                    Cancelar
                  </button>
                )}
              </div>

              {editandoId && (
                <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-start">
                  <button 
                    onClick={() => setAlertaEliminar(editandoId)} 
                    className="text-[10px] font-bold text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                  >
                    <Trash2 size={14} /> Eliminar definitivamente
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lista y Exportación */}
        <div className="lg:w-2/3 flex flex-col z-10">
          <div className="mb-5 shrink-0">
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Título del Mes / Congregación</label>
            <input 
              type="text" 
              value={tituloMes} 
              onChange={manejarCambioTitulo} 
              placeholder="Ej. Informe de Agosto 2026" 
              className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-base font-black text-indigo-700 dark:text-indigo-400 focus:outline-none focus:border-indigo-500 transition-colors shadow-sm" 
            />
          </div>

          <div className="flex gap-3 mb-5 shrink-0">
            <button onClick={exportarExcel} disabled={informes.length === 0} className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs uppercase tracking-widest font-bold py-3.5 rounded-xl shadow-md active:translate-y-0.5 disabled:opacity-50 transition-all border border-emerald-500">
              <FileSpreadsheet size={18} /> Excel
            </button>
            <button onClick={exportarPDF} disabled={informes.length === 0} className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white text-xs uppercase tracking-widest font-bold py-3.5 rounded-xl shadow-md active:translate-y-0.5 disabled:opacity-50 transition-all border border-rose-500">
              <FileText size={18} /> PDF
            </button>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md flex-1 overflow-hidden flex flex-col">
            
            <h3 className="font-black text-slate-800 dark:text-slate-100 mb-4 uppercase tracking-widest text-sm drop-shadow-sm">
              Registros Listos ({informes.length})
            </h3>
            
            <div className="flex-1 overflow-y-auto scroll-limpio pr-2 space-y-3">
              {informes.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400/80 text-sm font-bold uppercase tracking-widest">No hay registros aún.</div>
              ) : (
                informes.map((inf, index) => (
                  <div key={inf.id} className="flex items-stretch bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                    
                    {/* Botones de Reordenamiento alineados a la izquierda */}
                    <div className="flex flex-col bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0">
                      <button onClick={() => moverArriba(index)} disabled={index === 0} className="flex-1 px-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 disabled:opacity-20 transition-colors">
                        <ArrowUp size={16} strokeWidth={2.5} />
                      </button>
                      <div className="h-[1px] bg-slate-200 dark:bg-slate-800 w-full"></div>
                      <button onClick={() => moverAbajo(index)} disabled={index === informes.length - 1} className="flex-1 px-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 disabled:opacity-20 transition-colors">
                        <ArrowDown size={16} strokeWidth={2.5} />
                      </button>
                    </div>

                    <div className="flex-1 p-4 flex justify-between items-center">
                      <div className="flex-1">
                        <div className="font-black text-slate-800 dark:text-slate-100 text-base mb-2.5">{inf.nombre}</div>
                        <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-widest">
                          
                          {/* Tipo de Publicador */}
                          <span className={`px-2.5 py-1 ${obtenerColorTipo(inf.tipo)}`}>
                            {inf.tipo}
                          </span>
                          
                          {/* Meta Auxiliar / Regular */}
                          {(inf.tipo === 'Precursor Auxiliar' || inf.tipo === 'Precursor Regular') && (
                            <span className={`px-2.5 py-1 ${obtenerColorMeta()}`}>
                              Meta: {inf.meta}h
                            </span>
                          )}
                          
                          {/* Horas */}
                          {inf.tipo !== 'Publicador' && (
                            <span className={`px-2.5 py-1 ${obtenerColorHoras()}`}>
                              Horas: {inf.horas}
                            </span>
                          )}
                          
                          {/* Check Participó */}
                          {inf.tipo === 'Publicador' && (
                            <span className={`px-2.5 py-1 rounded-sm shadow-sm border ${inf.participo ? 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/40 dark:text-teal-300 dark:border-teal-700/50' : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'}`}>
                              {inf.participo ? 'Participó' : 'No participó'}
                            </span>
                          )}
                          
                          {/* Estudios */}
                          {inf.estudios > 0 && (
                            <span className={`px-2.5 py-1 ${obtenerColorEstudios()}`}>
                              Estudios: {inf.estudios}
                            </span>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => cargarParaEditar(inf)} 
                        className="ml-4 p-3 bg-slate-50 text-slate-500 border border-slate-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-indigo-600 rounded-xl transition-all shadow-sm active:scale-95"
                        title="Editar registro"
                      >
                        <Edit2 size={20} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* ESTILOS CSS INYECTADOS PARA LA ANIMACIÓN METÁLICA DESLIZANTE */}
      <style>{`
        @keyframes shimmer-slide {
          0% { transform: translateX(-150%) skewX(-25deg); }
          100% { transform: translateX(200%) skewX(-25deg); }
        }
        .efecto-metalico {
          position: relative;
          overflow: hidden;
          background-size: 100% 100%;
        }
        .efecto-metalico::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 30%;
          height: 100%;
          background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%);
          animation: shimmer-slide 2.5s infinite;
          pointer-events: none;
        }
      `}</style>

    </div>
  );
}