// src/hooks/modulos/useEstadoGlobal.js
import { useState, useEffect } from 'react';
import { supabase } from '../../utilidades/clienteSupabase';

export default function useEstadoGlobal() {
  const [perfilUsuario, setPerfilUsuario] = useState(null);
  const [listaCongregaciones, setListaCongregaciones] = useState([]);
  const [congregacionContextoId, setCongregacionContextoId] = useState(null);
  const [congregacionActiva, setCongregacionActiva] = useState(null);
  const [usuariosEquipo, setUsuariosEquipo] = useState([]);
  const [cargandoGlobal, setCargandoGlobal] = useState(false);

  const targetCongId = congregacionContextoId || perfilUsuario?.congregacion_id;

  useEffect(() => {
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
      } catch (error) { console.error("Error global:", error.message); }
    };
    inicializarEcosistema();
  }, []);

  const refrescarDatosCongregacion = async () => {
    if (!targetCongId) return;
    setCargandoGlobal(true);
    try {
      const { data: cong } = await supabase.from('congregaciones').select('*').eq('id', targetCongId).single();
      setCongregacionActiva(cong);
      const { data: equipo } = await supabase.from('perfiles').select('*').eq('congregacion_id', targetCongId).order('nombre', { ascending: true });
      setUsuariosEquipo(equipo ? equipo.filter(u => u.rol !== 'Publicador') : []);
    } catch (error) { console.error(error); }
    finally { setCargandoGlobal(false); }
  };

  useEffect(() => { refrescarDatosCongregacion(); }, [targetCongId]);

  const guardarNombreCongregacionBD = async (nuevoNombre) => {
    if (!congregacionActiva || nuevoNombre === congregacionActiva.nombre) return;
    setCargandoGlobal(true);
    const { error } = await supabase.from('congregaciones').update({ nombre: nuevoNombre }).eq('id', congregacionActiva.id);
    if (!error) {
      setCongregacionActiva(prev => ({ ...prev, nombre: nuevoNombre }));
      if (perfilUsuario?.rol === 'Administrador Mayor') {
        setListaCongregaciones(prev => prev.map(c => c.id === congregacionActiva.id ? { ...c, nombre: nuevoNombre } : c));
      }
    }
    setCargandoGlobal(false);
  };

  const eliminarCongregacionMasterBD = async (idCongregacion) => {
    if (!window.confirm("⚠️ ATENCIÓN MÁSTER:\n\n¿Estás absolutamente seguro de eliminar esta congregación? Esto borrará permanentemente todos sus territorios y casas asociadas.")) return;
    setCargandoGlobal(true);
    const { error } = await supabase.from('congregaciones').delete().eq('id', idCongregacion);
    if (!error) {
      setListaCongregaciones(prev => prev.filter(c => c.id !== idCongregacion));
      if (congregacionContextoId === idCongregacion) setCongregacionContextoId(null);
    }
    setCargandoGlobal(false);
  };

  const eliminarMiembroEquipo = async (idMiembro) => {
    if (!window.confirm("¿Revocar el acceso a este usuario? Se eliminará su cuenta por completo.")) return;
    setCargandoGlobal(true);
    await supabase.from('perfiles').delete().eq('id', idMiembro);
    await refrescarDatosCongregacion();
  };

  const crearLinkInvitacion = (rolDestino, esNuevaCongregacion = false) => {
    if (!perfilUsuario) return '';
    const urlBase = window.location.origin;
    
    // ★ USANDO NUESTRO ESTÁNDAR DE ENCRIPTACIÓN DEL PROYECTO ★
    if (rolDestino === 'Publicador') {
      const enlaceCorto = congregacionActiva?.enlace_corto || 'central-demo';
      const payloadCifrado = btoa(encodeURIComponent(JSON.stringify({ v: enlaceCorto })));
      const linkPublico = `${urlBase}/v/${payloadCifrado}`;
      return `https://api.whatsapp.com/send?text=${encodeURIComponent(`Hola hermano, aquí tienes el enlace para ver y trabajar los territorios:\n\n${linkPublico}`)}`;
    }
    
    // Encriptación para registro y nuevas congregaciones
    const payloadCifrado = btoa(encodeURIComponent(JSON.stringify({
      r: rolDestino, nc: esNuevaCongregacion ? 1 : 0, c: esNuevaCongregacion ? null : targetCongId
    })));
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(`Hola hermano, te invito a PredicaMap como *${rolDestino}*:\n\n${urlBase}/registro?key=${payloadCifrado}`)}`;
  };

  return {
    perfilUsuario, listaCongregaciones, congregacionContextoId, setCongregacionContextoId,
    congregacionActiva, usuariosEquipo, cargandoGlobal, targetCongId,
    guardarNombreCongregacionBD, eliminarCongregacionMasterBD, eliminarMiembroEquipo, crearLinkInvitacion
  };
}