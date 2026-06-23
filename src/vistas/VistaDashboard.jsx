// src/vistas/VistaDashboard.jsx
import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import CabeceraCongregacion from '../componentes/CabeceraCongregacion';
import VisorMapa from '../componentes/VisorMapa';
import MenuLateral from '../componentes/menu-lateral';
import ControlesTrazado from '../componentes/ControlesTrazado';
import MenuEdificio from '../componentes/MenuEdificio';
import MenuTerritorio from '../componentes/MenuTerritorio'; // <-- IMPORTACIÓN NUEVA
import useMapa from '../hooks/useMapa';

export default function VistaDashboard() {
  const [modoOscuro, setModoOscuro] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  
  const [nombreCongregacionUI, setNombreCongregacionUI] = useState('Cargando...');
  const [nombreNuevoSetup, setNombreNuevoSetup] = useState('');
  
  // ESTADO NUEVO PARA VENTANA DE TERRITORIO
  const [territorioSeleccionado, setTerritorioSeleccionado] = useState(null);

  const {
    secciones, edificios, cargando,
    textoBusqueda, setTextoBusqueda, resultadosCiudades, buscarCiudadEnServidor, seleccionarCiudad,
    coordenadasActuales, zoomActual,setZoomActual,
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
    eliminarCongregacionMasterBD
  } = useMapa();

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
      
      {/* MODAL DE BIENVENIDA PARA NUEVAS CONGREGACIONES */}
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
        alCompletarTerritorio={completarTerritorioEntero} 
        alVolarATerritorio={volarATerritorio} 
        textoBusqueda={textoBusqueda} alCambiarTextoBusqueda={setTextoBusqueda} alBuscar={buscarCiudadEnServidor}
        resultadosCiudades={resultadosCiudades} alSeleccionarCiudad={seleccionarCiudad}
        nombreTerritorio={nombreNuevoTerritorio} alCambiarNombre={setNombreNuevoTerritorio}
        colorTerritorio={colorNuevoTerritorio} alCambiarColor={setColorNuevoTerritorio}
        notasTerritorio={notasNuevoTerritorio} alCambiarNotas={setNotasNuevoTerritorio}
        alEmpezarATrazar={() => { setEnModoTrazado(true); setEnModoEdificios(false); }}
        alActivarModoEdificios={() => { setEnModoEdificios(true); setEnModoTrazado(false); }}
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
        reiniciarTerritorioEnBD={reiniciarTerritorioEnBD}
        actualizarNotasSeccionEnBD={actualizarNotasSeccionEnBD}
        alEliminarCongregacion={eliminarCongregacionMasterBD}
      />

      <MenuEdificio 
        edificio={edificioSeleccionado}
        perfilUsuario={perfilUsuario}
        alCerrar={() => setEdificioSeleccionado(null)}
        alCambiarEstado={cambiarEstadoEdificioTemp}
        alCambiarDireccion={(nuevaDir) => setEdificioSeleccionado(prev => ({ ...prev, direccion: nuevaDir }))}
        notasTemp={notasEdificioTemp}
        alCambiarNotasTemp={setNotasEdificioTemp}
        alGuardar={guardarEdificioEnBD}
        alEliminar={eliminarEdificioEnBD}
      />

      {/* NUEVA VENTANA: DETALLES DEL TERRITORIO */}
      <MenuTerritorio 
        territorio={territorioSeleccionado}
        edificios={edificios}
        perfilUsuario={perfilUsuario}
        alCerrar={() => setTerritorioSeleccionado(null)}
        alCompletar={completarTerritorioEntero}
        alReiniciar={reiniciarTerritorioEnBD}
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

      <main className="w-full h-full pt-14 relative z-10">
        <VisorMapa 
          centroInicial={[25.6565, -100.2930]} zoomInicial={15}
          centroActual={coordenadasActuales} 
          zoomActual={zoomActual} 
          setZoomActual={setZoomActual} // <-- NUEVA LÍNEA CLAVE
          secciones={secciones} edificios={edificios}
          alSeleccionarEdificio={setEdificioSeleccionado}
          enModoTrazado={enModoTrazado} enModoEdificios={enModoEdificios}
          puntosTrazadoActual={puntosTrazadoActual} colorTrazadoActual={colorNuevoTerritorio}
          alRegistrarPuntoTrazado={manejarClickMapa} 
          mostrarCalles={mostrarCalles} mostrarLugares={mostrarLugares}
          alSeleccionarTerritorio={setTerritorioSeleccionado}
        />

        {!mostrarModalBienvenida && (
          <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-lg text-[10px] font-semibold text-slate-700 dark:text-slate-300 pointer-events-none border border-slate-200 dark:border-slate-800">
            {enModoTrazado ? (
              <span className="text-rose-500 animate-pulse font-bold">✏️ Dibujando territorio...</span>
            ) : enModoEdificios ? (
              <span className="text-emerald-500 animate-pulse font-bold">🏠 Toca los techos en el mapa</span>
            ) : (
              <>Rol: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{perfilUsuario?.rol || 'Cargando...'}</span></>
            )}
          </div>
        )}
      </main>
    </div>
  );
}