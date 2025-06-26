import React from 'react';
import { createRoot } from 'react-dom/client';
import CustomAlert from '@page/common/customAlert';
import axios from 'axios';

// ----------- 커스텀 알럿 관련 -----------

let alertRoot = null;
let root = null;

export function customAlert(message) {
	return new Promise((resolve) => {
		const alertRoot = document.getElementById('alert-root');
		const root = createRoot(alertRoot);

		const handleClose = () => {
			root.unmount();
			resolve();
		};

		root.render(
			<CustomAlert message={message} onClose={handleClose} />
		);
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

export default { customAlert, customConfirm, customPrompt };

// ----------- 로딩 관련 -----------

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

// ----------- axios 다중 클라이언트 -----------

export const authClient = axios.create({
	baseURL: 'http://localhost:7100/api/auth',
	timeout: 10000,
	headers: { 'Content-Type': 'application/json' },
});

[authClient].forEach(client => {
	client.interceptors.request.use(config => {
		window.showLoading?.();
		return config;
	}, error => {
		window.hideLoading?.();
		return Promise.reject(error);
	});

	client.interceptors.response.use(response => {
		window.hideLoading?.();
		return response;
	}, error => {
		window.hideLoading?.();
		return Promise.reject(error);
	});
});
