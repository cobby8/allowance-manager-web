import { useState } from 'react';
import './TutorialModal.css';

interface TutorialModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TutorialModal = ({ isOpen, onClose }: TutorialModalProps) => {
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        {
            title: '환영합니다! 👋',
            content: (
                <>
                    <p><strong>정산 자동화 시스템</strong>에 오신 것을 환영합니다.</p>
                    <p>이 튜토리얼에서는 구글 시트의 직원 정보와 근무 내역을 자동으로 매칭하여 PDF를 생성하는 방법을 안내합니다.</p>
                    <div className="tutorial-highlight">
                        <strong>💡 준비물</strong>
                        <ul>
                            <li>직원 기본 정보가 담긴 구글 시트</li>
                            <li>근무 내역이 담긴 구글 시트 (선택)</li>
                        </ul>
                    </div>
                </>
            ),
            image: '/C:/Users/cobby/.gemini/antigravity/brain/41113a6f-d839-40ba-a015-c3824157f959/initial_landing_page_1764526756117.png'
        },
        {
            title: '1단계: 구글 시트 준비하기 📋',
            content: (
                <>
                    <p>먼저 구글 시트를 공유 설정해야 합니다.</p>
                    <div className="tutorial-steps">
                        <div className="step-item">
                            <span className="step-number">1</span>
                            <div>
                                <strong>구글 시트 열기</strong>
                                <p>직원 정보가 담긴 구글 시트를 엽니다</p>
                            </div>
                        </div>
                        <div className="step-item">
                            <span className="step-number">2</span>
                            <div>
                                <strong>공유 버튼 클릭</strong>
                                <p>오른쪽 상단의 "공유" 버튼을 클릭합니다</p>
                            </div>
                        </div>
                        <div className="step-item">
                            <span className="step-number">3</span>
                            <div>
                                <strong>링크 공유 설정</strong>
                                <p>"링크가 있는 모든 사용자"로 변경하고 권한은 "뷰어"로 설정합니다</p>
                            </div>
                        </div>
                    </div>
                    <div className="tutorial-warning">
                        ⚠️ 이 설정을 하지 않으면 시트를 불러올 수 없습니다!
                    </div>
                </>
            )
        },
        {
            title: '2단계: 시트 ID 복사하기 🔗',
            content: (
                <>
                    <p>구글 시트의 주소에서 ID를 복사합니다.</p>
                    <div className="tutorial-example">
                        <p><strong>예시 주소:</strong></p>
                        <code>
                            https://docs.google.com/spreadsheets/d/<span className="highlight">1Vzo1a5jwx1Mx0w41fOEJHy-bq2KPj6pLU7ySUbGw29E</span>/edit
                        </code>
                        <p className="tutorial-tip">
                            💡 <code>/d/</code>와 <code>/edit</code> 사이의 긴 문자열이 시트 ID입니다
                        </p>
                    </div>
                    <div className="tutorial-steps">
                        <div className="step-item">
                            <span className="step-number">1</span>
                            <div>
                                <strong>주소창 클릭</strong>
                                <p>구글 시트 상단의 주소창을 클릭합니다</p>
                            </div>
                        </div>
                        <div className="step-item">
                            <span className="step-number">2</span>
                            <div>
                                <strong>ID 부분 선택</strong>
                                <p>/d/ 와 /edit 사이의 문자열을 드래그하여 선택합니다</p>
                            </div>
                        </div>
                        <div className="step-item">
                            <span className="step-number">3</span>
                            <div>
                                <strong>복사하기</strong>
                                <p>Ctrl+C (또는 우클릭 → 복사)로 복사합니다</p>
                            </div>
                        </div>
                    </div>
                </>
            )
        },
        {
            title: '3단계: 베이스 데이터 불러오기 📥',
            content: (
                <>
                    <p>복사한 시트 ID를 입력하여 직원 정보를 불러옵니다.</p>
                    <div className="tutorial-steps">
                        <div className="step-item">
                            <span className="step-number">1</span>
                            <div>
                                <strong>시트 ID 붙여넣기</strong>
                                <p>"베이스 데이터 시트 ID" 입력란에 Ctrl+V로 붙여넣습니다</p>
                            </div>
                        </div>
                        <div className="step-item">
                            <span className="step-number">2</span>
                            <div>
                                <strong>불러오기 버튼 클릭</strong>
                                <p>"베이스 데이터 불러오기" 버튼을 클릭합니다</p>
                            </div>
                        </div>
                        <div className="step-item">
                            <span className="step-number">3</span>
                            <div>
                                <strong>데이터 확인</strong>
                                <p>잠시 후 직원 목록이 테이블로 표시됩니다</p>
                            </div>
                        </div>
                    </div>
                </>
            ),
            image: '/C:/Users/cobby/.gemini/antigravity/brain/41113a6f-d839-40ba-a015-c3824157f959/base_data_loaded_1764526803488.png'
        },
        {
            title: '4단계: 근무 내역 연결하기 (선택) 🔄',
            content: (
                <>
                    <p>근무 내역 시트를 연결하면 자동으로 급여 정산이 됩니다.</p>
                    <div className="tutorial-info">
                        <strong>📌 이 단계는 선택사항입니다</strong>
                        <p>증빙자료(신분증, 통장사본)만 필요한 경우 이 단계를 건너뛸 수 있습니다.</p>
                    </div>
                    <div className="tutorial-steps">
                        <div className="step-item">
                            <span className="step-number">1</span>
                            <div>
                                <strong>근무 내역 시트 ID 복사</strong>
                                <p>2단계와 동일한 방법으로 근무 내역 시트의 ID를 복사합니다</p>
                            </div>
                        </div>
                        <div className="step-item">
                            <span className="step-number">2</span>
                            <div>
                                <strong>ID 입력 및 불러오기</strong>
                                <p>"근무 내역 시트 ID"에 붙여넣고 버튼을 클릭합니다</p>
                            </div>
                        </div>
                        <div className="step-item">
                            <span className="step-number">3</span>
                            <div>
                                <strong>자동 매칭 확인</strong>
                                <p>시스템이 자동으로 직원과 근무 내역을 매칭합니다</p>
                            </div>
                        </div>
                    </div>
                </>
            )
        },
        {
            title: '5단계: PDF 다운로드하기 📄',
            content: (
                <>
                    <p>이제 필요한 PDF를 다운로드할 수 있습니다!</p>
                    <div className="tutorial-download-options">
                        <div className="download-option">
                            <strong>📋 지급명세서</strong>
                            <p>급여 내역이 포함된 공식 문서</p>
                            <ul>
                                <li>직원 기본 정보</li>
                                <li>근무 날짜 및 구분</li>
                                <li>지급액, 공제액, 실수령액</li>
                            </ul>
                        </div>
                        <div className="download-option">
                            <strong>📎 증빙자료</strong>
                            <p>신분증, 통장사본, 자격증 이미지</p>
                            <ul>
                                <li>A4 가로 레이아웃</li>
                                <li>4분할 그리드 형식</li>
                                <li>기본 정보 + 이미지 3장</li>
                            </ul>
                        </div>
                    </div>
                    <div className="tutorial-tip">
                        💡 <strong>팁:</strong> "전체 명세서 다운로드" 버튼을 누르면 모든 직원의 문서를 하나의 PDF로 받을 수 있습니다!
                    </div>
                </>
            ),
            image: '/C:/Users/cobby/.gemini/antigravity/brain/41113a6f-d839-40ba-a015-c3824157f959/final_data_grid_1764526857813.png'
        },
        {
            title: '완료! 🎉',
            content: (
                <>
                    <p><strong>튜토리얼을 완료했습니다!</strong></p>
                    <p>이제 정산 자동화 시스템을 자유롭게 사용하실 수 있습니다.</p>
                    <div className="tutorial-final-tips">
                        <h4>자주 묻는 질문</h4>
                        <div className="faq-item">
                            <strong>Q. 시트를 불러올 수 없다는 오류가 나타나요</strong>
                            <p>A. 구글 시트의 공유 설정을 "링크가 있는 모든 사용자"로 변경했는지 확인하세요.</p>
                        </div>
                        <div className="faq-item">
                            <strong>Q. 매칭이 제대로 되지 않아요</strong>
                            <p>A. 직원 이름, 주민등록번호, 연락처가 두 시트에서 정확히 일치하는지 확인하세요.</p>
                        </div>
                        <div className="faq-item">
                            <strong>Q. 데이터를 초기화하고 싶어요</strong>
                            <p>A. 화면 오른쪽 상단의 "전체 초기화" 버튼을 클릭하세요.</p>
                        </div>
                    </div>
                    <div className="tutorial-success">
                        ✅ 문제가 해결되지 않으면 관리자에게 문의하세요
                    </div>
                </>
            )
        }
    ];

    if (!isOpen) return null;

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleClose = () => {
        setCurrentStep(0);
        onClose();
    };

    return (
        <div className="tutorial-overlay" onClick={handleClose}>
            <div className="tutorial-modal" onClick={(e) => e.stopPropagation()}>
                <button className="tutorial-close" onClick={handleClose}>×</button>

                <div className="tutorial-header">
                    <h2>{steps[currentStep].title}</h2>
                    <div className="tutorial-progress">
                        {steps.map((_, index) => (
                            <div
                                key={index}
                                className={`progress-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="tutorial-body">
                    {steps[currentStep].image && (
                        <div className="tutorial-image">
                            <img src={steps[currentStep].image} alt={steps[currentStep].title} />
                        </div>
                    )}
                    <div className="tutorial-content">
                        {steps[currentStep].content}
                    </div>
                </div>

                <div className="tutorial-footer">
                    <button
                        className="tutorial-btn tutorial-btn-secondary"
                        onClick={handlePrev}
                        disabled={currentStep === 0}
                    >
                        이전
                    </button>
                    <span className="tutorial-step-indicator">
                        {currentStep + 1} / {steps.length}
                    </span>
                    {currentStep < steps.length - 1 ? (
                        <button
                            className="tutorial-btn tutorial-btn-primary"
                            onClick={handleNext}
                        >
                            다음
                        </button>
                    ) : (
                        <button
                            className="tutorial-btn tutorial-btn-primary"
                            onClick={handleClose}
                        >
                            시작하기
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TutorialModal;
