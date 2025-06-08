import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Auth from '@components/Auth'
import Main from '@components/Main'
import MyPage from '@components/MyPage'

function App() {
	const [showIntro, setShowIntro] = useState(true);

	useEffect(() => {
		const timer = setTimeout(() => {
			setShowIntro(false);
		}, 3000);

		return () => clearTimeout(timer);
	}, []);

	return (
		<Router>
			{showIntro ? (
				<div className="intro">
					<div className="intro__container">
						<h1 className='intro__logo'>
							<div className="intro__imgmotion">
								<div className="wave"></div>
							</div>
							<div className="hide">브릿지허브에 오신걸 환영합니다</div>
						</h1>
					</div>
				</div>
			) : (
				<Routes>
					<Route path="/login" element={<Auth />} />
					<Route path="/main" element={<Main />} />
					<Route path="/mypage" element={<MyPage />} />
					<Route path="/" element={<Navigate to="/login" replace />} />
				</Routes>
			)}
		</Router>
	)
}

export default App
