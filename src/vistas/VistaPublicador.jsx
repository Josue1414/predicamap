// src/vistas/VistaPublicador.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../utilidades/clienteSupabase';
import VisorMapa from '../componentes/VisorMapa';
import MenuLateralPublicador from '../componentes/menu-lateral/MenuLateralPublicador';
import { Menu, MapPin, Moon, Sun, Home, Map as MapIcon, X } from 'lucide-react';

export default function VistaPublicador() {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [modoOscuro, setModoOscuro] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  
  // Datos de la base de datos
  const [congregacion, setCongregacion] = useState(null);
  const [secciones, setSecciones] = useState([]);
  const [edificios, setEdificios] = useState([]);
  
  // Estado del Mapa
  const [coordenadasActuales, setCoordenadasActuales] = useState([25.6565, -100.2930]);
  const [zoomActual, setZoomActual] = useState(15);
  const [mostrarCalles, setMostrarCalles] = useState(true);
  const [mostrarLugares, setMostrarLugares] = useState(true);

  // Estado del Buscador
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [resultadosCiudades, setResultadosCiudades] = useState([]);

  // Modales de Lectura
  const [territorioLeido, setTerritorioLeido] = useState(null);
  const [casaLeida, setCasaLeida] = useState(null);

  useEffect(() => {
    if (modoOscuro) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [modoOscuro]);

  // Carga inicial anónima mediante el enlace encriptado
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const ruta = window.location.pathname; 
        const payloadCifrado = ruta.split('/v/')[1];
        if (!payloadCifrado) throw new Error("Enlace de congregación inválido.");

        // ★ DESENCRIPTACIÓN ESTÁNDAR DEL PROYECTO ★
        let enlaceCorto = '';
        try {
          const datosDecodificados = JSON.parse(decodeURIComponent(atob(payloadCifrado)));
          enlaceCorto = datosDecodificados.v;
        } catch (e) {
          // Fallback de seguridad por si es un link viejo sin encriptar
          enlaceCorto = payloadCifrado;
        }

        // 1. Obtener Congregación
        const { data: cong, error: errCong } = await supabase.from('congregaciones').select('*').eq('enlace_corto', enlaceCorto).single();
        if (errCong || !cong) throw new Error("La congregación no existe o el enlace expiró.");
        setCongregacion(cong);

        // 2. Obtener Territorios
        const { data: secs } = await supabase.from('secciones').select('*').eq('congregacion_id', cong.id);
        const formateadas = (secs || []).map(item => ({
          id: item.id, nombre: item.nombre, colorHex: item.color_hex, coordenadas: item.coordenadas, notas: item.notas, estado: item.estado
        }));
        setSecciones(formateadas);

        // 3. Obtener Casas y Centrar Mapa
        if (formateadas.length > 0) {
          let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
          formateadas.forEach(s => s.coordenadas.forEach(([lat, lng]) => {
            if (lat < minLat) minLat = lat; if (lat > maxLat) maxLat = lat;
            if (lng < minLng) minLng = lng; if (lng > maxLng) maxLng = lng;
          }));
          setCoordenadasActuales([(minLat + maxLat) / 2, (minLng + maxLng) / 2]);

          const secIds = formateadas.map(s => s.id);
          const { data: edis } = await supabase.from('edificios').select('*').in('seccion_id', secIds);
          setEdificios(edis || []);
        }
      } catch (err) { setError(err.message); } 
      finally { setCargando(false); }
    };
    cargarDatos();
  }, []);

  // Lógica del buscador anónimo
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

  if (cargando) return <div className="w-screen h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-indigo-500 font-bold">Cargando Territorios...</div>;
  if (error) return <div className="w-screen h-screen flex items-center justify-center bg-slate-900 text-rose-500 font-bold p-6 text-center">Error: {error}</div>;

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col">
      
      {/* CABECERA PÚBLICA */}
      <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-3 sm:px-4 z-[2000] relative shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => setMenuAbierto(true)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-500 transition-colors">
            <Menu size={20} />
          </button>
          <div className="flex flex-col">
            <h1 className="font-black text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-none">{congregacion.nombre}</h1>
            <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mt-0.5">Publicador</p>
          </div>
        </div>
        <button onClick={() => setModoOscuro(!modoOscuro)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-500 transition-colors">
          {modoOscuro ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      <MenuLateralPublicador 
        abierto={menuAbierto} alCerrar={() => setMenuAbierto(false)} nombreCongregacion={congregacion.nombre}
        secciones={secciones} edificios={edificios} alVolarATerritorio={volarATerritorio}
        mostrarCalles={mostrarCalles} alCambiarMostrarCalles={setMostrarCalles}
        mostrarLugares={mostrarLugares} alCambiarMostrarLugares={setMostrarLugares}
        textoBusqueda={textoBusqueda} alCambiarTextoBusqueda={setTextoBusqueda} alBuscar={buscarCiudadEnServidor}
        resultadosCiudades={resultadosCiudades} alSeleccionarCiudad={seleccionarCiudad}
      />

      <main className="flex-1 relative z-10">
        <VisorMapa 
          centroInicial={[25.6565, -100.2930]} zoomInicial={15}
          centroActual={coordenadasActuales} zoomActual={zoomActual} setZoomActual={setZoomActual}
          secciones={secciones} edificios={edificios}
          alSeleccionarEdificio={setCasaLeida}
          alSeleccionarTerritorio={setTerritorioLeido}
          enModoTrazado={false} enModoEdificios={false} puntosTrazadoActual={[]} colorTrazadoActual="#000" alRegistrarPuntoTrazado={() => {}}
          mostrarCalles={mostrarCalles} mostrarLugares={mostrarLugares}
        />
      </main>

      {/* MODAL LECTURA TERRITORIO */}
      {territorioLeido && (
        <ModalInfoLectura 
          icono={<MapIcon size={24} className="text-indigo-500" />} titulo={territorioLeido.nombre} 
          notas={territorioLeido.notas} alCerrar={() => setTerritorioLeido(null)} 
        />
      )}

      {/* MODAL LECTURA CASA */}
      {casaLeida && (
        <ModalInfoLectura 
          icono={<Home size={24} className="text-emerald-500" />} titulo={casaLeida.direccion} 
          estado={casaLeida.estado} notas={casaLeida.notas} alCerrar={() => setCasaLeida(null)} 
        />
      )}
    </div>
  );
}

// Mini-Componente interno para mostrar la información en lectura
function ModalInfoLectura({ icono, titulo, estado, notas, alCerrar }) {
  let colorEstado = 'text-slate-500';
  let textoEstado = '';
  if (estado === 'pendiente') { colorEstado = 'text-orange-500'; textoEstado = 'Faltante / Pendiente'; }
  if (estado === 'completado') { colorEstado = 'text-emerald-500'; textoEstado = 'Completado'; }
  if (estado === 'no_responde') { colorEstado = 'text-rose-500'; textoEstado = 'Alerta / No Visitar'; }

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
          
          {estado && (
            <div className="mb-4">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Estado de Visita</label>
              <div className={`font-black text-sm uppercase ${colorEstado}`}>{textoEstado}</div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Notas u Observaciones</label>
            <div className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm text-slate-700 dark:text-slate-200 min-h-[80px]">
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