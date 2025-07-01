const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { formatDate, formatCurrency } = require('./formatters');

/**
 * Generate a PDF report for artisan data
 * @param {Object} options - Report generation options
 * @returns {string} Path to the generated PDF file
 */
const generateArtisanPdfReport = async (options) => {
  const { title, summary, data, type, filters, artisanInfo } = options;
  
  // Create timestamp for unique filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputDir = path.resolve(__dirname, '../../temp');
  
  // Create temp directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputPath = path.resolve(outputDir, `artisan_report_${type}_${timestamp}.pdf`);
  
  // Create PDF document
  const doc = new PDFDocument({ 
    margin: 50,
    size: 'A4'
  });
  
  // Pipe output to file
  doc.pipe(fs.createWriteStream(outputPath));
  
  // Add header
  addHeader(doc, title, filters, artisanInfo);
  
  // Add summary section
  addSummary(doc, summary);
  
  // Add data tables based on report type
  switch (type) {
    case 'orders':
      addOrdersTable(doc, data);
      break;
    case 'products':
      addProductsTable(doc, data);
      break;
    case 'performance':
      addPerformanceTable(doc, data);
      break;
    default:
      addGenericTable(doc, data);
  }
  
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
 * @param {Object} artisanInfo - Artisan information
 */
const addHeader = (doc, title, filters, artisanInfo = {}) => {
  // Add logo
  try {
    const logoPath = path.resolve(__dirname, '../../public/images/handix_logo.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 45, { width: 60 });
    }
  } catch (err) {
    console.error('Error adding logo:', err);
  }
  
  // Add company name
  doc.fontSize(22).fillColor('#333333').text('HANDIX', 120, 50);
  doc.fontSize(12).fillColor('#666666').text('Artisan Portal', 120, 75);
  
  // Add a decorative line
  doc.moveTo(50, 100).lineTo(550, 100).stroke('#e0e0e0');
  
  // Add report title and artisan info
  doc.fontSize(18).fillColor('#333333').text(title, 50, 120);
  
  const artisanName = artisanInfo?.name || 'Artisan';
  doc.fontSize(12).fillColor('#666666').text(`Artisan: ${artisanName}`, 50, 145);
  
  // Add date range
  if (filters?.startDate && filters?.endDate) {
    doc.fontSize(10).fillColor('#666666')
      .text(`Period: ${formatDate(filters.startDate)} - ${formatDate(filters.endDate)}`, 50, 165);
  }
  
  // Add generated date
  doc.fontSize(10).fillColor('#666666')
    .text(`Generated on: ${formatDate(new Date(), true)}`, 50, 180);
  
  // Add decorative elements
  doc.rect(50, 200, 500, 2).fill('#3e87c3');
};

/**
 * Add summary section to PDF
 * @param {PDFDocument} doc - PDF document
 * @param {Object} summary - Summary data
 */
const addSummary = (doc, summary) => {
  if (!summary || Object.keys(summary).length === 0) return;
  
  // Add summary title
  doc.moveDown(2);
  doc.fontSize(14).fillColor('#333333').text('Summary', { underline: true });
  doc.moveDown(1);
  
  // Get keys and format them for display
  const keys = Object.keys(summary);
  const itemsPerRow = 2;
  const rows = Math.ceil(keys.length / itemsPerRow);
  
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < itemsPerRow; j++) {
      const index = i * itemsPerRow + j;
      if (index < keys.length) {
        const key = keys[index];
        const value = summary[key];
        
        // Format key for display
        const displayKey = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/_/g, ' ')
          .replace(/^./, str => str.toUpperCase());
        
        // Format value based on key types
        let displayValue;
        if (typeof value === 'number') {
          if (key.toLowerCase().includes('sales') || 
              key.toLowerCase().includes('revenue') ||
              key.toLowerCase().includes('amount') ||
              key.toLowerCase().includes('value')) {
            displayValue = formatCurrency(value);
          } else {
            displayValue = value.toLocaleString();
          }
        } else {
          displayValue = value;
        }
        
        // Position based on column
        const xPos = 50 + (j * 250);
        
        // Add summary box
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
    
    // Move to next row
    doc.moveDown(3);
  }
};

/**
 * Add orders table to PDF
 * @param {PDFDocument} doc - PDF document
 * @param {Array} data - Orders data
 */
