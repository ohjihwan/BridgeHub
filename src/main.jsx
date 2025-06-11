import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@scss/common-ui.scss';
import '@js/common-ui.jsx';
import customAlert from '@js/common-ui';
import App from './App.jsx';

// 전역으로 등록
window.customAlert = customAlert;

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<App />
	</StrictMode>,
)
