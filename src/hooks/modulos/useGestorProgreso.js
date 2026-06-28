import { useState, useEffect, useRef } from 'react';

export default function useGestorProgreso() {
  const [datosProgreso, setDatosProgreso] = useState(() => {
    const guardado = localStorage.getItem('predicamap_progreso');
    if (guardado) return JSON.parse(guardado);
    return {
      metaMensual: '',
      metaAnual: '',
      horasAcumuladasPrevias: 0, 
      registrosDiarios: {} 
    };
  });

  // ★ SOLUCIÓN DE ERROR REACT: Usamos una "bandera" para emitir el evento en el momento seguro
  const soyElEmisor = useRef(false);

  useEffect(() => {
    // Escuchar cambios hechos por otros componentes
    const sincronizarProgreso = (e) => {
      setDatosProgreso(e.detail);
    };
    window.addEventListener('progreso_actualizado', sincronizarProgreso);
    return () => window.removeEventListener('progreso_actualizado', sincronizarProgreso);
  }, []);

  useEffect(() => {
    // Solo si ESTE componente hizo el cambio, guardamos y avisamos a los demás
    if (soyElEmisor.current) {
      localStorage.setItem('predicamap_progreso', JSON.stringify(datosProgreso));
      window.dispatchEvent(new CustomEvent('progreso_actualizado', { detail: datosProgreso }));
      soyElEmisor.current = false; // Bajamos la bandera
    }
  }, [datosProgreso]);

  const obtenerFechaHoy = () => new Date().toISOString().split('T')[0];

  const calcularDiasHastaAgosto = () => {
    const hoy = new Date();
    let añoFin = hoy.getFullYear();
    if (hoy.getMonth() >= 8) añoFin += 1;
    const fechaFin = new Date(añoFin, 7, 31); 
    const diffTiempo = fechaFin.getTime() - hoy.getTime();
    const diffDias = Math.ceil(diffTiempo / (1000 * 60 * 60 * 24));
    return diffDias > 0 ? diffDias : 1; 
  };

  const calcularMesesRestantes = () => {
    const hoy = new Date();
    const mesActual = hoy.getMonth(); 
    const meses = mesActual >= 8 ? 12 - (mesActual - 8) : 8 - mesActual;
    return meses > 0 ? meses : 1;
  };

  const obtenerHorasTotalesAñoServicio = () => {
    const hoy = new Date();
    const añoActual = hoy.getFullYear();
    const inicioAño = hoy.getMonth() >= 8 ? new Date(añoActual, 8, 1) : new Date(añoActual - 1, 8, 1);

    let total = 0;
    for (const [fechaStr, datos] of Object.entries(datosProgreso.registrosDiarios)) {
      if (new Date(fechaStr) >= inicioAño) {
        total += datos.horas || 0;
      }
    }
    return total + (datosProgreso.horasAcumuladasPrevias || 0);
  };

  const calcularHorasMesActual = () => {
    const prefijoMesActual = obtenerFechaHoy().substring(0, 7); 
    let total = 0;
    for (const [fecha, datos] of Object.entries(datosProgreso.registrosDiarios)) {
      if (fecha.startsWith(prefijoMesActual)) {
        total += datos.horas || 0;
      }
    }
    return total;
  };

  const calcularEstudiosMesActual = () => {
    const prefijoMesActual = obtenerFechaHoy().substring(0, 7);
    let maxEstudios = 0;
    for (const [fecha, datos] of Object.entries(datosProgreso.registrosDiarios)) {
      if (fecha.startsWith(prefijoMesActual) && datos.estudios > maxEstudios) {
        maxEstudios = datos.estudios;
      }
    }
    return maxEstudios;
  };

  const modificarHorasHoy = (cantidad) => {
    soyElEmisor.current = true; // Levantamos bandera
    setDatosProgreso(prev => {
      const hoy = obtenerFechaHoy();
      const registroHoy = prev.registrosDiarios[hoy] || { horas: 0, estudios: 0 };
      const nuevasHoras = Math.max(0, (registroHoy.horas || 0) + Math.round(cantidad * 100) / 100); 
      
      return {
        ...prev,
        registrosDiarios: {
          ...prev.registrosDiarios,
          [hoy]: { ...registroHoy, horas: nuevasHoras }
        }
      };
    });
  };

  const setEstudiosHoy = (cantidad) => {
    soyElEmisor.current = true; // Levantamos bandera
    setDatosProgreso(prev => {
      const hoy = obtenerFechaHoy();
      const registroHoy = prev.registrosDiarios[hoy] || { horas: 0, estudios: 0 };
      return {
        ...prev,
        registrosDiarios: {
          ...prev.registrosDiarios,
          [hoy]: { ...registroHoy, estudios: Math.max(0, cantidad) }
        }
      };
    });
  };

  const actualizarMetas = (nuevasMetas) => {
    soyElEmisor.current = true; // Levantamos bandera
    setDatosProgreso(prev => ({ ...prev, ...nuevasMetas }));
  };

  return {
    ...datosProgreso,
    horasMesActual: calcularHorasMesActual(),
    estudiosMesActual: calcularEstudiosMesActual(),
    horasTotalesAño: obtenerHorasTotalesAñoServicio(),
    diasHastaAgosto: calcularDiasHastaAgosto(),
    mesesRestantes: calcularMesesRestantes(),
    modificarHorasHoy,
    setEstudiosHoy,
    actualizarMetas,
    fechaHoyStr: obtenerFechaHoy()
  };
}