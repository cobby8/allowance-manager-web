import { read, utils } from 'xlsx';
import { WORK_RECORD_MAPPING, type WorkRecord } from '../types';

export const fetchWorkRecordData = async (sheetId: string): Promise<WorkRecord[]> => {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch work record sheet');
        const arrayBuffer = await response.arrayBuffer();
        const workbook = read(arrayBuffer);
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Use header: 1 to get array of arrays
        const rows: any[][] = utils.sheet_to_json(worksheet, { header: 1 });

        if (rows.length === 0) return [];

        let currentDate = '';
        const workRecords: WorkRecord[] = [];
        let headerMap: Record<string, number> = {};

        // Helper to convert Excel serial date to JS Date
        const excelDateToJSDate = (serial: number) => {
            const utc_days = Math.floor(serial - 25569);
            const utc_value = utc_days * 86400;
            const date_info = new Date(utc_value * 1000);
            return date_info;
        };

        // Helper to format date
        const formatDateFromSerial = (serial: number) => {
            const date = excelDateToJSDate(serial);
            return `${date.getMonth() + 1}/${date.getDate()}`;
        };

        // Helper to find headers in a row
        const mapHeaders = (row: any[]) => {
            const map: Record<string, number> = {};
            row.forEach((cell, index) => {
                if (typeof cell === 'string') {
                    const trimmed = cell.trim();
                    if (WORK_RECORD_MAPPING[trimmed]) {
                        map[WORK_RECORD_MAPPING[trimmed]] = index;
                    }
                }
            });
            return map;
        };

        // Initialize with first row
        if (rows.length > 0) {
            headerMap = mapHeaders(rows[0]);
            const firstCell = rows[0][0];
            console.log('Row 0, Cell 0:', firstCell, 'Type:', typeof firstCell);

            if (typeof firstCell === 'string' && firstCell.includes('월') && firstCell.includes('일')) {
                currentDate = firstCell;
                console.log('Initial Date Detected (String):', currentDate);
            } else if (typeof firstCell === 'number' && firstCell > 40000) {
                currentDate = formatDateFromSerial(firstCell);
                console.log('Initial Date Detected (Number):', currentDate);
            }
        }

        // Iterate through all rows
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const firstCell = row[0];

            // Check if this is a header row (contains date in first cell)
            let isHeader = false;

            if (typeof firstCell === 'string' && firstCell.includes('월') && firstCell.includes('일')) {
                currentDate = firstCell;
                isHeader = true;
                console.log('New Date Context (String):', currentDate, 'at row', i);
            } else if (typeof firstCell === 'number' && firstCell > 40000) {
                currentDate = formatDateFromSerial(firstCell);
                isHeader = true;
                console.log('New Date Context (Number):', currentDate, 'at row', i);
            }

            if (isHeader) {
                // Update header map just in case columns shifted
                const newMap = mapHeaders(row);
                if (Object.keys(newMap).length > 0) {
                    headerMap = newMap;
                }
                continue;
            }

            // Skip empty rows or rows that look like headers but aren't data
            const nameIdx = headerMap['name'];
            const amountIdx = headerMap['grossAmount'];

            if (nameIdx === undefined && amountIdx === undefined) continue;

            const name = row[nameIdx];
            // If name is empty or is the header "이름", skip
            if (!name || name === '이름') continue;

            // It's a data row!
            const record: any = {
                date: currentDate,
                raw: { ...row } // Store raw array as object
            };

            // Map fields using headerMap
            Object.entries(headerMap).forEach(([key, index]) => {
                const value = row[index];
                // Convert numeric fields
                if (['grossAmount', 'businessTax', 'localTax', 'netAmount'].includes(key)) {
                    record[key] = parseFloat(String(value || 0).replace(/,/g, '')) || 0;
                } else {
                    record[key] = String(value || '').trim();
                }
            });

            workRecords.push(record as WorkRecord);
        }

        return workRecords;

    } catch (error) {
        console.error("Error fetching work record sheet:", error);
        throw error;
    }
};
