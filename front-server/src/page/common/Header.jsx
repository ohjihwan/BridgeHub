import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { customAlert, customConfirm } from '@/assets/js/common-ui';

const Header = ({ 
    isEditing = false, 
    showSearch = true, 
    title = '', 
    onSearch = () => {}, 
    onShowAttachments = () => {}, 
	onShowParticipants = () => {}, 
    onBeforeBack = () => {}, 
    onLeave = () => {}, 
    onlineUsers = [], 
    studyInfo = null, 
    currentUserInfo = null
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const isHome = location.pathname === '/home';

    const handleBackClick = () => {
        if (onBeforeBack) {
            onBeforeBack();  // 소켓 해제 등 사전 처리 실행
            return;
        }
        
        if (isEditing) {
            customConfirm('작성 중인 내용이 있습니다. 정말 뒤로 가시겠습니까?', () => navigate(-1));
        } else {
            navigate(-1);
        }
    };

    const handleHomeClick = () => {
        navigate('/home');
    };

    const handleLogout = () => {
        customConfirm('로그아웃 하시겠습니까?', () => {
            localStorage.removeItem('token');
            setMenuOpen(false);
            navigate('/login');
        });
    };

    const handleMyPageClick = () => {
        setMenuOpen(false);
        navigate('/mypage');
    };

    const toggleMenu = () => {
        setMenuOpen(prev => !prev);
    };

    const handleExitChat = () => {
        customConfirm('정말 스터디룸을 탈퇴하시겠습니까?', () => {
            setMenuOpen(false);
            onLeave(); // chat.jsx의 handleLeave 함수 호출
        });
    };

    // 새로 추가: 방신고하기 함수
    const handleReportRoom = () => {
        customConfirm('이 방에서 퇴장됩니다. 방을 신고하시겠습니까?', () => {
            setMenuOpen(false);
            // TODO: 나중에 실제 신고 API 호출 추가
            console.log('🚨 방 신고 기능 실행됨');
            customAlert('신고가 접수되었습니다.');
            // 신고 후 방에서 나가기
            navigate('/home');
        });
    };

    console.log('🔍 Header에 전달할 props 확인:', {
        studyInfo,
        onlineUsers,
        currentUserInfo,
        studyInfoExists: !!studyInfo,
        onlineUsersExists: !!onlineUsers,
        currentUserInfoExists: !!currentUserInfo
    });

    const getAllParticipants = () => {
        const participants = [];
        
        if (currentUserInfo) {
            participants.push({
                id: currentUserInfo.id,
                name: currentUserInfo.nickname || currentUserInfo.name || '나',
                isMe: true,
                isOnline: true
            });
        }

        if (onlineUsers && onlineUsers.length > 0) {
            onlineUsers.forEach(user => {
                const isDuplicate = participants.some(p => 
                    p.id === user.id || p.id === user.userId
                );
                
                if (!isDuplicate) {
                    participants.push({
                        id: user.id || user.userId,
                        name: user.nickname || user.name || user.username || `사용자${user.id}`,
                        isMe: false,
                        isOnline: true
                    });
                }
            });
        }

        return participants;
    };

    const handleShowParticipants = () => {
        console.log('🏠 스터디룸 참가 인원 정보:');
        console.log('📊 스터디 정보:', studyInfo || 'undefined');
        console.log('👤 현재 사용자:', currentUserInfo || 'undefined');
        console.log('🟢 온라인 사용자들:', onlineUsers || []);
        
        // 참가자 목록 생성
        const participants = getAllParticipants();
        
        console.log('👥 전체 참가자 수:', participants.length);
        console.log('📋 참가자 목록:');
        participants.forEach((participant, index) => {
            const status = participant.isMe ? '(나)' : '';
            const online = participant.isOnline ? '🟢' : '🔴';
            console.log(`  ${index + 1}. ${online} ${participant.name} ${status}`);
        });
        
        // 온라인 사용자 원본 데이터도 출력
        console.log('🔍 온라인 사용자 원본 데이터:', onlineUsers);
        
        // 스터디 정보에서 전체 멤버 정보도 확인
        if (studyInfo && studyInfo.members) {
            console.log('👨‍👩‍👧‍👦 전체 스터디 멤버:', studyInfo.members);
        } else {
            console.log('⚠️ 스터디 멤버 정보가 없습니다.');
        }
        
        // 사용자에게 알림으로도 표시
        const participantNames = participants.map(p => p.name).join(', ');
        customAlert(`현재 참가자 (${participants.length}명): ${participantNames}`);
        
        setMenuOpen(false);
    };

    // 바깥 클릭 시 메뉴 닫기
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <header className="header">
            <div className="header__left">
                {isHome ? (
                    <h1 className="logo">
                        <a href="/home" onClick={(e) => { e.preventDefault(); handleHomeClick(); }}>
                            <span className="hide">BridgeHub</span>
                        </a>
                    </h1>
                ) : (
                    <button type="button" className="header__left__back" onClick={handleBackClick}>
                        <span className="hide">뒤로가기</span>
                    </button>
                )}
            </div>

            <h2 className="header__title">
                {( location.pathname === '/chat' && title || location.pathname === '/search' && title || location.pathname === '/board' && title )}
            </h2>
            
            <div className="header__right" ref={menuRef}>
                {showSearch && (
                    <button type="button" className="header__right__search" onClick={onSearch}>
                        <span className="hide">검색</span>
                    </button>
                )}
                <button type="button" className="header__right__menu" onClick={toggleMenu}>
                    <span className="hide">메뉴 열기</span>
                </button>
                <div className={`user-menu${menuOpen ? ' --on' : ''}`}>
                    <ul>
                        {location.pathname !== '/mypage' && (
                            <li className='user-menu__item'>
                                <a href="/mypage" onClick={(e) => { e.preventDefault(); handleMyPageClick(); }}>마이페이지</a>
                            </li>
                        )}
                        <li className='user-menu__item'>
                            <a href="/logout" onClick={(e) => { e.preventDefault(); handleLogout(); }}>로그아웃</a>
                        </li>
                        {location.pathname === '/chat' && (
                            <li className="user-menu__item">
                                <a href="/participants" onClick={(e) => { e.preventDefault(); onShowParticipants(); }}>참가 인원</a>
                                <a href="/attachments" onClick={(e) => { e.preventDefault(); onShowAttachments(); }}>파일 모아보기</a>
                                <a href="/report" onClick={(e) => { e.preventDefault(); handleReportRoom(); }}>방신고하기</a>
                                <a href="/exit" onClick={(e) => { e.preventDefault(); handleExitChat(); }}>탈퇴하기</a>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </header>
    );
};

export default Header;