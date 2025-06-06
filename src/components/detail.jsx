import React from 'react';
import '@scss/components/detail.scss';

const Detail = ({ onClose }) => {
	return (
		<div className="detail">
		<div className="detail__header">
			<h2 className="detail__title">스터디 상세</h2>
			<button className="detail__close" onClick={onClose}>닫기</button>
		</div>
		
		<div className="detail__content">
			<div className="detail__info">
				<h3 className="detail__subtitle">스터디 정보</h3>
				<dl className="detail__list">
					<dt className="detail__term">스터디명</dt>
					<dd className="detail__desc">리액트 스터디</dd>
					
					<dt className="detail__term">기간</dt>
					<dd className="detail__desc">2024.03.15 - 2024.06.15</dd>
					
					<dt className="detail__term">인원</dt>
					<dd className="detail__desc">4/6명</dd>
				</dl>
			</div>
			
			<div className="detail__description">
				<h3 className="detail__subtitle">스터디 설명</h3>
				<p className="detail__text">
					리액트를 함께 공부하는 스터디입니다.
					기초부터 실전 프로젝트까지 진행할 예정입니다.
				</p>
			</div>

			<div className="detail__members">
				<h3 className="detail__subtitle">참여 멤버</h3>
				<ul className="detail__member-list">
					<li className="detail__member">홍길동 (리더)</li>
					<li className="detail__member">김철수</li>
					<li className="detail__member">이영희</li>
					<li className="detail__member">박지성</li>
				</ul>
			</div>
		</div>

		<div className="detail__footer">
			<button className="detail__join">참여하기</button>
		</div>
		</div>
	);
};

export default Detail; 