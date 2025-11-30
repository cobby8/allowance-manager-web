import type { Employee, RawSheetRow } from '../types';

// Format phone number to XXX-XXXX-XXXX format
const formatPhoneNumber = (phone: string): string => {
    if (!phone) return '';

    // Remove all non-numeric characters
    const numbers = phone.replace(/\D/g, '');

    // If already formatted or not a valid length, return as is
    if (numbers.length !== 10 && numbers.length !== 11) return phone;

    // Format based on length
    if (numbers.length === 10) {
        // 0XX-XXXX-XXXX format
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
    } else {
        // 01X-XXXX-XXXX format
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
    }
};

export const processSheetData = (rawData: RawSheetRow[]): Employee[] => {
    return rawData.map((row, index) => {
        // The row should already have English keys like 'name', 'residentId' etc. from sheetService

        const phoneNumber = String(row.phoneNumber || row['연락처'] || row['전화번호'] || '').trim();

        return {
            id: `emp-${index}-${Date.now()}`,
            name: String(row.name || row['이름'] || row['성명'] || 'Unknown').trim(),
            residentId: String(row.residentId || row['주민등록번호'] || '').trim(),
            address: String(row.address || row['주소'] || '').trim(),
            phoneNumber: formatPhoneNumber(phoneNumber),
            bankName: String(row.bankName || row['은행명'] || '').trim(),
            accountNumber: String(row.accountNumber || row['계좌번호'] || '').trim(),
            workDate: String(row.workDate || row['날짜'] || row['근무일자'] || '').trim(),
            workPlace: String(row.workPlace || row['장소'] || row['근무지'] || '').trim(),
            dailyRate: String(row.dailyRate || row['수당'] || row['금액'] || '').trim(),
            idCardImage: String(row.idCardImage || row['신분증'] || '').trim(),
            bankBookImage: String(row.bankBookImage || row['통장사본'] || '').trim(),
            licenseImage: String(row.licenseImage || row['자격증'] || '').trim(),
            raw: row,
        } as Employee;
    });
};
