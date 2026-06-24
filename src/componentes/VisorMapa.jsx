// src/componentes/VisorMapa.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Polyline, CircleMarker, Tooltip, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import ManejadorClicksMapa from './ManejadorClicksMapa';
import { LocateFixed } from 'lucide-react'; // <-- IMPORTAMOS EL ICONO DEL GPS
import 'leaflet/dist/leaflet.css';

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

// 3. ★ NUEVO: MOTOR NATIVO DE GPS ★
function RastreadorGPS({ rastreando, setRastreando, setMiUbicacion }) {
  const map = useMap();
  
  useEffect(() => {
    if (rastreando) {
      // Iniciar rastreo continuo con alta precisión (GPS del celular)
      map.locate({ watch: true, enableHighAccuracy: true });
      
      // Volar hacia el usuario SOLO la primera vez que encuentra su señal
      map.once('locationfound', (e) => {
        map.flyTo(e.latlng, 18, { duration: 1.5 });
      });

      // Actualizar el punto azul continuamente si el usuario camina
      map.on('locationfound', (e) => {
        setMiUbicacion(e.latlng);
      });

      // Manejo de errores (Si no da permisos o no tiene GPS)
      map.on('locationerror', (e) => {
        alert("⚠️ No se pudo acceder a tu ubicación. Verifica que el GPS esté encendido y hayas dado permisos al navegador.");
        setRastreando(false);
      });
    } else {
      map.stopLocate();
      setMiUbicacion(null);
    }

    // Limpieza al desmontar o apagar el botón
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
  alSeleccionarTerritorio
}) {
  
  // Motores de Mapas (Google Satélite + Calles Esri Topadas a Zoom 17)
  const urlSateliteGoogle = "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}";
  const urlCallesEsri = "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}";
  const urlLugaresEsri = "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";

  const [zoomReal, setZoomReal] = useState(zoomInicial || 15);
  const mostrarEtiquetas = zoomReal >= 16;

  // ★ NUEVO: ESTADOS PARA EL GPS ★
  const [rastreando, setRastreando] = useState(false);
  const [miUbicacion, setMiUbicacion] = useState(null);

  return (
    <div className={`w-full h-full bg-slate-200 dark:bg-slate-950 relative ${enModoTrazado || enModoEdificios ? 'cursor-crosshair' : ''}`}>
      
      {/* SECCIÓN SUPERIOR DERECHA: LEYENDA + BOTÓN GPS */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-3 pointer-events-none">
        
        {/* LEYENDA (3 COLORES) */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 text-[10px] font-bold flex flex-col gap-2">
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

        {/* ★ BOTÓN GPS FLOTANTE ★ */}
        <button 
          onClick={() => setRastreando(!rastreando)}
          className={`pointer-events-auto self-end p-3 rounded-xl shadow-xl border flex items-center justify-center transition-all active:scale-95 ${
            rastreando 
              ? 'bg-blue-600 text-white border-blue-700' 
              : 'bg-white/90 backdrop-blur-md text-slate-600 border-slate-200 hover:text-blue-600 dark:bg-slate-800/90 dark:text-slate-300 dark:border-slate-700 dark:hover:text-blue-400'
          }`}
          title={rastreando ? "Detener GPS" : "Mi Ubicación"}
        >
          <LocateFixed size={20} />
        </button>

      </div>

      <MapContainer center={centroInicial} zoom={zoomInicial} maxZoom={22} zoomControl={false} className="w-full h-full">
        
        <ZoomControl position="bottomright" />
        <ControladorVistaInteligente centro={centroActual} zoomConfigurado={zoomActual} setZoomActual={setZoomActual} />
        <RastreadorZoom onZoomChange={setZoomReal} />
        
        {/* ★ AQUÍ INYECTAMOS EL MOTOR GPS ★ */}
        <RastreadorGPS rastreando={rastreando} setRastreando={setRastreando} setMiUbicacion={setMiUbicacion} />

        <TileLayer url={urlSateliteGoogle} attribution="&copy; Google Maps" maxNativeZoom={21} maxZoom={22} />
        {mostrarCalles && <TileLayer url={urlCallesEsri} zIndex={10} maxNativeZoom={17} maxZoom={22} />}
        {mostrarLugares && <TileLayer url={urlLugaresEsri} zIndex={11} maxNativeZoom={17} maxZoom={22} />}

        <ManejadorClicksMapa activo={enModoTrazado || enModoEdificios} alHacerClick={alRegistrarPuntoTrazado} />

        {/* DIBUJANDO PUNTO AZUL DEL USUARIO */}
        {miUbicacion && (
          <>
            {/* Halo exterior azul semi-transparente */}
            <CircleMarker center={miUbicacion} radius={18} pathOptions={{ color: 'transparent', fillColor: '#3b82f6', fillOpacity: 0.25 }} />
            {/* Punto interior sólido con borde blanco */}
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
              {mostrarEtiquetas && (
                <Tooltip 
                  key={`etiqueta-${seccion.id}-${porcentaje}`}
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