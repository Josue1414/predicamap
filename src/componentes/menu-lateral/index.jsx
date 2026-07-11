// src/componentes/menu-lateral/index.jsx
import React, { useState, useEffect } from 'react';
import { X, Settings, ArrowLeft, Edit2, Save, Sun, Moon, Download, CheckCircle } from 'lucide-react';
import { supabase } from '../../utilidades/clienteSupabase';
import { useAlertas } from '../../context/ContextoAlertas'; 

import SeccionMasterCongregaciones from './SeccionMasterCongregaciones';
import SeccionMasterNuevaCongregacion from './SeccionMasterNuevaCongregacion';
import SeccionBuscarMapa from './SeccionBuscarMapa';
import SeccionMisRevisitas from './SeccionMisRevisitas'; 
import SeccionTerritorios from './SeccionTerritorios';
import SeccionDibujarTerritorio from './SeccionDibujarTerritorio';
import SeccionSembrarCasas from './SeccionSembrarCasas';
import SeccionDirectorio from './SeccionDirectorio';
import SeccionMiPerfil from './SeccionMiPerfil';
import SeccionHistorial from './SeccionHistorial';
import SeccionMiProgreso from './SeccionMiProgreso';

// ★ SOLUCIÓN: Capturamos el evento de instalación globalmente desde el inicio
let promptInstalacionGlobal = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  promptInstalacionGlobal = e;
});

