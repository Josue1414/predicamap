// src/componentes/CabeceraCongregacion.jsx
import React, { useState, useEffect } from 'react';
import { Menu, Sprout, Flower2, Gift, PartyPopper, WifiHigh, FileText } from 'lucide-react';
import useGestorProgreso from '../hooks/modulos/useGestorProgreso';

const textosMotivacionales = {
  inicio: [
    { cita: "Sal. 34:8", texto: "Prueben y vean que Jehová es bueno..." },
    { cita: "Mat. 6:33", texto: "Sigan buscando primero el Reino..." }
  ],
  desarrollo: [
    { cita: "Fil. 4:13", texto: "Para todas las cosas tengo las fuerzas..." },
    { cita: "Gál. 6:9", texto: "No nos rindamos de hacer lo que está bien..." }
  ],
  cierre: [
    { cita: "Isa. 40:29", texto: "Él le da poder al cansado..." },
    { cita: "1 Cor. 15:58", texto: "Su labor no es en vano." }
  ],
  logrado: [
    { cita: "Prov. 10:22", texto: "La bendición de Jehová enriquece..." },
    { cita: "Mat. 22:37", texto: "Ama a Jehová tu Dios..." }
  ]
};

// ★ FUNCIÓN AGREGADA: Convierte decimales (ej. 2.5) a formato de reloj (ej. 2:30 hrs)
const formatearTiempoTexto = (horasDecimales) => {
  if (!horasDecimales || horasDecimales <= 0) return "0:00 hrs";
  const horas = Math.floor(horasDecimales);
  const minutos = Math.round((horasDecimales - horas) * 60);
  return `${horas}:${minutos.toString().padStart(2, '0')} hrs`;
};

