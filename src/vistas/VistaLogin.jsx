// src/vistas/VistaLogin.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../utilidades/clienteSupabase';
import { MapPin, Mail, Lock, User, LogIn, UserPlus, Send, Eye, EyeOff, RefreshCcw, CheckCircle } from 'lucide-react';

export default function VistaLogin() {
  const [esRegistro, setEsRegistro] = useState(false);
  const [esRecuperacion, setEsRecuperacion] = useState(false);
  const [registroExitoso, setRegistroExitoso] = useState(false); 
  
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  
  // ★ 1. NUEVO ESTADO para confirmar la contraseña
  const [confirmarContrasena, setConfirmarContrasena] = useState(''); 
  
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
          setEsRegistro(true); 
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
        
        // ★ 2. NUEVA VALIDACIÓN: Verificar que las contraseñas coincidan
        if (contrasena !== confirmarContrasena) {
          throw new Error('Las contraseñas no coinciden. Revisa que estén escritas exactamente igual.');
        }

        // VALIDACIONES DE SEGURIDAD DE LA CONTRASEÑA
        if (contrasena.length < 6) {
          throw new Error('Tu contraseña es muy corta. Debe tener al menos 6 caracteres.');
        }

        const contrasenasObvias = ['123456', '12345678', '123456789', 'contraseña', 'contrasena', 'password', 'qwerty', '123123'];
        
        if (contrasenasObvias.includes(contrasena.toLowerCase()) || /^(.)\1+$/.test(contrasena)) {
          throw new Error('Esa contraseña es demasiado fácil de adivinar. Por tu seguridad, no uses nueros continuos, ni números repetidos.');
        }

        const metadatosAuth = {
          nombre: nombre,
          rol: rolInvitado || 'Publicador',
        };

        if (congregacionInvitadaId) {
          metadatosAuth.congregacion_id = congregacionInvitadaId;
        }

        const { error } = await supabase.auth.signUp({
          email: correo,
          password: contrasena,
          options: {
            data: metadatosAuth,
            emailRedirectTo: window.location.origin
          }
        });
        
        if (error) throw error;

        setRegistroExitoso(true);
        
        if (requiereNuevaCongregacion) {
          setMensaje({ 
            tipo: 'exito', 
            texto: '¡Cuenta creada con éxito! Por favor, ve a tu correo electrónico y busca el mensaje de confirmación de PredicaMap (revisa también en SPAM).' 
          });
        } else {
          setMensaje({ 
            tipo: 'exito', 
            texto: `¡Registro completado! Ve a tu bandeja de entrada o SPAM y confirma tu correo electrónico haciendo clic en el enlace para entrar como ${rolInvitado || 'Publicador'}.` 
          });
        }
        
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: correo,
          password: contrasena
        });
        
        if (error) {
          if (error.message.includes('Email not confirmed') || error.message.includes('Invalid login credentials')) {
            throw new Error('Credenciales inválidas o falta confirmar tu correo. Por favor revisa tu bandeja de entrada o SPAM.');
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
          <div className="w-20 h-20 bg-white rounded-2xl shadow-lg shadow-indigo-600/20 p-1.5 mb-3 flex items-center justify-center">
            <img 
              src="https://mzardqwfmxdabsjmzwkk.supabase.co/storage/v1/object/public/Logo%20PredicaMap/Logo-PredicaMap.svg" 
              alt="Logo PredicaMap" 
              className="w-full h-full object-contain" 
            />
          </div>
          
          <h2 className="text-xl font-black text-white tracking-tight">
            {esRecuperacion ? 'Recuperar Acceso' : 'PredicaMap'}
          </h2>
          
          {rolInvitado && !esRecuperacion && !registroExitoso ? (
            <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2.5 py-1 rounded-full mt-2 flex items-center gap-1">
              <UserPlus size={12}/> Invitación para: {rolInvitado}
            </span>
          ) : (
            <p className="text-slate-400 text-[11px] mt-1 text-center">
              {esRecuperacion ? 'Te enviaremos un enlace seguro a tu correo' : 'Control y marcación de territorios'}
            </p>
          )}
        </div>

        {registroExitoso ? (
          <div className="text-center animate-fade-in">
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-5 rounded-2xl mb-4">
              <CheckCircle size={40} className="mx-auto mb-3 text-emerald-400" />
              <h3 className="text-base font-bold text-white mb-2">¡Casi listo!</h3>
              <p className="text-sm leading-relaxed">{mensaje.texto}</p>
            </div>
            
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700 mb-6">
              <p className="text-slate-400 text-[11px] mb-1">Tu cuenta está enlazada a:</p>
              <p className="text-white font-semibold text-sm">{correo}</p>
            </div>
          </div>
        ) : (
          <>
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
                  <label className="block text-slate-400 font-semibold mb-1 leading-tight">
                    Nombre 
                    <span className="block text-[10px] font-normal text-slate-500 mt-0.5">
                      (No uses tu nombre completo para proteger tu identidad)
                    </span>
                  </label>
                  <div className="relative flex items-center mt-1">
                    <User size={14} className="absolute left-3 text-slate-500" />
                    <input required type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Josue Hernandez" className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Correo Electrónico</label>
                <div className="relative flex items-center">
                  <Mail size={14} className="absolute left-3 text-slate-500" />
                  <input required type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="correo@ejemplo.com" className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors" />
                </div>
              </div>

              {!esRecuperacion && (
                <>
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

                  {/* ★ 3. NUEVO CAMPO en la UI: Confirmar contraseña (solo visible en registro) */}
                  {esRegistro && (
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Confirmar Contraseña</label>
                      <div className="relative flex items-center">
                        <Lock size={14} className="absolute left-3 text-slate-500" />
                        <input 
                          required 
                          type={mostrarContrasena ? "text" : "password"} 
                          value={confirmarContrasena} 
                          onChange={(e) => setConfirmarContrasena(e.target.value)} 
                          placeholder="••••••••" 
                          className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-2.5 pl-9 pr-10 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors" 
                        />
                        {/* ★ Botón del ojito agregado aquí */}
                        <button 
                          type="button" 
                          onClick={() => setMostrarContrasena(!mostrarContrasena)}
                          className="absolute right-3 text-slate-500 hover:text-indigo-400 transition-colors p-1"
                        >
                          {mostrarContrasena ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              <button 
                disabled={cargando} 
                type="submit" 
                className={`w-full py-3 mt-2 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-[0.99] disabled:opacity-70 ${esRecuperacion ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/10'}`}
              >
                {esRecuperacion ? <Send size={15} /> : <LogIn size={15} />}
                {cargando ? 'Procesando...' : esRecuperacion ? 'Enviar Enlace de Recuperación' : esRegistro ? 'Crear Cuenta' : 'Entrar al Sistema'}
              </button>
            </form>

            <div className="mt-5 text-center flex flex-col gap-3">
              {!esRecuperacion && esRegistro && (
                <button 
                  onClick={() => { 
                    setEsRegistro(false); 
                    setMensaje({tipo:'', texto:''}); 
                    // Limpiamos el campo por si cambian de opinión
                    setConfirmarContrasena(''); 
                  }} 
                  className="text-[11px] text-slate-400 hover:text-white transition-colors"
                >
                  ¿Ya tienes cuenta? <span className="text-indigo-400 font-bold">Inicia sesión aquí</span>
                </button>
              )}
              
              {!esRecuperacion && !esRegistro && rolInvitado && (
                <button 
                  onClick={() => { setEsRegistro(true); setMensaje({tipo:'', texto:''}); }} 
                  className="text-[11px] text-slate-400 hover:text-white transition-colors"
                >
                  ¿Tienes una invitación? <span className="text-indigo-400 font-bold">Regístrate aquí</span>
                </button>
              )}

              {esRecuperacion && (
                <button onClick={() => { setEsRecuperacion(false); setMensaje({ tipo: '', texto: '' }); }} className="text-slate-400 hover:text-white transition-colors">
                  Cancelar y volver al inicio
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}