// src/vistas/VistaDashboard.jsx
import React, { useState, useEffect } from 'react';
import CabeceraCongregacion from '../componentes/CabeceraCongregacion';
import VisorMapa from '../componentes/VisorMapa';

// Datos de simulación local estáticos iniciales
const SECCIONES_MOCK = [
  { id: 1, nombre: 'Sección Celeste', colorHex: '#00f0ff', coordenadas: [[25.6565, -100.2940], [25.6590, -100.2940], [25.6590, -100.2920], [25.6565, -100.2920]] },
  { id: 2, nombre: 'Sección Rosa', colorHex: '#ff007f', coordenadas: [[25.6540, -100.2940], [25.6565, -100.2940], [25.6565, -100.2920], [25.6540, -100.2920]] }
];

export default function VistaDashboard() {
  const [modoOscuro, setModoOscuro] = useState(false);
  const [rolUsuario, setRolUsuario] = useState('Capitán'); // Valores: Publicador, Capitán, Administrador
  const [edificios, setEdificios] = useState([]);
  const [edificioSeleccionado, setEdificioSeleccionado] = useState(null);

  // Manejador del cambio visual de tema (Claro/Oscuro)
  useEffect(() => {
    if (modoOscuro) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.add('dark'); // Opcional si decides iniciar por defecto en oscuro
      document.documentElement.classList.remove('dark');
    }
  }, [modoOscuro]);

  const manejarSeleccionEdificio = (edificio) => {
    setEdificioSeleccionado(edificio);
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-200">
      {/* 1. Cabecera Fija */}
      <CabeceraCongregacion 
        nombreCongregacion="Congregación Central"
        modoOscuro={modoOscuro}
        alCambiarModo={() => setModoOscuro(!modoOscuro)}
        alAbrirMenu={() => console.log('Abrir panel lateral móvil')}
      />

      {/* 2. Contenedor del Mapa Principal (Ocupa todo el fondo por debajo de la cabecera) */}
      <main className="w-full h-full pt-14 relative z-10">
        <VisorMapa 
          centroInicial={[25.6565, -100.2930]}
          zoomInicial={15}
          secciones={SECCIONES_MOCK}
          edificios={edificios}
          alSeleccionarEdificio={manejarSeleccionEdificio}
        />

        {/* 3. Indicador Flotante de Rol Táctico en Esquina Inferior */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-lg text-xs font-semibold text-slate-700 dark:text-slate-300">
          Modo actual: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{rolUsuario}</span>
        </div>
      </main>
    </div>
  );
}