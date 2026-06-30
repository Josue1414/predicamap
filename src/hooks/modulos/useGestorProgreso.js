// src/hooks/modulos/useGestorProgreso.js
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

  const soyElEmisor = useRef(false);

  useEffect(() => {
    const sincronizarProgreso = (e) => {
      setDatosProgreso(e.detail);
    };
    window.addEventListener('progreso_actualizado', sincronizarProgreso);
    return () => window.removeEventListener('progreso_actualizado', sincronizarProgreso);
  }, []);

  useEffect(() => {
    if (soyElEmisor.current) {
      localStorage.setItem('predicamap_progreso', JSON.stringify(datosProgreso));
      window.dispatchEvent(new CustomEvent('progreso_actualizado', { detail: datosProgreso }));
      soyElEmisor.current = false;
    }
  }, [datosProgreso]);

  // ★ CORRECCIÓN: Obtener la fecha estrictamente en la zona horaria local del dispositivo ★
  const obtenerFechaHoyLocal = () => {
    const fecha = new Date();
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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
    const prefijoMesActual = obtenerFechaHoyLocal().substring(0, 7); 
    let total = 0;
    for (const [fecha, datos] of Object.entries(datosProgreso.registrosDiarios)) {
      if (fecha.startsWith(prefijoMesActual)) {
        total += datos.horas || 0;
      }
    }
    return total;
  };

  const calcularEstudiosMesActual = () => {
    const prefijoMesActual = obtenerFechaHoyLocal().substring(0, 7);
    let maxEstudios = 0;
    for (const [fecha, datos] of Object.entries(datosProgreso.registrosDiarios)) {
      if (fecha.startsWith(prefijoMesActual) && datos.estudios > maxEstudios) {
        maxEstudios = datos.estudios;
      }
    }
    return maxEstudios;
  };

  const modificarHorasHoy = (cantidad) => {
    soyElEmisor.current = true;
    setDatosProgreso(prev => {
      const hoy = obtenerFechaHoyLocal();
      const registroHoy = prev.registrosDiarios[hoy] || { horas: 0, estudios: 0 };
      
      let nuevasHoras = Math.max(0, (registroHoy.horas || 0) + cantidad); 
      if (nuevasHoras > 18) nuevasHoras = 18; // Límite máximo
      
      return {
        ...prev,
        registrosDiarios: {
          ...prev.registrosDiarios,
          [hoy]: { ...registroHoy, horas: nuevasHoras }
        }
      };
    });
  };

  const setFraccionMinutosHoy = (fraccionDecimal) => {
    soyElEmisor.current = true;
    setDatosProgreso(prev => {
      const hoy = obtenerFechaHoyLocal();
      const registroHoy = prev.registrosDiarios[hoy] || { horas: 0, estudios: 0 };
      
      const horasEnteras = Math.floor(registroHoy.horas || 0);
      let nuevasHoras = horasEnteras + fraccionDecimal;
      
      if (nuevasHoras > 18) nuevasHoras = 18; 
      
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
    soyElEmisor.current = true;
    setDatosProgreso(prev => {
      const hoy = obtenerFechaHoyLocal();
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
    soyElEmisor.current = true;
    setDatosProgreso(prev => ({ ...prev, ...nuevasMetas }));
  };

  const exportarProgreso = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(datosProgreso));
    const a = document.createElement('a');
    a.setAttribute("href", dataStr);
    a.setAttribute("download", `PredicaMap_Progreso_${obtenerFechaHoyLocal()}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const importarProgreso = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (json.registrosDiarios) {
          soyElEmisor.current = true;
          setDatosProgreso(json);
          alert("¡Tu progreso ha sido restaurado con éxito!");
        } else {
          alert("El archivo no tiene el formato correcto.");
        }
      } catch (error) {
        alert("Ocurrió un error al leer el archivo.");
      }
    };
    reader.readAsText(file);
    event.target.value = ''; 
  };

  return {
    ...datosProgreso,
    horasMesActual: calcularHorasMesActual(),
    estudiosMesActual: calcularEstudiosMesActual(),
    horasTotalesAño: obtenerHorasTotalesAñoServicio(),
    diasHastaAgosto: calcularDiasHastaAgosto(),
    mesesRestantes: calcularMesesRestantes(),
    modificarHorasHoy,
    setFraccionMinutosHoy, 
    setEstudiosHoy,
    actualizarMetas,
    fechaHoyStr: obtenerFechaHoyLocal(),
    exportarProgreso, 
    importarProgreso  
  };
}