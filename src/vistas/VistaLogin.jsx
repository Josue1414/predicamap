// src/vistas/VistaLogin.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../utilidades/clienteSupabase';
import { MapPin, Mail, Lock, User, LogIn, UserPlus, Send } from 'lucide-react';

export default function VistaLogin() {
  const [esRegistro, setEsRegistro] = useState(false);
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [nombre, setNombre] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // ESTADOS PARA INTERCEPTAR PARÁMETROS DE INVITACIÓN
  const [rolInvitado, setRolInvitado] = useState(null);
  const [congregacionInvitadaId, setCongregacionInvitadaId] = useState(null);
  const [requiereNuevaCongregacion, setRequiereNuevaCongregacion] = useState(false);

  useEffect(() => {
    // Leemos los parámetros incrustados en el enlace de WhatsApp
    const parametros = new URLSearchParams(window.location.search);
    const rol = parametros.get('rol');
    const congId = parametros.get('congregacion');
    const crearCong = parametros.get('crear_congregacion');

    if (rol) {
      setRolInvitado(rol);
      setEsRegistro(true); // Si viene con invitación, lo dirigimos directo a registrarse
    }
    if (congId) setCongregacionInvitadaId(congId);
    if (crearCong === 'true') setRequiereNuevaCongregacion(true);
  }, []);

  const manejarAutenticacion = async (evento) => {
    evento.preventDefault();
    setCargando(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      if (esRegistro) {
        // Empaquetamos los metadatos ocultos para que el Trigger de Supabase los procese
        const metadatosAuth = {
          nombre: nombre,
          rol: rolInvitado || 'Publicador', // Rango asignado o nivel base por defecto
        };

        // Si la invitación viene ligada a una congregación existente, la inyectamos
        if (congregacionInvitadaId) {
          metadatosAuth.congregacion_id = congregacionInvitadaId;
        }

        const { data, error } = await supabase.auth.signUp({
          email: correo,
          password: contrasena,
          options: {
            data: metadatosAuth // El disparador SQL leerá este objeto raw_user_meta_data
          }
        });
        
        if (error) throw error;

        // NUEVO: Flujo de respuesta con instrucciones claras de confirmación de correo
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
        
        // Limpiamos la contraseña por seguridad y regresamos a la vista de login
        setContrasena('');
        setEsRegistro(false);
      } else {
        // Inicio de Sesión Regular
        const { error } = await supabase.auth.signInWithPassword({
          email: correo,
          password: contrasena
        });
        
        // Si el usuario intenta entrar sin confirmar, Supabase arrojará un error específico que podemos atrapar
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
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/30 text-white mb-2">
            <MapPin size={28} className="animate-pulse" />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">PredicaMap</h2>
          
          {/* Alerta visual de invitación activa */}
          {rolInvitado ? (
            <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2.5 py-1 rounded-full mt-2 flex items-center gap-1">
              <UserPlus size={12}/> Invitación para: {rolInvitado}
            </span>
          ) : (
            <p className="text-slate-400 text-[11px] mt-1 text-center">Control y marcación de territorios de predicación</p>
          )}
        </div>

        {/* Alertas de Mensajes */}
        {mensaje.texto && (
          <div className={`p-3 rounded-xl mb-4 border font-medium flex items-start gap-2 leading-tight ${
            mensaje.tipo === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}>
            {mensaje.tipo === 'exito' && <Send size={16} className="mt-0.5 flex-shrink-0" />}
            <span>{mensaje.texto}</span>
          </div>
        )}

        <form onSubmit={manejarAutenticacion} className="space-y-3.5">
          {esRegistro && (
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Nombre Completo</label>
              <div className="relative flex items-center">
                <User size={14} className="absolute left-3 text-slate-500" />
                <input required type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Hermano Silva" className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Correo Electrónico</label>
            <div className="relative flex items-center">
              <Mail size={14} className="absolute left-3 text-slate-500" />
              <input required type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="correo_hermano@gmail.com" className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500" />
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
            {cargando ? 'Procesando...' : esRegistro ? 'Confirmar Registro' : 'Entrar al Sistema'}
          </button>
        </form>

        {/* El selector de modo se bloquea si hay una invitación para forzar el registro */}
        {!rolInvitado && (
          <div className="mt-5 text-center">
            <button onClick={() => { setEsRegistro(!esRegistro); setMensaje({ tipo: '', texto: '' }); }} className="text-indigo-400 hover:underline font-semibold transition-colors">
              {esRegistro ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}