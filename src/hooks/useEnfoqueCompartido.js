// src/hooks/useEnfoqueCompartido.js
import { useEffect, useRef } from 'react';

export default function useEnfoqueCompartido({
  secciones,
  tachuelas,
  alVolarATerritorio,
  alSeleccionarTachuela,
  setCoordenadasActuales,
  setZoomActual
}) {
  // Evitamos que intente enfocar múltiples veces
  const procesadoTerritorio = useRef(false);
  const procesadoTachuela = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tId = params.get('t');
    const pinId = params.get('pin');

    // 1. Lógica para enfocar TERRITORIO (Vuela hacia allá, NO abre ventana)
    if (tId && !procesadoTerritorio.current && secciones?.length > 0) {
      const territorio = secciones.find(s => String(s.id) === String(tId));
      if (territorio) {
        if (alVolarATerritorio) alVolarATerritorio(territorio.coordenadas);
        procesadoTerritorio.current = true;
      }
    }

    // 2. Lógica para enfocar TACHUELA (Vuela hacia allá y SÍ abre la ventana)
    if (pinId && !procesadoTachuela.current && tachuelas?.length > 0) {
      const tachuela = tachuelas.find(p => String(p.id) === String(pinId));
      if (tachuela) {
        if (setCoordenadasActuales) setCoordenadasActuales([tachuela.lat, tachuela.lng]);
        if (setZoomActual) setZoomActual(18);
        if (alSeleccionarTachuela) alSeleccionarTachuela(tachuela);
        procesadoTachuela.current = true;
      }
    }

  }, [secciones, tachuelas, alVolarATerritorio, alSeleccionarTachuela, setCoordenadasActuales, setZoomActual]);
}