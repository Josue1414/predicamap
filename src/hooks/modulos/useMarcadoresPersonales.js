// src/hooks/modulos/useMarcadoresPersonales.js
import { useState, useEffect } from 'react';
import { useAlertas } from '../../context/ContextoAlertas'; // ★ Importamos el hook de alertas

// Generador de ID único para cada pin
const generarIdUnico = () => `pin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export default function useMarcadoresPersonales() {
  const [marcadores, setMarcadores] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // ★ Extraemos las funciones de alerta
  const { mostrarAlerta, mostrarConfirmacion } = useAlertas();

  // 1. CARGAR DATOS AL INICIAR
  useEffect(() => {
    const datosGuardados = localStorage.getItem('predicamap_marcadores_personales');
    if (datosGuardados) {
      try {
        setMarcadores(JSON.parse(datosGuardados));
      } catch (error) {
        console.error("Error al leer los marcadores personales", error);
      }
    }
    setCargando(false);
  }, []);

  // 2. GUARDAR DATOS EN EL CELULAR
  useEffect(() => {
    if (!cargando) {
      localStorage.setItem('predicamap_marcadores_personales', JSON.stringify(marcadores));
    }
  }, [marcadores, cargando]);

  // 3. FUNCIONES CRUD
  const agregarMarcador = (lat, lng, titulo, fechaProgramada, notas = '') => {
    const nuevoMarcador = {
      id: generarIdUnico(),
      lat,
      lng,
      titulo,
      fechaProgramada,
      notas,
      fechaAlta: new Date().toISOString()
    };
    setMarcadores(prev => [...prev, nuevoMarcador]);
  };

  const editarMarcador = (id, nuevosDatos) => {
    setMarcadores(prev => prev.map(m => m.id === id ? { ...m, ...nuevosDatos } : m));
  };

  const eliminarMarcador = async (id) => {
    // ★ Alerta personalizada
    const confirmado = await mostrarConfirmacion(
      "Eliminar Revisita",
      "¿Estás seguro de eliminar esta revisita?",
      "danger",
      "Sí, eliminar"
    );
    
    if (confirmado) {
      setMarcadores(prev => prev.filter(m => m.id !== id));
    }
  };

  // 4. SISTEMA DE BACKUP (EXPORTAR)
  const exportarBackup = () => {
    if (marcadores.length === 0) {
      mostrarAlerta("Sin datos", "No tienes revisitas para exportar.", "info");
      return;
    }
    
    const datos = JSON.stringify(marcadores, null, 2);
    const blob = new Blob([datos], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mis_Revisitas_PredicaMap_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 5. SISTEMA DE RESTAURACIÓN (IMPORTAR)
  const importarBackup = (evento) => {
    const archivo = evento.target.files[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = async (e) => {
      try {
        const datosImportados = JSON.parse(e.target.result);
        if (Array.isArray(datosImportados)) {
          
          // ★ Confirmación moderna
          const confirmado = await mostrarConfirmacion(
            "Importar Revisitas",
            `Se encontraron ${datosImportados.length} revisitas en el archivo. ¿Deseas agregarlas a tu mapa?`,
            "info",
            "Aceptar"
          );

          if (confirmado) {
            setMarcadores(prev => {
              const nuevos = datosImportados.filter(imp => !prev.some(p => p.id === imp.id));
              return [...prev, ...nuevos];
            });
            mostrarAlerta("Éxito", "Revisitas recuperadas con éxito.", "success");
          }
        } else {
          mostrarAlerta("Error", "El archivo no tiene un formato válido.", "danger");
        }
      } catch (error) {
        mostrarAlerta("Error", "Error al leer el archivo. Asegúrate de que sea el correcto.", "danger");
      }
    };
    lector.readAsText(archivo);
    evento.target.value = null; 
  };

  // 6. COMPARTIR UNA REVISITA POR WHATSAPP
  const compartirMarcador = (marcador) => {
    const urlMapa = `https://www.google.com/maps?q=${marcador.lat},${marcador.lng}`;
    const texto = `Hola, te comparto esta revisita de PredicaMap:\n\n*${marcador.titulo}*\n📅 ${marcador.fechaProgramada ? 'Visitar el: ' + marcador.fechaProgramada : 'Sin fecha específica'}\n📝 ${marcador.notas || 'Sin notas'}\n📍 Ubicación: ${urlMapa}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`, '_blank');
  };

  return {
    marcadores,
    agregarMarcador,
    editarMarcador,
    eliminarMarcador,
    exportarBackup,
    importarBackup,
    compartirMarcador
  };
}