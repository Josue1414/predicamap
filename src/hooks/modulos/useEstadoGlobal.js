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
          // ★ INYECTAMOS EL EMAIL DIRECTAMENTE AL OBJETO DEL PERFIL ★
          setPerfilUsuario({ ...perfil, email: user.email });
          
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

  // ★ NUEVA FUNCIÓN: ACTUALIZAR EL NOMBRE DEL USUARIO ★
  const actualizarNombrePerfilBD = async (nuevoNombre) => {
    if (!perfilUsuario || !nuevoNombre.trim() || nuevoNombre === perfilUsuario.nombre) return;
    setCargandoGlobal(true);
    const { error } = await supabase.from('perfiles').update({ nombre: nuevoNombre.trim() }).eq('id', perfilUsuario.id);
    if (!error) {
      setPerfilUsuario(prev => ({ ...prev, nombre: nuevoNombre.trim() }));
    } else {
      console.error("Error al actualizar nombre:", error.message);
    }
    setCargandoGlobal(false);
  };

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
    
    // Agregamos manejo de errores para detectar bloqueos de RLS en Supabase
    const { error } = await supabase.from('perfiles').delete().eq('id', idMiembro);
    
    if (error) {
      alert(`No se pudo eliminar al usuario. Es posible que las políticas de seguridad (RLS) de Supabase estén bloqueando la acción.\n\nDetalle técnico: ${error.message}`);
      console.error("Error al eliminar usuario:", error);
    } else {
      await refrescarDatosCongregacion();
    }
    
    setCargandoGlobal(false);
  };

  const crearLinkInvitacion = (rolDestino, esNuevaCongregacion = false) => {
    if (!perfilUsuario) return '';
    const urlBase = window.location.origin;
    
    if (rolDestino === 'Publicador') {
      const enlaceCorto = congregacionActiva?.enlace_corto || 'central-demo';
      const payloadCifrado = btoa(encodeURIComponent(JSON.stringify({ v: enlaceCorto })));
      const linkPublico = `${urlBase}/v/${payloadCifrado}`;
      return `https://api.whatsapp.com/send?text=${encodeURIComponent(`Hola hermano, aquí tienes el enlace para ver y trabajar los territorios:\n\n${linkPublico}`)}`;
    }
    
    const payloadCifrado = btoa(encodeURIComponent(JSON.stringify({
      r: rolDestino, nc: esNuevaCongregacion ? 1 : 0, c: esNuevaCongregacion ? null : targetCongId
    })));
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(`Hola hermano, te invito a PredicaMap como *${rolDestino}*:\n\n${urlBase}/registro?key=${payloadCifrado}`)}`;
  };

  return {
    perfilUsuario, listaCongregaciones, congregacionContextoId, setCongregacionContextoId,
    congregacionActiva, usuariosEquipo, cargandoGlobal, targetCongId,
    guardarNombreCongregacionBD, eliminarCongregacionMasterBD, eliminarMiembroEquipo, crearLinkInvitacion,
    actualizarNombrePerfilBD // <-- EXPORTAMOS LA NUEVA FUNCIÓN
  };
}