// src/componentes/menu-lateral/SeccionDibujarTerritorio.jsx
import React from 'react';
import { PenTool, ChevronRight, Info } from 'lucide-react';
import VentanaFlotante from '../VentanaFlotante'; // IMPORTAMOS LA VENTANA FLOTANTE

// NUEVA PALETA EXTENDIDA (20 COLORES MODERNOS)
const PALETA_COLORES = [
  { nombre: 'Carmesí', hex: '#e11d48' },   { nombre: 'Rojo', hex: '#715605' },
  { nombre: 'Naranja', hex: '#f97316' },   { nombre: 'Ámbar', hex: '#f59e0b' },
  { nombre: 'Amarillo', hex: '#eab308' },  { nombre: 'Lima', hex: '#84cc16' },
  { nombre: 'Verde', hex: '#22c55e' },     { nombre: 'Esmeralda', hex: '#10b981' },
  { nombre: 'Verde Mar', hex: '#14b8a6' }, { nombre: 'Cian', hex: '#06b6d4' },
  { nombre: 'Celeste', hex: '#0ea5e9' },   { nombre: 'Azul', hex: '#3b82f6' },
  { nombre: 'Índigo', hex: '#6366f1' },    { nombre: 'Violeta', hex: '#8b5cf6' },
  { nombre: 'Morado', hex: '#a855f7' },    { nombre: 'Fucsia', hex: '#d946ef' },
  { nombre: 'Rosa', hex: '#ec4899' },      { nombre: 'Rosa Palo', hex: '#f43fe8' },
  { nombre: 'Marrón', hex: '#a8a29e' },    { nombre: 'Pizarra', hex: '#64748b' }
];

export default function SeccionDibujarTerritorio({
  visible, nombreTerritorio, alCambiarNombre, colorTerritorio, alCambiarColor,
  notasTerritorio, alCambiarNotas, alEmpezarATrazar, acordeonActivo, alternarAcordeon, alCerrar
}) {
  if (!visible) return null;

  const estaAbierta = acordeonActivo === 'crear';

  return (
    <div className="mb-2">
      {/* BOTÓN DEL MENÚ LATERAL */}
      <button 
        onClick={() => alternarAcordeon('crear')} 
        className="w-full p-3 flex justify-between items-center rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 shadow-sm transition-colors"
      >
        <span className="font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <PenTool size={16} className="text-indigo-500"/> Crear Territorio
        </span>
        <ChevronRight size={16} className="text-slate-400" />
      </button>
      
      {/* NUEVA VENTANA FLOTANTE */}
      <VentanaFlotante
        abierta={estaAbierta}
        alCerrar={() => alternarAcordeon('crear')}
        titulo="Crear Territorio"
        icono={PenTool}
      >
        <div className="flex flex-col h-full">
          
          {/* NUEVO BANNER DE INSTRUCCIONES */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 px-4 py-3 border-b border-indigo-100 dark:border-indigo-800/50 flex items-start gap-3 shrink-0">
            <Info size={20} className="text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
            <p className="text-xs text-indigo-800 dark:text-indigo-300 leading-snug">
              <strong>Instrucciones:</strong> Para trazar el perímetro, toca un punto en el mapa y luego el siguiente para ir uniendo las líneas. <strong className="underline decoration-indigo-300">Por favor, no arrastres el dedo.</strong>
            </p>
          </div>

          {/* CONTENEDOR DEL FORMULARIO */}
          <div className="p-5 space-y-5 text-sm bg-white dark:bg-slate-950 flex-1 overflow-y-auto scroll-limpio">
            
            {/* Campo: Nombre */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                Nombre del Territorio
              </label>
              <input 
                type="text" 
                value={nombreTerritorio} 
                onChange={(e) => alCambiarNombre(e.target.value)} 
                placeholder="Ej: Sección 1, Centro, etc." 
                className="w-full border rounded-xl p-3 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all font-bold" 
              />
            </div>
            
            {/* Campo: Color */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                Color del Perímetro
              </label>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                {PALETA_COLORES.map((color) => (
                  <button 
                    key={color.hex} 
                    type="button" 
                    onClick={() => alCambiarColor(color.hex)} 
                    className={`h-8 rounded-lg border-2 transition-all ${colorTerritorio === color.hex ? 'border-slate-900 dark:border-white scale-110 shadow-md' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'}`} 
                    style={{ backgroundColor: color.hex }} 
                    title={color.nombre}
                  />
                ))}
              </div>
            </div>
            
            {/* Campo: Notas */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                Notas <span className="font-normal italic capitalize text-slate-400">(Opcional)</span>
              </label>
              <textarea 
                value={notasTerritorio} 
                onChange={(e) => alCambiarNotas(e.target.value)} 
                placeholder="Anotaciones sobre este nuevo territorio..." 
                rows="3" 
                className="w-full border rounded-xl p-3 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 dark:text-white resize-none focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" 
              />
            </div>
            
            {/* BOTÓN DE ACCIÓN ACTUALIZADO */}
            <div className="pt-2">
              <button 
                disabled={!nombreTerritorio.trim()} 
                onClick={() => { 
                  alEmpezarATrazar(); // 1. Prepara el mapa para dibujar
                  alternarAcordeon('crear'); // 2. Cierra la Ventana Flotante
                  alCerrar(); // 3. Cierra el Menú Lateral que está de fondo
                }} 
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl disabled:opacity-50 transition-colors shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                <PenTool size={18} />
                Ir al Mapa a Dibujar
              </button>
            </div>

          </div>
        </div>
      </VentanaFlotante>
    </div>
  );
}