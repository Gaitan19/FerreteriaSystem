import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Helper function to format date and time for filenames
export const getFormattedDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
};

// Generic PDF export function
export const exportToPDF = (data, columns, filename, analytics = null) => {
  const doc = new jsPDF();
  const dateTime = getFormattedDateTime();
  const finalFilename = `${filename}_${dateTime}.pdf`;
  
  // Add title
  doc.setFontSize(16);
  doc.text(filename.replace('_', ' '), 14, 20);
  
  // Add export date
  doc.setFontSize(10);
  doc.text(`Exportado el: ${new Date().toLocaleString('es-ES')}`, 14, 30);
  
  // Create table using autoTable function
  doc.autoTable({
    head: [columns.map(col => col.header)],
    body: data.map(row => columns.map(col => col.accessor(row))),
    startY: 40,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [78, 115, 223] }, // #4e73df
  });
  
  // Add analytics text if provided
  if (analytics && analytics.length > 0) {
    let yPosition = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    
    analytics.forEach((line, index) => {
      doc.text(line, 14, yPosition + (index * 8));
    });
  }
  
  // Save the PDF
  doc.save(finalFilename);
};

// Generic Excel export function  
export const exportToExcel = (data, filename, analytics = null) => {
  const dateTime = getFormattedDateTime();
  const finalFilename = `${filename}_${dateTime}.xlsx`;
  
  // Create worksheet from data
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Add analytics if provided
  if (analytics && analytics.length > 0) {
    // Find the last row with data
    const range = XLSX.utils.decode_range(ws['!ref']);
    let lastRow = range.e.r + 2; // Add some space after the table
    
    // Add analytics lines
    analytics.forEach((line, index) => {
      const cellAddress = XLSX.utils.encode_cell({ r: lastRow + index, c: 0 });
      ws[cellAddress] = { v: line, t: 's' };
    });
    
    // Update the worksheet range
    const newRange = XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: lastRow + analytics.length - 1, c: range.e.c }
    });
    ws['!ref'] = newRange;
  }
  
  const wb = XLSX.utils.book_new();
  // Truncate sheet name to 31 characters maximum (Excel limit)
  const sheetName = filename.length > 31 ? filename.substring(0, 31) : filename;
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, finalFilename);
};

// Generic search filter function
export const applySearchFilter = (data, searchTerm, searchFields) => {
  if (!searchTerm || searchTerm === "") {
    return data;
  }
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  return data.filter((item) => {
    return searchFields.some(field => {
      const value = field.accessor(item);
      return value && value.toString().toLowerCase().includes(lowerSearchTerm);
    });
  });
};

// Helper function to find the date with the most sales
export const findDateWithMostSales = (salesData) => {
  if (!salesData || salesData.length === 0) return null;
  
  const maxSale = salesData.reduce((max, current) => {
    const currentTotal = parseInt(current.total) || 0;
    const maxTotal = parseInt(max.total) || 0;
    return currentTotal > maxTotal ? current : max;
  });
  
  return {
    fecha: maxSale.fecha,
    cantidad: maxSale.total
  };
};

// Helper function to find the most/least sold product
export const findProductExtreme = (productsData, isMaximum = true) => {
  if (!productsData || productsData.length === 0) return null;
  
  const extreme = productsData.reduce((current, item) => {
    const itemTotal = parseInt(item.total) || 0;
    const currentTotal = parseInt(current.total) || 0;
    
    if (isMaximum) {
      return itemTotal > currentTotal ? item : current;
    } else {
      return itemTotal < currentTotal ? item : current;
    }
  });
  
  return {
    producto: extreme.producto,
    cantidad: extreme.total
  };
};