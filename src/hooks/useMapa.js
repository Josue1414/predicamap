// src/hooks/useMapa.js
import { useState, useEffect } from 'react';
import { supabase } from '../utilidades/clienteSupabase';

const verificarPuntoEnPoligono = (lat, lng, poligono) => {
  let x = lat, y = lng;
  let dentro = false;
  for (let i = 0, j = poligono.length - 1; i < poligono.length; j = i++) {
    let xi = poligono[i][0], yi = poligono[i][1];
    let xj = poligono[j][0], yj = poligono[j][1];
    let intersecta = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
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

  const [perfilUsuario, setPerfilUsuario] = useState(null); 
  const [usuariosEquipo, setUsuariosEquipo] = useState([]); 

  const [listaCongregaciones, setListaCongregaciones] = useState([]);
  const [congregacionContextoId, setCongregacionContextoId] = useState(null);
  const [congregacionActiva, setCongregacionActiva] = useState(null);

  const inicializarEcosistema = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: perfil } = await supabase.from('perfiles').select('*').eq('id', user.id).single();
      if (perfil) {
        setPerfilUsuario(perfil);
        if (perfil.rol === 'Administrador Mayor') {
          const { data: congs } = await supabase.from('congregaciones').select('*').order('creado_en', { ascending: true });
          setListaCongregaciones(congs || []);
        }
      }
    } catch (error) {
      console.error("Error al inicializar sesión maestra:", error.message);
    }
  };

  const cargarDatosContexto = async () => {
    try {
      setCargando(true);
      const targetCongId = congregacionContextoId || perfilUsuario?.congregacion_id;

      if (targetCongId) {
        // A) Obtener información general de la Congregación
        const { data: cong } = await supabase.from('congregaciones').select('*').eq('id', targetCongId).single();
        setCongregacionActiva(cong);

        // B) Territorios
        const { data: secs } = await supabase.from('secciones').select('*').eq('congregacion_id', targetCongId).order('creado_en', { ascending: true });
        const seccionesFormateadas = secs || [];
        setSecciones(seccionesFormateadas.map(item => ({ 
          id: item.id, 
          nombre: item.nombre, 
          colorHex: item.color_hex, 
          coordenadas: item.coordenadas, 
          notas: item.notas, 
          asignado_a: item.asignado_a 
        })));

        if (seccionesFormateadas.length > 0 && congregacionContextoId) {
          let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
          seccionesFormateadas.forEach(s => s.coordenadas.forEach(([lat, lng]) => {
            if (lat < minLat) minLat = lat; if (lat > maxLat) maxLat = lat;
            if (lng < minLng) minLng = lng; if (lng > maxLng) maxLng = lng;
          }));
          setCoordenadasActuales([(minLat + maxLat) / 2, (minLng + maxLng) / 2]);
        }

        // C) Casas/Checks
        const secIds = seccionesFormateadas.map(s => s.id);
        if (secIds.length > 0) {
          const { data: edis } = await supabase.from('edificios').select('*').in('seccion_id', secIds);
          setEdificios(edis || []);
        } else {
          setEdificios([]);
        }

        // D) Equipo autorizado
        const { data: equipo } = await supabase.from('perfiles').select('*').eq('congregacion_id', targetCongId).order('nombre', { ascending: true });
        setUsuariosEquipo(equipo ? equipo.filter(u => u.rol !== 'Publicador') : []);
      }
    } catch (error) {
      console.error("Error al refrescar mapas de la congregación:", error.message);
    } finally { 
      setCargando(false);
    }
  };

  useEffect(() => {
    inicializarEcosistema();
  }, []);

  useEffect(() => {
    if (perfilUsuario) {
      cargarDatosContexto();
    }
  }, [perfilUsuario, congregacionContextoId]);

  const buscarCiudadEnServidor = async () => {
    if (!textoBusqueda.trim()) return;
    try {
      const respuesta = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(textoBusqueda)}&limit=5`);
      const datos = await respuesta.json();
      setResultadosCiudades(datos);
    } catch (error) { console.error("Error en geocodificación:", error); }
  };

  const seleccionarCiudad = (ciudad) => {
    setCoordenadasActuales([parseFloat(ciudad.lat), parseFloat(ciudad.lon)]); setZoomActual(15); setResultadosCiudades([]); setTextoBusqueda('');
  };

  const registrarPuntoTrazado = (coordenada) => setPuntosTrazadoActual((prev) => [...prev, coordenada]);
  const deshacerUltimoPunto = () => setPuntosTrazadoActual((prev) => prev.slice(0, -1));
  const limpiarTrazadoCompleto = () => setPuntosTrazadoActual([]);

  const cancelarTrazadoYSalir = () => { setEnModoTrazado(false); setNombreNuevoTerritorio(''); setColorNuevoTerritorio('#00f0ff'); setNotasNuevoTerritorio(''); setPuntosTrazadoActual([]); };

  const guardarNuevaSeccionEnBD = async () => {
    if (puntosTrazadoActual.length < 3 || !nombreNuevoTerritorio.trim()) return;
    try {
      setCargando(true);
      const targetCongId = congregacionContextoId || perfilUsuario?.congregacion_id;
      const { error } = await supabase.from('secciones').insert([
        { nombre: nombreNuevoTerritorio, color_hex: colorNuevoTerritorio, coordenadas: puntosTrazadoActual, notas: notasNuevoTerritorio, congregacion_id: targetCongId }
      ]);
      if (error) throw error;
      await cargarDatosContexto(); cancelarTrazadoYSalir();
    } catch (error) { alert("Error al guardar el territorio: " + error.message); } finally { setCargando(false); }
  };

  const eliminarSeccionEnBD = async (idSeccion) => {
    if (!window.confirm("¿Estás seguro de eliminar este territorio? Se borrarán en cascada todos los checks asociados a él.")) return;
    try { setCargando(true); const { error } = await supabase.from('secciones').delete().eq('id', idSeccion); if (error) throw error; await cargarDatosContexto(); } catch (error) { alert("Error: " + error.message); } finally { setCargando(false); }
  };

  // =========================================================
  // FUNCIONES OPERATIVAS: CAPITÁN / PRECURSOR
  // =========================================================
  const asignarTerritorioEnBD = async (idSeccion, idUsuarioAsignado) => {
    try {
      setCargando(true);
      const { error } = await supabase.from('secciones').update({ asignado_a: idUsuarioAsignado || null }).eq('id', idSeccion);
      if (error) throw error;
      await cargarDatosContexto();
    } catch (error) { alert("Error al asignar: " + error.message); } finally { setCargando(false); }
  };

  const reiniciarTerritorioEnBD = async (idSeccion) => {
    if (!window.confirm("¿Estás seguro? Esto regresará todas las casas de este territorio a color rojo (Pendiente).")) return;
    try {
      setCargando(true);
      const { error } = await supabase.from('edificios').update({ estado: 'pendiente' }).eq('seccion_id', idSeccion);
      if (error) throw error;
      await cargarDatosContexto();
    } catch (error) { alert("Error al reiniciar: " + error.message); } finally { setCargando(false); }
  };

  const actualizarNotasSeccionEnBD = async (idSeccion, nuevasNotas) => {
    try {
      const { error } = await supabase.from('secciones').update({ notas: nuevasNotas }).eq('id', idSeccion);
      if (error) throw error;
      setSecciones(prev => prev.map(s => s.id === idSeccion ? { ...s, notas: nuevasNotas } : s));
    } catch (error) { alert("Error al guardar notas: " + error.message); }
  };

  const manejarClickMapa = (coordenada) => {
    const [lat, lng] = coordenada;
    if (enModoTrazado) { registrarPuntoTrazado(coordenada); } else if (enModoEdificios) {
      const seccionContenedora = secciones.find(sec => verificarPuntoEnPoligono(lat, lng, sec.coordenadas));
      if (!seccionContenedora) { alert("📍 Toca adentro de un territorio de color válido."); return; }
      const casasEnSeccion = edificios.filter(e => e.seccion_id === seccionContenedora.id);
      const numeroCasa = casasEnSeccion.length + 1;
      setEdificioSeleccionado({ seccion_id: seccionContenedora.id, direccion: `Casa #${numeroCasa} (${seccionContenedora.nombre})`, lat: lat, lng: lng, estado: 'pendiente', notas: '' });
      setNotasEdificioTemp('');
    }
  };

  const cambiarEstadoEdificioTemp = (nuevoEstado) => { if (!edificioSeleccionado) return; setEdificioSeleccionado(prev => ({ ...prev, estado: nuevoEstado })); };

  const guardarEdificioEnBD = async () => {
    if (!edificioSeleccionado) return;
    try {
      setCargando(true);
      const datosAEnviar = { seccion_id: edificioSeleccionado.seccion_id, direccion: edificioSeleccionado.direccion, lat: edificioSeleccionado.lat, lng: edificioSeleccionado.lng, estado: edificioSeleccionado.estado, notas: notesEdificioTemp };
      if (edificioSeleccionado.id) { const { error } = await supabase.from('edificios').update(datosAEnviar).eq('id', edificioSeleccionado.id); if (error) throw error; } else { const { error } = await supabase.from('edificios').insert([datosAEnviar]); if (error) throw error; }
      await cargarDatosContexto(); setEdificioSeleccionado(null); 
    } catch (error) { alert("Error al procesar la casa: " + error.message); } finally { setCargando(false); }
  };

  const eliminarEdificioEnBD = async (idEdificio) => {
    if (!window.confirm("¿Seguro que deseas eliminar este punto?")) return;
    try { setCargando(true); const { error } = await supabase.from('edificios').delete().eq('id', idEdificio); if (error) throw error; await cargarDatosContexto(); setEdificioSeleccionado(null); } catch (error) { alert("Error: " + error.message); } finally { setCargando(false); }
  };

  const volarATerritorio = (coordenadasPoligono) => {
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    coordenadasPoligono.forEach(([lat, lng]) => {
      if (lat < minLat) minLat = lat; if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng; if (lng > maxLng) maxLng = lng;
    });
    setCoordenadasActuales([(minLat + maxLat) / 2, (minLng + maxLng) / 2]); setZoomActual(18); 
  };

  const completarTerritorioEntero = async (idSeccion) => {
    if (!window.confirm("¿Marcar TODAS las casas de este territorio como completadas?")) return;
    try { setCargando(true); const { error } = await supabase.from('edificios').update({ estado: 'completado' }).eq('seccion_id', idSeccion); if (error) throw error; await cargarDatosContexto(); } catch (error) { alert("Error: " + error.message); } finally { setCargando(false); }
  };

  const eliminarMiembroEquipo = async (idMiembro) => {
    if (!window.confirm("¿Revocar el acceso a este usuario? Se eliminará su cuenta por completo.")) return;
    try { setCargando(true); const { error } = await supabase.from('perfiles').delete().eq('id', idMiembro); if (error) throw error; await cargarDatosContexto(); } catch (error) { alert("Error: " + error.message); } finally { setCargando(false); }
  };

  const guardarNombreCongregacionBD = async (nuevoNombre) => {
    if (!congregacionActiva || nuevoNombre === congregacionActiva.nombre) return;
    try {
      setCargando(true);
      const { error } = await supabase.from('congregaciones').update({ nombre: nuevoNombre }).eq('id', congregacionActiva.id);
      if (error) throw error;
      
      setCongregacionActiva(prev => ({ ...prev, nombre: nuevoNombre }));
      
      if (perfilUsuario?.rol === 'Administrador Mayor') {
        setListaCongregaciones(prev => prev.map(c => c.id === congregacionActiva.id ? { ...c, nombre: nuevoNombre } : c));
      }
    } catch (error) {
      console.error("Error al actualizar nombre:", error.message);
    } finally {
      setCargando(false);
    }
  };

  // =========================================================
  // EXCLUSIVO ADMINISTRADOR MÁSTER: BORRAR CONGREGACIÓN
  // =========================================================
  const eliminarCongregacionMasterBD = async (idCongregacion) => {
    if (!window.confirm("⚠️ ATENCIÓN MÁSTER:\n\n¿Estás absolutamente seguro de eliminar esta congregación? Esto borrará permanentemente todos sus territorios, casas asociadas y perfiles de usuarios vinculados de forma irreversible.")) return;
    try {
      setCargando(true);
      const { error } = await supabase.from('congregaciones').delete().eq('id', idCongregacion);
      if (error) throw error;
      
      setListaCongregaciones(prev => prev.filter(c => c.id !== idCongregacion));
      if (congregacionContextoId === idCongregacion) {
        setCongregacionContextoId(null);
      }
    } catch (error) { alert("Error al eliminar congregación: " + error.message); } finally { setCargando(false); }
  };

  // =========================================================
  // ENLACES INTELIGENTES (ENCRIPTADOS Y PÚBLICOS) SEGUROS
  // =========================================================
  const crearLinkInvitacion = (rolDestino, esNuevaCongregacion = false) => {
    if (!perfilUsuario) return '';
    const urlBase = window.location.origin;

    if (rolDestino === 'Publicador') {
      const enlaceCorto = congregacionActiva?.enlace_corto || 'central-demo';
      const linkPublico = `${urlBase}/v/${enlaceCorto}`;
      const msjPublico = `Hola hermano, aquí tienes el enlace para ver y trabajar los territorios de la congregación:\n\n${linkPublico}`;
      return `https://api.whatsapp.com/send?text=${encodeURIComponent(msjPublico)}`;
    }
    
    const targetCong = congregacionContextoId || perfilUsuario.congregacion_id;
    
    // encodeURIComponent protege las tildes ("á" de Capitán) antes de encriptar en Base64
    const payloadCifrado = btoa(encodeURIComponent(JSON.stringify({
      r: rolDestino,
      nc: esNuevaCongregacion ? 1 : 0,
      c: esNuevaCongregacion ? null : targetCong
    })));

    const linkCompleto = `${urlBase}/registro?key=${payloadCifrado}`;
    const mensajeWhatsApp = `Hola hermano, te invito a PredicaMap como *${rolDestino}*. Regístrate en este enlace seguro:\n\n${linkCompleto}`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(mensajeWhatsApp)}`;
  };

  // ESTE RETURN DEBE ESTAR AL FINAL DEL HOOK
  return {
    secciones, edificios, cargando, textoBusqueda, setTextoBusqueda, resultadosCiudades, 
    buscarCiudadEnServidor, seleccionarCiudad, coordenadasActuales, zoomActual, 
    enModoTrazado, setEnModoTrazado, enModoEdificios, setEnModoEdificios, 
    nombreNuevoTerritorio, setNombreNuevoTerritorio, colorNuevoTerritorio, 
    setColorNuevoTerritorio, notasNuevoTerritorio, setNotasNuevoTerritorio, 
    puntosTrazadoActual, registrarPuntoTrazado, deshacerUltimoPunto, 
    limpiarTrazadoCompleto, cancelarTrazadoYSalir, guardarNuevaSeccionEnBD, 
    eliminarSeccionEnBD, edificioSeleccionado, setEdificioSeleccionado, 
    notesEdificioTemp, setNotasEdificioTemp, manejarClickMapa, cambiarEstadoEdificioTemp, 
    guardarEdificioEnBD, eliminarEdificioEnBD, volarATerritorio, completarTerritorioEntero, 
    mostrarCalles, setMostrarCalles, mostrarLugares, setMostrarLugares, perfilUsuario, 
    usuariosEquipo, eliminarMiembroEquipo, crearLinkInvitacion, listaCongregaciones, 
    congregacionContextoId, alSeleccionarCongregacionContexto: setCongregacionContextoId, 
    congregacionActiva, guardarNombreCongregacionBD, asignarTerritorioEnBD, 
    reiniciarTerritorioEnBD, actualizarNotasSeccionEnBD,
    // LA NUEVA FUNCION MÁSTER AHORA SÍ ESTÁ EXPORTADA
    eliminarCongregacionMasterBD
  };
}