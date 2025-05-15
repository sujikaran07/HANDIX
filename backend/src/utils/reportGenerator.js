const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { formatDate, formatCurrency } = require('./formatters');

/**
 * Generate a PDF report based on the provided data
 * @param {Object} options - Report generation options
 * @returns {string} - Path to generated PDF file
 */
const generatePDFReport = async (options) => {
  const { title, summary, data, type, filters } = options;
  
  // Create a timestamp for unique filenames
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputDir = path.resolve(__dirname, '../../temp');
  
  // Create temp directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputPath = path.resolve(outputDir, `report_${type}_${timestamp}.pdf`);
  
  // Create PDF document with AliExpress styling
  const doc = new PDFDocument({ 
    margin: 50,
    size: 'A4'
  });
  
  // Pipe output to file
  doc.pipe(fs.createWriteStream(outputPath));
  
  // Add header with AliExpress styling
  addHeader(doc, title, filters);
  
  // Add summary section
  addSummary(doc, summary);
  
  // Add data tables
  addDataTable(doc, data);
  
  // Add footer
  addFooter(doc);
  
  // Finalize and end the document
  doc.end();
  
  return outputPath;
};

/**
 * Add header to PDF document
 * @param {PDFDocument} doc - PDF document
 * @param {string} title - Report title
 * @param {Object} filters - Report filters
 */
const addHeader = (doc, title, filters) => {
  // Add logo on left
  try {
    const logoPath = path.resolve(__dirname, '../../public/images/handix_logo.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 45, { width: 60 });
    }
  } catch (e) {
    console.error('Error adding logo:', e);
  }
  
  // Add company name
  doc.fontSize(22).fillColor('#333333').text('HANDIX', 120, 50);
  doc.fontSize(12).fillColor('#666666').text('Authentic Sri Lankan Handicrafts', 120, 75);
  
  // Add a line separator
  doc.moveTo(50, 100).lineTo(550, 100).stroke('#e0e0e0');
  
  // Add report info on right
  doc.fontSize(18).fillColor('#333333').text(title, 50, 120);
  
  // Add date range
  if (filters?.startDate && filters?.endDate) {
    doc.fontSize(10).fillColor('#666666')
      .text(`Period: ${formatDate(filters.startDate)} - ${formatDate(filters.endDate)}`, 50, 145);
  }
  
  // Add generated date
  doc.fontSize(10).fillColor('#666666')
    .text(`Generated on: ${formatDate(new Date(), true)}`, 50, 160);
  
  // Add decorative element
  doc.rect(50, 180, 500, 2).fill('#ff4747');
};

/**
 * Add summary section to PDF document
 * @param {PDFDocument} doc - PDF document
 * @param {Object} summary - Summary data
 */
const addSummary = (doc, summary) => {
  if (!summary || Object.keys(summary).length === 0) return;
  
  // Add summary title
  doc.moveDown(2);
  doc.fontSize(14).fillColor('#333333').text('Summary', { underline: true });
  
  // Add summary items in a grid (2 columns)
  doc.moveDown(1);
  
  const keys = Object.keys(summary);
  const itemsPerRow = 2;
  const rows = Math.ceil(keys.length / itemsPerRow);
  
  for (let i = 0; i < rows; i++) {
    let yPos = doc.y;
    
    for (let j = 0; j < itemsPerRow; j++) {
      const index = i * itemsPerRow + j;
      if (index < keys.length) {
        const key = keys[index];
        const value = summary[key];
        
        // Format the key for display
        const displayKey = key.replace(/([A-Z])/g, ' $1')
          .replace(/^./, (str) => str.toUpperCase());
        
        // Format the value based on key type
        let displayValue;
        if (typeof value === 'number') {
          if (key.toLowerCase().includes('total') || 
              key.toLowerCase().includes('sales') || 
              key.toLowerCase().includes('value') || 
              key.toLowerCase().includes('spent')) {
            displayValue = formatCurrency(value);
          } else {
            displayValue = value.toLocaleString();
          }
        } else {
          displayValue = value;
        }
        
        // Calculate the x position based on column
        const xPos = 50 + (j * 250);
        
        // Add box
        doc.rect(xPos, doc.y, 230, 50)
          .lineWidth(1)
          .stroke('#e0e0e0');
        
        // Add key and value
        doc.fontSize(10).fillColor('#666666')
          .text(displayKey, xPos + 10, doc.y + 10);
        
        doc.fontSize(16).fillColor('#333333')
          .text(displayValue, xPos + 10, doc.y + 25);
      }
    }
    
    // Move down to next row
    doc.moveDown(3);
  }
};

/**
 * Add data table to PDF document
 * @param {PDFDocument} doc - PDF document
 * @param {Array} data - Report data
 */
