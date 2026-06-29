// src/hooks/modulos/useGestorTerritorios.js
import { useState, useEffect } from 'react';
import { supabase } from '../../utilidades/clienteSupabase';

export default function useGestorTerritorios(targetCongId, esSimulacion, onCentrarMapa) {
  const [secciones, setSecciones] = useState([]);
  const [edificios, setEdificios] = useState([]);
  const [cargandoTerritorios, setCargandoTerritorios] = useState(false);

  const cargarTerritoriosYCasas = async (esCargaInicial = false) => {
    if (!targetCongId) return;
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

      if (formateadas.length > 0 && esCargaInicial) {
        let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
        formateadas.forEach(s => s.coordenadas.forEach(([lat, lng]) => {
          if (lat < minLat) minLat = lat; if (lat > maxLat) maxLat = lat;
          if (lng < minLng) minLng = lng; if (lng > maxLng) maxLng = lng;
        }));
        onCentrarMapa([(minLat + maxLat) / 2, (minLng + maxLng) / 2]);
      }

      const secIds = formateadas.map(s => s.id);
      if (secIds.length > 0) {
        const { data: edis } = await supabase.from('edificios').select('*').in('seccion_id', secIds);
        setEdificios(edis || []);
      } else { setEdificios([]); }
    } catch (error) { console.error(error); }
    finally { setCargandoTerritorios(false); }
  };

  useEffect(() => { 
    cargarTerritoriosYCasas(true); 
    
    // ★ SUSCRIPCIÓN EN TIEMPO REAL ★
    if (!targetCongId) return;

    const canalMapa = supabase.channel('cambios-mapa')
      // Escuchar Territorios (Secciones)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'secciones', filter: `congregacion_id=eq.${targetCongId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const nuevaSec = {
            id: payload.new.id, nombre: payload.new.nombre, colorHex: payload.new.color_hex, 
            coordenadas: payload.new.coordenadas, notas: payload.new.notas, asignado_a: payload.new.asignado_a,
            estado: payload.new.estado, orden: payload.new.orden 
          };
          setSecciones(prev => [...prev, nuevaSec].sort((a, b) => a.orden - b.orden));
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
      // Escuchar Calles y Casas (Edificios)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'edificios' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setEdificios(prev => [...prev, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setEdificios(prev => prev.map(e => e.id === payload.new.id ? payload.new : e));
        } else if (payload.eventType === 'DELETE') {
          setEdificios(prev => prev.filter(e => e.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(canalMapa); };
  }, [targetCongId]);

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

    await Promise.all(arregloActualizado.map(t => supabase.from('secciones').update({ orden: t.orden }).eq('id', t.id)));
  };

  const eliminarSeccionEnBD = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este territorio? Se borrarán en cascada todos los checks asociados a él.")) return;
    setCargandoTerritorios(true);
    await supabase.from('secciones').delete().eq('id', id);
    // El realtime actualizará la pantalla automáticamente, solo quitamos el estado de carga
    setCargandoTerritorios(false);
  };

  const asignarTerritorioEnBD = async (id, idUsuario) => {
    setCargandoTerritorios(true);
    await supabase.from('secciones').update({ asignado_a: idUsuario || null }).eq('id', id);
    setCargandoTerritorios(false);
  };

  const reiniciarTerritorioEnBD = async (id) => {
    if (!window.confirm("¿Estás seguro? Esto regresará el territorio y TODAS sus casas a Pendiente.")) return;
    setCargandoTerritorios(true);
    await supabase.from('secciones').update({ estado: 'pendiente' }).eq('id', id);
    await supabase.from('edificios').update({ estado: 'pendiente' }).eq('seccion_id', id);
    setCargandoTerritorios(false);
  };

  const completarTerritorioEntero = async (id) => {
    if (!window.confirm("¿Marcar este territorio y TODAS sus casas como completados?")) return;
    setCargandoTerritorios(true);
    await supabase.from('secciones').update({ estado: 'completado' }).eq('id', id);
    await supabase.from('edificios').update({ estado: 'completado' }).eq('seccion_id', id);
    setCargandoTerritorios(false);
  };

  const actualizarNotasSeccionEnBD = async (id, notas) => {
    await supabase.from('secciones').update({ notas }).eq('id', id);
  };

  const crearSeccionBD = async (data) => await supabase.from('secciones').insert([data]);
  const crearEdificioBD = async (data) => await supabase.from('edificios').insert([data]);
  const actualizarEdificioBD = async (id, data) => await supabase.from('edificios').update(data).eq('id', id);
  const eliminarEdificioBD = async (id) => await supabase.from('edificios').delete().eq('id', id);

  return {
    secciones, edificios, cargandoTerritorios, cargarTerritoriosYCasas,
    eliminarSeccionEnBD, asignarTerritorioEnBD, reiniciarTerritorioEnBD, actualizarNotasSeccionEnBD, completarTerritorioEntero,
    crearSeccionBD, crearEdificioBD, actualizarEdificioBD, eliminarEdificioBD, reordenarTerritorioEnBD
  };
}