// src/componentes/menu-lateral/SeccionMiProgreso.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Target, Clock, BookOpen, Award, Sprout, Flower2, Gift, PartyPopper, ChevronDown, ChevronUp, Star, Calendar as CalIcon, AlertCircle, Download, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import useGestorProgreso from '../../hooks/modulos/useGestorProgreso';

const textosMotivacionales = {
  inicio: [
    { cita: "Salmo 34:8", texto: "Prueben y vean que Jehová es bueno; feliz el hombre que se refugia en él." },
    { cita: "Mateo 6:33", texto: "Sigan buscando primero el Reino y la justicia de Dios, y todas estas otras cosas les serán añadidas." }
  ],
  desarrollo: [
    { cita: "Filipenses 4:13", texto: "Para todas las cosas tengo las fuerzas gracias a aquel que me da poder." },
    { cita: "Gálatas 6:9", texto: "Así que no nos rindamos de hacer lo que está bien, porque a su debido tiempo cosecharemos si no nos cansamos." }
  ],
  cierre: [
    { cita: "Isaías 40:29", texto: "Él le da poder al cansado y plena fuerza al que no tiene energías..." },
    { cita: "1 Corintios 15:58", texto: "Manténganse firmes, inamovibles, sabiendo que su labor relacionada con el Señor no es en vano." }
  ],
  logrado: [
    { cita: "Proverbios 10:22", texto: "La bendición de Jehová es la que enriquece, y con ella él no trae ningún dolor." },
    { cita: "Mateo 22:37-39", texto: "Tienes que amar a Jehová tu Dios con todo tu corazón... es la máxima expresión de amor." }
  ]
};

// ★ CORRECCIÓN: Formatear las horas para mostrar "H:MM hrs" ★
const formatearTiempoTexto = (horasDecimales) => {
  if (horasDecimales <= 0) return "0:00 hrs";
  const horas = Math.floor(horasDecimales);
  const minutos = Math.round((horasDecimales - horas) * 60);
  
  return `${horas}:${minutos.toString().padStart(2, '0')} hrs`;
};

