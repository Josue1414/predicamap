// src/componentes/FormularioSeccion.jsx
import React from 'react';
import { Trash2, Undo, Save, X } from 'lucide-react';

// Los 8 colores exactos de tu croquis original para selección rápida
const PALETA_COLORES = [
  { nombre: 'Celeste', hex: '#00f0ff' },
  { nombre: 'Rosa', hex: '#ff007f' },
  { nombre: 'Morado', hex: '#b000ff' },
  { nombre: 'Amarillo', hex: '#ffea00' },
  { nombre: 'Naranja', hex: '#ff7c00' },
  { nombre: 'Azul', hex: '#0040ff' },
  { nombre: 'Verde', hex: '#00e600' },
  { nombre: 'Magenta', hex: '#ff00d0' },
];

export default function FormularioSeccion({
  enModoTrazado,
  nombre,
  alCambiarNombre,
  colorSeleccionado,
  alCambiarColor,
  puntosContados,
  alDeshacerPunto,
  alLimpiarTrazado,
  alGuardar,
  alCancelar
}) {
  if (!enModoTrazado) return null;

  return (
    <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:top-20 md:bottom-auto md:w-80 z-[2000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 animate-slide-up transition-colors duration-200">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          📍 Diseñar Nuevo Perímetro
        </h3>
        <button onClick={alCancelar} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
          <X size={16} />
        </button>
      </div>

      <div className="space-y-3 text-xs">
        {/* Input de Nombre */}
        <div>
          <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1">Nombre del Territorio / Sección</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => alCambiarNombre(e.target.value)}
            placeholder="Ej: Sección 3 - Calle Robles"
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Selector de Color Táctil */}
        <div>
          <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Color identificador del Croquis</label>
          <div className="grid grid-cols-4 gap-1.5">
            {PALETA_COLORES.map((color) => (
              <button
                key={color.hex}
                type="button"
                onClick={() => alCambiarColor(color.hex)}
                className={`h-7 rounded-lg border flex items-center justify-center transition-transform active:scale-95 ${
                  colorSeleccionado === color.hex 
                    ? 'border-slate-900 dark:border-white scale-105 shadow-md font-bold' 
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.nombre}
              >
                {colorSeleccionado === color.hex && (
                  <span className="text-[10px] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Contador de puntos del Polígono */}
        <div className="p-2 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200/60 dark:border-slate-800/60 flex justify-between items-center text-[11px]">
          <span className="text-slate-500 dark:text-slate-400">Puntos marcados en el satélite:</span>
          <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-full">
            {puntosContados} {puntosContados < 3 ? ' (Mínimo 3)' : '✅'}
          </span>
        </div>

        {/* Botones de Control de Trazado */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            disabled={puntosContados === 0}
            onClick={alDeshacerPunto}
            className="flex items-center justify-center gap-1 py-1.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Undo size={14} /> Deshacer
          </button>
          <button
            type="button"
            disabled={puntosContados === 0}
            onClick={alLimpiarTrazado}
            className="flex items-center justify-center gap-1 py-1.5 px-3 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-medium rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Trash2 size={14} /> Limpiar
          </button>
        </div>

        {/* Botón de Guardado Final */}
        <button
          type="button"
          disabled={puntosContados < 3 || !nombre.trim()}
          onClick={alGuardar}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 font-bold rounded-xl shadow-lg shadow-indigo-600/10 disabled:shadow-none transition-all active:scale-[0.99] disabled:cursor-not-allowed"
        >
          <Save size={15} /> Guardar Territorio en Supabase
        </button>
      </div>
    </div>
  );
}