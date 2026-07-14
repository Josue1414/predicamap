import React, { useState, useEffect, useMemo, useRef } from 'react';
import Map, { NavigationControl, GeolocateControl, Marker, Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Info, LocateFixed } from 'lucide-react';
import { useAlertas } from '../context/ContextoAlertas';

// 👇👇👇 ZONA DE AJUSTES MANUALES DE ELEMENTOS 👇👇👇
const ZOOM_MOSTRAR_ETIQUETAS = 14; 
const ZOOM_MOSTRAR_CASAS = 16;     
const ZOOM_MOSTRAR_TACHUELAS = 14; 
// 👆👆👆 ===================================== 👆👆👆

// 👇👇👇 ZONA DE AJUSTES MANUALES PARA EL VUELO CINEMÁTICO 👇👇👇
const ZOOM_INICIO_VUELO = 5;  // Zoom inicial al abrir la app (5 se ve el país, 10 el estado...)
const ZOOM_FIN_VUELO = 17;    // Zoom final cuando aterriza en el territorio a predicar
const DURACION_VUELO = 3500;  // Tiempo de la animación en milisegundos (3500 = 3.5 segundos)
// 👆👆👆 =================================================== 👆👆👆

const crearPinSVG = (color, opacidad = 1) => `
  <div style="filter: drop-shadow(0px 4px 4px rgba(0,0,0,0.6)); opacity: ${opacidad};">
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="${color}" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3" fill="#ffffff"></circle>
    </svg>
  </div>
`;

const obtenerCentroPoligono = (coordenadas) => {
  if (!coordenadas || coordenadas.length === 0) return [0, 0];
  let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
  coordenadas.forEach(([lat, lng]) => {
    if (lat < minLat) minLat = lat; if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng; if (lng > maxLng) maxLng = lng;
  });
  return [(minLat + maxLat) / 2, (minLng + maxLng) / 2];
};

