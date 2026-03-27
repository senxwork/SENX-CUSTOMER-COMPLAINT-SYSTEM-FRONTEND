import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx-js-style';

@Injectable({
  providedIn: 'root'
})
export class ExcelExportService {

  private readonly thinBorder = {
    top: { style: 'thin', color: { rgb: '000000' } },
    bottom: { style: 'thin', color: { rgb: '000000' } },
    left: { style: 'thin', color: { rgb: '000000' } },
    right: { style: 'thin', color: { rgb: '000000' } }
  };

  exportToExcel(data: any[], fileName: string, sheetName: string = 'Sheet1'): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = {
      Sheets: { [sheetName]: worksheet },
      SheetNames: [sheetName]
    };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, fileName);
  }

  exportStyledReport(config: {
    title: string;
    dateRange: string;
    headers: string[];
    data: any[][];
    columnWidths?: number[];
    fileName: string;
    sheetName?: string;
  }): void {
    const { title, dateRange, headers, data, columnWidths, fileName, sheetName = 'Report' } = config;
    const totalCols = headers.length;

    const wsData: any[][] = [];
    wsData.push(this.buildMergedRow(title, totalCols));
    wsData.push(this.buildMergedRow(dateRange, totalCols));
    wsData.push(this.buildEmptyRow(totalCols));
    wsData.push(headers);
    for (const row of data) {
      wsData.push(row);
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } },
    ];

    this.applyTitleStyle(ws, 0, totalCols);
    this.applyDateStyle(ws, 1, totalCols);
    this.applyHeaderStyle(ws, 3, totalCols);

    const dataStyle = { font: { sz: 11 }, alignment: { vertical: 'center', wrapText: true }, border: this.thinBorder };
    const dataCenterStyle = { font: { sz: 11 }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true }, border: this.thinBorder };

    for (let r = 4; r < 4 + data.length; r++) {
      for (let c = 0; c < totalCols; c++) {
        const cell = XLSX.utils.encode_cell({ r, c });
        if (!ws[cell]) ws[cell] = { v: '', t: 's' };
        ws[cell].s = c === 0 ? dataCenterStyle : dataStyle;
      }
    }

    ws['!cols'] = this.calcAutoWidths(wsData, 3, totalCols);
    ws['!rows'] = [{ hpt: 30 }, { hpt: 20 }, { hpt: 10 }, { hpt: 25 }];

    this.writeAndSave(ws, sheetName, fileName);
  }

  /**
   * Export grouped report with Job rows (blue) and Ticket sub-rows
   * Job-level columns are merged when a job has multiple tickets
   */
  exportGroupedReport(config: {
    title: string;
    dateRange: string;
    headers: string[];
    groups: { jobRow: any[]; ticketRows: any[][]; }[];
    jobColCount: number; // Number of job-level columns (will be merged)
    columnWidths?: number[];
    fileName: string;
    sheetName?: string;
  }): void {
    const { title, dateRange, headers, groups, jobColCount, columnWidths, fileName, sheetName = 'Report' } = config;
    const totalCols = headers.length;

    // Build sheet data
    const wsData: any[][] = [];
    wsData.push(this.buildMergedRow(title, totalCols));
    wsData.push(this.buildMergedRow(dateRange, totalCols));
    wsData.push(this.buildEmptyRow(totalCols));
    wsData.push(headers);

    const HEADER_ROWS = 4; // title, date, spacer, header
    const merges: any[] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } },
    ];

    // Track which rows are job rows vs ticket rows for styling
    const jobRowIndices: number[] = [];
    const ticketRowIndices: number[] = [];

    for (const group of groups) {
      const totalRows = Math.max(1, group.ticketRows.length);
      const startRow = wsData.length;

      if (group.ticketRows.length === 0) {
        // Job without tickets: single row with "-" for ticket columns
        const row = [...group.jobRow];
        wsData.push(row);
        jobRowIndices.push(startRow);
      } else if (group.ticketRows.length === 1) {
        // Job with 1 ticket: single row combining job + ticket
        const row = [...group.jobRow.slice(0, jobColCount), ...group.ticketRows[0]];
        wsData.push(row);
        jobRowIndices.push(startRow);
      } else {
        // Job with multiple tickets: first row has job info + first ticket
        const firstRow = [...group.jobRow.slice(0, jobColCount), ...group.ticketRows[0]];
        wsData.push(firstRow);
        jobRowIndices.push(startRow);

        // Subsequent rows: empty job columns + ticket info
        for (let t = 1; t < group.ticketRows.length; t++) {
          const emptyJobCols = new Array(jobColCount).fill('');
          const ticketRow = [...emptyJobCols, ...group.ticketRows[t]];
          wsData.push(ticketRow);
          ticketRowIndices.push(startRow + t);
        }

        // Merge job-level columns vertically
        for (let c = 0; c < jobColCount; c++) {
          merges.push({
            s: { r: startRow, c },
            e: { r: startRow + totalRows - 1, c }
          });
        }
      }
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!merges'] = merges;

    // Apply styles
    this.applyTitleStyle(ws, 0, totalCols);
    this.applyDateStyle(ws, 1, totalCols);
    this.applyHeaderStyle(ws, 3, totalCols);

    // Data row styles - white background with borders
    const dataStyle = {
      font: { sz: 11 },
      alignment: { vertical: 'center', wrapText: true },
      border: this.thinBorder
    };
    const dataCenterStyle = {
      font: { sz: 11 },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: this.thinBorder
    };

    // Apply styles to all data rows (job + ticket)
    const allDataRows = [...jobRowIndices, ...ticketRowIndices];
    for (const r of allDataRows) {
      for (let c = 0; c < totalCols; c++) {
        const cell = XLSX.utils.encode_cell({ r, c });
        if (!ws[cell]) ws[cell] = { v: '', t: 's' };
        ws[cell].s = c === 0 ? dataCenterStyle : dataStyle;
      }
    }

    // Auto-fit column widths from content
    ws['!cols'] = this.calcAutoWidths(wsData, HEADER_ROWS, totalCols);

    // Remove fixed row heights so Excel uses auto
    ws['!rows'] = [{ hpt: 30 }, { hpt: 20 }, { hpt: 10 }, { hpt: 25 }];

    this.writeAndSave(ws, sheetName, fileName);
  }

  // --- Helper methods ---

  private buildMergedRow(text: string, cols: number): any[] {
    const row = [text];
    for (let i = 1; i < cols; i++) row.push('');
    return row;
  }

  private buildEmptyRow(cols: number): any[] {
    return new Array(cols).fill('');
  }

  private applyTitleStyle(ws: XLSX.WorkSheet, row: number, cols: number): void {
    const style = { font: { bold: true, sz: 16 }, alignment: { horizontal: 'center', vertical: 'center' } };
    for (let c = 0; c < cols; c++) {
      const cell = XLSX.utils.encode_cell({ r: row, c });
      if (!ws[cell]) ws[cell] = { v: '', t: 's' };
      ws[cell].s = style;
    }
  }

  private applyDateStyle(ws: XLSX.WorkSheet, row: number, cols: number): void {
    const style = { font: { sz: 12 }, alignment: { horizontal: 'center', vertical: 'center' } };
    for (let c = 0; c < cols; c++) {
      const cell = XLSX.utils.encode_cell({ r: row, c });
      if (!ws[cell]) ws[cell] = { v: '', t: 's' };
      ws[cell].s = style;
    }
  }

  private applyHeaderStyle(ws: XLSX.WorkSheet, row: number, cols: number): void {
    const style = {
      font: { bold: true, sz: 11 },
      fill: { fgColor: { rgb: 'FFFF00' } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: this.thinBorder
    };
    for (let c = 0; c < cols; c++) {
      const cell = XLSX.utils.encode_cell({ r: row, c });
      if (!ws[cell]) ws[cell] = { v: '', t: 's' };
      ws[cell].s = style;
    }
  }

  /**
   * Calculate auto-fit column widths from actual content
   * Scans header row + all data rows to find the widest value per column
   */
  private calcAutoWidths(wsData: any[][], headerRowIndex: number, totalCols: number): { wch: number }[] {
    const MIN_WIDTH = 8;
    const MAX_WIDTH = 60;
    const widths: number[] = new Array(totalCols).fill(MIN_WIDTH);

    for (let r = headerRowIndex; r < wsData.length; r++) {
      const row = wsData[r];
      for (let c = 0; c < totalCols; c++) {
        const val = row[c];
        if (val == null || val === '') continue;
        const str = String(val);
        // Thai/CJK characters are ~1.7x wider than latin
        let len = 0;
        for (const ch of str) {
          len += ch.charCodeAt(0) > 127 ? 1.7 : 1;
        }
        // Add padding
        len += 4;
        if (len > widths[c]) {
          widths[c] = Math.min(len, MAX_WIDTH);
        }
      }
    }

    return widths.map(w => ({ wch: Math.max(w, MIN_WIDTH) }));
  }

  private writeAndSave(ws: XLSX.WorkSheet, sheetName: string, fileName: string): void {
    // Force Normal view (not Page Break Preview)
    if (!ws['!sheetViews']) ws['!sheetViews'] = [];
    ws['!sheetViews'] = [{ view: 'normal', tabSelected: true, workbookViewId: 0 }];

    const workbook: XLSX.WorkBook = {
      Sheets: { [sheetName]: ws },
      SheetNames: [sheetName]
    };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, fileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}_${new Date().getTime()}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
