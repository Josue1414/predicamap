//src/context/ContextoModoMapa.jsx
import React, { createContext, useContext, useState } from 'react';

const ModoMapaContext = createContext();

export const MODOS_MAPA = {
  NINGUNO: 'ninguno',
  TRAZADO: 'trazado',
  EDIFICIOS: 'edificios',
  TACHUELA: 'tachuela',
  REVISITA: 'revisita'
};

export function ProveedorModoMapa({ children }) {
  const [modoActivo, setModoActivo] = useState(MODOS_MAPA.NINGUNO);
  
  // ★ NUEVO ESTADO: Estilo del mapa, por defecto en satélite
  const [estiloMapa, setEstiloMapa] = useState('satelite_puro');

  const cambiarModo = (nuevoModo) => {
    setModoActivo(nuevoModo);
  };

  const limpiarModo = () => setModoActivo(MODOS_MAPA.NINGUNO);

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
      MODOS_MAPA,
      // ★ EXPORTAMOS EL NUEVO ESTADO Y SU FUNCIÓN
      estiloMapa,
      setEstiloMapa
    }}>
      {children}
    </ModoMapaContext.Provider>
  );
}

export function useModoMapa() {
  const contexto = useContext(ModoMapaContext);
  if (!contexto) {
    throw new Error('useModoMapa debe usarse dentro de un ProveedorModoMapa');
  }
  return contexto;
}