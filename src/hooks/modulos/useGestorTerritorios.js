// src/hooks/modulos/useGestorTerritorios.js
import { useState, useEffect } from 'react';
import { supabase } from '../../utilidades/clienteSupabase';
import useEstadoGlobal from './useEstadoGlobal';
import { useAlertas } from '../../context/ContextoAlertas'; 

export default function useGestorTerritorios(targetCongId, esSimulacion, onCentrarMapa) {
  const { mostrarConfirmacion } = useAlertas();

  const [secciones, setSecciones] = useState([]);
  const [edificios, setEdificios] = useState([]);
  const [cargandoTerritorios, setCargandoTerritorios] = useState(false);
  const [modoAhorro, setModoAhorro] = useState(false);

  const { perfilUsuario } = useEstadoGlobal();

  // ★ 1. AUTO-GUARDADO: Sincroniza automáticamente los datos con localStorage
  useEffect(() => {
    if (targetCongId && secciones.length > 0) {
      localStorage.setItem(`predicamap_secciones_${targetCongId}`, JSON.stringify(secciones));
    }
  }, [secciones, targetCongId]);

  useEffect(() => {
    if (targetCongId && edificios.length > 0) {
      localStorage.setItem(`predicamap_edificios_${targetCongId}`, JSON.stringify(edificios));
    }
  }, [edificios, targetCongId]);

  const cargarTerritoriosYCasas = async (esCargaInicial = false) => {
    if (!targetCongId) return;

    // ★ 2. CARGA LOCAL (OFFLINE FIRST): Rescatamos lo que está en memoria
    const secLocales = localStorage.getItem(`predicamap_secciones_${targetCongId}`);
    const ediLocales = localStorage.getItem(`predicamap_edificios_${targetCongId}`);

    if (secLocales) {
      const formateadas = JSON.parse(secLocales);
      setSecciones(formateadas);
      // Efecto de centrado global eliminado para no interrumpir a VisorMapa
    }

    if (ediLocales) {
      setEdificios(JSON.parse(ediLocales));
    }

    // ★ 3. VALIDACIÓN DE RED: Si no hay internet, terminamos la función aquí.
    if (!navigator.onLine) {
      console.log("Modo sin conexión: Territorios cargados desde memoria local.");
      return; 
    }

    // ★ 4. CARGA DE SUPABASE: Si hay internet, actualizamos con datos frescos
    setCargandoTerritorios(true);
    try {
      const { data: secs } = await supabase.from('secciones')
        .select('*')
        .eq('congregacion_id', targetCongId)
        .order('orden', { ascending: true })
        .order('creado_en', { ascending: true });

      const formateadas = (secs || []).map(item => ({
        id: item.id, nombre: item.nombre, colorHex: item.color_hex, 
        coordenadas: item.coordenadas, notas: item.notas, asignado_a: item.asignado_a,
        estado: item.estado, orden: item.orden 
      }));
      setSecciones(formateadas);

      // Efecto de centrado global eliminado para no interrumpir a VisorMapa

      const secIds = formateadas.map(s => s.id);
      if (secIds.length > 0) {
        const { data: edis } = await supabase.from('edificios').select('*').in('seccion_id', secIds);
        setEdificios(edis || []);
      } else { 
        setEdificios([]); 
      }
    } catch (error) { 
      console.error(error); 
    } finally { 
      setCargandoTerritorios(false); 
    }
  };

  useEffect(() => { 
    if (!targetCongId) return;
    
    cargarTerritoriosYCasas(true); 

    let canalMapa = null;
    let temporizadorInactividad = null;
    const TIEMPO_LIMITE_INACTIVIDAD = 5 * 60 * 1000; 

    const esLider = perfilUsuario && ['Capitán', 'Administrador', 'Administrador Mayor'].includes(perfilUsuario.rol);

    const conectarRealtime = () => {
      // Si no hay internet, no intentamos conectar el Realtime
      if (canalMapa || !esLider || !navigator.onLine) return;

      canalMapa = supabase.channel('cambios-mapa')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'secciones', filter: `congregacion_id=eq.${targetCongId}` }, (payload) => {
          if (payload.eventType === 'INSERT') {
            const nuevaSec = {
              id: payload.new.id, nombre: payload.new.nombre, colorHex: payload.new.color_hex, 
              coordenadas: payload.new.coordenadas, notas: payload.new.notas, asignado_a: payload.new.asignado_a,
              estado: payload.new.estado, orden: payload.new.orden 
            };
            setSecciones(prev => {
              if (prev.some(s => s.id === nuevaSec.id)) return prev;
              return [...prev, nuevaSec].sort((a, b) => a.orden - b.orden);
            });
          } else if (payload.eventType === 'UPDATE') {
            const secAct = {
              id: payload.new.id, nombre: payload.new.nombre, colorHex: payload.new.color_hex, 
              coordenadas: payload.new.coordenadas, notas: payload.new.notas, asignado_a: payload.new.asignado_a,
              estado: payload.new.estado, orden: payload.new.orden 
            };
            setSecciones(prev => prev.map(s => s.id === secAct.id ? secAct : s).sort((a, b) => a.orden - b.orden));
          } else if (payload.eventType === 'DELETE') {
            setSecciones(prev => prev.filter(s => s.id !== payload.old.id));
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'edificios' }, (payload) => {
          if (payload.eventType === 'INSERT') {
            setEdificios(prev => {
              if (prev.some(e => e.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            });
          } else if (payload.eventType === 'UPDATE') {
            setEdificios(prev => prev.map(e => e.id === payload.new.id ? payload.new : e));
          } else if (payload.eventType === 'DELETE') {
            setEdificios(prev => prev.filter(e => e.id !== payload.old.id));
          }
        })
        .subscribe();
    };

    const desconectarRealtime = () => {
      if (canalMapa) {
        supabase.removeChannel(canalMapa);
        canalMapa = null;
      }
    };

    const reiniciarTemporizador = () => {
      if (!esLider || modoAhorro) return; 
      
      clearTimeout(temporizadorInactividad);
      temporizadorInactividad = setTimeout(() => {
        desconectarRealtime();
        setModoAhorro(true); 
      }, TIEMPO_LIMITE_INACTIVIDAD);
    };

    const manejarCambioVisibilidad = () => {
      if (document.visibilityState === 'visible') {
        if (!modoAhorro) {
           cargarTerritoriosYCasas(false);
           conectarRealtime();
           reiniciarTemporizador();
        }
      } else {
        desconectarRealtime();
        clearTimeout(temporizadorInactividad);
      }
    };

    // ★ Solo nos conectamos si hay internet
    if (navigator.onLine) {
      conectarRealtime();
      reiniciarTemporizador();
    }

    const eventosActividad = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    eventosActividad.forEach(evento => document.addEventListener(evento, reiniciarTemporizador));

    const intervaloPolling = setInterval(() => {
      if (!esLider && document.visibilityState === 'visible' && navigator.onLine) {
        cargarTerritoriosYCasas(false);
      }
    }, 45000);

    document.addEventListener('visibilitychange', manejarCambioVisibilidad);
    
    // ★ Escuchar cuando el internet vuelve para recargar
    window.addEventListener('online', () => cargarTerritoriosYCasas(false));

    return () => { 
      desconectarRealtime(); 
      clearTimeout(temporizadorInactividad);
      clearInterval(intervaloPolling);
      document.removeEventListener('visibilitychange', manejarCambioVisibilidad);
      window.removeEventListener('online', () => cargarTerritoriosYCasas(false));
      eventosActividad.forEach(evento => document.removeEventListener(evento, reiniciarTemporizador));
    };
  }, [targetCongId, perfilUsuario, modoAhorro]); 

  const reactivarTiempoReal = () => {
    setModoAhorro(false); 
    cargarTerritoriosYCasas(false); 
  };

  const reordenarTerritorioEnBD = async (id, direccion) => {
    const indexActual = secciones.findIndex(s => s.id === id);
    if (indexActual < 0) return;
    if (direccion === 'arriba' && indexActual === 0) return;
    if (direccion === 'abajo' && indexActual === secciones.length - 1) return;

    const nuevoArreglo = [...secciones];
    const indexDestino = direccion === 'arriba' ? indexActual - 1 : indexActual + 1;

    const temp = nuevoArreglo[indexActual];
    nuevoArreglo[indexActual] = nuevoArreglo[indexDestino];
    nuevoArreglo[indexDestino] = temp;

    const arregloActualizado = nuevoArreglo.map((item, index) => ({ ...item, orden: index }));
    setSecciones(arregloActualizado);

    if (navigator.onLine) {
      await Promise.all(arregloActualizado.map(t => supabase.from('secciones').update({ orden: t.orden }).eq('id', t.id)));
    }
  };

  const eliminarSeccionEnBD = async (id) => {
    const confirmado = await mostrarConfirmacion(
      "Eliminar Territorio",
      "¿Estás seguro de eliminar este territorio? Se borrarán en cascada todos los checks asociados a él.",
      "danger", 
      "Sí, eliminar"
    );
    if (!confirmado || !navigator.onLine) return;
    
    setCargandoTerritorios(true);
    await supabase.from('secciones').delete().eq('id', id);
    setCargandoTerritorios(false);
  };

  const asignarTerritorioEnBD = async (id, idUsuario) => {
    if (!navigator.onLine) return;
    setCargandoTerritorios(true);
    await supabase.from('secciones').update({ asignado_a: idUsuario || null }).eq('id', id);
    setCargandoTerritorios(false);
  };

  const reiniciarTerritorioEnBD = async (id) => {
    const confirmado = await mostrarConfirmacion(
      "Reiniciar Territorio",
      "¿Estás seguro? Esto regresará el territorio y TODAS sus casas a Pendiente (respetando las alertas rojas).",
      "warning",
      "Sí, reiniciar"
    );
    if (!confirmado || !navigator.onLine) return;

    setCargandoTerritorios(true);
    await supabase.from('secciones').update({ estado: 'pendiente' }).eq('id', id);
    
    await supabase.from('edificios')
      .update({ estado: 'pendiente' })
      .eq('seccion_id', id)
      .neq('estado', 'no_responde');
      
    setCargandoTerritorios(false);
  };

  const completarTerritorioEntero = async (id) => {
    const confirmado = await mostrarConfirmacion(
      "Completar Territorio",
      "¿Deseas marcar este territorio y TODAS sus casas como completados (respetando las alertas rojas)?",
      "success",
      "Completar"
    );
    if (!confirmado || !navigator.onLine) return;

    setCargandoTerritorios(true);
    await supabase.from('secciones').update({ estado: 'completado' }).eq('id', id);
    
    await supabase.from('edificios')
      .update({ estado: 'completado' })
      .eq('seccion_id', id)
      .neq('estado', 'no_responde');
      
    setCargandoTerritorios(false);
  };

  const actualizarNotasSeccionEnBD = async (id, notas) => {
    if(navigator.onLine) await supabase.from('secciones').update({ notas }).eq('id', id);
  };

  const actualizarDetallesSeccionEnBD = async (id, nombre, colorHex) => {
    if(navigator.onLine) await supabase.from('secciones').update({ nombre, color_hex: colorHex }).eq('id', id);
  };

  const crearSeccionBD = async (data) => { if(navigator.onLine) await supabase.from('secciones').insert([data]); }
  const crearEdificioBD = async (data) => { if(navigator.onLine) await supabase.from('edificios').insert([data]); }
  const actualizarEdificioBD = async (id, data) => { if(navigator.onLine) await supabase.from('edificios').update(data).eq('id', id); }
  const eliminarEdificioBD = async (id) => { if(navigator.onLine) await supabase.from('edificios').delete().eq('id', id); }

  return {
    secciones, edificios, cargandoTerritorios, cargarTerritoriosYCasas,
    eliminarSeccionEnBD, asignarTerritorioEnBD, reiniciarTerritorioEnBD, actualizarNotasSeccionEnBD, completarTerritorioEntero,
    crearSeccionBD, crearEdificioBD, actualizarEdificioBD, eliminarEdificioBD, reordenarTerritorioEnBD,
    actualizarDetallesSeccionEnBD,
    modoAhorro, reactivarTiempoReal
  };
}