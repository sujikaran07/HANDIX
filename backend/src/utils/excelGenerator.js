const Excel = require('exceljs');
const path = require('path');
const fs = require('fs');
const { formatDate, formatCurrency, formatNumber } = require('./formatters');

/**
 * Generate Excel report with AliExpress-like styling
 * @param {Object} options - Report options
 * @returns {string} - Path to the generated Excel file
 */
const generateExcelReport = async (options) => {
  const { title, summary, data, type, filters } = options;

  // Create a timestamp for unique filenames
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputDir = path.resolve(__dirname, '../../temp');
  
  // Create temp directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputPath = path.resolve(outputDir, `report_${type}_${timestamp}.xlsx`);

  // Create workbook and worksheet with AliExpress styling
  const workbook = new Excel.Workbook();
  workbook.creator = 'HANDIX Reports';
  workbook.lastModifiedBy = 'HANDIX System';
  workbook.created = new Date();
  workbook.modified = new Date();
  
  // Add report worksheet
  const worksheet = workbook.addWorksheet(title, {
    properties: { tabColor: { argb: 'FF0066CC' } }
  });
  
  // Add logo and title with AliExpress styling
  worksheet.mergeCells('A1:B3');
  const logoCell = worksheet.getCell('A1');
  logoCell.value = 'HANDIX';
  logoCell.font = { 
    size: 22, 
    bold: true, 
    color: { argb: 'FFFF4747' } 
  };
  logoCell.alignment = { vertical: 'middle', horizontal: 'center' };
  
  // Add report title section
  worksheet.mergeCells('C1:H1');
  const titleCell = worksheet.getCell('C1');
  titleCell.value = title;
  titleCell.font = { size: 16, bold: true };
  titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
  
  // Add date range
  worksheet.mergeCells('C2:H2');
  const dateRangeCell = worksheet.getCell('C2');
  if (filters?.startDate && filters?.endDate) {
    dateRangeCell.value = `Period: ${formatDate(filters.startDate)} - ${formatDate(filters.endDate)}`;
  } else {
    dateRangeCell.value = `Generated on: ${formatDate(new Date())}`;
  }
  dateRangeCell.font = { size: 11, color: { argb: '88666666' } };
  dateRangeCell.alignment = { vertical: 'middle', horizontal: 'left' };
  
  // Add generated timestamp
  worksheet.mergeCells('C3:H3');
  const timestampCell = worksheet.getCell('C3');
  timestampCell.value = `Generated: ${formatDate(new Date(), true)}`;
  timestampCell.font = { size: 11, color: { argb: '88666666' } };
  timestampCell.alignment = { vertical: 'middle', horizontal: 'left' };

  // Add separator line with AliExpress styling
  worksheet.mergeCells('A4:H4');
  const separatorCell = worksheet.getCell('A4');
  separatorCell.fill = {
    type: 'gradient',
    gradient: 'path',
    center: { left: 0, top: 0 },
    stops: [
      { position: 0, color: { argb: 'FFFF4747' } },
      { position: 1, color: { argb: 'FFFF6A00' } }
    ]
  };
  separatorCell.border = {
    bottom: { style: 'thin', color: { argb: 'FFFF4747' } }
  };
  
  // Add empty row for spacing
  worksheet.addRow([]);

  // Add summary section with AliExpress-styled cards
  if (summary && Object.keys(summary).length > 0) {
    const summaryRow = worksheet.addRow(['Summary']);
    summaryRow.font = { bold: true, size: 14 };
    summaryRow.height = 24;
    worksheet.mergeCells(`A${summaryRow.number}:H${summaryRow.number}`);
    
    worksheet.addRow([]);
    
    // Create summary table with AliExpress card styling
    const summaryItems = Object.entries(summary);
    const summaryRows = Math.ceil(summaryItems.length / 2);
    
    for (let i = 0; i < summaryRows; i++) {
      const row = worksheet.addRow([]);
      row.height = 60;
      
      for (let j = 0; j < 2; j++) {
        const index = i * 2 + j;
        if (index < summaryItems.length) {
          const [key, value] = summaryItems[index];
          const colStart = j === 0 ? 'A' : 'E';
          const colEnd = j === 0 ? 'D' : 'H';
          
          // Format label
          const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          
          // Format value based on key name
          let formattedValue;
          if (typeof value === 'number') {
            if (key.toLowerCase().includes('total') || 
                key.toLowerCase().includes('sales') || 
                key.toLowerCase().includes('value') || 
                key.toLowerCase().includes('spent')) {
              formattedValue = formatCurrency(value);
            } else {
              formattedValue = formatNumber(value);
            }
          } else {
            formattedValue = value;
          }
          
          // Create summary card cells
          worksheet.mergeCells(`${colStart}${row.number}:${colEnd}${row.number}`);
          const keyCell = worksheet.getCell(`${colStart}${row.number}`);
          
          // Create rich text with two different format
          keyCell.value = {
            richText: [
              { text: formattedValue + '\n', font: { size: 16, bold: true, color: { argb: 'FF333333' } } },
              { text: label, font: { size: 11, color: { argb: '88666666' } } }
            ]
          };
          
          keyCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
          
          // Add styling for the colored top border (similar to AliExpress metric cards)
          keyCell.border = {
            top: { style: 'thick', color: { argb: index % 4 === 0 ? 'FFFF4747' : 
                                           index % 4 === 1 ? 'FF20C997' : 
                                           index % 4 === 2 ? 'FF0D6EFD' : 'FFFFB300' } },
            left: { style: 'thin', color: { argb: 'FFEEEEEE' } },
            right: { style: 'thin', color: { argb: 'FFEEEEEE' } },
            bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } }
          };
          
          keyCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFFFF' }
          };
        }
      }
      
      // Add spacing between rows
      worksheet.addRow([]).height = 5;
    }
    
    worksheet.addRow([]);
  }

  // Add data section with improved table styling
  if (data && data.length > 0) {
    const dataHeaderRow = worksheet.addRow(['Detailed Data']);
    dataHeaderRow.font = { bold: true, size: 14 };
    dataHeaderRow.height = 24;
    worksheet.mergeCells(`A${dataHeaderRow.number}:H${dataHeaderRow.number}`);
    
    worksheet.addRow([]);
    
    // Get headers (column names)
    const headers = Object.keys(data[0]).filter(key => key !== 'id');
    
    // Format headers for display
    const formattedHeaders = headers.map(header => 
      header.replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/^./, str => str.toUpperCase())
    );
    
    // Add header row with AliExpress styling
    const headerRow = worksheet.addRow(formattedHeaders);
    headerRow.font = { bold: true, color: { argb: 'FF333333' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 24;
    
    // Style header cells
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF8F9FA' }
      };
      cell.border = {
        bottom: { style: 'medium', color: { argb: 'FFE0E0E0' } }
      };
    });
    
    // Adjust column widths to fit content
    headers.forEach((header, index) => {
      const column = worksheet.getColumn(index + 1);
      column.width = Math.max(15, header.length * 1.5);
    });
    
    // Add data rows with AliExpress styling
    data.forEach((row, rowIndex) => {
      const rowData = headers.map(header => {
        const value = row[header];
        
        // Format cell values based on type and header name
        if (header.toLowerCase().includes('date') && value) {
          try {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              return formatDate(date);
            }
          } catch (e) {
            // Keep original value if date parsing fails
          }
        } 
        
        if (typeof value === 'number' && 
            (header.toLowerCase().includes('amount') || 
             header.toLowerCase().includes('sales') || 
             header.toLowerCase().includes('revenue') || 
             header.toLowerCase().includes('price') ||
             header.toLowerCase().includes('spent'))) {
          return formatCurrency(value);
        } 
        
        if (typeof value === 'number' && 
           (header.toLowerCase().includes('count') || 
            header.toLowerCase().includes('quantity'))) {
          return formatNumber(value);
        }
        
        if (value === null || value === undefined) {
          return '-';
        }
        
        return value;
      });
      
      const dataRow = worksheet.addRow(rowData);
      dataRow.height = 22;
      
      // Apply alternating row styling like AliExpress
      if (rowIndex % 2 === 1) {
        dataRow.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9F9F9' }
          };
        });
      }
      
      // Style data cells
      dataRow.eachCell((cell, colNumber) => {
        const header = headers[colNumber - 1];
        
        // Align currency and number values to the right
        if (typeof row[header] === 'number' && 
            (header.toLowerCase().includes('amount') || 
             header.toLowerCase().includes('count') ||
             header.toLowerCase().includes('sales') || 
             header.toLowerCase().includes('price') ||
             header.toLowerCase().includes('revenue') || 
             header.toLowerCase().includes('spent'))) {
          cell.alignment = { horizontal: 'right' };
        } else {
          cell.alignment = { horizontal: 'left' };
        }
        
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } }
        };
        
        // Style growth/percentage values
        if (header.toLowerCase().includes('growth') || header.toLowerCase().includes('percentage')) {
          const numValue = parseFloat(row[header]);
          if (!isNaN(numValue)) {
            cell.font = { 
              color: { argb: numValue >= 0 ? 'FF28A745' : 'FFDC3545' } 
            };
          }
        }
      });
    });
  } else {
    // No data message
    const noDataRow = worksheet.addRow(['No data available for this report.']);
    noDataRow.font = { italic: true };
    worksheet.mergeCells(`A${noDataRow.number}:H${noDataRow.number}`);
    noDataRow.alignment = { horizontal: 'center' };
  }

  // Add footer with AliExpress styling
  const footerRowIndex = worksheet.rowCount + 2;
  const footerRow = worksheet.addRow([`HANDIX © ${new Date().getFullYear()} | Authentic Sri Lankan Handicrafts`]);
  worksheet.mergeCells(`A${footerRowIndex}:E${footerRowIndex}`);
  
  const pageNumberCell = worksheet.getCell(`H${footerRowIndex}`);
  pageNumberCell.value = 'Page 1 of 1';
  pageNumberCell.alignment = { horizontal: 'right' };
  
  footerRow.font = { size: 10, color: { argb: '88888888' } };
  
  // Add top border to footer
  const borderRow = worksheet.getRow(footerRowIndex - 1);
  worksheet.mergeCells(`A${footerRowIndex - 1}:H${footerRowIndex - 1}`);
  borderRow.border = {
    bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } }
  };
  borderRow.height = 10;

  // Save workbook
  await workbook.xlsx.writeFile(outputPath);
  
  return outputPath;
};

module.exports = { generateExcelReport };
