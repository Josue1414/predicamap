// src/vistas/VistaLogin.jsx
import React, { useState } from 'react';
import { supabase } from '../utilidades/clienteSupabase';
import { MapPin, Mail, Lock, User, LogIn } from 'lucide-react';

export default function VistaLogin() {
  const [esRegistro, setEsRegistro] = useState(false);
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [nombre, setNombre] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  const manejarAutenticacion = async (evento) => {
    evento.preventDefault();
    setCargando(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      if (esRegistro) {
        // Flujo de Registro
        const { error } = await supabase.auth.signUp({
          email: correo,
          password: contrasena,
          options: {
            data: { nombre: nombre } // Esto lo lee el Trigger de la base de datos
          }
        });
        if (error) throw error;
        setMensaje({ tipo: 'exito', texto: '¡Registro exitoso! Ya puedes iniciar sesión.' });
        setEsRegistro(false);
      } else {
        // Flujo de Inicio de Sesión
        const { error } = await supabase.auth.signInWithPassword({
          email: correo,
          password: contrasena
        });
        if (error) throw error;
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: error.message });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-slate-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Efecto decorativo de fondo */}
      <div className="absolute w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -top-20 -left-20" />
      <div className="absolute w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl -bottom-20 -right-20" />

      <div className="w-full max-w-sm bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl relative z-10 text-xs">
        
        {/* Logotipo */}
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/30 text-white mb-2">
            <MapPin size={28} className="animate-pulse" />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">PredicaMap</h2>
          <p className="text-slate-400 text-[11px] mt-1 text-center">Control y marcación de territorios de predicación</p>
        </div>

        {/* Alertas de Mensajes */}
        {mensaje.texto && (
          <div className={`p-3 rounded-xl mb-4 border font-medium ${
            mensaje.tipo === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}>
            {mensaje.texto}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={manejarAutenticacion} className="space-y-3.5">
          {esRegistro && (
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Nombre Completo</label>
              <div className="relative flex items-center">
                <User size={14} className="absolute left-3 text-slate-500" />
                <input required type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Juan Pérez" className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Correo Electrónico</label>
            <div className="relative flex items-center">
              <Mail size={14} className="absolute left-3 text-slate-500" />
              <input required type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="tu_correo@gmail.com" className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500" />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Contraseña</label>
            <div className="relative flex items-center">
              <Lock size={14} className="absolute left-3 text-slate-500" />
              <input required type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} placeholder="••••••••" className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500" />
            </div>
          </div>

          <button disabled={cargando} type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/10 transition-all flex items-center justify-center gap-1.5 active:scale-[0.99]">
            <LogIn size={15} />
            {cargando ? 'Procesando...' : esRegistro ? 'Registrar Cuenta de Admin' : 'Entrar al Sistema'}
          </button>
        </form>

        {/* Selector de Modo */}
        <div className="mt-5 text-center">
          <button onClick={() => { setEsRegistro(!esRegistro); setMensaje({ tipo: '', texto: '' }); }} className="text-indigo-400 hover:underline font-semibold">
            {esRegistro ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí'}
          </button>
        </div>

      </div>
    </div>
  );
}