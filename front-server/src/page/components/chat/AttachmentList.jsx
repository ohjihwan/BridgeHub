import ReactDOM from 'react-dom';
import { useState, useEffect } from 'react';

const AttachmentList = ({ isOpen, attachments, onClose }) => {
	const [isVisible, setIsVisible] = useState(false);
	
	useEffect(() => {
		if (isOpen) {
			const timer = setTimeout(() => {
				setIsVisible(true);
			}, 100);
			return () => clearTimeout(timer);
		}
	}, [isOpen]);

	if (!isOpen) return null;

	useEffect(() => {
		console.log('attachments:', attachments);
	}, [attachments]);

	return ReactDOM.createPortal(
		<div className={`attachment-list ${isVisible ? 'slide-right' : ''}`}>
			<h3>첨부파일 모아보기</h3>
			<ul>
				{attachments.map((att, idx) => (
					<li key={idx}>{att.name}</li>
				))}
			</ul>
			<button onClick={onClose}>닫기</button>
		</div>
	);
};

export default AttachmentList;