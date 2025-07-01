import ReactDOM from 'react-dom';
import { useState, useEffect } from 'react';

const ChatMember = ({ isOpen, onClose }) => {
	const [isVisible, setIsVisible] = useState(false);

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
				
			</ul>
			<button type="button" onClick={onClose} className="chat-member__close" aria-label="닫기"></button>
		</div>
	);
};

export default ChatMember;