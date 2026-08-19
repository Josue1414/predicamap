// src/componentes/menu-lateral/SeccionRegistroS13.jsx
import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, ChevronRight, Calendar, FileText, Eye, Edit, Save, PlusCircle, Trash2 } from 'lucide-react';
import VentanaFlotante from '../VentanaFlotante';
import useGestorS13 from '../../hooks/modulos/useGestorS13';
import { useAlertas } from '../../context/ContextoAlertas'; 

export default function SeccionRegistroS13({ 
  acordeonActivo, 
  alternarAcordeon, 
  congregacionId,
  territoriosGuardados
}) {
  const { generarExcelS13, generarPDFS13, obtenerDatosEstructurados, formatearFecha, guardarHistorialManualBD, limpiarHistorialManualBD, cargando } = useGestorS13(congregacionId);
  const { mostrarConfirmacion, mostrarAlerta } = useAlertas();

  const hoy = new Date();
  const añoServicioActual = hoy.getMonth() >= 8 ? hoy.getFullYear() + 1 : hoy.getFullYear();
  
  const [fechaInicio, setFechaInicio] = useState(`${añoServicioActual - 1}-09-01`);
  const [fechaFin, setFechaFin] = useState(`${añoServicioActual}-08-31`);
  const [datosVista, setDatosVista] = useState([]);
  const [modoOrigen, setModoOrigen] = useState('manual'); 
  const [datosGuardados, setDatosGuardados] = useState(false);
  const [tituloManual, setTituloManual] = useState('');

  const estaAbierta = acordeonActivo === 's13';

  useEffect(() => {
    if (estaAbierta) cargarDatos();
  }, [estaAbierta, fechaInicio, fechaFin, territoriosGuardados, modoOrigen]);

  const cargarDatos = async () => {
    const { filasEstructuradas, tituloManual: tituloDB } = await obtenerDatosEstructurados(fechaInicio, fechaFin, territoriosGuardados, modoOrigen);
    setDatosVista(filasEstructuradas);
    if (modoOrigen === 'manual') setTituloManual(tituloDB || '');
  };

  const manejarCambioManual = (rowIndex, campoAsig, subcampo, valor) => {
    const nuevosDatos = [...datosVista];
    if (campoAsig === 'general' && subcampo === 'ultimaFecha') {
      nuevosDatos[rowIndex].ultimaFecha = valor;
    } else {
      if (!nuevosDatos[rowIndex][campoAsig]) {
        nuevosDatos[rowIndex][campoAsig] = { asignado_a: '', fecha_asignacion: '', fecha_completado: '', seccion_id: nuevosDatos[rowIndex].seccion_id };
      }
      nuevosDatos[rowIndex][campoAsig][subcampo] = valor;
    }
    setDatosVista(nuevosDatos);
    setDatosGuardados(false);
  };

  const agregarFilaManual = (seccionId) => {
    const nuevosDatos = [...datosVista];
    let lastIndex = -1;
    nuevosDatos.forEach((row, idx) => {
      if (row.seccion_id === seccionId) lastIndex = idx;
    });

    const nuevaFila = {
      num: '', 
      seccion_id: seccionId,
      ultimaFecha: '',
      asig1: null, asig2: null, asig3: null, asig4: null
    };

    if (lastIndex !== -1) {
      nuevosDatos.splice(lastIndex + 1, 0, nuevaFila);
    } else {
      nuevosDatos.push(nuevaFila);
    }
    setDatosVista(nuevosDatos);
    setDatosGuardados(false);
  };

  const guardarManual = async () => {
    const registrosNuevos = [];
    datosVista.forEach(row => {
      let tieneAsignaciones = false;

      [row.asig1, row.asig2, row.asig3, row.asig4].forEach((asig, index) => {
        if (asig && (asig.asignado_a || asig.fecha_asignacion || asig.fecha_completado)) {
          registrosNuevos.push({
            seccion_id: row.seccion_id,
            asignado_a: asig.asignado_a || '',
            fecha_asignacion: asig.fecha_asignacion || null,
            fecha_completado: asig.fecha_completado || null,
            ultima_fecha_completado: index === 0 ? (row.ultimaFecha || null) : null
          });
          tieneAsignaciones = true;
        }
      });

      // Si no hay asignaciones pero el usuario puso una última fecha, la guardamos
      if (!tieneAsignaciones && row.ultimaFecha) {
        registrosNuevos.push({
          seccion_id: row.seccion_id,
          asignado_a: '',
          fecha_asignacion: null,
          fecha_completado: null,
          ultima_fecha_completado: row.ultimaFecha || null
        });
      }
    });

    const exito = await guardarHistorialManualBD(registrosNuevos, tituloManual);
    if (exito) setDatosGuardados(true);
  };

  const manejarLimpiarManual = async () => {
    const confirmado = await mostrarConfirmacion(
      "¿Borrar todo el registro manual?",
      "Esta acción eliminará de forma permanente todos los datos de esta tabla para que puedas comenzar un nuevo año. Te sugerimos descargar el PDF o Excel antes de continuar.",
      "danger",
      "Sí, borrar todo"
    );

    if (confirmado) {
      const exito = await limpiarHistorialManualBD();
      if (exito) {
        setTituloManual('');
        cargarDatos();
        mostrarAlerta("Éxito", "El registro manual ha sido limpiado.", "success");
      }
    }
  };

  return (
    <div className="mb-2">
      <button 
        onClick={() => alternarAcordeon('s13')} 
        className="w-full p-3 flex justify-between items-center rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 shadow-sm transition-colors"
      >
        <span className="font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <FileSpreadsheet size={16} className="text-emerald-500"/> Registro S-13
        </span>
        <ChevronRight size={16} className="text-slate-400" />
      </button>

      <VentanaFlotante abierta={estaAbierta} alCerrar={() => alternarAcordeon('s13')} titulo="Registro S-13" icono={FileSpreadsheet}>
        <div className="p-4 flex flex-col h-full">
          
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 mb-4 shrink-0">
            <button 
              onClick={() => setModoOrigen('manual')} 
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-md transition-all ${modoOrigen === 'manual' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <Edit size={14} /> Llenado Manual
            </button>
            <button 
              onClick={() => setModoOrigen('automatico')} 
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-md transition-all ${modoOrigen === 'automatico' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <Eye size={14} /> Historial Automático
            </button>
          </div>

          {modoOrigen === 'automatico' ? (
            <div className="grid grid-cols-2 gap-3 mb-4 shrink-0">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-1.5"><Calendar size={12}/> Desde</label>
                <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="w-full p-2 text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-1.5"><Calendar size={12}/> Hasta</label>
                <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="w-full p-2 text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300" />
              </div>
            </div>
          ) : (
            <div className="mb-4 shrink-0">
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-1.5">Título del Reporte</label>
              <input 
                type="text" 
                placeholder="Ej. Año de Servicio 2026" 
                value={tituloManual} 
                onChange={(e) => { setTituloManual(e.target.value); setDatosGuardados(false); }} 
                className="w-full p-2 text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-emerald-500/50" 
              />
            </div>
          )}

          {modoOrigen === 'manual' && (
            <div className="flex gap-2 mb-4 shrink-0">
              <button onClick={guardarManual} disabled={cargando} className={`flex-1 flex items-center justify-center gap-2 text-white text-xs font-bold py-2.5 rounded-lg transition-all active:scale-95 ${datosGuardados ? 'bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}>
                <Save size={16} /> {cargando ? 'Guardando...' : datosGuardados ? '¡Guardado!' : 'Guardar Cambios'}
              </button>
              <button onClick={manejarLimpiarManual} disabled={cargando} className="flex items-center justify-center gap-2 bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-bold py-2.5 px-4 rounded-lg transition-all active:scale-95" title="Borrar todo para empezar de nuevo">
                <Trash2 size={16} />
              </button>
            </div>
          )}

          <div className="flex gap-2 mb-4 shrink-0">
            <button onClick={() => generarExcelS13(fechaInicio, fechaFin, territoriosGuardados, modoOrigen)} disabled={cargando} className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 rounded-lg transition-all active:scale-95 disabled:opacity-50">
              <FileSpreadsheet size={14} /> Excel
            </button>
            <button onClick={() => generarPDFS13(fechaInicio, fechaFin, territoriosGuardados, modoOrigen)} disabled={cargando} className="flex-1 flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-2.5 rounded-lg transition-all active:scale-95 disabled:opacity-50">
              <FileText size={14} /> PDF
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
            <div className="flex-1 overflow-auto scroll-limpio p-2">
              <table className="w-max min-w-full text-[10px] text-center border-collapse border border-slate-400 dark:border-slate-600">
                <thead className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 sticky top-0 z-10">
                  <tr>
                    <th rowSpan={2} className="border border-slate-400 dark:border-slate-600 p-1 w-12">Núm.<br/>de terr.</th>
                    <th rowSpan={2} className="border border-slate-400 dark:border-slate-600 p-1 w-20">Última fecha<br/>completó*</th>
                    <th colSpan={2} className="border border-slate-400 dark:border-slate-600 p-1">Asignado a</th>
                    <th colSpan={2} className="border border-slate-400 dark:border-slate-600 p-1">Asignado a</th>
                    <th colSpan={2} className="border border-slate-400 dark:border-slate-600 p-1">Asignado a</th>
                    <th colSpan={2} className="border border-slate-400 dark:border-slate-600 p-1">Asignado a</th>
                  </tr>
                  <tr>
                    {[1,2,3,4].map(i => (
                      <React.Fragment key={i}>
                        <th className="border border-slate-400 dark:border-slate-600 p-1 font-normal">F. asignó</th>
                        <th className="border border-slate-400 dark:border-slate-600 p-1 font-normal">F. completó</th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-slate-800 dark:text-slate-300">
                  {datosVista.map((row, i) => (
                    <React.Fragment key={i}>
                      <tr className="border-t-2 border-slate-500 dark:border-slate-500">
                        <td rowSpan={2} className="border border-slate-400 dark:border-slate-600 font-bold text-rose-600 dark:text-rose-400 align-middle">
                          {row.num}
                          {modoOrigen === 'manual' && row.num && (
                            <button onClick={() => agregarFilaManual(row.seccion_id)} className="block mx-auto mt-1 text-indigo-500 hover:text-indigo-600" title="Añadir fila">
                              <PlusCircle size={14}/>
                            </button>
                          )}
                        </td>
                        
                        {/* CELDA EDITABLE PARA ÚLTIMA FECHA EN MODO MANUAL */}
                        <td rowSpan={2} className="border border-slate-400 dark:border-slate-600 align-middle p-0">
                          {modoOrigen === 'manual' ? (
                            <input 
                              type="date" 
                              value={row.ultimaFecha || ''} 
                              onChange={(e) => manejarCambioManual(i, 'general', 'ultimaFecha', e.target.value)} 
                              className="w-full h-full text-center bg-transparent outline-none text-[9px] focus:bg-indigo-50 dark:focus:bg-indigo-900/30" 
                            />
                          ) : (
                            <span className="p-1 block">{formatearFecha(row.ultimaFecha)}</span>
                          )}
                        </td>

                        {['asig1','asig2','asig3','asig4'].map(asigKey => (
                          <td colSpan={2} key={asigKey} className="border border-slate-400 dark:border-slate-600 p-0 h-6">
                            {modoOrigen === 'manual' ? (
                              <input type="text" value={row[asigKey]?.asignado_a || ''} onChange={(e) => manejarCambioManual(i, asigKey, 'asignado_a', e.target.value)} className="w-full h-full text-center bg-transparent outline-none focus:bg-indigo-50 dark:focus:bg-indigo-900/30" />
                            ) : (
                              row[asigKey]?.asignado_a || ''
                            )}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        {['asig1','asig2','asig3','asig4'].map(asigKey => (
                          <React.Fragment key={`${asigKey}-dates`}>
                            <td className="border border-slate-400 dark:border-slate-600 p-0 h-6">
                              {modoOrigen === 'manual' ? (
                                <input type="date" value={row[asigKey]?.fecha_asignacion || ''} onChange={(e) => manejarCambioManual(i, asigKey, 'fecha_asignacion', e.target.value)} className="w-full h-full text-center bg-transparent outline-none text-[9px] focus:bg-indigo-50 dark:focus:bg-indigo-900/30" />
                              ) : (
                                formatearFecha(row[asigKey]?.fecha_asignacion)
                              )}
                            </td>
                            <td className="border border-slate-400 dark:border-slate-600 p-0 h-6">
                              {modoOrigen === 'manual' ? (
                                <input type="date" value={row[asigKey]?.fecha_completado || ''} onChange={(e) => manejarCambioManual(i, asigKey, 'fecha_completado', e.target.value)} className="w-full h-full text-center bg-transparent outline-none text-[9px] focus:bg-indigo-50 dark:focus:bg-indigo-900/30" />
                              ) : (
                                formatearFecha(row[asigKey]?.fecha_completado)
                              )}
                            </td>
                          </React.Fragment>
                        ))}
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </VentanaFlotante>
    </div>
  );
}