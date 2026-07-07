// src/vistas/VistaLogin.jsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../utilidades/clienteSupabase';
import { MapPin, Mail, Lock, User, LogIn, UserPlus, Send, Eye, EyeOff, CheckCircle, Link, ClipboardPaste } from 'lucide-react';
import { useAlertas } from '../context/ContextoAlertas'; 

export default function VistaLogin() {
  const [esRegistro, setEsRegistro] = useState(false);
  const [esRecuperacion, setEsRecuperacion] = useState(false);
  const [registroExitoso, setRegistroExitoso] = useState(false); 
  
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState(''); 
  const [nombre, setNombre] = useState('');
  const [cargando, setCargando] = useState(false);
  
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  const [rolInvitado, setRolInvitado] = useState(null);
  const [congregacionInvitadaId, setCongregacionInvitadaId] = useState(null);
  const [requiereNuevaCongregacion, setRequiereNuevaCongregacion] = useState(false);

  const [mostrarInputLink, setMostrarInputLink] = useState(false);
  const [linkPublicador, setLinkPublicador] = useState('');

  const contenedorLinkRef = useRef(null);
  const { mostrarAlerta } = useAlertas();

  // Forzamos el Modo Oscuro globalmente mientras estamos en el Login
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

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
        mostrarAlerta("Enlace inválido", "El enlace de invitación está corrupto o es inválido.", "danger");
      }
    }
  }, [mostrarAlerta]);

  const manejarRecuperacion = async (evento) => {
    evento.preventDefault();
    if (!correo) return mostrarAlerta("Atención", "Por favor, escribe tu correo electrónico primero.", "warning");
    
    setCargando(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(correo, {
        redirectTo: `${window.location.origin}/recuperar`,
      });
      if (error) throw error;
      
      mostrarAlerta("Correo enviado", "✅ Se ha enviado un enlace seguro a tu correo. Revisa tu bandeja de entrada o la carpeta de SPAM.", "success");
      setEsRecuperacion(false); 
    } catch (error) {
      mostrarAlerta("Error", error.message, "danger");
    } finally {
      setCargando(false);
    }
  };

  const manejarAutenticacion = async (evento) => {
    evento.preventDefault();
    
    if (esRecuperacion) return manejarRecuperacion(evento);

    setCargando(true);

    try {
      if (esRegistro) {
        if (contrasena !== confirmarContrasena) {
          throw new Error('Las contraseñas no coinciden. Revisa que estén escritas exactamente igual.');
        }

        if (contrasena.length < 6) {
          throw new Error('Tu contraseña es muy corta. Debe tener al menos 6 caracteres.');
        }

        const contrasenasObvias = ['123456', '12345678', '123456789', 'contraseña', 'contrasena', 'password', 'qwerty', '123123'];
        
        if (contrasenasObvias.includes(contrasena.toLowerCase()) || /^(.)\1+$/.test(contrasena)) {
          throw new Error('Esa contraseña es demasiado fácil de adivinar. Por tu seguridad, no uses números continuos ni repetidos.');
        }

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

        // VALIDACIÓN DE CORREO EXISTENTE
        if (data?.user?.identities?.length === 0) {
          throw new Error('Este correo electrónico ya está registrado. Por favor, inicia sesión.');
        }

        setRegistroExitoso(true);
        
        if (requiereNuevaCongregacion) {
          mostrarAlerta("¡Cuenta creada!", "Por favor, ve a tu correo electrónico y busca el mensaje de confirmación de PredicaMap (revisa también en SPAM).", "success");
        } else {
          mostrarAlerta("¡Registro completado!", `Ve a tu bandeja de entrada o SPAM y confirma tu correo electrónico para entrar como ${rolInvitado || 'Publicador'}.`, "success");
        }
        
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: correo,
          password: contrasena
        });
        
        if (error) {
          if (error.message.includes('Email not confirmed') || error.message.includes('Invalid login credentials')) {
            throw new Error('Credenciales inválidas o falta confirmar tu correo. Por favor revisa tu bandeja de entrada o la carpeta de SPAM.');
          }
          throw error;
        }
      }
    } catch (error) {
      mostrarAlerta("Atención", error.message, "danger");
    } finally {
      setCargando(false);
    }
  };

  const procesarEnlacePublicador = (texto) => {
    const dominioObjetivo = 'predicamap.pages.dev/v/';
    
    if (texto.includes(dominioObjetivo)) {
      const partes = texto.split(dominioObjetivo);
      const codigoCifrado = partes[1].split(' ')[0].trim(); 
      
      if (codigoCifrado) {
        window.location.replace(`/v/${codigoCifrado}`);
      } else {
        mostrarAlerta("Error de Enlace", "El enlace de territorio está incompleto.", "warning");
      }
    } else {
      mostrarAlerta("Enlace inválido", "El enlace no parece pertenecer a un territorio de PredicaMap válido.", "danger");
    }
  };

  const pegarDesdePortapapeles = async () => {
    try {
      const textoCopiado = await navigator.clipboard.readText();
      setLinkPublicador(textoCopiado);
      if(textoCopiado) procesarEnlacePublicador(textoCopiado);
    } catch (err) {
      mostrarAlerta("Permiso denegado", "No se pudo leer el portapapeles. Pega el enlace manualmente en la caja de texto.", "warning");
    }
  };

  const manejarEnvioLink = (e) => {
    e.preventDefault();
    if (linkPublicador) procesarEnlacePublicador(linkPublicador);
  };

  const toggleInputLink = () => {
    const nuevoEstado = !mostrarInputLink;
    setMostrarInputLink(nuevoEstado);
    
    if (nuevoEstado) {
      setTimeout(() => {
        contenedorLinkRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    }
  };

  return (
    <>
      <style>{`
        .z-\\[9999\\] > div > div.bg-white { background-color: #1e293b !important; border-color: #334155 !important; }
        .z-\\[9999\\] .text-slate-800 { color: #f8fafc !important; }
        .z-\\[9999\\] .text-slate-600 { color: #cbd5e1 !important; }
        .z-\\[9999\\] .bg-slate-50 { background-color: #0f172a !important; }
        .z-\\[9999\\] button.bg-slate-100 { background-color: #334155 !important; color: #f8fafc !important; border-color: #475569 !important; }
      `}</style>

      <div className="fixed inset-0 bg-slate-900 overflow-y-auto overflow-x-hidden">
        <div className="min-h-full w-full flex flex-col items-center justify-center px-4 py-8 relative">
          
          <div className="absolute w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -top-20 -left-20 pointer-events-none" />
          <div className="absolute w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl -bottom-20 -right-20 pointer-events-none" />

          <div className="w-full max-w-sm flex flex-col gap-4 relative z-10 my-auto">
            
            <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl text-xs w-full">
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
                  <div className="flex flex-col items-center mt-2 gap-2 w-full">
                    <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <UserPlus size={12}/> Invitación para: {rolInvitado}
                    </span>
                    {esRegistro && (
                      <button 
                        type="button" 
                        onClick={() => { setEsRegistro(false); setConfirmarContrasena(''); }} 
                        className="text-[11px] text-slate-300 hover:text-white transition-colors"
                      >
                        ¿Ya tienes cuenta? <span className="text-indigo-400 font-bold">Inicia sesión aquí</span>
                      </button>
                    )}
                  </div>
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
                    <h3 className="text-base font-bold text-white mb-2">¡Revisa tu correo!</h3>
                    <p className="text-sm leading-relaxed">Sigue las instrucciones enviadas para confirmar tu cuenta.</p>
                  </div>
                  
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700 mb-6">
                    <p className="text-slate-400 text-[11px] mb-1">Tu cuenta está enlazada a:</p>
                    <p className="text-white font-semibold text-sm">{correo}</p>
                  </div>
                </div>
              ) : (
                <>
                  <form onSubmit={manejarAutenticacion} className="space-y-3.5">
                    {!esRecuperacion && esRegistro && (
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1 leading-tight">
                          Nombre 
                          <span className="block text-[11px] font-medium text-amber-400 mt-1">
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
                          <label className="block text-slate-400 font-semibold mb-1">Crea una nueva Contraseña</label>
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
                                onClick={() => setEsRecuperacion(true) }
                                className="text-[10px] text-slate-400 hover:text-rose-400 transition-colors"
                              >
                                ¿Olvidaste tu contraseña?
                              </button>
                            </div>
                          )}
                        </div>

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
                    {!esRecuperacion && !esRegistro && !registroExitoso && (
                      <div 
                        ref={contenedorLinkRef} 
                        className="w-full bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 shadow-xl text-xs transition-all duration-300"
                      >
                        <button 
                          onClick={toggleInputLink}
                          className="w-full flex items-center justify-center gap-2 text-purple-400 font-bold hover:text-purple-300 transition-colors"
                        >
                          <Link size={16} /> ¿Tienes un link de territorio? Ingrésalo aquí
                        </button>
                        
                        {mostrarInputLink && (
                          <div className="mt-4 animate-slide-up">
                            <form onSubmit={manejarEnvioLink} className="flex flex-col gap-2">
                              <div className="flex gap-2 w-full">
                                <input 
                                  type="text" 
                                  value={linkPublicador} 
                                  onChange={(e) => setLinkPublicador(e.target.value)} 
                                  placeholder="Pega el enlace de WhatsApp aquí..." 
                                  className="flex-1 min-w-0 bg-slate-950/50 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors text-[11px]" 
                                />
                                <button 
                                  type="button"
                                  onClick={pegarDesdePortapapeles}
                                  className="bg-slate-700 hover:bg-slate-600 text-slate-300 p-2.5 rounded-xl transition-colors shrink-0 flex items-center justify-center"
                                  title="Pegar del portapapeles"
                                >
                                  <ClipboardPaste size={16} />
                                </button>
                              </div>
                              <button 
                                type="submit" 
                                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                              >
                                Entrar al Territorio <MapPin size={14}/>
                              </button>
                            </form>
                          </div>
                        )}
                      </div>
                    )}

                    {esRecuperacion && (
                      <button onClick={() => setEsRecuperacion(false)} className="text-slate-400 hover:text-white transition-colors">
                        Cancelar y volver al inicio
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}