import React from 'react';

interface ExportExcelButtonProps {
  containerRef: React.RefObject<HTMLElement>;
  fileName?: string; // without extension
  className?: string;
  label?: string;
}

// Simple, dependency-free exporter that converts visible HTML tables within a container
// into an Excel-compatible .xls file (HTML-based). Works well for most use-cases.
const ExportExcelButton: React.FC<ExportExcelButtonProps> = ({
  containerRef,
  fileName = 'export',
  className = 'px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors',
  label = 'Download Excel',
}) => {
  const handleExport = () => {
    const container = containerRef.current;
    if (!container) {
      console.warn('ExportExcelButton: containerRef is not set.');
      return;
    }

    const tables = container.querySelectorAll('table');
    if (!tables || tables.length === 0) {
      console.warn('ExportExcelButton: No table elements found inside the target container.');
      return;
    }

    // Build a combined HTML string with all tables separated by some spacing
    let combinedTablesHTML = '';
    tables.forEach((table, idx) => {
      const tableClone = table.cloneNode(true) as HTMLElement;
      // Remove interactive-only columns if needed in future; for now, keep as-is
      combinedTablesHTML += `<div style="margin-bottom:16px;">${tableClone.outerHTML}</div>`;
      if (idx < tables.length - 1) {
        combinedTablesHTML += '<hr />';
      }
    });

    // Basic Excel-friendly HTML template
    const htmlTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Sheet1</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <meta charset="utf-8" />
        <style>
          table { border-collapse: collapse; }
          table, th, td { border: 1px solid #ccc; }
          th, td { padding: 6px 8px; text-align: left; }
        </style>
      </head>
      <body>
        ${combinedTablesHTML}
      </body>
      </html>
    `;

    const blob = new Blob([htmlTemplate], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button type="button" onClick={handleExport} className={className}>
      {label}
    </button>
  );
};

export default ExportExcelButton;
