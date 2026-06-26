// src/hooks/modulos/useGestorProgreso.js
import { useState, useEffect } from 'react';

export default function useGestorProgreso(rolUsuario) {
  // Definimos la meta por defecto según el rol del usuario
  const metaPorDefecto = rolUsuario === 'Precursor' ? 50 : 15;

  const [progreso, setProgreso] = useState({
    mesActual: new Date().getMonth(),
    anioActual: new Date().getFullYear(),
    minutosTotales: 0,
    estudios: 0,
    metaMensual: metaPorDefecto,
  });

  const [cargando, setCargando] = useState(true);

  // 1. CARGAR DATOS (Y REINICIAR SI ES UN MES NUEVO)
  useEffect(() => {
    const guardado = localStorage.getItem('predicamap_mi_progreso');
    if (guardado) {
      try {
        const datos = JSON.parse(guardado);
        const mesHoy = new Date().getMonth();
        const anioHoy = new Date().getFullYear();

        // Si cambió el mes o el año, reiniciamos contadores pero conservamos la meta
        if (datos.mesActual !== mesHoy || datos.anioActual !== anioHoy) {
          setProgreso({
            mesActual: mesHoy,
            anioActual: anioHoy,
            minutosTotales: 0,
            estudios: 0,
            metaMensual: datos.metaMensual || metaPorDefecto
          });
        } else {
          setProgreso(datos);
        }
      } catch (e) {
        console.error("Error al leer progreso", e);
      }
    } else {
      // Si no hay datos, inicializamos la meta según el rol
      setProgreso(p => ({ ...p, metaMensual: metaPorDefecto }));
    }
    setCargando(false);
  }, [metaPorDefecto]);

  // 2. GUARDAR CAMBIOS AUTOMÁTICAMENTE
  useEffect(() => {
    if (!cargando) {
      localStorage.setItem('predicamap_mi_progreso', JSON.stringify(progreso));
    }
  }, [progreso, cargando]);

  // 3. FUNCIONES DE CONTROL
  const agregarMinutos = (mins) => {
    setProgreso(p => ({ ...p, minutosTotales: Math.max(0, p.minutosTotales + mins) }));
  };

  const modificarEstudios = (cantidad) => {
    setProgreso(p => ({ ...p, estudios: Math.max(0, p.estudios + cantidad) }));
  };

  const actualizarMetaMensual = (horas) => {
    setProgreso(p => ({ ...p, metaMensual: Math.max(1, horas) }));
  };

  return {
    progreso,
    agregarMinutos,
    modificarEstudios,
    actualizarMetaMensual
  };
}