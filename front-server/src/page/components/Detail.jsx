import React, { useState, useEffect } from 'react';

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

	if (!room) return null;

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
				<button type="button" className="button button-primary">참여하기</button>
			</div>
		</div>
	);
};

export default Detail; 