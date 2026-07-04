// src/hooks/useBotonAtrasCelular.js
import { useEffect, useRef } from 'react';

export default function useBotonAtrasCelular(manejarBotonAtras) {
  // 1. Guardamos tu función del Dashboard en una referencia.
  // Esto evita que el escudo se reinicie cada vez que abres o cierras un menú.
  const manejarRef = useRef(manejarBotonAtras);
  
  useEffect(() => {
    manejarRef.current = manejarBotonAtras;
  }, [manejarBotonAtras]);

  useEffect(() => {
    // 2. Colocamos el registro falso en el historial SOLO UNA VEZ
    window.history.pushState({ trampaApp: true }, '');

    const interceptarAtras = async (evento) => {
      // 3. Volvemos a colocar el escudo inmediatamente
      window.history.pushState({ trampaApp: true }, '');

      // 4. CAPA 1: Revisamos si hay Ventanas Flotantes abiertas
      if (window.modalesAbiertos && window.modalesAbiertos.length > 0) {
        // Obtenemos la última ventana que se abrió
        const modalRef = window.modalesAbiertos[window.modalesAbiertos.length - 1];
        if (modalRef && modalRef.current) {
          modalRef.current(); // Cerramos SOLAMENTE la ventana
        }
        return; // Detenemos la función. El Menú Lateral se queda abierto.
      }

      // 5. CAPA 2: No hay ventanas, le preguntamos al Dashboard
      // Usamos manejarRef para tener los datos más actualizados sin reiniciar el hook
      const debeSalir = await manejarRef.current();

      if (debeSalir) {
        // Si el usuario confirmó la alerta de salir, lo dejamos ir
        window.removeEventListener('popstate', interceptarAtras);
        window.history.go(-2); 
      }
    };

    window.addEventListener('popstate', interceptarAtras);

    // Limpiamos solo cuando se cierre el Dashboard por completo
    return () => {
      window.removeEventListener('popstate', interceptarAtras);
    };
  }, []); // <-- ARREGLO VACÍO: ¡Esto garantiza que el escudo nunca parpadee ni te saque!
}