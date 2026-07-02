// src/componentes/VisorMapa.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Polyline, CircleMarker, Marker, Tooltip, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import L from 'leaflet'; 
import ManejadorClicksMapa from './ManejadorClicksMapa';
import { LocateFixed, Info } from 'lucide-react'; 
import { useAlertas } from '../context/ContextoAlertas';
import 'leaflet/dist/leaflet.css';

const crearPinSVG = (color, opacidad = 1) => `
  <div style="filter: drop-shadow(0px 4px 4px rgba(0,0,0,0.6)); opacity: ${opacidad};">
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="${color}" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3" fill="#ffffff"></circle>
    </svg>
  </div>
`;

const iconoTachuela = L.divIcon({
  html: crearPinSVG('#0891b2'), 
  className: 'bg-transparent border-0',
  iconSize: [36, 36],
  iconAnchor: [18, 36]
});

const iconoTachuelaTemporal = L.divIcon({
  html: crearPinSVG('#06b6d4', 0.6), 
  className: 'bg-transparent border-0',
  iconSize: [36, 36],
  iconAnchor: [18, 36]
});

function RastreadorZoom({ onZoomChange }) {
  const map = useMapEvents({ zoomend: () => onZoomChange(map.getZoom()) });
  return null;
}

function ControladorVistaInteligente({ centro, zoomConfigurado, setZoomActual }) {
  const map = useMap();
  useEffect(() => {
    if (centro) { map.flyTo(centro, zoomConfigurado, { duration: 1.5 }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centro]); 

  useEffect(() => {
    const handleZoomEnd = () => setZoomActual(map.getZoom());
    map.on('zoomend', handleZoomEnd);
    return () => map.off('zoomend', handleZoomEnd);
  }, [map, setZoomActual]);

  return null;
}

function RastreadorGPS({ rastreando, setRastreando, setMiUbicacion }) {
  const map = useMap();
  const { mostrarAlerta } = useAlertas(); 
  
  useEffect(() => {
    if (rastreando) {
      map.locate({ watch: true, enableHighAccuracy: true });
      map.once('locationfound', (e) => map.flyTo(e.latlng, 18, { duration: 1.5 }));
      map.on('locationfound', (e) => setMiUbicacion(e.latlng));
      map.on('locationerror', (e) => {
        mostrarAlerta("GPS no disponible", "⚠️ No se pudo acceder a tu ubicación. Verifica que el GPS esté encendido y tenga permisos.", "warning");
        setRastreando(false);
      });
    } else {
      map.stopLocate();
      setMiUbicacion(null);
    }
    return () => { map.stopLocate(); map.off('locationfound'); map.off('locationerror'); };
  }, [rastreando, map, setMiUbicacion, mostrarAlerta]);
  return null;
}

export default function VisorMapa({ 
  centroInicial, zoomInicial, centroActual, zoomActual, setZoomActual,
  secciones, edificios, alSeleccionarEdificio, enModoTrazado, enModoEdificios, 
  puntosTrazadoActual, colorTrazadoActual, alRegistrarPuntoTrazado,
  mostrarCalles, mostrarLugares, alSeleccionarTerritorio, marcadoresPersonales = [], 
  alSeleccionarRevisita, marcadorTemporal, enModoTachuela = false, tachuelasGrupales = [],
  alSeleccionarTachuela, tachuelaTemporal, estiloMapa, alCambiarEstiloMapa
}) {
  
  
  const urlSateliteHibrido = "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"; // "y" = Híbrido
  const urlSatelitePuro = "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}";    // "s" = Solo satélite
  const urlCallesBeige = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";
  const urlGrisConCalles = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"; // Mapa gris moderno
  const urlOscuroCarto = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";


  const urlCallesEsri = "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}";
  const urlLugaresEsri = "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";

  const [zoomReal, setZoomReal] = useState(zoomInicial || 15);
  
  const mostrarEtiquetasZoom = zoomReal >= 15;
  const mostrarCasasZoom = zoomReal >= 16;
  
  const [rastreando, setRastreando] = useState(false);
  const [mostrarLeyenda, setMostrarLeyenda] = useState(true);
  const [miUbicacion, setMiUbicacion] = useState(null);

  const mapaActivoClics = enModoTrazado || enModoEdificios || !!marcadorTemporal || (alSeleccionarRevisita !== undefined) || enModoTachuela;

  // ★ LÓGICA DINÁMICA: Determinamos qué URL usar como fondo base
  let urlFondoActivo = urlSateliteHibrido; // Por defecto
  
  if (estiloMapa === 'satelite_puro') urlFondoActivo = urlSatelitePuro;
  if (estiloMapa === 'calles') urlFondoActivo = urlCallesBeige;
  if (estiloMapa === 'gris') urlFondoActivo = urlGrisConCalles;
  if (estiloMapa === 'oscuro') urlFondoActivo = urlOscuroCarto;

  useEffect(() => {
    const timer = setTimeout(() => {
      setMostrarLeyenda(false); 
    }, 7000);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className={`w-full h-full bg-slate-200 dark:bg-slate-950 relative ${mapaActivoClics ? 'cursor-crosshair' : ''}`}>
      
      <style>{`
        .leaflet-bottom.leaflet-right {
          margin-bottom: 0.75rem !important;
          margin-right: 0.5rem !important;
        }
      `}</style>

      <div className="absolute top-4 right-4 z-[1000] flex flex-col items-end gap-2 pointer-events-none">
        
        <div className="flex flex-col gap-2 pointer-events-auto">
          <button 
            onClick={() => setRastreando(!rastreando)}
            className={`p-2.5 rounded-xl shadow-xl border flex items-center justify-center transition-all active:scale-95 ${
              rastreando 
                ? 'bg-blue-600 text-white border-blue-700' 
                : 'bg-white/90 backdrop-blur-md text-slate-600 border-slate-200 hover:text-blue-600 dark:bg-slate-800/90 dark:text-slate-300 dark:border-slate-700 dark:hover:text-blue-400'
            }`}
            title={rastreando ? "Detener GPS" : "Mi Ubicación"}
          >
            <LocateFixed size={18} />
          </button>

          <button 
            onClick={() => setMostrarLeyenda(!mostrarLeyenda)}
            className={`p-2.5 rounded-xl shadow-xl border flex items-center justify-center transition-all active:scale-95 ${
              mostrarLeyenda 
                ? 'bg-indigo-600 text-white border-indigo-700' 
                : 'bg-white/90 backdrop-blur-md text-slate-600 border-slate-200 hover:text-indigo-600 dark:bg-slate-800/90 dark:text-slate-300 dark:border-slate-700 dark:hover:text-indigo-400'
            }`}
            title="Significado de los Colores"
          >
            <Info size={18} />
          </button>
        </div>

        {mostrarLeyenda && (
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 text-[10px] font-bold flex flex-col gap-2.5 pointer-events-auto animate-slide-up origin-top-right mt-1">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <div className="w-3.5 h-3.5 rounded-full bg-[#f97316] border border-white shadow-sm" /> F - Faltante
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <div className="w-3.5 h-3.5 rounded-full bg-[#e11d48] border border-white shadow-sm" /> A - Alerta / No Visitar
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <div className="w-3.5 h-3.5 rounded-full bg-[#10b981] border border-white shadow-sm" /> V - Visitado / Listo
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 mt-1 pt-2 border-t border-slate-200 dark:border-slate-700">
              <div className="w-3.5 h-3.5 rounded-full bg-[#8b5cf6] border border-white shadow-sm" /> Mi Revisita
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#0891b2" stroke="#ffffff" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3" fill="#ffffff"></circle>
              </svg> 
              Aviso Grupal
            </div>
          </div>
        )}
      </div>

      <MapContainer center={centroInicial} zoom={zoomInicial} minZoom={4} maxZoom={22} zoomControl={false} preferCanvas={true} className="w-full h-full">
        
        <ZoomControl position="bottomright" />
        <ControladorVistaInteligente centro={centroActual} zoomConfigurado={zoomActual} setZoomActual={setZoomActual} />
        <RastreadorZoom onZoomChange={setZoomReal} />
        
        <RastreadorGPS rastreando={rastreando} setRastreando={setRastreando} setMiUbicacion={setMiUbicacion} />

        {/* ★ EL SECRETO ESTÁ AQUÍ: Le agregamos key={urlFondoActivo} */}
        <TileLayer key={urlFondoActivo} url={urlFondoActivo} attribution="PredicaMap" maxNativeZoom={21} maxZoom={22} />
        
        {mostrarCalles && <TileLayer url={urlCallesEsri} zIndex={10} maxNativeZoom={20} maxZoom={22} />}
        {mostrarLugares && <TileLayer url={urlLugaresEsri} zIndex={11} maxNativeZoom={20} maxZoom={22} />}

        <ManejadorClicksMapa activo={mapaActivoClics} alHacerClick={alRegistrarPuntoTrazado} />

        {miUbicacion && (
          <>
            <CircleMarker center={miUbicacion} radius={18} pathOptions={{ color: 'transparent', fillColor: '#3b82f6', fillOpacity: 0.25 }} />
            <CircleMarker center={miUbicacion} radius={6} pathOptions={{ color: '#ffffff', fillColor: '#3b82f6', fillOpacity: 1, weight: 2.5 }} />
          </>
        )}

        {enModoTrazado && puntosTrazadoActual.length > 0 && (
          <>
            {puntosTrazadoActual.map((p, i) => <CircleMarker key={i} center={p} radius={4} pathOptions={{ color: '#fff', fillColor: colorTrazadoActual, fillOpacity: 1, weight: 2 }} />)}
            <Polyline positions={puntosTrazadoActual} pathOptions={{ color: colorTrazadoActual, weight: 3, dashArray: '5, 5' }} />
            {puntosTrazadoActual.length >= 3 && <Polygon positions={puntosTrazadoActual} pathOptions={{ color: colorTrazadoActual, fillColor: colorTrazadoActual, fillOpacity: 0.3, weight: 0 }} />}
          </>
        )}

        {tachuelasGrupales.map((tachuela) => (
          <Marker 
            key={tachuela.id} 
            position={[tachuela.lat, tachuela.lng]} 
            icon={iconoTachuela}
            eventHandlers={{ 
              click: (e) => { 
                e.originalEvent.stopPropagation(); 
                if (!enModoTrazado && !enModoTachuela && alSeleccionarTachuela) alSeleccionarTachuela(tachuela); 
              } 
            }}
          />
        ))}

        {tachuelaTemporal && <Marker position={[tachuelaTemporal.lat, tachuelaTemporal.lng]} icon={iconoTachuelaTemporal} />}

        {mostrarCasasZoom && marcadoresPersonales.map((pin) => (
          <CircleMarker 
            key={pin.id} 
            center={[pin.lat, pin.lng]} 
            radius={7.5}
            pathOptions={{ color: '#ffffff', fillColor: '#8b5cf6', fillOpacity: 1, weight: 2 }}
            eventHandlers={{ 
              click: (e) => { 
                e.originalEvent.stopPropagation(); 
                if (!enModoTrazado && alSeleccionarRevisita) alSeleccionarRevisita(pin); 
              } 
            }}
          />
        ))}

        {marcadorTemporal && <CircleMarker center={[marcadorTemporal.lat, marcadorTemporal.lng]} radius={8} pathOptions={{ color: '#ffffff', fillColor: '#c084fc', fillOpacity: 0.8, weight: 3, dashArray: '4' }} />}

        {secciones.map((seccion) => {
          const casasDeEstaSeccion = edificios.filter(e => e.seccion_id === seccion.id);
          const totalCasas = casasDeEstaSeccion.length;
          const completadas = casasDeEstaSeccion.filter(e => e.estado === 'completado').length;
          
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
              {mostrarEtiquetasZoom && (
                <Tooltip 
                  key={`etiqueta-${seccion.id}-${porcentaje}`}
                  permanent 
                  interactive 
                  direction="center" 
                  className={`border-0 text-white font-bold text-[10px] px-2.5 py-1 rounded-full shadow-md opacity-90 cursor-pointer hover:scale-110 transition-transform ${claseColorEtiqueta}`}
                  eventHandlers={{
                    click: (e) => {
                      e.originalEvent.stopPropagation(); 
                      if (!enModoTrazado && !enModoEdificios && !enModoTachuela && alSeleccionarTerritorio) {
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

        {mostrarCasasZoom && edificios.map((edificio) => {
          let colorEstado = '#f97316'; 
          if (edificio.estado === 'completado') colorEstado = '#10b981'; 
          if (edificio.estado === 'no_responde') colorEstado = '#e11d48'; 
          
          const esCalle = edificio.tipo_edificio === 'calle';

          return (
            <CircleMarker 
              key={edificio.id} 
              center={[edificio.lat, edificio.lng]} 
              radius={esCalle ? 8 : 6}
              pathOptions={{ 
                color: '#ffffff', 
                fillColor: colorEstado, 
                fillOpacity: esCalle ? 0.7 : 1, 
                weight: esCalle ? 2.5 : 2,
                dashArray: esCalle ? '3, 4' : null 
              }}
              eventHandlers={{ 
                click: () => { if (!enModoTrazado && !enModoEdificios && !enModoTachuela) alSeleccionarEdificio(edificio); } 
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}