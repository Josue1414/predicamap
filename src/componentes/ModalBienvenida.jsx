// src/componentes/ModalBienvenida.jsx
import React from 'react';
import { MapPin } from 'lucide-react';

export default function ModalBienvenida({
  nombreNuevoSetup, setNombreNuevoSetup,
  textoBusqueda, setTextoBusqueda,
  buscarCiudadEnServidor, resultadosCiudades, seleccionarCiudad,
  guardarNombreCongregacionBD, cargando
}) {
  return (
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
  );
}