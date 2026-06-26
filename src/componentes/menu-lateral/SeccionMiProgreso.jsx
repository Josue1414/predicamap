// src/componentes/menu-lateral/SeccionMiProgreso.jsx
import React, { useState } from 'react';
import { TrendingUp, ChevronUp, ChevronDown, Clock, BookOpen, Plus, Minus, Settings2, Award, Star } from 'lucide-react';

export default function SeccionMiProgreso({
  visible = true,
  acordeonActivo,
  alternarAcordeon,
  perfilUsuario,
  progresoDatos,
  agregarMinutos,
  modificarEstudios,
  actualizarMetaMensual
}) {
  const [editandoMeta, setEditandoNombre] = useState(false);
  const [metaTemp, setMetaTemp] = useState(progresoDatos.metaMensual);

  if (!visible || !progresoDatos) return null;

  const esPrecursor = perfilUsuario?.rol === 'Precursor';
  
  // Matemáticas del tiempo
  const horas = Math.floor(progresoDatos.minutosTotales / 60);
  const minutos = progresoDatos.minutosTotales % 60;
  const porcentaje = Math.min(100, Math.round((progresoDatos.minutosTotales / (progresoDatos.metaMensual * 60)) * 100));

  // Lógica del "Tamagotchi" Espiritual y Textos Bíblicos
  const obtenerEstadoEspiritual = (pct) => {
    if (pct < 25) return {
      planta: '🌱',
      cita: 'Salmo 34:8',
      texto: '"Prueben y vean que Jehová es bueno; feliz el hombre que se refugia en él".'
    };
    if (pct < 50) return {
      planta: '🌿',
      cita: 'Mateo 6:33',
      texto: '"Sigan buscando primero el Reino y la justicia de Dios, y todas estas otras cosas les serán añadidas".'
    };
    if (pct < 75) return {
      planta: '🌳',
      cita: 'Gálatas 6:9',
      texto: '"Así que no nos rindamos de hacer lo que está bien, porque a su debido tiempo cosecharemos si no nos cansamos".'
    };
    if (pct < 100) return {
      planta: '🌸',
      cita: 'Isaías 40:29',
      texto: '"Él le da poder al cansado y plena fuerza al que no tiene energías... los que esperan en Jehová recobrarán las fuerzas".'
    };
    return {
      planta: '🍎',
      cita: 'Proverbios 10:22',
      texto: '"La bendición de Jehová es la que enriquece, y con ella él no trae ningún dolor".'
    };
  };

  const estadoActual = obtenerEstadoEspiritual(porcentaje);
  const abierto = acordeonActivo === 'mi_progreso';

  // Configuración SVG del Anillo
  const radio = 45;
  const circunferencia = 2 * Math.PI * radio;
  const strokeDashoffset = circunferencia - (porcentaje / 100) * circunferencia;

  const guardarMeta = () => {
    actualizarMetaMensual(Number(metaTemp));
    setEditandoNombre(false);
  };

  return (
    <div className={`rounded-xl border overflow-hidden mb-2 shadow-sm transition-colors ${esPrecursor ? 'border-amber-300 dark:border-amber-700 bg-gradient-to-b from-amber-50/50 to-white dark:from-amber-950/20 dark:to-slate-950' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950'}`}>
      <button onClick={() => alternarAcordeon('mi_progreso')} className={`w-full p-3 flex justify-between items-center transition-colors ${esPrecursor ? 'bg-amber-100/50 dark:bg-amber-900/30 hover:bg-amber-200/50 dark:hover:bg-amber-900/50' : 'bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
        <span className={`font-bold text-xs flex items-center gap-2 ${esPrecursor ? 'text-amber-700 dark:text-amber-400' : 'text-slate-700 dark:text-slate-200'}`}>
          {esPrecursor ? <Star size={16} className="fill-amber-500 text-amber-500"/> : <TrendingUp size={16} className="text-emerald-500"/>} 
          Mi Progreso Mensual
        </span>
        {abierto ? <ChevronUp size={16} className={esPrecursor ? 'text-amber-500' : 'text-slate-400'} /> : <ChevronDown size={16} className={esPrecursor ? 'text-amber-500' : 'text-slate-400'} />}
      </button>

      {abierto && (
        <div className="p-4 space-y-4">
          
          {/* BANNER PRECURSOR EXCLUSIVO */}
          {esPrecursor && (
            <div className="bg-gradient-to-r from-amber-400 to-yellow-500 rounded-lg p-2.5 shadow-md flex items-center justify-center gap-2 text-white font-black uppercase tracking-wider text-[10px] animate-slide-up">
              <Award size={14} /> Servicio de Tiempo Completo
            </div>
          )}

          {/* TARJETA DE TEXTO BÍBLICO (DINÁMICA) */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
            <div className="absolute -right-2 -top-2 text-4xl opacity-10 grayscale blur-[1px]">{estadoActual.planta}</div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 italic relative z-10 leading-relaxed">
              {estadoActual.texto}
            </p>
            <p className="text-[9px] font-black text-indigo-500 dark:text-indigo-400 text-right mt-1.5 uppercase tracking-wide relative z-10">
              — {estadoActual.cita}
            </p>
          </div>

          {/* ANILLO DE PROGRESO */}
          <div className="flex justify-center items-center py-2 relative">
            <svg width="120" height="120" className="transform -rotate-90">
              {/* Fondo del anillo */}
              <circle cx="60" cy="60" r={radio} fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-800" />
              {/* Progreso del anillo */}
              <circle cx="60" cy="60" r={radio} fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray={circunferencia} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className={`transition-all duration-1000 ease-out ${esPrecursor ? 'text-amber-400' : 'text-emerald-500'}`} />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl animate-bounce-slow leading-none mb-1">{estadoActual.planta}</span>
              <span className={`font-black text-xl leading-none ${esPrecursor ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-100'}`}>
                {horas}h {minutos}m
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{porcentaje}% Listo</span>
            </div>
          </div>

          {/* BOTONES DE CONTROL DE TIEMPO */}
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => agregarMinutos(-15)} className="py-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400 hover:bg-rose-100 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-colors active:scale-95">
              <Minus size={14}/> 15m
            </button>
            <button onClick={() => agregarMinutos(15)} className="py-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-colors active:scale-95">
              <Plus size={14}/> 15m
            </button>
            <button onClick={() => agregarMinutos(60)} className="py-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-colors active:scale-95 shadow-sm">
              <Plus size={14}/> 1 Hora
            </button>
          </div>

          {/* CONTADOR DE ESTUDIOS */}
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <BookOpen size={16} className="text-blue-500"/> Estudios Bíblicos
            </span>
            <div className="flex items-center gap-3">
              <button onClick={() => modificarEstudios(-1)} className="p-1.5 bg-white dark:bg-slate-800 rounded-lg text-slate-500 hover:text-rose-500 shadow-sm transition-colors"><Minus size={14}/></button>
              <span className="font-black text-slate-800 dark:text-slate-100 text-sm w-4 text-center">{progresoDatos.estudios}</span>
              <button onClick={() => modificarEstudios(1)} className="p-1.5 bg-white dark:bg-slate-800 rounded-lg text-slate-500 hover:text-emerald-500 shadow-sm transition-colors"><Plus size={14}/></button>
            </div>
          </div>

          {/* CONFIGURACIÓN DE META */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            {editandoMeta ? (
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 animate-slide-up">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Meta de Horas al Mes</label>
                <div className="flex gap-2 mb-2">
                  <input type="number" min="1" value={metaTemp} onChange={(e) => setMetaTemp(e.target.value)} className="w-full p-2 text-sm font-bold bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"/>
                  <button onClick={guardarMeta} className="px-4 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 transition-colors">OK</button>
                </div>
                <p className="text-[10px] text-slate-500 font-bold text-center">
                  💡 Si haces <span className="text-indigo-500">{metaTemp} hrs/mes</span>, al año harás aprox: <span className="text-emerald-500">{metaTemp * 12} hrs</span>.
                </p>
              </div>
            ) : (
              <button onClick={() => setEditandoNombre(true)} className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 uppercase tracking-wider transition-colors">
                <Settings2 size={12} /> Configurar Meta de Horas ({progresoDatos.metaMensual} hrs/mes)
              </button>
            )}
          </div>

        </div>
      )}
    </div>
  );
}