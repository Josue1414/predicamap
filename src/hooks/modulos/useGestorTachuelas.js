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
  }, [targetCongId]);

  const agregarTachuelaBD = async (lat, lng, titulo, notas = '') => {
    setCargandoTachuelas(true);
    const { error } = await supabase.from('tachuelas').insert([{ 
      congregacion_id: targetCongId, lat, lng, titulo, notas 
    }]);
    if (!error) await cargarTachuelas();
    setCargandoTachuelas(false);
  };

  const eliminarTachuelaBD = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta tachuela grupal del mapa?")) return;
    setCargandoTachuelas(true);
    const { error } = await supabase.from('tachuelas').delete().eq('id', id);
    if (!error) await cargarTachuelas();
    setCargandoTachuelas(false);
  };

  return { 
    tachuelas, 
    cargandoTachuelas, 
    agregarTachuelaBD, 
    eliminarTachuelaBD,
    recargarTachuelas: cargarTachuelas
  };
}