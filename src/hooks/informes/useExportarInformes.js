// src/hooks/informes/useExportarInformes.js
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const useExportarInformes = () => {
  const exportarExcel = async (stats, tituloMes) => {
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

  const exportarPDF = (stats, tituloMes) => {
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

  return { exportarExcel, exportarPDF };
};