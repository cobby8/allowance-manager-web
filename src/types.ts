export interface RawSheetRow {
    [key: string]: any;
}

export interface Employee {
    id: string;
    name: string;
    residentId: string;
    address: string;
    phoneNumber: string;
    bankName: string;
    accountNumber: string;
    workDate: string;
    workPlace: string;
    dailyRate: string;
    idCardImage: string;
    bankBookImage: string;
    licenseImage: string;
    raw: RawSheetRow;
}

export const COLUMN_MAPPING: Record<string, keyof Omit<Employee, 'id' | 'raw'>> = {
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

    // Phone Number mappings
    '연락처': 'phoneNumber',
    'Phone': 'phoneNumber',
    'Phone Number': 'phoneNumber',
    '전화번호': 'phoneNumber',

    // Bank Name mappings
    '은행명': 'bankName',
    '은행': 'bankName', // Added '은행'
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
    '타임스탬프': 'workDate', // Mapping Timestamp to Work Date

    // Work Place mappings
    '장소': 'workPlace',
    '근무지': 'workPlace',
    'Work Place': 'workPlace',
    'Place': 'workPlace',
    '소속': 'workPlace', // Mapping Affiliation to Work Place

    // Daily Rate mappings
    '수당': 'dailyRate',
    '금액': 'dailyRate',
    'Daily Rate': 'dailyRate',
    'Amount': 'dailyRate',
    '정산유형': 'dailyRate', // Mapping Settlement Type to Daily Rate (maybe?)

    // ID Card Image mappings
    '신분증': 'idCardImage',
    '신분증 사본': 'idCardImage',
    '신분증사본': 'idCardImage',
    'ID Card': 'idCardImage',
    'ID Card Image': 'idCardImage',

    // Bank Book Image mappings
    '통장사본': 'bankBookImage',
    '통장 사본': 'bankBookImage',
    '통장': 'bankBookImage',
    'Bank Book': 'bankBookImage',
    'Bank Book Image': 'bankBookImage',

    // License Image mappings
    '자격증': 'licenseImage',
    '자격증 사본': 'licenseImage',
    '자격증사본': 'licenseImage',
    'License': 'licenseImage',
    'License Image': 'licenseImage',
};

// Work Record types
export interface WorkRecord {
    date: string;
    category: string; // 구분
    name: string;
    residentId: string;
    phoneNumber: string; // Added phoneNumber
    bankName: string;
    accountNumber: string;
    grossAmount: number; // 지급액(A)
    businessTax: number; // 사업/기타소득세(B)
    localTax: number; // 지방소득세(C)
    netAmount: number; // 차인지급액(A-B-C)
    raw: RawSheetRow;
}

export interface SettlementData extends Employee {
    workRecords: WorkRecord[];
    totalGrossAmount: number;
    totalNetAmount: number;
    matchStatus: 'matched' | 'unmatched' | 'partial';
}

export const WORK_RECORD_MAPPING: Record<string, string> = {
    '구분': 'category',
    '이름': 'name',
    '주민등록번호': 'residentId',
    '연락처': 'phoneNumber', // Added mapping
    '전화번호': 'phoneNumber',
    '은행명': 'bankName',
    '은행': 'bankName',
    '계좌번호': 'accountNumber',
    '지급액(A)': 'grossAmount',
    '지급액': 'grossAmount',
    '사업/기타소득세(B)': 'businessTax',
    '지방소득세(C)': 'localTax',
    '차인지급액(A-B-C)': 'netAmount',
    '실수령액': 'netAmount',
};