export default function CabeceraCongregacion({ nombreCongregacion, alAbrirMenu, perfilUsuario, modoAhorro, alReactivar }) {
  const { horasMesActual, metaMensual, metaAnual, horasTotalesAño, diasHastaAgosto } = useGestorProgreso();
  const [textoActual, setTextoActual] = useState(null);
  const [conectado, setConectado] = useState(navigator.onLine);

  // --- LÓGICA DE FECHAS PARA EL INFORME ---
  const fechaActual = new Date();
  const diaActual = fechaActual.getDate();
  const ultimoDiaDelMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0).getDate();
  
  const esUltimoDia = diaActual === ultimoDiaDelMes;
  const esPrimerosDias = diaActual >= 1 && diaActual <= 3;
  const mostrarAvisoInforme = esUltimoDia || esPrimerosDias;
  // ---------------------------------------

  useEffect(() => {
    const manejarConexion = () => setConectado(true);
    const manejarDesconexion = () => setConectado(false);
    window.addEventListener('online', manejarConexion);
    window.addEventListener('offline', manejarDesconexion);
    return () => {
      window.removeEventListener('online', manejarConexion);
      window.removeEventListener('offline', manejarDesconexion);
    };
  }, []);

  const tieneMetaAnual = metaAnual && metaAnual > 0;
  const horasRestantesAnuales = tieneMetaAnual ? Math.max(0, metaAnual - horasTotalesAño) : 0;
  const mesesRestantesDecimal = diasHastaAgosto / 30.416;
  const metaMensualSugerida = tieneMetaAnual && mesesRestantesDecimal > 0 
    ? Math.ceil( (horasRestantesAnuales / diasHastaAgosto) * 30.416 ) 
    : 0;
  
  const metaMensualUI = tieneMetaAnual ? metaMensualSugerida : (metaMensual || 1);
  const progresoReal = (horasMesActual / metaMensualUI) * 100;

  useEffect(() => {
    if (horasMesActual > 0) {
      let categoria = 'inicio';
      if (progresoReal >= 100) categoria = 'logrado';
      else if (progresoReal >= 75) categoria = 'cierre';
      else if (progresoReal >= 30) categoria = 'desarrollo';

      const opciones = textosMotivacionales[categoria];
      setTextoActual(opciones[Math.floor(Math.random() * opciones.length)]);
    }
  }, [progresoReal, horasMesActual]);

  const renderizarIcono = () => {
    if (progresoReal > 100) return <PartyPopper size={16} className="text-amber-500 animate-bounce" />;
    if (progresoReal === 100) return <Gift size={16} className="text-emerald-500" />;
    if (progresoReal >= 60) return <Flower2 size={16} className="text-rose-400" />;
    return <Sprout size={16} className="text-emerald-400" />;
  };

  let colorPuntoPrimario = 'bg-rose-500';
  let colorPuntoEfecto = 'bg-rose-400';
  let textoConexion = 'Local';
  let colorTexto = 'text-rose-500';

  if (conectado) {
    if (modoAhorro) {
      colorPuntoPrimario = 'bg-amber-500';
      colorPuntoEfecto = 'bg-amber-400';
      textoConexion = 'Ahorro';
      colorTexto = 'text-amber-600 dark:text-amber-400';
    } else {
      colorPuntoPrimario = 'bg-emerald-500';
      colorPuntoEfecto = 'bg-emerald-400';
      textoConexion = 'En vivo';
      colorTexto = 'text-emerald-600 dark:text-emerald-400';
    }
  }

  return (
    <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-sm relative z-50 flex flex-col w-full">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <button 
            onClick={alAbrirMenu} 
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all active:scale-95 shrink-0"
          >
            <Menu size={18} />
            <span className="text-[10px] font-black uppercase tracking-wider hidden sm:inline-block">Menú</span>
            <span className="text-[10px] font-black uppercase tracking-wider sm:hidden">Menú</span>
          </button>
          
          <div className="flex flex-col truncate">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-tight">PredicaMap</span>
            <h1 className="text-lg font-black text-indigo-600 dark:text-indigo-400 truncate leading-tight">{nombreCongregacion}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 shrink-0 ml-2 bg-slate-50 dark:bg-slate-900/50 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-800 transition-colors">
          <span className="relative flex h-2.5 w-2.5">
            {conectado && !modoAhorro && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colorPuntoEfecto}`}></span>}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${colorPuntoPrimario}`}></span>
          </span>
          <span className={`text-[9px] font-bold uppercase tracking-wider transition-colors ${colorTexto}`}>
            {textoConexion}
          </span>
        </div>
      </div>

      {modoAhorro && conectado && (
        <div className="absolute top-full left-0 w-full flex justify-center mt-2 z-[60] animate-in fade-in slide-in-from-top-2">
          <button 
            onClick={alReactivar}
            className="flex items-center gap-2 bg-amber-100/95 dark:bg-amber-900/95 backdrop-blur-sm border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-100 text-[11px] font-bold px-4 py-2.5 rounded-full shadow-lg hover:bg-amber-200 dark:hover:bg-amber-800 transition-all transform hover:scale-105 active:scale-95"
          >
            <WifiHigh size={14} className="animate-pulse" />
            Modo ahorro activo. Toca para reconectar el mapa.
          </button>
        </div>
      )}

      {horasMesActual > 0 && textoActual && (
        <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border-t border-slate-100 dark:border-slate-800/50 px-4 py-1.5 flex items-center gap-2 overflow-hidden w-full">
          <div className="shrink-0 bg-white dark:bg-black/20 p-1 rounded-full shadow-sm">
            {renderizarIcono()}
          </div>
          <div className="flex flex-col overflow-hidden w-full">
            {/* ★ CAMBIO APLICADO: Formateamos horasMesActual y horasTotalesAño ★ */}
            <div className="flex items-center w-full truncate text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 leading-none">
              Horas en el mes: {formatearTiempoTexto(horasMesActual)} {tieneMetaAnual && `- Acumuladas: ${formatearTiempoTexto(horasTotalesAño)}`} <span className="text-indigo-500 ml-1 shrink-0">— {textoActual.cita}</span>
            </div>
            <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate italic leading-tight mt-0.5">
              "{textoActual.texto}"
            </p>
          </div>
        </div>
      )}

      {/* --- FRANJA DE AVISO DE INFORME EN EL HEADER --- */}
      {mostrarAvisoInforme && (
        <div className={`px-4 py-1.5 flex items-center justify-center gap-2 shadow-inner border-t ${esUltimoDia ? 'bg-indigo-100 border-indigo-200 text-indigo-700 dark:bg-indigo-900/50 dark:border-indigo-800 dark:text-indigo-300' : 'bg-emerald-100 border-emerald-200 text-emerald-700 dark:bg-emerald-900/50 dark:border-emerald-800 dark:text-emerald-300'}`}>
          <FileText size={12} className="shrink-0" />
          <span className="text-[10px] font-bold tracking-wide uppercase truncate">
            {esUltimoDia 
              ? '¡Excelente mes! Prepara tu informe para entregarlo.' 
              : '¡Iniciamos nuevo mes! ¿Ya entregaste tu informe anterior?'}
          </span>
        </div>
      )}
    </div>
  );
}