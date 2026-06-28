// src/componentes/ControladorVista.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../utilidades/clienteSupabase';
import VistaLogin from '../vistas/VistaLogin';
import VistaDashboard from '../vistas/VistaDashboard';
import VistaPublicador from '../vistas/VistaPublicador';
import VistaRecuperar from '../vistas/VistaRecuperar'; // ★ Importamos la nueva vista

export default function ControladorVista() {
  const [sesion, setSesion] = useState(null);
  const [cargando, setCargando] = useState(true);
  
  // ★ NUEVO: Estado para saber si estamos en modo recuperación
  const [enModoRecuperacion, setEnModoRecuperacion] = useState(false);

  useEffect(() => {
    // 1. Verificamos la ruta actual de la URL
    const pathname = window.location.pathname;

    // ★ NUEVO: Si la URL es /recuperar, forzamos esa vista
    if (pathname === '/recuperar') {
      setEnModoRecuperacion(true);
      setCargando(false);
      return;
    }

    // 2. Si la ruta es /v/... significa que es un publicador invitado anónimo
    if (pathname.startsWith('/v/')) {
      setSesion({ tipo: 'publicador_anonimo' });
      setCargando(false);
      return;
    }

    // 3. Flujo normal (Usuarios registrados)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSesion(session);
      setCargando(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Si ocurre un evento de recuperación de contraseña (PASSWORD_RECOVERY), 
      // Supabase nos avisa aquí, pero la URL /recuperar ya lo habrá atrapado arriba.
      setSesion(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (cargando) {
    return <div className="w-screen h-screen flex items-center justify-center bg-slate-900 text-indigo-500 font-bold">Cargando Sistema...</div>;
  }

  // ★ NUEVO: Si estamos en modo recuperación, mostramos la vista especial
  if (enModoRecuperacion) {
    return <VistaRecuperar />;
  }

  // Si es un publicador invitado, mostramos la vista restringida
  if (sesion?.tipo === 'publicador_anonimo') {
    return <VistaPublicador />;
  }

  // Si no hay sesión normal, mostramos el Login
  if (!sesion) {
    return <VistaLogin />;
  }

  // Si hay sesión normal, mostramos el Dashboard
  return <VistaDashboard key={sesion.user.id} />;
}