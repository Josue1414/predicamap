// src/vistas/VistaError.jsx
import React from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export default function VistaError({ tipoErrorDuro }) {
  // Extraemos el mensaje de la URL si viene desde un redireccionamiento
  const parametros = new URLSearchParams(window.location.search);
  const mensajeUrl = parametros.get('msg');

  let titulo = "Página no encontrada";
  let descripcion = "El enlace al que intentas acceder no existe, expiró o está mal escrito.";

  if (mensajeUrl) {
    titulo = "Acceso Denegado";
    descripcion = mensajeUrl;
  } else if (tipoErrorDuro === '404') {
    titulo = "Error 404";
    descripcion = "La página que buscas no se encuentra en el servidor.";
  }

  const volverAInicio = () => {
    // 1. Limpieza extrema: Borramos cualquier rastro del enlace para romper el ciclo PWA
    localStorage.removeItem('pm_ruta_inicio_pwa');
    // 2. Forzamos la redirección limpia al login
    window.location.replace('/login');
  };

  return (
    <div className="w-screen min-h-[100dvh] bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Círculos decorativos de fondo */}
      <div className="absolute w-96 h-96 bg-rose-600/10 rounded-full blur-3xl -top-20 -left-20 pointer-events-none" />
      <div className="absolute w-96 h-96 bg-orange-600/10 rounded-full blur-3xl -bottom-20 -right-20 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center animate-slide-up max-w-sm">
        <div className="bg-rose-500/10 p-5 rounded-full mb-6 border border-rose-500/20 shadow-inner">
          <AlertTriangle size={64} className="text-rose-500" strokeWidth={1.5} />
        </div>
        
        <h1 className="text-3xl font-black text-white mb-3 tracking-tight">
          {titulo}
        </h1>
        
        <p className="text-slate-400 text-sm mb-10 leading-relaxed px-4">
          {descripcion}
        </p>
        
        <button 
          onClick={volverAInicio}
          className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg border border-slate-700 active:scale-95"
        >
          <ArrowLeft size={18} /> Volver a Iniciar Sesión
        </button>
      </div>
    </div>
  );
}