const addOrdersTable = (doc, data) => {
  if (!data || data.length === 0) {
    doc.moveDown(1);
    doc.fontSize(12).fillColor('#666666').text('No order data available.', {align: 'center'});
    return;
  }
  
  // Add table title
  doc.moveDown(1);
  doc.fontSize(14).fillColor('#333333').text('Order Details', { underline: true });
  doc.moveDown(1);
  
  // Define columns to display
  const columns = [
    { key: 'order_id', header: 'Order ID', width: 60 },
    { key: 'date', header: 'Date', width: 80 },
    { key: 'product_name', header: 'Product', width: 120 },
    { key: 'status', header: 'Status', width: 80 },
    { key: 'quantity', header: 'Qty', width: 40 },
    { key: 'total_amount', header: 'Amount', width: 80 }
  ];
  
  // Draw table header
  let xPos = 50;
  const headerY = doc.y;
  
  doc.lineWidth(0.5).fillColor('#f5f5f5');
  doc.rect(xPos, headerY, 500, 20).fill();
  
  columns.forEach(column => {
    doc.fontSize(10).fillColor('#333333');
    doc.text(
      column.header,
      xPos + 2,
      headerY + 5,
      { width: column.width - 4, align: 'left' }
    );
    xPos += column.width;
  });
  
  // Draw table rows
  let rowY = headerY + 20;
  
  data.slice(0, 20).forEach((row, index) => {
    // Check if we need a new page
    if (rowY > doc.page.height - 100) {
      doc.addPage();
      rowY = 50;
      
      // Redraw header on new page
      xPos = 50;
      doc.lineWidth(0.5).fillColor('#f5f5f5');
      doc.rect(xPos, rowY, 500, 20).fill();
      
      columns.forEach(column => {
        doc.fontSize(10).fillColor('#333333');
        doc.text(
          column.header,
          xPos + 2,
          rowY + 5,
          { width: column.width - 4, align: 'left' }
        );
        xPos += column.width;
      });
      
      rowY += 20;
    }
    
    // Draw alternating row background
    if (index % 2 === 1) {
      doc.lineWidth(0.5).fillColor('#f9f9f9');
      doc.rect(50, rowY, 500, 20).fill();
    }
    
    // Draw row data
    xPos = 50;
    columns.forEach(column => {
      let cellValue = row[column.key];
      let align = 'left';
      
      // Format cell values
      if (column.key === 'date' && cellValue) {
        cellValue = formatDate(cellValue);
      } else if (column.key === 'total_amount') {
        cellValue = formatCurrency(cellValue);
        align = 'right';
      } else if (column.key === 'quantity') {
        cellValue = parseInt(cellValue).toLocaleString();
        align = 'right';
      } else if (cellValue === null || cellValue === undefined) {
        cellValue = '-';
      }
      
      doc.fontSize(9).fillColor('#333333');
      doc.text(
        cellValue.toString(),
        xPos + 2,
        rowY + 5,
        { width: column.width - 4, align }
      );
      
      xPos += column.width;
    });
    
    rowY += 20;
  });
  
  // Add note if data was truncated
  if (data.length > 20) {
    doc.moveDown(1);
    doc.fontSize(10).fillColor('#666666')
      .text(`Note: Showing 20 of ${data.length} orders. Export to JSON for complete data.`, {
        align: 'center'
      });
  }
};

/**
 * Add products table to PDF
 * @param {PDFDocument} doc - PDF document
 * @param {Array} data - Products data
 */
