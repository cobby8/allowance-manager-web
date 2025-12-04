import React, { useState } from 'react';
import './PasswordModal.css';

interface PasswordModalProps {
    isOpen: boolean;
    onSubmit: (password: string) => void;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onSubmit }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 4) {
            setError('비밀번호는 최소 4자 이상이어야 합니다.');
            return;
        }
        onSubmit(password);
    };

    return (
        <div className="password-modal-overlay">
            <div className="password-modal-content">
                <h2 className="password-modal-title">보안 접속</h2>
                <p className="password-modal-description">
                    데이터 보호를 위해 세션 비밀번호를 설정해주세요.<br />
                    이 비밀번호는 데이터 암호화 및 복호화에 사용되며,<br />
                    새로고침 시 초기화됩니다.
                </p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        className="password-input"
                        placeholder="비밀번호 입력"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setError('');
                        }}
                        autoFocus
                    />
                    {error && <p className="password-error">{error}</p>}
                    <button type="submit" className="password-submit-btn">
                        확인
                    </button>
                </form>
            </div>
        </div>
    );
};
