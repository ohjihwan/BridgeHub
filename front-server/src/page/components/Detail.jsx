import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Detail = ({ room, isClosing, onClose }) => {
	const [isActive, setIsActive] = useState(false);
	const classNames = ['detail'];
	if (isActive) {
		classNames.push('detail--active');
		document.body.style.overflow = 'hidden';
	}
	if (isClosing) {
		classNames.push('detail--closing');
		document.body.style.overflow = '';
	}
	
	useEffect(() => {
		if (!isClosing) {
			const timer = setTimeout(() => {
				setIsActive(true);
			}, 0);
			return () => clearTimeout(timer);
		}
	}, [isClosing]);

	const navigate = useNavigate();

	// JWT 토큰에서 사용자 정보 추출
	const extractUserFromToken = (token) => {
		try {
			const payload = JSON.parse(atob(token.split('.')[1]));
			return {
				userId: payload.userId || payload.username,
				username: payload.username,
				memberId: payload.memberId
			};
		} catch (error) {
			console.warn('토큰에서 사용자 정보 추출 실패:', error);
			return null;
		}
	};

	if (!room) return null;

	const handleJoinStudy = async () => {
		// 현재 사용자 정보 확인
		const token = localStorage.getItem('token');
		const userInfo = extractUserFromToken(token);
		
		if (!userInfo) {
			return;
		}
		
		// 방장인지 확인
		if (room.bossId === userInfo.userId) {
			// 방장이면 바로 입장
			navigate('/chat', { 
				state: { 
					studyRoom: { 
						studyRoomId: room.studyRoomId || room.id,
						roomId: room.roomId,
						title: room.title 
					} 
				} 
			});
			return;
		}
		
		// 스터디 멤버 목록 조회해서 본인 상태 확인
		try {
			const response = await fetch(`/api/studies/${room.studyRoomId || room.id}/members`, {
				headers: { 'Authorization': `Bearer ${token}` }
			});
			const result = await response.json();
			
			if (result.status === 'success') {
				const members = result.data;
				const myMember = members.find(member => member.memberId === userInfo.userId);
				
				if (myMember && myMember.status === 'APPROVED') {
					// 승인된 멤버면 바로 입장
					navigate('/chat', { 
						state: { 
							studyRoom: { 
								studyRoomId: room.studyRoomId || room.id,
								roomId: room.roomId,
								title: room.title 
							} 
						} 
					});
				} else {
					// 신규 사용자거나 대기 중이면 참여 신청
					await fetch(`/api/studies/${room.studyRoomId || room.id}/join`, {
						method: 'POST',
						headers: { 'Authorization': `Bearer ${token}` }
					});
				}
			}
		} catch (error) {
			console.error('참여 처리 실패:', error);
		}
	};

	return (
		<div className={classNames.join(' ')}>
			<div className="detail__header">
				<button className="detail__close" onClick={onClose} aria-label="팝업 닫기"></button>
			</div>
			
			<div className="detail__content">
				<div className="detail__infos">
					<img src={`/uploads/thumbnail/${room.thumbnail}`} alt="스터디 이미지" className="img-thumbnail"/>
					<div className="detail__info">
						<h3 className="title">{room.title}</h3>
						<ul className="room-info">
							<li>{room.region}</li>
							<li>{room.time}</li>
							<li>{room.currentMembers} / {room.capacity}명</li>
						</ul>
					</div>
				</div>

				<div className="detail__members">
					<h3 className="detail__subtitle">참여 멤버</h3>
					<ul className="detail__member-list">
						{room.members?.map((member, idx) => (
							<li key={idx} className={idx === 0 ? 'detail__leader' : 'detail__member'}>
								{member}
							</li>
						))}
					</ul>
				</div>
				
				<div className="detail__description">
					<h3 className="detail__subtitle">스터디 설명</h3>
					<p className="detail__text">{room.description}</p>
				</div>
			</div>

			<div className="fixed">
				<button type="button" className="button button-primary" onClick={handleJoinStudy}>참여하기</button>
			</div>
		</div>
	);
};

export default Detail; 