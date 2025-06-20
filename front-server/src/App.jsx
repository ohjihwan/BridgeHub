import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Auth from '@page/Auth'
import Home from '@page/home'
import MyPage from '@page/MyPage'

function App() {
	const [showIntro, setShowIntro] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => {
			setShowIntro(false);
		}, 5000);

		return () => clearTimeout(timer);
	}, []);

	return (
		<Router>
			{showIntro ? (
				<div className="intro">
					<div className="intro__container">
						<h1 className='animation-logo --showAnimation' aria-label="Bridge Hub">
							<div className="animation-logo__imgmotion">
								<div className="animation-logo__wave">
									<i className="animation-logo__wave1"></i>
									<i className="animation-logo__wave2"></i>
								</div>
							</div>
						</h1>
					</div>
				</div>
			) : (
				<Routes>
					<Route path="/" element={<Navigate to="/login" replace />} />
					<Route path="/login" element={<Auth />} />
					<Route path="/home" element={<Home />} />
					<Route path="/mypage" element={<MyPage />} />
					<Route path="*" element={<div>404 - 페이지를 찾을 수 없습니다</div>} />
				</Routes>
			)}
		</Router>
	)
}

export default App
