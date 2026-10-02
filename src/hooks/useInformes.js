// src/hooks/useInformes.js
import { useState, useEffect, useRef } from 'react';
import localforage from 'localforage';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const useInformes = () => {
  const [informes, setInformes] = useState([]);
  const [tituloMes, setTituloMes] = useState('');
  
  const formularioRef = useRef(null);

  const [alertaEliminar, setAlertaEliminar] = useState(null);
  const [alertaHoras, setAlertaHoras] = useState(false);
  const [alertaReiniciar, setAlertaReiniciar] = useState(false); // NUEVO
  const [horasTemporales, setHorasTemporales] = useState('');

  const [editandoId, setEditandoId] = useState(null);
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('Publicador');
  const [metaAuxiliar, setMetaAuxiliar] = useState('15');
  const [metaRegular, setMetaRegular] = useState('50');
  const [metaManual, setMetaManual] = useState('');
  const [participo, setParticipo] = useState(true);
  const [horas, setHoras] = useState('');
  const [tieneEstudios, setTieneEstudios] = useState(false);
  const [cantidadEstudios, setCantidadEstudios] = useState('');

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

  const validarNumero = (valor) => valor.replace(/[^0-9]/g, '');

  const bloquearTeclasInvalidas = (e) => {
    if (['-', 'e', 'E', '+', '.', ','].includes(e.key)) {
      e.preventDefault();
    }
  };

  const limpiarFormulario = () => {
    setEditandoId(null);
    setNombre('');
    setTipo('Publicador');
    setMetaAuxiliar('15');
    setMetaRegular('50');
    setMetaManual('');
    setHoras('');
    setCantidadEstudios('');
    setTieneEstudios(false);
    setParticipo(true);
  };

  const manejarGuardar = async (ignorarAlertaHoras = false, horasDesdeAlerta = null) => {
    if (!nombre.trim()) return;

    const horasFinales = horasDesdeAlerta !== null ? horasDesdeAlerta : horas;
    const horasNum = parseInt(horasFinales) || 0;

    if (!ignorarAlertaHoras && tipo !== 'Publicador' && (!horasFinales || horasNum === 0)) {
      setHorasTemporales(horasFinales);
      setAlertaHoras(true);
      return;
    }

    let metaAGuardar = 'N/A';
    if (tipo === 'Precursor Auxiliar') {
      metaAGuardar = metaAuxiliar === 'Manual' ? metaManual : metaAuxiliar;
    } else if (tipo === 'Precursor Regular') {
      metaAGuardar = metaRegular === 'Manual' ? metaManual : metaRegular;
    }

    const participoReal = tipo === 'Publicador' ? participo : (horasNum > 0);

    const datosInforme = {
      nombre: nombre.trim(),
      tipo,
      meta: metaAGuardar,
      horas: tipo !== 'Publicador' ? horasFinales : 'N/A',
      participo: participoReal,
      estudios: tieneEstudios ? cantidadEstudios || 1 : 0,
      fecha: new Date().toLocaleDateString()
    };

    let nuevosInformes;
    if (editandoId) {
      nuevosInformes = informes.map(i => i.id === editandoId ? { ...i, ...datosInforme } : i);
    } else {
      nuevosInformes = [{ id: Date.now(), ...datosInforme }, ...informes];
    }

    setInformes(nuevosInformes);
    await localforage.setItem('pm_informes_servicio', nuevosInformes);

    setAlertaHoras(false);
    limpiarFormulario();
  };

  const cargarParaEditar = (inf) => {
    setEditandoId(inf.id);
    setNombre(inf.nombre);
    setTipo(inf.tipo);
    if (inf.tipo === 'Precursor Auxiliar') {
      if (['15', '30'].includes(inf.meta)) {
        setMetaAuxiliar(inf.meta);
        setMetaManual('');
      } else {
        setMetaAuxiliar('Manual');
        setMetaManual(inf.meta);
      }
    } else if (inf.tipo === 'Precursor Regular') {
      if (['50'].includes(inf.meta)) {
        setMetaRegular(inf.meta);
        setMetaManual('');
      } else {
        setMetaRegular('Manual');
        setMetaManual(inf.meta);
      }
    }
    setHoras(inf.horas === 'N/A' ? '' : inf.horas);
    setParticipo(inf.participo);
    setTieneEstudios(inf.estudios > 0);
    setCantidadEstudios(inf.estudios > 0 ? inf.estudios : '');

    setTimeout(() => {
      formularioRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const confirmarEliminarDefinitivo = async () => {
    if (alertaEliminar) {
      const nuevos = informes.filter(i => i.id !== alertaEliminar);
      setInformes(nuevos);
      await localforage.setItem('pm_informes_servicio', nuevos);
      setAlertaEliminar(null);
      limpiarFormulario();
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

  // NUEVO: Preparar para el siguiente mes (Poner horas y estudios en cero)
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

  // NUEVO: Exportar Backup JSON
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

  // NUEVO: Importar Backup JSON
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
    event.target.value = null; // Reset input
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

  const exportarExcel = async () => {
    const stats = procesarDatos();
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Informes');

    sheet.getCell('A1').value = tituloMes || 'Informes de Servicio';
    sheet.getCell('A1').font = { size: 16, bold: true, color: { argb: 'FF4338CA' } };
    sheet.mergeCells('A1:F1');

    sheet.getCell('A3').value = 'Total de la Congregación';
    sheet.getCell('A3').font = { bold: true };
    sheet.getCell('A4').value = 'Publicadores listados:'; sheet.getCell('B4').value = stats.informesProcesados.length;
    sheet.getCell('A5').value = 'Participaron:'; sheet.getCell('B5').value = stats.participaron;
    sheet.getCell('A6').value = 'No Participaron:'; sheet.getCell('B6').value = stats.noParticiparon;
    sheet.getCell('B6').font = { color: { argb: 'FFE11D48' }, bold: true };
    sheet.getCell('A7').value = 'Total Horas:'; sheet.getCell('B7').value = stats.totalHoras;
    sheet.getCell('A8').value = 'Total Estudios:'; sheet.getCell('B8').value = stats.totalEstudios;

    sheet.getCell('D3').value = 'Precursores';
    sheet.getCell('D3').font = { bold: true };
    sheet.getCell('D4').value = 'Regulares (PR):'; sheet.getCell('E4').value = stats.prCount;
    sheet.getCell('D5').value = 'Horas PR:'; sheet.getCell('E5').value = stats.prHoras;
    sheet.getCell('D6').value = 'Estudios PR:'; sheet.getCell('E6').value = stats.prEstudios;
    sheet.getCell('D7').value = 'Auxiliares (PA):'; sheet.getCell('E7').value = stats.paCount;
    sheet.getCell('D8').value = 'Horas PA:'; sheet.getCell('E8').value = stats.paHoras;
    sheet.getCell('D9').value = 'Estudios PA:'; sheet.getCell('E9').value = stats.paEstudios;
    sheet.getCell('D10').value = 'Total Horas (PR+PA):'; sheet.getCell('E10').value = stats.totalHorasPrecursores;
    sheet.getCell('E10').font = { bold: true };

    sheet.getCell('G3').value = 'Publicadores';
    sheet.getCell('G3').font = { bold: true };
    sheet.getCell('G4').value = 'Publicadores:'; sheet.getCell('H4').value = stats.pubCount;
    sheet.getCell('G5').value = 'Estudios Pub:'; sheet.getCell('H5').value = stats.pubEstudios;

    sheet.getRow(12).values = ['Nombre', 'Tipo', 'Meta (Hrs)', 'Horas', 'Participó', 'Estudios'];
    sheet.getRow(12).font = { bold: true };
    sheet.getRow(12).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };

    let currentRow = 13;
    stats.informesProcesados.forEach(i => {
      const row = sheet.getRow(currentRow);
      row.values = [i.nombre, i.tipoCorto, i.meta, i.horas, i.participoReal ? 'Sí' : 'No', i.estudios];

      if (!i.participoReal) {
        row.eachCell(cell => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
          cell.font = { color: { argb: 'FFE11D48' }, bold: true };
        });
      }

      const tipoCell = row.getCell(2);
      if (i.tipoCorto === 'REGULAR') {
        tipoCell.font = { color: { argb: 'FFA16207' }, bold: true };
      } else if (i.tipoCorto === 'AUXILIAR') {
        tipoCell.font = { color: { argb: 'FF475569' }, bold: true };
      }

      currentRow++;
    });

    sheet.columns.forEach(col => { col.width = 16; });
    sheet.getColumn(1).width = 35; 

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `${tituloMes || 'Informes_Servicio'}.xlsx`);
  };

  const exportarPDF = () => {
    const stats = procesarDatos();
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(67, 56, 202); 
    doc.setFont("helvetica", "bold");
    doc.text(tituloMes || 'Informes de Servicio', 14, 20);

    const drawBox = (x, y, w, h, title) => {
      doc.setDrawColor(203, 213, 225); 
      doc.setFillColor(248, 250, 252); 
      doc.roundedRect(x, y, w, h, 2, 2, 'FD');
      
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.text(title, x + 4, y + 7);
      
      doc.setDrawColor(226, 232, 240);
      doc.line(x + 4, y + 9, x + w - 4, y + 9);
    };

    const drawLine = (label, value, x, y, valColor = [15, 23, 42]) => {
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text(label, x + 4, y);
      
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...valColor);
      doc.text(`${value}`, x + 54, y, { align: 'right' });
    };

    drawBox(14, 28, 58, 38, "Total Congregación");
    drawLine("Publicadores listados:", stats.informesProcesados.length, 14, 42);
    drawLine("Participaron:", stats.participaron, 14, 47);
    drawLine("No Participaron:", stats.noParticiparon, 14, 52, [225, 29, 72]); 
    drawLine("Total Horas:", stats.totalHoras, 14, 57);
    drawLine("Total Estudios:", stats.totalEstudios, 14, 62);

    drawBox(76, 28, 58, 48, "Precursores");
    drawLine("Regulares (PR):", stats.prCount, 76, 42);
    drawLine("Horas PR:", stats.prHoras, 76, 47);
    drawLine("Estudios PR:", stats.prEstudios, 76, 52);
    drawLine("Auxiliares (PA):", stats.paCount, 76, 59);
    drawLine("Horas PA:", stats.paHoras, 76, 64);
    drawLine("Estudios PA:", stats.paEstudios, 76, 69);
    drawLine("Total Horas (PR+PA):", stats.totalHorasPrecursores, 76, 74, [67, 56, 202]);

    drawBox(138, 28, 58, 23, "Publicadores");
    drawLine("Publicadores:", stats.pubCount, 138, 42);
    drawLine("Estudios Pub:", stats.pubEstudios, 138, 47);

    const tableData = stats.informesProcesados.map(i => [
      i.nombre,
      i.tipoCorto,
      i.meta,
      i.horas,
      i.participoReal ? 'Sí' : 'No',
      i.estudios
    ]);

    autoTable(doc, {
      startY: 85,
      head: [['Nombre', 'Tipo', 'Meta (Hrs)', 'Horas', 'Participó', 'Estudios']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3, valign: 'middle' },
      didParseCell: function(data) {
        const rowData = stats.informesProcesados[data.row.index];
        if (!rowData) return;

        if (!rowData.participoReal && data.section === 'body') {
          data.cell.styles.fillColor = [254, 242, 242]; 
          data.cell.styles.textColor = [225, 29, 72]; 
          data.cell.styles.fontStyle = 'bold';
        }

        if (data.column.index === 1 && data.section === 'body') {
          if (rowData.tipoCorto === 'REGULAR') {
            data.cell.styles.textColor = [161, 98, 7]; 
            data.cell.styles.fontStyle = 'bold';
          } else if (rowData.tipoCorto === 'AUXILIAR') {
            data.cell.styles.textColor = [71, 85, 105]; 
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
      didDrawCell: function(data) {
        const rowData = stats.informesProcesados[data.row.index];
        if (!rowData) return;
        
        if (data.column.index === 1 && data.section === 'body') {
          if (rowData.tipoCorto === 'REGULAR') {
            doc.setDrawColor(234, 179, 8); 
            doc.setLineWidth(0.3);
            doc.roundedRect(data.cell.x + 2, data.cell.y + 1.5, doc.getTextWidth('REGULAR') + 2, data.cell.height - 3, 1, 1);
          } else if (rowData.tipoCorto === 'AUXILIAR') {
            doc.setDrawColor(148, 163, 184); 
            doc.setLineWidth(0.3);
            doc.roundedRect(data.cell.x + 2, data.cell.y + 1.5, doc.getTextWidth('AUXILIAR') + 2, data.cell.height - 3, 1, 1);
          }
        }
      }
    });

    doc.save(`${tituloMes || 'Informes_Servicio'}.pdf`);
  };

  return {
    informes, tituloMes, formularioRef, alertaEliminar, alertaHoras, horasTemporales,
    alertaReiniciar, setAlertaReiniciar, // NUEVOS
    editandoId, nombre, tipo, metaAuxiliar, metaRegular, metaManual, participo,
    horas, tieneEstudios, cantidadEstudios,
    setAlertaEliminar, setAlertaHoras, setHorasTemporales, setNombre, setTipo,
    setMetaAuxiliar, setMetaRegular, setMetaManual, setParticipo, setHoras,
    setTieneEstudios, setCantidadEstudios,
    manejarCambioTitulo, validarNumero, bloquearTeclasInvalidas, limpiarFormulario,
    manejarGuardar, cargarParaEditar, confirmarEliminarDefinitivo, moverArriba,
    moverAbajo, exportarExcel, exportarPDF,
    prepararNuevoMes, exportarBackup, importarBackup // NUEVOS
  };
};