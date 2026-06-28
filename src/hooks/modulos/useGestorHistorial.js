// src/hooks/modulos/useGestorHistorial.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../utilidades/clienteSupabase';

export default function useGestorHistorial(targetCongId) {
  const [logs, setLogs] = useState([]);
  const [cargandoLogs, setCargandoLogs] = useState(false);
  
  // ★ NUEVOS ESTADOS DE PAGINACIÓN ★
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const LIMIT_POR_PAGINA = 10;

  const cargarLogs = useCallback(async (pag = 1) => {
    if (!targetCongId) return;
    setCargandoLogs(true);
    
    // Límite estricto de 2 meses para ahorrar almacenamiento
    const haceDosMeses = new Date();
    haceDosMeses.setMonth(haceDosMeses.getMonth() - 2);

    // Matemáticas para calcular qué registros traer (ej. del 0 al 9, del 10 al 19)
    const from = (pag - 1) * LIMIT_POR_PAGINA;
    const to = from + LIMIT_POR_PAGINA - 1;

    // Con { count: 'exact' } Supabase nos dice cuántos registros hay en total
    const { data, error, count } = await supabase
      .from('logs_actividad')
      .select(`*, perfiles ( nombre, rol )`, { count: 'exact' })
      .eq('congregacion_id', targetCongId)
      .gte('creado_en', haceDosMeses.toISOString()) 
      .order('creado_en', { ascending: false })
      .range(from, to); 

    if (!error) {
      setLogs(data || []);
      // Calculamos el total de páginas (ej. 25 registros / 10 = 3 páginas)
      setTotalPaginas(Math.ceil((count || 0) / LIMIT_POR_PAGINA) || 1);
      setPagina(pag);
    }
    setCargandoLogs(false);
  }, [targetCongId]);

  useEffect(() => {
    cargarLogs(1); // Cargar siempre la página 1 al inicio
  }, [cargarLogs]);

  // ★ LIMPIEZA INTELIGENTE DE TEXTOS ★
  const registrarLog = useCallback(async (usuarioId, accion, entidadTipo, detalles = '') => {
    if (!targetCongId || !usuarioId) return;

    let textoFinal = detalles || '';
    
    // 1. Limpiar undefined y null
    textoFinal = textoFinal.replace(/undefined/gi, 'Sin notas adicionales');
    textoFinal = textoFinal.replace(/null/gi, 'Sin notas adicionales');
    
    // 2. Mapear los estados técnicos a colores legibles para PredicaMap
    textoFinal = textoFinal.replace(/(estado en|estado a)[\s:]*completado/gi, 'Estado a 🟢 Verde (Completado)');
    textoFinal = textoFinal.replace(/(estado en|estado a)[\s:]*pendiente/gi, 'Estado a 🟠 Naranja (Pendiente)');
    textoFinal = textoFinal.replace(/(estado en|estado a)[\s:]*no_responde/gi, 'Estado a 🔴 Rojo (No visitar)');

    // 3. Fallback en caso de que quede vacío
    if (!textoFinal.trim()) textoFinal = 'Acción registrada';

    await supabase.from('logs_actividad').insert([{
      congregacion_id: targetCongId,
      usuario_id: usuarioId,
      accion,
      entidad_tipo: entidadTipo,
      detalles: textoFinal
    }]);
    
    cargarLogs(1); // Si hay una nueva acción, refrescamos volviendo a la página 1
  }, [targetCongId, cargarLogs]);

  // Función para avanzar o retroceder
  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      cargarLogs(nuevaPagina);
    }
  };

  return { 
    logs, 
    cargandoLogs, 
    cargarLogs, 
    registrarLog,
    pagina,          // <-- Extraemos la página actual
    totalPaginas,    // <-- Extraemos el total
    cambiarPagina    // <-- Extraemos la función
  };
}