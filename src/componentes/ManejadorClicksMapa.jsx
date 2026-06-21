// src/componentes/ManejadorClicksMapa.jsx
import { useMapEvents } from 'react-leaflet';

export default function ManejadorClicksMapa({ activo, alHacerClick }) {
  useMapEvents({
    click(evento) {
      if (activo) {
        // Captura la coordenada exacta del toque en la pantalla
        const { lat, lng } = evento.latlng;
        alHacerClick([lat, lng]);
      }
    }
  });

  return null;
}