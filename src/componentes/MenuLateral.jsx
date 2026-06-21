// src/componentes/MenuLateral.jsx
import React, { useState } from 'react';
import { X, Search, Map, PenTool, LogOut, ChevronDown, ChevronUp, Trash2, Home, List, MapPin, CheckCircle2, Navigation, Settings, Users, Clock, Layers } from 'lucide-react';
import { supabase } from '../utilidades/clienteSupabase';

const PALETA_COLORES = [
  { nombre: 'Celeste', hex: '#00f0ff' }, { nombre: 'Rosa', hex: '#ff007f' },
  { nombre: 'Morado', hex: '#b000ff' }, { nombre: 'Amarillo', hex: '#ffea00' },
  { nombre: 'Naranja', hex: '#ff7c00' }, { nombre: 'Azul', hex: '#0040ff' },
  { nombre: 'Verde', hex: '#00e600' }, { nombre: 'Magenta', hex: '#ff00d0' },
];

export default function MenuLateral({
  abierto, alCerrar,
  nombreCongregacion, alCambiarNombreCongregacion,
  seccionesGuardadas, edificiosGuardados, alEliminarSeccion, alCompletarTerritorio, alVolarATerritorio,
  textoBusqueda, alCambiarTextoBusqueda, alBuscar, resultadosCiudades, alSeleccionarCiudad,
  nombreTerritorio, alCambiarNombre, colorTerritorio, alCambiarColor, notasTerritorio, alCambiarNotas, alEmpezarATrazar,
  alActivarModoEdificios,
  mostrarCalles, alCambiarMostrarCalles, mostrarLugares, alCambiarMostrarLugares // <-- PROPS INYECTADAS
}) {
  const [acordeonActivo, setAcordeonActivo] = useState('lista'); 
  const [territorioExpandido, setTerritorioExpandido] = useState(null);

  const alternarAcordeon = (seccion) => setAcordeonActivo(acordeonActivo === seccion ? null : seccion);

  return (
    <>
      {abierto && <div className="fixed inset-0 bg-black/50 z-[3000] transition-opacity" onClick={alCerrar} />}

      <div className={`fixed top-0 left-0 h-full w-80 sm:w-96 bg-slate-50 dark:bg-slate-900 shadow-2xl z-[3001] transform transition-transform duration-300 flex flex-col ${abierto ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-950">
          <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Settings size={18} className="text-slate-600" /> Panel de Control
          </h2>
          <button onClick={alCerrar} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto scroll-limpio p-3 space-y-2">

          {/* =============================================================== */}
          {/* SECCIÓN OPERATIVA: TERRITORIOS Y CASAS */}
          {/* =============================================================== */}
          <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 mt-1 px-1">Operación de Campo</div>

          {/* ACORDEÓN 1: LISTADO DE TERRITORIOS */}
          <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <button onClick={() => alternarAcordeon('lista')} className="w-full p-3 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <span className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2"><List size={16} className="text-indigo-500"/> Territorios ({seccionesGuardadas?.length || 0})</span>
              {acordeonActivo === 'lista' ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </button>
            {acordeonActivo === 'lista' && (
              <div className="p-3 bg-white dark:bg-slate-950 max-h-80 overflow-y-auto space-y-2">
                {seccionesGuardadas?.length === 0 ? <p className="text-xs text-slate-400 text-center py-2">No hay territorios creados aún.</p> : (
                  seccionesGuardadas.map(sec => {
                    const casasDeEstaSeccion = edificiosGuardados?.filter(e => e.seccion_id === sec.id) || [];
                    const totalCasas = casasDeEstaSeccion.length;
                    const casasCompletadas = casasDeEstaSeccion.filter(e => e.estado === 'completado').length;
                    const porcentaje = totalCasas === 0 ? 0 : Math.round((casasCompletadas / totalCasas) * 100);

                    return (
                      <div key={sec.id} className="border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm">
                        <div onClick={() => setTerritorioExpandido(territorioExpandido === sec.id ? null : sec.id)} className="p-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900">
                          <div className="flex items-center gap-2 w-full pr-3">
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: sec.colorHex }} />
                            <div className="flex flex-col flex-1">
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-none mb-1.5">{sec.nombre}</span>
                              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1 mt-0.5">
                                <div className="bg-emerald-500 h-1 rounded-full transition-all" style={{ width: `${porcentaje}%` }}></div>
                              </div>
                            </div>
                          </div>
                          <ChevronDown size={14} className={`text-slate-400 flex-shrink-0 transition-transform ${territorioExpandido === sec.id ? 'rotate-180' : ''}`} />
                        </div>
                        {territorioExpandido === sec.id && (
                          <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                            <p className="text-xs text-slate-500 mb-3 italic">"{sec.notas || 'Sin observaciones'}"</p>
                            <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400 font-bold mb-2">
                              <span>{casasCompletadas} de {totalCasas} completadas</span>
                              <span className={porcentaje === 100 ? 'text-emerald-500' : ''}>{porcentaje}% Listo</span>
                            </div>
                            <div className="grid grid-cols-1 gap-2 mt-3">
                              <button onClick={() => { alVolarATerritorio(sec.coordenadas); alCerrar(); }} className="flex justify-center items-center gap-1.5 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg font-bold text-xs hover:bg-indigo-100 transition-colors"><Navigation size={14} /> Volar al Territorio</button>
                              <button disabled={totalCasas === 0 || porcentaje === 100} onClick={() => alCompletarTerritorio(sec.id)} className="flex justify-center items-center gap-1.5 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg font-bold text-xs hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><CheckCircle2 size={14} /> {porcentaje === 100 ? 'Territorio Terminado' : 'Marcar TODO Completado'}</button>
                              <button onClick={() => alEliminarSeccion(sec.id)} className="flex justify-center items-center gap-1.5 py-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg font-bold text-xs hover:bg-rose-100 transition-colors"><Trash2 size={14} /> Eliminar Territorio</button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* ACORDEÓN 2: CREAR NUEVO TERRITORIO */}
          <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <button onClick={() => alternarAcordeon('crear')} className="w-full p-3 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <span className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2"><PenTool size={16} className="text-indigo-500"/> Dibujar Territorio</span>
              {acordeonActivo === 'crear' ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </button>
            {acordeonActivo === 'crear' && (
              <div className="p-4 space-y-3 text-xs bg-white dark:bg-slate-950">
                <input type="text" value={nombreTerritorio} onChange={(e) => alCambiarNombre(e.target.value)} placeholder="Nombre (Ej: Sección 1)" className="w-full border rounded-lg p-2 dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
                <div className="grid grid-cols-4 gap-2">
                  {PALETA_COLORES.map((color) => (
                    <button key={color.hex} type="button" onClick={() => alCambiarColor(color.hex)} className={`h-8 rounded-lg border-2 ${colorTerritorio === color.hex ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent opacity-60'}`} style={{ backgroundColor: color.hex }} />
                  ))}
                </div>
                <textarea value={notasTerritorio} onChange={(e) => alCambiarNotas(e.target.value)} placeholder="Notas..." rows="2" className="w-full border rounded-lg p-2 dark:bg-slate-900 dark:border-slate-700 dark:text-white resize-none" />
                <button disabled={!nombreTerritorio.trim()} onClick={() => { alEmpezarATrazar(); alCerrar(); }} className="w-full py-2 bg-indigo-600 text-white font-bold rounded-lg disabled:opacity-50">Ir al Mapa a Dibujar</button>
              </div>
            )}
          </div>

          {/* ACORDEÓN 3: SEMBRAR CASAS */}
          <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <button onClick={() => alternarAcordeon('casas')} className="w-full p-3 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <span className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2"><Home size={16} className="text-emerald-500"/> Sembrar Casas</span>
              {acordeonActivo === 'casas' ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </button>
            {acordeonActivo === 'casas' && (
              <div className="p-4 bg-white dark:bg-slate-950">
                <p className="text-[11px] text-slate-500 mb-3">Activa este modo para dar toques sobre los techos en el mapa satelital y crear puntos de predicación.</p>
                <button onClick={() => { alActivarModoEdificios(); alCerrar(); }} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg shadow-emerald-600/20 text-xs flex justify-center items-center gap-2">
                  <Home size={14} /> Iniciar Siembra
                </button>
              </div>
            )}
          </div>

          {/* ACORDEÓN 4: BUSCADOR */}
          <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <button onClick={() => alternarAcordeon('buscar')} className="w-full p-3 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <span className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2"><Search size={16} className="text-slate-500"/> Navegar a otra Ciudad</span>
              {acordeonActivo === 'buscar' ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </button>
            {acordeonActivo === 'buscar' && (
              <div className="p-3 bg-white dark:bg-slate-950">
                <form onSubmit={(e) => { e.preventDefault(); alBuscar(); }} className="flex gap-2">
                  <input type="text" value={textoBusqueda} onChange={(e) => alCambiarTextoBusqueda(e.target.value)} placeholder="Ej: Monterrey..." className="w-full border rounded-lg p-2 text-xs dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
                  <button type="submit" className="bg-slate-800 text-white px-3 rounded-lg text-xs font-bold">Ir</button>
                </form>
                {resultadosCiudades.length > 0 && (
                  <ul className="mt-2 border rounded-lg max-h-32 overflow-y-auto text-xs dark:border-slate-800">
                    {resultadosCiudades.map((c, i) => (
                      <li key={i} onClick={() => { alSeleccionarCiudad(c); alCerrar(); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer truncate dark:text-slate-300">{c.display_name}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>


          {/* =============================================================== */}
          {/* SECCIÓN ADMINISTRACIÓN: CONFIGURACIÓN, USUARIOS, HISTORIAL */}
          {/* =============================================================== */}
          <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 mt-6 px-1">Administración</div>

          {/* ACORDEÓN 5: GENERAL Y CAPAS DEL MAPA (INTEGRADO) */}
          <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <button onClick={() => alternarAcordeon('configuracion')} className="w-full p-3 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <span className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2"><MapPin size={16} className="text-blue-500"/> General</span>
              {acordeonActivo === 'configuracion' ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </button>
            {acordeonActivo === 'configuracion' && (
              <div className="p-4 bg-white dark:bg-slate-950 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Nombre Oficial</label>
                  <input type="text" value={nombreCongregacion} onChange={(e) => alCambiarNombreCongregacion(e.target.value)} className="w-full border rounded-lg p-2 text-xs dark:bg-slate-900 dark:border-slate-700 dark:text-white focus:ring-1 focus:ring-indigo-500" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 mb-1">Enlace público para publicadores:</p>
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded text-[10px] font-mono text-indigo-500 break-all select-all border border-slate-200 dark:border-slate-700">
                    https://predicamap.com/v/central-123
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1 italic">*Módulo de links en desarrollo</p>
                </div>
                
                {/* LOS DOS SWITCHES PARA EL MAPA HÍBRIDO */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[11px] font-bold text-slate-500 mb-2 flex items-center gap-1"><Layers size={12} /> Capas del Mapa</p>
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 mb-2 cursor-pointer">
                    <input type="checkbox" checked={mostrarCalles} onChange={(e) => alCambiarMostrarCalles(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                    Mostrar Calles y Rutas
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={mostrarLugares} onChange={(e) => alCambiarMostrarLugares(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                    Mostrar Nombres de Lugares
                  </label>
                </div>

              </div>
            )}
          </div>

          {/* ACORDEÓN 6: GESTIÓN DE CAPITANES (ESQUELETO) */}
          <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden opacity-75">
            <button onClick={() => alternarAcordeon('capitanes')} className="w-full p-3 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <span className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2"><Users size={16} className="text-purple-500"/> Capitanes y Accesos</span>
              {acordeonActivo === 'capitanes' ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </button>
            {acordeonActivo === 'capitanes' && (
              <div className="p-4 bg-white dark:bg-slate-950 text-center">
                <Users size={32} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                <p className="text-xs text-slate-500 font-bold">Módulo Próximamente</p>
                <p className="text-[10px] text-slate-400 mt-1">Aquí podrás invitar hermanos y asignarles zonas.</p>
              </div>
            )}
          </div>

          {/* ACORDEÓN 7: HISTORIAL Y AUDITORÍA (ESQUELETO) */}
          <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden opacity-75">
            <button onClick={() => alternarAcordeon('historial')} className="w-full p-3 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <span className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2"><Clock size={16} className="text-amber-500"/> Historial de Actividad</span>
              {acordeonActivo === 'historial' ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </button>
            {acordeonActivo === 'historial' && (
              <div className="p-4 bg-white dark:bg-slate-950 text-center">
                <Clock size={32} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                <p className="text-xs text-slate-500 font-bold">Módulo Próximamente</p>
                <p className="text-[10px] text-slate-400 mt-1">Registros de quién marcó cada casa y fechas de reinicio.</p>
              </div>
            )}
          </div>

        </div>

        {/* BOTÓN INFERIOR: CERRAR SESIÓN */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <button onClick={async () => { await supabase.auth.signOut(); alCerrar(); }} className="w-full py-2.5 flex items-center justify-center gap-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl font-bold transition-colors text-xs">
            <LogOut size={16} /> Cerrar Sesión Segura
          </button>
        </div>

      </div>
    </>
  );
}