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
			<div className="alert-container">
				<div className="alert-header">
					<h1 className='title'>안내</h1>
				</div>
				<div className="alert-box">
					<p className="alert-message">{message}</p>
				</div>
				<div className="alert-buttons">
					<button className="alert-button" onClick={onClose}>확인</button>
				</div>
			</div>
		</div>,
		document.getElementById('alert-root')
	);
}
