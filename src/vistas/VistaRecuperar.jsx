// src/vistas/VistaRecuperar.jsx
import React, { useState } from 'react';
import { supabase } from '../utilidades/clienteSupabase';
import { Lock, Save, Eye, EyeOff } from 'lucide-react';

export default function VistaRecuperar() {
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  const manejarCambioContrasena = async (e) => {
    e.preventDefault();
    if (nuevaContrasena.length < 6) {
      return setMensaje({ tipo: 'error', texto: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    setCargando(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      const { error } = await supabase.auth.updateUser({ password: nuevaContrasena });
      if (error) throw error;
      
      setMensaje({ tipo: 'exito', texto: '✅ Contraseña actualizada con éxito. Redirigiendo al sistema...' });
      
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);

    } catch (error) {
      setMensaje({ tipo: 'error', texto: error.message });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-slate-900 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl -top-20 -left-20" />
      <div className="absolute w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -bottom-20 -right-20" />

      <div className="w-full max-w-sm bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl relative z-10 text-xs">
        
        <div className="flex flex-col items-center mb-6">
          {/* ★ LOGO AÑADIDO EN LA RECUPERACIÓN ★ */}
          <div className="w-20 h-20 bg-white rounded-2xl shadow-lg shadow-emerald-600/20 p-1.5 mb-3 flex items-center justify-center">
            <img 
              src="https://mzardqwfmxdabsjmzwkk.supabase.co/storage/v1/object/public/Logo%20PredicaMap/Logo-PredicaMap.svg" 
              alt="Logo PredicaMap" 
              className="w-full h-full object-contain" 
            />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">Nueva Contraseña</h2>
          <p className="text-slate-400 text-[11px] mt-1 text-center">Escribe tu nueva contraseña segura</p>
        </div>

        {mensaje.texto && (
          <div className={`p-3 rounded-xl mb-4 border font-medium flex items-start gap-2 leading-tight ${
            mensaje.tipo === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}>
            <span>{mensaje.texto}</span>
          </div>
        )}

        <form onSubmit={manejarCambioContrasena} className="space-y-4">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Escribe una nueva contraseña</label>
            <div className="relative flex items-center">
              <Lock size={14} className="absolute left-3 text-slate-500" />
              <input 
                required 
                type={mostrarContrasena ? "text" : "password"} 
                value={nuevaContrasena} 
                onChange={(e) => setNuevaContrasena(e.target.value)} 
                placeholder="••••••••" 
                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-2.5 pl-9 pr-10 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors" 
              />
              <button 
                type="button" 
                onClick={() => setMostrarContrasena(!mostrarContrasena)}
                className="absolute right-3 text-slate-500 hover:text-emerald-400 transition-colors p-1"
              >
                {mostrarContrasena ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button 
            disabled={cargando || mensaje.tipo === 'exito'} 
            type="submit" 
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/10 transition-all flex items-center justify-center gap-1.5 active:scale-[0.99]"
          >
            <Save size={15} />
            {cargando ? 'Guardando...' : 'Guardar y Entrar'}
          </button>
        </form>

      </div>
    </div>
  );
}