import { useEffect, useRef } from 'react';

export default function useBotonAtrasCelular(manejarBotonAtras) {
  const manejarRef = useRef(manejarBotonAtras);
  const procesandoRef = useRef(false);
  
  useEffect(() => {
    manejarRef.current = manejarBotonAtras;
  }, [manejarBotonAtras]);

  useEffect(() => {
    // 1. Colocamos el candado principal al iniciar la app
    window.history.pushState({ trampaApp: true }, '');

    const interceptarAtras = async () => {
      // Ignoramos cierres provocados por botones dentro de la app
      if (window.ignorarSiguientePopstate) {
        window.ignorarSiguientePopstate = false;
        return;
      }

      // ★ SOLUCIÓN AL CIERRE INESPERADO: Reponemos el candado INMEDIATAMENTE
      // Al presionar el botón físico se gastó un candado, lo restauramos antes 
      // de evaluar cualquier otra cosa para que la app nunca quede desprotegida.
      window.history.pushState({ trampaApp: true }, '');

      // Detectamos si hay Ventanas Flotantes abiertas (ej. Secciones del menú lateral)
      const hayModalesAbiertos = window.modalesAbiertos && window.modalesAbiertos.length > 0;

      // Seguro para evitar que se ejecute doble si el usuario presiona muy rápido
      if (procesandoRef.current) return;
      procesandoRef.current = true;

      // ★ NUEVA CONEXIÓN: Le enviamos a tu función principal el estado de los modales.
      // Así el Dashboard sabrá si debe cerrar el menú lateral completo.
      const debeSalir = await manejarRef.current(hayModalesAbiertos);

      procesandoRef.current = false;

      // Si el usuario confirmó que quiere salir de PredicaMap, lo dejamos ir
      if (debeSalir) {
        window.removeEventListener('popstate', interceptarAtras);
        window.history.go(-2); 
      }
    };

    window.addEventListener('popstate', interceptarAtras);

    return () => {
      window.removeEventListener('popstate', interceptarAtras);
    };
  }, []); 
}