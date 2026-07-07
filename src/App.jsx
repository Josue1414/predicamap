// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './utilidades/clienteSupabase';
import VistaLogin from './vistas/VistaLogin';
import VistaDashboard from './vistas/VistaDashboard';
import VistaPublicador from './vistas/VistaPublicador'; 
import VistaRecuperar from './vistas/VistaRecuperar';

// ★ IMPORTAMOS LA NUEVA VISTA DE ERRORES ★
import VistaError from './vistas/VistaError';

// ★ IMPORTAMOS LOS PROVEEDORES ★
import { ProveedorModoMapa } from './context/ContextoModoMapa';
import { ProveedorAlertas } from './context/ContextoAlertas'; 

// ★ 1. IMPORTAMOS EL MODAL DE PRIVACIDAD ★
import ModalPrivacidad from './componentes/ModalPrivacidad';

export default function App() {
  const [sesion, setSesion] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // ★ INTERCEPCIÓN PWA: Enrutamiento inteligente para publicadores
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    const rutaPwa = localStorage.getItem('pm_ruta_inicio_pwa');

    // Si la app está instalada, existe una ruta guardada y estamos en la raíz o el login
    if (isStandalone && rutaPwa && (window.location.pathname === '/' || window.location.pathname === '/login')) {
      window.location.replace(rutaPwa);
      return; // Detenemos la ejecución aquí para permitir la redirección inmediata
    }

    // 1. Verificar sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSesion(session);
      setCargando(false);
    });

    // 2. Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((evento, session) => {
      
      if (evento === 'PASSWORD_RECOVERY') {
        window.location.href = '/recuperar';
      }
      
      setSesion(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (cargando) {
    return (
      <div className="w-screen h-screen bg-slate-900 flex items-center justify-center flex-col gap-3">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-400">Verificando credenciales...</span>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {/* ★ ENVOLVEMOS TODO EN LOS PROVEEDORES ★ */}
      <ProveedorAlertas>
        <ProveedorModoMapa>
          
          {/* ★ 2. AGREGAMOS EL MODAL AQUÍ ★ */}
          <ModalPrivacidad />

          <Routes>
            
            {/* RUTA PÚBLICA (PUBLICADOR) */}
            <Route 
              path="/v/:enlaceCorto" 
              element={<VistaPublicador />} 
            />

            {/* RUTA DE LOGIN */}
            <Route 
              path="/login" 
              element={!sesion ? <VistaLogin /> : <Navigate to="/" replace />} 
            />

            {/* RUTA: REGISTRO PARA ATRAPAR INVITACIONES */}
            <Route 
              path="/registro" 
              element={!sesion ? <VistaLogin /> : <Navigate to="/" replace />} 
            />

            {/* RUTA: RECUPERACIÓN DE CONTRASEÑA */}
            <Route 
              path="/recuperar" 
              element={<VistaRecuperar />} 
            />

            {/* ★ NUEVA RUTA DE ERRORES EXPLÍCITOS ★ */}
            <Route 
              path="/error" 
              element={<VistaError />} 
            />

            {/* RUTA PRINCIPAL (MAPA DASHBOARD ADMINISTRATIVO) */}
            <Route 
              path="/" 
              element={sesion ? <VistaDashboard /> : <Navigate to="/login" replace />} 
            />

            {/* ★ RUTA COMODÍN (Error 404 - Muestra pantalla de error) ★ */}
            <Route 
              path="*" 
              element={<VistaError tipoErrorDuro="404" />} 
            />
            
          </Routes>
        </ProveedorModoMapa>
      </ProveedorAlertas>
    </BrowserRouter>
  );
}