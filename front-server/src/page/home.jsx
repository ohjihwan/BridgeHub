import React, { useState, useEffect } from 'react';
import Detail from './detail';
import CreateStudy from './create';
import Header from './common/Header';
import HotRoomSwiper from '@page/HotRoomSwiper';
import roomData from '@json/room.json';

const Home = () => {
	const [selectedRoom, setSelectedRoom] = useState(null);
	const [studyRooms, setStudyRooms] = useState([]);
	const [showDetail, setShowDetail] = useState(false);
	const [isClosing, setIsClosing] = useState(false);
	const [showCreateStudy, setShowCreateStudy] = useState(false);

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

	const toggleCreateStudy = () => {
		setShowCreateStudy((prev) => !prev);
	};

	return (
		<div className="main-container">
			<Header />
			
			<div className="create-studyroom">
				<button className="create-studyroom__button" onClick={() => toggleCreateStudy(true)}>
					스터디 개설하기
					<span className="sub-txt">나만의 스터디를 만들고<br />함께 할 팀원을 모집해보세요!</span>
				</button>
			</div>

			{/* 재사용성과 복잡도 때문에 분리 */}
			<HotRoomSwiper onItemClick={handleItemClick} />
		
			{/* 
				<ul className="studyroom">이 Home.jsx에 남아있는 이유
				1. 메인 리스트이자 상세 정보 트리거 UI이기 때문
					- 이 리스트는 실제로 유저가 가장 많이 상호작용하는 UI.
				2. 아직은 로직상 단순하고, 페이지에 종속적인 리스트이기 때문
			*/}
			<ul className="studyroom">
				{studyRooms.map((room) => (
					<li className="studyroom__item" onClick={() => handleItemClick(room)} key={room.id}>
						<div className="studyroom__info">
							<h3 className="studyroom__title">{room.title}</h3>
							<div className="studyroom__details">
								<span className="studyroom__detail">{room.region}</span>
								<span className="studyroom__detail">{room.time}</span>
								<span className="studyroom__detail">{room.currentMembers}/{room.capacity}명</span>
							</div>
						</div>
					</li>
				))}
			</ul>
			
			{showDetail && selectedRoom && (
				<Detail
					room={selectedRoom}
					isClosing={isClosing}
					onClose={handleDetailClose}
				/>
			)}
			{showCreateStudy && (
				<>
					<div className="overlay" onClick={() => toggleCreateStudy(false)}></div>
					<CreateStudy onClose={() => toggleCreateStudy(false)} />
				</>
			)}
		</div>
	);
};

export default Home; 