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
		} else {
			setIsVisible(false);
		}
	}, [isOpen]);

	useEffect(() => {
		console.log('attachments:', attachments);
	}, [attachments]);

	if (!isOpen) return null;

	return ReactDOM.createPortal(
		<div className={`attachment-list ${isVisible ? 'slide-right' : ''}`}>
			<h3 className="attachment-list__title">첨부파일 모아보기</h3>
			<ul>
				{attachments.map((att, idx) => {
					const ext = att.name.split('.').pop().toLowerCase() || '';
					return (
						<li key={idx} className={`attachment-list__item attachment-list__item--${ext}`}>
							{att.name}
						</li>
					)
				})}
			</ul>
			<button onClick={onClose}>닫기</button>
		</div>,
		document.body
	);
};

export default AttachmentList;