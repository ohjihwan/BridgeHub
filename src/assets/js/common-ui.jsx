import React from 'react';
import { createRoot } from 'react-dom/client';
import CustomAlert from '@components/common/customAlert';

/* 커스텀 얼랏 */
export default function customAlert(message, onConfirm, options = {}) {
	return new Promise((resolve) => {
		const container = document.createElement('div');
		document.getElementById('alert-root').appendChild(container);

		const root = createRoot(container);

		const handleClose = () => {
			root.unmount();
			container.remove();
			resolve();
		};
		
		const handleConfirm = () => {
			if (typeof onConfirm === 'function') {
				onConfirm();
			}
			root.unmount();
			container.remove();
			resolve(true);
		};

		root.render(
			<CustomAlert
				message={message}
				onClose={handleClose}
				onConfirm={options.showInput ? handleConfirm : () => handleConfirm()}
				showInput={!!options.showInput}
				inputPlaceholder={options.placeholder}
				inputDefaultValue={options.defaultValue}
			/>
		);
	  
	});
}