// src/hooks/modulos/useEstadoGlobal.js
import { useState, useEffect } from 'react';
import { supabase } from '../../utilidades/clienteSupabase';
import { useAlertas } from '../../context/ContextoAlertas';

export default function useEstadoGlobal() {
  const { mostrarAlerta, mostrarConfirmacion } = useAlertas();

  const [perfilUsuario, setPerfilUsuario] = useState(null);
  const [listaCongregaciones, setListaCongregaciones] = useState([]);
  const [congregacionContextoId, setCongregacionContextoId] = useState(null);
  const [congregacionActiva, setCongregacionActiva] = useState(null);
  const [usuariosEquipo, setUsuariosEquipo] = useState([]);
  const [cargandoGlobal, setCargandoGlobal] = useState(false);

  const targetCongId = congregacionContextoId || perfilUsuario?.congregacion_id;

  // ★ 1. AUTO-GUARDADO EN CACHÉ (LocalStorage)
  useEffect(() => {
    if (perfilUsuario) localStorage.setItem('pm_perfil_usuario', JSON.stringify(perfilUsuario));
  }, [perfilUsuario]);

  useEffect(() => {
    if (listaCongregaciones.length > 0) localStorage.setItem('pm_lista_congs', JSON.stringify(listaCongregaciones));
  }, [listaCongregaciones]);

  useEffect(() => {
    if (targetCongId && congregacionActiva) localStorage.setItem(`pm_cong_activa_${targetCongId}`, JSON.stringify(congregacionActiva));
  }, [congregacionActiva, targetCongId]);

  useEffect(() => {
    if (targetCongId && usuariosEquipo.length > 0) localStorage.setItem(`pm_equipo_${targetCongId}`, JSON.stringify(usuariosEquipo));
  }, [usuariosEquipo, targetCongId]);

  // ★ 2. INICIALIZACIÓN OFFLINE FIRST
  useEffect(() => {
    const inicializarEcosistema = async () => {
      // Cargar caché local primero
      const perfilLocal = localStorage.getItem('pm_perfil_usuario');
      const listaCongsLocal = localStorage.getItem('pm_lista_congs');
      
      if (perfilLocal) setPerfilUsuario(JSON.parse(perfilLocal));
      if (listaCongsLocal) setListaCongregaciones(JSON.parse(listaCongsLocal));

      // Detener si no hay internet
      if (!navigator.onLine) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: perfil } = await supabase.from('perfiles').select('*').eq('id', user.id).single();
        if (perfil) {
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

    // Cargar caché local de la congregación y el equipo
    const congLocal = localStorage.getItem(`pm_cong_activa_${targetCongId}`);
    const equipoLocal = localStorage.getItem(`pm_equipo_${targetCongId}`);
    
    if (congLocal) setCongregacionActiva(JSON.parse(congLocal));
    if (equipoLocal) setUsuariosEquipo(JSON.parse(equipoLocal));

    // Detener si no hay internet
    if (!navigator.onLine) return;

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

  const actualizarNombrePerfilBD = async (nuevoNombre) => {
    if (!perfilUsuario || !nuevoNombre.trim() || nuevoNombre === perfilUsuario.nombre) return;
    
    // Actualización optimista local
    setPerfilUsuario(prev => ({ ...prev, nombre: nuevoNombre.trim() }));
    
    if (!navigator.onLine) return;

    setCargandoGlobal(true);
    const { error } = await supabase.from('perfiles').update({ nombre: nuevoNombre.trim() }).eq('id', perfilUsuario.id);
    if (error) {
      console.error("Error al actualizar nombre:", error.message);
    }
    setCargandoGlobal(false);
  };

  const guardarNombreCongregacionBD = async (nuevoNombre) => {
    if (!congregacionActiva || nuevoNombre === congregacionActiva.nombre) return;
    
    // Actualización optimista local
    setCongregacionActiva(prev => ({ ...prev, nombre: nuevoNombre }));
    if (perfilUsuario?.rol === 'Administrador Mayor') {
      setListaCongregaciones(prev => prev.map(c => c.id === congregacionActiva.id ? { ...c, nombre: nuevoNombre } : c));
    }

    if (!navigator.onLine) return;

    setCargandoGlobal(true);
    const { error } = await supabase.from('congregaciones').update({ nombre: nuevoNombre }).eq('id', congregacionActiva.id);
    if (error) console.error("Error guardando nombre de congregación");
    setCargandoGlobal(false);
  };

  const eliminarCongregacionMasterBD = async (idCongregacion) => {
    const confirmado = await mostrarConfirmacion(
      "ATENCIÓN MÁSTER",
      "¿Estás absolutamente seguro de eliminar esta congregación? Esto borrará permanentemente todos sus territorios y casas asociadas.",
      "danger",
      "Sí, eliminar"
    );
    if (!confirmado) return;

    if (!navigator.onLine) {
      await mostrarAlerta("Sin conexión", "Necesitas conexión a internet para eliminar una congregación.", "warning");
      return;
    }

    setCargandoGlobal(true);
    const { error } = await supabase.from('congregaciones').delete().eq('id', idCongregacion);
    if (!error) {
      setListaCongregaciones(prev => prev.filter(c => c.id !== idCongregacion));
      if (congregacionContextoId === idCongregacion) setCongregacionContextoId(null);
    }
    setCargandoGlobal(false);
  };

  const eliminarMiembroEquipo = async (idMiembro) => {
    if (!navigator.onLine) {
      await mostrarAlerta("Sin conexión", "Necesitas conexión a internet para eliminar usuarios.", "warning");
      return;
    }

    setCargandoGlobal(true);
    const { error } = await supabase.from('perfiles').delete().eq('id', idMiembro);
    
    if (error) {
      await mostrarAlerta(
        "Error de eliminación", 
        `No se pudo eliminar al usuario. Es posible que las políticas de seguridad (RLS) de Supabase estén bloqueando la acción.\n\nDetalle técnico: ${error.message}`, 
        "danger"
      );
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
    actualizarNombrePerfilBD
  };
}