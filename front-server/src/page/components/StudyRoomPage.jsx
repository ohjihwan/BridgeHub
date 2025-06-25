import { useState, useEffect } from 'react';
import StudyRoomList from '@components/StudyRoomList';
import roomData from '@json/Room.json';
import Header from '@common/Header';
import Detail from '@components/Detail';

const StudyRoomPage = () => {
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

	const handleScroll = () => {
		if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
			setVisibleCount(prev => {
				if (prev >= studyRooms.length) return prev;
				return Math.min(prev + 10, studyRooms.length);
			});
		}
	};

	useEffect(() => {
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, [studyRooms.length]);
	useEffect(() => {
		setStudyRooms(roomData);
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
	useEffect(() => {
		const timer = setTimeout(() => setShow(true), 10);
		return () => clearTimeout(timer);
	}, []);

	return (
		<div className={`studyroom-list ${show ? 'show' : ''}`}>
			<Header showSearch={true} />

			<div className="studyroom-list__content">
				<StudyRoomList rooms={studyRooms} onItemClick={handleItemClick} limit={visibleCount} />
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
