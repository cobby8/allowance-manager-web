import { useState, useMemo } from 'react';
import type { Employee, SettlementData } from '../types';
import { Search, Eye, FileText, MapPin, Calendar, CheckCircle, AlertCircle, XCircle, Download, FileImage } from 'lucide-react';
import ImagePreview from './ImagePreview';
import { generatePayslip, generateEvidenceDocument, generateBulkPayslips, generateBulkEvidence } from '../utils/pdfGenerator';
import './DataGrid.css';

interface DataGridProps {
    data: (Employee | SettlementData)[];
    hasWorkRecords?: boolean;
    encryptionKey: string;
}

export default function DataGrid({ data, hasWorkRecords = false, encryptionKey }: DataGridProps) {
    // Type guard to check if data is SettlementData
    const isSettlementData = (item: Employee | SettlementData): item is SettlementData => {
        return hasWorkRecords && 'workRecords' in item;
    };

    const [filter, setFilter] = useState('');
    const [preview, setPreview] = useState<{ src: string; alt: string; isOpen: boolean }>({
        src: '',
        alt: '',
        isOpen: false,
    });
    const [generatingId, setGeneratingId] = useState<string | null>(null);
    const [isBulkGenerating, setIsBulkGenerating] = useState(false);
    const [locationFilter, setLocationFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    const locations = useMemo(() => {
        const locs = new Set(data.map(d => d.workPlace).filter(Boolean));
        return Array.from(locs).sort();
    }, [data]);

    const handleGeneratePayslip = async (employee: Employee) => {
        try {
            setGeneratingId(`payslip-${employee.id}`);
            await generatePayslip(employee, encryptionKey);
        } catch (error) {
            console.error('Failed to generate PDF', error);
            alert('PDF 생성에 실패했습니다.');
        } finally {
            setGeneratingId(null);
        }
    };

    const handleGenerateEvidence = async (employee: Employee) => {
        try {
            setGeneratingId(`evidence-${employee.id}`);
            await generateEvidenceDocument(employee, encryptionKey);
        } catch (error) {
            console.error('Failed to generate PDF', error);
            alert('증빙자료 생성에 실패했습니다.');
        } finally {
            setGeneratingId(null);
        }
    };

    const filteredData = useMemo(() => {
        return data.filter((employee) => {
            // Filter out employees with no work records if hasWorkRecords is true
            if (hasWorkRecords && isSettlementData(employee) && employee.workRecords.length === 0) {
                return false;
            }

            const searchTerm = filter.toLowerCase();
            const matchesSearch =
                employee.name.toLowerCase().includes(searchTerm) ||
                (employee.address && employee.address.toLowerCase().includes(searchTerm)) ||
                (employee.workPlace && employee.workPlace.toLowerCase().includes(searchTerm));

            const matchesLocation = locationFilter ? employee.workPlace === locationFilter : true;
            const matchesDate = dateFilter ? (employee.workDate && employee.workDate.includes(dateFilter)) : true;

            return matchesSearch && matchesLocation && matchesDate;
        });
    }, [data, filter, locationFilter, dateFilter, hasWorkRecords]);

    const handleBulkDownloadPayslips = async () => {
        if (filteredData.length === 0) return;
        try {
            setIsBulkGenerating(true);
            await generateBulkPayslips(filteredData, encryptionKey);
        } catch (error) {
            console.error('Bulk download failed', error);
            alert('전체 다운로드에 실패했습니다.');
        } finally {
            setIsBulkGenerating(false);
        }
    };

    const handleBulkDownloadEvidence = async () => {
        if (filteredData.length === 0) return;
        try {
            setIsBulkGenerating(true);
            await generateBulkEvidence(filteredData, encryptionKey);
        } catch (error) {
            console.error('Bulk download failed', error);
            alert('전체 다운로드에 실패했습니다.');
        } finally {
            setIsBulkGenerating(false);
        }
    };

    const openPreview = (src: string, alt: string) => {
        setPreview({ src, alt, isOpen: true });
    };

    const closePreview = () => {
        setPreview({ ...preview, isOpen: false });
    };

    return (
        <div className="data-grid-container">
            <div className="filters-section">
                <div className="filters-grid">
                    <div className="filter-group">
                        <label className="filter-label">
                            <Search size={14} style={{ display: 'inline', marginRight: '4px' }} />
                            검색
                        </label>
                        <input
                            type="text"
                            placeholder="이름, 주소 검색..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="filter-input"
                        />
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">
                            <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
                            소속
                        </label>
                        <select
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="">전체</option>
                            {locations.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">
                            <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                            날짜
                        </label>
                        <input
                            type="text"
                            placeholder="YYYY-MM-DD"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="filter-input"
                        />
                    </div>
                </div>

                {/* Bulk Download Buttons */}
                {filteredData.length > 0 && (
                    <div style={{ marginTop: '16px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button
                            onClick={handleBulkDownloadPayslips}
                            disabled={isBulkGenerating}
                            className="btn-pdf"
                            style={{ width: 'auto', backgroundColor: '#4b5563' }}
                        >
                            <Download size={16} /> 전체 명세서 다운로드 ({filteredData.length}명)
                        </button>
                        <button
                            onClick={handleBulkDownloadEvidence}
                            disabled={isBulkGenerating}
                            className="btn-pdf"
                            style={{ width: 'auto', backgroundColor: '#059669' }}
                        >
                            <Download size={16} /> 전체 증빙자료 다운로드 ({filteredData.length}명)
                        </button>
                    </div>
                )}
            </div>

            {filteredData.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">🔍</div>
                    <h3 className="empty-state-title">검색 결과가 없습니다</h3>
                    <p className="empty-state-message">
                        다른 검색어나 필터를 시도해보세요
                    </p>
                </div>
            ) : (
                <>
                    <div className="employees-grid">
                        {filteredData.map((employee) => (
                            <div key={employee.id} className="employee-card">
                                <div className="employee-header">
                                    <div>
                                        <h3 className="employee-name">{employee.name}</h3>
                                        <p className="employee-id">{employee.residentIdMasked || '******-*******'}</p>
                                    </div>
                                    {isSettlementData(employee) && (
                                        <div>
                                            {employee.matchStatus === 'matched' && (
                                                <span style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    fontSize: '12px',
                                                    color: 'var(--color-success)',
                                                    fontWeight: 600
                                                }}>
                                                    <CheckCircle size={16} /> 매칭됨
                                                </span>
                                            )}
                                            {employee.matchStatus === 'partial' && (
                                                <span
                                                    className="has-tooltip"
                                                    data-tooltip="이름은 일치하지만 주민등록번호가 다릅니다.&#10;동명이인일 수 있으니 확인이 필요합니다."
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        fontSize: '12px',
                                                        color: 'var(--color-warning)',
                                                        fontWeight: 600
                                                    }}>
                                                    <AlertCircle size={16} /> 부분매칭
                                                </span>
                                            )}
                                            {employee.matchStatus === 'unmatched' && (
                                                <span style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    fontSize: '12px',
                                                    color: 'var(--color-gray-500)',
                                                    fontWeight: 600
                                                }}>
                                                    <XCircle size={16} /> 미매칭
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="employee-info">
                                    <div className="info-row">
                                        <span className="info-label">연락처</span>
                                        <span className="info-value">{employee.phoneNumber || employee.address || '-'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">소속</span>
                                        <span className="info-value">{employee.workPlace || '-'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">은행</span>
                                        <span className="info-value">{employee.bankName || '-'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">계좌번호</span>
                                        <span className="info-value">{employee.accountNumberMasked || '-'}</span>
                                    </div>

                                    {isSettlementData(employee) && employee.workRecords.length > 0 && (
                                        <>
                                            <div style={{
                                                borderTop: '1px solid var(--color-gray-200)',
                                                marginTop: 'var(--spacing-md)',
                                                paddingTop: 'var(--spacing-md)'
                                            }}>
                                                <div className="info-row">
                                                    <span className="info-label">근무일수</span>
                                                    <span className="info-value">{employee.workRecords.length}일</span>
                                                </div>
                                                <div className="info-row">
                                                    <span className="info-label">총 지급액</span>
                                                    <span className="info-value" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                                                        {employee.totalGrossAmount.toLocaleString()}원
                                                    </span>
                                                </div>
                                                <div className="info-row">
                                                    <span className="info-label">실수령액</span>
                                                    <span className="info-value" style={{ fontWeight: 700 }}>
                                                        {employee.totalNetAmount.toLocaleString()}원
                                                    </span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {(employee.idCardImage || employee.bankBookImage || employee.licenseImage) && (
                                    <div className="employee-documents">
                                        {employee.idCardImage && (
                                            <button
                                                onClick={() => openPreview(employee.idCardImage, '신분증')}
                                                className="doc-badge"
                                            >
                                                <Eye size={12} /> 신분증
                                            </button>
                                        )}
                                        {employee.bankBookImage && (
                                            <button
                                                onClick={() => openPreview(employee.bankBookImage, '통장사본')}
                                                className="doc-badge"
                                            >
                                                <Eye size={12} /> 통장사본
                                            </button>
                                        )}
                                        {employee.licenseImage && (
                                            <button
                                                onClick={() => openPreview(employee.licenseImage, '자격증')}
                                                className="doc-badge"
                                            >
                                                <Eye size={12} /> 자격증
                                            </button>
                                        )}
                                    </div>
                                )}

                                <div className="employee-actions" style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        className="btn-pdf"
                                        onClick={() => handleGeneratePayslip(employee)}
                                        disabled={generatingId === `payslip-${employee.id}`}
                                        style={{ flex: 1 }}
                                    >
                                        {generatingId === `payslip-${employee.id}` ? (
                                            <>
                                                <div className="pdf-spinner" />
                                                생성 중...
                                            </>
                                        ) : (
                                            <>
                                                <FileText size={16} />
                                                명세서
                                            </>
                                        )}
                                    </button>
                                    <button
                                        className="btn-pdf"
                                        onClick={() => handleGenerateEvidence(employee)}
                                        disabled={generatingId === `evidence-${employee.id}`}
                                        style={{ flex: 1, backgroundColor: '#059669' }}
                                    >
                                        {generatingId === `evidence-${employee.id}` ? (
                                            <>
                                                <div className="pdf-spinner" />
                                                생성 중...
                                            </>
                                        ) : (
                                            <>
                                                <FileImage size={16} />
                                                증빙자료
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="results-count">
                        총 <strong>{filteredData.length}</strong>명 / {data.length}명
                    </p>
                </>
            )}

            <ImagePreview
                src={preview.src}
                alt={preview.alt}
                isOpen={preview.isOpen}
                onClose={closePreview}
            />
        </div>
    );
}
