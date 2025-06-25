import { useState, useEffect } from 'react';
import Header from '@common/Header';
import StudyRoomList from '@components/StudyRoomList';
import Detail from '@components/Detail';
import roomData from '@json/Room.json';

const StudyRoomPage = () => {
	const [showSearch, setShowSearch] = useState(false);
	const [searchKeyword, setSearchKeyword] = useState('');
	const [visibleCount, setVisibleCount] = useState(10);
	const [selectedRoom, setSelectedRoom] = useState(null);
	const [showDetail, setShowDetail] = useState(false);
	const [isClosing, setIsClosing] = useState(false);

	const handleItemClick = (room) => {
		setSelectedRoom(room);
		setShowDetail(true);
		setIsClosing(false);
	};
	const handleDetailClose = () => {
		setIsClosing(true);
	};

	useEffect(() => {
		const handleScroll = () => {
			if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
				setVisibleCount((prev) => Math.min(prev + 10, roomData.length));
			}
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	useEffect(() => {
		if (isClosing) {
			const timer = setTimeout(() => {
				setShowDetail(false);
				setIsClosing(false);
			}, 400);
			return () => clearTimeout(timer);
		}
	}, [isClosing]);

	return (
		<div className="studyroom-list">
			<Header showSearch={true} onSearch={() => setShowSearch(true)} isHome={false} />

			{showSearch && (
				<div className="search-popup">
					<input
						type="text"
						value={searchKeyword}
						onChange={(e) => setSearchKeyword(e.target.value)}
						placeholder="검색어 입력"
					/>
					<button onClick={() => setShowSearch(false)}>닫기</button>
				</div>
			)}

			<div className="studyroom-list__content">
				<StudyRoomList
					searchKeyword={searchKeyword}
					onItemClick={handleItemClick}
					limit={visibleCount}
				/>
			</div>

			{showDetail && selectedRoom && (
				<Detail room={selectedRoom} isClosing={isClosing} onClose={handleDetailClose} />
			)}
		</div>
	);
};

export default StudyRoomPage;
