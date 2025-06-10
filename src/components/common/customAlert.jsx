import ReactDOM from 'react-dom';
import { useEffect } from 'react';

export default function customAlert({ message, onClose }) {
	useEffect(() => {
		const handler = (e) => e.key === 'Escape' && onClose();
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, [onClose]);

	return ReactDOM.createPortal(
		<div className="alert-wrapper">
			<div className="alert-box">
				<p className="alert-message">{message}</p>
				<button className="alert-button" onClick={onClose}>확인</button>
			</div>
		</div>,
		document.getElementById('alert-root')
	);
}
