import { useState, useEffect, useMemo } from 'react';
import Header from '@common/Header';
import StudyRoomList from '@components/StudyRoomList';
import Detail from '@components/Detail';
import roomData from '@json/Room.json';

const StudyRoomPage = () => {
	const [searchKeyword, setSearchKeyword] = useState('');
	const [visibleCount, setVisibleCount] = useState(10);
	const [selectedRoom, setSelectedRoom] = useState(null);
	const [showDetail, setShowDetail] = useState(false);
	const [isClosing, setIsClosing] = useState(false);
	const [showSearch, setShowSearch] = useState(false);

	const filteredRooms = useMemo(() => 
		roomData.filter((room) => 
			room.title?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
			room.region?.toLowerCase().includes(searchKeyword.toLowerCase())
		), [searchKeyword]
	);
	const handleItemClick = async (room) => {
		if (!room?.id) {
			console.warn('잘못된 방 정보');
			return;
		}
		try {
			const res = await axios.get(`/api/studies/${room.id}`);
			setSelectedRoom(res.data);
			setShowDetail(true);
		} catch (err) {
			console.error(err);
		}
	};
	const handleDetailClose = () => {
		setIsClosing(true);
	};

	useEffect(() => {
		const handleScroll = () => {
			if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
				setVisibleCount(prev => prev + 10);
			}
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, [filteredRooms.length]);

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
			<Header showSearch={true} onSearch={() => setShowSearch(true)} />

			{showSearch && (
				<div className="search-room">
					<div className="field">
						<input type="text" className="text" name="name" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} placeholder="검색어 입력"/>
					</div>
					<button className="search-room__button" onClick={() => setShowSearch(false)} aria-label="검색 닫기"></button>
				</div>
			)}

			<div className="studyroom-list__content">
				<StudyRoomList
					/* StudyRoomList rooms={rooms || []} */
					rooms={filteredRooms.slice(0, visibleCount)}
					onItemClick={handleItemClick}
				/>
			</div>

			{showDetail && selectedRoom && (
				<Detail 
					room={selectedRoom} 
					isClosing={isClosing} 
					onClose={handleDetailClose} 
				/>
			)}
		</div>
	);
};

export default StudyRoomPage;