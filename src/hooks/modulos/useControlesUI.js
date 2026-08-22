// src/hooks/modulos/useControlesUI.js
import { useState, useEffect } from 'react';

export default function useControlesUI() {
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [resultadosCiudades, setResultadosCiudades] = useState([]);
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState(false);
  
  // Restaurado a la configuración original adaptativa para celulares
  const [coordenadasActuales, setCoordenadasActuales] = useState([23.6345, -102.5528]);
  const [zoomActual, setZoomActual] = useState(window.innerWidth < 768 ? 5.5 : 5);
  
  const [enModoTrazado, setEnModoTrazado] = useState(false);
  const [enModoEdificios, setEnModoEdificios] = useState(false); 
  const [edificioSeleccionado, setEdificioSeleccionado] = useState(null); 
  const [notesEdificioTemp, setNotasEdificioTemp] = useState(''); 

  const [nombreNuevoTerritorio, setNombreNuevoTerritorio] = useState('');
  const [colorNuevoTerritorio, setColorNuevoTerritorio] = useState('#00f0ff');
  const [notasNuevoTerritorio, setNotasNuevoTerritorio] = useState('');
  const [puntosTrazadoActual, setPuntosTrazadoActual] = useState([]);

  const [mostrarCalles, setMostrarCalles] = useState(false);
  const [mostrarLugares, setMostrarLugares] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (textoBusqueda.trim() && !ciudadSeleccionada) {
        buscarCiudadEnServidor();
      } else if (!textoBusqueda.trim()) {
        setResultadosCiudades([]);
      }
    }, 500); 
    return () => clearTimeout(timeoutId);
  }, [textoBusqueda, ciudadSeleccionada]);

  const buscarCiudadEnServidor = async () => {
    if (!textoBusqueda.trim()) return;
    try {
      const respuesta = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(textoBusqueda)}&limit=5`);
      setResultadosCiudades(await respuesta.json());
    } catch (error) { console.error("Error en geocodificación:", error); }
  };

  const seleccionarCiudad = (ciudad) => {
    setCoordenadasActuales([parseFloat(ciudad.lat), parseFloat(ciudad.lon)]);
    setZoomActual(16); // Al seleccionar, el mapa hace zoom automáticamente
    setResultadosCiudades([]); 
    setTextoBusqueda(ciudad.display_name); 
    setCiudadSeleccionada(true); 
  };

  const manejarCambioBusqueda = (valor) => {
    setTextoBusqueda(valor);
    setCiudadSeleccionada(false); 
  };

  const volarATerritorio = (coordenadasPoligono) => {
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    coordenadasPoligono.forEach(([lat, lng]) => {
      if (lat < minLat) minLat = lat; if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng; if (lng > maxLng) maxLng = lng;
    });
    setCoordenadasActuales([(minLat + maxLat) / 2, (minLng + maxLng) / 2]); setZoomActual(18); 
  };

  const cancelarTrazadoYSalir = () => {
    setEnModoTrazado(false); setNombreNuevoTerritorio(''); setColorNuevoTerritorio('#00f0ff'); 
    setNotasNuevoTerritorio(''); setPuntosTrazadoActual([]); 
  };

  return {
    textoBusqueda, setTextoBusqueda: manejarCambioBusqueda, resultadosCiudades, buscarCiudadEnServidor, seleccionarCiudad, volarATerritorio,
    ciudadSeleccionada, setCiudadSeleccionada,
    coordenadasActuales, setCoordenadasActuales, zoomActual, setZoomActual,
    enModoTrazado, setEnModoTrazado, enModoEdificios, setEnModoEdificios,
    edificioSeleccionado, setEdificioSeleccionado, notesEdificioTemp, setNotasEdificioTemp,
    nombreNuevoTerritorio, setNombreNuevoTerritorio, colorNuevoTerritorio, setColorNuevoTerritorio, 
    notasNuevoTerritorio, setNotasNuevoTerritorio, puntosTrazadoActual, setPuntosTrazadoActual,
    mostrarCalles, setMostrarCalles, mostrarLugares, setMostrarLugares, cancelarTrazadoYSalir
  };
}