const addProductsTable = (doc, data) => {
  if (!data || data.length === 0) {
    doc.moveDown(1);
    doc.fontSize(12).fillColor('#666666').text('No product data available.', {align: 'center'});
    return;
  }
  
  // Add table title
  doc.moveDown(1);
  doc.fontSize(14).fillColor('#333333').text('Product Details', { underline: true });
  doc.moveDown(1);
  
  // Define columns to display
  const columns = [
    { key: 'product_name', header: 'Product', width: 140 },
    { key: 'category', header: 'Category', width: 100 },
    { key: 'stock_level', header: 'Stock', width: 60 },
    { key: 'total_sold', header: 'Sold', width: 60 },
    { key: 'total_revenue', header: 'Revenue', width: 100 }
  ];
  
  // Draw table header
  let xPos = 50;
  const headerY = doc.y;
  
  doc.lineWidth(0.5).fillColor('#f5f5f5');
  doc.rect(xPos, headerY, 500, 20).fill();
  
  columns.forEach(column => {
    doc.fontSize(10).fillColor('#333333');
    doc.text(
      column.header,
      xPos + 2,
      headerY + 5,
      { width: column.width - 4, align: 'left' }
    );
    xPos += column.width;
  });
  
  // Draw table rows
  let rowY = headerY + 20;
  
  data.slice(0, 20).forEach((row, index) => {
    // Check if we need a new page
    if (rowY > doc.page.height - 100) {
      doc.addPage();
      rowY = 50;
      
      // Redraw header on new page
      xPos = 50;
      doc.lineWidth(0.5).fillColor('#f5f5f5');
      doc.rect(xPos, rowY, 500, 20).fill();
      
      columns.forEach(column => {
        doc.fontSize(10).fillColor('#333333');
        doc.text(
          column.header,
          xPos + 2,
          rowY + 5,
          { width: column.width - 4, align: 'left' }
        );
        xPos += column.width;
      });
      
      rowY += 20;
    }
    
    // Draw alternating row background
    if (index % 2 === 1) {
      doc.lineWidth(0.5).fillColor('#f9f9f9');
      doc.rect(50, rowY, 500, 20).fill();
    }
    
    // Draw row data
    xPos = 50;
    columns.forEach(column => {
      let cellValue = row[column.key];
      let align = 'left';
      
      // Format cell values
      if (column.key === 'total_revenue') {
        cellValue = formatCurrency(cellValue || 0);
        align = 'right';
      } else if (column.key === 'stock_level' || column.key === 'total_sold') {
        cellValue = parseInt(cellValue || 0).toLocaleString();
        align = 'right';
      } else if (cellValue === null || cellValue === undefined) {
        cellValue = '-';
      }
      
      doc.fontSize(9).fillColor('#333333');
      doc.text(
        cellValue.toString(),
        xPos + 2,
        rowY + 5,
        { width: column.width - 4, align }
      );
      
      xPos += column.width;
    });
    
    rowY += 20;
  });
  
  // Add note if data was truncated
  if (data.length > 20) {
    doc.moveDown(1);
    doc.fontSize(10).fillColor('#666666')
      .text(`Note: Showing 20 of ${data.length} products. Export to JSON for complete data.`, {
        align: 'center'
      });
  }
};

/**
 * Add performance table to PDF
 * @param {PDFDocument} doc - PDF document
 * @param {Array} data - Performance data
 */
const addPerformanceTable = (doc, data) => {
  if (!data || data.length === 0) {
    doc.moveDown(1);
    doc.fontSize(12).fillColor('#666666').text('No performance data available.', {align: 'center'});
    return;
  }
  
  // Add table title
  doc.moveDown(1);
  doc.fontSize(14).fillColor('#333333').text('Performance Metrics', { underline: true });
  doc.moveDown(1);
  
  // Define columns to display
  const columns = [
    { key: 'period', header: 'Period', width: 80 },
    { key: 'completed_orders', header: 'Completed', width: 80 },
    { key: 'on_time', header: 'On Time', width: 80 },
    { key: 'late', header: 'Late', width: 80 },
    { key: 'early', header: 'Early', width: 80 },
    { key: 'rating', header: 'Rating', width: 80 }
  ];
  
  // Draw table header
  let xPos = 50;
  const headerY = doc.y;
  
  doc.lineWidth(0.5).fillColor('#f5f5f5');
  doc.rect(xPos, headerY, 500, 20).fill();
  
  columns.forEach(column => {
    doc.fontSize(10).fillColor('#333333');
    doc.text(
      column.header,
      xPos + 2,
      headerY + 5,
      { width: column.width - 4, align: 'left' }
    );
    xPos += column.width;
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
      doc.rect(xPos, rowY, 500, 20).fill();
      
      columns.forEach(column => {
        doc.fontSize(10).fillColor('#333333');
        doc.text(
          column.header,
          xPos + 2,
          rowY + 5,
          { width: column.width - 4, align: 'left' }
        );
        xPos += column.width;
      });
      
      rowY += 20;
    }
    
    // Draw alternating row background
    if (index % 2 === 1) {
      doc.lineWidth(0.5).fillColor('#f9f9f9');
      doc.rect(50, rowY, 500, 20).fill();
    }
    
    // Draw row data
    xPos = 50;
    columns.forEach(column => {
      let cellValue = row[column.key];
      let align = column.key === 'period' ? 'left' : 'right';
      
      // Format cell values
      if (column.key === 'rating') {
        const rating = parseFloat(cellValue || 0);
        cellValue = rating.toFixed(1);
      } else if (column.key !== 'period') {
        cellValue = parseInt(cellValue || 0).toLocaleString();
      }
      
      if (cellValue === null || cellValue === undefined) {
        cellValue = '-';
      }
      
      doc.fontSize(9).fillColor('#333333');
      doc.text(
        cellValue.toString(),
        xPos + 2,
        rowY + 5,
        { width: column.width - 4, align }
      );
      
      xPos += column.width;
    });
    
    rowY += 20;
  });
};

