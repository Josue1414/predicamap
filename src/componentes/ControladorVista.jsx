// src/componentes/ControladorVista.jsx
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export default function ControladorVista({ centro, zoom }) {
  const mapa = useMap();

  useEffect(() => {
    if (centro && centro[0] && centro[1]) {
      // Mueve la cámara con una animación fluida de 1.5 segundos
      mapa.flyTo(centro, zoom || mapa.getZoom(), {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [centro, zoom, mapa]);

  return null;
}