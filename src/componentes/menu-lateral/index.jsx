// src/componentes/menu-lateral/index.jsx
import React, { useState } from 'react';
import { X, Settings, ArrowLeft } from 'lucide-react';
import { supabase } from '../../utilidades/clienteSupabase';

import SeccionMasterCongregaciones from './SeccionMasterCongregaciones';
import SeccionMasterNuevaCongregacion from './SeccionMasterNuevaCongregacion';
import SeccionBuscarMapa from './SeccionBuscarMapa';
import SeccionMisRevisitas from './SeccionMisRevisitas'; 
import SeccionTerritorios from './SeccionTerritorios';
import SeccionDibujarTerritorio from './SeccionDibujarTerritorio';
import SeccionSembrarCasas from './SeccionSembrarCasas';
import SeccionAjustesGenerales from './SeccionAjustesGenerales';
import SeccionDirectorio from './SeccionDirectorio';
import SeccionMiPerfil from './SeccionMiPerfil';
import SeccionHistorial from './SeccionHistorial';

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

  // ★ PROP FALTANTE PARA REORDENAR ★
  alReordenarTerritorio
}) {
  const [acordeonActivo, setAcordeonActivo] = useState('lista'); 
  const [territorioExpandido, setTerritorioExpandido] = useState(null);
  const [congregacionExpandida, setCongregacionExpandido] = useState(null);

  const alternarAcordeon = (seccion) => setAcordeonActivo(acordeonActivo === seccion ? null : seccion);

  const esAdminMayor = perfilUsuario?.rol === 'Administrador Mayor';
  const esAdminOperativo = perfilUsuario?.rol === 'Administrador' || (esAdminMayor && congregacionContextoId);
  const esCapitanYSuperior = esAdminOperativo || perfilUsuario?.rol === 'Capitán';
  const esPrecursorYSuperior = esCapitanYSuperior || perfilUsuario?.rol === 'Precursor';

  // ★ QUITAMOS EL ORDENAMIENTO VISUAL FORZADO PARA RESPETAR EL ORDEN GLOBAL ★
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

  return (
    <>
      {abierto && <div className="fixed inset-0 bg-black/50 z-[3000] transition-opacity" onClick={alCerrar} />}

      <div className={`fixed top-0 left-0 h-full w-80 sm:w-96 bg-slate-50 dark:bg-slate-900 shadow-2xl z-[3001] transform transition-transform duration-300 flex flex-col ${abierto ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-950">
          <div className="flex flex-col">
            <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Settings size={18} className="text-slate-600" /> Panel de Control
            </h2>
            {perfilUsuario?.rol && (
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[9px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold px-2 py-0.5 rounded-full w-max tracking-wider uppercase shadow-sm">
                  {congregacionContextoId ? "Modo Simulado" : `Rango: ${perfilUsuario.rol}`}
                </span>
                {esAdminMayor && congregacionContextoId && (
                  <button 
                    onClick={() => { alSeleccionarCongregacionContexto(null); alCerrar(); }}
                    className="text-[9px] bg-rose-500 hover:bg-rose-600 text-white font-black px-2 py-0.5 rounded-full transition-all uppercase tracking-wider shadow-md flex items-center gap-0.5 active:scale-95"
                  >
                    <ArrowLeft size={10} /> Salir
                  </button>
                )}
              </div>
            )}
          </div>
          <button onClick={alCerrar} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto scroll-limpio p-3 space-y-2">

          {esAdminMayor && (
            <>
              <div className="text-[10px] font-black uppercase text-indigo-500 tracking-wider mb-2 mt-1 px-1">Control Maestro Global</div>
              <SeccionMasterCongregaciones 
                listaCongregaciones={listaCongregaciones}
                congregacionExpandida={congregacionExpandida}
                setCongregacionExpandido={setCongregacionExpandido}
                congregacionContextoId={congregacionContextoId}
                alSeleccionarCongregacionContexto={alSeleccionarCongregacionContexto}
                acordeonActivo={acordeonActivo}
                alternarAcordeon={alternarAcordeon}
                alCerrar={alCerrar}
                alEliminarCongregacion={alEliminarCongregacion}
              />
              <SeccionMasterNuevaCongregacion 
                alCrearLinkInvitacion={alCrearLinkInvitacion}
                acordeonActivo={acordeonActivo}
                alternarAcordeon={alternarAcordeon}
              />
            </>
          )}

          <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 mt-4 px-1">Navegación y Herramientas</div>
          <SeccionBuscarMapa 
            textoBusqueda={textoBusqueda} alCambiarTextoBusqueda={alCambiarTextoBusqueda} alBuscar={alBuscar}
            resultadosCiudades={resultadosCiudades} alSeleccionarCiudad={alSeleccionarCiudad}
            acordeonActivo={acordeonActivo} alternarAcordeon={alternarAcordeon} alCerrar={alCerrar}
          />
          
          <SeccionMisRevisitas 
            visible={!esAdminMayor || (esAdminMayor && congregacionContextoId)}
            acordeonActivo={acordeonActivo}
            alternarAcordeon={alternarAcordeon}
            marcadoresPersonales={marcadoresPersonales}
            alVolarARevisita={alVolarARevisita}
            alEditarRevisita={alEditarRevisita}
            alEliminarRevisita={alEliminarRevisita}
            alCompartirRevisita={alCompartirRevisita}
            alExportarBackup={alExportarBackup}
            alImportarBackup={alImportarBackup}
            revisitaExpandida={revisitaExpandida}
            setRevisitaExpandida={setRevisitaExpandida}
          />

          {esPrecursorYSuperior && (!esAdminMayor || (esAdminMayor && congregacionContextoId)) && (
            <>
              <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 mt-4 px-1">Operación de Campo</div>
              <SeccionTerritorios 
                territoriosOrdenados={territoriosOrdenados} edificiosGuardados={edificiosGuardados} perfilUsuario={perfilUsuario}
                territorioExpandido={territorioExpandido} setTerritorioExpandido={setTerritorioExpandido}
                esPrecursorYSuperior={esPrecursorYSuperior} esCapitanYSuperior={esCapitanYSuperior} esAdminOperativo={esAdminOperativo}
                usuariosEquipo={usuariosEquipo} actualizarNotasSeccionEnBD={actualizarNotasSeccionEnBD}
                asignarTerritorioEnBD={asignarTerritorioEnBD} reiniciarTerritorioEnBD={reiniciarTerritorioEnBD}
                alEliminarSeccion={alEliminarSeccion} alCompletarTerritorio={alCompletarTerritorio} alVolarATerritorio={alVolarATerritorio}
                
                // ★ CONECTAMOS LA PROP AL COMPONENTE ★
                alReordenarTerritorio={alReordenarTerritorio}

                acordeonActivo={acordeonActivo} alternarAcordeon={alternarAcordeon} alCerrar={alCerrar}
              />
              <SeccionDibujarTerritorio 
                visible={esAdminOperativo} nombreTerritorio={nombreTerritorio} alCambiarNombre={alCambiarNombre}
                colorTerritorio={colorTerritorio} alCambiarColor={alCambiarColor} notasTerritorio={notasTerritorio}
                alCambiarNotas={alCambiarNotas} alEmpezarATrazar={alEmpezarATrazar}
                acordeonActivo={acordeonActivo} alternarAcordeon={alternarAcordeon} alCerrar={alCerrar}
              />
              <SeccionSembrarCasas 
                visible={esCapitanYSuperior} alActivarModoEdificios={alActivarModoEdificios}
                acordeonActivo={acordeonActivo} alternarAcordeon={alternarAcordeon} alCerrar={alCerrar}
              />
            </>
          )}

          {(!esAdminMayor || (esAdminMayor && congregacionContextoId)) && (
            <>
              <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 mt-6 px-1">Administración Local</div>
              <SeccionAjustesGenerales 
                visible={esAdminOperativo} nombreCongregacion={nombreCongregacion} alCambiarNombreCongregacion={alCambiarNombreCongregacion}
                alCrearLinkInvitacion={alCrearLinkInvitacion} mostrarCalles={mostrarCalles} alCambiarMostrarCalles={alCambiarMostrarCalles}
                mostrarLugares={mostrarLugares} alCambiarMostrarLugares={alCambiarMostrarLugares}
                acordeonActivo={acordeonActivo} alternarAcordeon={alternarAcordeon}
              />
              <SeccionDirectorio 
                visible={esCapitanYSuperior} esAdminOperativo={esAdminOperativo} usuariosEquipo={usuariosEquipo}
                perfilUsuario={perfilUsuario} alEliminarMiembro={alEliminarMiembro} alCrearLinkInvitacion={alCrearLinkInvitacion}
                acordeonActivo={acordeonActivo} alternarAcordeon={alternarAcordeon}
              />
            </>
          )}

          <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 mt-6 px-1">Cuenta e Historial</div>
          <SeccionMiPerfil 
            perfilUsuario={perfilUsuario} manejarRestablecerPassword={manejarRestablecerPassword}
            alCerrar={alCerrar} acordeonActivo={acordeonActivo}
            alternarAcordeon={alternarAcordeon}
            actualizarNombrePerfilBD={actualizarNombrePerfilBD}
          />
          
          <SeccionHistorial 
            visible={esCapitanYSuperior && (!esAdminMayor || (esAdminMayor && congregacionContextoId))}
            acordeonActivo={acordeonActivo} alternarAcordeon={alternarAcordeon}
            logs={logs}
            cargandoLogs={cargandoLogs}
            recargarLogs={recargarLogs}
          />

        </div>
      </div>
    </>
  );
}