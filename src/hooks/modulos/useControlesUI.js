// src/hooks/modulos/useControlesUI.js
import { useState } from 'react';

export default function useControlesUI() {
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [resultadosCiudades, setResultadosCiudades] = useState([]);
  const [coordenadasActuales, setCoordenadasActuales] = useState([25.6565, -100.2930]);
  const [zoomActual, setZoomActual] = useState(15);
  
  const [enModoTrazado, setEnModoTrazado] = useState(false);
  const [enModoEdificios, setEnModoEdificios] = useState(false); 
  const [edificioSeleccionado, setEdificioSeleccionado] = useState(null); 
  const [notesEdificioTemp, setNotasEdificioTemp] = useState(''); 

  const [nombreNuevoTerritorio, setNombreNuevoTerritorio] = useState('');
  const [colorNuevoTerritorio, setColorNuevoTerritorio] = useState('#00f0ff');
  const [notasNuevoTerritorio, setNotasNuevoTerritorio] = useState('');
  const [puntosTrazadoActual, setPuntosTrazadoActual] = useState([]);

  const [mostrarCalles, setMostrarCalles] = useState(true);
  const [mostrarLugares, setMostrarLugares] = useState(true);

  const buscarCiudadEnServidor = async () => {
    if (!textoBusqueda.trim()) return;
    try {
      const respuesta = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(textoBusqueda)}&limit=5`);
      setResultadosCiudades(await respuesta.json());
    } catch (error) { console.error("Error en geocodificación:", error); }
  };

  const seleccionarCiudad = (ciudad) => {
    setCoordenadasActuales([parseFloat(ciudad.lat), parseFloat(ciudad.lon)]);
    setZoomActual(15); setResultadosCiudades([]); setTextoBusqueda('');
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
    textoBusqueda, setTextoBusqueda, resultadosCiudades, buscarCiudadEnServidor, seleccionarCiudad, volarATerritorio,
    coordenadasActuales, setCoordenadasActuales, zoomActual, setZoomActual,
    enModoTrazado, setEnModoTrazado, enModoEdificios, setEnModoEdificios,
    edificioSeleccionado, setEdificioSeleccionado, notesEdificioTemp, setNotasEdificioTemp,
    nombreNuevoTerritorio, setNombreNuevoTerritorio, colorNuevoTerritorio, setColorNuevoTerritorio, 
    notasNuevoTerritorio, setNotasNuevoTerritorio, puntosTrazadoActual, setPuntosTrazadoActual,
    mostrarCalles, setMostrarCalles, mostrarLugares, setMostrarLugares, cancelarTrazadoYSalir
  };
}