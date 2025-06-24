import React from 'react';
import { createRoot } from 'react-dom/client';
import CustomAlert from '@page/common/customAlert';

let alertRoot = null;
let root = null;

export function customAlert(message) {
	return new Promise((resolve) => {
		const container = document.createElement('div');
		document.body.appendChild(container);
		const root = createRoot(container);

		const handleClose = () => {
			root.unmount();
			container.remove();
			resolve();
		};

		root.render(<CustomAlert message={message} onClose={handleClose} />);
	});
}

export function customConfirm(message, onConfirmed = null) {
	return new Promise((resolve) => {
		const alertRoot = document.getElementById('alert-root');
		const root = createRoot(alertRoot);

		const handleClose = () => {
			root.unmount();
			resolve(false);
		};

		const handleConfirm = () => {
			if (typeof onConfirmed === 'function') {
				onConfirmed();
			}
			root.unmount();
			resolve(true);
		};

		root.render(
			<CustomAlert message={message} onClose={handleClose} onConfirm={handleConfirm} />
		);
	});
}

export function customPrompt(message, placeholder = '', defaultValue = '', onSubmit = null) {
	return new Promise((resolve) => {
		const alertRoot = document.getElementById('alert-root');
		alertRoot.innerHTML = '';
		const root = createRoot(alertRoot);

		const handleClose = () => {
			root.unmount();
			resolve(null);
		};

		const handleConfirm = (value) => {
			if (typeof onSubmit === 'function') {
				onSubmit(value);
			}
			root.unmount();
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

export function showLoading() {
	const loading = document.getElementById('global-loading');
	if (loading) loading.style.display = 'flex';
}

export function hideLoading() {
	const loading = document.getElementById('global-loading');
	if (loading) loading.style.display = 'none';
}

window.showLoading = showLoading;
window.hideLoading = hideLoading;