const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate a PDF report based on the provided data
 * @param {Object} options - Report generation options
 * @param {string} options.title - Report title
 * @param {Object} options.summary - Summary metrics
 * @param {Array} options.data - Report data
 * @param {string} options.type - Report type (sales, products, etc.)
 * @param {Object} options.filters - Applied filters
 * @returns {string} - Path to generated PDF file
 */
const generatePDFReport = async (options) => {
  const { title, summary, data, type, filters } = options;
  
  // Create a document
  const doc = new PDFDocument({
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    size: 'A4',
  });
  
  // Create output file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputPath = path.resolve(__dirname, `../../temp/report_${type}_${timestamp}.pdf`);
  const outputDir = path.dirname(outputPath);
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Pipe output to file
  doc.pipe(fs.createWriteStream(outputPath));
  
  // Add header
  addHeader(doc, title);
  
  // Add summary section
  addSummary(doc, summary);
  
  // Add filters section
  addFilters(doc, filters);
  
  // Add data table
  addDataTable(doc, data, type);
  
  // Add footer
  addFooter(doc);
  
  // Finalize the PDF
  doc.end();
  
  return outputPath;
};

const addHeader = (doc, title) => {
  // Logo could be added here if available
  doc.fontSize(24).text('HANDIX', { align: 'center' });
  doc.fontSize(18).text(title, { align: 'center' });
  doc.moveDown(1);
  doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
  doc.moveDown(2);
};

const addSummary = (doc, summary) => {
  doc.fontSize(14).text('Summary', { underline: true });
  doc.moveDown(0.5);
  
  // Create a table-like structure for summary
  const summaryTable = [];
  Object.entries(summary).forEach(([key, value]) => {
    const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    
    let formattedValue = value;
    if (typeof value === 'number') {
      if (key.toLowerCase().includes('total') || key.toLowerCase().includes('sales') || key.toLowerCase().includes('revenue') || key.toLowerCase().includes('spent')) {
        formattedValue = `Rs ${value.toLocaleString()}`;
      } else {
        formattedValue = value.toLocaleString();
      }
    }
    
    summaryTable.push([formattedKey, formattedValue]);
  });
  
  // Define column widths
  const colWidths = [200, 200];
  
  // Draw each row
  let yPos = doc.y;
  summaryTable.forEach((row, i) => {
    doc.fontSize(11).text(row[0], doc.x, yPos, { width: colWidths[0] });
    doc.fontSize(11).text(row[1], doc.x + colWidths[0], yPos, { width: colWidths[1] });
    yPos += 20;
  });
  
  doc.moveDown(2);
};

const addFilters = (doc, filters) => {
  if (!filters || Object.keys(filters).length === 0) return;
  
  doc.fontSize(14).text('Applied Filters', { underline: true });
  doc.moveDown(0.5);
  
  Object.entries(filters).forEach(([key, value]) => {
    const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    let displayValue = value;
    
    if (Array.isArray(value)) {
      displayValue = value.join(', ');
    } else if (key.includes('date')) {
      displayValue = new Date(value).toLocaleDateString();
    }
    
    doc.fontSize(11).text(`${formattedKey}: ${displayValue}`);
  });
  
  doc.moveDown(2);
};

const addDataTable = (doc, data, type) => {
  if (!data || data.length === 0) {
    doc.text('No data available for this report.');
    return;
  }
  
  doc.fontSize(14).text('Detailed Data', { underline: true });
  doc.moveDown(1);
  
  // Get table headers from first data row
  const headers = Object.keys(data[0]);
  
  // Calculate column widths based on available space
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const colWidth = pageWidth / headers.length;
  
  // Draw table header
  let yPos = doc.y;
  doc.fontSize(10).font('Helvetica-Bold');
  
  headers.forEach((header, i) => {
    const formattedHeader = header.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    doc.text(formattedHeader, doc.page.margins.left + (i * colWidth), yPos, { 
      width: colWidth,
      align: 'center'
    });
  });
  
  doc.moveDown(0.5);
  yPos = doc.y;
  
  // Draw horizontal line
  doc.moveTo(doc.page.margins.left, yPos)
     .lineTo(doc.page.width - doc.page.margins.right, yPos)
     .stroke();
  
  doc.moveDown(0.5);
  yPos = doc.y;
  
  // Draw table rows
  doc.fontSize(9).font('Helvetica');
  
  // Only show first 30 rows to avoid very large PDFs
  const maxRows = Math.min(data.length, 30);
  
  for (let i = 0; i < maxRows; i++) {
    // Check if we need a new page
    if (yPos > doc.page.height - doc.page.margins.bottom - 50) {
      doc.addPage();
      yPos = doc.page.margins.top;
      doc.fontSize(14).text('Detailed Data (continued)', { underline: true });
      doc.moveDown(1);
      yPos = doc.y;
    }
    
    // Draw each cell in the row
    headers.forEach((header, j) => {
      let value = data[i][header];
      
      // Format values appropriately
      if (typeof value === 'number') {
        if (header.toLowerCase().includes('total') || header.toLowerCase().includes('sales') || 
            header.toLowerCase().includes('revenue') || header.toLowerCase().includes('spent')) {
          value = `Rs ${value.toLocaleString()}`;
        } else {
          value = value.toLocaleString();
        }
      } else if (header.toLowerCase().includes('date') && value) {
        value = new Date(value).toLocaleDateString();
      }
      
      doc.text(
        value !== null && value !== undefined ? String(value) : 'N/A',
        doc.page.margins.left + (j * colWidth),
        yPos,
        { width: colWidth, align: 'center' }
      );
    });
    
    yPos += 20;
    
    // Add light separator line between rows
    if (i < maxRows - 1) {
      doc.moveTo(doc.page.margins.left, yPos - 10)
         .lineTo(doc.page.width - doc.page.margins.right, yPos - 10)
         .lineWidth(0.5)
         .strokeOpacity(0.5)
         .stroke();
    }
  }
  
  // Add note if showing truncated data
  if (data.length > maxRows) {
    doc.moveDown(1);
    doc.fontSize(9).italics().text(
      `Note: Showing ${maxRows} of ${data.length} records. Export to Excel for the complete dataset.`,
      { align: 'center' }
    );
  }
};

const addFooter = (doc) => {
  const pageCount = doc.bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    doc.fontSize(8)
       .text(
         `Page ${i + 1} of ${pageCount} - HANDIX Report System`,
         doc.page.margins.left,
         doc.page.height - doc.page.margins.bottom - 20,
         { align: 'center', width: doc.page.width - doc.page.margins.left - doc.page.margins.right }
       );
  }
};

module.exports = { generatePDFReport };
