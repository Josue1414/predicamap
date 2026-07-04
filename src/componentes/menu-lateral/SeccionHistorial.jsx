// src/componentes/menu-lateral/SeccionHistorial.jsx
import React, { useEffect, useRef } from 'react';
import { History, ChevronRight, Activity, User, Info, ChevronLeft } from 'lucide-react';
import VentanaFlotante from '../VentanaFlotante'; // IMPORTAMOS LA VENTANA FLOTANTE

export default function SeccionHistorial({
  visible,
  acordeonActivo,
  alternarAcordeon,
  logs = [],
  cargandoLogs,
  recargarLogs,
  pagina = 1,
  totalPaginas = 1,
  alCambiarPagina
}) {
  if (!visible) return null;

  const abierto = acordeonActivo === 'historial';
  
  // REFERENCIA PARA CONTROLAR EL SCROLL DE LA LISTA
  const contenedorListaRef = useRef(null);

  useEffect(() => {
    if (abierto && recargarLogs) {
      recargarLogs(1); // Carga la página 1 al desplegar
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
    <div className="mb-2">
      {/* BOTÓN DEL MENÚ LATERAL */}
      <button 
        onClick={() => alternarAcordeon('historial')} 
        className="w-full p-3 flex justify-between items-center rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 shadow-sm transition-colors"
      >
        <span className="font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <History size={16} className="text-indigo-500"/> Historial de Actividad
        </span>
        <ChevronRight size={16} className="text-slate-400" />
      </button>
      
      {/* NUEVA VENTANA FLOTANTE */}
      <VentanaFlotante
        abierta={abierto}
        alCerrar={() => alternarAcordeon('historial')}
        titulo="Historial de Actividad"
        icono={History}
      >
        <div className="flex flex-col h-full max-h-[80vh]">
          {/* Anuncio estático fuera del scroll */}
          <div className="bg-amber-50 dark:bg-amber-900/20 px-4 py-3 border-b border-amber-100 dark:border-amber-800/50 flex items-center gap-2 shrink-0 z-30">
            <Info size={16} className="text-amber-500 shrink-0" />
            <p className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wide">
              El historial muestra un máximo de dos meses.
            </p>
          </div>

          {/* LISTA DE REGISTROS CON SCROLL REF */}
          <div ref={contenedorListaRef} className="p-4 flex-1 overflow-y-auto scroll-limpio relative bg-slate-50 dark:bg-slate-950">
            {cargandoLogs ? (
              <div className="flex justify-center items-center py-10">
                <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse font-bold">Cargando registros...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="flex justify-center items-center py-10">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-bold bg-white dark:bg-slate-900 px-6 py-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  Aún no hay actividad registrada.
                </p>
              </div>
            ) : (
              <div className="space-y-6 pb-4">
                {logsAgrupados.map((grupo, gIdx) => (
                  <div key={gIdx} className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest sticky top-0 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md py-2 z-20">
                      {grupo.nombre}
                    </h4>
                    
                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent">
                      {grupo.items.map((log) => (
                        <div key={log.id} className="relative flex items-start gap-4 animate-slide-up">
                          
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 z-10 shrink-0 shadow-sm mt-0.5">
                            {obtenerIconoAccion(log.entidad_tipo)}
                          </div>
                          
                          <div className="flex-1 bg-white dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">{log.accion}</span>
                              <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap ml-2 shrink-0 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                {formatearHora(log.creado_en)}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3 font-medium">
                              {log.detalles}
                            </p>
                            <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                              <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full">
                                <User size={12} className="text-slate-500" />
                              </div>
                              <span className="text-xs text-slate-600 dark:text-slate-400 font-bold truncate">
                                {log.perfiles?.nombre || 'Desconocido'} 
                                <span className="text-indigo-500 dark:text-indigo-400 opacity-80 font-semibold ml-1">({log.perfiles?.rol || 'N/A'})</span>
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

          {/* CONTROLES DE PAGINACIÓN FIJOS ABAJO */}
          {!cargandoLogs && logs.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between shrink-0 z-30">
              <button 
                onClick={() => manejarCambioPagina(pagina - 1)}
                disabled={pagina === 1}
                className="p-2.5 rounded-xl text-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-40 disabled:hover:bg-slate-100 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="text-xs font-black uppercase tracking-widest text-slate-500">
                Pág <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md mx-1">{pagina}</span> de {totalPaginas}
              </div>
              
              <button 
                onClick={() => manejarCambioPagina(pagina + 1)}
                disabled={pagina === totalPaginas}
                className="p-2.5 rounded-xl text-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-40 disabled:hover:bg-slate-100 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <ChevronRight size={20} className="rotate-180" />
              </button>
            </div>
          )}
        </div>
      </VentanaFlotante>
    </div>
  );
}