/**
 * Add generic table for any data type
 * @param {PDFDocument} doc - PDF document
 * @param {Array} data - Report data
 */
const addGenericTable = (doc, data) => {
  if (!data || data.length === 0) {
    doc.moveDown(1);
    doc.fontSize(12).fillColor('#666666').text('No data available.', {align: 'center'});
    return;
  }
  
  // Add table title
  doc.moveDown(1);
  doc.fontSize(14).fillColor('#333333').text('Report Data', { underline: true });
  doc.moveDown(1);
  
  // Get table columns
  const columns = Object.keys(data[0]).filter(key => key !== 'id');
  
  // Calculate column widths
  const pageWidth = 500;
  const columnWidths = {};
  const minColWidth = 60;
  
  // Initialize with minimum width
  columns.forEach(col => {
    columnWidths[col] = minColWidth;
  });
  
  // Distribute remaining space proportionally
  const usedSpace = columns.length * minColWidth;
  const remainingSpace = pageWidth - usedSpace;
  
  if (remainingSpace > 0) {
    // Estimate content length for proportional sizing
    const contentLengths = {};
    columns.forEach(col => {
      contentLengths[col] = Math.max(
        col.length,
        ...data.slice(0, 10).map(row => String(row[col] || '').length)
      );
    });
    
    const totalContentLength = Object.values(contentLengths).reduce((sum, len) => sum + len, 0);
    
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
    const displayName = column
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
  
  data.slice(0, 20).forEach((row, index) => {
    // Check if we need a new page
    if (rowY > doc.page.height - 100) {
      doc.addPage();
      rowY = 50;
      
      // Redraw header on new page
      xPos = 50;
      doc.lineWidth(0.5).fillColor('#f5f5f5');
      doc.rect(xPos, rowY, 500, 20).fill();
      
      columns.forEach(column => {
        const displayName = column
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
    
    // Draw alternating row background
    if (index % 2 === 1) {
      doc.lineWidth(0.5).fillColor('#f9f9f9');
      doc.rect(50, rowY, 500, 20).fill();
    }
    
    // Draw row data
    xPos = 50;
    
    columns.forEach(column => {
      let cellValue = row[column];
      let align = 'left';
      
      // Format cell values based on content type
      if (column.toLowerCase().includes('date') && cellValue) {
        cellValue = formatDate(cellValue);
      } else if (column.toLowerCase().includes('amount') || 
                 column.toLowerCase().includes('revenue') || 
                 column.toLowerCase().includes('sales') || 
                 column.toLowerCase().includes('price')) {
        if (typeof cellValue === 'number' || !isNaN(parseFloat(cellValue))) {
          cellValue = formatCurrency(parseFloat(cellValue || 0));
          align = 'right';
        }
      } else if (typeof cellValue === 'number') {
        cellValue = cellValue.toLocaleString();
        align = 'right';
      }
      
      if (cellValue === null || cellValue === undefined) {
        cellValue = '-';
      }
      
      doc.fontSize(9).fillColor('#333333');
      doc.text(
        cellValue.toString(),
        xPos + 2,
        rowY + 5,
        { width: columnWidths[column] - 4, align }
      );
      
      xPos += columnWidths[column];
    });
    
    rowY += 20;
  });
  
  // Add note if data was truncated
  if (data.length > 20) {
    doc.moveDown(1);
    doc.fontSize(10).fillColor('#666666')
      .text(`Note: Showing 20 of ${data.length} records. Export to JSON for complete data.`, {
        align: 'center'
      });
  }
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
    
    // Add a separator line
    doc.moveTo(50, pageHeight - 50).lineTo(550, pageHeight - 50).stroke('#e0e0e0');
    
    // Add company info
    doc.fontSize(10).fillColor('#888888')
      .text('HANDIX © ' + new Date().getFullYear() + ' | Artisan Portal', 50, pageHeight - 40);
    
    // Add page number
    doc.fontSize(10).fillColor('#aaaaaa')
      .text(`Page ${i + 1} of ${pages}`, 500, pageHeight - 40, { align: 'right' });
  }
};

module.exports = { generateArtisanPdfReport };
