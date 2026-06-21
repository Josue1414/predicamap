// src/componentes/VisorMapa.jsx
import React from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function VisorMapa({ centroInicial, zoomInicial, secciones, edificios, alSeleccionarEdificio }) {
  // Capa satelital gratuita de Esri
  const urlSateliteEsri = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  const atribucionEsri = "Tiles &copy; Esri &mdash; Fuente: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, y la comunidad de usuarios de GIS";

  return (
    <div className="w-full h-full bg-slate-200 dark:bg-slate-950">
      <MapContainer 
        center={centroInicial} 
        zoom={zoomInicial} 
        zoomControl={false}
        className="w-full h-full"
      >
        <TileLayer
          url={urlSateliteEsri}
          attribution={atribucionEsri}
        />

        {/* Renderizado puro de perímetros de las secciones */}
        {secciones.map((seccion) => (
          <Polygon
            key={seccion.id}
            positions={seccion.coordenadas}
            pathOptions={{
              color: seccion.colorHex,
              fillColor: seccion.colorHex,
              fillOpacity: 0.15,
              weight: 2
            }}
          />
        ))}

        {/* Renderizado de checks o pines de edificios individuales */}
        {edificios.map((edificio) => (
          <Marker 
            key={edificio.id} 
            position={[edificio.lat, edificio.lng]}
            eventHandlers={{
              click: () => alSeleccionarEdificio(edificio),
            }}
          >
            <Popup>
              <div className="text-slate-900 p-1">
                <p className="font-bold text-xs">{edificio.direccion}</p>
                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border">
                  Estado: {edificio.estado}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}