export default function SeccionMiProgreso({ perfilUsuario, acordeonActivo, alternarAcordeon }) {
  const {
    metaMensual, metaAnual, registrosDiarios, horasTotalesAño, diasHastaAgosto,
    horasMesActual, estudiosMesActual, horasAcumuladasPrevias,
    modificarHorasHoy, setFraccionMinutosHoy, setEstudiosHoy, actualizarMetas, fechaHoyStr,
    exportarProgreso, importarProgreso
  } = useGestorProgreso();

  const [textoActual, setTextoActual] = useState(textosMotivacionales.inicio[0]);
  const esPrecursor = perfilUsuario?.rol === 'Precursor' || perfilUsuario?.rol === 'Precursor Especial';
  
  const [mesVisual, setMesVisual] = useState(new Date()); 
  const refFileInput = useRef(null);

  const tieneMetaAnual = metaAnual && metaAnual > 0;
  const horasRestantesAnuales = tieneMetaAnual ? Math.max(0, metaAnual - horasTotalesAño) : 0;
  const metaDiariaSugerida = tieneMetaAnual && diasHastaAgosto > 0 ? horasRestantesAnuales / diasHastaAgosto : 0;
  const mesesRestantesDecimal = diasHastaAgosto / 30.416;
  const metaMensualSugerida = tieneMetaAnual && mesesRestantesDecimal > 0 
    ? Math.ceil(metaDiariaSugerida * 30.416) 
    : 0;
  const totalProyectado = Math.round(horasTotalesAño + (metaMensualSugerida * mesesRestantesDecimal));
  const metaMensualUI = tieneMetaAnual ? metaMensualSugerida : (metaMensual || 1);
  const progresoReal = (horasMesActual / metaMensualUI) * 100;
  const progresoPorcentaje = Math.min(progresoReal, 100);

  const horasHoy = registrosDiarios[fechaHoyStr]?.horas || 0;
  const minutosHoyDecimal = horasHoy - Math.floor(horasHoy);

  useEffect(() => {
    let categoria = 'inicio';
    if (progresoReal >= 100) categoria = 'logrado';
    else if (progresoReal >= 75) categoria = 'cierre';
    else if (progresoReal >= 30) categoria = 'desarrollo';

    const opciones = textosMotivacionales[categoria];
    const textoAleatorio = opciones[Math.floor(Math.random() * opciones.length)];
    setTextoActual(textoAleatorio);
  }, [progresoReal]);

  const obtenerDiasDelMesUI = () => {
    const año = mesVisual.getFullYear();
    const mes = mesVisual.getMonth();
    const diasEnMes = new Date(año, mes + 1, 0).getDate();
    const primerDia = new Date(año, mes, 1).getDay(); 
    
    const diasArray = Array(primerDia).fill(null); 
    for (let i = 1; i <= diasEnMes; i++) {
      const fechaStr = `${año}-${String(mes + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      diasArray.push({ dia: i, fechaStr });
    }
    return diasArray;
  };
  const diasCalendario = obtenerDiasDelMesUI();
  const nombreMesVisual = mesVisual.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

  const manejarCambioInput = (e, campo) => {
    const valor = e.target.value;
    actualizarMetas({ [campo]: valor === '' ? '' : Number(valor) });
  };

  const renderizarIcono = () => {
    if (progresoReal > 100) return <PartyPopper size={26} className="text-amber-500 drop-shadow-md animate-bounce" />;
    if (progresoReal === 100) return <Gift size={26} className="text-emerald-500 drop-shadow-sm" />;
    if (progresoReal >= 60) return <Flower2 size={26} className="text-rose-400" />;
    return <Sprout size={26} className="text-emerald-400" />;
  };

  return (
    <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-2">
      <button onClick={() => alternarAcordeon('progreso')} className="w-full p-3 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
        <span className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2"><Star size={16} className="text-yellow-500"/> Mi Progreso Mensual</span>
        {acordeonActivo === 'progreso' ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>

      {acordeonActivo === 'progreso' && (
        <div className="p-3 bg-slate-50/50 dark:bg-slate-950">
          <div className="space-y-5 animate-slide-up">
            
            <div className={`p-4 rounded-2xl border ${esPrecursor ? 'bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-300 dark:from-amber-900/30 dark:to-yellow-700/20 dark:border-amber-600' : 'bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800'}`}>
              <div className="flex items-center gap-4">
                <div className="bg-white/80 dark:bg-black/20 p-2.5 rounded-full shrink-0 shadow-sm">
                  {renderizarIcono()}
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200 italic mb-1.5 leading-tight">"{textoActual.texto}"</p>
                  <p className="text-[10px] font-bold text-slate-500">— {textoActual.cita}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              {esPrecursor && (
                <div className="absolute top-0 right-0 bg-amber-400 text-amber-950 text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl shadow-md flex items-center gap-1"><Award size={12} /> Precursor</div>
              )}

              <div className="flex items-end justify-between mb-2">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400"><Clock size={16} /> <span className="text-xs font-bold">Avance de Horas</span></div>
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {formatearTiempoTexto(horasMesActual)} <span className="text-xs text-slate-400 font-medium">/ {metaMensualUI} hrs</span>
                </div>
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 mb-6 overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className={`h-full transition-all duration-1000 ease-out ${esPrecursor ? 'bg-gradient-to-r from-amber-400 to-yellow-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`} style={{ width: `${progresoPorcentaje}%` }} />
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 mb-3 flex flex-col items-center">
                <div className="flex items-center justify-between w-full mb-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Añadir tiempo hoy</span>
                  <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md">Máx 18h</span>
                </div>
                
                <div className="flex items-center justify-center gap-3 w-full mb-4">
                  <button onClick={() => modificarHorasHoy(-1)} className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-lg flex items-center justify-center hover:bg-slate-300 transition-colors">-1</button>
                  
                  <div className="flex-1 text-center bg-white dark:bg-slate-900 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 leading-none">{formatearTiempoTexto(horasHoy)}</div>
                  </div>
                  
                  <button onClick={() => modificarHorasHoy(1)} className="w-12 h-12 rounded-full bg-indigo-600 text-white font-black text-xl flex items-center justify-center hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-colors active:scale-95">+1</button>
                </div>

                <div className="w-full bg-white dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-700 flex">
                  {[
                    { valor: 0, label: '00m' },
                    { valor: 0.25, label: '15m' },
                    { valor: 0.5, label: '30m' },
                    { valor: 0.75, label: '45m' }
                  ].map((opcion) => {
                    const seleccionado = minutosHoyDecimal === opcion.valor;
                    return (
                      <button
                        key={opcion.label}
                        onClick={() => setFraccionMinutosHoy(opcion.valor)}
                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-colors ${seleccionado ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                      >
                        {opcion.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center w-full">
                <span className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Estudios en el mes</span>
                <div className="flex items-center gap-6 mb-1">
                  <button onClick={() => setEstudiosHoy(estudiosMesActual - 1)} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black flex items-center justify-center hover:bg-slate-300">-</button>
                  <div className="text-2xl font-black text-slate-700 dark:text-slate-200 flex items-center gap-2"><BookOpen size={20} className="text-emerald-500" /> {estudiosMesActual}</div>
                  <button onClick={() => setEstudiosHoy(estudiosMesActual + 1)} className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 font-black flex items-center justify-center hover:bg-emerald-200">+</button>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <CalIcon size={14} className="text-indigo-500" /> Actividad Diaria
                </h4>
                <div className="flex items-center gap-2">
                  <button onClick={() => setMesVisual(new Date(mesVisual.getFullYear(), mesVisual.getMonth() - 1, 1))} className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-500"><ChevronLeft size={14}/></button>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 capitalize min-w-[75px] text-center">{nombreMesVisual}</span>
                  <button onClick={() => setMesVisual(new Date(mesVisual.getFullYear(), mesVisual.getMonth() + 1, 1))} className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-500"><ChevronRight size={14}/></button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {['D','L','M','M','J','V','S'].map((d,i)=><div key={i} className="text-[9px] font-bold text-slate-400">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {diasCalendario.map((obj, index) => {
                  if (!obj) return <div key={index} className="h-9"></div>; 
                  const esHoy = obj.fechaStr === fechaHoyStr;
                  const horasEseDia = registrosDiarios[obj.fechaStr]?.horas || 0;
                  const tieneActividad = horasEseDia > 0;
                  return (
                    <div key={index} className={`h-9 w-full flex flex-col items-center justify-center rounded-md transition-colors
                      ${esHoy ? 'border border-indigo-500 text-indigo-600 dark:text-indigo-400' : ''}
                      ${tieneActividad ? esPrecursor ? 'bg-amber-100 dark:bg-amber-900/50' : 'bg-indigo-100 dark:bg-indigo-900/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                      <span className={`text-[10px] font-bold ${tieneActividad ? (esPrecursor ? 'text-amber-700 dark:text-amber-400' : 'text-indigo-700 dark:text-indigo-300') : 'text-slate-500'}`}>{obj.dia}</span>
                      {tieneActividad && <span className={`text-[7.5px] leading-none mt-0.5 font-bold opacity-80 ${esPrecursor ? 'text-amber-700 dark:text-amber-400' : 'text-indigo-600 dark:text-indigo-400'}`}>{formatearTiempoTexto(horasEseDia)}</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3"><Target size={14} className="text-rose-500" /> Ajustar Metas</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Meta del Año de Servicio <span className="font-normal italic">(Opcional)</span></label>
                  <input 
                    type="number" value={metaAnual === '' ? '' : metaAnual} onChange={(e) => manejarCambioInput(e, 'metaAnual')}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 font-bold text-slate-800 dark:text-slate-100 transition-colors" 
                  />
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">
                    Meta Mensual {tieneMetaAnual && <span className="text-emerald-500">(Sugerida: {metaMensualSugerida} hrs)</span>}
                  </label>
                  <input 
                    type="number" value={metaMensual === '' ? '' : metaMensual} onChange={(e) => manejarCambioInput(e, 'metaMensual')}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 font-bold text-slate-800 dark:text-slate-100 transition-colors mb-3" 
                  />
                  
                  {tieneMetaAnual && horasRestantesAnuales > 0 && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 p-3 rounded-xl">
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-snug">
                        {horasTotalesAño > 0 
                          ? `Tomando en cuenta las ${horasTotalesAño} horas que ya llevas, y que faltan ${diasHastaAgosto} días para el 31 de agosto, tendrías que hacer un promedio de `
                          : `Faltan exactamente ${diasHastaAgosto} días para el 31 de agosto. Para alcanzar tu meta tendrías que hacer un promedio de `}
                        <span className="font-black text-indigo-600 dark:text-indigo-400">{formatearTiempoTexto(metaDiariaSugerida)} al día</span>. Esto equivale a <span className="font-black text-emerald-600 dark:text-emerald-500">{metaMensualSugerida} horas al mes</span>.
                      </p>
                    </div>
                  )}
                  {tieneMetaAnual && horasRestantesAnuales === 0 && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 p-3 rounded-xl text-center">
                      <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">¡Felicidades! Ya has completado tu meta anual.</p>
                    </div>
                  )}
                </div>

                <details className="pt-2 border-t border-slate-200 dark:border-slate-800 group">
                  <summary className="text-[10px] font-bold text-blue-600 dark:text-purple-400 hover:text-blue-700 transition-colors cursor-pointer list-none flex items-center gap-1">
                    <span className="transform group-open:rotate-90 transition-transform">▸</span> ¿Empezaste a usar la app a mitad de año?
                  </summary>
                  <div className="mt-3">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Horas previas acumuladas</label>
                    <input type="number" value={horasAcumuladasPrevias === 0 ? '' : horasAcumuladasPrevias} onChange={(e) => manejarCambioInput(e, 'horasAcumuladasPrevias')} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs focus:outline-none focus:border-indigo-500 font-bold text-slate-800 dark:text-slate-100 transition-colors" />
                  </div>
                </details>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4">
              <div className="flex items-start gap-2.5 mb-3">
                <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-[10px] font-medium text-amber-800 dark:text-amber-400 leading-relaxed">
                  <strong>Privacidad:</strong> Los datos de tu progreso se guardan <b>únicamente en tu dispositivo</b>. Si borras el caché de tu navegador o desinstalas la app, este progreso se perderá. Te recomendamos exportar tu información regularmente.
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={exportarProgreso} className="flex-1 bg-amber-200 hover:bg-amber-300 dark:bg-amber-800/50 dark:hover:bg-amber-700 text-amber-800 dark:text-amber-200 text-[10px] font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                  <Download size={14} /> Exportar
                </button>
                <button onClick={() => refFileInput.current?.click()} className="flex-1 bg-amber-200 hover:bg-amber-300 dark:bg-amber-800/50 dark:hover:bg-amber-700 text-amber-800 dark:text-amber-200 text-[10px] font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                  <Upload size={14} /> Importar
                </button>
                <input type="file" accept=".json" ref={refFileInput} onChange={importarProgreso} className="hidden" />
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}