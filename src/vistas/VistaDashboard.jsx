// src/vistas/VistaDashboard.jsx
import React, { useState, useEffect } from 'react';
import { MapPin, X, Trash2, BookmarkPlus } from 'lucide-react'; 
import CabeceraCongregacion from '../componentes/CabeceraCongregacion';
import VisorMapa from '../componentes/VisorMapa';
import MenuLateral from '../componentes/menu-lateral';
import ControlesTrazado from '../componentes/ControlesTrazado';
import MenuEdificio from '../componentes/MenuEdificio';
import MenuTerritorio from '../componentes/MenuTerritorio';
import useMapa from '../hooks/useMapa';

import useGestorTachuelas from '../hooks/modulos/useGestorTachuelas';
import { ModalFormularioTachuela, ModalInfoTachuela } from '../componentes/ModalTachuela';
import useMarcadoresPersonales from '../hooks/modulos/useMarcadoresPersonales';

// ★ NUEVO HOOK DE HISTORIAL ★
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
    enModoTrazado, setEnModoTrazado,
    enModoEdificios, setEnModoEdificios,
    nombreNuevoTerritorio, setNombreNuevoTerritorio, colorNuevoTerritorio, setColorNuevoTerritorio, notasNuevoTerritorio, setNotasNuevoTerritorio,
    puntosTrazadoActual, manejarClickMapa, deshacerUltimoPunto, limpiarTrazadoCompleto, cancelarTrazadoYSalir,
    guardarNuevaSeccionEnBD, eliminarSeccionEnBD,
    edificioSeleccionado, setEdificioSeleccionado, notasEdificioTemp, setNotasEdificioTemp, cambiarEstadoEdificioTemp, guardarEdificioEnBD, eliminarEdificioEnBD, volarATerritorio,
    completarTerritorioEntero,
    mostrarCalles, setMostrarCalles, mostrarLugares, setMostrarLugares,
    perfilUsuario,
    usuariosEquipo,
    eliminarMiembroEquipo,
    crearLinkInvitacion,
    listaCongregaciones, 
    congregacionContextoId, 
    alSeleccionarCongregacionContexto,
    congregacionActiva, 
    guardarNombreCongregacionBD,
    asignarTerritorioEnBD, 
    reiniciarTerritorioEnBD, 
    actualizarNotasSeccionEnBD,
    eliminarCongregacionMasterBD,
    targetCongId,
    actualizarNombrePerfilBD,
    reordenarTerritorioEnBD // ★ FUNCIÓN RECUPERADA PARA REORDENAR TERRITORIOS ★
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

  // ★ INICIALIZACIÓN DEL HISTORIAL DE ACTIVIDAD ★
  const { logs, cargandoLogs, cargarLogs, registrarLog } = useGestorHistorial(targetCongId);

  // =========================================================================
  // ★ WRAPPERS PARA REGISTRAR EN EL HISTORIAL AUTOMÁTICAMENTE ★
  // =========================================================================
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
  // =========================================================================

  useEffect(() => {
    if (modoOscuro) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [modoOscuro]);

  useEffect(() => {
    if (congregacionActiva) {
      setNombreCongregacionUI(congregacionActiva.nombre);
    }
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
        <div className="fixed inset-0 z-[5000] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-2xl w-full max-w-md animate-slide-up">
             <div className="text-center mb-6">
               <div className="bg-indigo-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin size={32} className="text-indigo-400" />
               </div>
               <h2 className="text-xl font-black text-white">¡Bienvenido a PredicaMap!</h2>
               <p className="text-slate-400 text-xs mt-2">Vamos a configurar el espacio de trabajo de tu congregación.</p>
             </div>
             
             <div className="space-y-5">
               <div>
                 <label className="block text-slate-300 text-xs font-bold mb-1.5">Nombre Oficial de la Congregación</label>
                 <input type="text" value={nombreNuevoSetup} onChange={(e) => setNombreNuevoSetup(e.target.value)} placeholder="Ej: Congregación Los Pinos" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-indigo-500 focus:outline-none transition-colors" />
               </div>

               <div>
                 <label className="block text-slate-300 text-xs font-bold mb-1.5">Busca tu Ciudad en el Mapa</label>
                 <form onSubmit={(e) => { e.preventDefault(); buscarCiudadEnServidor(); }} className="flex gap-2">
                   <input type="text" value={textoBusqueda} onChange={(e) => setTextoBusqueda(e.target.value)} placeholder="Ej: Zapopan, Jalisco..." className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-indigo-500 focus:outline-none transition-colors" />
                   <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 rounded-xl font-bold transition-colors shadow-lg shadow-indigo-600/20">Buscar</button>
                 </form>
                 {resultadosCiudades.length > 0 && (
                    <ul className="mt-3 border border-slate-700 rounded-xl max-h-32 overflow-y-auto text-xs bg-slate-900 scroll-limpio">
                      {resultadosCiudades.map((c, i) => (
                        <li key={i} onClick={() => seleccionarCiudad(c)} className="p-3 hover:bg-slate-800 cursor-pointer text-slate-300 border-b border-slate-800 last:border-0 transition-colors">{c.display_name}</li>
                      ))}
                    </ul>
                 )}
               </div>

               <button 
                 disabled={!nombreNuevoSetup.trim() || cargando} 
                 onClick={() => guardarNombreCongregacionBD(nombreNuevoSetup)}
                 className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center"
               >
                 {cargando ? 'Guardando...' : 'Comenzar a Perimetrar'}
               </button>
             </div>
          </div>
        </div>
      )}

      <CabeceraCongregacion 
        nombreCongregacion={nombreCongregacionUI} 
        modoOscuro={modoOscuro}
        alCambiarModo={() => setModoOscuro(!modoOscuro)} alAbrirMenu={() => setMenuAbierto(true)}
      />

      <MenuLateral 
        abierto={menuAbierto} alCerrar={() => setMenuAbierto(false)}
        nombreCongregacion={nombreCongregacionUI} 
        alCambiarNombreCongregacion={setNombreCongregacionUI} 
        seccionesGuardadas={secciones} 
        edificiosGuardados={edificios} 
        alEliminarSeccion={eliminarSeccionEnBD}
        
        alCompletarTerritorio={manejarCompletarTerritorio} 
        reiniciarTerritorioEnBD={manejarReiniciarTerritorio} 
        
        alVolarATerritorio={volarATerritorio} 
        textoBusqueda={textoBusqueda} alCambiarTextoBusqueda={setTextoBusqueda} alBuscar={buscarCiudadEnServidor}
        resultadosCiudades={resultadosCiudades} alSeleccionarCiudad={seleccionarCiudad}
        nombreTerritorio={nombreNuevoTerritorio} alCambiarNombre={setNombreNuevoTerritorio}
        colorTerritorio={colorNuevoTerritorio} alCambiarColor={setColorNuevoTerritorio}
        notasTerritorio={notasNuevoTerritorio} alCambiarNotas={setNotasNuevoTerritorio}
        
        alEmpezarATrazar={() => { setEnModoTrazado(true); setEnModoEdificios(false); setEnModoTachuela(false); setEnModoRevisita(false); }}
        alActivarModoEdificios={() => { setEnModoEdificios(true); setEnModoTrazado(false); setEnModoTachuela(false); setEnModoRevisita(false); }}
        
        mostrarCalles={mostrarCalles} alCambiarMostrarCalles={setMostrarCalles}
        mostrarLugares={mostrarLugares} alCambiarMostrarLugares={setMostrarLugares}
        perfilUsuario={perfilUsuario}
        usuariosEquipo={usuariosEquipo}
        alEliminarMiembro={eliminarMiembroEquipo}
        alCrearLinkInvitacion={crearLinkInvitacion}
        listaCongregaciones={listaCongregaciones}
        congregacionContextoId={congregacionContextoId}
        alSeleccionarCongregacionContexto={alSeleccionarCongregacionContexto}
        asignarTerritorioEnBD={asignarTerritorioEnBD}
        actualizarNotasSeccionEnBD={actualizarNotasSeccionEnBD}
        alEliminarCongregacion={eliminarCongregacionMasterBD}

        marcadoresPersonales={gestorRevisitas.marcadores}
        alVolarARevisita={(m) => { setCoordenadasActuales([m.lat, m.lng]); setZoomActual(19); setMenuAbierto(false); }}
        alEditarRevisita={(m) => { setRevisitaEditando(m); setMenuAbierto(false); }}
        alEliminarRevisita={gestorRevisitas.eliminarMarcador}
        alCompartirRevisita={gestorRevisitas.compartirMarcador}
        alExportarBackup={gestorRevisitas.exportarBackup}
        alImportarBackup={gestorRevisitas.importarBackup}
        revisitaExpandida={revisitaExpandida}
        setRevisitaExpandida={setRevisitaExpandida}

        logs={logs}
        cargandoLogs={cargandoLogs}
        recargarLogs={cargarLogs}

        actualizarNombrePerfilBD={actualizarNombrePerfilBD}
        alReordenarTerritorio={reordenarTerritorioEnBD} // ★ PROP RECUPERADA ★
      />

      <MenuEdificio 
        edificio={edificioSeleccionado}
        perfilUsuario={perfilUsuario}
        alCerrar={() => setEdificioSeleccionado(null)}
        alCambiarEstado={cambiarEstadoEdificioTemp}
        alCambiarDireccion={(nuevaDir) => setEdificioSeleccionado(prev => ({ ...prev, direccion: nuevaDir }))}
        notasTemp={notasEdificioTemp}
        alCambiarNotasTemp={setNotasEdificioTemp}
        alGuardar={manejarGuardarEdificio}
        alEliminar={eliminarEdificioEnBD}
      />

      <MenuTerritorio 
        territorio={territorioSeleccionado}
        edificios={edificios}
        perfilUsuario={perfilUsuario}
        alCerrar={() => setTerritorioSeleccionado(null)}
        alCompletar={manejarCompletarTerritorio}
        alReiniciar={manejarReiniciarTerritorio}
        alGuardarNotas={actualizarNotasSeccionEnBD}
      />

      {enModoTrazado && !mostrarModalBienvenida && (
        <ControlesTrazado 
          puntosContados={puntosTrazadoActual.length} alDeshacer={deshacerUltimoPunto} alLimpiar={limpiarTrazadoCompleto}
          alCancelar={cancelarTrazadoYSalir} alGuardar={guardarNuevaSeccionEnBD}
        />
      )}

      {enModoEdificios && !edificioSeleccionado && !mostrarModalBienvenida && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[2000] animate-slide-up">
          <button 
            onClick={() => setEnModoEdificios(false)} 
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 px-6 rounded-full shadow-2xl shadow-rose-600/30 active:scale-95 transition-all text-xs border border-rose-400"
          >
            Detener Siembra de Casas
          </button>
        </div>
      )}

      {/* BANNERS INDICADORES DE MODO */}
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

      {/* BOTONERÍA FLOTANTE PRINCIPAL */}
      {!enModoTrazado && !enModoEdificios && !enModoTachuela && !enModoRevisita && !mostrarModalBienvenida && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-[2000] flex items-center gap-3">
          <button 
            onClick={() => setEnModoRevisita(true)} 
            className="bg-purple-600 text-white px-5 py-3.5 rounded-full font-black text-sm shadow-xl shadow-purple-600/30 flex items-center gap-2 hover:bg-purple-500 hover:scale-105 active:scale-95 transition-all"
          >
            <BookmarkPlus size={18} /> + Revisita
          </button>
          {puedeCrearTachuela && (
            <button 
              onClick={() => setEnModoTachuela(true)} 
              className="bg-cyan-600 text-white px-5 py-3.5 rounded-full font-black text-sm shadow-xl shadow-cyan-600/30 flex items-center gap-2 hover:bg-cyan-500 hover:scale-105 active:scale-95 transition-all"
            >
              <span className="text-lg leading-none">📌</span> + Aviso
            </button>
          )}
        </div>
      )}

      <main className="w-full h-full pt-14 relative z-10">
        <VisorMapa 
          centroInicial={[25.6565, -100.2930]} zoomInicial={15}
          centroActual={coordenadasActuales} 
          zoomActual={zoomActual} 
          setZoomActual={setZoomActual} 
          secciones={secciones} edificios={edificios}
          alSeleccionarEdificio={setEdificioSeleccionado}
          enModoTrazado={enModoTrazado} enModoEdificios={enModoEdificios}
          puntosTrazadoActual={puntosTrazadoActual} colorTrazadoActual={colorNuevoTerritorio}
          alRegistrarPuntoTrazado={(coords) => {
            if (enModoTachuela) {
              setTachuelaTemporal({ lat: coords[0], lng: coords[1] });
            } else if (enModoRevisita) {
              setMarcadorRevisitaTemporal({ lat: coords[0], lng: coords[1] });
            } else {
              manejarClickMapa(coords);
            }
          }} 
          mostrarCalles={mostrarCalles} mostrarLugares={mostrarLugares}
          alSeleccionarTerritorio={setTerritorioSeleccionado}
          
          enModoTachuela={enModoTachuela}
          tachuelasGrupales={tachuelas}
          alSeleccionarTachuela={setTachuelaLeida}
          tachuelaTemporal={tachuelaTemporal}

          enModoRevisita={enModoRevisita}
          marcadoresPersonales={gestorRevisitas.marcadores}
          alSeleccionarRevisita={setRevisitaLectura}
          marcadorTemporal={marcadorRevisitaTemporal}
        />

        {!mostrarModalBienvenida && (
          <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-lg text-[10px] font-semibold text-slate-700 dark:text-slate-300 pointer-events-none border border-slate-200 dark:border-slate-800">
            {enModoTrazado ? (
              <span className="text-rose-500 animate-pulse font-bold">✏️ Dibujando territorio...</span>
            ) : enModoEdificios ? (
              <span className="text-emerald-500 animate-pulse font-bold">🏠 Toca los techos en el mapa</span>
            ) : enModoTachuela ? (
              <span className="text-cyan-500 animate-pulse font-bold">📌 Modo Aviso Grupal</span>
            ) : enModoRevisita ? (
              <span className="text-purple-500 animate-pulse font-bold">📍 Modo Revisita</span>
            ) : (
              <>Rol: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{perfilUsuario?.rol || 'Cargando...'}</span></>
            )}
          </div>
        )}
      </main>

      {tachuelaTemporal && (
        <ModalFormularioTachuela 
          alGuardar={manejarGuardarTachuela}
          alCancelar={() => {
            setTachuelaTemporal(null);
            setEnModoTachuela(false);
          }}
        />
      )}

      {tachuelaLeida && (
        <ModalInfoTachuela 
          tachuela={tachuelaLeida}
          puedeEliminar={puedeCrearTachuela}
          alEliminar={() => manejarEliminarTachuela(tachuelaLeida.id, tachuelaLeida.titulo)}
          alCerrar={() => setTachuelaLeida(null)}
        />
      )}

      {(marcadorRevisitaTemporal || revisitaEditando) && (
        <ModalFormularioRevisita
          marcadorEditando={revisitaEditando}
          alGuardar={(datos) => {
            if (revisitaEditando) {
              gestorRevisitas.editarMarcador(revisitaEditando.id, datos);
              setRevisitaEditando(null);
            } else {
              gestorRevisitas.agregarMarcador(marcadorRevisitaTemporal.lat, marcadorRevisitaTemporal.lng, datos.titulo, datos.fechaProgramada, datos.notas);
              setMarcadorRevisitaTemporal(null);
              setEnModoRevisita(false);
            }
          }}
          alCancelar={() => { setMarcadorRevisitaTemporal(null); setRevisitaEditando(null); setEnModoRevisita(false); }}
        />
      )}

      {revisitaLectura && (
        <ModalInfoLecturaRevisita 
          titulo={revisitaLectura.titulo} 
          fechaProgramada={revisitaLectura.fechaProgramada} 
          notas={revisitaLectura.notas} 
          alCerrar={() => setRevisitaLectura(null)} 
        />
      )}
    </div>
  );
}

