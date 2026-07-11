// src/hooks/modulos/useGestorHistorial.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../utilidades/clienteSupabase';

export default function useGestorHistorial(targetCongId) {
  const [logs, setLogs] = useState([]);
  const [cargandoLogs, setCargandoLogs] = useState(false);
  
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const LIMIT_POR_PAGINA = 10;

  const cargarLogs = useCallback(async (pag = 1) => {
    if (!targetCongId) return;
    setCargandoLogs(true);
    
    const haceDosMeses = new Date();
    haceDosMeses.setMonth(haceDosMeses.getMonth() - 2);

    const from = (pag - 1) * LIMIT_POR_PAGINA;
    const to = from + LIMIT_POR_PAGINA - 1;

    const { data, error, count } = await supabase
      .from('logs_actividad')
      .select(`*, perfiles ( nombre, rol )`, { count: 'exact' })
      .eq('congregacion_id', targetCongId)
      .gte('creado_en', haceDosMeses.toISOString()) 
      .order('creado_en', { ascending: false })
      .range(from, to); 

    if (!error) {
      setLogs(data || []);
      setTotalPaginas(Math.ceil((count || 0) / LIMIT_POR_PAGINA) || 1);
      setPagina(pag);
    }
    setCargandoLogs(false);
  }, [targetCongId]);

  useEffect(() => {
    cargarLogs(1);
    
    // ★ SUSCRIPCIÓN EN TIEMPO REAL ★
    if (!targetCongId) return;
    const canalHistorial = supabase.channel('cambios-historial')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'logs_actividad', filter: `congregacion_id=eq.${targetCongId}` }, () => {
        // Como el registro necesita hacer join con el nombre de usuario, recargamos la página 1 al instante
        cargarLogs(1);
      })
      .subscribe();

    return () => { supabase.removeChannel(canalHistorial); };
  }, [targetCongId, cargarLogs]);

  const registrarLog = useCallback(async (usuarioId, accion, entidadTipo, detalles = '') => {
    if (!targetCongId || !usuarioId) return;

    let textoFinal = detalles || '';
    
    // Mejor formato automático para los estados
    textoFinal = textoFinal.replace(/estado completado/gi, 'estado 🟢 Verde (Completado)');
    textoFinal = textoFinal.replace(/estado pendiente/gi, 'estado 🟠 Naranja (Pendiente)');
    textoFinal = textoFinal.replace(/estado no_responde/gi, 'estado 🔴 Rojo (No visitar)');

    if (!textoFinal.trim()) textoFinal = 'Acción registrada';

    await supabase.from('logs_actividad').insert([{
      congregacion_id: targetCongId, usuario_id: usuarioId, accion, entidad_tipo: entidadTipo, detalles: textoFinal
    }]);
  }, [targetCongId]);

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) cargarLogs(nuevaPagina);
  };

  return { 
    logs, cargandoLogs, cargarLogs, registrarLog, pagina, totalPaginas, cambiarPagina 
  };
}