export interface TutorialStep {
    id: string;
    title: string;
    description: string;
    targetSelector?: string; // CSS selector for element to highlight
    position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
    action?: 'click' | 'input' | 'none';
    spotlightPadding?: number; // Padding around highlighted element
}

export const tutorialSteps: TutorialStep[] = [
    {
        id: 'welcome',
        title: '환영합니다! 👋',
        description: '정산 자동화 시스템에 오신 것을 환영합니다. 이 튜토리얼에서는 구글 시트의 직원 정보와 근무 내역을 자동으로 매칭하여 PDF를 생성하는 방법을 안내합니다.',
        position: 'center',
        action: 'none'
    },
    {
        id: 'password-setup',
        title: '보안 비밀번호 설정 🔐',
        description: '먼저 데이터 암호화를 위한 세션 비밀번호를 설정합니다. 이 비밀번호는 민감한 정보(주민등록번호, 계좌번호)를 보호하는 데 사용됩니다.',
        position: 'center',
        action: 'none'
    },
    {
        id: 'sheet-url-input',
        title: '구글 시트 URL 입력 📋',
        description: '직원 기본 정보가 담긴 구글 시트의 전체 URL 또는 시트 ID를 입력하세요. 시트는 "링크가 있는 모든 사용자"로 공유 설정되어 있어야 합니다.',
        targetSelector: '[data-tutorial-id="base-sheet-input"]',
        position: 'bottom',
        action: 'input',
        spotlightPadding: 20
    },
    {
        id: 'load-base-data',
        title: '베이스 데이터 불러오기 📥',
        description: '이 버튼을 클릭하여 직원 기본 정보를 불러옵니다. 잠시 후 직원 목록이 카드 형태로 표시됩니다.',
        targetSelector: '[data-tutorial-id="load-base-button"]',
        position: 'bottom',
        action: 'click',
        spotlightPadding: 15
    },
    {
        id: 'view-employees',
        title: '직원 데이터 확인 👥',
        description: '불러온 직원 정보를 확인하세요. 주민등록번호와 계좌번호는 보안을 위해 마스킹되어 표시됩니다. PDF 생성 시에만 실제 데이터가 사용됩니다.',
        targetSelector: '[data-tutorial-id="employee-grid"]',
        position: 'top',
        action: 'none',
        spotlightPadding: 20
    },
    {
        id: 'work-records-input',
        title: '근무 내역 연결 (선택) 🔄',
        description: '근무 내역 시트를 연결하면 자동으로 급여 정산이 됩니다. 이 단계는 선택사항이며, 증빙자료만 필요한 경우 건너뛸 수 있습니다.',
        targetSelector: '[data-tutorial-id="work-sheet-input"]',
        position: 'bottom',
        action: 'input',
        spotlightPadding: 20
    },
    {
        id: 'matching-result',
        title: '자동 매칭 확인 ✅',
        description: '시스템이 직원 정보와 근무 내역을 자동으로 매칭합니다. 매칭 상태는 "매칭됨", "부분매칭", "미매칭"으로 표시됩니다.',
        targetSelector: '[data-tutorial-id="settlement-data"]',
        position: 'top',
        action: 'none',
        spotlightPadding: 20
    },
    {
        id: 'pdf-generation',
        title: 'PDF 다운로드 📄',
        description: '각 직원의 카드에서 "명세서" 또는 "증빙자료" 버튼을 클릭하여 PDF를 다운로드할 수 있습니다. "전체 다운로드" 버튼으로 모든 직원의 문서를 한 번에 받을 수도 있습니다.',
        targetSelector: '[data-tutorial-id="pdf-buttons"]',
        position: 'left',
        action: 'none',
        spotlightPadding: 15
    },
    {
        id: 'complete',
        title: '튜토리얼 완료! 🎉',
        description: '축하합니다! 이제 정산 자동화 시스템을 자유롭게 사용하실 수 있습니다. 언제든지 우측 상단의 "튜토리얼" 버튼을 클릭하여 다시 확인할 수 있습니다.',
        position: 'center',
        action: 'none'
    }
];
