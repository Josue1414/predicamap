// src/componentes/menu-lateral/SeccionHistorial.jsx
import React, { useEffect, useRef } from 'react';
import { History, ChevronUp, ChevronDown, Activity, User, Info, ChevronLeft, ChevronRight } from 'lucide-react';

export default function SeccionHistorial({
  visible,
  acordeonActivo,
  alternarAcordeon,
  logs = [],
  cargandoLogs,
  recargarLogs,
  // ★ Recibimos las nuevas propiedades de paginación ★
  pagina = 1,
  totalPaginas = 1,
  alCambiarPagina
}) {
  if (!visible) return null;

  const abierto = acordeonActivo === 'historial';
  
  // ★ REFERENCIA PARA CONTROLAR EL SCROLL DE LA LISTA ★
  const contenedorListaRef = useRef(null);

  useEffect(() => {
    if (abierto && recargarLogs) {
      recargarLogs(1); // Carga la página 1 al desplegar el acordeón
    }
  }, [abierto, recargarLogs]);

  const manejarCambioPagina = (nuevaPag) => {
    if (alCambiarPagina && nuevaPag >= 1 && nuevaPag <= totalPaginas) {
      alCambiarPagina(nuevaPag);
      // Hacer scroll suave hacia arriba al cambiar de página
      if (contenedorListaRef.current) {
        contenedorListaRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const formatearHora = (fechaIso) => {
    const fecha = new Date(fechaIso);
    return fecha.toLocaleString('es-MX', { hour: '2-digit', minute: '2-digit' });
  };

  const obtenerIconoAccion = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case 'territorio': return <span className="text-emerald-500 text-sm">🗺️</span>;
      case 'casa': return <span className="text-orange-500 text-sm">🏠</span>;
      case 'tachuela': return <span className="text-cyan-500 text-sm">📌</span>;
      case 'sistema': return <span className="text-purple-500 text-sm">⚙️</span>;
      default: return <Activity size={14} className="text-indigo-500" />;
    }
  };

  const agruparLogs = (logsLista) => {
    const grupos = [];
    let grupoActual = null;

    logsLista.forEach(log => {
      const fecha = new Date(log.creado_en);
      const hoy = new Date();
      
      const startOfHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
      const startOfFecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
      
      const diffDias = (startOfHoy - startOfFecha) / (1000 * 60 * 60 * 24);

      let nombreGrupo = '';
      if (diffDias === 0) nombreGrupo = 'Hoy';
      else if (diffDias === 1) nombreGrupo = 'Ayer';
      else if (diffDias <= 7) nombreGrupo = 'Esta semana';
      else if (fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear()) nombreGrupo = 'Este mes';
      else {
        let mesPasado = hoy.getMonth() - 1;
        let anioPasado = hoy.getFullYear();
        if (mesPasado < 0) { mesPasado = 11; anioPasado--; }
        if (fecha.getMonth() === mesPasado && fecha.getFullYear() === anioPasado) nombreGrupo = 'Mes pasado';
        else nombreGrupo = 'Meses anteriores';
      }

      if (!grupoActual || grupoActual.nombre !== nombreGrupo) {
        grupoActual = { nombre: nombreGrupo, items: [] };
        grupos.push(grupoActual);
      }
      grupoActual.items.push(log);
    });
    return grupos;
  };

  const logsAgrupados = agruparLogs(logs);

  return (
    <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-2 shadow-sm flex flex-col">
      <button onClick={() => alternarAcordeon('historial')} className="w-full p-3 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 z-40 relative">
        <span className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <History size={16} className="text-indigo-500"/> Historial de Actividad
        </span>
        {abierto ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      
      {abierto && (
        <>
          {/* Anuncio estático fuera del scroll */}
          <div className="bg-amber-50/95 dark:bg-amber-950/95 backdrop-blur-md px-3 py-2 border-b border-amber-100 dark:border-amber-900 flex items-center gap-2 shrink-0 z-30">
            <Info size={14} className="text-amber-500 shrink-0" />
            <p className="text-[9px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
              El historial muestra un máximo de dos meses.
            </p>
          </div>

          {/* ★ LISTA CON SCROLL REF ★ */}
          <div ref={contenedorListaRef} className="p-4 pt-2 max-h-72 overflow-y-auto scroll-limpio relative">
            {cargandoLogs ? (
              <p className="text-xs text-slate-400 text-center py-4 animate-pulse font-bold">Cargando registros...</p>
            ) : logs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4 font-bold">Aún no hay actividad registrada.</p>
            ) : (
              <div className="space-y-6">
                {logsAgrupados.map((grupo, gIdx) => (
                  <div key={gIdx} className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest sticky top-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md py-1 z-20 shadow-sm rounded-lg px-2 border border-slate-100 dark:border-slate-800 w-max">
                      {grupo.nombre}
                    </h4>
                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent">
                      {grupo.items.map((log) => (
                        <div key={log.id} className="relative flex items-start gap-3 animate-slide-up">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 z-10 shrink-0 shadow-sm">
                            {obtenerIconoAccion(log.entidad_tipo)}
                          </div>
                          <div className="flex-1 bg-slate-50 dark:bg-slate-900/40 rounded-xl p-3 border border-slate-100 dark:border-slate-800 shadow-sm">
                            <div className="flex justify-between items-start mb-1.5">
                              <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide">{log.accion}</span>
                              <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap ml-2 shrink-0">
                                {formatearHora(log.creado_en)}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mb-2 font-medium">
                              {log.detalles}
                            </p>
                            <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-800/60">
                              <User size={10} className="text-slate-400" />
                              <span className="text-[9px] text-slate-500 font-bold truncate">
                                {log.perfiles?.nombre || 'Desconocido'} <span className="text-indigo-400 opacity-70">({log.perfiles?.rol || 'N/A'})</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ★ CONTROLES DE PAGINACIÓN FIJOS ABAJO ★ */}
          {!cargandoLogs && logs.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 p-2 flex items-center justify-between shrink-0 z-30">
              <button 
                onClick={() => manejarCambioPagina(pagina - 1)}
                disabled={pagina === 1}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Pág <span className="text-indigo-500">{pagina}</span> de {totalPaginas}
              </div>
              
              <button 
                onClick={() => manejarCambioPagina(pagina + 1)}
                disabled={pagina === totalPaginas}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}