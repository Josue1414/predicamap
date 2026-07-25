// src/hooks/useMapa.js
import useEstadoGlobal from './modulos/useEstadoGlobal';
import useControlesUI from './modulos/useControlesUI';
import useGestorTerritorios from './modulos/useGestorTerritorios';
import { useModoMapa } from '../context/ContextoModoMapa';
import { useAlertas } from '../context/ContextoAlertas'; 

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

const verificarConexionReal = async () => {
  if (!navigator.onLine) return false;
  try {
    // Hacemos una petición rápida y ligera. Si no hay saldo, esto fallará irremediablemente.
    await fetch('https://dns.google/resolve?name=google.com', { 
      mode: 'no-cors', 
      cache: 'no-store' 
    });
    return true;
  } catch (error) {
    return false;
  }
};

export default function useMapa() {
  const global = useEstadoGlobal();
  const ui = useControlesUI();
  
  const db = useGestorTerritorios(
    global.targetCongId, 
    !!global.congregacionContextoId, 
    (coordenadas) => {
      ui.setCoordenadasActuales(coordenadas);
      ui.setZoomActual(15); 
    }
  );
  
  const { enModoTrazado, enModoEdificios, limpiarModo, estiloMapa, setEstiloMapa } = useModoMapa();
  
  const { mostrarAlerta, mostrarConfirmacion } = useAlertas(); 

  const manejarCambioEstiloMapa = (nuevoEstilo) => {
    setEstiloMapa(nuevoEstilo);
    if (nuevoEstilo === 'satelite_puro') {
      ui.setMostrarCalles(true);
      ui.setMostrarLugares(true);
    } else {
      ui.setMostrarCalles(false);
      ui.setMostrarLugares(false);
    }
  };

  const manejarClickMapa = (coordenada) => {
    const [lat, lng] = coordenada;
    if (enModoTrazado) {
      ui.setPuntosTrazadoActual(prev => [...prev, coordenada]);
    } else if (enModoEdificios) {
      const seccionContenedora = db.secciones.find(sec => verificarPuntoEnPoligono(lat, lng, sec.coordenadas));
      
      if (!seccionContenedora) { 
        mostrarAlerta("Ubicación inválida", "📍 Toca adentro de un territorio de color válido para sembrar una casa/calle.", "warning");
        return; 
      }
      
      const casasEnSeccion = db.edificios.filter(e => e.seccion_id === seccionContenedora.id);
      
      ui.setEdificioSeleccionado({ 
        seccion_id: seccionContenedora.id, 
        tipo_edificio: 'calle', 
        direccion: `Tramo #${casasEnSeccion.length + 1} (${seccionContenedora.nombre})`, 
        lat, 
        lng, 
        estado: 'pendiente', 
        notas: '' 
      });
      ui.setNotasEdificioTemp('');
    }
  };

  const deshacerUltimoPunto = () => ui.setPuntosTrazadoActual(prev => prev.slice(0, -1));
  const limpiarTrazadoCompleto = () => ui.setPuntosTrazadoActual([]);

  const guardarNuevaSeccionEnBD = async () => {
    if (ui.puntosTrazadoActual.length < 3 || !ui.nombreNuevoTerritorio.trim()) return;
    
    // 🛡️ ESCUDO: Verificamos conexión real
    const tieneInternet = await verificarConexionReal();
    if (!tieneInternet) {
      mostrarAlerta("Sin conexión", "No se pudo guardar el territorio. Verifica que tengas saldo o datos para navegar.", "warning");
      return; // Detenemos todo para proteger el mapa local
    }

    await db.crearSeccionBD({
      nombre: ui.nombreNuevoTerritorio, color_hex: ui.colorNuevoTerritorio,
      coordenadas: ui.puntosTrazadoActual, notas: ui.notasNuevoTerritorio, congregacion_id: global.targetCongId
    });
    await db.cargarTerritoriosYCasas();
    ui.cancelarTrazadoYSalir();
    limpiarModo();
  };

  const guardarEdificioEnBD = async () => {
    if (!ui.edificioSeleccionado) return;
    
    // 🛡️ ESCUDO: Verificamos conexión real
    const tieneInternet = await verificarConexionReal();
    if (!tieneInternet) {
      mostrarAlerta("Sin conexión", "No se pudieron hacer los cambios. Verifica que tengas saldo o datos para navegar.", "warning");
      return; // Detenemos todo para proteger el mapa local
    }
    
    const datosAEnviar = { 
      seccion_id: ui.edificioSeleccionado.seccion_id, 
      tipo_edificio: ui.edificioSeleccionado.tipo_edificio || 'calle',
      direccion: ui.edificioSeleccionado.direccion, 
      lat: ui.edificioSeleccionado.lat, 
      lng: ui.edificioSeleccionado.lng, 
      estado: ui.edificioSeleccionado.estado, 
      notas: ui.edificioSeleccionado.notas || '' 
    };
    
    if (ui.edificioSeleccionado.id) { await db.actualizarEdificioBD(ui.edificioSeleccionado.id, datosAEnviar); } 
    else { await db.crearEdificioBD(datosAEnviar); }
    await db.cargarTerritoriosYCasas();
    ui.setEdificioSeleccionado(null); 
  };

  const eliminarEdificioEnBD = async (idEdificio) => {
    const confirmado = await mostrarConfirmacion(
      "Eliminar Punto",
      "¿Seguro que deseas eliminar este punto?",
      "danger",
      "Eliminar"
    );
    if (!confirmado) return false;

    // 🛡️ ESCUDO: Verificamos conexión real
    const tieneInternet = await verificarConexionReal();
    if (!tieneInternet) {
      mostrarAlerta("Sin conexión", "No se pudo eliminar. Verifica que tengas saldo o datos para navegar.", "warning");
      return false; // Detenemos todo
    }

    await db.eliminarEdificioBD(idEdificio);
    await db.cargarTerritoriosYCasas();
    ui.setEdificioSeleccionado(null);
    return true;
  };

  const cambiarEstadoEdificioTemp = (nuevoEstado) => { 
    if (ui.edificioSeleccionado) ui.setEdificioSeleccionado(prev => ({ ...prev, estado: nuevoEstado })); 
  };

  return {
    ...global,
    ...ui,
    ...db,
    enModoTrazado,
    enModoEdificios,
    alSeleccionarCongregacionContexto: global.setCongregacionContextoId,
    cargando: global.cargandoGlobal || db.cargandoTerritorios,
    manejarClickMapa, deshacerUltimoPunto, limpiarTrazadoCompleto,
    guardarNuevaSeccionEnBD, guardarEdificioEnBD, eliminarEdificioEnBD, cambiarEstadoEdificioTemp,
    estiloMapa,
    alCambiarEstiloMapa: manejarCambioEstiloMapa,
    registrarPuntoTrazado: (coord) => ui.setPuntosTrazadoActual(prev => [...prev, coord]),
    modoAhorro: db.modoAhorro,
    reactivarTiempoReal: db.reactivarTiempoReal,
    cancelarTrazadoYSalir: () => {
      ui.cancelarTrazadoYSalir();
      limpiarModo();
    }
  };
}