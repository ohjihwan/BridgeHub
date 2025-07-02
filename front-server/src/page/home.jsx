import { useState, useEffect } from 'react';
import Detail from '@components/Detail';
import CreateStudy from '@components/CreateStudy';
import Header from '@common/Header';
import PreviewBoard from '@components/PreviewBoard';
import { useNavigate, Link } from "react-router-dom";
import StudyRoomList from '@components/StudyRoomList';
import { studyClient } from '@js/common-ui';
import axios from 'axios';
import { useSocket } from '../../dev/hooks/useSocket';

const Home = () => {
	const navigate = useNavigate();
	const [rooms, setRooms] = useState([]);
	const [selectedRoom, setSelectedRoom] = useState(null);
	const [studyRoom, setStudyRoom] = useState(null);
	const [hasStudyRoom, setHasStudyRoom] = useState(false);
	const [isClosing, setIsClosing] = useState(false);
	const [showDetail, setShowDetail] = useState(false);
	const [showCreateStudy, setShowCreateStudy] = useState(false);
	
	// 소켓 연결
	const { isConnected, socketService } = useSocket();

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
		// 스터디룸 생성 후 내 스터디룸 정보 다시 가져오기
		fetchMyRoom();
	};

	const fetchMyRoom = async () => {
		try {
			const token = localStorage.getItem('token');
			if (!token) {
				setHasStudyRoom(false);
				setStudyRoom(null);
				return;
			}

			// 내가 개설한 스터디룸 조회
			const res = await studyClient.get('/my-created', {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			console.log('🏠 내 스터디룸 API 응답:', res.data);

			if (res.data.success && res.data.data && res.data.data.length > 0) {
				// 첫 번째 스터디룸을 선택 (한 사용자는 하나만 개설 가능)
				const studyRoomData = res.data.data[0];
				console.log('🏠 스터디룸 데이터:', studyRoomData);
				console.log('🏠 스터디룸 필드들:', Object.keys(studyRoomData));
				
				setStudyRoom(studyRoomData);
				setHasStudyRoom(true);
			} else {
				setHasStudyRoom(false);
				setStudyRoom(null);
			}
		} catch (err) {
			console.error('내 스터디룸 조회 실패:', err);
			setHasStudyRoom(false);
			setStudyRoom(null);
		}
	};

	useEffect(() => {
		axios.get('/api/studies')
			.then(res => {
				if (res.data.status === 'success' && Array.isArray(res.data.data)) {
					setRooms(res.data.data);
				} else {
					setRooms([]);
				}
			})
			.catch(err => {
				setRooms([]);
			});
	}, []);

	useEffect(() => {
		fetchMyRoom();
	}, []);
	
	// 실시간 스터디룸 업데이트 처리
	useEffect(() => {
		if (!isConnected || !socketService?.socket) {
			console.log('⚠️ 소켓이 연결되지 않아 실시간 업데이트를 설정할 수 없습니다.');
			return;
		}

		console.log('✅ 스터디룸 실시간 업데이트 리스너 등록');

		// 스터디룸 업데이트 이벤트 리스너
		const handleStudyRoomUpdate = (data) => {
			console.log('📢 스터디룸 업데이트 이벤트 수신:', data);
			
			const { action, studyRoom } = data;
			
			if (action === 'created') {
				// 새 스터디룸 생성 - 목록에 추가
				setRooms(prevRooms => {
					// 이미 존재하는지 확인
					const exists = prevRooms.some(room => room.id === studyRoom.studyRoomId);
					if (!exists) {
						console.log('➕ 새 스터디룸 추가:', studyRoom.title);
						return [studyRoom, ...prevRooms];
					}
					return prevRooms;
				});
			} else if (action === 'deleted') {
				// 스터디룸 삭제 - 목록에서 제거
				setRooms(prevRooms => {
					const filtered = prevRooms.filter(room => room.id !== studyRoom.studyRoomId);
					if (filtered.length !== prevRooms.length) {
						console.log('➖ 스터디룸 삭제:', studyRoom.title);
					}
					return filtered;
				});
				
				// 현재 선택된 스터디룸이 삭제된 경우 상세창 닫기
				if (selectedRoom && selectedRoom.id === studyRoom.studyRoomId) {
					setShowDetail(false);
					setSelectedRoom(null);
				}
			} else if (action === 'updated') {
				// 스터디룸 수정 - 목록에서 업데이트
				setRooms(prevRooms => {
					const updated = prevRooms.map(room => 
						room.id === studyRoom.studyRoomId ? studyRoom : room
					);
					console.log('✏️ 스터디룸 수정:', studyRoom.title);
					return updated;
				});
				
				// 현재 선택된 스터디룸이 수정된 경우 상세창 업데이트
				if (selectedRoom && selectedRoom.id === studyRoom.studyRoomId) {
					setSelectedRoom(studyRoom);
				}
			}
		};

		// 이벤트 리스너 등록
		socketService.socket.on('study-room-update', handleStudyRoomUpdate);

		// 클린업 함수
		return () => {
			console.log('🧹 스터디룸 실시간 업데이트 리스너 해제');
			if (socketService?.socket) {
				socketService.socket.off('study-room-update', handleStudyRoomUpdate);
			}
		};
	}, [isConnected, socketService, selectedRoom]);

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
				<Header showSearch={true} onSearch={() => navigate('/search')} />

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
					{studyRoom && (
						<div className="reenter-studyroom">
							<Link 
								to="/chat" 
								className="reenter-studyroom__link" 
								title="참여중인 방으로 이동"
								state={{ studyRoom: studyRoom }}
							>
								<div className="reenter-studyroom__thumbnail">
									<img src={`/uploads/thumbnail/${studyRoom.thumbnail}`} alt="스터디룸 썸네일" />
								</div>
								<h3 className="reenter-studyroom__title">{studyRoom.title}</h3>
								<ul className="room-info">
									<li>{studyRoom.region}</li>
									<li>{studyRoom.time}</li>
									<li>{studyRoom.currentMembers} / {studyRoom.capacity}명</li>
								</ul>
							</Link>
						</div>
					)}

					{/* ⚡ 앞으로 추가될 케이스 공간 확보 */}
					{/* 예: 추후 여러 스터디 선택 화면 */}
					{/* 
					<div className="multi-studyroom"> 
						...여러 방 선택 영역
					</div> 
					*/}
				</div>

				{/* 재사용성과 복잡도 때문에 분리 */}
				<PreviewBoard onItemClick={handleItemClick} />
				{/* 
					<ul className="studyroom">이 Home.jsx에 남아있는 이유
					1. 메인 리스트이자 상세 정보 트리거 UI이기 때문
						- 이 리스트는 실제로 유저가 가장 많이 상호작용하는 UI.
					2. 아직은 로직상 단순하고, 페이지에 종속적인 리스트이기 때문
				*/}
				<div className="studyroom-area">
					<div className="more-box">
						<h2 className="more-box__title">JUST ADDED</h2>
						<button type="button" className="more-box__link" onClick={() => navigate('/list')}>더보기</button>
					</div>
					
					<StudyRoomList rooms={rooms} onItemClick={handleItemClick} limit={10} />
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