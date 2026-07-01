// src/vistas/VistaDashboard.jsx
import React, { useState, useEffect } from 'react';
import { BookmarkPlus } from 'lucide-react'; 

import CabeceraCongregacion from '../componentes/CabeceraCongregacion';
import VisorMapa from '../componentes/VisorMapa';
import MenuLateral from '../componentes/menu-lateral';
import ControlesTrazado from '../componentes/ControlesTrazado';
import MenuEdificio from '../componentes/MenuEdificio';
import MenuTerritorio from '../componentes/MenuTerritorio';

import ModalBienvenida from '../componentes/ModalBienvenida';
import { ModalFormularioTachuela, ModalInfoTachuela } from '../componentes/ModalTachuela';
import { ModalFormularioRevisita, ModalInfoLecturaRevisita } from '../componentes/ModalesRevisita';

import useMapa from '../hooks/useMapa';
import useGestorTachuelas from '../hooks/modulos/useGestorTachuelas';
import useMarcadoresPersonales from '../hooks/modulos/useMarcadoresPersonales';
import useGestorHistorial from '../hooks/modulos/useGestorHistorial';

import { useModoMapa, MODOS_MAPA } from '../context/ContextoModoMapa';

export default function VistaDashboard() {
  const [modoOscuro, setModoOscuro] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  
  const [nombreCongregacionUI, setNombreCongregacionUI] = useState('Cargando...');
  const [nombreNuevoSetup, setNombreNuevoSetup] = useState('');
  const [territorioSeleccionado, setTerritorioSeleccionado] = useState(null);

  const { 
    enModoTachuela, 
    enModoRevisita, 
    cambiarModo, 
    limpiarModo 
  } = useModoMapa();

  const {
    secciones, edificios, cargando,
    textoBusqueda, setTextoBusqueda, resultadosCiudades, buscarCiudadEnServidor, seleccionarCiudad,
    coordenadasActuales, zoomActual, setZoomActual, setCoordenadasActuales,
    enModoTrazado, enModoEdificios, 
    nombreNuevoTerritorio, setNombreNuevoTerritorio, colorNuevoTerritorio, setColorNuevoTerritorio, notasNuevoTerritorio, setNotasNuevoTerritorio,
    puntosTrazadoActual, manejarClickMapa, deshacerUltimoPunto, limpiarTrazadoCompleto, cancelarTrazadoYSalir,
    guardarNuevaSeccionEnBD, eliminarSeccionEnBD,
    edificioSeleccionado, setEdificioSeleccionado, notasEdificioTemp, setNotasEdificioTemp, cambiarEstadoEdificioTemp, guardarEdificioEnBD, eliminarEdificioEnBD, volarATerritorio,
    completarTerritorioEntero, mostrarCalles, setMostrarCalles, mostrarLugares, setMostrarLugares,
    perfilUsuario, usuariosEquipo, eliminarMiembroEquipo, crearLinkInvitacion,
    listaCongregaciones, congregacionContextoId, alSeleccionarCongregacionContexto,
    congregacionActiva, guardarNombreCongregacionBD,
    asignarTerritorioEnBD, reiniciarTerritorioEnBD, actualizarNotasSeccionEnBD,
    eliminarCongregacionMasterBD, targetCongId, actualizarNombrePerfilBD, reordenarTerritorioEnBD,
    modoAhorro, reactivarTiempoReal,actualizarDetallesSeccionEnBD,
  } = useMapa();

  const { tachuelas, agregarTachuelaBD, eliminarTachuelaBD } = useGestorTachuelas(targetCongId);
  const [tachuelaTemporal, setTachuelaTemporal] = useState(null);
  const [tachuelaLeida, setTachuelaLeida] = useState(null);
  const puedeCrearTachuela = perfilUsuario && ['Administrador Mayor', 'Administrador', 'Capitán'].includes(perfilUsuario.rol);

  const gestorRevisitas = useMarcadoresPersonales();
  const [marcadorRevisitaTemporal, setMarcadorRevisitaTemporal] = useState(null);
  const [revisitaEditando, setRevisitaEditando] = useState(null);
  const [revisitaLectura, setRevisitaLectura] = useState(null);
  const [revisitaExpandida, setRevisitaExpandida] = useState(null); 

  const { 
    logs, 
    cargandoLogs, 
    cargarLogs, 
    registrarLog,
    pagina, 
    totalPaginas, 
    cambiarPagina 
  } = useGestorHistorial(targetCongId);

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
    limpiarModo(); 
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
    <div className="w-screen h-[100dvh] overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-200">
      
      {mostrarModalBienvenida && (
        <ModalBienvenida 
          nombreNuevoSetup={nombreNuevoSetup} setNombreNuevoSetup={setNombreNuevoSetup}
          textoBusqueda={textoBusqueda} setTextoBusqueda={setTextoBusqueda}
          buscarCiudadEnServidor={buscarCiudadEnServidor} resultadosCiudades={resultadosCiudades}
          seleccionarCiudad={seleccionarCiudad} cargando={cargando} guardarNombreCongregacionBD={guardarNombreCongregacionBD}
        />
      )}

      <CabeceraCongregacion 
        nombreCongregacion={nombreCongregacionUI} 
        alAbrirMenu={() => setMenuAbierto(true)} 
        perfilUsuario={perfilUsuario}
        modoAhorro={modoAhorro}
        alReactivar={reactivarTiempoReal}
      />

      <MenuLateral 
        abierto={menuAbierto} alCerrar={() => setMenuAbierto(false)} nombreCongregacion={nombreCongregacionUI} 
        alCambiarNombreCongregacion={setNombreCongregacionUI} seccionesGuardadas={secciones} edificiosGuardados={edificios} 
        alEliminarSeccion={eliminarSeccionEnBD} alCompletarTerritorio={manejarCompletarTerritorio} reiniciarTerritorioEnBD={manejarReiniciarTerritorio} 
        alVolarATerritorio={volarATerritorio} textoBusqueda={textoBusqueda} alCambiarTextoBusqueda={setTextoBusqueda} alBuscar={buscarCiudadEnServidor}
        resultadosCiudades={resultadosCiudades} alSeleccionarCiudad={seleccionarCiudad} nombreTerritorio={nombreNuevoTerritorio} alCambiarNombre={setNombreNuevoTerritorio}
        colorTerritorio={colorNuevoTerritorio} alCambiarColor={setColorNuevoTerritorio} notasTerritorio={notasNuevoTerritorio} alCambiarNotas={setNotasNuevoTerritorio}
        
        alEmpezarATrazar={() => cambiarModo(MODOS_MAPA.TRAZADO)}
        alActivarModoEdificios={() => cambiarModo(MODOS_MAPA.EDIFICIOS)}
        
        mostrarCalles={mostrarCalles} alCambiarMostrarCalles={setMostrarCalles} mostrarLugares={mostrarLugares} alCambiarMostrarLugares={setMostrarLugares}
        perfilUsuario={perfilUsuario} usuariosEquipo={usuariosEquipo} alEliminarMiembro={eliminarMiembroEquipo} alCrearLinkInvitacion={crearLinkInvitacion}
        listaCongregaciones={listaCongregaciones} congregacionContextoId={congregacionContextoId} alSeleccionarCongregacionContexto={alSeleccionarCongregacionContexto}
        asignarTerritorioEnBD={asignarTerritorioEnBD} actualizarNotasSeccionEnBD={actualizarNotasSeccionEnBD} actualizarDetallesSeccionEnBD={actualizarDetallesSeccionEnBD} alEliminarCongregacion={eliminarCongregacionMasterBD}
        marcadoresPersonales={gestorRevisitas.marcadores} alVolarARevisita={(m) => { setCoordenadasActuales([m.lat, m.lng]); setZoomActual(19); setMenuAbierto(false); }}
        alEditarRevisita={(m) => { setRevisitaEditando(m); setMenuAbierto(false); }} alEliminarRevisita={gestorRevisitas.eliminarMarcador} alCompartirRevisita={gestorRevisitas.compartirMarcador}
        alExportarBackup={gestorRevisitas.exportarBackup} alImportarBackup={gestorRevisitas.importarBackup} revisitaExpandida={revisitaExpandida} setRevisitaExpandida={setRevisitaExpandida}
        
        logs={logs} 
        cargandoLogs={cargandoLogs} 
        recargarLogs={cargarLogs} 
        actualizarNombrePerfilBD={actualizarNombrePerfilBD} 
        alReordenarTerritorio={reordenarTerritorioEnBD}
        modoOscuro={modoOscuro} 
        alCambiarModo={() => setModoOscuro(!modoOscuro)}
        pagina={pagina}
        totalPaginas={totalPaginas}
        alCambiarPagina={cambiarPagina}
      />

      <MenuEdificio 
        edificio={edificioSeleccionado} 
        perfilUsuario={perfilUsuario} 
        alCerrar={() => setEdificioSeleccionado(null)} 
        alCambiarEstado={cambiarEstadoEdificioTemp} 
        alCambiarDireccion={(nuevaDir) => setEdificioSeleccionado(prev => ({ ...prev, direccion: nuevaDir }))} 
        alCambiarTipo={(nuevoTipo) => setEdificioSeleccionado(prev => ({ ...prev, tipo_edificio: nuevoTipo }))}
        notasTemp={edificioSeleccionado?.notas || ''} 
        alCambiarNotasTemp={(nuevasNotas) => setEdificioSeleccionado(prev => ({ ...prev, notas: nuevasNotas }))} 
        alGuardar={manejarGuardarEdificio} 
        alEliminar={eliminarEdificioEnBD} 
      />

      <MenuTerritorio territorio={territorioSeleccionado} edificios={edificios} perfilUsuario={perfilUsuario} alCerrar={() => setTerritorioSeleccionado(null)} alCompletar={manejarCompletarTerritorio} alReiniciar={manejarReiniciarTerritorio} alGuardarNotas={actualizarNotasSeccionEnBD} />

      {enModoTrazado && !mostrarModalBienvenida && <ControlesTrazado puntosContados={puntosTrazadoActual.length} alDeshacer={deshacerUltimoPunto} alLimpiar={limpiarTrazadoCompleto} alCancelar={cancelarTrazadoYSalir} alGuardar={guardarNuevaSeccionEnBD} />}

      {enModoEdificios && !edificioSeleccionado && !mostrarModalBienvenida && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-[2000] animate-slide-up">
          <button onClick={limpiarModo} className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 px-6 rounded-full shadow-2xl shadow-rose-600/30 active:scale-95 transition-all text-xs border border-rose-400">Detener Siembra de Casas</button>
        </div>
      )}

      {enModoTachuela && !tachuelaTemporal && !mostrarModalBienvenida && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[2000] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-5 py-2.5 rounded-full shadow-2xl border-2 border-cyan-500 text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3 animate-slide-up">
          <span className="flex items-center gap-1.5"><span className="text-base animate-pulse">📌</span> Toca para fijar</span>
          <button onClick={limpiarModo} className="bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-md text-[10px] hover:bg-rose-200 transition-colors">Cancelar</button>
        </div>
      )}

      {enModoRevisita && !marcadorRevisitaTemporal && !mostrarModalBienvenida && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[2000] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-5 py-2.5 rounded-full shadow-2xl border-2 border-purple-500 text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3 animate-slide-up">
          <span className="flex items-center gap-1.5"><BookmarkPlus size={14} className="text-purple-500 animate-pulse"/> Toca para ubicar</span>
          <button onClick={limpiarModo} className="bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-md text-[10px] hover:bg-rose-200 transition-colors">Cancelar</button>
        </div>
      )}

      {!enModoTrazado && !enModoEdificios && !enModoTachuela && !enModoRevisita && !mostrarModalBienvenida && (
        <div className="absolute bottom-[14px] right-14 z-[2000] flex items-center gap-2 animate-slide-up">
          
          <button 
            onClick={() => cambiarModo(MODOS_MAPA.REVISITA)} 
            className="bg-purple-600 text-white w-12 h-12 rounded-2xl shadow-xl shadow-purple-600/30 flex flex-col items-center justify-center hover:bg-purple-500 hover:scale-105 active:scale-95 transition-all border border-purple-500"
          >
            <BookmarkPlus size={18} className="mb-0.5" />
            <span className="text-[7px] font-black uppercase tracking-wider">Revisita</span>
          </button>
          
          {puedeCrearTachuela ? (
            <button 
              onClick={() => cambiarModo(MODOS_MAPA.TACHUELA)} 
              className="bg-cyan-600 text-white w-12 h-12 rounded-2xl shadow-xl shadow-cyan-600/30 flex flex-col items-center justify-center hover:bg-cyan-500 hover:scale-105 active:scale-95 transition-all border border-cyan-500"
            >
              <span className="text-base leading-none mb-0.5">📌</span>
              <span className="text-[7px] font-black uppercase tracking-wider">Aviso</span>
            </button>
          ) : (
            <div className="w-12 h-12 pointer-events-none"></div>
          )}
        </div>
      )}

      <main className="flex-1 w-full relative z-10">
        <VisorMapa 
          centroInicial={[23.6345, -102.5528]} zoomInicial={5} centroActual={coordenadasActuales} zoomActual={zoomActual} setZoomActual={setZoomActual} 
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
        
        {(enModoTrazado || enModoEdificios || enModoTachuela || enModoRevisita) && !mostrarModalBienvenida && (
          <div className="absolute bottom-8 left-4 z-[1000] bg-white/90 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-lg text-[10px] font-semibold text-slate-700 dark:text-slate-300 pointer-events-none border border-slate-200 dark:border-slate-800 animate-slide-up">
            {enModoTrazado && <span className="text-rose-500 animate-pulse font-bold">✏️ Dibujando territorio...</span>}
            {enModoEdificios && <span className="text-emerald-500 animate-pulse font-bold">🏠 Toca los techos en el mapa</span>}
            {enModoTachuela && <span className="text-cyan-500 animate-pulse font-bold">📌 Modo Aviso Grupal</span>}
            {enModoRevisita && <span className="text-purple-500 animate-pulse font-bold">📍 Modo Revisita</span>}
          </div>
        )}
      </main>

      {tachuelaTemporal && <ModalFormularioTachuela alGuardar={manejarGuardarTachuela} alCancelar={() => { setTachuelaTemporal(null); limpiarModo(); }} />}
      {tachuelaLeida && <ModalInfoTachuela tachuela={tachuelaLeida} puedeEliminar={puedeCrearTachuela} alEliminar={() => manejarEliminarTachuela(tachuelaLeida.id, tachuelaLeida.titulo)} alCerrar={() => setTachuelaLeida(null)} />}

      {(marcadorRevisitaTemporal || revisitaEditando) && (
        <ModalFormularioRevisita marcadorEditando={revisitaEditando}
          alGuardar={(datos) => {
            if (revisitaEditando) { gestorRevisitas.editarMarcador(revisitaEditando.id, datos); setRevisitaEditando(null); } 
            else { gestorRevisitas.agregarMarcador(marcadorRevisitaTemporal.lat, marcadorRevisitaTemporal.lng, datos.titulo, datos.fechaProgramada, datos.notas); setMarcadorRevisitaTemporal(null); limpiarModo(); }
          }}
          alCancelar={() => { setMarcadorRevisitaTemporal(null); setRevisitaEditando(null); limpiarModo(); }}
        />
      )}
      {revisitaLectura && (
        <ModalInfoLecturaRevisita 
          revisita={revisitaLectura} 
          alGuardar={(id, datos) => {
            gestorRevisitas.editarMarcador(id, datos);
            setRevisitaLectura({ ...revisitaLectura, ...datos }); // Actualizamos la vista inmediatamente
          }} 
          alCerrar={() => setRevisitaLectura(null)} 
        />
      )}
    </div>
  );
}