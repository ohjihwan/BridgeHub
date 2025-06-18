import React from 'react';
import { createRoot } from 'react-dom/client';
import CustomAlert from '@page/common/customAlert';

export function customAlert(message) {
	return new Promise((resolve) => {
		const container = document.createElement('div');
		document.getElementById('alert-root').appendChild(container);
		const root = createRoot(container);
		const handleClose = () => {
			root.unmount();
			container.remove();
			resolve();
		};
		root.render(
			<CustomAlert message={message} onClose={handleClose} />
		);
	});
}

export function customConfirm(message, onConfirmed = null) {
	return new Promise((resolve) => {
		const container = document.createElement('div');
		document.getElementById('alert-root').appendChild(container);
		const root = createRoot(container);

		const handleClose = () => {
			root.unmount();
			container.remove();
			resolve(false);
		};

		const handleConfirm = () => {
			if (typeof onConfirmed === 'function') {
				onConfirmed();
			}
			root.unmount();
			container.remove();
			resolve(true);
		};

		root.render(
			<CustomAlert
				message={message}
				onClose={handleClose}
				onConfirm={handleConfirm}
			/>
		);
	});
}

export function customPrompt(message, placeholder = '', defaultValue = '', onSubmit = null) {
	return new Promise((resolve) => {
		const container = document.createElement('div');
		document.getElementById('alert-root').appendChild(container);
		const root = createRoot(container);

		const handleClose = () => {
			root.unmount();
			container.remove();
			resolve(null);
		};

		const handleConfirm = (value) => {
			root.unmount();
			container.remove();
			resolve(value);
		};

		root.render(
			<CustomAlert
				message={message}
				onClose={handleClose}
				onConfirm={handleConfirm}
				showInput={true}
				inputPlaceholder={placeholder}
				inputDefaultValue={defaultValue}
			/>
		);
	});
}

export default {customAlert, customConfirm, customPrompt};
