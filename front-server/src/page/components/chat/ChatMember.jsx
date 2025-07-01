import ReactDOM from 'react-dom';
import { useState, useEffect } from 'react';
import profileDefault from '/uploads/profile/default-profile1.png';

const ChatMember = ({ isOpen, onClose, onShowJoinSystem }) => {
	const [isVisible, setIsVisible] = useState(false);

	// 기본값 설정 (props가 없을 때만 사용)
	const defaultProfileData = {
		profileImg: "/uploads/profile/default-profile1.png",
		nickname: "김사과",
		education: "대학교 졸업",
		department: "공학계열",
		region: "서울특별시",
		district: "강남구",
		timeZone: "오후",
		description: "함께 공부하며 성장하고 싶습니다!",
	}

	const handleJoinSystemOpen = () => {
		if (onShowJoinSystem) {
			onShowJoinSystem(true)
		} else {
			console.error("onShowJoinSystem prop이 전달되지 않았습니다.")
		}
	}

	useEffect(() => {
		if (isOpen) {
			const timer = setTimeout(() => {
				setIsVisible(true);
			}, 100);
			return () => clearTimeout(timer);
		} else {
			setIsVisible(false);
		}
	}, [isOpen]);

	if (!isOpen) return null;

	return (
		<div className={`chat-member ${isVisible ? 'slide-right' : ''}`}>
			<h3 className="chat-member__title">참여 인원</h3>
			<ul>
				<li className="chat-member__item">
					<div className="chat-member__user">
						<img src={/* 디비값 */ '' || profileDefault} alt="" className="chat-member__img"/>
						<span className="chat-member__name">{defaultProfileData?.nickname}</span>
						<button type="button" className="chat-member__delete">강퇴시키기</button>
					</div>
				</li>
				<li className="chat-member__item">
					<div className="chat-member__user">
						<img src={/* 디비값 */ '' || profileDefault} alt="" className="chat-member__img"/>
						<span className="chat-member__name">{defaultProfileData?.nickname}</span>
						<button type="button" className="chat-member__delete">강퇴시키기</button>
					</div>
				</li>
				<li className="chat-member__item">
					<div className="chat-member__user">
						<img src={/* 디비값 */ '' || profileDefault} alt="" className="chat-member__img"/>
						<span className="chat-member__name">{defaultProfileData?.nickname}</span>
						<button type="button" className="chat-member__delete">강퇴시키기</button>
					</div>
				</li>
			</ul>
			<button type="button" onClick={onClose} className="chat-member__close" aria-label="닫기"></button>
		</div>
	);
};

export default ChatMember;