import type { Employee, WorkRecord, SettlementData } from '../types';

/**
 * Normalizes a string for comparison by removing spaces and hyphens
 */
const normalize = (str: string): string => {
    return String(str || '').replace(/[^0-9]/g, '');
};

/**
 * Matches work records to employees based on resident ID and name
 */
export const matchEmployeesWithWorkRecords = (
    employees: Employee[],
    workRecords: WorkRecord[]
): SettlementData[] => {
    return employees.map(employee => {
        // Determine match status
        let matchStatus: 'matched' | 'unmatched' | 'partial';

        // Re-evaluating logic to support "Partial Match" display
        // We want to show the records even if they are partial matches, so the user can verify.
        const potentialRecords = workRecords.filter(record => {
            const empName = normalize(employee.name);
            const recName = normalize(record.name);
            const empResId = normalize(employee.residentId);
            const recResId = normalize(record.residentId);

            // Include if Name matches OR Resident ID matches
            return (empName && recName && empName === recName) || (empResId && recResId && empResId === recResId);
        });

        const finalRecords = potentialRecords;
        const finalTotalGross = finalRecords.reduce((sum, r) => sum + r.grossAmount, 0);
        const finalTotalNet = finalRecords.reduce((sum, r) => sum + r.netAmount, 0);

        if (finalRecords.length === 0) {
            matchStatus = 'unmatched';
        } else {
            // Check if ALL records meet strict criteria
            const allStrictMatch = finalRecords.every(record => {
                const empResId = normalize(employee.residentId);
                const recResId = normalize(record.residentId);
                const empPhone = normalize(employee.phoneNumber);
                const recPhone = normalize(record.phoneNumber);

                const resIdMatch = empResId && recResId && empResId === recResId;
                const phoneMatch = empPhone && recPhone && empPhone === recPhone;

                // Strict if ResidentID matches OR (Name matches AND Phone matches)
                return resIdMatch || phoneMatch;
            });

            matchStatus = allStrictMatch ? 'matched' : 'partial';
        }

        return {
            ...employee,
            workRecords: finalRecords,
            totalGrossAmount: finalTotalGross,
            totalNetAmount: finalTotalNet,
            matchStatus
        };
    });
};

/**
 * Gets unmatched work records (records that don't match any employee)
 */
export const getUnmatchedWorkRecords = (
    employees: Employee[],
    workRecords: WorkRecord[]
): WorkRecord[] => {
    return workRecords.filter(record => {
        return !employees.some(employee => {
            const empResId = normalize(employee.residentId);
            const recResId = normalize(record.residentId);
            const empName = normalize(employee.name);
            const recName = normalize(record.name);

            // Considered matched if ResidentID matches OR Name matches
            return (empResId && recResId && empResId === recResId) || (empName && recName && empName === recName);
        });
    });
};
