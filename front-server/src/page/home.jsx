import { useState, useEffect } from 'react';
import Detail from './components/Detail';
import CreateStudy from './components/CreateStudy';
import Header from './common/Header';
import HotRoomSwiper from '@components/HotRoomSwiper';
import roomData from '@json/Room.json';
import Layer from './common/Layer';
import { useNavigate } from "react-router-dom";

const Home = () => {
	const navigate = useNavigate();
	const [selectedRoom, setSelectedRoom] = useState(null);
	const hasStudyRoom = true;
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
	const openCreateStudy = () => {
		setShowCreateStudy(true);
	};
	const closeCreateStudy = () => {
		setShowCreateStudy(false);
	};
	const goToMyStudyRoom = () => {
		// 내 스터디룸으로 이동 로직
		navigate("/chat"); // 실제 경로로 수정
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
	useEffect(() => {
		if (showCreateStudy) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	}, [showCreateStudy]);

	return (
		<>
			<div className={`main-container ${showDetail && !isClosing ? 'detail-open' : ''}`}>
				<Header />

				<div className="create-studyroom">
					<button className="create-studyroom__button" onClick={openCreateStudy}>
						스터디 개설하기
						<span className="sub-txt">
							나만의 스터디를 만들고<br />함께 할 팀원을 모집해보세요!
						</span>
					</button>
				</div>
				
				<div className="studyroom-actions">
				{/* 소속된 방이 없는 경우 */}
				{!hasStudyRoom && (
					<div className="create-studyroom">
						<button className="create-studyroom__button" onClick={openCreateStudy}>
							스터디 개설하기
							<span className="sub-txt">
								나만의 스터디를 만들고<br />함께 할 팀원을 모집해보세요!
							</span>
						</button>
					</div>
				)}

				{/* 소속된 방이 있는 경우 */}
				{hasStudyRoom && (
					<div className="reenter-studyroom">
						<button className="reenter-studyroom__button" onClick={goToMyStudyRoom}>
							내 스터디룸 바로가기
							<span className="sub-txt">
								이미 개설한 스터디로 돌아갑니다.
							</span>
						</button>
					</div>
				)}

				{/* ⚡ 앞으로 추가될 케이스 공간 확보 */}
				{/* 예: 추후 여러 스터디 선택 화면 */}
				{/* <div className="multi-studyroom"> 
					...여러 방 선택 영역
				</div> */}
			</div>

				{/* 재사용성과 복잡도 때문에 분리 */}
				<HotRoomSwiper onItemClick={handleItemClick} />
			
				{/* 
					<ul className="studyroom">이 Home.jsx에 남아있는 이유
					1. 메인 리스트이자 상세 정보 트리거 UI이기 때문
						- 이 리스트는 실제로 유저가 가장 많이 상호작용하는 UI.
					2. 아직은 로직상 단순하고, 페이지에 종속적인 리스트이기 때문
				*/}
				<div className="studyroom-area">
					<div className="more-box">
						<h2 className="more-box__title">JUST ADDED</h2>
						<a href="#none" className="more-box__link">더보기</a>
					</div>
					<ul className="studyroom">
						{studyRooms.map((room) => (
							<li className="studyroom__item" onClick={() => handleItemClick(room)} key={room.id}>
								<button type="button" className="studyroom__info">
									<img src={`/uploads/thumbnail/${room.thumbnail}`} className="studyroom__img"/>
									<h3 className="studyroom__title">{room.title}</h3>
									<div className="studyroom__details">
										<span className="studyroom__detail">{room.region}</span>
										<span className="studyroom__detail">{room.time}</span>
										<span className="studyroom__detail">{room.currentMembers}/{room.capacity}명</span>
									</div>
								</button>
							</li>
						))}
					</ul>
				</div>
			</div>
		
			{showCreateStudy && (
				<CreateStudy onClose={closeCreateStudy} />
			)}
			
			{showDetail && selectedRoom && (
				<Detail
					room={selectedRoom}
					isClosing={isClosing}
					onClose={handleDetailClose}
				/>
			)}
		</>
	);
};

export default Home; 