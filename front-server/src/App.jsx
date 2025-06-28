import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Auth from '@page/Auth'
import Home from '@page/home'
import MyPage from '@page/MyPage'
import Chat from '@page/chat'
import BoardList from '@components/BoardList'
import BoardWrite from '@components/BoardWrite'
import List from '@page/list'
import Search from '@page/Search'

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
					<Route path="/chat" element={<Chat />} />
					<Route path="/board" element={<BoardList />} />
					<Route path="/board/write" element={<BoardWrite />} />
<<<<<<< HEAD
					<Route path="/search" element={<Search />} />
=======
					<Route path="search" element={<Search />} />
>>>>>>> 5c52b7900226306cedb6aacb6b43d3d1ff2b2582
					<Route path="*" element={<div>404 - 페이지를 찾을 수 없습니다</div>} />
				</Routes>
			)}
		</Router>
	)
}

export default App
