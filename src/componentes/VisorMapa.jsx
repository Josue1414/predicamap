// src/componentes/VisorMapa.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Polyline, CircleMarker, Marker, Tooltip, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import L from 'leaflet'; // <-- IMPORTAMOS LEAFLET PARA CREAR EL ICONO
import ManejadorClicksMapa from './ManejadorClicksMapa';
import { LocateFixed, Info } from 'lucide-react'; // <-- IMPORTAMOS EL ICONO INFO Y GPS
import 'leaflet/dist/leaflet.css';

// ★ CONFIGURACIÓN DE ICONOS SVG PARA TACHUELAS (Anclaje perfecto y alto contraste) ★
const crearPinSVG = (color, opacidad = 1) => `
  <div style="filter: drop-shadow(0px 4px 4px rgba(0,0,0,0.6)); opacity: ${opacidad};">
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="${color}" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3" fill="#ffffff"></circle>
    </svg>
  </div>
`;

// iconAnchor: [18, 36] clava la punta inferior exactamente en la lat/lng
const iconoTachuela = L.divIcon({
  html: crearPinSVG('#0891b2'), // Cyan brillante
  className: 'bg-transparent border-0',
  iconSize: [36, 36],
  iconAnchor: [18, 36]
});

const iconoTachuelaTemporal = L.divIcon({
  html: crearPinSVG('#06b6d4', 0.6), // Cyan ligeramente más claro y semi-transparente
  className: 'bg-transparent border-0',
  iconSize: [36, 36],
  iconAnchor: [18, 36]
});

// 1. Rastreador invisible para el nivel de zoom
function RastreadorZoom({ onZoomChange }) {
  const map = useMapEvents({
    zoomend: () => onZoomChange(map.getZoom()),
  });
  return null;
}

