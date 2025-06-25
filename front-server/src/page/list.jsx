import { useState, useEffect } from 'react';
import Header from '@common/Header';
import StudyRoomList from '@components/StudyRoomList';
import Detail from '@components/Detail';
import roomData from '@json/Room.json';

const StudyRoomPage = ({ onClose, initialShowSearch }) => {
	const [showSearch, setShowSearch] = useState(initialShowSearch);
	const [searchKeyword, setSearchKeyword] = useState('');
	const [studyRooms, setStudyRooms] = useState([]);
	const [visibleCount, setVisibleCount] = useState(10);
	const [selectedRoom, setSelectedRoom] = useState(null);
	const [showDetail, setShowDetail] = useState(false);
	const [isClosing, setIsClosing] = useState(false);
	const [show, setShow] = useState(false);

	const handleItemClick = (room) => {
		setSelectedRoom(room);
		setShowDetail(true);
		setIsClosing(false);
	};
	const handleDetailClose = () => {
		setIsClosing(true);
	};

	useEffect(() => {
		setStudyRooms(roomData);
		const timer = setTimeout(() => setShow(true), 10);
		return () => clearTimeout(timer);
	}, []);
	useEffect(() => {
		const handleScroll = () => {
			if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
				setVisibleCount((prev) => Math.min(prev + 10, studyRooms.length));
			}
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, [studyRooms.length]);
	useEffect(() => {
		if (isClosing) {
			const timer = setTimeout(() => {
				setShowDetail(false);
				setIsClosing(false);
			}, 400);
			return () => clearTimeout(timer);
		}
	}, [isClosing]);
	useEffect(() => {
		if (showSearch) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	}, [showSearch]);

	return (
		<div className={`studyroom-list ${show ? 'show' : ''}`}>
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
