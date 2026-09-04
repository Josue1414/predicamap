// src/componentes/VistaArca.jsx
import React, { useState } from 'react';
import { X, Lock, LayoutTemplate, Maximize2, LayoutGrid, LogIn } from 'lucide-react';
import { LISTA_ANIMALES } from '../utilidades/animalitos';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

const POSICIONES_LATERAL = [
  { top: '35%', left: '20%', width: '9%' }, { top: '35%', left: '40%', width: '9%' }, 
  { top: '35%', left: '60%', width: '9%' }, { top: '35%', left: '80%', width: '9%' }, 
  { top: '55%', left: '20%', width: '10%' }, { top: '55%', left: '40%', width: '10%' }, 
  { top: '55%', left: '60%', width: '10%' }, { top: '55%', left: '80%', width: '10%' }, 
  { top: '75%', left: '20%', width: '11%' }, { top: '75%', left: '40%', width: '11%' }, 
  { top: '75%', left: '60%', width: '11%' }, { top: '75%', left: '80%', width: '11%' }  
];

const POSICIONES_FRONTAL = [
  { top: '38%', left: '28%', width: '14%' }, { top: '38%', left: '72%', width: '14%' }, 
  { top: '55%', left: '22%', width: '18%' }, { top: '55%', left: '41%', width: '18%' }, 
  { top: '55%', left: '59%', width: '18%' }, { top: '55%', left: '78%', width: '18%' }  
];

