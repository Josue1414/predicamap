// src/context/ContextoModoMapa.jsx
import React, { createContext, useContext, useState } from 'react';

const ModoMapaContext = createContext();

// Definimos los modos como constantes para evitar errores de dedo (typos)
export const MODOS_MAPA = {
  NINGUNO: 'ninguno',
  TRAZADO: 'trazado',
  EDIFICIOS: 'edificios',
  TACHUELA: 'tachuela',
  REVISITA: 'revisita'
};

export function ProveedorModoMapa({ children }) {
  const [modoActivo, setModoActivo] = useState(MODOS_MAPA.NINGUNO);

  const cambiarModo = (nuevoModo) => {
    setModoActivo(nuevoModo);
  };

  const limpiarModo = () => setModoActivo(MODOS_MAPA.NINGUNO);

  // Derivamos booleanos dinámicos para mantener compatibilidad con tus componentes actuales
  const enModoTrazado = modoActivo === MODOS_MAPA.TRAZADO;
  const enModoEdificios = modoActivo === MODOS_MAPA.EDIFICIOS;
  const enModoTachuela = modoActivo === MODOS_MAPA.TACHUELA;
  const enModoRevisita = modoActivo === MODOS_MAPA.REVISITA;

  return (
    <ModoMapaContext.Provider value={{
      modoActivo,
      cambiarModo,
      limpiarModo,
      enModoTrazado,
      enModoEdificios,
      enModoTachuela,
      enModoRevisita,
      MODOS_MAPA
    }}>
      {children}
    </ModoMapaContext.Provider>
  );
}

// Hook personalizado para consumir el contexto fácilmente
export function useModoMapa() {
  const contexto = useContext(ModoMapaContext);
  if (!contexto) {
    throw new Error('useModoMapa debe usarse dentro de un ProveedorModoMapa');
  }
  return contexto;
}