// 2. Controlador de Vuelo Inteligente
function ControladorVistaInteligente({ centro, zoomConfigurado, setZoomActual }) {
  const map = useMap();

  useEffect(() => {
    if (centro) {
      map.flyTo(centro, zoomConfigurado, { duration: 1.5 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centro]); 

  useEffect(() => {
    const handleZoomEnd = () => setZoomActual(map.getZoom());
    map.on('zoomend', handleZoomEnd);
    return () => map.off('zoomend', handleZoomEnd);
  }, [map, setZoomActual]);

  return null;
}

// 3. MOTOR NATIVO DE GPS
function RastreadorGPS({ rastreando, setRastreando, setMiUbicacion }) {
  const map = useMap();
  
  useEffect(() => {
    if (rastreando) {
      map.locate({ watch: true, enableHighAccuracy: true });
      
      map.once('locationfound', (e) => {
        map.flyTo(e.latlng, 18, { duration: 1.5 });
      });

      map.on('locationfound', (e) => {
        setMiUbicacion(e.latlng);
      });

      map.on('locationerror', (e) => {
        alert("⚠️ No se pudo acceder a tu ubicación. Verifica que el GPS esté encendido y hayas dado permisos al navegador.");
        setRastreando(false);
      });
    } else {
      map.stopLocate();
      setMiUbicacion(null);
    }

    return () => {
      map.stopLocate();
      map.off('locationfound');
      map.off('locationerror');
    };
  }, [rastreando, map, setMiUbicacion]);

  return null;
}

export default function VisorMapa({ 
  centroInicial, zoomInicial, centroActual, zoomActual, setZoomActual,
  secciones, edificios, alSeleccionarEdificio,
  enModoTrazado, enModoEdificios, 
  puntosTrazadoActual, colorTrazadoActual, alRegistrarPuntoTrazado,
  mostrarCalles, mostrarLugares,
  alSeleccionarTerritorio,
  marcadoresPersonales = [], 
  alSeleccionarRevisita, 
  marcadorTemporal,
  // ★ NUEVAS PROPS: TACHUELAS GRUPALES ★
  enModoTachuela = false,
  tachuelasGrupales = [],
  alSeleccionarTachuela,
  tachuelaTemporal
}) {
  
  // Motores de Mapas
  const urlSateliteGoogle = "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}";
  const urlCallesEsri = "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}";
  const urlLugaresEsri = "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";

  const [zoomReal, setZoomReal] = useState(zoomInicial || 15);
  
  // Controla Títulos, Casas y Revisitas (Las tachuelas las dejamos siempre visibles para ubicarse desde lejos)
  const mostrarDetallesZoom = zoomReal >= 16;

  // Estados
  const [rastreando, setRastreando] = useState(false);
  const [miUbicacion, setMiUbicacion] = useState(null);
  
  // Estado para ocultar/mostrar la leyenda de colores
  const [mostrarLeyenda, setMostrarLeyenda] = useState(false);

  // Determinar si el mapa está esperando un clic
  const mapaActivoClics = enModoTrazado || enModoEdificios || !!marcadorTemporal || (alSeleccionarRevisita !== undefined) || enModoTachuela;

  return (
    <div className={`w-full h-full bg-slate-200 dark:bg-slate-950 relative ${mapaActivoClics ? 'cursor-crosshair' : ''}`}>
      
      {/* SECCIÓN SUPERIOR DERECHA: BOTONES Y LEYENDA */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col items-end gap-3 pointer-events-none">
        
        {/* BOTONERÍA FLOTANTE */}
        <div className="flex gap-2 pointer-events-auto">
          {/* BOTÓN LEYENDA */}
          <button 
            onClick={() => setMostrarLeyenda(!mostrarLeyenda)}
            className={`p-3 rounded-xl shadow-xl border flex items-center justify-center transition-all active:scale-95 ${
              mostrarLeyenda 
                ? 'bg-indigo-600 text-white border-indigo-700' 
                : 'bg-white/90 backdrop-blur-md text-slate-600 border-slate-200 hover:text-indigo-600 dark:bg-slate-800/90 dark:text-slate-300 dark:border-slate-700 dark:hover:text-indigo-400'
            }`}
            title="Significado de los Colores"
          >
            <Info size={20} />
          </button>

          {/* BOTÓN GPS */}
          <button 
            onClick={() => setRastreando(!rastreando)}
            className={`p-3 rounded-xl shadow-xl border flex items-center justify-center transition-all active:scale-95 ${
              rastreando 
                ? 'bg-blue-600 text-white border-blue-700' 
                : 'bg-white/90 backdrop-blur-md text-slate-600 border-slate-200 hover:text-blue-600 dark:bg-slate-800/90 dark:text-slate-300 dark:border-slate-700 dark:hover:text-blue-400'
            }`}
            title={rastreando ? "Detener GPS" : "Mi Ubicación"}
          >
            <LocateFixed size={20} />
          </button>
        </div>

        {/* LEYENDA (Se muestra u oculta al tocar el botón de Info) */}
        {mostrarLeyenda && (
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3.5 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 text-[10px] font-bold flex flex-col gap-2.5 pointer-events-auto animate-slide-up origin-top-right">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <div className="w-3.5 h-3.5 rounded-full bg-[#f97316] border border-white shadow-sm" /> F - Faltante / Pendiente
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <div className="w-3.5 h-3.5 rounded-full bg-[#e11d48] border border-white shadow-sm" /> A - Alerta / No Visitar
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <div className="w-3.5 h-3.5 rounded-full bg-[#10b981] border border-white shadow-sm" /> V - Visitado / Listo
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 mt-1 pt-2 border-t border-slate-200 dark:border-slate-700">
              <div className="w-3.5 h-3.5 rounded-full bg-[#8b5cf6] border border-white shadow-sm" /> Mi Revisita Personal
            </div>
            {/* ★ NUEVO: INDICADOR TACHUELA GRUPAL CON SVG ★ */}
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#0891b2" stroke="#ffffff" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3" fill="#ffffff"></circle>
              </svg> 
              Aviso / Tachuela Grupal
            </div>
          </div>
        )}

      </div>

      {/* ★ CORRECCIÓN: Agregamos minZoom={4} para que el botón "-" de alejar siempre aparezca desde el inicio ★ */}
      <MapContainer center={centroInicial} zoom={zoomInicial} minZoom={4} maxZoom={22} zoomControl={false} className="w-full h-full">
        
        <ZoomControl position="bottomright" />
        <ControladorVistaInteligente centro={centroActual} zoomConfigurado={zoomActual} setZoomActual={setZoomActual} />
        <RastreadorZoom onZoomChange={setZoomReal} />
        
        <RastreadorGPS rastreando={rastreando} setRastreando={setRastreando} setMiUbicacion={setMiUbicacion} />

        <TileLayer url={urlSateliteGoogle} attribution="© Google Maps" maxNativeZoom={21} maxZoom={22} />
        {mostrarCalles && <TileLayer url={urlCallesEsri} zIndex={10} maxNativeZoom={20} maxZoom={22} />}
        {mostrarLugares && <TileLayer url={urlLugaresEsri} zIndex={11} maxNativeZoom={20} maxZoom={22} />}

        {/* ★ CLICS HABILITADOS TAMBIÉN PARA MODO TACHUELA ★ */}
        <ManejadorClicksMapa activo={mapaActivoClics} alHacerClick={alRegistrarPuntoTrazado} />

        {/* DIBUJANDO PUNTO AZUL DEL USUARIO (GPS) */}
        {miUbicacion && (
          <>
            <CircleMarker center={miUbicacion} radius={18} pathOptions={{ color: 'transparent', fillColor: '#3b82f6', fillOpacity: 0.25 }} />
            <CircleMarker center={miUbicacion} radius={6} pathOptions={{ color: '#ffffff', fillColor: '#3b82f6', fillOpacity: 1, weight: 2.5 }} />
          </>
        )}

        {/* TRAZADO EN VIVO */}
        {enModoTrazado && puntosTrazadoActual.length > 0 && (
          <>
            {puntosTrazadoActual.map((p, i) => <CircleMarker key={i} center={p} radius={4} pathOptions={{ color: '#fff', fillColor: colorTrazadoActual, fillOpacity: 1, weight: 2 }} />)}
            <Polyline positions={puntosTrazadoActual} pathOptions={{ color: colorTrazadoActual, weight: 3, dashArray: '5, 5' }} />
            {puntosTrazadoActual.length >= 3 && <Polygon positions={puntosTrazadoActual} pathOptions={{ color: colorTrazadoActual, fillColor: colorTrazadoActual, fillOpacity: 0.3, weight: 0 }} />}
          </>
        )}

        {/* ★ TACHUELAS GRUPALES (Siempre visibles para fácil ubicación) ★ */}
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

        {/* ★ TACHUELA TEMPORAL (Durante la creación) ★ */}
        {tachuelaTemporal && (
          <Marker 
            position={[tachuelaTemporal.lat, tachuelaTemporal.lng]} 
            icon={iconoTachuelaTemporal} 
          />
        )}

        {/* PINES DE REVISITAS PERSONALES */}
        {mostrarDetallesZoom && marcadoresPersonales.map((pin) => (
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

        {/* PIN TEMPORAL REVISITAS */}
        {marcadorTemporal && (
          <CircleMarker 
            center={[marcadorTemporal.lat, marcadorTemporal.lng]} 
            radius={8} 
            pathOptions={{ color: '#ffffff', fillColor: '#c084fc', fillOpacity: 0.8, weight: 3, dashArray: '4' }} 
          />
        )}

        {/* TERRITORIOS (SOMBRAS) Y ETIQUETAS */}
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
              {/* LOS TÍTULOS SOLO APARECEN CUANDO SE ACERCA LA CÁMARA */}
              {mostrarDetallesZoom && (
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

        {/* PUNTOS DE CASAS: AHORA ENVUELTOS PARA OCULTARSE AL ALEJARSE */}
        {mostrarDetallesZoom && edificios.map((edificio) => {
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
                click: () => { if (!enModoTrazado && !enModoEdificios && !enModoTachuela) alSeleccionarEdificio(edificio); } 
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}