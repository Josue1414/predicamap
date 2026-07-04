import { useState, useEffect } from 'react';

export default function ModalPrivacidad() {
  const [haAceptado, setHaAceptado] = useState(true); // Asumimos true para evitar destellos, lo verificamos en el useEffect
  const [mostrarCompleto, setMostrarCompleto] = useState(false);

  useEffect(() => {
    // Verificamos si ya existe el registro de aceptación en el navegador
    const aceptacion = localStorage.getItem('predicamap_privacidad_aceptada');
    if (!aceptacion) {
      setHaAceptado(false);
    }
  }, []);

  const manejarAceptacion = () => {
    localStorage.setItem('predicamap_privacidad_aceptada', 'true');
    setHaAceptado(true);
  };

  if (haAceptado) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        
        {/* Cabecera */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            Aviso de Privacidad y Términos de Uso
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Para continuar usando PredicaMap, es necesario que leas y aceptes nuestras políticas sobre el manejo de la información.
          </p>
        </div>

        {/* Contenido (Resumen o Completo) */}
        <div className="p-6 flex-1 overflow-y-auto">
          {!mostrarCompleto ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Puntos Clave:</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">📍</span>
                  <p className="text-sm text-gray-700">
                    <strong>Datos Públicos:</strong> Los datos de territorios y calles que ingreses deben ser información de dominio público (ej. nombres de calles, números exteriores).
                  </p>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">🔒</span>
                  <p className="text-sm text-gray-700">
                    <strong>Tus notas son tuyas (Revisitas):</strong> La información detallada y notas personales que tomes se guardan <strong>únicamente de forma local en tu dispositivo</strong>. Nosotros no tenemos acceso a esa información.
                  </p>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">⚖️</span>
                  <p className="text-sm text-gray-700">
                    <strong>Tu Responsabilidad:</strong> Al usar la app, aceptas ser el único responsable del manejo ético y legal de los datos que decides registrar.
                  </p>
                </li>
              </ul>
            </div>
          ) : (
            <div className="space-y-4 text-sm text-gray-700 text-justify">
              <h3 className="font-bold text-gray-900 text-base">Aviso de Privacidad Integral de PredicaMap</h3>
              
              <p>
                <strong>1. Naturaleza del Servicio y Rol de las Partes:</strong> PredicaMap opera exclusivamente como una herramienta tecnológica (proveedor de infraestructura SaaS). El usuario final asume el rol de "Responsable" del tratamiento de cualquier dato ingresado, mientras que PredicaMap actúa como un facilitador técnico.
              </p>

              <p>
                <strong>2. Manejo de Información Pública (Territorios y Mapas):</strong> La plataforma está diseñada para estructurar datos de dominio público, tales como nombres de calles, colonias, referencias geográficas y números exteriores. Queda estrictamente prohibido el ingreso de información sensible o patrimonial en los campos de base de datos compartida. Las referencias a inmuebles específicos (ej. "no visitar") deben limitarse a descripciones logísticas sin identificar personalmente a los residentes.
              </p>

              <p>
                <strong>3. Almacenamiento Local (Sección Revisitas):</strong> PredicaMap ofrece una función de libreta digital ("Revisitas"). Toda la información ingresada en esta sección (que puede incluir nombres de pila, notas de conversaciones o recordatorios) <strong>no se transmite, no se sincroniza y no se almacena en nuestros servidores</strong>. Estos datos residen exclusivamente en el almacenamiento local del navegador (Local Storage / IndexedDB) del dispositivo del usuario. PredicaMap se deslinda de cualquier pérdida, filtración o vulneración de estos datos en caso de extravío, robo o vulneración del dispositivo físico del usuario.
              </p>

              <p>
                <strong>4. Deslinde de Responsabilidades:</strong> Al aceptar estos términos, el usuario libera a PredicaMap, a sus desarrolladores y afiliados, de cualquier responsabilidad civil, penal o administrativa derivada de la captura, uso, distribución o filtración de información de terceros ingresada por el usuario en la plataforma. El usuario se compromete a cumplir con las leyes de protección de datos aplicables en su jurisdicción.
              </p>

              <p>
                <strong>5. Modificaciones:</strong> PredicaMap se reserva el derecho de modificar estos términos, notificando a los usuarios mediante un aviso en la aplicación.
              </p>
            </div>
          )}

          {/* Botón para alternar vistas */}
          <div className="mt-4 text-center">
            <button 
              onClick={() => setMostrarCompleto(!mostrarCompleto)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium underline focus:outline-none"
            >
              {mostrarCompleto ? "Ver resumen" : "Seguir leyendo el aviso completo"}
            </button>
          </div>
        </div>

        {/* Footer con acciones */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end rounded-b-xl">
          <button
            onClick={manejarAceptacion}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
          >
            He leído y acepto los términos
          </button>
        </div>

      </div>
    </div>
  );
}