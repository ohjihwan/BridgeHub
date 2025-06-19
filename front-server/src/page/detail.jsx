import React, { useState, useEffect } from 'react';

const Detail = ({ isClosing, onClose }) => {
	const [isActive, setIsActive] = useState(false);

	useEffect(() => {
		if (!isClosing) {
			const timer = setTimeout(() => {
				setIsActive(true);
			}, 0);
			return () => clearTimeout(timer);
		}
	}, [isClosing]);

	const classNames = ['detail'];
	if (isActive) {
		classNames.push('detail--active');
		document.body.style.overflow = 'hidden';
	}
	if (isClosing) {
		classNames.push('detail--closing');
		document.body.style.overflow = '';
	}

	return (
		<div className={classNames.join(' ')}>
			<div className="detail__header">
				<button className="detail__close" onClick={onClose} aria-label="팝업 닫기"></button>
			</div>
			
			<div className="detail__content">
				
				<div className="detail__infos">
					<img src={`/uploads/thumbnail/thumbnail-room1.jpg`} alt="" className="img-thumbnail"/>
					<div class="detail__info">
						<h3 className="title">스터디룸</h3>
						<ul className="room-info">
							<li>서울</li>
							<li>오전</li>
							<li>5/6명</li>
						</ul>
					</div>
				</div>

				<div className="detail__members">
					<h3 className="detail__subtitle">참여 멤버</h3>
					<ul className="detail__member-list">
						<li className="detail__leader">홍길동</li>
						<li className="detail__member">김철수</li>
						<li className="detail__member">이영희</li>
						<li className="detail__member">박지성</li>
					</ul>
				</div>
				
				<div className="detail__description">
					<h3 className="detail__subtitle">스터디 설명</h3>
					<p className="detail__text">
						리액트를 함께 공부하는 스터디입니다.
						기초부터 실전 프로젝트까지 진행할 예정입니다.
					</p>
				</div>
			</div>

			<div className="fixed">
				<button type="button" className="button button-primary">참여하기</button>
			</div>
		</div>
	);
};

export default Detail; 