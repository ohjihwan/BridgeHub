import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Auth from '@components/Auth'
import Main from '@components/Main'
import MyPage from '@components/MyPage'

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
