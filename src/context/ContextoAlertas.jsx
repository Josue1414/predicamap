// src/context/ContextoAlertas.jsx
import React, { createContext, useContext, useState, useRef } from 'react';
import { AlertTriangle, Info, CheckCircle2, XCircle } from 'lucide-react';

const ContextoAlertas = createContext();

export const useAlertas = () => useContext(ContextoAlertas);

export function ProveedorAlertas({ children }) {
  const [alerta, setAlerta] = useState({ visible: false });
  const resolverPromesa = useRef(null);

  // Muestra una alerta simple (Solo botón "Aceptar")
  const mostrarAlerta = (titulo, mensaje, tipo = 'info') => {
    return new Promise((resolve) => {
      setAlerta({ visible: true, tipo, titulo, mensaje, esConfirmacion: false });
      resolverPromesa.current = resolve;
    });
  };

  // Muestra una confirmación (Botones "Cancelar" y "Aceptar")
  const mostrarConfirmacion = (titulo, mensaje, tipo = 'warning', textoConfirmar = "Aceptar", textoCancelar = "Cancelar") => {
    return new Promise((resolve) => {
      setAlerta({ visible: true, tipo, titulo, mensaje, esConfirmacion: true, textoConfirmar, textoCancelar });
      resolverPromesa.current = resolve;
    });
  };

  const manejarCierre = (resultado) => {
    setAlerta({ visible: false });
    if (resolverPromesa.current) {
      resolverPromesa.current(resultado);
      resolverPromesa.current = null;
    }
  };

  // Configuraciones visuales según el tipo
  const estilosPorTipo = {
    info: { icono: <Info size={28} className="text-blue-500" />, colorBtn: 'bg-blue-600 hover:bg-blue-500' },
    success: { icono: <CheckCircle2 size={28} className="text-emerald-500" />, colorBtn: 'bg-emerald-600 hover:bg-emerald-500' },
    warning: { icono: <AlertTriangle size={28} className="text-amber-500" />, colorBtn: 'bg-amber-600 hover:bg-amber-500' },
    danger: { icono: <XCircle size={28} className="text-rose-500" />, colorBtn: 'bg-rose-600 hover:bg-rose-500' }
  };

  const estiloActual = estilosPorTipo[alerta.tipo] || estilosPorTipo.info;

  return (
    <ContextoAlertas.Provider value={{ mostrarAlerta, mostrarConfirmacion }}>
      {children}

      {alerta.visible && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
            <div className="p-6 flex flex-col items-center text-center">
              
              <div className="mb-4 p-3 rounded-full bg-slate-50 dark:bg-slate-800/50 shadow-inner">
                {estiloActual.icono}
              </div>
              
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-2">
                {alerta.titulo}
              </h3>
              
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                {alerta.mensaje}
              </p>
              
              <div className="flex gap-3 w-full">
                {alerta.esConfirmacion && (
                  <button
                    onClick={() => manejarCierre(false)}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-95"
                  >
                    {alerta.textoCancelar}
                  </button>
                )}
                <button
                  onClick={() => manejarCierre(true)}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-white transition-colors active:scale-95 shadow-lg shadow-black/10 ${estiloActual.colorBtn}`}
                >
                  {alerta.esConfirmacion ? alerta.textoConfirmar : 'Entendido'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </ContextoAlertas.Provider>
  );
}