const addDataTable = (doc, data) => {
  if (!data || data.length === 0) {
    doc.moveDown(1);
    doc.fontSize(12).fillColor('#666666').text('No data available for this report.', {align: 'center'});
    return;
  }
  
  // Add table title
  doc.moveDown(1);
  doc.fontSize(14).fillColor('#333333').text('Detailed Data', { underline: true });
  doc.moveDown(1);
  
  // Get table columns (excluding id)
  const columns = Object.keys(data[0]).filter(key => key !== 'id');
  
  // Calculate column widths
  const pageWidth = 500;
  const columnWidths = {};
  const minColWidth = 60;
  
  // First, set minimum widths for all columns
  columns.forEach(col => {
    columnWidths[col] = minColWidth;
  });
  
  // Then, calculate remaining space and distribute proportionally
  const usedSpace = columns.length * minColWidth;
  const remainingSpace = pageWidth - usedSpace;
  
  if (remainingSpace > 0) {
    // Estimate content length in each column
    const contentLengths = {};
    columns.forEach(col => {
      contentLengths[col] = Math.max(
        col.length,
        ...data.slice(0, 10).map(row => String(row[col] || '').length)
      );
    });
    
    const totalContentLength = Object.values(contentLengths).reduce((sum, len) => sum + len, 0);
    
    // Distribute remaining space proportionally
    columns.forEach(col => {
      const proportion = contentLengths[col] / totalContentLength;
      columnWidths[col] = Math.floor(minColWidth + (remainingSpace * proportion));
    });
  }
  
  // Draw table header
  let xPos = 50;
  const headerY = doc.y;
  
  doc.lineWidth(0.5).fillColor('#f5f5f5');
  doc.rect(xPos, headerY, pageWidth, 20).fill();
  
  columns.forEach(column => {
    const displayName = column.replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/^./, str => str.toUpperCase());
    
    doc.fontSize(10).fillColor('#333333');
    doc.text(
      displayName, 
      xPos + 2, 
      headerY + 5, 
      { width: columnWidths[column] - 4, align: 'left' }
    );
    
    xPos += columnWidths[column];
  });
  
  // Draw table rows
  let rowY = headerY + 20;
  
  data.forEach((row, index) => {
    // Check if we need a new page
    if (rowY > doc.page.height - 100) {
      doc.addPage();
      rowY = 50;
      
      // Redraw header on new page
      xPos = 50;
      doc.lineWidth(0.5).fillColor('#f5f5f5');
      doc.rect(xPos, rowY, pageWidth, 20).fill();
      
      columns.forEach(column => {
        const displayName = column.replace(/([A-Z])/g, ' $1')
          .replace(/_/g, ' ')
          .replace(/^./, str => str.toUpperCase());
        
        doc.fontSize(10).fillColor('#333333');
        doc.text(
          displayName, 
          xPos + 2, 
          rowY + 5, 
          { width: columnWidths[column] - 4, align: 'left' }
        );
        
        xPos += columnWidths[column];
      });
      
      rowY += 20;
    }
    
    // Draw row background (alternating)
    if (index % 2 === 1) {
      doc.lineWidth(0.5).fillColor('#f9f9f9');
      doc.rect(50, rowY, pageWidth, 20).fill();
    }
    
    // Draw row data
    xPos = 50;
    
    columns.forEach(column => {
      let cellValue = row[column];
      
      // Format cell values
      if (column.toLowerCase().includes('date') && cellValue) {
        try {
          const date = new Date(cellValue);
          if (!isNaN(date.getTime())) {
            cellValue = formatDate(date);
          }
        } catch (e) {
          // Keep original value if date parsing fails
        }
      } else if (
        typeof cellValue === 'number' && 
        (column.toLowerCase().includes('amount') || 
         column.toLowerCase().includes('sales') || 
         column.toLowerCase().includes('revenue') || 
         column.toLowerCase().includes('price') ||
         column.toLowerCase().includes('spent'))
      ) {
        cellValue = formatCurrency(cellValue);
      } else if (typeof cellValue === 'number') {
        cellValue = cellValue.toLocaleString();
      } else if (cellValue === null || cellValue === undefined) {
        cellValue = '-';
      } else {
        cellValue = String(cellValue);
      }
      
      // Set text alignment based on data type
      let align = 'left';
      if (typeof row[column] === 'number' && 
          (column.toLowerCase().includes('amount') || 
           column.toLowerCase().includes('count') ||
           column.toLowerCase().includes('sales') || 
           column.toLowerCase().includes('price') ||
           column.toLowerCase().includes('revenue') || 
           column.toLowerCase().includes('spent'))) {
        align = 'right';
      }
      
      doc.fontSize(9).fillColor('#333333');
      doc.text(
        cellValue, 
        xPos + 2, 
        rowY + 5, 
        { width: columnWidths[column] - 4, align }
      );
      
      xPos += columnWidths[column];
    });
    
    rowY += 20;
  });
};

/**
 * Add footer to PDF document
 * @param {PDFDocument} doc - PDF document
 */
const addFooter = (doc) => {
  const pages = doc.bufferedPageRange().count;
  
  // For each page
  for (let i = 0; i < pages; i++) {
    doc.switchToPage(i);
    const pageHeight = doc.page.height;
    
    // Add a line separator
    doc.moveTo(50, pageHeight - 50).lineTo(550, pageHeight - 50).stroke('#e0e0e0');
    
    // Add company info
    doc.fontSize(10).fillColor('#888888')
      .text('HANDIX © ' + new Date().getFullYear() + ' | Authentic Sri Lankan Handicrafts', 50, pageHeight - 40);
    
    // Add page number
    doc.fontSize(10).fillColor('#aaaaaa')
      .text(`Page ${i + 1} of ${pages}`, 500, pageHeight - 40, { align: 'right' });
  }
};

module.exports = { generatePDFReport };
