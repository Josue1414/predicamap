// src/vistas/VistaDashboard.jsx
import React, { useState, useEffect } from 'react';
import { BookmarkPlus } from 'lucide-react'; 

import CabeceraCongregacion from '../componentes/CabeceraCongregacion';
import VisorMapa from '../componentes/VisorMapa';
import MenuLateral from '../componentes/menu-lateral';
import ControlesTrazado from '../componentes/ControlesTrazado';
import MenuEdificio from '../componentes/MenuEdificio';
import MenuTerritorio from '../componentes/MenuTerritorio';

// COMPONENTES EXTRAÍDOS PARA LIMPIAR LA VISTA
import ModalBienvenida from '../componentes/ModalBienvenida';
import { ModalFormularioTachuela, ModalInfoTachuela } from '../componentes/ModalTachuela';
import { ModalFormularioRevisita, ModalInfoLecturaRevisita } from '../componentes/ModalesRevisita';

// HOOKS
import useMapa from '../hooks/useMapa';
import useGestorTachuelas from '../hooks/modulos/useGestorTachuelas';
import useMarcadoresPersonales from '../hooks/modulos/useMarcadoresPersonales';
import useGestorHistorial from '../hooks/modulos/useGestorHistorial';

export default function VistaDashboard() {
  const [modoOscuro, setModoOscuro] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  
  const [nombreCongregacionUI, setNombreCongregacionUI] = useState('Cargando...');
  const [nombreNuevoSetup, setNombreNuevoSetup] = useState('');
  const [territorioSeleccionado, setTerritorioSeleccionado] = useState(null);

  const {
    secciones, edificios, cargando,
    textoBusqueda, setTextoBusqueda, resultadosCiudades, buscarCiudadEnServidor, seleccionarCiudad,
    coordenadasActuales, zoomActual, setZoomActual, setCoordenadasActuales,
    enModoTrazado, setEnModoTrazado, enModoEdificios, setEnModoEdificios,
    nombreNuevoTerritorio, setNombreNuevoTerritorio, colorNuevoTerritorio, setColorNuevoTerritorio, notasNuevoTerritorio, setNotasNuevoTerritorio,
    puntosTrazadoActual, manejarClickMapa, deshacerUltimoPunto, limpiarTrazadoCompleto, cancelarTrazadoYSalir,
    guardarNuevaSeccionEnBD, eliminarSeccionEnBD,
    edificioSeleccionado, setEdificioSeleccionado, notasEdificioTemp, setNotasEdificioTemp, cambiarEstadoEdificioTemp, guardarEdificioEnBD, eliminarEdificioEnBD, volarATerritorio,
    completarTerritorioEntero, mostrarCalles, setMostrarCalles, mostrarLugares, setMostrarLugares,
    perfilUsuario, usuariosEquipo, eliminarMiembroEquipo, crearLinkInvitacion,
    listaCongregaciones, congregacionContextoId, alSeleccionarCongregacionContexto,
    congregacionActiva, guardarNombreCongregacionBD,
    asignarTerritorioEnBD, reiniciarTerritorioEnBD, actualizarNotasSeccionEnBD,
    eliminarCongregacionMasterBD, targetCongId, actualizarNombrePerfilBD, reordenarTerritorioEnBD
  } = useMapa();

  // ESTADOS DE TACHUELAS GRUPALES
  const { tachuelas, agregarTachuelaBD, eliminarTachuelaBD } = useGestorTachuelas(targetCongId);
  const [enModoTachuela, setEnModoTachuela] = useState(false);
  const [tachuelaTemporal, setTachuelaTemporal] = useState(null);
  const [tachuelaLeida, setTachuelaLeida] = useState(null);
  const puedeCrearTachuela = perfilUsuario && ['Administrador Mayor', 'Administrador', 'Capitán'].includes(perfilUsuario.rol);

  // ESTADOS DE REVISITAS PERSONALES
  const gestorRevisitas = useMarcadoresPersonales();
  const [enModoRevisita, setEnModoRevisita] = useState(false);
  const [marcadorRevisitaTemporal, setMarcadorRevisitaTemporal] = useState(null);
  const [revisitaEditando, setRevisitaEditando] = useState(null);
  const [revisitaLectura, setRevisitaLectura] = useState(null);
  const [revisitaExpandida, setRevisitaExpandida] = useState(null); 

  // HISTORIAL DE ACTIVIDAD
  const { logs, cargandoLogs, cargarLogs, registrarLog } = useGestorHistorial(targetCongId);

  // WRAPPERS PARA REGISTRAR EN EL HISTORIAL AUTOMÁTICAMENTE
  const manejarCompletarTerritorio = async (id) => {
    await completarTerritorioEntero(id);
    if (perfilUsuario) registrarLog(perfilUsuario.id, 'Territorio Completado', 'territorio', `Se marcó un territorio y sus casas como completados.`);
  };

  const manejarReiniciarTerritorio = async (id) => {
    await reiniciarTerritorioEnBD(id);
    if (perfilUsuario) registrarLog(perfilUsuario.id, 'Territorio Reiniciado', 'territorio', `Se reinició un territorio a estado pendiente.`);
  };

  const manejarGuardarEdificio = async (edificioNuevo) => {
    await guardarEdificioEnBD(edificioNuevo);
    if (perfilUsuario) registrarLog(perfilUsuario.id, 'Visita Registrada', 'casa', `Se actualizó el estado en: ${edificioNuevo.direccion}`);
  };

  const manejarGuardarTachuela = async (datos) => {
    await agregarTachuelaBD(tachuelaTemporal.lat, tachuelaTemporal.lng, datos.titulo, datos.notas);
    if (perfilUsuario) registrarLog(perfilUsuario.id, 'Aviso Creado', 'tachuela', `Se fijó un nuevo aviso: ${datos.titulo}`);
    setTachuelaTemporal(null);
    setEnModoTachuela(false);
  };

  const manejarEliminarTachuela = async (id, titulo) => {
    await eliminarTachuelaBD(id);
    if (perfilUsuario) registrarLog(perfilUsuario.id, 'Aviso Eliminado', 'tachuela', `Se borró el aviso: ${titulo}`);
    setTachuelaLeida(null);
  };

  useEffect(() => {
    if (modoOscuro) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [modoOscuro]);

  useEffect(() => {
    if (congregacionActiva) setNombreCongregacionUI(congregacionActiva.nombre);
  }, [congregacionActiva]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (nombreCongregacionUI && congregacionActiva && nombreCongregacionUI !== congregacionActiva.nombre && nombreCongregacionUI !== 'Nueva Congregación') {
        guardarNombreCongregacionBD(nombreCongregacionUI);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [nombreCongregacionUI]);

  const mostrarModalBienvenida = congregacionActiva?.nombre === 'Nueva Congregación';

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-200">
      
      {mostrarModalBienvenida && (
        <ModalBienvenida 
          nombreNuevoSetup={nombreNuevoSetup} setNombreNuevoSetup={setNombreNuevoSetup}
          textoBusqueda={textoBusqueda} setTextoBusqueda={setTextoBusqueda}
          buscarCiudadEnServidor={buscarCiudadEnServidor} resultadosCiudades={resultadosCiudades}
          seleccionarCiudad={seleccionarCiudad} cargando={cargando} guardarNombreCongregacionBD={guardarNombreCongregacionBD}
        />
      )}

      <CabeceraCongregacion nombreCongregacion={nombreCongregacionUI} modoOscuro={modoOscuro} alCambiarModo={() => setModoOscuro(!modoOscuro)} alAbrirMenu={() => setMenuAbierto(true)} />

      <MenuLateral 
        abierto={menuAbierto} alCerrar={() => setMenuAbierto(false)} nombreCongregacion={nombreCongregacionUI} 
        alCambiarNombreCongregacion={setNombreCongregacionUI} seccionesGuardadas={secciones} edificiosGuardados={edificios} 
        alEliminarSeccion={eliminarSeccionEnBD} alCompletarTerritorio={manejarCompletarTerritorio} reiniciarTerritorioEnBD={manejarReiniciarTerritorio} 
        alVolarATerritorio={volarATerritorio} textoBusqueda={textoBusqueda} alCambiarTextoBusqueda={setTextoBusqueda} alBuscar={buscarCiudadEnServidor}
        resultadosCiudades={resultadosCiudades} alSeleccionarCiudad={seleccionarCiudad} nombreTerritorio={nombreNuevoTerritorio} alCambiarNombre={setNombreNuevoTerritorio}
        colorTerritorio={colorNuevoTerritorio} alCambiarColor={setColorNuevoTerritorio} notasTerritorio={notasNuevoTerritorio} alCambiarNotas={setNotasNuevoTerritorio}
        alEmpezarATrazar={() => { setEnModoTrazado(true); setEnModoEdificios(false); setEnModoTachuela(false); setEnModoRevisita(false); }}
        alActivarModoEdificios={() => { setEnModoEdificios(true); setEnModoTrazado(false); setEnModoTachuela(false); setEnModoRevisita(false); }}
        mostrarCalles={mostrarCalles} alCambiarMostrarCalles={setMostrarCalles} mostrarLugares={mostrarLugares} alCambiarMostrarLugares={setMostrarLugares}
        perfilUsuario={perfilUsuario} usuariosEquipo={usuariosEquipo} alEliminarMiembro={eliminarMiembroEquipo} alCrearLinkInvitacion={crearLinkInvitacion}
        listaCongregaciones={listaCongregaciones} congregacionContextoId={congregacionContextoId} alSeleccionarCongregacionContexto={alSeleccionarCongregacionContexto}
        asignarTerritorioEnBD={asignarTerritorioEnBD} actualizarNotasSeccionEnBD={actualizarNotasSeccionEnBD} alEliminarCongregacion={eliminarCongregacionMasterBD}
        marcadoresPersonales={gestorRevisitas.marcadores} alVolarARevisita={(m) => { setCoordenadasActuales([m.lat, m.lng]); setZoomActual(19); setMenuAbierto(false); }}
        alEditarRevisita={(m) => { setRevisitaEditando(m); setMenuAbierto(false); }} alEliminarRevisita={gestorRevisitas.eliminarMarcador} alCompartirRevisita={gestorRevisitas.compartirMarcador}
        alExportarBackup={gestorRevisitas.exportarBackup} alImportarBackup={gestorRevisitas.importarBackup} revisitaExpandida={revisitaExpandida} setRevisitaExpandida={setRevisitaExpandida}
        logs={logs} cargandoLogs={cargandoLogs} recargarLogs={cargarLogs} actualizarNombrePerfilBD={actualizarNombrePerfilBD} alReordenarTerritorio={reordenarTerritorioEnBD}
      />

      <MenuEdificio edificio={edificioSeleccionado} perfilUsuario={perfilUsuario} alCerrar={() => setEdificioSeleccionado(null)} alCambiarEstado={cambiarEstadoEdificioTemp} alCambiarDireccion={(nuevaDir) => setEdificioSeleccionado(prev => ({ ...prev, direccion: nuevaDir }))} notasTemp={notasEdificioTemp} alCambiarNotasTemp={setNotasEdificioTemp} alGuardar={manejarGuardarEdificio} alEliminar={eliminarEdificioEnBD} />
      <MenuTerritorio territorio={territorioSeleccionado} edificios={edificios} perfilUsuario={perfilUsuario} alCerrar={() => setTerritorioSeleccionado(null)} alCompletar={manejarCompletarTerritorio} alReiniciar={manejarReiniciarTerritorio} alGuardarNotas={actualizarNotasSeccionEnBD} />

      {enModoTrazado && !mostrarModalBienvenida && <ControlesTrazado puntosContados={puntosTrazadoActual.length} alDeshacer={deshacerUltimoPunto} alLimpiar={limpiarTrazadoCompleto} alCancelar={cancelarTrazadoYSalir} alGuardar={guardarNuevaSeccionEnBD} />}

      {enModoEdificios && !edificioSeleccionado && !mostrarModalBienvenida && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[2000] animate-slide-up">
          <button onClick={() => setEnModoEdificios(false)} className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 px-6 rounded-full shadow-2xl shadow-rose-600/30 active:scale-95 transition-all text-xs border border-rose-400">Detener Siembra de Casas</button>
        </div>
      )}

      {enModoTachuela && !tachuelaTemporal && !mostrarModalBienvenida && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[2000] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-5 py-3 rounded-full shadow-2xl border-2 border-cyan-500 text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-4 animate-slide-up">
          <span className="flex items-center gap-2"><span className="text-xl animate-pulse">📌</span> Toca el mapa para fijar</span>
          <button onClick={() => setEnModoTachuela(false)} className="bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 px-3 py-1 rounded-lg text-xs hover:bg-rose-200 transition-colors">Cancelar</button>
        </div>
      )}

      {enModoRevisita && !marcadorRevisitaTemporal && !mostrarModalBienvenida && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[2000] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-5 py-3 rounded-full shadow-2xl border-2 border-purple-500 text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-4 animate-slide-up">
          <span className="flex items-center gap-2"><BookmarkPlus size={16} className="text-purple-500 animate-pulse"/> Toca el mapa para ubicar</span>
          <button onClick={() => setEnModoRevisita(false)} className="bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 px-3 py-1 rounded-lg text-xs hover:bg-rose-200 transition-colors">Cancelar</button>
        </div>
      )}

      {!enModoTrazado && !enModoEdificios && !enModoTachuela && !enModoRevisita && !mostrarModalBienvenida && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-[2000] flex items-center gap-3">
          <button onClick={() => setEnModoRevisita(true)} className="bg-purple-600 text-white px-5 py-3.5 rounded-full font-black text-sm shadow-xl shadow-purple-600/30 flex items-center gap-2 hover:bg-purple-500 hover:scale-105 active:scale-95 transition-all">
            <BookmarkPlus size={18} /> + Revisita
          </button>
          {puedeCrearTachuela && (
            <button onClick={() => setEnModoTachuela(true)} className="bg-cyan-600 text-white px-5 py-3.5 rounded-full font-black text-sm shadow-xl shadow-cyan-600/30 flex items-center gap-2 hover:bg-cyan-500 hover:scale-105 active:scale-95 transition-all">
              <span className="text-lg leading-none">📌</span> + Aviso
            </button>
          )}
        </div>
      )}

      <main className="w-full h-full pt-14 relative z-10">
        <VisorMapa 
          centroInicial={[25.6565, -100.2930]} zoomInicial={15} centroActual={coordenadasActuales} zoomActual={zoomActual} setZoomActual={setZoomActual} 
          secciones={secciones} edificios={edificios} alSeleccionarEdificio={setEdificioSeleccionado} enModoTrazado={enModoTrazado} enModoEdificios={enModoEdificios}
          puntosTrazadoActual={puntosTrazadoActual} colorTrazadoActual={colorNuevoTerritorio}
          alRegistrarPuntoTrazado={(coords) => {
            if (enModoTachuela) setTachuelaTemporal({ lat: coords[0], lng: coords[1] });
            else if (enModoRevisita) setMarcadorRevisitaTemporal({ lat: coords[0], lng: coords[1] });
            else manejarClickMapa(coords);
          }} 
          mostrarCalles={mostrarCalles} mostrarLugares={mostrarLugares} alSeleccionarTerritorio={setTerritorioSeleccionado}
          enModoTachuela={enModoTachuela} tachuelasGrupales={tachuelas} alSeleccionarTachuela={setTachuelaLeida} tachuelaTemporal={tachuelaTemporal}
          enModoRevisita={enModoRevisita} marcadoresPersonales={gestorRevisitas.marcadores} alSeleccionarRevisita={setRevisitaLectura} marcadorTemporal={marcadorRevisitaTemporal}
        />
        {!mostrarModalBienvenida && (
          <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-lg text-[10px] font-semibold text-slate-700 dark:text-slate-300 pointer-events-none border border-slate-200 dark:border-slate-800">
            {enModoTrazado ? <span className="text-rose-500 animate-pulse font-bold">✏️ Dibujando territorio...</span> : 
             enModoEdificios ? <span className="text-emerald-500 animate-pulse font-bold">🏠 Toca los techos en el mapa</span> : 
             enModoTachuela ? <span className="text-cyan-500 animate-pulse font-bold">📌 Modo Aviso Grupal</span> : 
             enModoRevisita ? <span className="text-purple-500 animate-pulse font-bold">📍 Modo Revisita</span> : 
             <>Rol: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{perfilUsuario?.rol || 'Cargando...'}</span></>}
          </div>
        )}
      </main>

      {tachuelaTemporal && <ModalFormularioTachuela alGuardar={manejarGuardarTachuela} alCancelar={() => { setTachuelaTemporal(null); setEnModoTachuela(false); }} />}
      {tachuelaLeida && <ModalInfoTachuela tachuela={tachuelaLeida} puedeEliminar={puedeCrearTachuela} alEliminar={() => manejarEliminarTachuela(tachuelaLeida.id, tachuelaLeida.titulo)} alCerrar={() => setTachuelaLeida(null)} />}

      {(marcadorRevisitaTemporal || revisitaEditando) && (
        <ModalFormularioRevisita marcadorEditando={revisitaEditando}
          alGuardar={(datos) => {
            if (revisitaEditando) { gestorRevisitas.editarMarcador(revisitaEditando.id, datos); setRevisitaEditando(null); } 
            else { gestorRevisitas.agregarMarcador(marcadorRevisitaTemporal.lat, marcadorRevisitaTemporal.lng, datos.titulo, datos.fechaProgramada, datos.notas); setMarcadorRevisitaTemporal(null); setEnModoRevisita(false); }
          }}
          alCancelar={() => { setMarcadorRevisitaTemporal(null); setRevisitaEditando(null); setEnModoRevisita(false); }}
        />
      )}
      {revisitaLectura && <ModalInfoLecturaRevisita titulo={revisitaLectura.titulo} fechaProgramada={revisitaLectura.fechaProgramada} notas={revisitaLectura.notas} alCerrar={() => setRevisitaLectura(null)} />}
    </div>
  );
}