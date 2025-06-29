import ReactDOM from 'react-dom';
import { useState, useEffect } from 'react';
import { customConfirm } from '@/assets/js/common-ui';

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

	const handleDownload = (att) => {
		customConfirm(`'${att.name}'을 내려 받으시겠습니까?`, () => {
			// 실제 다운로드 실행 다운로드 연결시 활성화
			// window.open(`/api/files/download/${att.fileId}`, '_blank');
			console.log(`'${att.name}를 다운로드 하였습니다.`)
		});
	};

	if (!isOpen) return null;

	return ReactDOM.createPortal(
		<div className={`attachment-list ${isVisible ? 'slide-right' : ''}`}>
			<h3 className="attachment-list__title">첨부파일 모아보기</h3>
			<ul>
				{attachments.map((att, idx) => {
					const ext = att.name.split('.').pop().toLowerCase() || '';
					return (
						<li key={idx} className={`attachment-list__item`}>
							<button type="button" className="attachment-list__down" onClick={() => handleDownload(att)}>
								<div className={`attachment-list__img attachment-list__img--${ext}`}></div>
								{att.name}
							</button>
						</li>
					)
				})}
			</ul>
			<button type="button" onClick={onClose} className="attachment-list__close" aria-label="닫기"></button>
		</div>,
		document.body
	);
};

export default AttachmentList;