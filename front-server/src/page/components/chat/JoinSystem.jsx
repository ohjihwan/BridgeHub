import { useState, useEffect, useRef } from 'react';

const JoinSystem = ({ isOpen, onClose }) => {
    const [swipeDistance, setSwipeDistance] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [sliderWidth, setSliderWidth] = useState(300); // 동적 슬라이더 너비
    const sliderRef = useRef(null);

    // 슬라이더 너비 계산
    const updateSliderWidth = () => {
        if (sliderRef.current) {
            const containerWidth = sliderRef.current.parentElement.clientWidth;
            // 패딩을 고려한 최대 너비 (40px 패딩 * 2 = 80px)
            const maxWidth = Math.min(containerWidth - 80, 350); // 최대 350px로 제한
            const minWidth = 250; // 최소 250px 보장
            setSliderWidth(Math.max(minWidth, maxWidth));
        }
    };

    // 컴포넌트 마운트 및 리사이즈 시 너비 업데이트
    useEffect(() => {
        if (isOpen) {
            updateSliderWidth();
            
            const handleResize = () => {
                updateSliderWidth();
            };

            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, [isOpen]);

    // 터치 시작
    const handleTouchStart = (e) => {
        setStartX(e.touches[0].clientX);
        setIsDragging(true);
    };

    // 터치 이동
    const handleTouchMove = (e) => {
        if (!isDragging || isCompleted) return;
        
        const currentX = e.touches[0].clientX;
        const distance = currentX - startX;
        
        // 오른쪽으로만 스와이프 허용, 최대 거리 제한
        const maxDistance = sliderWidth - 60;
        if (distance >= 0 && distance <= maxDistance) {
            setSwipeDistance(distance);
        }
    };

    // 터치 끝
    const handleTouchEnd = () => {
        if (!isDragging || isCompleted) return;
        
        setIsDragging(false);
        
        const maxDistance = sliderWidth - 60;
        // 90% 이상 스와이프하면 승락 완료
        if (swipeDistance >= maxDistance * 0.9) {
            setSwipeDistance(maxDistance);
            setIsCompleted(true);
            
            // 1초 후 승락 처리
            setTimeout(() => {
                alert('승락!');
                onClose();
            }, 500);
        } else {
            // 원래 위치로 복귀
            setSwipeDistance(0);
        }
    };

    // 마우스 이벤트 (데스크톱 테스트용)
    const handleMouseDown = (e) => {
        setStartX(e.clientX);
        setIsDragging(true);
    };

    const handleMouseMove = (e) => {
        if (!isDragging || isCompleted) return;
        
        const distance = e.clientX - startX;
        const maxDistance = sliderWidth - 60;
        if (distance >= 0 && distance <= maxDistance) {
            setSwipeDistance(distance);
        }
    };

    const handleMouseUp = () => {
        if (!isDragging || isCompleted) return;
        
        setIsDragging(false);
        
        const maxDistance = sliderWidth - 60;
        if (swipeDistance >= maxDistance * 0.9) {
            setSwipeDistance(maxDistance);
            setIsCompleted(true);
            
            setTimeout(() => {
                alert('승락!');
                onClose();
            }, 500);
        } else {
            setSwipeDistance(0);
        }
    };

    // 마우스 이벤트 리스너
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, startX, swipeDistance, sliderWidth, isCompleted]);

    // ESC 키로 닫기
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, onClose]);

    // 컴포넌트 마운트 시 초기화
    useEffect(() => {
        if (isOpen) {
            setSwipeDistance(0);
            setIsCompleted(false);
            setIsDragging(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const maxDistance = sliderWidth - 60;
    const progress = maxDistance > 0 ? swipeDistance / maxDistance : 0;

    return (
        <div className="join-system" onClick={onClose}>
            <div className="join-system__modal" onClick={(e) => e.stopPropagation()}>
                <h2 className="join-system__title">
                    김사과님이 참여를 요청했습니다
                </h2>
                
                <p className="join-system__description">
                    승락하려면 아래 슬라이더를 밀어주세요.
                </p>

                {/* 아이폰 스타일 슬라이더 */}
                <div 
                    ref={sliderRef}
                    className={`join-system__slider ${isCompleted ? 'join-system__slider--completed' : ''}`}
                    style={{ width: `${sliderWidth}px` }}
                >
                    <div 
                        className={`join-system__progress ${isCompleted ? 'join-system__progress--completed' : ''}`}
                        style={{ 
                            width: `${Math.max(60, swipeDistance + 60)}px`,
                            backgroundColor: isCompleted ? '#4CAF50' : `rgba(76, 175, 80, ${progress * 0.3})`,
                            transition: isDragging ? 'none' : 'all 0.3s ease'
                        }}
                    />

                    <div className={`join-system__text ${isCompleted ? 'join-system__text--completed' : ''}`}>
                        {isCompleted ? '승락 완료!' : '밀어서 승락하기'}
                    </div>

                    <div
                        className={`join-system__handle ${isDragging ? 'join-system__handle--dragging' : ''}`}
                        style={{ 
                            left: `${swipeDistance}px`,
                            transition: isDragging ? 'none' : 'left 0.3s ease'
                        }}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onMouseDown={handleMouseDown}
                    >
                        {isCompleted ? '✓' : '→'}
                    </div>
                </div>

                <div className="join-system__percentage">
                    {Math.round(progress * 100)}% 완료
                </div>

				<div className="join-system__buttons">
					<button className="join-system__cancel" onClick={onClose}>
						취소
					</button>
				</div>
            </div>
        </div>
    );
};

export default JoinSystem;