export default function VistaArca({ animalesDesbloqueados, alCerrar }) {
  const [escena, setEscena] = useState('intro');
  const [animalSeleccionado, setAnimalSeleccionado] = useState(null);

  const BarraNavegacion = () => (
    <div className="bg-[#5c4033] px-2 py-3 border-t-[6px] border-[#3e2723] flex items-center justify-around shrink-0 z-50 relative">
      <button 
        onClick={() => setEscena('frontal')} 
        className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${escena === 'frontal' ? 'bg-[#8b5a2b] text-[#ffc677] shadow-inner' : 'text-white/60 hover:text-white'}`}
      >
        <LayoutTemplate size={24} />
        <span className="text-[9px] font-black uppercase tracking-widest">Frontal</span>
      </button>

      <button 
        onClick={() => setEscena('lateral')} 
        className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${escena === 'lateral' ? 'bg-[#8b5a2b] text-[#ffc677] shadow-inner' : 'text-white/60 hover:text-white'}`}
      >
        <Maximize2 size={24} />
        <span className="text-[9px] font-black uppercase tracking-widest">Lateral</span>
      </button>

      <button 
        onClick={() => setEscena('coleccion')} 
        className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${escena === 'coleccion' ? 'bg-[#8b5a2b] text-[#ffc677] shadow-inner' : 'text-white/60 hover:text-white'}`}
      >
        <LayoutGrid size={24} />
        <span className="text-[9px] font-black uppercase tracking-widest">Colección</span>
      </button>
    </div>
  );

  if (escena === 'intro') {
    return (
      <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-[#87CEEB] animate-in fade-in duration-500">
        <img src="/arca-exterior.jpg" alt="Fondo" className="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm mix-blend-overlay pointer-events-none" />
        
        <div className="relative z-10 w-[90%] max-w-sm bg-[#d2b48c] border-[6px] border-[#5c4033] rounded-2xl shadow-[8px_8px_0_0_rgba(0,0,0,0.5)] p-8 flex flex-col items-center text-center">
          <span className="text-6xl mb-4 drop-shadow-lg">🌊🚢</span>
          <h2 className="text-[#3e2723] text-3xl font-black uppercase tracking-widest mb-4">El Arca</h2>
          
          <div className="bg-[#f4e4bc] p-4 rounded-lg border-2 border-[#8b5a2b] shadow-inner mb-6 w-full">
            <p className="text-[#5c4033] text-sm font-bold leading-relaxed">
              Rescata a los animalitos cumpliendo tu meta mensual de horas.
              <br/><br/>
              ¡Alcanza tu objetivo cada mes para llenar el arca!
            </p>
          </div>

          <button 
            onClick={() => setEscena('frontal')}
            className="group flex items-center gap-3 bg-[#e2a855] hover:bg-[#ffc677] text-[#3e2723] border-4 border-[#3e2723] px-8 py-3 rounded-xl font-black text-xl uppercase tracking-widest shadow-[0_6px_0_0_#3e2723] active:translate-y-1 active:shadow-[0_2px_0_0_#3e2723] transition-all"
          >
            <LogIn size={24} className="group-hover:translate-x-1 transition-transform" />
            Entrar
          </button>

          <button onClick={alCerrar} className="mt-6 text-[#8b5a2b] font-black uppercase tracking-wider text-xs hover:text-[#5c4033]">
            Volver al menú
          </button>
        </div>
      </div>
    );
  }

  if (escena === 'frontal') {
    return (
      <div className="fixed inset-0 z-[5000] flex flex-col bg-[#87CEEB] animate-in fade-in duration-300">
        <div className="relative z-20 bg-[#5c4033] px-4 py-3 border-b-[6px] border-[#3e2723] shadow-xl flex items-center justify-between shrink-0">
          <h2 className="text-[#ffc677] font-black uppercase tracking-widest text-sm">Vista Frontal</h2>
          <button onClick={alCerrar} className="w-10 h-10 flex items-center justify-center bg-rose-600 hover:bg-rose-500 border-2 border-rose-900 rounded-lg text-white shadow-sm active:scale-95 transition-all">
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <div className="flex-1 w-full bg-[#a4d4e6] overflow-hidden relative">
          <TransformWrapper initialScale={1} minScale={0.5} maxScale={4} centerOnInit={true}>
            <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }} contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div className="relative w-[85vw] max-w-sm mx-auto">
                <img src="/arca-exterior.jpg" alt="Frontal" className="w-full h-auto rounded-3xl border-4 border-[#5c4033] shadow-2xl pointer-events-none" />
                
                {POSICIONES_FRONTAL.map((pos, index) => {
                  const animal = LISTA_ANIMALES[index];
                  if (!animal) return null;
                  
                  const estaDesbloqueado = true; // Para pruebas

                  return (
                    <div 
                      key={`frontal-${index}`}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                      style={{ top: pos.top, left: pos.left, width: pos.width }}
                    >
                      {estaDesbloqueado ? (
                        animal.gif ? (
                          <img 
                            src={animal.gif} 
                            alt={animal.nombre} 
                            className="w-full h-auto object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]" 
                          />
                        ) : (
                          <span className="text-3xl sm:text-4xl drop-shadow-xl animate-bounce">{animal.emoji}</span>
                        )
                      ) : (
                        <div className="bg-black/50 p-1 rounded-full border border-black/30">
                          <Lock size={12} className="text-white/60" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </TransformComponent>
          </TransformWrapper>
        </div>
        <BarraNavegacion />
      </div>
    );
  }

  if (escena === 'lateral') {
    return (
      <div className="fixed inset-0 z-[5000] flex flex-col bg-[#87CEEB] animate-in fade-in duration-300">
        <div className="relative z-20 bg-[#5c4033] px-4 py-3 border-b-[6px] border-[#3e2723] shadow-xl flex items-center justify-between shrink-0">
          <h2 className="text-[#ffc677] font-black uppercase tracking-widest text-sm">Vista Lateral</h2>
          <button onClick={alCerrar} className="w-10 h-10 flex items-center justify-center bg-rose-600 hover:bg-rose-500 border-2 border-rose-900 rounded-lg text-white shadow-sm active:scale-95 transition-all">
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <div className="flex-1 w-full bg-[#a4d4e6] overflow-hidden relative">
          <TransformWrapper initialScale={1} minScale={0.5} maxScale={4} centerOnInit={true} limitToBounds={true}>
            <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }} contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div className="relative w-[180vw] md:w-[1000px] mx-auto">
                <img src="/arca-interior.jpg" alt="Lateral" className="w-full h-auto block select-none pointer-events-none drop-shadow-2xl" />

                {LISTA_ANIMALES.map((animal, index) => {
                  const estaDesbloqueado = true; // Para pruebas
                  const pos = POSICIONES_LATERAL[index] || { top: '0%', left: '0%', width: '10%' };

                  return (
                    <div 
                      key={`lateral-${animal.id}`}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center group"
                      style={{ top: pos.top, left: pos.left, width: pos.width }}
                    >
                      {estaDesbloqueado ? (
                        <>
                          {animal.gif ? (
                            <img 
                              src={animal.gif} 
                              alt={animal.nombre} 
                              className="w-full h-auto object-contain cursor-pointer hover:scale-110 transition-transform animate-pulse drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]" 
                            />
                          ) : (
                            <span className="text-4xl sm:text-5xl md:text-6xl drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] animate-bounce inline-block cursor-pointer">{animal.emoji}</span>
                          )}
                          <div className="absolute -bottom-8 bg-[#f4e4bc] text-[#3e2723] border border-[#8b5a2b] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                            {animal.nombre}
                          </div>
                        </>
                      ) : (
                        <div className="bg-black/50 backdrop-blur-[2px] p-1.5 rounded-full border border-black/20 shadow-inner">
                          <Lock size={14} className="text-white/60" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </TransformComponent>
          </TransformWrapper>
        </div>
        <BarraNavegacion />
      </div>
    );
  }

  if (escena === 'coleccion') {
    return (
      <div className="fixed inset-0 z-[5000] flex flex-col bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
        
        {animalSeleccionado && (
          <div 
            className="absolute inset-0 z-[6000] flex items-center justify-center bg-black/80 p-4 animate-in zoom-in duration-200"
            onClick={() => setAnimalSeleccionado(null)}
          >
            <div className="w-full max-w-sm bg-[#d2b48c] border-[6px] border-[#5c4033] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex flex-col items-center overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="w-full bg-[#f4e4bc] border-b-4 border-[#8b5a2b] p-8 flex items-center justify-center relative">
                <div className="absolute bottom-2 w-full flex justify-center opacity-30"><span className="text-3xl">🌾</span></div>
                
                {animalSeleccionado.gif ? (
                  <img src={animalSeleccionado.gif} alt={animalSeleccionado.nombre} className="w-48 h-48 object-contain relative z-10 drop-shadow-xl animate-pulse" />
                ) : (
                  <span className="text-8xl relative z-10 drop-shadow-xl animate-bounce">{animalSeleccionado.emoji}</span>
                )}
              </div>
              
              <div className="w-full p-6 bg-[#8b5a2b] flex flex-col items-center text-center">
                <h3 className="text-[#ffc677] text-3xl font-black uppercase tracking-widest mb-2 drop-shadow-md">
                  {animalSeleccionado.nombre}
                </h3>
                <p className="text-white text-xs uppercase font-bold tracking-wider opacity-80 mb-6">
                  ¡Rescatado exitosamente!
                </p>
                <button 
                  onClick={() => setAnimalSeleccionado(null)}
                  className="bg-[#5c4033] hover:bg-[#3e2723] text-white px-8 py-3 rounded-full font-black uppercase tracking-widest border-2 border-[#2d1b15] shadow-lg active:scale-95 transition-all"
                >
                  Regresar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="relative z-20 bg-[#5c4033] px-4 py-3 border-b-[6px] border-[#3e2723] shadow-xl flex items-center justify-between shrink-0">
          <h2 className="text-[#ffc677] font-black uppercase tracking-widest text-sm">Inventario</h2>
          <div className="bg-[#1a100d] border-2 border-[#8b5a2b] px-3 py-1 rounded-md text-white text-xs font-mono font-bold">
            {animalesDesbloqueados.length} / 12
          </div>
          <button onClick={alCerrar} className="w-10 h-10 flex items-center justify-center bg-rose-600 hover:bg-rose-500 border-2 border-rose-900 rounded-lg text-white shadow-sm active:scale-95 transition-all">
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#d2b48c] border-4 border-[#5c4033] shadow-[8px_8px_0_0_#5c4033] rounded-lg overflow-hidden flex flex-col font-mono">
            <div className="p-4 bg-[#f4e4bc] grid grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto scroll-limpio">
              {LISTA_ANIMALES.map((animal, index) => {
                const estaDesbloqueado = true; // Para pruebas
                
                return (
                  <div 
                    key={`col-${animal.id}`} 
                    onClick={() => estaDesbloqueado && setAnimalSeleccionado(animal)}
                    className={`relative aspect-square flex flex-col items-center justify-center border-4 transition-transform ${estaDesbloqueado ? 'bg-[#8fbc8f] border-[#2e8b57] shadow-inner cursor-pointer hover:scale-105' : 'bg-[#a9a9a9] border-[#696969] opacity-70'}`}
                  >
                    {estaDesbloqueado && <div className="absolute bottom-1 w-full flex justify-center opacity-30"><span className="text-xs">🌾</span></div>}
                    
                    <div className="relative z-10 flex items-center justify-center w-full h-full p-2 pointer-events-none">
                      {estaDesbloqueado ? (
                        animal.gif ? (
                          <img src={animal.gif} alt={animal.nombre} className="w-full h-full object-contain drop-shadow-md" />
                        ) : (
                          <span className="text-4xl">{animal.emoji}</span>
                        )
                      ) : (
                        <Lock size={16} className="text-[#4a4a4a] mb-1" />
                      )}
                    </div>
                    
                    <div className="absolute -bottom-2 bg-black text-white text-[7px] px-1.5 py-0.5 uppercase tracking-widest z-20 pointer-events-none">
                      {estaDesbloqueado ? animal.nombre : '???'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <BarraNavegacion />
      </div>
    );
  }

  return null;
}