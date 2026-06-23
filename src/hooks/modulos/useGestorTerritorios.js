// src/hooks/modulos/useGestorTerritorios.js
import { useState, useEffect } from 'react';
import { supabase } from '../../utilidades/clienteSupabase';

export default function useGestorTerritorios(targetCongId, esSimulacion, onCentrarMapa) {
  const [secciones, setSecciones] = useState([]);
  const [edificios, setEdificios] = useState([]);
  const [cargandoTerritorios, setCargandoTerritorios] = useState(false);

  const cargarTerritoriosYCasas = async () => {
    if (!targetCongId) return;
    setCargandoTerritorios(true);
    try {
      const { data: secs } = await supabase.from('secciones').select('*').eq('congregacion_id', targetCongId).order('creado_en', { ascending: true });
      const formateadas = (secs || []).map(item => ({
        id: item.id, nombre: item.nombre, colorHex: item.color_hex, 
        coordenadas: item.coordenadas, notas: item.notas, asignado_a: item.asignado_a,
        estado: item.estado // <-- AHORA LEEMOS EL ESTADO DEL TERRITORIO
      }));
      setSecciones(formateadas);

      if (formateadas.length > 0 && esSimulacion) {
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

  useEffect(() => { cargarTerritoriosYCasas(); }, [targetCongId]);

  const eliminarSeccionEnBD = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este territorio? Se borrarán en cascada todos los checks asociados a él.")) return;
    setCargandoTerritorios(true);
    const { error } = await supabase.from('secciones').delete().eq('id', id);
    if (!error) await cargarTerritoriosYCasas();
    setCargandoTerritorios(false);
  };

  const asignarTerritorioEnBD = async (id, idUsuario) => {
    setCargandoTerritorios(true);
    const { error } = await supabase.from('secciones').update({ asignado_a: idUsuario || null }).eq('id', id);
    if (!error) await cargarTerritoriosYCasas();
    setCargandoTerritorios(false);
  };

  const reiniciarTerritorioEnBD = async (id) => {
    if (!window.confirm("¿Estás seguro? Esto regresará el territorio y TODAS sus casas a Pendiente.")) return;
    setCargandoTerritorios(true);
    // ACTUALIZA TANTO EL TERRITORIO COMO LAS CASAS
    await supabase.from('secciones').update({ estado: 'pendiente' }).eq('id', id);
    await supabase.from('edificios').update({ estado: 'pendiente' }).eq('seccion_id', id);
    await cargarTerritoriosYCasas();
    setCargandoTerritorios(false);
  };

  const completarTerritorioEntero = async (id) => {
    if (!window.confirm("¿Marcar este territorio y TODAS sus casas como completados?")) return;
    setCargandoTerritorios(true);
    // ACTUALIZA TANTO EL TERRITORIO COMO LAS CASAS
    await supabase.from('secciones').update({ estado: 'completado' }).eq('id', id);
    await supabase.from('edificios').update({ estado: 'completado' }).eq('seccion_id', id);
    await cargarTerritoriosYCasas();
    setCargandoTerritorios(false);
  };

  const actualizarNotasSeccionEnBD = async (id, notas) => {
    const { error } = await supabase.from('secciones').update({ notas }).eq('id', id);
    if (!error) setSecciones(prev => prev.map(s => s.id === id ? { ...s, notas } : s));
  };

  const crearSeccionBD = async (data) => await supabase.from('secciones').insert([data]);
  const crearEdificioBD = async (data) => await supabase.from('edificios').insert([data]);
  const actualizarEdificioBD = async (id, data) => await supabase.from('edificios').update(data).eq('id', id);
  const eliminarEdificioBD = async (id) => await supabase.from('edificios').delete().eq('id', id);

  return {
    secciones, edificios, cargandoTerritorios, cargarTerritoriosYCasas,
    eliminarSeccionEnBD, asignarTerritorioEnBD, reiniciarTerritorioEnBD, actualizarNotasSeccionEnBD, completarTerritorioEntero,
    crearSeccionBD, crearEdificioBD, actualizarEdificioBD, eliminarEdificioBD
  };
}