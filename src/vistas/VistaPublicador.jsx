// src/vistas/VistaPublicador.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utilidades/clienteSupabase';
import VisorMapa from '../componentes/VisorMapa';
import MenuLateralPublicador from '../componentes/menu-lateral/MenuLateralPublicador';
import CabeceraCongregacion from '../componentes/CabeceraCongregacion';
import { Home, Map as MapIcon, X, BookmarkPlus } from 'lucide-react';
import useMarcadoresPersonales from '../hooks/modulos/useMarcadoresPersonales';

import { ModalInfoTachuela } from '../componentes/ModalTachuela';
import { ModalFormularioRevisita, ModalInfoLecturaRevisita } from '../componentes/ModalesRevisita';

import useBotonAtrasCelular from '../hooks/useBotonAtrasCelular';
import { useAlertas } from '../context/ContextoAlertas';

export default function VistaPublicador() {
  const [cargando, setCargando] = useState(true);
  const [modoOscuro, setModoOscuro] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  
  const [congregacion, setCongregacion] = useState(null);
  const [secciones, setSecciones] = useState([]);
  const [edificios, setEdificios] = useState([]);
  
  const [tachuelasGrupales, setTachuelasGrupales] = useState([]);
  const [tachuelaLeida, setTachuelaLeida] = useState(null);
  
  const [coordenadasActuales, setCoordenadasActuales] = useState([25.6565, -100.2930]);
  const [zoomActual, setZoomActual] = useState(15);
  
  const [mostrarCalles, setMostrarCalles] = useState(true);
  const [mostrarLugares, setMostrarLugares] = useState(true);
  const [estiloMapa, setEstiloMapa] = useState('satelite_puro');

  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [resultadosCiudades, setResultadosCiudades] = useState([]);

  const [territorioLeido, setTerritorioLeido] = useState(null);
  const [casaLeida, setCasaLeida] = useState(null);

  const gestorRevisitas = useMarcadoresPersonales();
  const [enModoRevisita, setEnModoRevisita] = useState(false);
  const [marcadorTemporal, setMarcadorTemporal] = useState(null); 
  const [revisitaEditando, setRevisitaEditando] = useState(null); 
  const [revisitaLectura, setRevisitaLectura] = useState(null);

  const { mostrarConfirmacion } = useAlertas();

  const manejarBotonAtras = useCallback(async (hayModalesAbiertos = false) => {
    if (hayModalesAbiertos === true) {
      setMenuAbierto(false);
      return false; 
    }

    if (territorioLeido || casaLeida || tachuelaLeida || revisitaLectura || revisitaEditando) {
      setTerritorioLeido(null);
      setCasaLeida(null);
      setTachuelaLeida(null);
      setRevisitaLectura(null);
      setRevisitaEditando(null);
      return false; 
    }

    if (menuAbierto) {
      setMenuAbierto(false);
      return false; 
    }

    if (enModoRevisita || marcadorTemporal) {
      const confirmar = await mostrarConfirmacion(
        "Cancelar acción",
        "¿Deseas cancelar lo que estás haciendo y volver al mapa principal?",
        "warning",
        "Sí, salir"
      );
      
      if (confirmar) {
        setEnModoRevisita(false);
        setMarcadorTemporal(null);
      }
      return false; 
    }

    const confirmarSalir = await mostrarConfirmacion(
      "Salir de PredicaMap",
      "¿Estás seguro que deseas salir de la aplicación?",
      "danger",
      "Salir de la app"
    );
    
    return confirmarSalir;
    
  }, [
    menuAbierto, territorioLeido, casaLeida, tachuelaLeida, revisitaLectura, revisitaEditando,
    enModoRevisita, marcadorTemporal, mostrarConfirmacion
  ]);

  useBotonAtrasCelular(manejarBotonAtras);

  const manejarCambioEstiloMapa = (nuevoEstilo) => {
    setEstiloMapa(nuevoEstilo);
    if (nuevoEstilo === 'satelite_hibrido' || nuevoEstilo === 'gris' || nuevoEstilo === 'calles') {
      setMostrarCalles(false);
      setMostrarLugares(false);
    }
  };

  useEffect(() => {
    if (modoOscuro) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [modoOscuro]);

  useEffect(() => {
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
      const dynamicManifest = {
        name: 'PredicaMap',
        short_name: 'PredicaMap',
        description: 'Gestor de territorios para la predicación',
        theme_color: '#0f172a',
        background_color: '#f8fafc',
        display: 'standalone',
        start_url: window.location.pathname, 
        icons: [
          {
            src: '/Logo-PredicaMap.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      };
      const blob = new Blob([JSON.stringify(dynamicManifest)], { type: 'application/manifest+json' });
      manifestLink.href = URL.createObjectURL(blob);
    }
  }, []);

  const recargarDatosMapa = useCallback(async (congId, centrarMapa = false) => {
    const secLocales = localStorage.getItem(`pm_pub_secciones_${congId}`);
    const tachLocales = localStorage.getItem(`pm_pub_tachuelas_${congId}`);
    const ediLocales = localStorage.getItem(`pm_pub_edificios_${congId}`);

    if (secLocales) {
      const formateadas = JSON.parse(secLocales);
      setSecciones(formateadas);
      if (centrarMapa && formateadas.length > 0) {
        let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
        formateadas.forEach(s => s.coordenadas.forEach(([lat, lng]) => {
          if (lat < minLat) minLat = lat; if (lat > maxLat) maxLat = lat;
          if (lng < minLng) minLng = lng; if (lng > maxLng) maxLng = lng;
        }));
        setCoordenadasActuales([(minLat + maxLat) / 2, (minLng + maxLng) / 2]);
      }
    }

    if (tachLocales) setTachuelasGrupales(JSON.parse(tachLocales));
    if (ediLocales) setEdificios(JSON.parse(ediLocales));

    if (!navigator.onLine) return;

    try {
      const { data: secs } = await supabase.from('secciones')
        .select('*')
        .eq('congregacion_id', congId)
        .order('orden', { ascending: true })
        .order('creado_en', { ascending: true });

      const formateadas = (secs || []).map(item => ({
        id: item.id, nombre: item.nombre, colorHex: item.color_hex, 
        coordenadas: item.coordenadas, notas: item.notas, estado: item.estado,
        orden: item.orden 
      }));
      setSecciones(formateadas);
      localStorage.setItem(`pm_pub_secciones_${congId}`, JSON.stringify(formateadas));

      const { data: tachs } = await supabase.from('tachuelas').select('*').eq('congregacion_id', congId);
      setTachuelasGrupales(tachs || []);
      localStorage.setItem(`pm_pub_tachuelas_${congId}`, JSON.stringify(tachs || []));

      if (formateadas.length > 0) {
        if (centrarMapa && !secLocales) {
          let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
          formateadas.forEach(s => s.coordenadas.forEach(([lat, lng]) => {
            if (lat < minLat) minLat = lat; if (lat > maxLat) maxLat = lat;
            if (lng < minLng) minLng = lng; if (lng > maxLng) maxLng = lng;
          }));
          setCoordenadasActuales([(minLat + maxLat) / 2, (minLng + maxLng) / 2]);
        }

        const secIds = formateadas.map(s => s.id);
        const { data: edis } = await supabase.from('edificios').select('*').in('seccion_id', secIds);
        setEdificios(edis || []);
        localStorage.setItem(`pm_pub_edificios_${congId}`, JSON.stringify(edis || []));
      }
    } catch (err) {
      console.error("Error recargando datos del mapa:", err.message);
    }
  }, []);

  useEffect(() => {
    const inicializarPublicador = async () => {
      try {
        const ruta = window.location.pathname; 
        const payloadCifrado = ruta.split('/v/')[1];
        if (!payloadCifrado) throw new Error("El enlace del territorio no existe o está incompleto.");

        let enlaceCorto = '';
        try {
          const datosDecodificados = JSON.parse(decodeURIComponent(atob(payloadCifrado)));
          enlaceCorto = datosDecodificados.v;
        } catch (e) {
          enlaceCorto = payloadCifrado;
        }

        const congLocal = localStorage.getItem(`pm_pub_cong_${enlaceCorto}`);
        if (congLocal) {
          const congParseada = JSON.parse(congLocal);
          setCongregacion(congParseada);
          await recargarDatosMapa(congParseada.id, true);
        }

        if (!navigator.onLine) {
          if (!congLocal) throw new Error("No hay conexión a internet y no hay datos guardados para este enlace.");
          setCargando(false);
          return;
        }

        const { data: cong, error: errCong } = await supabase.from('congregaciones').select('*').eq('enlace_corto', enlaceCorto).single();
        if (errCong || !cong) throw new Error("La congregación no existe o el enlace expiró.");
        
        setCongregacion(cong);
        localStorage.setItem(`pm_pub_cong_${enlaceCorto}`, JSON.stringify(cong));
        localStorage.setItem('pm_ruta_inicio_pwa', window.location.pathname);

        await recargarDatosMapa(cong.id, !congLocal); 

      } catch (err) { 
        // ★ LA SOLUCIÓN PERFECTA: 
        // Borramos rastro y los mandamos a nuestra nueva vista de error explícita
        localStorage.removeItem('pm_ruta_inicio_pwa');
        window.location.replace('/error?msg=' + encodeURIComponent(err.message));
      } finally { 
        setCargando(false); 
      }
    };
    
    inicializarPublicador();
  }, [recargarDatosMapa]);

  useEffect(() => {
    if (!congregacion?.id) return;

    const intervaloPolling = setInterval(() => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        recargarDatosMapa(congregacion.id, false);
      }
    }, 45000);

    const manejarVisibilidad = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        recargarDatosMapa(congregacion.id, false);
      }
    };
    
    document.addEventListener('visibilitychange', manejarVisibilidad);
    window.addEventListener('online', () => recargarDatosMapa(congregacion.id, false));

    return () => {
      clearInterval(intervaloPolling);
      document.removeEventListener('visibilitychange', manejarVisibilidad);
      window.removeEventListener('online', () => recargarDatosMapa(congregacion.id, false));
    };
  }, [congregacion, recargarDatosMapa]);

  const buscarCiudadEnServidor = async (e) => {
    e.preventDefault();
    if (!textoBusqueda.trim()) return;
    try {
      const respuesta = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(textoBusqueda)}&limit=5`);
      setResultadosCiudades(await respuesta.json());
    } catch (error) { console.error("Error al buscar ciudad", error); }
  };

  const seleccionarCiudad = (ciudad) => {
    setCoordenadasActuales([parseFloat(ciudad.lat), parseFloat(ciudad.lon)]);
    setZoomActual(15); setResultadosCiudades([]); setTextoBusqueda('');
  };

  const volarATerritorio = (coordenadasPoligono) => {
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    coordenadasPoligono.forEach(([lat, lng]) => {
      if (lat < minLat) minLat = lat; if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng; if (lng > maxLng) maxLng = lng;
    });
    setCoordenadasActuales([(minLat + maxLat) / 2, (minLng + maxLng) / 2]); 
    setZoomActual(18); 
  };

  const volarARevisita = (marcador) => {
    setCoordenadasActuales([marcador.lat, marcador.lng]); 
    setZoomActual(19);
  };

  // ★ Ya no necesitamos un if(error) porque fueron redireccionados a la nueva Vista.
  if (cargando) return <div className="w-screen h-[100dvh] flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-indigo-500 font-bold">Cargando Territorios...</div>;

  return (
    <div className="w-screen h-[100dvh] overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col relative transition-colors duration-200">
      
      <CabeceraCongregacion 
        nombreCongregacion={congregacion.nombre} 
        alAbrirMenu={() => setMenuAbierto(true)} 
        perfilUsuario={{ rol: 'Publicador' }} 
      />

      <MenuLateralPublicador 
        abierto={menuAbierto} alCerrar={() => setMenuAbierto(false)} nombreCongregacion={congregacion.nombre}
        perfilUsuario={{ rol: 'Publicador' }}
        secciones={secciones} edificios={edificios} alVolarATerritorio={volarATerritorio}
        mostrarCalles={mostrarCalles} alCambiarMostrarCalles={setMostrarCalles}
        mostrarLugares={mostrarLugares} alCambiarMostrarLugares={setMostrarLugares}
        estiloMapa={estiloMapa} alCambiarEstiloMapa={manejarCambioEstiloMapa}
        textoBusqueda={textoBusqueda} alCambiarTextoBusqueda={setTextoBusqueda} alBuscar={buscarCiudadEnServidor}
        resultadosCiudades={resultadosCiudades} alSeleccionarCiudad={seleccionarCiudad}
        marcadoresPersonales={gestorRevisitas.marcadores}
        alVolarARevisita={volarARevisita}
        alEliminarRevisita={gestorRevisitas.eliminarMarcador}
        alCompartirRevisita={gestorRevisitas.compartirMarcador}
        alExportarBackup={gestorRevisitas.exportarBackup}
        alImportarBackup={gestorRevisitas.importarBackup}
        alEditarRevisita={(m) => setRevisitaEditando(m)}
        modoOscuro={modoOscuro} alCambiarModo={() => setModoOscuro(!modoOscuro)}
      />

      <main className="flex-1 w-full relative z-10">
        
        {enModoRevisita && !marcadorTemporal && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[2000] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-5 py-2.5 rounded-full shadow-2xl border-2 border-purple-500 text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3 animate-slide-up">
            <span className="flex items-center gap-1.5"><BookmarkPlus size={14} className="text-purple-500 animate-pulse"/> Toca para ubicar</span>
            <button onClick={() => setEnModoRevisita(false)} className="bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-md text-[10px] hover:bg-rose-200 transition-colors">Cancelar</button>
          </div>
        )}

        {!enModoRevisita && !marcadorTemporal && (
          <div className="absolute bottom-[14px] right-14 z-[2000] flex items-center gap-2 animate-slide-up">
            <button 
              onClick={() => setEnModoRevisita(true)} 
              className="bg-purple-600 text-white w-12 h-12 rounded-2xl shadow-xl shadow-purple-600/30 flex flex-col items-center justify-center hover:bg-purple-500 hover:scale-105 active:scale-95 transition-all border border-purple-500"
            >
              <BookmarkPlus size={18} className="mb-0.5" />
              <span className="text-[7px] font-black uppercase tracking-wider">Revisita</span>
            </button>
            <div className="w-12 h-12 pointer-events-none"></div>
          </div>
        )}

        {enModoRevisita && (
          <div className="absolute bottom-8 left-4 z-[1000] bg-white/90 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-lg text-[10px] font-semibold text-slate-700 dark:text-slate-300 pointer-events-none border border-slate-200 dark:border-slate-800 animate-slide-up">
            <span className="text-purple-500 animate-pulse font-bold">📍 Modo Revisita</span>
          </div>
        )}

        <VisorMapa 
          centroInicial={[25.6565, -100.2930]} zoomInicial={15}
          centroActual={coordenadasActuales} zoomActual={zoomActual} setZoomActual={setZoomActual}
          secciones={secciones} edificios={edificios}
          alSeleccionarEdificio={setCasaLeida}
          alSeleccionarTerritorio={setTerritorioLeido}
          enModoTrazado={false} enModoEdificios={false} puntosTrazadoActual={[]} colorTrazadoActual="#000" 
          alRegistrarPuntoTrazado={(coords) => {
            if (enModoRevisita) setMarcadorTemporal({ lat: coords[0], lng: coords[1] });
          }}
          mostrarCalles={mostrarCalles} mostrarLugares={mostrarLugares}
          estiloMapa={estiloMapa}
          enModoRevisita={enModoRevisita}
          marcadoresPersonales={gestorRevisitas.marcadores}
          alSeleccionarRevisita={setRevisitaLectura}
          marcadorTemporal={marcadorTemporal}
          tachuelasGrupales={tachuelasGrupales}
          alSeleccionarTachuela={setTachuelaLeida}
          enModoTachuela={false}
        />
      </main>

      {territorioLeido && <ModalInfoLectura icono={<MapIcon size={24} className="text-indigo-500" />} titulo={territorioLeido.nombre} notas={territorioLeido.notas} alCerrar={() => setTerritorioLeido(null)} />}
      {casaLeida && <ModalInfoLectura icono={<Home size={24} className="text-emerald-500" />} titulo={casaLeida.direccion} estado={casaLeida.estado} notas={casaLeida.notas} alCerrar={() => setCasaLeida(null)} />}

      {revisitaLectura && (
        <ModalInfoLecturaRevisita 
          revisita={revisitaLectura} 
          alGuardar={(id, datos) => {
            gestorRevisitas.editarMarcador(id, datos);
            setRevisitaLectura({ ...revisitaLectura, ...datos }); 
          }} 
          alCerrar={() => setRevisitaLectura(null)} 
        />
      )}

      {tachuelaLeida && (
        <ModalInfoTachuela 
          tachuela={tachuelaLeida}
          puedeEliminar={false}
          alCerrar={() => setTachuelaLeida(null)}
        />
      )}

      {(marcadorTemporal || revisitaEditando) && (
        <ModalFormularioRevisita
          marcadorEditando={revisitaEditando}
          alGuardar={(datos) => {
            if (revisitaEditando) {
              gestorRevisitas.editarMarcador(revisitaEditando.id, datos);
              setRevisitaEditando(null);
            } else {
              gestorRevisitas.agregarMarcador(marcadorTemporal.lat, marcadorTemporal.lng, datos.titulo, datos.fechaProgramada, datos.notas);
              setMarcadorTemporal(null);
              setEnModoRevisita(false);
            }
          }}
          alCancelar={() => { setMarcadorTemporal(null); setRevisitaEditando(null); setEnModoRevisita(false); }}
        />
      )}
    </div>
  );
}

function ModalInfoLectura({ icono, titulo, estado, estadoColor, notas, alCerrar }) {
  let color = estadoColor || 'text-slate-500';
  let textoEstado = estado || '';
  
  if (!estadoColor) {
    if (estado === 'pendiente') { color = 'text-orange-500'; textoEstado = 'Faltante / Pendiente'; }
    if (estado === 'completado') { color = 'text-emerald-500'; textoEstado = 'Completado'; }
    if (estado === 'no_responde') { color = 'text-rose-500'; textoEstado = 'Alerta / No Visitar'; }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[4000] transition-opacity" onClick={alCerrar} />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl z-[4001] animate-slide-up overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-black text-xl text-slate-800 dark:text-slate-100 flex items-center gap-2">
              {icono} {titulo}
            </h3>
            <button onClick={alCerrar} className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500 transition-colors">
              <X size={18} />
            </button>
          </div>
          
          {textoEstado && (
            <div className="mb-4">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Estado de Visita</label>
              <div className={`font-black text-sm uppercase ${color}`}>{textoEstado}</div>
            </div>
          )}

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