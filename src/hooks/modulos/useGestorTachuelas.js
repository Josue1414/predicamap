// src/hooks/modulos/useGestorTachuelas.js
import { useState, useEffect } from 'react';
import { supabase } from '../../utilidades/clienteSupabase';

export default function useGestorTachuelas(targetCongId) {
  const [tachuelas, setTachuelas] = useState([]);
  const [cargandoTachuelas, setCargandoTachuelas] = useState(false);

  const cargarTachuelas = async () => {
    if (!targetCongId) return;
    setCargandoTachuelas(true);
    const { data, error } = await supabase
      .from('tachuelas')
      .select('*')
      .eq('congregacion_id', targetCongId)
      .order('creado_en', { ascending: true });
      
    if (!error) setTachuelas(data || []);
    setCargandoTachuelas(false);
  };

  useEffect(() => {
    cargarTachuelas();
    
    // ★ SUSCRIPCIÓN EN TIEMPO REAL ★
    if (!targetCongId) return;
    const canalTachuelas = supabase.channel('cambios-tachuelas')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tachuelas', filter: `congregacion_id=eq.${targetCongId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTachuelas(prev => [...prev, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setTachuelas(prev => prev.map(t => t.id === payload.new.id ? payload.new : t));
        } else if (payload.eventType === 'DELETE') {
          setTachuelas(prev => prev.filter(t => t.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(canalTachuelas); };
  }, [targetCongId]);

  const agregarTachuelaBD = async (lat, lng, titulo, notas = '') => {
    setCargandoTachuelas(true);
    await supabase.from('tachuelas').insert([{ congregacion_id: targetCongId, lat, lng, titulo, notas }]);
    setCargandoTachuelas(false);
  };

  const eliminarTachuelaBD = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta tachuela grupal del mapa?")) return;
    setCargandoTachuelas(true);
    await supabase.from('tachuelas').delete().eq('id', id);
    setCargandoTachuelas(false);
  };

  return { 
    tachuelas, cargandoTachuelas, agregarTachuelaBD, eliminarTachuelaBD, recargarTachuelas: cargarTachuelas
  };
}