import { read, utils } from 'xlsx';
import { COLUMN_MAPPING, type RawSheetRow } from '../types';

export const fetchSheetData = async (sheetId: string): Promise<RawSheetRow[]> => {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch sheet');
        const arrayBuffer = await response.arrayBuffer();
        const workbook = read(arrayBuffer);
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData: any[] = utils.sheet_to_json(worksheet);

        // DEBUG: Log the first row to see actual headers
        if (jsonData.length > 0) {
            console.log('=== SHEET DEBUG ===');
            console.log('First row keys:', Object.keys(jsonData[0]));
            console.log('First row data:', jsonData[0]);
            console.log('COLUMN_MAPPING:', COLUMN_MAPPING);
        }

        // Map headers to English keys immediately
        return jsonData.map((row, index) => {
            const mappedRow: RawSheetRow = {};
            Object.entries(row).forEach(([key, value]) => {
                // Normalize key: remove ALL whitespace to handle '연 락 처', '연락처 ' etc.
                const normalizedKey = key.replace(/\s+/g, '');
                const trimmedKey = key.trim();

                // Try exact match first, then normalized match
                let mappedKey = COLUMN_MAPPING[trimmedKey];
                if (!mappedKey) {
                    // Try to find a mapping where the key also has whitespace removed
                    const mappingEntry = Object.entries(COLUMN_MAPPING).find(([k, _]) => k.replace(/\s+/g, '') === normalizedKey);
                    if (mappingEntry) {
                        mappedKey = mappingEntry[1];
                    }
                }

                if (mappedKey) {
                    mappedRow[mappedKey] = value;
                    // Debug phone number mapping
                    if (mappedKey === 'phoneNumber' && index < 3) {
                        console.log(`Phone mapping: "${key}" -> "${mappedKey}" = "${value}"`);
                    }
                }
                mappedRow[key] = value;
            });

            // Debug first 3 rows
            if (index < 3) {
                console.log(`Row ${index} phoneNumber:`, mappedRow.phoneNumber);
            }

            return mappedRow;
        });
    } catch (error) {
        console.error("Error fetching sheet:", error);
        throw error;
    }
};
