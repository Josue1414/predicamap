// src/componentes/VisorMapa.jsx
import React from 'react';
import { MapContainer, TileLayer, Polygon, Polyline, CircleMarker, Tooltip } from 'react-leaflet';
import ControladorVista from './ControladorVista';
import ManejadorClicksMapa from './ManejadorClicksMapa';
import 'leaflet/dist/leaflet.css';

export default function VisorMapa({ 
  centroInicial, zoomInicial, centroActual, zoomActual, 
  secciones, edificios, alSeleccionarEdificio,
  enModoTrazado, enModoEdificios, 
  puntosTrazadoActual, colorTrazadoActual, alRegistrarPuntoTrazado,
  mostrarCalles, mostrarLugares // <-- NUEVO: Recibimos los estados de los interruptores
}) {
  // Las 3 capas oficiales de Esri para armar el mapa híbrido
  const urlSateliteEsri = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  const urlCallesEsri = "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"; // Capa de solo calles
  const urlLugaresEsri = "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"; // Capa de solo nombres/colonias

  return (
    <div className={`w-full h-full bg-slate-200 dark:bg-slate-950 relative ${enModoTrazado || enModoEdificios ? 'cursor-crosshair' : ''}`}>
      
      {/* Leyenda Informativa Superior Derecha */}
      <div className="absolute top-4 right-4 z-[1000] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-2 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 text-[10px] font-bold flex flex-col gap-1.5 pointer-events-none">
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
          <div className="w-3 h-3 rounded-full bg-[#f97316] border border-white" /> F - Falta / Pendiente
        </div>
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
          <div className="w-3 h-3 rounded-full bg-[#10b981] border border-white" /> V - Visitado / Listo
        </div>
      </div>

      <MapContainer center={centroInicial} zoom={zoomInicial} zoomControl={false} className="w-full h-full">
        <ControladorVista centro={centroActual} zoom={zoomActual} />
        
        {/* CAPA 1: El satélite (Fondo base, siempre activo) */}
        <TileLayer url={urlSateliteEsri} attribution="Tiles &copy; Esri" />

        {/* CAPA 2: Calles y carreteras (Controlado por el menú) */}
        {mostrarCalles && <TileLayer url={urlCallesEsri} zIndex={10} />}

        {/* CAPA 3: Nombres de lugares y fronteras (Controlado por el menú) */}
        {mostrarLugares && <TileLayer url={urlLugaresEsri} zIndex={11} />}

        <ManejadorClicksMapa activo={enModoTrazado || enModoEdificios} alHacerClick={alRegistrarPuntoTrazado} />

        {/* TRAZADO EN VIVO */}
        {enModoTrazado && puntosTrazadoActual.length > 0 && (
          <>
            {puntosTrazadoActual.map((p, i) => <CircleMarker key={i} center={p} radius={4} pathOptions={{ color: '#fff', fillColor: colorTrazadoActual, fillOpacity: 1, weight: 2 }} />)}
            <Polyline positions={puntosTrazadoActual} pathOptions={{ color: colorTrazadoActual, weight: 3, dashArray: '5, 5' }} />
            {puntosTrazadoActual.length >= 3 && <Polygon positions={puntosTrazadoActual} pathOptions={{ color: colorTrazadoActual, fillColor: colorTrazadoActual, fillOpacity: 0.3, weight: 0 }} />}
          </>
        )}

        {/* TERRITORIOS CON ETIQUETAS DINÁMICAS */}
        {secciones.map((seccion) => {
          const casasDeEstaSeccion = edificios.filter(e => e.seccion_id === seccion.id);
          const totalCasas = casasDeEstaSeccion.length;
          const casasCompletadas = casasDeEstaSeccion.filter(e => e.estado === 'completado').length;
          const porcentaje = totalCasas === 0 ? 0 : Math.round((casasCompletadas / totalCasas) * 100);
          const colorFondo = (porcentaje === 100 && totalCasas > 0) ? 'bg-emerald-500' : 'bg-orange-500';

          return (
            <Polygon key={seccion.id} positions={seccion.coordenadas} pathOptions={{ color: seccion.colorHex, fillColor: seccion.colorHex, fillOpacity: 0.2, weight: 2 }}>
              <Tooltip permanent direction="center" className={`border-0 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-md opacity-90 ${colorFondo}`}>
                {seccion.nombre}
              </Tooltip>
            </Polygon>
          );
        })}

        {/* CASAS / EDIFICIOS SEMBRADOS */}
        {edificios.map((edificio) => {
          const colorEstado = edificio.estado === 'completado' ? '#10b981' : '#f97316';
          return (
            <CircleMarker 
              key={edificio.id} 
              center={[edificio.lat, edificio.lng]} 
              radius={6}
              pathOptions={{ color: '#ffffff', fillColor: colorEstado, fillOpacity: 1, weight: 2 }}
              eventHandlers={{ 
                click: () => { if (!enModoTrazado && !enModoEdificios) alSeleccionarEdificio(edificio); } 
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}