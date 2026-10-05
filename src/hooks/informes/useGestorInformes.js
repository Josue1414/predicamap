// src/hooks/informes/useGestorInformes.js
import { useState, useEffect } from 'react';
import localforage from 'localforage';

export const useGestorInformes = () => {
  const [informes, setInformes] = useState([]);
  const [tituloMes, setTituloMes] = useState('');

  const [alertaEliminar, setAlertaEliminar] = useState(null);
  const [alertaHoras, setAlertaHoras] = useState(false);
  const [alertaReiniciar, setAlertaReiniciar] = useState(false);
  const [alertaExitoGuardado, setAlertaExitoGuardado] = useState(false); // Para mostrar la "palomita"
  
  // Datos temporales para la alerta de horas
  const [horasTemporales, setHorasTemporales] = useState('');
  const [datosPendientesGuardar, setDatosPendientesGuardar] = useState(null);

  useEffect(() => {
    localforage.getItem('pm_informes_servicio').then(data => {
      if (data) setInformes(data);
    });
    localforage.getItem('pm_informes_titulo').then(data => {
      if (data) setTituloMes(data);
    });
  }, []);

  const manejarCambioTitulo = (e) => {
    const nuevoTitulo = e.target.value;
    setTituloMes(nuevoTitulo);
    localforage.setItem('pm_informes_titulo', nuevoTitulo);
  };

  const procesarDatos = () => {
    let totalHoras = 0, totalEstudios = 0, participaron = 0;
    let prCount = 0, prHoras = 0, prEstudios = 0;
    let paCount = 0, paHoras = 0, paEstudios = 0;
    let pubCount = 0, pubEstudios = 0;

    const informesProcesados = informes.map(i => {
      const horasNum = (i.horas === 'N/A' || !i.horas) ? 0 : parseInt(i.horas, 10);
      const participoReal = i.tipo === 'Publicador' ? i.participo : (horasNum > 0);
      const estudios = parseInt(i.estudios || 0, 10);

      totalHoras += horasNum;
      totalEstudios += estudios;
      if (participoReal) participaron++;

      let tipoCorto = i.tipo;
      if (i.tipo === 'Precursor Regular') {
        prCount++; prHoras += horasNum; prEstudios += estudios;
        tipoCorto = 'REGULAR';
      } else if (i.tipo === 'Precursor Auxiliar') {
        paCount++; paHoras += horasNum; paEstudios += estudios;
        tipoCorto = 'AUXILIAR';
      } else {
        pubCount++; pubEstudios += estudios;
      }

      return { ...i, horasNum, participoReal, tipoCorto, estudios };
    });

    return {
      informesProcesados,
      totalHoras, totalEstudios, participaron, noParticiparon: informes.length - participaron,
      prCount, prHoras, prEstudios,
      paCount, paHoras, paEstudios,
      pubCount, pubEstudios,
      totalHorasPrecursores: prHoras + paHoras
    };
  };

  // Función interna para el guardado real
  const realizarGuardado = async (datosInforme, editandoId) => {
    let nuevosInformes;
    if (editandoId) {
      nuevosInformes = informes.map(i => i.id === editandoId ? { ...i, ...datosInforme } : i);
    } else {
      nuevosInformes = [{ id: Date.now(), ...datosInforme }, ...informes];
    }

    setInformes(nuevosInformes);
    await localforage.setItem('pm_informes_servicio', nuevosInformes);

    setAlertaExitoGuardado(true);
    setTimeout(() => setAlertaExitoGuardado(false), 2000);
  };

  const confirmarEliminarDefinitivo = async () => {
    if (alertaEliminar) {
      const nuevos = informes.filter(i => i.id !== alertaEliminar);
      setInformes(nuevos);
      await localforage.setItem('pm_informes_servicio', nuevos);
      setAlertaEliminar(null);
    }
  };

  const moverArriba = async (index) => {
    if (index === 0) return;
    const nuevos = [...informes];
    const temp = nuevos[index];
    nuevos[index] = nuevos[index - 1];
    nuevos[index - 1] = temp;
    setInformes(nuevos);
    await localforage.setItem('pm_informes_servicio', nuevos);
  };

  const moverAbajo = async (index) => {
    if (index === informes.length - 1) return;
    const nuevos = [...informes];
    const temp = nuevos[index];
    nuevos[index] = nuevos[index + 1];
    nuevos[index + 1] = temp;
    setInformes(nuevos);
    await localforage.setItem('pm_informes_servicio', nuevos);
  };

  const prepararNuevoMes = async () => {
    const nuevosInformes = informes.map(i => ({
      ...i,
      horas: i.tipo !== 'Publicador' ? '' : 'N/A',
      participo: false,
      estudios: 0
    }));
    setInformes(nuevosInformes);
    await localforage.setItem('pm_informes_servicio', nuevosInformes);
    setAlertaReiniciar(false);
  };

  const exportarBackup = () => {
    const dataStr = JSON.stringify(informes);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_Publicadores_${new Date().toLocaleDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importarBackup = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (Array.isArray(data)) {
          setInformes(data);
          await localforage.setItem('pm_informes_servicio', data);
        }
      } catch (err) {
        console.error("Error al leer el archivo de backup.");
      }
    };
    reader.readAsText(file);
    event.target.value = null; 
  };

  return {
    informes, tituloMes, alertaEliminar, alertaHoras, horasTemporales,
    alertaReiniciar, alertaExitoGuardado, datosPendientesGuardar,
    setAlertaEliminar, setAlertaHoras, setHorasTemporales, setAlertaReiniciar, setDatosPendientesGuardar,
    manejarCambioTitulo, confirmarEliminarDefinitivo, moverArriba, moverAbajo,
    prepararNuevoMes, exportarBackup, importarBackup, procesarDatos, realizarGuardado
  };
};