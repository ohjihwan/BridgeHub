import React, { useState, useEffect } from 'react';
import profileDefault from '/uploads/profile/default-profile1.png';
import { customAlert, customConfirm } from '@/assets/js/common-ui';

const ChatMember = ({ isVisible, onClose, studyId, roomId, currentUserInfo, isOwner, socketService }) => {
	const [members, setMembers] = useState([]);
	const [loading, setLoading] = useState(false);

	// 참가인원 조회
	const fetchMembers = async () => {
		try {
			setLoading(true);
			const token = localStorage.getItem('token');
			const response = await fetch(`/api/chatrooms/${roomId}/members`, {
				headers: { 'Authorization': `Bearer ${token}` }
			});
			const result = await response.json();
			
			if (result.status === 'success') {
				console.log('참가인원 데이터:', result.data);
				console.log('현재 사용자 정보:', currentUserInfo);
				setMembers(result.data);
			} else {
				console.error('참가인원 조회 실패:', result);
			}
		} catch (error) {
			console.error('참가인원 조회 중 오류:', error);
		} finally {
			setLoading(false);
		}
	};

	// 강퇴 처리
	const handleKickMember = async (memberId, memberName) => {
		customConfirm(`${memberName}님을 강퇴시키시겠습니까?`, async () => {
			try {
				const token = localStorage.getItem('token');
				const response = await fetch(`/api/chatrooms/${roomId}/members/${memberId}`, {
					method: 'DELETE',
					headers: { 'Authorization': `Bearer ${token}` }
				});
				const result = await response.json();
				
				if (result.status === 'success') {
					customAlert('강퇴가 완료되었습니다.');
					fetchMembers(); // 목록 갱신
				} else {
					customAlert('강퇴 처리에 실패했습니다.');
				}
			} catch (error) {
				console.error('강퇴 처리 중 오류:', error);
				customAlert('강퇴 처리 중 오류가 발생했습니다.');
			}
		});
	};

	// 실시간 멤버 업데이트 처리
	useEffect(() => {
		if (!socketService) return;

		const handleMemberUpdate = () => {
			console.log('멤버 업데이트 이벤트 수신');
			fetchMembers(); // 참가인원 목록 갱신
		};

		// 멤버 관련 이벤트 리스너 등록
		socketService.on('member-count', handleMemberUpdate);
		socketService.on('user-left', handleMemberUpdate);
		socketService.on('new-message', (message) => {
			// 시스템 메시지인 경우 멤버 목록 갱신
			if (message.senderId === '시스템' && 
				(message.text.includes('퇴장') || message.text.includes('강퇴'))) {
				handleMemberUpdate();
			}
		});

		return () => {
			if (socketService) {
				socketService.off('member-count', handleMemberUpdate);
				socketService.off('user-left', handleMemberUpdate);
				socketService.off('new-message', handleMemberUpdate);
			}
		};
	}, [socketService, roomId]);

	useEffect(() => {
		if (isVisible && roomId) {
			fetchMembers();
		}
	}, [isVisible, roomId]);

	return (
		<div className={`chat-member ${isVisible ? 'slide-right' : ''}`}>
			<h3 className="chat-member__title">참여 인원 ({members.length}명)</h3>
			{loading ? (
				<div style={{ textAlign: 'center', padding: '20px' }}>로딩 중...</div>
			) : (
				<ul>
					{members.map((member) => (
						<li key={member.memberId} className="chat-member__item">
							<div className="chat-member__user">
								<img 
									src={member.memberProfileImage || profileDefault} 
									alt="" 
									className="chat-member__img"
									onError={(e) => {
										e.target.src = profileDefault;
									}}
								/>
								<span className="chat-member__name">
									{member.memberNickname || member.memberName || '사용자'}
									{member.memberId === currentUserInfo?.id && ' (나)'}
								</span>
								{/* 방장이고 본인이 아닌 경우에만 강퇴 버튼 표시 */}
								{isOwner && member.memberId !== currentUserInfo?.id && (
									<button 
										type="button" 
										className="chat-member__delete"
										onClick={() => handleKickMember(member.memberId, member.memberNickname || member.memberName)}
									>
										강퇴시키기
									</button>
								)}
							</div>
						</li>
					))}
				</ul>
			)}
			<button type="button" onClick={onClose} className="chat-member__close" aria-label="닫기"></button>
		</div>
	);
};

export default ChatMember;