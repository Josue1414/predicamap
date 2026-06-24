// src/componentes/menu-lateral/MenuLateralPublicador.jsx
import React, { useState } from 'react';
import { X, Search, Map, MapPin, Layers, Navigation, ChevronDown, ChevronUp } from 'lucide-react';

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
  textoBusqueda,
  alCambiarTextoBusqueda,
  alBuscar,
  resultadosCiudades,
  alSeleccionarCiudad
}) {
  const [acordeonActivo, setAcordeonActivo] = useState('territorios');
  const [territorioExpandido, setTerritorioExpandido] = useState(null);

  const alternarAcordeon = (seccion) => setAcordeonActivo(acordeonActivo === seccion ? null : seccion);

  return (
    <>
      {abierto && <div className="fixed inset-0 bg-black/50 z-[3000] transition-opacity" onClick={alCerrar} />}

      <div className={`fixed top-0 left-0 h-full w-80 sm:w-96 bg-slate-50 dark:bg-slate-900 shadow-2xl z-[3001] transform transition-transform duration-300 flex flex-col ${abierto ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* CABECERA */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-950">
          <div>
            <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <MapPin size={18} className="text-indigo-500" /> {nombreCongregacion}
            </h2>
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 font-extrabold px-2 py-0.5 rounded-full mt-1.5 inline-block tracking-wider uppercase">
              (Publicador)
            </span>
          </div>
          <button onClick={alCerrar} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scroll-limpio p-3 space-y-4">

          {/* 1. BUSCADOR DIRECTO */}
          <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <button onClick={() => alternarAcordeon('buscador')} className="w-full p-3 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <span className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <Search size={16} className="text-indigo-500"/> Buscar en el Mapa
              </span>
              {acordeonActivo === 'buscador' ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </button>
            {acordeonActivo === 'buscador' && (
              <div className="p-3">
                <form onSubmit={alBuscar} className="flex gap-2">
                  <input type="text" value={textoBusqueda} onChange={(e) => alCambiarTextoBusqueda(e.target.value)} placeholder="Ej: Zapopan, Jalisco..." className="w-full border rounded-lg p-2 text-xs dark:bg-slate-900 dark:border-slate-700 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none" />
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 rounded-lg text-xs font-bold transition-colors">Ir</button>
                </form>
                {resultadosCiudades.length > 0 && (
                  <ul className="mt-2 border rounded-lg max-h-40 overflow-y-auto text-[11px] dark:border-slate-700 scroll-limpio">
                    {resultadosCiudades.map((c, i) => (
                      <li key={i} onClick={() => { alSeleccionarCiudad(c); alCerrar(); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer border-b last:border-0 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                        {c.display_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* 2. TERRITORIOS (SOLO LECTURA) */}
          <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <button onClick={() => alternarAcordeon('territorios')} className="w-full p-3 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <span className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <Map size={16} className="text-emerald-500"/> Territorios ({secciones.length})
              </span>
              {acordeonActivo === 'territorios' ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </button>
            {acordeonActivo === 'territorios' && (
              <div className="p-3 bg-white dark:bg-slate-950 max-h-80 overflow-y-auto space-y-2 scroll-limpio">
                {secciones.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-2">No hay territorios creados.</p>
                ) : (
                  secciones.map(sec => {
                    const casasDeEstaSeccion = edificios.filter(e => e.seccion_id === sec.id);
                    const totalCasas = casasDeEstaSeccion.length;
                    const completadas = casasDeEstaSeccion.filter(e => e.estado === 'completado').length;
                    let porcentaje = totalCasas > 0 ? Math.round((completadas / totalCasas) * 100) : (sec.estado === 'completado' ? 100 : 0);

                    return (
                      <div key={sec.id} className="border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm">
                        <div onClick={() => setTerritorioExpandido(territorioExpandido === sec.id ? null : sec.id)} className="p-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                          <div className="flex items-center gap-2 w-full pr-3">
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: sec.colorHex }} />
                            <div className="flex flex-col flex-1">
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-none mb-1.5">{sec.nombre}</span>
                              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1 overflow-hidden">
                                <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${porcentaje}%` }}></div>
                              </div>
                            </div>
                          </div>
                          <ChevronDown size={14} className={`text-slate-400 transition-transform ${territorioExpandido === sec.id ? 'rotate-180' : ''}`} />
                        </div>
                        
                        {territorioExpandido === sec.id && (
                          <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                            <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 italic">"{sec.notas || 'Sin observaciones'}"</p>
                            <div className="flex justify-between text-[10px] text-slate-500 font-bold mb-3">
                              <span>{totalCasas > 0 ? `${completadas} de ${totalCasas} completadas` : 'Sin puntos marcados'}</span>
                              <span className={porcentaje === 100 ? 'text-emerald-500' : ''}>{porcentaje}% Listo</span>
                            </div>
                            <button onClick={() => { alVolarATerritorio(sec.coordenadas); alCerrar(); }} className="w-full flex justify-center items-center gap-1.5 py-2.5 bg-indigo-600 text-white rounded-lg font-bold text-xs hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-500/20">
                              <Navigation size={14} /> Volar al Territorio
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* 3. CAPAS DEL MAPA */}
          <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <button onClick={() => alternarAcordeon('capas')} className="w-full p-3 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <span className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <Layers size={16} className="text-orange-500"/> Capas del Mapa
              </span>
              {acordeonActivo === 'capas' ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </button>
            {acordeonActivo === 'capas' && (
              <div className="p-3">
                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 mb-3 cursor-pointer">
                  <input type="checkbox" checked={mostrarCalles} onChange={(e) => alCambiarMostrarCalles(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                  Mostrar Calles y Rutas
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={mostrarLugares} onChange={(e) => alCambiarMostrarLugares(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                  Mostrar Nombres de Lugares
                </label>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}