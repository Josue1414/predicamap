// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './utilidades/clienteSupabase';
import VistaLogin from './vistas/VistaLogin';
import VistaDashboard from './vistas/VistaDashboard';

export default function App() {
  const [sesion, setSesion] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // 1. Verificar sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSesion(session);
      setCargando(false);
    });

    // 2. Escuchar cambios (login, logout, token expirado)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evento, session) => {
      setSesion(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Pantalla de carga mientras Supabase verifica el token
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
      <Routes>
        {/* RUTA DE LOGIN: Si ya hay sesión, lo patea al mapa */}
        <Route 
          path="/login" 
          element={!sesion ? <VistaLogin /> : <Navigate to="/" replace />} 
        />

        {/* RUTA PRINCIPAL (MAPA): Si no hay sesión, lo patea al login */}
        <Route 
          path="/" 
          element={sesion ? <VistaDashboard /> : <Navigate to="/login" replace />} 
        />

        {/* RUTA COMODÍN (Error 404): Redirige a la raíz si escribe una URL que no existe */}
        <Route 
          path="*" 
          element={<Navigate to="/" replace />} 
        />
      </Routes>
    </BrowserRouter>
  );
}