import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { Employee, WorkRecord, SettlementData } from '../types';
import { fetchSheetData } from '../utils/sheetService';
import { processSheetData } from '../utils/dataProcessor';
import { fetchWorkRecordData } from '../utils/workRecordService';
import { matchEmployeesWithWorkRecords } from '../utils/employeeMatcher';

interface DataContextType {
    employees: Employee[];
    workRecords: WorkRecord[];
    settlementData: SettlementData[];
    loading: boolean;
    error: string | null;
    loadBaseData: (sheetId: string, encryptionKey: string) => Promise<void>;
    loadWorkRecords: (sheetId: string, encryptionKey: string) => Promise<void>;
    resetData: () => void;
    hasBaseData: boolean;
    hasWorkRecords: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [workRecords, setWorkRecords] = useState<WorkRecord[]>([]);
    const [settlementData, setSettlementData] = useState<SettlementData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadBaseData = async (sheetId: string, encryptionKey: string) => {
        setLoading(true);
        setError(null);
        try {
            const rawData = await fetchSheetData(sheetId, encryptionKey);
            const processedData = processSheetData(rawData);
            setEmployees(processedData);

            // If work records already loaded, match them
            if (workRecords.length > 0) {
                const matched = matchEmployeesWithWorkRecords(processedData, workRecords);
                setSettlementData(matched);
            }
        } catch (err) {
            setError('베이스 데이터 로드 실패');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadWorkRecords = async (sheetId: string, encryptionKey: string) => {
        setLoading(true);
        setError(null);
        try {
            const records = await fetchWorkRecordData(sheetId, encryptionKey);
            setWorkRecords(records);

            // If base data already loaded, match them
            if (employees.length > 0) {
                const matched = matchEmployeesWithWorkRecords(employees, records);
                setSettlementData(matched);
            }
        } catch (err) {
            setError('근무 내역 로드 실패');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const resetData = () => {
        setEmployees([]);
        setWorkRecords([]);
        setSettlementData([]);
        setError(null);
    };

    const hasBaseData = employees.length > 0;
    const hasWorkRecords = workRecords.length > 0;

    return (
        <DataContext.Provider value={{
            employees,
            workRecords,
            settlementData,
            loading,
            error,
            loadBaseData,
            loadWorkRecords,
            resetData,
            hasBaseData,
            hasWorkRecords
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
