// src/vistas/VistaDashboard.jsx
import React, { useState, useEffect } from 'react';
import CabeceraCongregacion from '../componentes/CabeceraCongregacion';
import VisorMapa from '../componentes/VisorMapa';
import MenuLateral from '../componentes/MenuLateral';
import ControlesTrazado from '../componentes/ControlesTrazado';
import MenuEdificio from '../componentes/MenuEdificio';
import useMapa from '../hooks/useMapa';

export default function VistaDashboard() {
  const [modoOscuro, setModoOscuro] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [rolUsuario] = useState('Administrador'); 
  
  // NUEVO ESTADO: Nombre de la congregación editable
  const [nombreCongregacion, setNombreCongregacion] = useState('Congregación Central');

  const {
    secciones, edificios,
    textoBusqueda, setTextoBusqueda, resultadosCiudades, buscarCiudadEnServidor, seleccionarCiudad,
    coordenadasActuales, zoomActual,
    enModoTrazado, setEnModoTrazado,
    enModoEdificios, setEnModoEdificios,
    nombreNuevoTerritorio, setNombreNuevoTerritorio, colorNuevoTerritorio, setColorNuevoTerritorio, notasNuevoTerritorio, setNotasNuevoTerritorio,
    puntosTrazadoActual, manejarClickMapa, deshacerUltimoPunto, limpiarTrazadoCompleto, cancelarTrazadoYSalir,
    guardarNuevaSeccionEnBD, eliminarSeccionEnBD,
    edificioSeleccionado, setEdificioSeleccionado, notasEdificioTemp, setNotasEdificioTemp, cambiarEstadoEdificioTemp, guardarEdificioEnBD, eliminarEdificioEnBD, volarATerritorio,
    completarTerritorioEntero,
    mostrarCalles, setMostrarCalles, mostrarLugares, setMostrarLugares // <-- Inyectamos los estados de las capas
  } = useMapa();

  useEffect(() => {
    if (modoOscuro) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [modoOscuro]);

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-200">
      
      {/* Cabecera ahora recibe la variable dinámica */}
      <CabeceraCongregacion 
        nombreCongregacion={nombreCongregacion} 
        modoOscuro={modoOscuro}
        alCambiarModo={() => setModoOscuro(!modoOscuro)} alAbrirMenu={() => setMenuAbierto(true)}
      />

      <MenuLateral 
        abierto={menuAbierto} alCerrar={() => setMenuAbierto(false)}
        // Props para editar el nombre desde el menú
        nombreCongregacion={nombreCongregacion} 
        alCambiarNombreCongregacion={setNombreCongregacion} 
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
        // Props para los interruptores del mapa
        mostrarCalles={mostrarCalles} alCambiarMostrarCalles={setMostrarCalles}
        mostrarLugares={mostrarLugares} alCambiarMostrarLugares={setMostrarLugares}
      />

      <MenuEdificio 
        edificio={edificioSeleccionado}
        alCerrar={() => setEdificioSeleccionado(null)}
        alCambiarEstado={cambiarEstadoEdificioTemp}
        notasTemp={notasEdificioTemp}
        alCambiarNotasTemp={setNotasEdificioTemp}
        alGuardar={guardarEdificioEnBD}
        alEliminar={eliminarEdificioEnBD}
      />

      {enModoTrazado && (
        <ControlesTrazado 
          puntosContados={puntosTrazadoActual.length} alDeshacer={deshacerUltimoPunto} alLimpiar={limpiarTrazadoCompleto}
          alCancelar={cancelarTrazadoYSalir} alGuardar={guardarNuevaSeccionEnBD}
        />
      )}

      {enModoEdificios && !edificioSeleccionado && (
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
          centroActual={coordenadasActuales} zoomActual={zoomActual}
          secciones={secciones} edificios={edificios}
          alSeleccionarEdificio={setEdificioSeleccionado}
          enModoTrazado={enModoTrazado} enModoEdificios={enModoEdificios}
          puntosTrazadoActual={puntosTrazadoActual} colorTrazadoActual={colorNuevoTerritorio}
          alRegistrarPuntoTrazado={manejarClickMapa} 
          mostrarCalles={mostrarCalles} mostrarLugares={mostrarLugares} // <-- Pasamos los estados al mapa
        />

        <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-lg text-[10px] font-semibold text-slate-700 dark:text-slate-300 pointer-events-none border border-slate-200 dark:border-slate-800">
          {enModoTrazado ? (
            <span className="text-rose-500 animate-pulse font-bold">✏️ Dibujando territorio...</span>
          ) : enModoEdificios ? (
            <span className="text-emerald-500 animate-pulse font-bold">🏠 Toca los techos en el mapa</span>
          ) : (
            <>Rol: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{rolUsuario}</span></>
          )}
        </div>
      </main>
    </div>
  );
}