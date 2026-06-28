import React, { useState, useEffect } from 'react';
import { Menu, Sprout, Flower2, Gift, PartyPopper } from 'lucide-react';
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

export default function CabeceraCongregacion({ nombreCongregacion, alAbrirMenu, perfilUsuario }) {
  const { horasMesActual, metaMensual, metaAnual, horasTotalesAño, diasHastaAgosto } = useGestorProgreso();
  const [textoActual, setTextoActual] = useState(null);
  const [conectado, setConectado] = useState(navigator.onLine);

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

  return (
    <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-sm relative z-50 flex flex-col w-full">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <button onClick={alAbrirMenu} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-600 transition-colors shrink-0">
            <Menu size={20} />
          </button>
          <div className="flex flex-col truncate">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-tight">PredicaMap</span>
            <h1 className="text-lg font-black text-indigo-600 dark:text-indigo-400 truncate leading-tight">{nombreCongregacion}</h1>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 ml-2 bg-slate-50 dark:bg-slate-900/50 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-800">
          <span className="relative flex h-2.5 w-2.5">
            {conectado && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${conectado ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
          </span>
          <span className={`text-[9px] font-bold uppercase tracking-wider ${conectado ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>{conectado ? 'En vivo' : 'Local'}</span>
        </div>
      </div>

      {/* ★ TEXTO DINÁMICO CORREGIDO ★ */}
      {horasMesActual > 0 && textoActual && (
        <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border-t border-slate-100 dark:border-slate-800/50 px-4 py-1.5 flex items-center gap-2 overflow-hidden w-full">
          <div className="shrink-0 bg-white dark:bg-black/20 p-1 rounded-full shadow-sm">
            {renderizarIcono()}
          </div>
          <div className="flex flex-col overflow-hidden w-full">
            <div className="flex items-center w-full truncate text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 leading-none">
              Horas en el mes: {horasMesActual} {tieneMetaAnual && `- Acumuladas: ${horasTotalesAño}`} <span className="text-indigo-500 ml-1 shrink-0">— {textoActual.cita}</span>
            </div>
            <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate italic leading-tight mt-0.5">
              "{textoActual.texto}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
}