export default function VisorMapa({ 
  centroInicial, zoomInicial, centroActual, zoomActual, setZoomActual,
  secciones, edificios, alSeleccionarEdificio, enModoTrazado, enModoEdificios, 
  puntosTrazadoActual, colorTrazadoActual, alRegistrarPuntoTrazado,
  mostrarCalles, mostrarLugares, alSeleccionarTerritorio, marcadoresPersonales = [], 
  alSeleccionarRevisita, marcadorTemporal, enModoTachuela = false, tachuelasGrupales = [],
  alSeleccionarTachuela, tachuelaTemporal, estiloMapa
}) {
  const { mostrarAlerta } = useAlertas();
  const mapRef = useRef(null);
  
  const [zoomLocal, setZoomLocal] = useState(zoomInicial || ZOOM_INICIO_VUELO);
  const [mostrarLeyenda, setMostrarLeyenda] = useState(true);

  const [rastreando, setRastreando] = useState(false);
  const [miUbicacion, setMiUbicacion] = useState(null);
  
  // Estados para controlar que nada interrumpa el vuelo principal
  const [mapaCargado, setMapaCargado] = useState(false);
  const [permitirVuelosSecundarios, setPermitirVuelosSecundarios] = useState(false);

  const hasFlownGPS = useRef(false);
  const hasFlownInitial = useRef(false);

  const mapaActivoClics = enModoTrazado || enModoEdificios || !!marcadorTemporal || (alSeleccionarRevisita !== undefined) || enModoTachuela;

  useEffect(() => {
    const timer = setTimeout(() => setMostrarLeyenda(false), 7000);
    return () => clearTimeout(timer);
  }, []);

  // VUELO INICIAL CINEMÁTICO 
  useEffect(() => {
    // Validamos que el mapa ya esté visible, que tengamos territorios, y que no haya volado antes.
    if (!mapaCargado || hasFlownInitial.current || !mapRef.current || !secciones || secciones.length === 0) return;

    let territorioDestino = null;

    for (let i = 0; i < secciones.length; i++) {
      const sec = secciones[i];
      const casasDelTerritorio = edificios.filter(e => e.seccion_id === sec.id);
      const totalCasas = casasDelTerritorio.filter(e => e.estado !== 'no_responde').length;
      const casasCompletadas = casasDelTerritorio.filter(e => e.estado === 'completado').length;

      let estaCompleto = false;
      if (totalCasas > 0) {
        estaCompleto = (casasCompletadas === totalCasas);
      } else {
        estaCompleto = (sec.estado === 'completado');
      }

      if (!estaCompleto) {
        territorioDestino = sec;
        break; 
      }
    }

    if (!territorioDestino && secciones.length > 0) {
      territorioDestino = secciones[0];
    }

    if (territorioDestino) {
      const centro = obtenerCentroPoligono(territorioDestino.coordenadas);
      if (centro[0] !== 0 && centro[1] !== 0) {
        
        mapRef.current.flyTo({
          center: [centro[1], centro[0]],
          zoom: ZOOM_FIN_VUELO, 
          duration: DURACION_VUELO, 
          essential: true
        });
        hasFlownInitial.current = true;

        // Bloqueamos interrupciones del menú lateral hasta que termine la animación
        setTimeout(() => {
          setPermitirVuelosSecundarios(true);
        }, DURACION_VUELO + 500);
      }
    }
  }, [secciones, edificios, mapaCargado]); 

  // VUELOS DESDE EL MENÚ LATERAL
  useEffect(() => {
    // Solo permitimos saltos de cámara por clics del usuario si ya acabó la intro
    if (centroActual && mapRef.current && permitirVuelosSecundarios) {
      
      // 🛑 SOLUCIÓN AL BUG: Si el centroActual es igual al centro inicial (Todo México),
      // significa que es el valor por defecto y el usuario NO ha hecho clic en el menú. Ignoramos este vuelo.
      if (centroActual[0] === centroInicial[0] && centroActual[1] === centroInicial[1]) {
        return;
      }

      mapRef.current.flyTo({
        center: [centroActual[1], centroActual[0]],
        zoom: zoomActual || ZOOM_FIN_VUELO,
        duration: 1500,
        essential: true
      });
    }
  }, [centroActual, permitirVuelosSecundarios, zoomActual, centroInicial]); 

  useEffect(() => {
    let watchId;
    if (rastreando) {
      if ("geolocation" in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            setMiUbicacion([latitude, longitude]);
            if (!hasFlownGPS.current && mapRef.current) {
              mapRef.current.flyTo({ center: [longitude, latitude], zoom: 18, duration: 1500 });
              hasFlownGPS.current = true;
            }
          },
          (err) => {
            mostrarAlerta("GPS no disponible", "⚠️ Verifica que el GPS esté encendido y Chrome/Safari tenga permisos.", "warning");
            setRastreando(false);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        mostrarAlerta("Error", "Tu dispositivo no soporta geolocalización.", "danger");
        setRastreando(false);
      }
    } else {
      setMiUbicacion(null);
      hasFlownGPS.current = false;
    }
    return () => { if (watchId) navigator.geolocation.clearWatch(watchId); };
  }, [rastreando, mostrarAlerta]);

  const mapStyleJSON = useMemo(() => {
    let urlFondoActivo = "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"; 
    if (estiloMapa === 'satelite_hibrido') urlFondoActivo = "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}";
    if (estiloMapa === 'calles') urlFondoActivo = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";
    if (estiloMapa === 'gris') urlFondoActivo = "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png";
    if (estiloMapa === 'oscuro') urlFondoActivo = "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png";

    const style = {
      version: 8,
      sources: {
        'fondo-base': { type: 'raster', tiles: [urlFondoActivo], tileSize: 256, attribution: 'PredicaMap' }
      },
      layers: [{ id: 'capa-fondo', type: 'raster', source: 'fondo-base', minzoom: 0, maxzoom: 22 }]
    };

    if (mostrarCalles) {
      style.sources['calles-esri'] = { type: 'raster', tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"], tileSize: 256 };
      style.layers.push({ id: 'capa-calles', type: 'raster', source: 'calles-esri' });
    }
    if (mostrarLugares) {
      style.sources['lugares-esri'] = { type: 'raster', tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"], tileSize: 256 };
      style.layers.push({ id: 'capa-lugares', type: 'raster', source: 'lugares-esri' });
    }
    return style;
  }, [estiloMapa, mostrarCalles, mostrarLugares]);

  const seccionesGeoJSON = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: secciones.map(sec => {
        const coords = sec.coordenadas.map(c => [c[1], c[0]]); 
        if (coords.length > 0) coords.push(coords[0]); 
        return {
          type: 'Feature',
          properties: { id: sec.id, color: sec.colorHex },
          geometry: { type: 'Polygon', coordinates: [coords] }
        };
      })
    };
  }, [secciones]);

  const manejarClickMapa = (e) => {
    if (mapaActivoClics && alRegistrarPuntoTrazado) {
      alRegistrarPuntoTrazado([e.lngLat.lat, e.lngLat.lng]);
    }
  };

  const mostrarEtiquetasActivas = zoomLocal >= ZOOM_MOSTRAR_ETIQUETAS;
  const mostrarCasasActivas = zoomLocal >= ZOOM_MOSTRAR_CASAS;
  const mostrarTachuelasActivas = zoomLocal >= ZOOM_MOSTRAR_TACHUELAS;

  const escalaTachuela = Math.max(0.4, Math.min(1, zoomLocal / 18));

  return (
    <div className={`w-full h-full bg-slate-200 dark:bg-slate-950 relative ${mapaActivoClics ? 'cursor-crosshair' : ''}`}>
      
      <div className="absolute top-4 right-4 z-[1000] flex flex-col items-end gap-2 pointer-events-none">
        
        <div className="flex flex-col gap-2 pointer-events-auto mt-10">
          <button 
            onClick={() => setRastreando(!rastreando)}
            className={`p-2.5 rounded-xl shadow-xl border flex items-center justify-center transition-all active:scale-95 ${
              rastreando ? 'bg-blue-600 text-white border-blue-700' : 'bg-white/90 text-slate-600 border-slate-200'
            }`}
            title={rastreando ? "Detener GPS" : "Mi Ubicación"}
          >
            <LocateFixed size={18} />
          </button>

          <button 
            onClick={() => setMostrarLeyenda(!mostrarLeyenda)}
            className={`p-2.5 rounded-xl shadow-xl border flex items-center justify-center transition-all active:scale-95 ${
              mostrarLeyenda ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white/90 text-slate-600 border-slate-200'
            }`}
          >
            <Info size={18} />
          </button>
        </div>

        {mostrarLeyenda && (
          <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-xl shadow-xl border border-slate-200 text-[10px] font-bold flex flex-col gap-2.5 pointer-events-auto animate-slide-up mt-1">
            <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-full bg-[#f97316] border border-white" /> F - Faltante</div>
            <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-full bg-[#e11d48] border border-white" /> A - Alerta / No Visitar</div>
            <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-full bg-[#10b981] border border-white" /> V - Visitado / Listo</div>
            <div className="flex items-center gap-2 mt-1 pt-2 border-t"><div className="w-3.5 h-3.5 rounded-full bg-[#8b5cf6] border border-white" /> Mi Revisita</div>
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#0891b2" stroke="#ffffff" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3" fill="#ffffff"></circle>
              </svg> 
              Aviso Grupal
            </div>
          </div>
        )}
      </div>

      <Map
        ref={mapRef}
        initialViewState={{
          longitude: centroInicial[1],
          latitude: centroInicial[0],
          zoom: ZOOM_INICIO_VUELO, // Iniciando con el zoom manual (ej: 5)
          bearing: 0,
          pitch: 0
        }}
        onLoad={() => setMapaCargado(true)} // Avisa que el mapa ya se dibujó y está listo para animarse
        onMove={evt => {
          setZoomLocal(evt.viewState.zoom);
          if(setZoomActual) setZoomActual(evt.viewState.zoom);
        }}
        onClick={manejarClickMapa}
        mapStyle={mapStyleJSON}
        style={{ width: '100%', height: '100%' }}
        maxZoom={22}
        minZoom={4}
        dragRotate={true}
        touchPitch={true}
      >
        <NavigationControl position="bottom-right" showCompass={true} showZoom={true} />

        <Source id="secciones-data" type="geojson" data={seccionesGeoJSON}>
          <Layer id="secciones-fill" type="fill" paint={{ 'fill-color': ['get', 'color'], 'fill-opacity': 0.2 }} />
          <Layer id="secciones-line" type="line" paint={{ 'line-color': ['get', 'color'], 'line-width': 2 }} />
        </Source>

        {mostrarEtiquetasActivas && secciones.map((seccion) => {
          const centro = obtenerCentroPoligono(seccion.coordenadas);
          const completadas = edificios.filter(e => e.seccion_id === seccion.id && e.estado === 'completado').length;
          const total = edificios.filter(e => e.seccion_id === seccion.id && e.estado !== 'no_responde').length;
          const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : (seccion.estado === 'completado' ? 100 : 0);
          const colorClase = porcentaje === 100 ? 'bg-emerald-500' : 'bg-orange-500';

          return (
            <Marker key={`label-${seccion.id}`} longitude={centro[1]} latitude={centro[0]} anchor="center">
              <div 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (!enModoTrazado && !enModoEdificios && !enModoTachuela && alSeleccionarTerritorio) {
                    alSeleccionarTerritorio(seccion);
                  }
                }}
                className={`text-white font-bold text-[10px] px-2.5 py-1 rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform ${colorClase}`}
              >
                {seccion.nombre}
              </div>
            </Marker>
          );
        })}

        {mostrarCasasActivas && edificios.map((edificio) => {
          let colorEstado = '#f97316'; 
          if (edificio.estado === 'completado') colorEstado = '#10b981'; 
          if (edificio.estado === 'no_responde') colorEstado = '#e11d48'; 
          const esCalle = edificio.tipo_edificio === 'calle';

          return (
            <Marker key={edificio.id} longitude={edificio.lng} latitude={edificio.lat} anchor="center">
              <div 
                onClick={(e) => { e.stopPropagation(); if (!enModoTrazado && !enModoEdificios && !enModoTachuela) alSeleccionarEdificio(edificio); }}
                style={{
                  width: esCalle ? '16px' : '12px', height: esCalle ? '16px' : '12px',
                  backgroundColor: colorEstado, border: `2px ${esCalle ? 'dashed' : 'solid'} white`,
                  borderRadius: '50%', opacity: esCalle ? 0.7 : 1, cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }} 
              />
            </Marker>
          );
        })}

        {enModoTrazado && puntosTrazadoActual.length > 0 && (
          <Source id="trazado-linea" type="geojson" data={{
            type: 'Feature', geometry: { type: 'LineString', coordinates: puntosTrazadoActual.map(p => [p[1], p[0]]) }
          }}>
            <Layer id="trazado-linea-layer" type="line" paint={{ 'line-color': colorTrazadoActual, 'line-width': 3, 'line-dasharray': [2, 2] }} />
          </Source>
        )}
        {enModoTrazado && puntosTrazadoActual.length >= 3 && (
          <Source id="trazado-poligono" type="geojson" data={{
            type: 'Feature', geometry: { type: 'Polygon', coordinates: [[...puntosTrazadoActual.map(p => [p[1], p[0]]), [puntosTrazadoActual[0][1], puntosTrazadoActual[0][0]]]] }
          }}>
            <Layer id="trazado-poligono-layer" type="fill" paint={{ 'fill-color': colorTrazadoActual, 'fill-opacity': 0.3 }} />
          </Source>
        )}
        {enModoTrazado && puntosTrazadoActual.map((p, i) => (
          <Marker key={`punto-${i}`} longitude={p[1]} latitude={p[0]} anchor="center">
            <div style={{ width: '8px', height: '8px', backgroundColor: colorTrazadoActual, border: '2px solid white', borderRadius: '50%' }} />
          </Marker>
        ))}

        {mostrarTachuelasActivas && tachuelasGrupales.map((tachuela) => (
          <Marker key={tachuela.id} longitude={tachuela.lng} latitude={tachuela.lat} anchor="bottom">
            <div 
              onClick={(e) => { e.stopPropagation(); if (!enModoTrazado && !enModoTachuela && alSeleccionarTachuela) alSeleccionarTachuela(tachuela); }}
              dangerouslySetInnerHTML={{ __html: crearPinSVG('#0891b2') }} 
              className="cursor-pointer hover:scale-110 transition-transform origin-bottom" 
              style={{ transform: `scale(${escalaTachuela})` }}
            />
          </Marker>
        ))}
        {tachuelaTemporal && (
          <Marker longitude={tachuelaTemporal.lng} latitude={tachuelaTemporal.lat} anchor="bottom">
            <div dangerouslySetInnerHTML={{ __html: crearPinSVG('#06b6d4', 0.6) }} style={{ transform: `scale(${escalaTachuela})` }} />
          </Marker>
        )}

        {mostrarCasasActivas && marcadoresPersonales.map((pin) => (
          <Marker key={pin.id} longitude={pin.lng} latitude={pin.lat} anchor="center">
            <div 
              onClick={(e) => { e.stopPropagation(); if (!enModoTrazado && alSeleccionarRevisita) alSeleccionarRevisita(pin); }}
              style={{ width: '15px', height: '15px', backgroundColor: '#8b5cf6', border: '2px solid white', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }} 
            />
          </Marker>
        ))}
        {marcadorTemporal && (
          <Marker longitude={marcadorTemporal.lng} latitude={marcadorTemporal.lat} anchor="center">
             <div style={{ width: '16px', height: '16px', backgroundColor: '#c084fc', border: '3px dashed white', borderRadius: '50%', opacity: 0.8 }} />
          </Marker>
        )}

        {miUbicacion && (
          <Marker longitude={miUbicacion[1]} latitude={miUbicacion[0]} anchor="center">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-9 h-9 bg-blue-500 rounded-full opacity-25 animate-ping" />
              <div className="w-3.5 h-3.5 bg-blue-500 border-2 border-white rounded-full shadow-md z-10" />
            </div>
          </Marker>
        )}

      </Map>
    </div>
  );
}