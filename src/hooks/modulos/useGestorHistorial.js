// src/hooks/modulos/useGestorHistorial.js
import { useState, useEffect } from 'react';
import { supabase } from '../../utilidades/clienteSupabase';

export default function useGestorHistorial(targetCongId) {
  const [logs, setLogs] = useState([]);
  const [cargandoLogs, setCargandoLogs] = useState(false);

  const cargarLogs = async () => {
    if (!targetCongId) return;
    setCargandoLogs(true);
    
    // Hacemos la consulta integrando (JOIN) la tabla de perfiles para saber quién fue
    const { data, error } = await supabase
      .from('logs_actividad')
      .select(`
        *,
        perfiles ( nombre, rol )
      `)
      .eq('congregacion_id', targetCongId)
      .order('creado_en', { ascending: false })
      .limit(50); 

    if (!error) setLogs(data || []);
    setCargandoLogs(false);
  };

  // Se recarga automáticamente si cambia la congregación (modo simulador del Máster)
  useEffect(() => {
    cargarLogs();
  }, [targetCongId]);

  // Función maestra para registrar nuevas acciones en el futuro
  const registrarLog = async (usuarioId, accion, entidadTipo, detalles = '') => {
    if (!targetCongId || !usuarioId) return;
    await supabase.from('logs_actividad').insert([{
      congregacion_id: targetCongId,
      usuario_id: usuarioId,
      accion,
      entidad_tipo: entidadTipo,
      detalles
    }]);
    // Refrescamos la lista para que aparezca el nuevo log
    cargarLogs(); 
  };

  return { 
    logs, 
    cargandoLogs, 
    cargarLogs, 
    registrarLog 
  };
}