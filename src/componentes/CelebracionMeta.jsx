// src/componentes/CelebracionMeta.jsx
import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Fireworks } from 'fireworks-js';
import useGestorProgreso from '../hooks/modulos/useGestorProgreso';

const CONFETI_ANUAL = 80;   // Mucho confeti
const CONFETI_MENSUAL = 45; // Confeti moderado

export default function CelebracionMeta() {
  const { horasTotalesAño, metaAnual, horasMesActual, metaMensual, cargandoProgreso } = useGestorProgreso();
  
  const [mostrarMensaje, setMostrarMensaje] = useState(false);
  const [tipoCelebracion, setTipoCelebracion] = useState(null); 
  const contenedorFuegosRef = useRef(null);

  useEffect(() => {
    if (cargandoProgreso) return;

    const fecha = new Date();
    const mesActual = fecha.getMonth(); 
    const añoActual = fecha.getFullYear();

    const tieneMetaAnual = metaAnual && metaAnual > 0;
    const metaAnualCumplida = horasTotalesAño >= metaAnual;
    const esSeptiembre = mesActual === 8;
    const llaveAnual = `meta_anual_celebrada_${añoActual}`;
    const yaCelebradoAnual = localStorage.getItem(llaveAnual);

    const tieneMetaMensual = metaMensual && metaMensual > 0;
    const metaMensualCumplida = horasMesActual >= metaMensual;
    const llaveMensual = `meta_mensual_celebrada_${añoActual}_${mesActual}`;
    const yaCelebradoMensual = localStorage.getItem(llaveMensual);

    let tipoA_Celebrar = null;

    // Lógica estricta de Producción
    if (tieneMetaAnual && metaAnualCumplida && esSeptiembre && !yaCelebradoAnual) {
      tipoA_Celebrar = 'anual';
    } else if (tieneMetaMensual && metaMensualCumplida && horasMesActual > 0 && !yaCelebradoMensual) {
      tipoA_Celebrar = 'mensual';
    }

    if (tipoA_Celebrar) {
      const timerInicio = setTimeout(() => {
        setTipoCelebracion(tipoA_Celebrar);
        setMostrarMensaje(true);
        
        if (tipoA_Celebrar === 'anual') {
          lanzarConfeti(CONFETI_ANUAL, 4000);
          localStorage.setItem(llaveAnual, 'true');
        } else {
          lanzarConfeti(CONFETI_MENSUAL, 3000);
          localStorage.setItem(llaveMensual, 'true');
        }
        
        setTimeout(() => {
          setMostrarMensaje(false);
          setTipoCelebracion(null);
        }, 6000);

      }, 4000); 

      return () => clearTimeout(timerInicio);
    }
  }, [horasTotalesAño, metaAnual, horasMesActual, metaMensual, cargandoProgreso]);

  useEffect(() => {
    let animacionFuegos = null;
    let timerFuegos = null;

    if (mostrarMensaje && tipoCelebracion === 'anual' && contenedorFuegosRef.current) {
      const duracionFuegos = 5000; 
      
      animacionFuegos = new Fireworks(contenedorFuegosRef.current, {
        autoresize: true, opacity: 0.5, acceleration: 1.05, friction: 0.97, gravity: 1.5,
        particles: 40, traceLength: 3, traceSpeed: 10, explosion: 6, intensity: 25,
        flickering: 50, lineStyle: 'round', hue: { min: 0, max: 360 }, delay: { min: 15, max: 30 },
        rocketsPoint: { min: 0, max: 100 }, lineWidth: { explosion: { min: 1, max: 3 }, trace: { min: 1, max: 2 } },
        brightness: { min: 50, max: 80 }, decay: { min: 0.015, max: 0.03 }
      });
      
      animacionFuegos.start();

      timerFuegos = setTimeout(() => {
        if (animacionFuegos) animacionFuegos.stop();
      }, duracionFuegos);
    }

    return () => {
      if (animacionFuegos) animacionFuegos.stop();
      if (timerFuegos) clearTimeout(timerFuegos);
    };
  }, [mostrarMensaje, tipoCelebracion]);

  const lanzarConfeti = (cantidadBase, duracion) => {
    const animationEnd = Date.now() + duracion;
    const defaults = { startVelocity: 35, spread: 360, ticks: 60, zIndex: 99999 };
    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      
      const particleCount = cantidadBase * (timeLeft / duracion); 
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250); 
  };

  if (!mostrarMensaje) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none bg-black/10 backdrop-blur-[2px] transition-opacity duration-500">
      
      {tipoCelebracion === 'anual' && (
        <div ref={contenedorFuegosRef} className="absolute inset-0 w-full h-full z-0 pointer-events-none" />
      )}

      <div className="relative z-10 bg-white/95 dark:bg-slate-900/95 px-8 py-6 rounded-3xl shadow-2xl border border-emerald-400 dark:border-emerald-600 text-center animate-in zoom-in fade-in duration-700">
        <span className="text-6xl block mb-3 animate-bounce">
          {tipoCelebracion === 'anual' ? '🎊⭐🎉' : '🎉'}
        </span>
        <h2 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mb-2 tracking-tight">¡Felicidades!</h2>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
          {tipoCelebracion === 'anual' 
            ? `¡Cumpliste tu meta anual de ${metaAnual || ''} horas!` 
            : `¡Cumpliste tus horas del mes!`}
        </p>
      </div>
    </div>
  );
}