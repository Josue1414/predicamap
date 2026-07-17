// src/componentes/menu-lateral/MenuLateralPublicador.jsx
import React, { useState, useEffect } from 'react';
import { X, Search, Map, MapPin, Layers, Navigation, ChevronDown, ChevronRight, Sun, Moon, Download, CheckCircle, LogIn } from 'lucide-react';
import { useAlertas } from '../../context/ContextoAlertas'; // ★ IMPORTAMOS LAS ALERTAS

import SeccionMiProgreso from './SeccionMiProgreso';
import SeccionMisRevisitas from './SeccionMisRevisitas';
import VentanaFlotante from '../VentanaFlotante';
import BuscadorCiudad from '../BuscadorCiudad';

export default function MenuLateralPublicador({
  abierto,
  alCerrar,
  nombreCongregacion,
  secciones,
  edificios,
  alVolarATerritorio,
  mostrarCalles,
  alCambiarMostrarCalles,
  mostrarLugares,
  alCambiarMostrarLugares,
  estiloMapa,
  alCambiarEstiloMapa,
  textoBusqueda,
  alCambiarTextoBusqueda,
  alBuscar,
  resultadosCiudades,
  alSeleccionarCiudad,
  marcadoresPersonales = [],
  alVolarARevisita,
  alEditarRevisita,
  alEliminarRevisita,
  alCompartirRevisita,
  alExportarBackup,
  alImportarBackup,
  perfilUsuario,
  modoOscuro,
  alCambiarModo
}) {
  const [acordeonActivo, setAcordeonActivo] = useState(null);
  const [territorioExpandido, setTerritorioExpandido] = useState(null);
  const [revisitaExpandida, setRevisitaExpandida] = useState(null);

  // ★ ESTADOS PARA LA INSTALACIÓN PWA ★
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // ★ INICIALIZAMOS ALERTAS
  const { mostrarAlerta } = useAlertas();

  useEffect(() => {
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
        setIsInstalled(true);
      }
    };
    checkInstalled();

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstalled(false);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', checkInstalled);
    };
  }, []);

  // ★ LÓGICA DE INSTALACIÓN HÍBRIDA (Automática / Manual)
  const handleInstallClick = async () => {
    if (isInstalled) return;

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstalled(true);
      }
    } else {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIOS) {
        mostrarAlerta(
          "Instalar en iPhone / iPad", 
          "Safari no permite instalar apps con un botón. Para instalarla, toca el icono 'Compartir' de tu navegador (cuadro con flecha hacia arriba) y selecciona 'Agregar a inicio'.", 
          "info"
        );
      } else {
        mostrarAlerta(
          "Instalación Manual", 
          "Ve al menú de tu navegador (los 3 puntitos arriba a la derecha) y selecciona 'Instalar aplicación' o 'Agregar a inicio'.", 
          "info"
        );
      }
    }
  };

  const alternarAcordeon = (seccion) => setAcordeonActivo(acordeonActivo === seccion ? null : seccion);

  const territoriosAcomodados = [...(secciones || [])].sort((a, b) => {
    if (a.orden !== undefined && b.orden !== undefined) {
      return a.orden - b.orden;
    }
    return a.nombre.localeCompare(b.nombre);
  });

  return (
    <>
      {abierto && <div className="fixed inset-0 bg-black/50 z-[3000] transition-opacity" onClick={alCerrar} />}

      <div className={`fixed top-0 left-0 h-full w-80 sm:w-96 bg-slate-50 dark:bg-slate-900 shadow-2xl z-[3001] transform transition-transform duration-300 flex flex-col ${abierto ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* CABECERA */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex-shrink-0">
          <div className="flex justify-between items-start">
            <div className="flex flex-col w-full pr-2">
              
              <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <MapPin size={18} className="text-emerald-500" /> Mi Servicio
              </h2>
              
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-[9px] bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 font-extrabold px-2 py-0.5 rounded-full tracking-wider uppercase shadow-sm">
                  Publicador
                </span>
                
                <button 
                  onClick={alCambiarModo} 
                  className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-sm"
                  title={modoOscuro ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
                >
                  {modoOscuro ? <Sun size={12} /> : <Moon size={12} />}
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="flex-1 overflow-hidden">
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 truncate block">
                    {nombreCongregacion || 'Cargando...'}
                  </span>
                </div>

                {/* ★ BOTÓN PWA ★ */}
                <button
                  onClick={handleInstallClick}
                  disabled={isInstalled}
                  className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all shadow-sm ${
                    isInstalled
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-400 cursor-not-allowed opacity-70'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md active:scale-95'
                  }`}
                  title={isInstalled ? "La aplicación ya está instalada" : "Instalar como aplicación nativa"}
                >
                  {isInstalled ? <CheckCircle size={14} /> : <Download size={14} />}
                  {isInstalled ? 'Instalada' : 'Instalar App'}
                </button>
              </div>

            </div>
            
            <button onClick={alCerrar} className="p-1.5 shrink-0 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* CONTENIDO DESLIZABLE */}
        <div className="flex-1 overflow-y-auto scroll-limpio p-3 flex flex-col">
          
          <div className="space-y-4 flex-1">
            
            <SeccionMisRevisitas 
              visible={true}
              acordeonActivo={acordeonActivo}
              alternarAcordeon={alternarAcordeon}
              marcadoresPersonales={marcadoresPersonales}
              alVolarARevisita={(m) => { alVolarARevisita(m); alCerrar(); }}
              alEditarRevisita={(m) => { alEditarRevisita(m); alCerrar(); }}
              alEliminarRevisita={alEliminarRevisita}
              alCompartirRevisita={alCompartirRevisita}
              alExportarBackup={alExportarBackup}
              alImportarBackup={alImportarBackup}
              revisitaExpandida={revisitaExpandida}
              setRevisitaExpandida={setRevisitaExpandida}
            />

            <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 mt-4 px-1">Mi Progreso</div>
              <SeccionMiProgreso 
                  perfilUsuario={perfilUsuario} 
                  acordeonActivo={acordeonActivo} 
                  alternarAcordeon={alternarAcordeon} 
              />

            <div className="mb-2">
              <button onClick={() => alternarAcordeon('territorios')} className="w-full p-3 flex justify-between items-center rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 shadow-sm transition-colors">
                <span className="font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Map size={16} className="text-emerald-500"/> Territorios ({territoriosAcomodados.length})
                </span>
                <ChevronRight size={16} className="text-slate-400" />
              </button>
              
              <VentanaFlotante
                abierta={acordeonActivo === 'territorios'}
                alCerrar={() => alternarAcordeon('territorios')}
                titulo={`Territorios (${territoriosAcomodados.length})`}
                icono={Map}
              >
                <div className="p-4 bg-white dark:bg-slate-950 flex-1 overflow-y-auto scroll-limpio space-y-3">
                  {territoriosAcomodados.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-8 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                      No hay territorios creados en esta congregación.
                    </p>
                  ) : (
                    territoriosAcomodados.map((sec, index) => {
                      const casasDeEstaSeccion = edificios.filter(e => e.seccion_id === sec.id);
                      const totalCasas = casasDeEstaSeccion.length;
                      const completadas = casasDeEstaSeccion.filter(e => e.estado === 'completado').length;
                      let porcentaje = totalCasas > 0 ? Math.round((completadas / totalCasas) * 100) : (sec.estado === 'completado' ? 100 : 0);

                      return (
                        <div key={sec.id} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm bg-slate-50 dark:bg-slate-900/50 transition-colors">
                          <div onClick={() => setTerritorioExpandido(territorioExpandido === sec.id ? null : sec.id)} className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <div className="flex items-start gap-3 w-full pr-3 mt-1">
                              <div className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm border border-black/10 dark:border-white/10" style={{ backgroundColor: sec.colorHex }} />
                              <div className="flex flex-col flex-1">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-none">
                                    <span className="text-slate-400 mr-1">#{index + 1}</span> {sec.nombre}
                                  </span>
                                </div>
                                
                                {/* ★ ETIQUETA VISIBLE DEL GRUPO PARA PUBLICADORES ★ */}
                                {sec.grupo_asignado && (
                                  <div className="mb-1.5">
                                    <span className="text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                                      Grupo Asignado: {sec.grupo_asignado}
                                    </span>
                                  </div>
                                )}

                                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${porcentaje}%` }}></div>
                                </div>
                              </div>
                            </div>
                            <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${territorioExpandido === sec.id ? 'rotate-180' : ''}`} />
                          </div>
                          
                          {territorioExpandido === sec.id && (
                            <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 animate-slide-up">
                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 italic bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                                "{sec.notas || 'Sin observaciones'}"
                              </p>
                              <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-900 px-4 py-2.5 rounded-lg text-xs text-slate-600 dark:text-slate-400 font-bold mb-4 border border-slate-200 dark:border-slate-800">
                                <span>{totalCasas > 0 ? `${completadas} de ${totalCasas} completadas` : 'Sin puntos marcados'}</span>
                                <span className={`px-2 py-1 rounded-md ${porcentaje === 100 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400' : 'bg-white dark:bg-slate-800 shadow-sm'}`}>
                                  {porcentaje}% Listo
                                </span>
                              </div>
                              <button onClick={() => { alVolarATerritorio(sec.coordenadas); alCerrar(); alternarAcordeon('territorios'); }} className="w-full flex justify-center items-center gap-2 py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/20">
                                <Navigation size={16} /> Volar al Territorio
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </VentanaFlotante>
            </div>

            <div className="mb-2">
              <button onClick={() => alternarAcordeon('capas')} className="w-full p-3 flex justify-between items-center rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-orange-50 dark:hover:bg-orange-900/10 shadow-sm transition-colors">
                <span className="font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Layers size={16} className="text-orange-500"/> Capas y Estilo del Mapa
                </span>
                <ChevronRight size={16} className="text-slate-400" />
              </button>
              
              <VentanaFlotante
                abierta={acordeonActivo === 'capas'}
                alCerrar={() => alternarAcordeon('capas')}
                titulo="Capas y Estilo del Mapa"
                icono={Layers}
              >
                <div className="p-5 bg-white dark:bg-slate-950 flex-1 space-y-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <Map size={14} className="text-slate-400" /> Estilo de Vista
                    </label>
                    <select 
                      value={estiloMapa} 
                      onChange={(e) => alCambiarEstiloMapa(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer shadow-sm"
                    >
                      <option value="satelite_hibrido">Satélite (Con Calles)</option>
                      <option value="satelite_puro">Satélite (Sin Calles)</option>
                      <option value="gris">Claro (Gris moderno)</option>
                      <option value="calles">Calles (Beige clásico)</option>
                      <option value="oscuro">Modo Oscuro</option>
                    </select>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                    <label className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      <input type="checkbox" checked={mostrarCalles} onChange={(e) => alCambiarMostrarCalles(e.target.checked)} className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 dark:bg-slate-800" />
                      Mostrar Calles y Rutas
                    </label>
                    <label className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      <input type="checkbox" checked={mostrarLugares} onChange={(e) => alCambiarMostrarLugares(e.target.checked)} className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 dark:bg-slate-800" />
                      Mostrar Nombres de Lugares
                    </label>
                  </div>
                </div>
              </VentanaFlotante>
            </div>

            <div className="mb-2">
              <button onClick={() => alternarAcordeon('buscador')} className="w-full p-3 flex justify-between items-center rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 shadow-sm transition-colors">
                <span className="font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Search size={16} className="text-indigo-500"/> Buscar en el Mapa
                </span>
                <ChevronRight size={16} className="text-slate-400" />
              </button>
              
              <VentanaFlotante
                abierta={acordeonActivo === 'buscador'}
                alCerrar={() => alternarAcordeon('buscador')}
                titulo="Buscar en el Mapa"
                icono={Search}
              >
                <div className="p-5 flex flex-col h-full bg-slate-50 dark:bg-slate-950 flex-1">
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 ml-1">Escribe la ciudad, municipio o colonia que deseas buscar.</p>

                  <BuscadorCiudad 
                    textoBusqueda={textoBusqueda}
                    alCambiarTextoBusqueda={alCambiarTextoBusqueda}
                    alBuscar={alBuscar}
                    resultadosCiudades={resultadosCiudades}
                    alSeleccionarCiudad={(c) => { 
                      alSeleccionarCiudad(c); 
                      alCerrar(); 
                      alternarAcordeon('buscador'); 
                    }}
                  />
                </div>
              </VentanaFlotante>
            </div>

          </div>

          {/* ★ NUEVA ESCOTILLA DE ESCAPE COMO TEXTO (Link) ★ */}
          <div className="pt-5 mt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col items-center">
            <button 
              onClick={() => {
                localStorage.removeItem('pm_ruta_inicio_pwa');
                alCerrar();
                window.location.href = '/login';
              }} 
              className="flex items-center gap-1.5 text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 text-xs font-bold transition-all hover:underline active:scale-95 bg-transparent border-none p-2"
            >
              <LogIn size={14} strokeWidth={2.5} /> ¿Tienes cuenta? Inicia sesión
            </button>
          </div>

          {/* FOOTER AL FINAL DEL SCROLL */}
          <div className="mt-6 mb-2 text-center">
            <p className="text-[10px] text-slate-400">
              Soporte y contacto:<br/>
              <a href="mailto:hola.predicamap@gmail.com" className="font-bold text-indigo-500 hover:text-indigo-600 transition-colors">
                hola.predicamap@gmail.com
              </a>
            </p>
          </div>

        </div>
      </div>
    </>
  );
}