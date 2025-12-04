import { useState, useEffect, useRef } from 'react';
import { tutorialSteps } from '../utils/tutorialSteps';
import './InteractiveTutorial.css';

interface InteractiveTutorialProps {
    isActive: boolean;
    onComplete: () => void;
    onSkip: () => void;
}

export default function InteractiveTutorial({ isActive, onComplete, onSkip }: InteractiveTutorialProps) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    const currentStep = tutorialSteps[currentStepIndex];

    useEffect(() => {
        if (!isActive) return;

        // Update target element position
        if (currentStep.targetSelector) {
            const updateTargetPosition = () => {
                const element = document.querySelector(currentStep.targetSelector!);
                if (element) {
                    setTargetRect(element.getBoundingClientRect());
                } else {
                    setTargetRect(null);
                }
            };

            updateTargetPosition();
            window.addEventListener('resize', updateTargetPosition);
            window.addEventListener('scroll', updateTargetPosition);

            return () => {
                window.removeEventListener('resize', updateTargetPosition);
                window.removeEventListener('scroll', updateTargetPosition);
            };
        } else {
            setTargetRect(null);
        }
    }, [currentStep, isActive]);

    if (!isActive) return null;

    const handleNext = () => {
        if (currentStepIndex < tutorialSteps.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
        } else {
            onComplete();
        }
    };

    const handlePrev = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(currentStepIndex - 1);
        }
    };

    const handleSkip = () => {
        setCurrentStepIndex(0);
        onSkip();
    };

    const getTooltipPosition = () => {
        if (!targetRect || currentStep.position === 'center') {
            return {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            };
        }

        const padding = 20;
        const position: React.CSSProperties = {};

        switch (currentStep.position) {
            case 'top':
                position.left = `${targetRect.left + targetRect.width / 2}px`;
                position.top = `${targetRect.top - padding}px`;
                position.transform = 'translate(-50%, -100%)';
                break;
            case 'bottom':
                position.left = `${targetRect.left + targetRect.width / 2}px`;
                position.top = `${targetRect.bottom + padding}px`;
                position.transform = 'translateX(-50%)';
                break;
            case 'left':
                position.left = `${targetRect.left - padding}px`;
                position.top = `${targetRect.top + targetRect.height / 2}px`;
                position.transform = 'translate(-100%, -50%)';
                break;
            case 'right':
                position.left = `${targetRect.right + padding}px`;
                position.top = `${targetRect.top + targetRect.height / 2}px`;
                position.transform = 'translateY(-50%)';
                break;
        }

        return position;
    };

    const getSpotlightStyle = (): React.CSSProperties => {
        if (!targetRect) return {};

        const padding = currentStep.spotlightPadding || 10;

        return {
            position: 'absolute',
            left: `${targetRect.left - padding}px`,
            top: `${targetRect.top - padding}px`,
            width: `${targetRect.width + padding * 2}px`,
            height: `${targetRect.height + padding * 2}px`,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
            borderRadius: '8px',
            pointerEvents: 'none',
            transition: 'all 0.3s ease'
        };
    };

    return (
        <div className="tutorial-overlay" ref={overlayRef}>
            {/* Spotlight effect */}
            {targetRect && <div className="tutorial-spotlight" style={getSpotlightStyle()} />}

            {/* Tooltip */}
            <div className="tutorial-tooltip" style={getTooltipPosition()}>
                <div className="tutorial-tooltip-header">
                    <h3>{currentStep.title}</h3>
                    <button className="tutorial-close-btn" onClick={handleSkip} title="튜토리얼 종료">
                        ×
                    </button>
                </div>

                <div className="tutorial-tooltip-body">
                    <p>{currentStep.description}</p>
                </div>

                <div className="tutorial-tooltip-footer">
                    <div className="tutorial-progress">
                        {tutorialSteps.map((_, index) => (
                            <div
                                key={index}
                                className={`progress-dot ${index === currentStepIndex ? 'active' : ''} ${index < currentStepIndex ? 'completed' : ''
                                    }`}
                            />
                        ))}
                    </div>

                    <div className="tutorial-buttons">
                        {currentStepIndex > 0 && (
                            <button className="tutorial-btn tutorial-btn-secondary" onClick={handlePrev}>
                                이전
                            </button>
                        )}
                        <span className="tutorial-step-counter">
                            {currentStepIndex + 1} / {tutorialSteps.length}
                        </span>
                        <button className="tutorial-btn tutorial-btn-primary" onClick={handleNext}>
                            {currentStepIndex < tutorialSteps.length - 1 ? '다음' : '완료'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
