// src/hooks/useMapa.js
import { useState, useEffect } from 'react';
import { supabase } from '../utilidades/clienteSupabase';

// FUNCIÓN AUXILIAR SENIOR: Algoritmo Ray-Casting para detectar si un punto [lat, lng] está dentro de un polígono irregular
const verificarPuntoEnPoligono = (lat, lng, poligono) => {
  let x = lat, y = lng;
  let dentro = false;
  for (let i = 0, j = poligono.length - 1; i < poligono.length; j = i++) {
    let xi = poligono[i][0], yi = poligono[i][1];
    let xj = poligono[j][0], yj = poligono[j][1];
    let intersecta = ((yi > y) !== (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersecta) dentro = !dentro;
  }
  return dentro;
};

export default function useMapa() {
  const [secciones, setSecciones] = useState([]);
  const [edificios, setEdificios] = useState([]);
  const [cargando, setCargando] = useState(false);
  
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [resultadosCiudades, setResultadosCiudades] = useState([]);
  const [coordenadasActuales, setCoordenadasActuales] = useState([25.6565, -100.2930]);
  const [zoomActual, setZoomActual] = useState(15);

  // CONTROL DE MODOS OPERATIVOS
  const [enModoTrazado, setEnModoTrazado] = useState(false);
  const [enModoEdificios, setEnModoEdificios] = useState(false); // Modo Siembra de Casas

  // CONTROL DE EDICIÓN/REGISTRO DE CASAS (BOTTOM SHEET)
  const [edificioSeleccionado, setEdificioSeleccionado] = useState(null); // Casa activa (nueva o existente)
  const [notasEdificioTemp, setNotasEdificioTemp] = useState(''); // Notas temporales del Bottom Sheet

  // ESTADOS DEL FORMULARIO DE TERRITORIO
  const [nombreNuevoTerritorio, setNombreNuevoTerritorio] = useState('');
  const [colorNuevoTerritorio, setColorNuevoTerritorio] = useState('#00f0ff');
  const [notasNuevoTerritorio, setNotasNuevoTerritorio] = useState('');
  const [puntosTrazadoActual, setPuntosTrazadoActual] = useState([]);

  // NUEVO: Estados para prender o apagar las capas de calles y lugares
  const [mostrarCalles, setMostrarCalles] = useState(true);
  const [mostrarLugares, setMostrarLugares] = useState(true);

  // DESCARGAR DATOS COMPLETOS DESDE SUPABASE (Secciones y Edificios)
  const obtenerDatosDelMapa = async () => {
    try {
      setCargando(true);
      
      // 1. Descargar Territorios
      const { data: dataSecciones, error: errorSecciones } = await supabase
        .from('secciones')
        .select('*')
        .order('creado_en', { ascending: true });
      if (errorSecciones) throw errorSecciones;

      // 2. Descargar Casas/Edificios
      const { data: dataEdificios, error: errorEdificios } = await supabase
        .from('edificios')
        .select('*');
      if (errorEdificios) throw errorEdificios;

      setSecciones(dataSecciones.map(item => ({
        id: item.id,
        nombre: item.nombre,
        colorHex: item.color_hex,
        coordenadas: item.coordenadas,
        notas: item.notas
      })));

      setEdificios(dataEdificios);

    } catch (error) {
      console.error("Error cargando datos de Supabase:", error.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerDatosDelMapa();
  }, []);

  // BUSCADOR DE CIUDADES (NOMINATIM)
  const buscarCiudadEnServidor = async () => {
    if (!textoBusqueda.trim()) return;
    try {
      const respuesta = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(textoBusqueda)}&limit=5`);
      const datos = await respuesta.json();
      setResultadosCiudades(datos);
    } catch (error) {
      console.error("Error en geocodificación:", error);
    }
  };

  const seleccionarCiudad = (ciudad) => {
    setCoordenadasActuales([parseFloat(ciudad.lat), parseFloat(ciudad.lon)]);
    setZoomActual(15);
    setResultadosCiudades([]);
    setTextoBusqueda('');
  };

  // LÓGICA DE TRAZADO DE PERÍMETROS
  const registrarPuntoTrazado = (coordenada) => setPuntosTrazadoActual((prev) => [...prev, coordenada]);
  const deshacerUltimoPunto = () => setPuntosTrazadoActual((prev) => prev.slice(0, -1));
  const limpiarTrazadoCompleto = () => setPuntosTrazadoActual([]);

  const cancelarTrazadoYSalir = () => {
    setEnModoTrazado(false);
    setNombreNuevoTerritorio('');
    setColorNuevoTerritorio('#00f0ff');
    setNotasNuevoTerritorio('');
    setPuntosTrazadoActual([]);
  };

  const guardarNuevaSeccionEnBD = async () => {
    if (puntosTrazadoActual.length < 3 || !nombreNuevoTerritorio.trim()) return;
    try {
      setCargando(true);
      const { error } = await supabase.from('secciones').insert([
        {
          nombre: nombreNuevoTerritorio,
          color_hex: colorNuevoTerritorio,
          coordenadas: puntosTrazadoActual,
          notas: notasNuevoTerritorio
        }
      ]);
      if (error) throw error;
      await obtenerDatosDelMapa();
      cancelarTrazadoYSalir();
    } catch (error) {
      alert("Error al guardar el territorio: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  const eliminarSeccionEnBD = async (idSeccion) => {
    if (!window.confirm("¿Estás seguro de eliminar este territorio? Se borrarán en cascada todos los checks de casas asociados a él.")) return;
    try {
      setCargando(true);
      const { error } = await supabase.from('secciones').delete().eq('id', idSeccion);
      if (error) throw error;
      await obtenerDatosDelMapa();
    } catch (error) {
      alert("Error al eliminar el territorio: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  // ==========================================
  // NUEVA LÓGICA DE CONTROL DE EDIFICIOS/CASAS
  // ==========================================

  // Centralizador de clics en el mapa según el modo activo
  const manejarClickMapa = (coordenada) => {
    const [lat, lng] = coordenada;

    if (enModoTrazado) {
      registrarPuntoTrazado(coordenada);
    } else if (enModoEdificios) {
      // Intentar encontrar a qué territorio pertenece el toque táctil
      const seccionContenedora = secciones.find(sec => 
        verificarPuntoEnPoligono(lat, lng, sec.coordenadas)
      );

      if (!seccionContenedora) {
        alert("📍 Para sembrar una casa, por favor toca adentro de un territorio de color válido.");
        return;
      }

      // Contar cuántas casas tiene ya este territorio para auto-asignarle un número consecutivo cómodo
      const casasEnSeccion = edificios.filter(e => e.seccion_id === seccionContenedora.id);
      const numeroCasa = casasEnSeccion.length + 1;

      // Inicializar una estructura de edificio temporal en el estado (sin ID de Supabase aún)
      setEdificioSeleccionado({
        seccion_id: seccionContenedora.id,
        direccion: `Casa #${numeroCasa} (${seccionContenedora.nombre})`,
        lat: lat,
        lng: lng,
        estado: 'pendiente',
        notas: ''
      });
      setNotasEdificioTemp('');
    }
  };

  // Cambiar el estado ('pendiente', 'no_responde', 'completado') en el Bottom Sheet
  const cambiarEstadoEdificioTemp = (nuevoEstado) => {
    if (!edificioSeleccionado) return;
    setEdificioSeleccionado(prev => ({ ...prev, estado: nuevoEstado }));
  };

  // Guardar (Insertar o Actualizar) la casa en Supabase
  const guardarEdificioEnBD = async () => {
    if (!edificioSeleccionado) return;

    try {
      setCargando(true);
      const datosAEnviar = {
        seccion_id: edificioSeleccionado.seccion_id,
        direccion: edificioSeleccionado.direccion,
        lat: edificioSeleccionado.lat,
        lng: edificioSeleccionado.lng,
        estado: edificioSeleccionado.estado,
        notas: notasEdificioTemp
      };

      if (edificioSeleccionado.id) {
        // MODO EDICIÓN: Si ya tiene ID, actualiza el registro existente
        const { error } = await supabase
          .from('edificios')
          .update(datosAEnviar)
          .eq('id', edificioSeleccionado.id);
        if (error) throw error;
      } else {
        // MODO CREACIÓN: Si no tiene ID, inserta una nueva casa sembrada
        const { error } = await supabase
          .from('edificios')
          .insert([datosAEnviar]);
        if (error) throw error;
      }

      await obtenerDatosDelMapa(); // Recargar marcadores frescos
      setEdificioSeleccionado(null); // Cerrar Bottom Sheet
    } catch (error) {
      alert("Error al procesar la casa: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  // Eliminar Casa
  const eliminarEdificioEnBD = async (idEdificio) => {
    if (!window.confirm("¿Seguro que deseas eliminar este punto del mapa?")) return;
    try {
      setCargando(true);
      const { error } = await supabase.from('edificios').delete().eq('id', idEdificio);
      if (error) throw error;
      await obtenerDatosDelMapa();
      setEdificioSeleccionado(null); // Cierra el menú inferior
    } catch (error) {
      alert("Error al eliminar la casa: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  // Volar la cámara al centro matemático de un territorio
  const volarATerritorio = (coordenadasPoligono) => {
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    coordenadasPoligono.forEach(([lat, lng]) => {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    });
    const latCentro = (minLat + maxLat) / 2;
    const lngCentro = (minLng + maxLng) / 2;
    
    setCoordenadasActuales([latCentro, lngCentro]);
    setZoomActual(18); // Zoom muy de cerca
  };

  // Marcar todo un territorio como completado
  const completarTerritorioEntero = async (idSeccion) => {
    if (!window.confirm("¿Estás seguro de marcar TODAS las casas de este territorio como completadas?")) return;
    try {
      setCargando(true);
      const { error } = await supabase.from('edificios').update({ estado: 'completado' }).eq('seccion_id', idSeccion);
      if (error) throw error;
      await obtenerDatosDelMapa(); // Refresca los pines a verde
    } catch (error) {
      alert("Error al completar el territorio: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  return {
    secciones,
    edificios,
    cargando,
    textoBusqueda,
    setTextoBusqueda,
    resultadosCiudades,
    buscarCiudadEnServidor,
    seleccionarCiudad,
    coordenadasActuales,
    zoomActual,
    enModoTrazado,
    setEnModoTrazado,
    enModoEdificios,
    setEnModoEdificios,
    nombreNuevoTerritorio,
    setNombreNuevoTerritorio,
    colorNuevoTerritorio,
    setColorNuevoTerritorio,
    notasNuevoTerritorio,
    setNotasNuevoTerritorio,
    puntosTrazadoActual,
    registrarPuntoTrazado,
    deshacerUltimoPunto,
    limpiarTrazadoCompleto,
    cancelarTrazadoYSalir,
    guardarNuevaSeccionEnBD,
    eliminarSeccionEnBD,
    edificioSeleccionado,
    setEdificioSeleccionado,
    notasEdificioTemp,
    setNotasEdificioTemp,
    manejarClickMapa,
    cambiarEstadoEdificioTemp,
    guardarEdificioEnBD,
    eliminarEdificioEnBD,
    volarATerritorio,
    completarTerritorioEntero,
    mostrarCalles,           // <-- NUEVO EXPORT
    setMostrarCalles,        // <-- NUEVO EXPORT
    mostrarLugares,          // <-- NUEVO EXPORT
    setMostrarLugares        // <-- NUEVO EXPORT
  };
}