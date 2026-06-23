// src/componentes/VisorMapa.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Polyline, CircleMarker, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import ManejadorClicksMapa from './ManejadorClicksMapa';
import 'leaflet/dist/leaflet.css';

// 1. Rastreador invisible para el nivel de zoom en tiempo real
function RastreadorZoom({ onZoomChange }) {
  const map = useMapEvents({
    zoomend: () => onZoomChange(map.getZoom()),
  });
  return null;
}

// 2. Controlador de Vuelo Inteligente (Evita que el mapa brinque al guardar casas)
function ControladorVistaInteligente({ centro, zoomConfigurado, setZoomActual }) {
  const map = useMap();

  // Solo mueve la cámara cuando CAMBIA la ciudad o le das a "Volar al Territorio"
  useEffect(() => {
    if (centro) {
      // flyTo hace una animación fluida como un dron
      map.flyTo(centro, zoomConfigurado, { duration: 1.5 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centro]); // Se ejecuta SOLO cuando cambian las coordenadas, no cuando guardas.

  // Guarda en el sistema el zoom que hagas con los dedos
  useEffect(() => {
    const handleZoomEnd = () => setZoomActual(map.getZoom());
    map.on('zoomend', handleZoomEnd);
    return () => map.off('zoomend', handleZoomEnd);
  }, [map, setZoomActual]);

  return null;
}

export default function VisorMapa({ 
  centroInicial, zoomInicial, centroActual, zoomActual, setZoomActual,
  secciones, edificios, alSeleccionarEdificio,
  enModoTrazado, enModoEdificios, 
  puntosTrazadoActual, colorTrazadoActual, alRegistrarPuntoTrazado,
  mostrarCalles, mostrarLugares,
  alSeleccionarTerritorio
}) {
  const urlSateliteEsri = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  const urlCallesEsri = "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}";
  const urlLugaresEsri = "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";

  const [zoomReal, setZoomReal] = useState(zoomInicial || 15);
  
  // Condición estricta: Los títulos SOLO se ven de muy de cerca (Zoom 16 o más)
  const mostrarEtiquetas = zoomReal >= 16;

  return (
    <div className={`w-full h-full bg-slate-200 dark:bg-slate-950 relative ${enModoTrazado || enModoEdificios ? 'cursor-crosshair' : ''}`}>
      
      {/* LEYENDA (3 COLORES) */}
      <div className="absolute top-4 right-4 z-[1000] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 text-[10px] font-bold flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
          <div className="w-3 h-3 rounded-full bg-[#f97316] border border-white shadow-sm" /> F - Faltante / Pendiente
        </div>
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
          <div className="w-3 h-3 rounded-full bg-[#e11d48] border border-white shadow-sm" /> A - Alerta / No Visitar
        </div>
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
          <div className="w-3 h-3 rounded-full bg-[#10b981] border border-white shadow-sm" /> V - Visitado / Listo
        </div>
      </div>

      {/* AGREGAMOS maxZoom=22 PARA PERMITIR ACERCARSE MUCHO */}
      <MapContainer center={centroInicial} zoom={zoomInicial} maxZoom={22} zoomControl={false} className="w-full h-full">
        
        <ControladorVistaInteligente centro={centroActual} zoomConfigurado={zoomActual} setZoomActual={setZoomActual} />
        <RastreadorZoom onZoomChange={setZoomReal} />
        
        {/* maxNativeZoom=19 EVITA QUE DESAPAREZCAN LAS CALLES AL ACERCARSE DE MÁS */}
        <TileLayer url={urlSateliteEsri} attribution="Tiles &copy; Esri" maxNativeZoom={19} maxZoom={22} />
        {mostrarCalles && <TileLayer url={urlCallesEsri} zIndex={10} maxNativeZoom={19} maxZoom={22} />}
        {mostrarLugares && <TileLayer url={urlLugaresEsri} zIndex={11} maxNativeZoom={19} maxZoom={22} />}

        <ManejadorClicksMapa activo={enModoTrazado || enModoEdificios} alHacerClick={alRegistrarPuntoTrazado} />

        {/* TRAZADO EN VIVO */}
        {enModoTrazado && puntosTrazadoActual.length > 0 && (
          <>
            {puntosTrazadoActual.map((p, i) => <CircleMarker key={i} center={p} radius={4} pathOptions={{ color: '#fff', fillColor: colorTrazadoActual, fillOpacity: 1, weight: 2 }} />)}
            <Polyline positions={puntosTrazadoActual} pathOptions={{ color: colorTrazadoActual, weight: 3, dashArray: '5, 5' }} />
            {puntosTrazadoActual.length >= 3 && <Polygon positions={puntosTrazadoActual} pathOptions={{ color: colorTrazadoActual, fillColor: colorTrazadoActual, fillOpacity: 0.3, weight: 0 }} />}
          </>
        )}

        {/* TERRITORIOS (SOMBRAS) Y ETIQUETAS */}
        {secciones.map((seccion) => {
          const casasDeEstaSeccion = edificios.filter(e => e.seccion_id === seccion.id);
          const totalCasas = casasDeEstaSeccion.length;
          const completadas = casasDeEstaSeccion.filter(e => e.estado === 'completado').length;
          
          // Lógica corregida para territorios vacíos
          let porcentaje = 0;
          if (totalCasas > 0) {
            porcentaje = Math.round((completadas / totalCasas) * 100);
          } else {
            porcentaje = seccion.estado === 'completado' ? 100 : 0;
          }
          
          const claseColorEtiqueta = porcentaje === 100 ? '!bg-emerald-500' : '!bg-orange-500';

          return (
            <Polygon 
              key={seccion.id} 
              positions={seccion.coordenadas} 
              pathOptions={{ color: seccion.colorHex, fillColor: seccion.colorHex, fillOpacity: 0.2, weight: 2 }}
            >
              {mostrarEtiquetas && (
                <Tooltip 
                  key={`etiqueta-${seccion.id}-${porcentaje}`} // <-- MAGIA: ESTO FUERZA A RE-PINTAR EL COLOR AL INSTANTE
                  permanent 
                  interactive 
                  direction="center" 
                  className={`border-0 text-white font-bold text-[10px] px-2.5 py-1 rounded-full shadow-md opacity-90 cursor-pointer hover:scale-110 transition-transform ${claseColorEtiqueta}`}
                  eventHandlers={{
                    click: (e) => {
                      e.originalEvent.stopPropagation(); 
                      if (!enModoTrazado && !enModoEdificios && alSeleccionarTerritorio) {
                        alSeleccionarTerritorio(seccion);
                      }
                    }
                  }}
                >
                  {seccion.nombre}
                </Tooltip>
              )}
            </Polygon>
          );
        })}

        {/* PUNTOS DE CASAS */}
        {edificios.map((edificio) => {
          let colorEstado = '#f97316'; 
          if (edificio.estado === 'completado') colorEstado = '#10b981'; 
          if (edificio.estado === 'no_responde') colorEstado = '#e11d48'; 

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