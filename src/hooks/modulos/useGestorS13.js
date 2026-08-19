import { useState } from 'react';
import { supabase } from '../../utilidades/clienteSupabase';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 

export default function useGestorS13(congregacionId) {
  const [cargando, setCargando] = useState(false);

  const obtenerFechaLocal = () => {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // REGISTRO AUTOMÁTICO
  const registrarAsignacionS13 = async (seccionId, nombreTerritorio, asignadoA) => {
    if (!congregacionId || !asignadoA) return;
    const fechaHoy = obtenerFechaLocal();
    const hace24Meses = new Date();
    hace24Meses.setMonth(hace24Meses.getMonth() - 24);
    
    await supabase.from('historial_s13').delete().lt('creado_en', hace24Meses.toISOString());
    await supabase.from('historial_s13').insert([{
      congregacion_id: congregacionId, seccion_id: seccionId,
      nombre_territorio: nombreTerritorio, asignado_a: asignadoA, fecha_asignacion: fechaHoy
    }]);
  };

  const registrarCompletadoS13 = async (seccionId) => {
    if (!congregacionId) return;
    const fechaHoy = obtenerFechaLocal();
    
    const { data } = await supabase.from('historial_s13')
      .select('id').eq('seccion_id', seccionId).is('fecha_completado', null)
      .order('creado_en', { ascending: false }).limit(1);

    if (data && data.length > 0) {
      await supabase.from('historial_s13').update({ fecha_completado: fechaHoy }).eq('id', data[0].id);
    } else {
      const { data: secInfo } = await supabase.from('secciones').select('nombre').eq('id', seccionId).single();
      await supabase.from('historial_s13').insert([{
        congregacion_id: congregacionId,
        seccion_id: seccionId,
        nombre_territorio: secInfo?.nombre || 'Territorio',
        asignado_a: 'Sin asignar',
        fecha_asignacion: fechaHoy,
        fecha_completado: fechaHoy
      }]);
    }
  };

  // LECTURA Y GUARDADO MANUAL
  const cargarHistorialManual = async () => {
    const { data } = await supabase.from('historial_s13_manual')
      .select('*').eq('congregacion_id', congregacionId).order('orden', { ascending: true });
    
    const titulo = data && data.length > 0 ? (data[0].titulo_reporte || '') : '';
    return { registros: data || [], titulo };
  };

  const guardarHistorialManualBD = async (registrosNuevos, titulo) => {
    setCargando(true);
    try {
      await supabase.from('historial_s13_manual').delete().eq('congregacion_id', congregacionId);
      if (registrosNuevos.length > 0) {
        await supabase.from('historial_s13_manual').insert(registrosNuevos.map((reg, index) => ({
          ...reg, congregacion_id: congregacionId, orden: index, titulo_reporte: titulo
        })));
      } else if (titulo) {
        await supabase.from('historial_s13_manual').insert([{
           congregacion_id: congregacionId, orden: 0, titulo_reporte: titulo
        }]);
      }
      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      setCargando(false);
    }
  };

  const limpiarHistorialManualBD = async () => {
    setCargando(true);
    try {
      await supabase.from('historial_s13_manual').delete().eq('congregacion_id', congregacionId);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      setCargando(false);
    }
  };

  // ESTRUCTURADOR DE DATOS UNIFICADO Y ROBUSTO
  const obtenerDatosEstructurados = async (fechaInicio, fechaFin, territoriosGuardados, origen = 'automatico') => {
    let registros = [];
    let tituloManual = '';
    
    if (origen === 'automatico') {
      // Consultamos tanto la tabla dedicada S-13 como los logs históricos para asegurar el 100% de cobertura
      const { data: dataS13 } = await supabase.from('historial_s13')
        .select('*').eq('congregacion_id', congregacionId);
      
      const { data: dataLogs } = await supabase.from('logs_actividad')
        .select('*').eq('congregacion_id', congregacionId).eq('accion', 'Territorio Completado');

      // Unificamos registros de S-13
      registros = dataS13 || [];

      // Si hay completados en logs que no están en S-13, los integramos al vuelo
      dataLogs?.forEach(log => {
        const fechaLog = log.creado_en.split('T')[0];
        if (fechaLog >= fechaInicio && fechaLog <= fechaFin) {
          // Buscamos si ya existe un registro con esa fecha y sección
          const existe = registros.some(r => r.fecha_completado === fechaLog);
          if (!existe) {
            registros.push({
              seccion_id: null, // Se asociará por nombre si es necesario
              nombre_territorio: log.detalles.match(/"([^"]+)"/)?.[1] || 'Territorio',
              asignado_a: 'Completado',
              fecha_asignacion: fechaLog,
              fecha_completado: fechaLog
            });
          }
        }
      });
    } else {
      const res = await cargarHistorialManual();
      registros = res.registros;
      tituloManual = res.titulo;
    }

    const historialPorSeccion = {};
    registros.forEach(reg => {
      // Agrupamos por ID o por nombre de territorio como respaldo
      const clave = reg.seccion_id || reg.nombre_territorio;
      if (!clave) return;
      if (!historialPorSeccion[clave]) historialPorSeccion[clave] = [];
      historialPorSeccion[clave].push(reg);
    });

    const territoriosOrdenados = [...(territoriosGuardados || [])].sort((a, b) => a.orden - b.orden);
    const filasEstructuradas = [];

    territoriosOrdenados.forEach((territorio, index) => {
      // Buscamos por ID de sección o por el nombre exacto
      const asigs = historialPorSeccion[territorio.id] || historialPorSeccion[territorio.nombre] || [];
      
      let ultimaFecha = '';
      if (origen === 'automatico') {
        const completados = asigs.filter(a => a.fecha_completado).map(a => a.fecha_completado).sort();
        ultimaFecha = completados.length > 0 ? completados[completados.length - 1] : '';
      } else {
        const regConFecha = asigs.find(a => a.ultima_fecha_completado);
        ultimaFecha = regConFecha ? regConFecha.ultima_fecha_completado : '';
      }

      const bloques = Math.max(1, Math.ceil(asigs.length / 4));
      
      for (let b = 0; b < bloques; b++) {
        const idx = b * 4;
        filasEstructuradas.push({
          num: b === 0 ? (territorio.nombre || (index + 1).toString()) : '',
          seccion_id: territorio.id,
          ultimaFecha: b === 0 ? ultimaFecha : '',
          asig1: asigs[idx] || null,
          asig2: asigs[idx + 1] || null,
          asig3: asigs[idx + 2] || null,
          asig4: asigs[idx + 3] || null,
        });
      }
    });

    return { filasEstructuradas, tituloManual };
  };

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return '';
    const partes = fechaStr.split('-');
    if (partes.length !== 3) return fechaStr;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  };

  // EXPORTACIÓN EXCEL
  const generarExcelS13 = async (fechaInicio, fechaFin, territoriosGuardados, origen) => {
    setCargando(true);
    try {
      const { filasEstructuradas: datos, tituloManual } = await obtenerDatosEstructurados(fechaInicio, fechaFin, territoriosGuardados, origen);
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('S-13');

      sheet.pageSetup.orientation = 'landscape';
      sheet.pageSetup.fitToPage = true;

      sheet.mergeCells('A1:J1');
      sheet.getCell('A1').value = 'REGISTRO DE ASIGNACIÓN DE TERRITORIO';
      sheet.getCell('A1').font = { size: 16, bold: true };
      sheet.getCell('A1').alignment = { horizontal: 'center' };

      sheet.getCell('A3').value = 'Periodo:';
      const textoPeriodo = origen === 'manual' && tituloManual ? tituloManual : `${formatearFecha(fechaInicio)} al ${formatearFecha(fechaFin)}`;
      sheet.getCell('B3').value = textoPeriodo;
      sheet.getCell('B3').font = { bold: true };

      sheet.columns = [
        { key: 'col1', width: 8 },  
        { key: 'col2', width: 14 }, 
        { key: 'col3', width: 12 }, 
        { key: 'col4', width: 12 }, 
        { key: 'col5', width: 12 }, 
        { key: 'col6', width: 12 }, 
        { key: 'col7', width: 12 }, 
        { key: 'col8', width: 12 }, 
        { key: 'col9', width: 12 }, 
        { key: 'col10', width: 12 } 
      ];

      sheet.getCell('A5').value = 'Núm.\nde terr.';
      sheet.mergeCells('A5:A6');
      sheet.getCell('B5').value = 'Última fecha\nen que se\ncompletó*';
      sheet.mergeCells('B5:B6');

      for (let i = 0; i < 4; i++) {
        const colStart = 3 + (i * 2);
        sheet.getCell(5, colStart).value = 'Asignado a';
        sheet.mergeCells(5, colStart, 5, colStart + 1);
        sheet.getCell(6, colStart).value = 'Fecha en que\nse asignó';
        sheet.getCell(6, colStart + 1).value = 'Fecha en que\nse completó';
      }

      [5, 6].forEach(r => {
        sheet.getRow(r).height = 30;
        sheet.getRow(r).eachCell(cell => {
          cell.font = { bold: true, size: 9 };
          cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          cell.border = { top: { style: 'medium' }, bottom: { style: 'medium' }, left: { style: 'medium' }, right: { style: 'medium' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEAEAEA' } };
        });
      });

      let currentRow = 7;
      datos.forEach(row => {
        const r1 = sheet.getRow(currentRow);
        r1.getCell(1).value = row.num;
        r1.getCell(1).font = { color: { argb: 'FFFF0000' }, bold: true };
        r1.getCell(2).value = formatearFecha(row.ultimaFecha);
        
        [row.asig1, row.asig2, row.asig3, row.asig4].forEach((asig, index) => {
          const colStart = 3 + (index * 2);
          r1.getCell(colStart).value = asig?.asignado_a || '';
          sheet.mergeCells(currentRow, colStart, currentRow, colStart + 1);
        });

        const r2 = sheet.getRow(currentRow + 1);
        [row.asig1, row.asig2, row.asig3, row.asig4].forEach((asig, index) => {
          const colStart = 3 + (index * 2);
          r2.getCell(colStart).value = formatearFecha(asig?.fecha_asignacion);
          r2.getCell(colStart + 1).value = formatearFecha(asig?.fecha_completado);
        });

        sheet.mergeCells(`A${currentRow}:A${currentRow + 1}`);
        sheet.mergeCells(`B${currentRow}:B${currentRow + 1}`);

        [currentRow, currentRow + 1].forEach(r => {
          sheet.getRow(r).eachCell({ includeEmpty: true }, (cell, colNumber) => {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            const isLeftEdge = colNumber === 1 || colNumber === 3 || colNumber === 5 || colNumber === 7 || colNumber === 9;
            const isRightEdge = colNumber === 2 || colNumber === 4 || colNumber === 6 || colNumber === 8 || colNumber === 10;
            cell.border = {
              top: { style: r === currentRow ? 'medium' : 'thin' },
              bottom: { style: r === currentRow + 1 ? 'medium' : 'thin' },
              left: { style: isLeftEdge ? 'medium' : 'thin' },
              right: { style: isRightEdge ? 'medium' : 'thin' }
            };
          });
        });

        currentRow += 2;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `S-13_${origen}_${fechaInicio}_al_${fechaFin}.xlsx`);

    } catch (error) {
      console.error("Error al exportar S-13 Excel:", error);
    } finally {
      setCargando(false);
    }
  };

  // EXPORTACIÓN PDF
  const generarPDFS13 = async (fechaInicio, fechaFin, territoriosGuardados, origen) => {
    setCargando(true);
    try {
      const { filasEstructuradas: datos, tituloManual } = await obtenerDatosEstructurados(fechaInicio, fechaFin, territoriosGuardados, origen);
      const doc = new jsPDF('landscape');
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("REGISTRO DE ASIGNACIÓN DE TERRITORIO", doc.internal.pageSize.width / 2, 15, { align: 'center' });
      
      doc.setFontSize(10);
      const textoPeriodo = origen === 'manual' && tituloManual ? tituloManual : `${formatearFecha(fechaInicio)} al ${formatearFecha(fechaFin)}`;
      doc.text(`Periodo: ${textoPeriodo}`, 14, 25);

      const body = [];
      datos.forEach(row => {
        body.push([
          { content: row.num, rowSpan: 2, styles: { textColor: [225, 29, 72], fontStyle: 'bold', valign: 'middle' } },
          { content: formatearFecha(row.ultimaFecha), rowSpan: 2, styles: { valign: 'middle' } },
          { content: row.asig1?.asignado_a || '', colSpan: 2 },
          { content: row.asig2?.asignado_a || '', colSpan: 2 },
          { content: row.asig3?.asignado_a || '', colSpan: 2 },
          { content: row.asig4?.asignado_a || '', colSpan: 2 },
        ]);
        body.push([
          formatearFecha(row.asig1?.fecha_asignacion), formatearFecha(row.asig1?.fecha_completado),
          formatearFecha(row.asig2?.fecha_asignacion), formatearFecha(row.asig2?.fecha_completado),
          formatearFecha(row.asig3?.fecha_asignacion), formatearFecha(row.asig3?.fecha_completado),
          formatearFecha(row.asig4?.fecha_asignacion), formatearFecha(row.asig4?.fecha_completado),
        ]);
      });

      autoTable(doc, {
        startY: 30,
        theme: 'grid',
        headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.5, halign: 'center', valign: 'middle' },
        bodyStyles: { lineColor: [0, 0, 0], halign: 'center' },
        head: [
          [
            { content: 'Núm.\nde terr.', rowSpan: 2 },
            { content: 'Última fecha\nen que se\ncompletó*', rowSpan: 2 },
            { content: 'Asignado a', colSpan: 2 },
            { content: 'Asignado a', colSpan: 2 },
            { content: 'Asignado a', colSpan: 2 },
            { content: 'Asignado a', colSpan: 2 }
          ],
          [
            'Fecha en que\nse asignó', 'Fecha en que\nse completó',
            'Fecha en que\nse asignó', 'Fecha en que\nse completó',
            'Fecha en que\nse asignó', 'Fecha en que\nse completó',
            'Fecha en que\nse asignó', 'Fecha en que\nse completó'
          ]
        ],
        body: body,
        willDrawCell: function(data) {
          if (data.cell.section === 'body' && data.row.index % 2 === 0) {
            doc.setLineWidth(0.5);
            doc.line(data.cell.x, data.cell.y, data.cell.x + data.cell.width, data.cell.y);
          }
        }
      });

      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.text("*Cuando comience una nueva página, anote en esta columna la última fecha en que los territorios se completaron.", 14, doc.lastAutoTable.finalY + 10);

      doc.save(`S-13_${origen}_${fechaInicio}_al_${fechaFin}.pdf`);
    } catch (error) {
      console.error("Error al exportar S-13 PDF:", error);
    } finally {
      setCargando(false);
    }
  };

  return { registrarAsignacionS13, registrarCompletadoS13, generarExcelS13, generarPDFS13, obtenerDatosEstructurados, formatearFecha, cargarHistorialManual, guardarHistorialManualBD, limpiarHistorialManualBD, cargando };
}