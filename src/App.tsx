import { useState } from 'react';
import { DataProvider, useData } from './context/DataContext';
import DataGrid from './components/DataGrid';
import TutorialModal from './components/TutorialModal';
import { PasswordModal } from './components/PasswordModal';
import './App.css';

function AppContent() {
  const {
    settlementData,
    employees,
    loadBaseData,
    loadWorkRecords,
    resetData,
    loading,
    error,
    hasBaseData,
    hasWorkRecords
  } = useData();

  const [baseSheetId, setBaseSheetId] = useState('');
  const [workSheetId, setWorkSheetId] = useState('');
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState('');

  const handleLoadBase = async () => {
    if (baseSheetId.trim()) {
      if (!encryptionKey) {
        setIsPasswordModalOpen(true);
        return;
      }
      await loadBaseData(baseSheetId, encryptionKey);
    }
  };

  const handlePasswordSubmit = async (password: string) => {
    setEncryptionKey(password);
    setIsPasswordModalOpen(false);
    if (baseSheetId.trim()) {
      await loadBaseData(baseSheetId, password);
    }
  };

  const handleLoadWork = async () => {
    if (workSheetId.trim()) {
      await loadWorkRecords(workSheetId);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' && !loading) {
      action();
    }
  };

  // Use settlement data if available, otherwise use base employees
  const displayData = hasWorkRecords ? settlementData : employees;

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-header-content">
          <h1 className="app-title">정산 자동화 시스템</h1>
          <p className="app-subtitle">대회 후 정산자료를 자동으로 생성하세요</p>
        </div>
        <button
          onClick={() => setIsTutorialOpen(true)}
          className="help-button"
          title="사용 매뉴얼 보기"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          사용 매뉴얼
        </button>
      </header>

      <TutorialModal isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />
      <PasswordModal isOpen={isPasswordModalOpen} onSubmit={handlePasswordSubmit} />

      <main className="app-main">
        {error && (
          <div className="error-alert">
            <p className="error-alert-title">오류가 발생했습니다</p>
            <p className="error-alert-message">{error}</p>
          </div>
        )}

        {!hasBaseData ? (
          <div className="connect-card">
            <h2 className="connect-card-title">1단계: 베이스 데이터 연결</h2>
            <p className="connect-card-description">
              직원 기본 정보가 있는 구글 시트를 연결하세요
            </p>

            <div className="form-group">
              <label htmlFor="baseSheetId" className="form-label">
                베이스 데이터 시트 ID
              </label>
              <input
                id="baseSheetId"
                type="text"
                value={baseSheetId}
                onChange={(e) => setBaseSheetId(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleLoadBase)}
                placeholder="예: 1Vzo1a5jwx1Mx0w41fOEJHy-bq2KPj6pLU7ySUbGw29E"
                className="form-input"
                disabled={loading}
              />
            </div>

            <button
              onClick={handleLoadBase}
              disabled={loading || !baseSheetId.trim()}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  연결 중...
                </>
              ) : (
                '베이스 데이터 불러오기'
              )}
            </button>
          </div>
        ) : (
          <div className="data-section">
            <div className="data-header">
              <div>
                <h2 className="data-title">
                  {hasWorkRecords ? '정산 데이터' : '직원 데이터'}
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--color-gray-600)', marginTop: '4px' }}>
                  {hasWorkRecords
                    ? `총 ${settlementData.length}명 (매칭됨: ${settlementData.filter(d => d.matchStatus === 'matched').length}명)`
                    : `총 ${employees.length}명`
                  }
                </p>
              </div>
              <button onClick={resetData} className="btn-secondary">
                전체 초기화
              </button>
            </div>

            {!hasWorkRecords && (
              <div className="connect-card" style={{ marginBottom: 'var(--spacing-3xl)' }}>
                <h3 className="connect-card-title">2단계: 근무 내역 연결 (선택)</h3>
                <p className="connect-card-description">
                  근무 내역 시트를 연결하면 자동으로 매칭하여 정산 데이터를 생성합니다
                </p>

                <div className="form-group">
                  <label htmlFor="workSheetId" className="form-label">
                    근무 내역 시트 ID
                  </label>
                  <input
                    id="workSheetId"
                    type="text"
                    value={workSheetId}
                    onChange={(e) => setWorkSheetId(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, handleLoadWork)}
                    placeholder="예: 10ePPpdm9h6Gqe91HefJr2TMYE11dNstrZtICZRXLTuk"
                    className="form-input"
                    disabled={loading}
                  />
                </div>

                <button
                  onClick={handleLoadWork}
                  disabled={loading || !workSheetId.trim()}
                  className="btn-primary"
                >
                  {loading ? (
                    <>
                      <div className="spinner" />
                      연결 중...
                    </>
                  ) : (
                    '근무 내역 불러오기'
                  )}
                </button>
              </div>
            )}

            <DataGrid
              data={displayData}
              hasWorkRecords={hasWorkRecords}
              encryptionKey={encryptionKey}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}
