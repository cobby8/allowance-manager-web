
// Mocking the import to avoid ts-node config issues
const COLUMN_MAPPING: Record<string, string> = {
    // Name mappings
    '성명': 'name',
    '이름': 'name',
    'Name': 'name',

    // Resident ID mappings
    '주민등록번호': 'residentId',
    'Resident ID': 'residentId',

    // Address mappings
    '주소': 'address',
    'Address': 'address',

    // Bank Name mappings
    '은행명': 'bankName',
    'Bank Name': 'bankName',
    'Bank': 'bankName',

    // Account Number mappings
    '계좌번호': 'accountNumber',
    'Account Number': 'accountNumber',

    // Work Date mappings
    '날짜': 'workDate',
    '근무일자': 'workDate',
    'Work Date': 'workDate',
    'Date': 'workDate',

    // Work Place mappings
    '장소': 'workPlace',
    '근무지': 'workPlace',
    'Work Place': 'workPlace',
    'Place': 'workPlace',

    // Daily Rate mappings
    '수당': 'dailyRate',
    '금액': 'dailyRate',
    'Daily Rate': 'dailyRate',
    'Amount': 'dailyRate',

    // ID Card Image mappings
    '신분증': 'idCardImage',
    'ID Card': 'idCardImage',
    'ID Card Image': 'idCardImage',

    // Bank Book Image mappings
    '통장사본': 'bankBookImage',
    'Bank Book': 'bankBookImage',
    'Bank Book Image': 'bankBookImage',

    // License Image mappings
    '자격증': 'licenseImage',
    'License': 'licenseImage',
    'License Image': 'licenseImage',
};

// Mock data simulating what we get from xlsx.utils.sheet_to_json
const mockSheetData = [
    {
        '성명': '홍길동',
        '주민등록번호': '123456-1234567',
        '주소': '서울시 강남구',
        '은행명': '국민은행',
        '계좌번호': '123-456-789',
        '날짜': '2023-10-27',
        '장소': '본사',
        '수당': '100000',
        '신분증': 'id.jpg',
        '통장사본': 'bank.jpg',
        '자격증': 'license.jpg'
    }
];

console.log("Original Data (Korean Headers):");
console.log(mockSheetData);

// Simulate the logic in sheetService.ts
const mappedData = mockSheetData.map(row => {
    const mappedRow: any = {};
    Object.entries(row).forEach(([key, value]) => {
        const trimmedKey = key.trim();
        const mappedKey = COLUMN_MAPPING[trimmedKey];
        if (mappedKey) {
            mappedRow[mappedKey] = value;
        }
        mappedRow[key] = value;
    });
    return mappedRow;
});

console.log("\nMapped Data (English Keys):");
console.log(mappedData);

// Verify expected keys exist
const firstRow = mappedData[0];
const expectedKeys = ['name', 'residentId', 'address', 'bankName', 'accountNumber', 'workDate', 'workPlace', 'dailyRate', 'idCardImage', 'bankBookImage', 'licenseImage'];

const missingKeys = expectedKeys.filter(key => !firstRow[key]);

if (missingKeys.length === 0) {
    console.log("\nSUCCESS: All expected English keys are present.");
} else {
    console.error("\nFAILURE: Missing keys:", missingKeys);
}
