// src/juego/MotorJuego.jsx
import React, { useState, useEffect } from 'react';
import ControlesMoviles from './ControlesMoviles';
import './EstilosJuego.css';

// Tamaño de cada bloque en píxeles[cite: 4]
const TAMANO_BLOQUE = 32;

// Mapa del Arca: 0=Suelo, 1=Pared, 2=Paja[cite: 4]
const MAPA_ARCA = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,1,0,0,0,2,2,0,0,0,1,0,0,0,0,0,1],
  [1,0,0,0,1,0,0,0,2,2,0,0,0,1,0,2,2,2,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,0,1],
  [1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,2,2,0,0,0,1,1,1,0,0,0,2,2,0,0,0,0,1],
  [1,0,2,2,0,0,0,1,0,1,0,0,0,2,2,0,0,0,0,1],
  [1,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

export default function MotorJuego({ alCerrar }) {
  const [posX, setPosX] = useState(64);
  const [posY, setPosY] = useState(64);
  const [moviendose, setMoviendose] = useState(false);
  
  // Estado para la animación continua del Rinoceronte (0 a 19)
  const [frameRino, setFrameRino] = useState(0);

  const paso = 8; 

  // Bucle de animación para el animal NPC
  useEffect(() => {
    const intervaloRino = setInterval(() => {
      // Incrementa el frame y vuelve a 0 cuando llega a 20
      setFrameRino((prev) => (prev + 1) % 20); 
    }, 100); // 100ms de velocidad. Cámbialo si se mueve muy rápido o lento.
    
    return () => clearInterval(intervaloRino);
  }, []);

  const verificarColision = (nuevoX, nuevoY) => {
    const columna = Math.floor((nuevoX + 16) / TAMANO_BLOQUE);
    const fila = Math.floor((nuevoY + 16) / TAMANO_BLOQUE);

    if (fila < 0 || fila >= MAPA_ARCA.length || columna < 0 || columna >= MAPA_ARCA[0].length) {
      return true; 
    }
    return MAPA_ARCA[fila][columna] === 1;
  };

  const manejarMovimiento = (deltaX, deltaY) => {
    setPosX((prevX) => {
      const nuevoX = prevX + deltaX;
      return verificarColision(nuevoX, posY) ? prevX : nuevoX;
    });
    
    setPosY((prevY) => {
      const nuevoY = prevY + deltaY;
      return verificarColision(posX, nuevoY) ? prevY : nuevoY;
    });

    setMoviendose(true);
    setTimeout(() => setMoviendose(false), 150); 
  };

  const manejarAccion = () => {
    const columna = Math.floor((posX + 16) / TAMANO_BLOQUE);
    const fila = Math.floor((posY + 16) / TAMANO_BLOQUE);
    
    if (MAPA_ARCA[fila][columna] === 2) {
      alert("¡Estás en la zona de paja! Aquí alimentaremos al animal.");
    } else {
      alert("No hay ningún animal cerca.");
    }
  };

  useEffect(() => {
    const teclaPresionada = (e) => {
      switch(e.key) {
        case 'ArrowUp': manejarMovimiento(0, -paso); break;
        case 'ArrowDown': manejarMovimiento(0, paso); break;
        case 'ArrowLeft': manejarMovimiento(-paso, 0); break;
        case 'ArrowRight': manejarMovimiento(paso, 0); break;
        case ' ': manejarAccion(); break; 
        default: break;
      }
    };
    window.addEventListener('keydown', teclaPresionada);
    return () => window.removeEventListener('keydown', teclaPresionada);
  }, [posX, posY]);

  // Convierte el número (ej: 5) en un texto con 3 dígitos (ej: "005") para coincidir con la imagen
  const nombreImagenRino = `tile${String(frameRino).padStart(3, '0')}.png`;

  return (
    <div className="fixed inset-0 bg-blue-900 z-[5000] overflow-hidden">
      
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-[5001] bg-gradient-to-b from-black/80 to-transparent">
        <div className="text-white font-bold text-sm bg-black/50 px-3 py-1 rounded">
          Arca Interior
        </div>
        <button 
          onClick={alCerrar} 
          className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded-lg shadow-md transition-colors">
          Cerrar
        </button>
      </div>

      <div 
        className="camara-juego"
        style={{ transform: `translate(${-posX}px, ${-posY}px)` }}
      >
        {/* Añadimos 'relative' al grid para poder posicionar elementos absolutos adentro */}
        <div 
          className="mapa-cuadricula relative" 
          style={{ gridTemplateColumns: `repeat(${MAPA_ARCA[0].length}, ${TAMANO_BLOQUE}px)` }}
        >
          {MAPA_ARCA.map((fila, y) => (
            fila.map((celda, x) => (
              <div key={`${x}-${y}`} className={`celda-mapa tipo-${celda}`} />
            ))
          ))}

          {/* Rinoceronte Animado (NPC) */}
          <div 
            className="absolute pixelated"
            style={{
              width: TAMANO_BLOQUE * 2,     // Hacemos que mida 2x2 bloques (ajusta a tu gusto)
              height: TAMANO_BLOQUE * 2,
              left: 8 * TAMANO_BLOQUE,      // Ubicado en la columna 8 de la matriz
              top: 1 * TAMANO_BLOQUE,       // Ubicado en la fila 1 de la matriz (sobre la paja)
              backgroundImage: `url('/Rinocerontes-split/${nombreImagenRino}')`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              zIndex: 5
            }}
          />
        </div>
      </div>

      <div className={`personaje-retro ${moviendose ? 'caminando' : ''}`} />

      <ControlesMoviles mover={manejarMovimiento} accion={manejarAccion} paso={paso} />
      
    </div>
  );
}