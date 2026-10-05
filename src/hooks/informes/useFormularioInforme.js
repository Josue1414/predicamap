// src/hooks/informes/useFormularioInforme.js
import { useState } from 'react';

export const useFormularioInforme = (informeInicial = null) => {
  const [nombre, setNombre] = useState(informeInicial?.nombre || '');
  const [tipo, setTipo] = useState(informeInicial?.tipo || 'Publicador');
  const [metaAuxiliar, setMetaAuxiliar] = useState('15');
  const [metaRegular, setMetaRegular] = useState('50');
  const [metaManual, setMetaManual] = useState('');
  const [participo, setParticipo] = useState(informeInicial?.participo ?? true);
  const [horas, setHoras] = useState(informeInicial && informeInicial.horas !== 'N/A' ? informeInicial.horas : '');
  const [tieneEstudios, setTieneEstudios] = useState((informeInicial?.estudios || 0) > 0);
  const [cantidadEstudios, setCantidadEstudios] = useState((informeInicial?.estudios || 0) > 0 ? informeInicial.estudios : '');
  
  // NUEVO ESTADO PARA CELULAR
  const [celular, setCelular] = useState(informeInicial?.celular || '');

  const validarNumero = (valor) => valor.replace(/[^0-9]/g, '');

  const bloquearTeclasInvalidas = (e) => {
    if (['-', 'e', 'E', '+', '.', ','].includes(e.key)) {
      e.preventDefault();
    }
  };

  // Inicializa las metas correctas si es un informe existente
  useState(() => {
    if (informeInicial) {
      if (informeInicial.tipo === 'Precursor Auxiliar') {
        if (['15', '30'].includes(informeInicial.meta)) {
          setMetaAuxiliar(informeInicial.meta);
        } else {
          setMetaAuxiliar('Manual');
          setMetaManual(informeInicial.meta);
        }
      } else if (informeInicial.tipo === 'Precursor Regular') {
        if (['50'].includes(informeInicial.meta)) {
          setMetaRegular(informeInicial.meta);
        } else {
          setMetaRegular('Manual');
          setMetaManual(informeInicial.meta);
        }
      }
    }
  });

  const limpiarFormulario = () => {
    setNombre('');
    setTipo('Publicador');
    setMetaAuxiliar('15');
    setMetaRegular('50');
    setMetaManual('');
    setHoras('');
    setCantidadEstudios('');
    setTieneEstudios(false);
    setParticipo(true);
    setCelular('');
  };

  const compilarDatos = (horasFinales = horas) => {
    let metaAGuardar = 'N/A';
    if (tipo === 'Precursor Auxiliar') {
      metaAGuardar = metaAuxiliar === 'Manual' ? metaManual : metaAuxiliar;
    } else if (tipo === 'Precursor Regular') {
      metaAGuardar = metaRegular === 'Manual' ? metaManual : metaRegular;
    }

    const horasNum = parseInt(horasFinales) || 0;
    const participoReal = tipo === 'Publicador' ? participo : (horasNum > 0);

    return {
      nombre: nombre.trim(),
      tipo,
      meta: metaAGuardar,
      horas: tipo !== 'Publicador' ? horasFinales : 'N/A',
      participo: participoReal,
      estudios: tieneEstudios ? cantidadEstudios || 1 : 0,
      celular: celular,
      fecha: informeInicial?.fecha || new Date().toLocaleDateString()
    };
  };

  return {
    nombre, tipo, metaAuxiliar, metaRegular, metaManual, participo,
    horas, tieneEstudios, cantidadEstudios, celular,
    setNombre, setTipo, setMetaAuxiliar, setMetaRegular, setMetaManual,
    setParticipo, setHoras, setTieneEstudios, setCantidadEstudios, setCelular,
    validarNumero, bloquearTeclasInvalidas, limpiarFormulario, compilarDatos
  };
};