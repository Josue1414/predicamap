// src/componentes/MenuTerritorio.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../utilidades/clienteSupabase';
import { X, CheckCircle2, RefreshCcw, Save, Map, CalendarCheck, History, ChevronDown } from 'lucide-react';

export default function MenuTerritorio({
  territorio,
  edificios,
  perfilUsuario,
  alCerrar,
  alCompletar,
  alReiniciar,
  alGuardarNotas
}) {
  const [notasTemp, setNotasTemp] = useState('');
  
  // ★ NUEVOS ESTADOS PARA EL HISTORIAL
  const [fechasCompletado, setFechasCompletado] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(true);
  
  // ★ ESTADO PARA EL ACORDEÓN DEL HISTORIAL
  const [historialAbierto, setHistorialAbierto] = useState(false);

  useEffect(() => {
    if (territorio) setNotasTemp(territorio.notas || '');
  }, [territorio]);

  // ★ EFECTO PARA CARGAR EL HISTORIAL DEL TERRITORIO
  useEffect(() => {
    if (!territorio) return;

    const cargarHistorial = async () => {
      setCargandoHistorial(true);
      
      // Buscamos en la base de datos los logs donde la acción sea "Territorio Completado"
      // y el detalle incluya el nombre exacto de este territorio.
      const { data } = await supabase
        .from('logs_actividad')
        .select('creado_en')
        .eq('accion', 'Territorio Completado')
        .ilike('detalles', `%${territorio.nombre}%`)
        .order('creado_en', { ascending: false });

      if (data) {
        const fechasUnicas = [];
        const setFechasStr = new Set();

        // Filtramos para obtener días únicos (por si se le dio clic 2 veces el mismo día por error)
        data.forEach(log => {
          const fechaObj = new Date(log.creado_en);
          const fechaLocalStr = fechaObj.toLocaleDateString('es-MX');
          
          if (!setFechasStr.has(fechaLocalStr)) {
            setFechasStr.add(fechaLocalStr);
            fechasUnicas.push(fechaObj);
          }
        });

        setFechasCompletado(fechasUnicas);
      }
      setCargandoHistorial(false);
    };

    cargarHistorial();
  }, [territorio]);

  if (!territorio) return null;

  const casasDeEstaSeccion = edificios.filter(e => e.seccion_id === territorio.id);
  const totalCasas = casasDeEstaSeccion.length;
  const casasCompletadas = casasDeEstaSeccion.filter(e => e.estado === 'completado').length;
  
  let porcentaje = 0;
  if (totalCasas > 0) {
    porcentaje = Math.round((casasCompletadas / totalCasas) * 100);
  } else {
    porcentaje = territorio.estado === 'completado' ? 100 : 0;
  }

  const esCapitanYSuperior = perfilUsuario?.rol === 'Capitán' || perfilUsuario?.rol === 'Administrador' || perfilUsuario?.rol === 'Administrador Mayor';

  const manejarGuardar = () => {
    alGuardarNotas(territorio.id, notasTemp);
    alCerrar();
  };

  // ★ CÁLCULOS DEL HISTORIAL
  const ultimaVez = fechasCompletado[0] || null;
  const penultimaVez = fechasCompletado[1] || null;

  const hace60Dias = new Date();
  hace60Dias.setDate(hace60Dias.getDate() - 60);
  const completados60Dias = fechasCompletado.filter(d => d >= hace60Dias).length;

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Ninguna';
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear().toString().slice(-2);
    return `${dia}/${mes}/${anio}`; // Formato exacto: DD/MM/AA
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[4000] transition-opacity" onClick={alCerrar} />
      
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl z-[4001] animate-slide-up border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="p-6 space-y-5 overflow-y-auto scroll-limpio">
          <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex-1 pr-4">
              <h3 className="font-black text-xl text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Map size={20} className="text-indigo-500 shrink-0" /> <span className="leading-tight">{territorio.nombre}</span>
              </h3>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${porcentaje}%` }}></div>
                </div>
                <span className="text-[10px] font-bold text-slate-500">{porcentaje}%</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">{totalCasas > 0 ? `${casasCompletadas} de ${totalCasas} casas completadas` : 'Territorio sin puntos marcados'}</p>
              
              {porcentaje === 100 && (
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-md border border-emerald-100 dark:border-emerald-800/50">
                  <CalendarCheck size={12} />
                  <span className="text-[9px] font-bold uppercase tracking-wider">
                    Terminado: {ultimaVez 
                      ? ultimaVez.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' }) 
                      : (territorio.actualizado_en ? new Date(territorio.actualizado_en).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recientemente')}
                  </span>
                </div>
              )}
            </div>
            <button onClick={alCerrar} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500 transition-colors flex-shrink-0">
              <X size={18} />
            </button>
          </div>

          {/* ★ SECCIÓN DE HISTORIAL DE COBERTURA EN ACORDEÓN ★ */}
          <div className="bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <button 
              onClick={() => setHistorialAbierto(!historialAbierto)}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <History size={14} className="text-indigo-500" /> Historial de Cobertura
              </h4>
              <ChevronDown size={16} className={`text-slate-400 transition-transform ${historialAbierto ? 'rotate-180' : ''}`} />
            </button>

            {historialAbierto && (
              <div className="p-4 pt-0 animate-slide-up border-t border-slate-100 dark:border-slate-800 mt-2">
                {cargandoHistorial ? (
                  <p className="text-xs text-slate-400 animate-pulse font-medium pt-2">Consultando registros...</p>
                ) : (
                  <div className="flex flex-col gap-3 pt-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm">
                        <p className="text-[9px] text-slate-400 uppercase font-bold mb-0.5">Última vez</p>
                        <p className="text-sm font-black text-slate-700 dark:text-slate-200">{formatearFecha(ultimaVez)}</p>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm">
                        <p className="text-[9px] text-slate-400 uppercase font-bold mb-0.5">Vez anterior</p>
                        <p className="text-sm font-black text-slate-700 dark:text-slate-200">{formatearFecha(penultimaVez)}</p>
                      </div>
                    </div>
                    
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
                      <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                        En los últimos 60 días se ha completado <span className="font-black">{completados60Dias} {completados60Dias === 1 ? 'vez' : 'veces'}</span>.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Notas del Territorio</label>
            <textarea 
              value={notasTemp} 
              onChange={(e) => setNotasTemp(e.target.value)} 
              placeholder="Ej: Zona con perros, iniciar por la calle principal..." 
              rows="3" 
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 resize-none text-slate-800 dark:text-slate-100 transition-colors" 
            />
          </div>

          <div className="grid grid-cols-1 gap-2 pt-2">
            <button 
              disabled={porcentaje === 100} 
              onClick={() => { alCompletar(territorio.id); alCerrar(); }} 
              className="flex justify-center items-center gap-1.5 py-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold text-sm hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-emerald-200 dark:border-emerald-800"
            >
              <CheckCircle2 size={16} /> {porcentaje === 100 ? 'Territorio Terminado' : (totalCasas === 0 ? 'Marcar Completado' : 'Marcar TODO Completado')}
            </button>

            {esCapitanYSuperior && porcentaje > 0 && (
              <button 
                onClick={() => { alReiniciar(territorio.id); alCerrar(); }} 
                className="flex justify-center items-center gap-1.5 py-3 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl font-bold text-sm hover:bg-orange-100 transition-colors border border-orange-200 dark:border-orange-800"
              >
                <RefreshCcw size={16} /> Reiniciar Territorio
              </button>
            )}

            <button onClick={manejarGuardar} className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
              <Save size={18} /> Guardar Notas
            </button>
          </div>
        </div>
      </div>
    </>
  );
}