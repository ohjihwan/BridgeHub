import { useState, useEffect, useMemo } from 'react';
import Header from '@common/Header';
import StudyRoomList from '@components/StudyRoomList';
import ListSearch from '@components/ListSearch';
import Detail from '@components/Detail';
import axios from 'axios';
import { useSocket } from '../../dev/hooks/useSocket';

const StudyRoomPage = () => {
	const [searchKeyword, setSearchKeyword] = useState('');
	const [visibleCount, setVisibleCount] = useState(10);
	const [selectedRoom, setSelectedRoom] = useState(null);
	const [showDetail, setShowDetail] = useState(false);
	const [isClosing, setIsClosing] = useState(false);
	const [showSearch, setShowSearch] = useState(false);
	const [rooms, setRooms] = useState([]);
	const [loading, setLoading] = useState(false);
	
	// 소켓 연결
	const { isConnected, socketService } = useSocket();

	// 실제 API에서 스터디룸 데이터 가져오기
	useEffect(() => {
		const fetchRooms = async () => {
			setLoading(true);
			try {
				const response = await axios.get('/api/studies');
				if (response.data.status === 'success' && Array.isArray(response.data.data)) {
					setRooms(response.data.data);
				} else {
					setRooms([]);
				}
			} catch (error) {
				console.error('스터디룸 목록 조회 실패:', error);
				setRooms([]);
			} finally {
				setLoading(false);
			}
		};

		fetchRooms();
	}, []);

	// 실시간 스터디룸 업데이트 처리
	useEffect(() => {
		if (!isConnected || !socketService?.socket) {
			console.log('⚠️ 소켓이 연결되지 않아 실시간 업데이트를 설정할 수 없습니다.');
			return;
		}

		console.log('✅ List 페이지 - 스터디룸 실시간 업데이트 리스너 등록');

		// 스터디룸 업데이트 이벤트 리스너
		const handleStudyRoomUpdate = (data) => {
			console.log('📢 List 페이지 - 스터디룸 업데이트 이벤트 수신:', data);
			
			const { action, studyRoom } = data;
			
			if (action === 'created') {
				// 새 스터디룸 생성 - 목록에 추가
				setRooms(prevRooms => {
					// 이미 존재하는지 확인
					const exists = prevRooms.some(room => room.id === studyRoom.studyRoomId);
					if (!exists) {
						console.log('➕ List 페이지 - 새 스터디룸 추가:', studyRoom.title);
						return [studyRoom, ...prevRooms];
					}
					return prevRooms;
				});
			} else if (action === 'deleted') {
				// 스터디룸 삭제 - 목록에서 제거
				setRooms(prevRooms => {
					const filtered = prevRooms.filter(room => room.id !== studyRoom.studyRoomId);
					if (filtered.length !== prevRooms.length) {
						console.log('➖ List 페이지 - 스터디룸 삭제:', studyRoom.title);
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
					console.log('✏️ List 페이지 - 스터디룸 수정:', studyRoom.title);
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
			console.log('🧹 List 페이지 - 스터디룸 실시간 업데이트 리스너 해제');
			if (socketService?.socket) {
				socketService.socket.off('study-room-update', handleStudyRoomUpdate);
			}
		};
	}, [isConnected, socketService, selectedRoom]);

	const filteredRooms = useMemo(() => 
		rooms.filter((room) => 
			room.title?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
			room.region?.toLowerCase().includes(searchKeyword.toLowerCase())
		), [rooms, searchKeyword]
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
				<ListSearch
					value={searchKeyword}
					onChange={(e) => setSearchKeyword(e.target.value)}
					onClose={() => setShowSearch(false)}
				/>
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