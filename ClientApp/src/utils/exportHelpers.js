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
export const exportToPDF = (data, columns, filename) => {
  const doc = new jsPDF();
  const dateTime = getFormattedDateTime();
  const finalFilename = `${filename}_${dateTime}.pdf`;
  
  // Add title
  doc.setFontSize(16);
  doc.text(filename.replace('_', ' '), 14, 20);
  
  // Add export date
  doc.setFontSize(10);
  doc.text(`Exportado el: ${new Date().toLocaleString('es-ES')}`, 14, 30);
  
  // Create table
  doc.autoTable({
    head: [columns.map(col => col.header)],
    body: data.map(row => columns.map(col => col.accessor(row))),
    startY: 40,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [78, 115, 223] }, // #4e73df
  });
  
  // Save the PDF
  doc.save(finalFilename);
};

// Generic Excel export function  
export const exportToExcel = (data, filename) => {
  const dateTime = getFormattedDateTime();
  const finalFilename = `${filename}_${dateTime}.xlsx`;
  
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, filename);
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