export default function MenuLateral({
  abierto, alCerrar,
  nombreCongregacion, alCambiarNombreCongregacion,
  seccionesGuardadas, edificiosGuardados, alEliminarSeccion, alCompletarTerritorio, alVolarATerritorio,
  textoBusqueda, alCambiarTextoBusqueda, alBuscar, resultadosCiudades, alSeleccionarCiudad,
  nombreTerritorio, alCambiarNombre, colorTerritorio, alCambiarColor, notasTerritorio, alCambiarNotas, alEmpezarATrazar,
  alActivarModoEdificios,
  mostrarCalles, alCambiarMostrarCalles, mostrarLugares, alCambiarMostrarLugares,
  perfilUsuario, usuariosEquipo, alEliminarMiembro, alCrearLinkInvitacion,
  listaCongregaciones, congregacionContextoId, alSeleccionarCongregacionContexto,
  asignarTerritorioEnBD, reiniciarTerritorioEnBD, actualizarNotasSeccionEnBD,
  alEliminarCongregacion,
  marcadoresPersonales, alVolarARevisita, alEditarRevisita, alEliminarRevisita, alCompartirRevisita, alExportarBackup, alImportarBackup,
  revisitaExpandida, setRevisitaExpandida,
  logs, cargandoLogs, recargarLogs,
  actualizarNombrePerfilBD,
  alReordenarTerritorio,
  modoOscuro, alCambiarModo,
  pagina,
  totalPaginas,
  alCambiarPagina, actualizarDetallesSeccionEnBD,
  estiloMapa,
  alCambiarEstiloMapa
}) {
  const [acordeonActivo, setAcordeonActivo] = useState(null); 
  const [territorioExpandido, setTerritorioExpandido] = useState(null);
  const [congregacionExpandida, setCongregacionExpandido] = useState(null);

  const [editandoCong, setEditandoCong] = useState(false);
  const [nombreCongTemp, setNombreCongTemp] = useState('');

  const [deferredPrompt, setDeferredPrompt] = useState(promptInstalacionGlobal);
  const [isInstalled, setIsInstalled] = useState(false);

  const { mostrarAlerta } = useAlertas();

  useEffect(() => {
    setNombreCongTemp(nombreCongregacion || '');
  }, [nombreCongregacion]);

  useEffect(() => {
    // Si ya se había capturado el evento global, lo aseguramos en el estado
    if (promptInstalacionGlobal) setDeferredPrompt(promptInstalacionGlobal);

    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
        setIsInstalled(true);
      }
    };
    checkInstalled();

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      promptInstalacionGlobal = e;
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

  const esAdminMayor = perfilUsuario?.rol === 'Administrador Mayor';
  const esAdminOperativo = perfilUsuario?.rol === 'Administrador' || (esAdminMayor && congregacionContextoId);
  const esCapitanYSuperior = esAdminOperativo || perfilUsuario?.rol === 'Capitán';
  const esPrecursorYSuperior = esCapitanYSuperior || perfilUsuario?.rol === 'Precursor';

  const territoriosOrdenados = seccionesGuardadas || [];

  const manejarRestablecerPassword = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return;
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/recuperar`,
      });
      if (error) throw error;
      alert("📧 Se ha enviado un correo de recuperación para reconfigurar la contraseña.");
    } catch (error) { alert("Error: " + error.message); }
  };

  const manejarGuardarCong = () => {
    if (nombreCongTemp.trim() && nombreCongTemp.trim() !== nombreCongregacion) {
      alCambiarNombreCongregacion(nombreCongTemp.trim());
    }
    setEditandoCong(false);
  };

  return (
    <>
      {abierto && <div className="fixed inset-0 bg-black/50 z-[3000] transition-opacity" onClick={alCerrar} />}

      <div className={`fixed top-0 left-0 h-full w-80 sm:w-96 bg-slate-50 dark:bg-slate-900 shadow-2xl z-[3001] transform transition-transform duration-300 flex flex-col ${abierto ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="flex justify-between items-start">
            <div className="flex flex-col w-full pr-2">
              
              <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Settings size={18} className="text-slate-600" /> Panel de Control
              </h2>
              
              {perfilUsuario?.rol && (
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-[9px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold px-2 py-0.5 rounded-full w-max tracking-wider uppercase shadow-sm">
                    {congregacionContextoId ? "Modo Simulado" : `Rango: ${perfilUsuario.rol}`}
                  </span>
                  
                  <button 
                    onClick={alCambiarModo} 
                    className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-sm"
                    title={modoOscuro ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
                  >
                    {modoOscuro ? <Sun size={12} /> : <Moon size={12} />}
                  </button>

                  {esAdminMayor && congregacionContextoId && (
                    <button onClick={() => { alSeleccionarCongregacionContexto(null); alCerrar(); }} className="text-[9px] bg-rose-500 hover:bg-rose-600 text-white font-black px-2 py-0.5 rounded-full transition-all uppercase tracking-wider shadow-md flex items-center gap-0.5 active:scale-95">
                      <ArrowLeft size={10} /> Salir
                    </button>
                  )}
                </div>
              )}

              <div className="mt-3 flex items-center justify-between gap-2">
                
                {(!esAdminMayor || (esAdminMayor && congregacionContextoId)) && (
                  <div className="flex-1 overflow-hidden">
                    {editandoCong && esAdminOperativo ? (
                      <div className="flex items-center gap-2 animate-slide-up">
                        <input type="text" value={nombreCongTemp} onChange={(e) => setNombreCongTemp(e.target.value)} autoFocus className="flex-1 bg-slate-50 dark:bg-slate-900 border border-indigo-300 dark:border-indigo-500/50 rounded-lg p-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-bold min-w-0" />
                        <button onClick={manejarGuardarCong} className="p-1.5 bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg transition-colors shrink-0"><Save size={12} /></button>
                        <button onClick={() => { setEditandoCong(false); setNombreCongTemp(nombreCongregacion); }} className="p-1.5 bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 rounded-lg transition-colors shrink-0"><X size={12} /></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group w-full">
                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 truncate">
                          {nombreCongregacion || 'Cargando...'}
                        </span>
                        {esAdminOperativo && (
                          <button onClick={() => setEditandoCong(true)} className="text-slate-400 hover:text-indigo-500 transition-colors p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 shrink-0" title="Cambiar nombre oficial">
                            <Edit2 size={12} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

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
            
            <button onClick={alCerrar} className="p-1.5 shrink-0 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500"><X size={20} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scroll-limpio p-3 space-y-2">

          {esAdminMayor && (
            <>
              <div className="text-[10px] font-black uppercase text-indigo-500 tracking-wider mb-2 mt-1 px-1">Control Maestro Global</div>
              <SeccionMasterCongregaciones 
                listaCongregaciones={listaCongregaciones} congregacionExpandida={congregacionExpandida} setCongregacionExpandido={setCongregacionExpandido}
                congregacionContextoId={congregacionContextoId} alSeleccionarCongregacionContexto={alSeleccionarCongregacionContexto}
                acordeonActivo={acordeonActivo} alternarAcordeon={alternarAcordeon} alCerrar={alCerrar} alEliminarCongregacion={alEliminarCongregacion}
              />
              <SeccionMasterNuevaCongregacion alCrearLinkInvitacion={alCrearLinkInvitacion} acordeonActivo={acordeonActivo} alternarAcordeon={alternarAcordeon} />
            </>
          )}

          <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 mt-4 px-1">Navegación y Servicio</div>
          
          <SeccionMisRevisitas 
            visible={!esAdminMayor || (esAdminMayor && congregacionContextoId)}
            acordeonActivo={acordeonActivo} alternarAcordeon={alternarAcordeon}
            marcadoresPersonales={marcadoresPersonales} 
            alVolarARevisita={(m) => {
              alVolarARevisita(m);
              setRevisitaExpandida(null); 
              alCerrar(); 
            }} 
            alEditarRevisita={alEditarRevisita}
            alEliminarRevisita={alEliminarRevisita} alCompartirRevisita={alCompartirRevisita} alExportarBackup={alExportarBackup}
            alImportarBackup={alImportarBackup} revisitaExpandida={revisitaExpandida} setRevisitaExpandida={setRevisitaExpandida}
          />

          <SeccionMiProgreso perfilUsuario={perfilUsuario} acordeonActivo={acordeonActivo} alternarAcordeon={alternarAcordeon} />
          
          {esPrecursorYSuperior && (!esAdminMayor || (esAdminMayor && congregacionContextoId)) && (
            <SeccionTerritorios 
              territoriosOrdenados={territoriosOrdenados} edificiosGuardados={edificiosGuardados} perfilUsuario={perfilUsuario}
              territorioExpandido={territorioExpandido} setTerritorioExpandido={setTerritorioExpandido}
              esPrecursorYSuperior={esPrecursorYSuperior} esCapitanYSuperior={esCapitanYSuperior} esAdminOperativo={esAdminOperativo}
              usuariosEquipo={usuariosEquipo} actualizarNotasSeccionEnBD={actualizarNotasSeccionEnBD} actualizarDetallesSeccionEnBD={actualizarDetallesSeccionEnBD}
              asignarTerritorioEnBD={asignarTerritorioEnBD} reiniciarTerritorioEnBD={reiniciarTerritorioEnBD}
              alEliminarSeccion={alEliminarSeccion} alCompletarTerritorio={alCompletarTerritorio} 
              alVolarATerritorio={(coords) => {
                alVolarATerritorio(coords);
                setTerritorioExpandido(null); 
                alCerrar(); 
              }}
              alReordenarTerritorio={alReordenarTerritorio} acordeonActivo={acordeonActivo} alternarAcordeon={alternarAcordeon} alCerrar={alCerrar}
            />
          )}

          {esCapitanYSuperior && (!esAdminMayor || (esAdminMayor && congregacionContextoId)) && (
            <>
              <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 mt-6 px-1">Gestión de Campo</div>
              <SeccionDibujarTerritorio 
                visible={esAdminOperativo} nombreTerritorio={nombreTerritorio} alCambiarNombre={alCambiarNombre}
                colorTerritorio={colorTerritorio} alCambiarColor={alCambiarColor} notasTerritorio={notasTerritorio}
                alCambiarNotas={alCambiarNotas} alEmpezarATrazar={alEmpezarATrazar}
                acordeonActivo={acordeonActivo} alternarAcordeon={alternarAcordeon} alCerrar={alCerrar}
              />
              <SeccionSembrarCasas visible={esCapitanYSuperior} alActivarModoEdificios={alActivarModoEdificios} acordeonActivo={acordeonActivo} alternarAcordeon={alternarAcordeon} alCerrar={alCerrar} />
            </>
          )}

          {(!esAdminMayor || (esAdminMayor && congregacionContextoId)) && (
            <>
              <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 mt-6 px-1">Administración Local</div>
              <SeccionDirectorio 
                visible={esPrecursorYSuperior} esAdminOperativo={esAdminOperativo} usuariosEquipo={usuariosEquipo}
                perfilUsuario={perfilUsuario} alEliminarMiembro={alEliminarMiembro} alCrearLinkInvitacion={alCrearLinkInvitacion}
                acordeonActivo={acordeonActivo} alternarAcordeon={alternarAcordeon} territorios={territoriosOrdenados} 
              />
            </>
          )}

          <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 mt-6 px-1">Cuenta e Historial</div>
          
          <SeccionMiPerfil 
            perfilUsuario={perfilUsuario} manejarRestablecerPassword={manejarRestablecerPassword} alCerrar={alCerrar} 
            acordeonActivo={acordeonActivo} alternarAcordeon={alternarAcordeon} actualizarNombrePerfilBD={actualizarNombrePerfilBD}
            mostrarCalles={mostrarCalles} alCambiarMostrarCalles={alCambiarMostrarCalles}
            mostrarLugares={mostrarLugares} alCambiarMostrarLugares={alCambiarMostrarLugares}
            estiloMapa={estiloMapa}
            alCambiarEstiloMapa={alCambiarEstiloMapa}
          />
          
          <SeccionHistorial 
            visible={esCapitanYSuperior && (!esAdminMayor || (esAdminMayor && congregacionContextoId))}
            acordeonActivo={acordeonActivo} alternarAcordeon={alternarAcordeon}
            logs={logs} cargandoLogs={cargandoLogs} recargarLogs={recargarLogs}
            pagina={pagina}
            totalPaginas={totalPaginas}
            alCambiarPagina={alCambiarPagina}
          />

          <SeccionBuscarMapa 
            textoBusqueda={textoBusqueda} alCambiarTextoBusqueda={alCambiarTextoBusqueda} alBuscar={alBuscar}
            resultadosCiudades={resultadosCiudades} 
            alSeleccionarCiudad={(ciudad) => {
              alSeleccionarCiudad(ciudad);
              alCerrar();
            }}
            acordeonActivo={acordeonActivo} alternarAcordeon={alternarAcordeon} alCerrar={alCerrar}
          />

          <div className="mt-8 mb-2 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
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