// --------------------------------------------------------
// COMPONENTES INTERNOS EXCLUSIVOS PARA REVISITAS PERSONALES
// --------------------------------------------------------
function ModalFormularioRevisita({ marcadorEditando, alGuardar, alCancelar }) {
  const [titulo, setTitulo] = useState(marcadorEditando?.titulo || '');
  const [fecha, setFecha] = useState(marcadorEditando?.fechaProgramada || '');
  const [notas, setNotas] = useState(marcadorEditando?.notas || '');

  const manejarSubmit = (e) => {
    e.preventDefault();
    if (!titulo.trim()) return alert("El título o nombre es obligatorio");
    alGuardar({ titulo, fechaProgramada: fecha, notas });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[4000] transition-opacity" onClick={alCancelar} />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl z-[4001] animate-slide-up overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex justify-between items-start mb-5">
            <h3 className="font-black text-xl text-purple-700 dark:text-purple-400 flex items-center gap-2">
              <BookmarkPlus size={24} /> {marcadorEditando ? 'Editar Revisita' : 'Guardar Revisita'}
            </h3>
            <button onClick={alCancelar} className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500 transition-colors"><X size={18} /></button>
          </div>
          <form onSubmit={manejarSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Nombre / Título *</label>
              <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej: Familia López, Casa Azul..." autoFocus className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-500 text-slate-800 dark:text-slate-100" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Día programado (Opcional)</label>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-500 text-slate-800 dark:text-slate-100" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Observaciones / Hora</label>
              <textarea value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Ej: Visitar por la tarde a las 5:00 PM, llevar folleto..." rows="3" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-500 resize-none text-slate-800 dark:text-slate-100" />
            </div>
            <button type="submit" className="w-full mt-2 py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/20 active:scale-95 transition-all">
              {marcadorEditando ? 'Actualizar Datos' : 'Guardar en mi Mapa'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

function ModalInfoLecturaRevisita({ titulo, fechaProgramada, notas, alCerrar }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[4000] transition-opacity" onClick={alCerrar} />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl z-[4001] animate-slide-up overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-black text-xl text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <BookmarkPlus size={24} className="text-purple-500" /> {titulo}
            </h3>
            <button onClick={alCerrar} className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500 transition-colors"><X size={18} /></button>
          </div>
          <div className="mb-4">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Estado de Visita</label>
            <div className="font-black text-sm uppercase text-purple-500">
              {fechaProgramada ? `Agendado: ${fechaProgramada}` : 'Sin fecha específica'}
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Notas u Observaciones</label>
            <div className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm text-slate-700 dark:text-slate-200 min-h-[80px] whitespace-pre-wrap">
              {notas ? notas : <span className="italic text-slate-400">Sin detalles registrados...</span>}
            </div>
          </div>
          <button onClick={alCerrar} className="w-full mt-6 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors">
            Aceptar
          </button>
        </div>
      </div>
    </>
  );
}