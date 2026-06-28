// src/vistas/VistaLogin.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../utilidades/clienteSupabase';
import { MapPin, Mail, Lock, User, LogIn, UserPlus, Send, Eye, EyeOff, RefreshCcw } from 'lucide-react';

export default function VistaLogin() {
  const [esRegistro, setEsRegistro] = useState(false);
  const [esRecuperacion, setEsRecuperacion] = useState(false);
  
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [nombre, setNombre] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  const [rolInvitado, setRolInvitado] = useState(null);
  const [congregacionInvitadaId, setCongregacionInvitadaId] = useState(null);
  const [requiereNuevaCongregacion, setRequiereNuevaCongregacion] = useState(false);

  useEffect(() => {
    const parametros = new URLSearchParams(window.location.search);
    const key = parametros.get('key');

    if (key) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(key))); 
        if (decoded.r) {
          setRolInvitado(decoded.r);
          setEsRegistro(true); // Solo se activa el registro si hay invitación válida
        }
        if (decoded.c) setCongregacionInvitadaId(decoded.c);
        if (decoded.nc === 1) setRequiereNuevaCongregacion(true);
      } catch (error) {
        console.error("El enlace de invitación está corrupto o es inválido.");
      }
    }
  }, []);

  const manejarRecuperacion = async (evento) => {
    evento.preventDefault();
    if (!correo) return setMensaje({ tipo: 'error', texto: 'Por favor, escribe tu correo electrónico primero.' });
    
    setCargando(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(correo, {
        redirectTo: `${window.location.origin}/recuperar`,
      });
      if (error) throw error;
      setMensaje({ tipo: 'exito', texto: '✅ Se ha enviado un enlace seguro a tu correo. Revisa tu bandeja de entrada o SPAM.' });
      setEsRecuperacion(false); 
    } catch (error) {
      setMensaje({ tipo: 'error', texto: error.message });
    } finally {
      setCargando(false);
    }
  };

  const manejarAutenticacion = async (evento) => {
    evento.preventDefault();
    
    if (esRecuperacion) return manejarRecuperacion(evento);

    setCargando(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      if (esRegistro) {
        const metadatosAuth = {
          nombre: nombre,
          rol: rolInvitado || 'Publicador',
        };

        if (congregacionInvitadaId) {
          metadatosAuth.congregacion_id = congregacionInvitadaId;
        }

        const { data, error } = await supabase.auth.signUp({
          email: correo,
          password: contrasena,
          options: {
            data: metadatosAuth,
            emailRedirectTo: window.location.origin
          }
        });
        
        if (error) throw error;

        if (requiereNuevaCongregacion) {
          setMensaje({ 
            tipo: 'exito', 
            texto: '¡Cuenta creada! 📧 Por favor, revisa tu correo electrónico (y la carpeta de SPAM). Haz clic en el enlace de confirmación para poder iniciar sesión y configurar tu congregación.' 
          });
        } else {
          setMensaje({ 
            tipo: 'exito', 
            texto: `¡Registro completado! 📧 Revisa tu bandeja de entrada o SPAM y confirma tu correo para poder entrar como ${rolInvitado || 'Publicador'}.` 
          });
        }
        
        setContrasena('');
        setEsRegistro(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: correo,
          password: contrasena
        });
        
        if (error) {
          if (error.message.includes('Email not confirmed') || error.message.includes('Invalid login credentials')) {
            throw new Error('Credenciales inválidas o falta confirmar tu correo. Por favor revisa tu bandeja de entrada.');
          }
          throw error;
        }
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: error.message });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-slate-900 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -top-20 -left-20" />
      <div className="absolute w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl -bottom-20 -right-20" />

      <div className="w-full max-w-sm bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl relative z-10 text-xs">
        
        <div className="flex flex-col items-center mb-6">
          <div className={`p-3 rounded-2xl shadow-lg text-white mb-2 transition-colors ${esRecuperacion ? 'bg-rose-600 shadow-rose-600/30' : 'bg-indigo-600 shadow-indigo-600/30'}`}>
            {esRecuperacion ? <RefreshCcw size={28} /> : <MapPin size={28} className="animate-pulse" />}
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">
            {esRecuperacion ? 'Recuperar Acceso' : 'PredicaMap'}
          </h2>
          
          {rolInvitado && !esRecuperacion ? (
            <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2.5 py-1 rounded-full mt-2 flex items-center gap-1">
              <UserPlus size={12}/> Invitación para: {rolInvitado}
            </span>
          ) : (
            <p className="text-slate-400 text-[11px] mt-1 text-center">
              {esRecuperacion ? 'Te enviaremos un enlace seguro a tu correo' : 'Control y marcación de territorios de predicación'}
            </p>
          )}
        </div>

        {mensaje.texto && (
          <div className={`p-3 rounded-xl mb-4 border font-medium flex items-start gap-2 leading-tight ${
            mensaje.tipo === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}>
            {mensaje.tipo === 'exito' && <Send size={16} className="mt-0.5 flex-shrink-0" />}
            <span>{mensaje.texto}</span>
          </div>
        )}

        <form onSubmit={manejarAutenticacion} className="space-y-3.5">
          {!esRecuperacion && esRegistro && (
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Nombre Completo</label>
              <div className="relative flex items-center">
                <User size={14} className="absolute left-3 text-slate-500" />
                <input required type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Hermano Silva" className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Correo Electrónico</label>
            <div className="relative flex items-center">
              <Mail size={14} className="absolute left-3 text-slate-500" />
              <input required type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="correo_hermano@gmail.com" className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>
          </div>

          {!esRecuperacion && (
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Contraseña</label>
              <div className="relative flex items-center">
                <Lock size={14} className="absolute left-3 text-slate-500" />
                <input 
                  required 
                  type={mostrarContrasena ? "text" : "password"} 
                  value={contrasena} 
                  onChange={(e) => setContrasena(e.target.value)} 
                  placeholder="••••••••" 
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-2.5 pl-9 pr-10 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors" 
                />
                <button 
                  type="button" 
                  onClick={() => setMostrarContrasena(!mostrarContrasena)}
                  className="absolute right-3 text-slate-500 hover:text-indigo-400 transition-colors p-1"
                >
                  {mostrarContrasena ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              
              {!esRegistro && (
                <div className="flex justify-end mt-2">
                  <button 
                    type="button" 
                    onClick={() => { setEsRecuperacion(true); setMensaje({ tipo: '', texto: '' }); }}
                    className="text-[10px] text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}
            </div>
          )}

          <button 
            disabled={cargando} 
            type="submit" 
            className={`w-full py-3 mt-2 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-[0.99] disabled:opacity-70 ${esRecuperacion ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/10'}`}
          >
            {esRecuperacion ? <Send size={15} /> : <LogIn size={15} />}
            {cargando ? 'Procesando...' : esRecuperacion ? 'Enviar Enlace de Recuperación' : esRegistro ? 'Confirmar Registro' : 'Entrar al Sistema'}
          </button>
        </form>

        <div className="mt-5 text-center">
          {/* ★ AQUI QUITAMOS LA OPCIÓN DE REGISTRO LIBRE ★ */}
          {esRecuperacion && (
            <button onClick={() => { setEsRecuperacion(false); setMensaje({ tipo: '', texto: '' }); }} className="text-slate-400 hover:text-white transition-colors">
              Cancelar y volver al inicio
            </button>
          )}
        </div>

      </div>
    </div>
  );
}