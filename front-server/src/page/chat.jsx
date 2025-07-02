import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import Header from '@common/Header';
import Layer from '@common/Layer';
import Roulette from '@components/chat/Roulette';
import ResultModal from '@components/chat/ResultModal';
import TodoList from '@components/chat/TodoListDeployment';
import { useStudySocket } from '@dev/hooks/useSocket';
import { chatAPI, userAPI, reportAPI } from '@dev/services/apiService';
import AttachmentList from '@components/chat/AttachmentList';
import { customAlert, customConfirm, customPrompt } from '@/assets/js/common-ui';
import JoinSystem from '@components/chat/JoinSystem'
import ChatMember from '@components/chat/ChatMember';

function Chat() {
	const location = useLocation();
	const params = useParams();
	const navigate = useNavigate();
	const studyInfo = location.state?.studyRoom || location.state;
		
	// URL query string에서 정보 추출
	const urlParams = new URLSearchParams(location.search);
		
	// 사용자 정보 상태
	const [currentUserId, setCurrentUserId] = useState(null);
	const [currentUserInfo, setCurrentUserInfo] = useState(null);
		
	// URL 파라미터에서 정보를 읽어오거나 location.state에서 가져오기
	const studyId = studyInfo?.studyRoomId || studyInfo?.id || params.studyId || params.id || urlParams.get('studyId') || urlParams.get('id');
	const roomId = studyInfo?.roomId || params.roomId || urlParams.get('roomId');
	const [showJoinSystem, setShowJoinSystem] = useState(false)

	console.log('Chat 컴포넌트 초기화:', { 
		studyInfo, 
		params, 
		urlParams: Object.fromEntries(urlParams.entries()),
		studyId, 
		roomId,
		location: location.pathname + location.search
	});
		
	// 실제 소켓 연동 (사용자 ID가 설정된 후에만)
	const { 
		messages: socketMessages, 
		onlineUsers, 
		typingUsers,
		isJoined, 
		sendMessage: socketSendMessage,
		startTyping,
		stopTyping,
		isConnected,
		socketService // 소켓 서비스 직접 접근을 위해 추가
	} = useStudySocket(studyId, currentUserId);

	// 소켓 상태 디버깅
	useEffect(() => {
		console.log('🔥 소켓 상태 변화:', {
			studyId,
			currentUserId,
			isConnected,
			isJoined,
			socketMessagesLength: socketMessages?.length || 0,
			onlineUsersCount: onlineUsers?.length || 0
		});
		
		if (socketMessages && socketMessages.length > 0) {
			console.log('📚 소켓에서 받은 메시지들:', socketMessages.map(msg => ({
				messageId: msg.messageId || msg._id,
				senderId: msg.senderId,
				text: msg.message || msg.text,
				timestamp: msg.timestamp,
				messageType: msg.messageType
			})));
		}
	}, [studyId, currentUserId, isConnected, isJoined, socketMessages, onlineUsers]);

	const [message, setMessage] = useState('');
	const [messages, setMessages] = useState([]);
	const [isTyping, setIsTyping] = useState(false);
	const textareaRef = useRef(null);
	const [chatHistory, setChatHistory] = useState([]);
	const [showRoulette, setShowRoulette] = useState(false);

	// 파일 업로드
	const fileInputRef = useRef(null);

	// 파일 모아보기
	const [showAttachments, setShowAttachments] = useState(false);
	const [attachments, setAttachments] = useState([]);

	// 참여 인원
	const [showChatMember, setShowChatMember] = useState(false);

	// 랜덤 기능 - 방장 여부 확인
	const [isOwner, setIsOwner] = useState(false);
	const [showResult, setShowResult] = useState(false); // 모달 띄울지 여부
	const [spinning, setSpinning] = useState(false); // 룰렛 돌리는 중 여부
	const [winner, setWinner] = useState(null); // 당첨자

	// 목표 분담
	const [showTodo, setShowTodo] = useState(false);
	const [todoList, setTodoList] = useState([]);
	const [showTodoSetting, setShowTodoSetting] = useState(false);
	const [todoSettingInputs, setTodoSettingInputs] = useState(['', '']);
	const [selectedIndex, setSelectedIndex] = useState(null);
	const [searchResults, setSearchResults] = useState([]); // 검색된 요소 배열
	const [currentIndex, setCurrentIndex] = useState(0); // 현재 몇 번째 결과인지

	// 참가 신청 알림 관련
	const [joinRequests, setJoinRequests] = useState([]); // 참가 신청 목록
	const [showNavigator, setShowNavigator] = useState(false); // 말풍선 표시 여부

	// WebRTC
	const [showVideo, setShowVideo] = useState(false);

	// 신고하기 기능 추가
	const [showReportLayer, setShowReportLayer] = useState(false);
	const [reportTarget, setReportTarget] = useState(null);
	const [showReportButtonIndex, setShowReportButtonIndex] = useState(null);

	const chatEndRef = useRef(null);

	const [fileInfoCache, setFileInfoCache] = useState(new Map());

	// 참가신청 관련 상태
	const [pendingMembers, setPendingMembers] = useState([]);
	const [currentPendingMember, setCurrentPendingMember] = useState(null);
	const [hasPendingRequests, setHasPendingRequests] = useState(false);

	// Todo 관련 함수들
	const handleTodoSettingAddInput = () => {
		if (todoSettingInputs.length < 10) {
			setTodoSettingInputs([...todoSettingInputs, '']);
		}
	};

	const handleInputChange = (e, idx) => {
		const newInputs = [...todoSettingInputs];
		newInputs[idx] = e.target.value;
		setTodoSettingInputs(newInputs);
	};

	const handleTodoConfirm = () => {
		const newTodos = todoSettingInputs
			.filter(title => title.trim() !== '')
			.map(title => ({
				title,
				users: []
			}));

		if (newTodos.length < 2) {
			customAlert('최소 2가지 업무가 필요합니다.');
			return;
		}

		setTodoList(newTodos);
		setShowTodo(true);
		setShowTodoSetting(false);
	};

	const handleTodoSettingDelete = (idx) => {
		const newInputs = [...todoSettingInputs];
		newInputs.splice(idx, 1);
		setTodoSettingInputs(newInputs);
	};

	const handleRemoveTodoList = () => {
		customConfirm('정말 제거하시겠습니까?').then((confirmDelete) => {
			if (confirmDelete) {
				setTodoList([]);
				setShowTodo(false);
			}
		});
	};

	const handleAssignUser = (index) => {
		const userName = currentUserInfo?.nickname || '나';
		const newTodos = [...todoList];

		if (selectedIndex === index) {
			// 선택 해제
			newTodos[index].users = newTodos[index].users.filter(user => user !== userName);
			setSelectedIndex(null);
			console.log("목표 선택이 취소되었습니다.");
		} else {
			// 다른 목표 내 이름 제거
			newTodos.forEach(todo => {
				todo.users = todo.users.filter(user => user !== userName);
			});

			// 새로 선택한 목표에 내 이름 추가
			newTodos[index].users.push(userName);
			setSelectedIndex(index);
			console.log(`목표 ${index}번이 선택되었습니다.`);
		}

		setTodoList(newTodos);
	};

	// 시간 포맷 도우미
	const getFormattedTime = () => {
		const now = new Date();
		const hours = now.getHours();
		const minutes = now.getMinutes();
		const ampm = hours >= 12 ? '오후' : '오전';
		const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
		return { ampm, timeStr };
	};

	// 이미지 파일인지 확인하는 함수
	const isImageFile = (fileName) => {
		if (!fileName) return false;
		const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
		const extension = fileName.split('.').pop().toLowerCase();
		return imageExtensions.includes(extension);
	};

	// 시스템 메시지
	const addSystemMessage = (template, vars = {}) => {
		const text = template.replace(/\$\{(.*?)\}/g, (_, key) => vars[key] ?? '');
		setMessages(prev => [...prev, { 
			type: 'system', 
			text 
		}]);
	};

	// 파일 업로드 (백엔드 먼저, UI 나중)
	const handleFileUpload = async (e) => {
		const file = e.target.files[0];
		if (!file) return;

		console.log('📁 파일 업로드 시작:', {
			fileName: file.name,
			fileSize: file.size,
			fileType: file.type,
			studyId,
			currentUserId
		});

		// 필수 조건 확인
		if (!studyId || !currentUserId) {
			console.error('❌ 파일 업로드 조건 미충족:', { studyId, currentUserId });
			customAlert('파일 업로드에 필요한 정보가 없습니다.');
			e.target.value = '';
			return;
		}

		// 로딩 메시지 추가 (임시)
		const { ampm, timeStr } = getFormattedTime();
		const tempMessage = {
			type: 'me',
			text: `파일을 업로드 중입니다... (${file.name})`,
			time: timeStr,
			ampm,
			isUploading: true
		};
		
		setMessages(prev => [...prev, tempMessage]);

		try {
			// 백엔드에 파일 업로드 먼저 실행
			const formData = new FormData();
			formData.append('file', file);
			formData.append('studyRoomId', studyId.toString());
			formData.append('uploaderId', currentUserId.toString());
			formData.append('fileType', 'STUDY');

			console.log('🚀 백엔드 파일 업로드 요청 전송:', {
				studyRoomId: studyId,
				uploaderId: currentUserId,
				fileType: 'STUDY',
				fileSize: file.size
			});

			const response = await fetch('/api/files/upload', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				},
				body: formData
			});

			if (response.ok) {
				const result = await response.json();
				console.log('✅ 백엔드 파일 업로드 성공:', result);
				console.log('🔍 백엔드 응답 구조 확인:', {
					success: result.success,
					status: result.status,
					data: result.data,
					fileId: result.data?.fileId,
					fileIdType: typeof result.data?.fileId
				});
				
				// 백엔드 업로드 성공 시 UI 업데이트 (실제 fileId 사용)
				const realFileId = result.data?.fileId;

				// fileId가 없으면 경고 출력
				if (!realFileId) {
					console.error('❌ 업로드 결과에 fileId가 없습니다:', result.data);
					customAlert('파일 업로드에 실패했습니다. (fileId 없음)');
					return;
				}
				
				// fileId가 정수가 아닌 경우 경고 출력
				if (!Number.isInteger(realFileId)) {
					console.error('❌ fileId가 정수가 아닙니다:', realFileId, typeof realFileId);
					customAlert('파일 업로드에 실패했습니다. (잘못된 fileId)');
					return;
				}

				// 파일 정보 조회 (업로드 완료 후)
				console.log('🔍 파일 정보 조회 시작:', realFileId);
				const fileInfo = await getFileInfo(realFileId);
				
				if (!fileInfo) {
					console.error('❌ 파일 정보 조회 실패:', realFileId);
					customAlert('파일 업로드에 실패했습니다. (파일 정보 조회 실패)');
					return;
				}

				console.log('✅ 파일 정보 조회 성공:', fileInfo);
				
				// 로딩 메시지 제거만 유지
				setMessages(prev => prev.filter(msg => !msg.isUploading));
				
				// 소켓으로 다른 사용자들에게 실시간 알림 (확인된 파일 정보와 함께)
				if (isConnected && socketSendMessage) {
					console.log('📡 소켓으로 파일 업로드 알림 전송');
					
					// 이미지 파일인지 확인하여 적절한 메시지 설정
					const isImage = isImageFile(fileInfo.originalFilename);
					const messageText = isImage ? '이미지를 업로드했습니다' : '파일을 업로드했습니다';
					
					const socketData = {
						message: messageText,
						messageType: 'FILE',
						fileName: fileInfo.originalFilename,
						fileId: fileInfo.fileId,
						fileSize: fileInfo.fileSize,
						isImage: isImage,
						fileType: 'FILE'  // ChatHandler에서 기대하는 필드
					};
					
					console.log('🔍 소켓 전송 데이터 확인:', socketData);
					console.log('🔍 fileId 타입 확인:', typeof fileInfo.fileId, fileInfo.fileId);
					console.log('🔍 fileId가 정수인지 확인:', Number.isInteger(fileInfo.fileId), fileInfo.fileId);
					console.log('🔍 studyId 확인:', studyId);
					console.log('🔍 currentUserId 확인:', currentUserId);
					
					socketSendMessage(socketData);
				}
			} else {
				console.error('❌ 백엔드 파일 업로드 실패:', response.status, response.statusText);
				
				// 업로드 실패 시 로딩 메시지 제거하고 에러 메시지 표시
				setMessages(prev => prev.filter(msg => !msg.isUploading));
				customAlert(`파일 업로드에 실패했습니다. (${response.status})`);
			}
		} catch (error) {
			console.error('❌ 파일 업로드 에러:', error);
			
			// 에러 시 로딩 메시지 제거하고 에러 메시지 표시
			setMessages(prev => prev.filter(msg => !msg.isUploading));
			customAlert('파일 업로드 중 오류가 발생했습니다.');
		}

		e.target.value = '';
	};

	// 파일 첨부 모아보기
	const handleShowAttachments = async () => {
		console.log('📂 파일 모아보기 시작:', { studyId });
		
		try {
			// 실제 API 호출 시도
			if (studyId) {
				const response = await fetch(`/api/files/studyroom/${studyId}`, {
					method: 'GET',
					headers: {
						'Authorization': `Bearer ${localStorage.getItem('token')}`,
						'Content-Type': 'application/json'
					}
				});

				console.log('📂 파일 목록 API 응답:', response.status);
				
				if (response.ok) {
					const result = await response.json();
					console.log('📂 파일 목록 API 결과:', result);
					
					// 백엔드의 ApiResponse 구조: {status: 'success', data: [...]}  
					if (result.status === 'success' && result.data) {
						const files = result.data.map(file => ({
							name: file.originalFilename || file.fileName,
							fileId: file.fileId,
							fileSize: file.fileSize,
							mimeType: file.mimeType,
							uploadedAt: file.uploadedAt
						}));
						
						setAttachments(files);
						setShowAttachments(true);
						console.log('✅ 실제 파일 목록 조회 성공:', files.length, '개', files);
						return;
					} else {
						console.warn('📂 파일 목록 응답 구조 예상과 다름:', result);
					}
				} else {
					console.error('📂 파일 목록 API 실패:', response.status, response.statusText);
				}
			} else {
				console.warn('📂 studyId가 없음:', studyId);
			}
			
			// API 실패 시 또는 studyId가 없을 때 가짜 데이터 사용 (fallback)
			console.log('📂 가짜 데이터로 fallback');
			setAttachments([
				{ name: '이미지샘플.jpg', fileId: 1 },
				{ name: '사진.jpeg', fileId: 2 },
				{ name: '그림.png', fileId: 3 },
				{ name: '움짤.gif', fileId: 4 },
				{ name: '문서.pdf', fileId: 5 },
				{ name: '보고서.doc', fileId: 6 },
				{ name: '회의록.docx', fileId: 7 },
				{ name: '메모.txt', fileId: 8 },
				{ name: '압축파일.zip', fileId: 9 },
				{ name: '자료집.rar', fileId: 10 },
				{ name: '문서.pdf', fileId: 11 },
			]);
			setShowAttachments(true);
		} catch (err) {
			console.error('📂 파일 목록 조회 실패:', err);
			// 에러 시에도 가짜 데이터 표시
			setAttachments([
				{ name: '이미지샘플.jpg', fileId: 1 },
				{ name: '사진.jpeg', fileId: 2 },
				{ name: '그림.png', fileId: 3 },
			]);
			setShowAttachments(true);
		}
	};

	// 신고하기 함수들
	const handleReportSubmit = async () => {
		if (!reportTarget) {
			customAlert('신고할 메시지를 선택해주세요.');
			return;
		}

		const formData = new FormData(document.querySelector('.layer__content form'));
		const reportType = formData.get('reportType');
		const description = formData.get('description');

		if (!reportType || !description.trim()) {
			customAlert('신고 유형과 내용을 모두 입력해주세요.');
			return;
		}

		try {
			const reportData = {
				reportType: reportType,
				reason: description.trim(),
				reportedUserId: parseInt(reportTarget.senderId || reportTarget.userId),
				messageId: parseInt(reportTarget.messageId || reportTarget._id),
				roomId: parseInt(studyId),
				studyRoomId: parseInt(studyId),
				messageContent: reportTarget.message || reportTarget.text
			};

			console.log('🚨 신고 데이터:', reportData);
			console.log('🚨 신고 데이터 JSON:', JSON.stringify(reportData, null, 2));

			await reportAPI.createChatReport(reportData);
			
			customAlert('신고가 접수되었습니다.');
			setShowReportLayer(false);
			setReportTarget(null);
		} catch (error) {
			console.error('신고 접수 실패:', error);
			console.error('에러 응답:', error.response?.data);
			customAlert('신고 접수에 실패했습니다. 다시 시도해주세요.');
		}
	};

	// 검색기능
	const removeHighlight = () => {
		document.querySelectorAll('.highlight').forEach(el => {
			const parent = el.parentNode;
			parent.innerHTML = parent.textContent;
		});
		document.querySelectorAll('.highlight-impact').forEach(el => {
			el.classList.remove('highlight-impact');
		});
	};

	const handleChatSearch = async () => {
		const keyword = await customPrompt('검색할 내용을 입력하세요', '');
		if (keyword !== null && keyword.trim() !== '') {
			removeHighlight();
			const results = [];
			const chatList = document.querySelectorAll('.user-say, .i-say');

			chatList.forEach(el => {
				const textEl = el.querySelector('.user-say__text, .i-say__text');
				if (textEl && textEl.textContent.includes(keyword)) {
					const regex = new RegExp(`(${keyword})`, 'gi');
					textEl.innerHTML = textEl.textContent.replace(regex, '<span class="highlight">$1</span>');
					results.push(el);
				}
			});

			if (results.length === 0) {
				customAlert('검색 결과가 없습니다.');
				setShowNavigator(false);
			} else if (results.length === 1) {
				setShowNavigator(false);
				setSearchResults(results);
				setCurrentIndex(0);
				results[0].scrollIntoView({ behavior: 'smooth' });
				const textEl = results[0].querySelector('.user-say__text, .i-say__text');
				if (textEl) {
					textEl.classList.add('highlight-impact');
				}
				setTimeout(() => {
					removeHighlight();
					setSearchResults([]);
					setCurrentIndex(0);
				}, 2000);
			} else {
				setShowNavigator(true);
				setSearchResults(results);
				setCurrentIndex(0);
				results[0].scrollIntoView({ behavior: 'smooth' });
			}
		}
	};

	const goToNextNavigator = () => {
		if (searchResults.length === 0) return;
		const nextIndex = (currentIndex + 1) % searchResults.length;
		setCurrentIndex(nextIndex);
		applyActiveClass(nextIndex);
		searchResults[nextIndex].scrollIntoView({ behavior: 'smooth' });
	};

	const goToPrevNavigator = () => {
		if (searchResults.length === 0) return;
		const prevIndex = (currentIndex - 1 + searchResults.length) % searchResults.length;
		setCurrentIndex(prevIndex);
		applyActiveClass(prevIndex);
		searchResults[prevIndex].scrollIntoView({ behavior: 'smooth' });
	};

	const closeNavigator = () => {
		removeHighlight();
		setShowNavigator(false);
		setSearchResults([]);
		setCurrentIndex(0);
	};

	const applyActiveClass = (activeIndex) => {
		searchResults.forEach((el, idx) => {
			const textEl = el.querySelector('.user-say__text, .i-say__text');
			if (!textEl) return;

			if (idx === activeIndex) {
				textEl.classList.add('highlight-impact');
			} else {
				textEl.classList.remove('highlight-impact');
			}
		});
	};

	// 내가 보낼 메시지
	const handleSend = () => {
		if (!message.trim()) return;

		// 타이핑 중지
		stopTyping();

		// 실제 소켓으로 메시지 전송
		if (isConnected && studyId) {
			const messageData = {
				message: message.trim(),
				messageType: 'TEXT'
			};

			console.log('📤 소켓으로 메시지 전송:', messageData);
			const success = socketSendMessage(messageData);
			
			if (!success) {
				console.error('❌ 메시지 전송 실패 - 소켓 서비스 응답:', success);
				window.customAlert && window.customAlert('메시지 전송에 실패했습니다. 연결 상태를 확인해주세요.');
				return;
			}
		}

		setMessage('');
		if (textareaRef.current) textareaRef.current.style.height = 'auto';
	};

	// '엔터'시 채팅 보냄
	const handleKeyDown = (e) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	// 채팅 입력창 높이값
	const handleChange = (e) => {
		const value = e.target.value;
		setMessage(value);
		
		// 타이핑 이벤트 처리
		if (value.trim() === '') {
			// 입력이 비어있으면 타이핑 중지
			stopTyping();
		} else {
			// 입력이 있으면 타이핑 시작
			startTyping();
		}
		
		const textarea = textareaRef.current;
		if (textarea) {
			textarea.style.height = 'auto';
			textarea.style.height = (textarea.scrollHeight / 10) + 'rem';
		}
	};

	// 참가자 목록 생성 함수
	const getAllParticipants = () => {
		const participants = [];
		
		// 현재 사용자 추가
		if (currentUserInfo) {
			participants.push({
				id: currentUserInfo.id,
				name: currentUserInfo.nickname || currentUserInfo.name || '나',
				isMe: true,
				isOnline: true
			});
		}
		
		// 온라인 사용자들 추가 (중복 제거)
		if (onlineUsers && onlineUsers.length > 0) {
			onlineUsers.forEach(user => {
				const isDuplicate = participants.some(p => 
					p.id === user.id || p.id === user.userId
				);
				
				if (!isDuplicate) {
					participants.push({
						id: user.id || user.userId,
						name: user.nickname || user.name || user.username || `사용자${user.id}`,
						isMe: false,
						isOnline: true
					});
				}
			});
		}
		
		return participants;
	};

	// 랜덤게임용 활성 사용자 목록
	const getActiveUsers = () => {
		console.log('🎲 랜덤게임 사용자 목록 생성:', {
			onlineUsers,
			onlineUsersLength: onlineUsers?.length || 0,
			currentUserInfo
		});
		
		const participants = getAllParticipants();
		const userNames = participants.map(p => p.name);
		
		console.log('🎲 최종 사용자 목록:', userNames);
		return userNames;
	};

	// 사용자 정보 로드
	useEffect(() => {
		const loadUserInfo = async () => {
			try {
				console.log('사용자 정보 로드 시작...');
				
				// 토큰 확인
				const token = localStorage.getItem('token');
				console.log('저장된 토큰:', token);
				
				if (!token) {
					console.error('토큰이 없습니다!');
					window.location.href = '/auth';
					return;
				}
				
				const response = await userAPI.getUserInfo();
				console.log('API 응답:', response);
				console.log('응답 데이터:', response.data);
				
				if (response.data && response.data.status === 'success' && response.data.data) {
					setCurrentUserId(response.data.data.id);
					setCurrentUserInfo(response.data.data);
					console.log('사용자 정보 로드 성공:', response.data.data);
					console.log('설정된 사용자 ID:', response.data.data.id);
				} else {
					console.error('응답 데이터 구조가 예상과 다름:', response.data);
				}
			} catch (error) {
				console.error('사용자 정보 로드 실패:', error);
				console.error('에러 응답:', error.response);
				// 토큰이 없거나 만료된 경우 로그인 페이지로 리다이렉트
				if (error.response?.status === 401) {
					console.log('인증 실패 - 로그인 페이지로 이동');
					window.location.href = '/auth';
				}
			}
		};

		loadUserInfo();
	}, []);

	// 소켓 메시지 수신 처리
	useEffect(() => {
		console.log('🔄 소켓 메시지 변화 감지:', {
			socketMessagesLength: socketMessages?.length || 0,
			currentMessagesLength: messages.length,
			isHistoryEmpty: messages.length === 0,
			isJoined,
			isConnected,
			socketMessages: socketMessages?.slice(-3) // 마지막 3개만 로그
		});

		if (socketMessages && socketMessages.length > 0) {
			// 히스토리가 비어있고 소켓 메시지가 있으면 전체 히스토리로 처리
			if (messages.length === 0) {
				console.log('📚 소켓 히스토리를 로컬 messages에 설정');
				console.log('📚 원본 소켓 메시지들:', socketMessages);
				
				const historyMessages = socketMessages.map((msg, index) => {
					console.log(`📚 메시지 ${index} 변환:`, msg);
					
					// MongoDB에서 오는 메시지 구조 처리
					const messageText = msg.message || msg.content || msg.text || '';
					const senderId = msg.senderId || msg.userId || msg.sender || '';
					const senderName = msg.senderName || msg.senderNickname || msg.nickname || msg.username || '사용자';
					const messageTime = msg.timestamp || msg.sentAt || msg.createdAt || new Date().toISOString();
					
					// 시간 포맷팅
					const timeObj = new Date(messageTime);
					const timeStr = timeObj.toLocaleTimeString('ko-KR', { 
						hour: '2-digit', 
						minute: '2-digit' 
					});
					const ampm = timeObj.getHours() >= 12 ? '오후' : '오전';
					
					const baseMessage = {
						type: senderId == currentUserId ? 'me' : 'user',
						text: messageText,
						time: timeStr,
						ampm: ampm,
						senderId: senderId,
						senderName: senderName,
						timestamp: messageTime,
						messageId: msg.messageId || msg._id || `${senderId}-${Date.now()}-${index}`
					};

					// 히스토리 메시지 파싱 시 파일 메시지 변환
					if (
						msg.messageType === 'FILE' &&
						msg.fileInfo &&
						msg.fileInfo.fileId &&
						msg.fileInfo.fileName
					) {
						baseMessage.files = [{
							name: msg.fileInfo.fileName,
							fileId: msg.fileInfo.fileId,
							fileUrl: msg.fileInfo.fileUrl || `/api/files/download/${msg.fileInfo.fileId}`
						}];
					}

					console.log(`✅ 변환된 메시지 ${index}:`, baseMessage);
					return baseMessage;
				});
				
				setMessages(historyMessages);
				console.log('✅ 히스토리 설정 완료:', historyMessages.length, '개 메시지');
				console.log('✅ 설정된 메시지들:', historyMessages);
			} else {
				// 새 메시지만 추가 (마지막 메시지 확인)
				const latestMessage = socketMessages[socketMessages.length - 1];
				console.log('📨 새 메시지 확인:', latestMessage);
				console.log('🔍 fileId 확인:', latestMessage.fileId, typeof latestMessage.fileId);
				console.log('🔍 fileName 확인:', latestMessage.fileName);
				
				// 중복 확인 - 더 정확한 중복 검사
				const exists = messages.find(msg => {
					// messageId가 있으면 우선 비교
					if (latestMessage.messageId && msg.messageId) {
						return msg.messageId === latestMessage.messageId;
					}
					
					// 텍스트와 발신자 ID, 타임스탬프로 비교
					const textMatch = msg.text === (latestMessage.message || latestMessage.text);
					const senderMatch = msg.senderId === latestMessage.senderId;
					const timeMatch = Math.abs(
						new Date(msg.timestamp || 0) - new Date(latestMessage.timestamp || 0)
					) < 3000; // 3초 이내
					
					return textMatch && senderMatch && timeMatch;
				});
				
				if (!exists) {
					console.log('📨 새 메시지 추가:', latestMessage);
					
					// 새 메시지도 동일한 구조로 변환
					const messageText = latestMessage.message || latestMessage.content || latestMessage.text || '';
					const senderId = latestMessage.senderId || latestMessage.userId || '';
					const senderName = latestMessage.senderName || latestMessage.nickname || '사용자';
					const messageTime = latestMessage.timestamp || new Date().toISOString();
					
					const timeObj = new Date(messageTime);
					const timeStr = timeObj.toLocaleTimeString('ko-KR', { 
						hour: '2-digit', 
						minute: '2-digit' 
					});
					const ampm = timeObj.getHours() >= 12 ? '오후' : '오전';
					
					const newMessage = {
						type: senderId == currentUserId ? 'me' : 'user',
						text: messageText,
						time: timeStr,
						ampm: ampm,
						senderId: senderId,
						senderName: senderName,
						timestamp: messageTime,
						messageId: latestMessage.messageId || latestMessage._id || `${senderId}-${Date.now()}`
					};

					// 파일 메시지 변환 (소켓에서 받은 메시지)
					if (
						latestMessage.messageType === 'FILE' &&
						latestMessage.fileId &&
						latestMessage.fileName
					) {
						newMessage.files = [{
							name: latestMessage.fileName,
							fileId: latestMessage.fileId,
							fileUrl: `/api/files/download/${latestMessage.fileId}`
						}];
						console.log('🔧 파일 메시지 변환 완료:', newMessage.files);
					}
					// 히스토리 메시지 파싱 시 파일 메시지 변환 (fallback)
					else if (
						latestMessage.messageType === 'FILE' &&
						latestMessage.fileInfo &&
						latestMessage.fileInfo.fileId &&
						latestMessage.fileInfo.fileName
					) {
						newMessage.files = [{
							name: latestMessage.fileInfo.fileName,
							fileId: latestMessage.fileInfo.fileId,
							fileUrl: latestMessage.fileInfo.fileUrl || `/api/files/download/${latestMessage.fileInfo.fileId}`
						}];
						console.log('🔧 히스토리 파일 메시지 변환 완료:', newMessage.files);
					}
					
					setMessages(prev => [...prev, newMessage]);
				} else {
					console.log('📝 중복 메시지 방지:', latestMessage);
				}
			}
		} else {
			console.log('💤 소켓 메시지 없음 또는 비어있음');
		}
	}, [socketMessages, currentUserId, messages.length, isJoined, isConnected]);

	// 방장 여부 확인
	useEffect(() => {
		if (studyInfo && currentUserInfo) {
			// 타입을 문자열로 통일하여 비교
			const bossId = String(studyInfo.bossId || studyInfo.boss_id);
			const userId = String(currentUserInfo.id || currentUserInfo.userId);
			const isBoss = bossId === userId;
			setIsOwner(isBoss);
			console.log('🏛️ 방장 여부 확인:', {
				bossId,
				userId,
				isBoss,
				studyInfo: {
					bossId: studyInfo.bossId,
					boss_id: studyInfo.boss_id
				},
				currentUserInfo: {
					id: currentUserInfo.id,
					userId: currentUserInfo.userId
				}
			});
		}
	}, [studyInfo, currentUserInfo]);

	// 방장일 때 대기중인 신청 확인 (방장 여부 확인 후 실행)
	useEffect(() => {
		if (isOwner && studyId && currentUserInfo) {
			console.log('🔍 방장 확인됨 - 대기중인 멤버 조회 시작');
			fetchPendingMembers();
		}
	}, [isOwner, studyId, currentUserInfo]);

	// 참가 신청 알림 수신 (방장만)
	useEffect(() => {
		console.log('🎯 참가 신청 알림 리스너 설정:', {
			isConnected,
			isOwner,
			hasSocketService: !!socketService,
			hasSocket: !!socketService?.socket,
			socketConnected: socketService?.socket?.connected
		});

		if (!isConnected || !isOwner || !socketService?.socket) {
			console.log('⚠️ 참가 신청 알림 리스너 설정 안함:', { isConnected, isOwner });
			return;
		}

		// 참가 신청 알림 수신
		const handleJoinRequest = (notification) => {
			console.log('📥 [방장] 참가 신청 알림 수신:', notification);
			
			// 대기중인 신청 상태 업데이트 (신청받기 버튼 표시용)
			setHasPendingRequests(true);
			
			// 시스템 메시지로 표시
			addSystemMessage(`${notification.applicantName}님이 스터디 참가를 신청했습니다.`, {});
			
			// 대기중인 멤버 목록 갱신
			fetchPendingMembers();
		};

		console.log('✅ 참가 신청 알림 리스너 등록 중...');
		socketService.socket.on('join-request-notification', handleJoinRequest);
		
		// 추가 이벤트 리스너들
		socketService.socket.on('study-join-request', (data) => {
			console.log('📥 study-join-request 이벤트 수신:', data);
			setHasPendingRequests(true);
			fetchPendingMembers();
		});
		
		// 테스트용 모든 이벤트 로깅
		socketService.socket.onAny((eventName, ...args) => {
			if (eventName.includes('join')) {
				console.log('🔍 소켓 이벤트 수신:', eventName, args);
			}
		});
		
		// 🔥 안전한 cleanup 함수
		return () => {
			console.log('🧹 참가 신청 알림 리스너 해제');
			try {
				if (socketService?.socket && typeof socketService.socket.off === 'function') {
					socketService.socket.off('join-request-notification', handleJoinRequest);
					socketService.socket.off('study-join-request');
				}
			} catch (error) {
				console.error('리스너 해제 중 에러 (무시):', error);
			}
		};
	}, [isConnected, isOwner, socketService]);

	// 스크롤 하단
	useEffect(() => {
		if (!messages.length) return;
		const lastMsg = messages[messages.length - 1];
		if (lastMsg.type === 'me' && chatEndRef.current) {
			chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, [messages]);

	// 신고하기 버튼 활성화
	useEffect(() => {
		const handleClickOutside = () => {
			setShowReportButtonIndex(null);
		};
		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	}, []);

	// 메시지 파싱 보정 함수 추가
	const parseMessages = (msgs) => {
		return msgs.map(msg => {
			// 이미 files 정보가 있으면 그대로 사용
			if (msg.files && msg.files.length > 0) return msg;
			
			// 파일 메시지인데 files 정보가 없는 경우에만 생성 (fallback)
			if ((msg.messageType === 'FILE' || msg.fileId || msg.fileName) && !msg.files && msg.fileId) {
				console.log('🔍 파일 메시지 files 배열 fallback 생성:', {
					fileName: msg.fileName,
					fileId: msg.fileId,
					messageType: msg.messageType
				});
				msg.files = [{ 
					name: msg.fileName || '파일', 
					fileId: msg.fileId
				}];
			}
			
			return msg;
		});
	};

	// messages를 setMessages 할 때 파싱 보정 적용
	useEffect(() => {
		setMessages(prevMsgs => parseMessages(prevMsgs));
	}, [socketMessages]);

	// 파일 정보 조회 함수 (캐시 포함)
	const getFileInfo = async (fileId) => {
		// 캐시 확인
		if (fileInfoCache.has(fileId)) {
			return fileInfoCache.get(fileId);
		}

		try {
			const response = await fetch(`/api/files/info/${fileId}`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('token')}`,
					'Content-Type': 'application/json'
				}
			});

			if (response.ok) {
				const result = await response.json();
				if (result.status === 'success' && result.data) {
					console.log('✅ 파일 정보 조회 성공:', result.data);
					// 캐시에 저장
					setFileInfoCache(prev => new Map(prev).set(fileId, result.data));
					return result.data;
				}
			}
			console.warn('⚠️ 파일 정보 조회 실패:', response.status);
			return null;
		} catch (error) {
			console.error('❌ 파일 정보 조회 에러:', error);
			return null;
		}
	};

	// 탈퇴하기 기능 (방장/일반 유저 분기)
	const handleLeave = async () => {
		try {
			const token = localStorage.getItem('token');
			if (isOwner) {
				// 방장: 스터디 전체 삭제
				await fetch(`/api/studies/${studyId}`, {
					method: 'DELETE',
					headers: { 'Authorization': `Bearer ${token}` }
				});
				customAlert('스터디가 삭제되었습니다.');
				navigate('/home'); // 홈페이지로 이동 (로그인 상태 유지)
			} else {
				// 일반 유저: 멤버에서 삭제
				await fetch(`/api/studies/${studyId}/leave`, {
					method: 'DELETE',
					headers: { 'Authorization': `Bearer ${token}` }
				});
				customAlert('탈퇴가 완료되었습니다.');
				navigate('/home'); // 홈페이지로 이동 (로그인 상태 유지)
			}
		} catch (e) {
			customAlert('탈퇴 처리 중 오류가 발생했습니다.');
		}
	};

	// 대기중인 멤버 조회 함수
	const fetchPendingMembers = useCallback(async () => {
		try {
			const token = localStorage.getItem('token');
			if (!token || !studyId) return;
			console.log('🔍 대기중인 멤버 조회 시작:', studyId);
			const res = await fetch(`/api/studies/${studyId}/pending-members`, {
				headers: { 'Authorization': `Bearer ${token}` }
			});
			const result = await res.json();
			console.log('📋 대기중인 멤버 조회 결과:', result);
			if (result.status === 'success') {
				console.log('✅ 대기중인 멤버 데이터:', result.data);
				setPendingMembers(result.data);
				setHasPendingRequests(result.data && result.data.length > 0);
			}
		} catch (e) {
			console.error('❌ 대기중인 멤버 조회 실패:', e);
		}
	}, [studyId]);

	// 참가신청 수락 처리
	const handleApprove = async (memberId) => {
		try {
			const token = localStorage.getItem('token');
			await fetch(`/api/studies/${studyId}/members/${memberId}/status?status=APPROVED`, {
				method: 'PUT',
				headers: { 'Authorization': `Bearer ${token}` }
			});
			customAlert('승인 완료');
			fetchPendingMembers(); // 목록 갱신
		} catch (e) {
			customAlert('승인 실패');
		}
	};

	// 참가신청 거절 처리
	const handleReject = async (memberId) => {
		try {
			const token = localStorage.getItem('token');
			await fetch(`/api/studies/${studyId}/members/${memberId}/status?status=REJECTED`, {
				method: 'PUT',
				headers: { 'Authorization': `Bearer ${token}` }
			});
			customAlert('거절 완료');
			fetchPendingMembers(); // 목록 갱신
		} catch (e) {
			customAlert('거절 실패');
		}
	};

	// 신청받기 버튼 클릭 처리
	const handleShowJoinRequests = async () => {
		if (!isOwner) {
			customAlert('방장만 참가신청을 관리할 수 있습니다.');
			return;
		}
		
		console.log('🔍 신청받기 버튼 클릭 - 대기중인 멤버 조회 시작');
		await fetchPendingMembers();
		console.log('📋 조회된 대기중인 멤버:', pendingMembers);
		
		if (pendingMembers.length === 0) {
			customAlert('대기 중인 참가 신청이 없습니다.');
			setHasPendingRequests(false);
			return;
		}
		
		// 첫 번째 신청자 정보로 JoinSystem 열기
		console.log('✅ 첫 번째 신청자 정보:', pendingMembers[0]);
		setCurrentPendingMember(pendingMembers[0]);
		setShowJoinSystem(true);
	};

	// JoinSystem에서 슬라이더 완료 시 (수락)
	const handleJoinSystemComplete = () => {
		if (currentPendingMember) {
			handleApprove(currentPendingMember.memberId);
		}
		setShowJoinSystem(false);
		setCurrentPendingMember(null);
	};

	// JoinSystem에서 X 버튼 클릭 시 (거절)
	const handleJoinSystemCancel = () => {
		if (currentPendingMember) {
			handleReject(currentPendingMember.memberId);
		}
		setShowJoinSystem(false);
		setCurrentPendingMember(null);
	};

	// 강퇴 알림 처리를 위한 추가 리스너 (소켓 연결 상태와 관계없이)
	useEffect(() => {
		if (!socketService?.socket) {
			console.log('⚠️ 소켓 서비스가 없어서 강퇴 리스너를 등록할 수 없습니다.');
			return;
		}

		console.log('🎯 강퇴 이벤트 리스너 등록 시작:', {
			socketConnected: socketService.socket.connected,
			socketId: socketService.socket.id,
			userId: currentUserId
		});

		const handleKickedEvent = (data) => {
			console.log('🚫 강퇴 이벤트 직접 수신:', data);
			customAlert('채팅방에서 강퇴되었습니다.');
			
			// 즉시 소켓 연결 종료
			if (socketService.socket.connected) {
				console.log('🔌 소켓 연결 강제 종료 중...');
				socketService.socket.disconnect();
		}
			
			// 즉시 홈으로 이동 (replace로 히스토리 교체)
			setTimeout(() => {
				console.log('🏠 홈으로 이동 중...');
				navigate('/home', { replace: true });
			}, 100);
		};

		const handleStudyDeletedEvent = (data) => {
			console.log('🗑️ 스터디룸 삭제 이벤트 직접 수신:', data);
			customAlert('스터디룸이 삭제되었습니다.');
			
			// 즉시 소켓 연결 종료
			if (socketService.socket.connected) {
				console.log('🔌 소켓 연결 강제 종료 중...');
				socketService.socket.disconnect();
			}
			
			// 즉시 홈으로 이동 (replace로 히스토리 교체)
			setTimeout(() => {
				console.log('🏠 홈으로 이동 중...');
				navigate('/home', { replace: true });
			}, 100);
		};

		const handleSystemMessage = (message) => {
			console.log('📨 시스템 메시지 수신:', message);
			
			if (message.type === 'kicked') {
				console.log('🚫 시스템 메시지에서 강퇴 감지');
				handleKickedEvent(message);
			} else if (message.type === 'study-deleted') {
				console.log('🗑️ 시스템 메시지에서 스터디룸 삭제 감지');
				handleStudyDeletedEvent(message);
			}
		};

		// 모든 가능한 이벤트 이름으로 리스너 등록
		const events = [
			'kicked',
			'study-deleted',
			'system-message',
			'user-kicked',
			'kick-user',
			'force-disconnect'
		];

		events.forEach(eventName => {
			socketService.socket.on(eventName, (data) => {
				console.log(`📥 이벤트 수신: ${eventName}`, data);
				if (eventName === 'kicked' || eventName === 'user-kicked' || eventName === 'kick-user') {
					handleKickedEvent(data);
				} else if (eventName === 'study-deleted') {
					handleStudyDeletedEvent(data);
				} else if (eventName === 'system-message') {
					handleSystemMessage(data);
				} else if (eventName === 'force-disconnect') {
					handleKickedEvent(data);
				}
			});
		});

		// message-received 이벤트에서도 강퇴/삭제 감지
		socketService.socket.on('message-received', (data) => {
			console.log('📨 message-received 이벤트 수신:', data);
			if (data.type === 'kicked' || data.type === 'study-deleted') {
				console.log('📨 message-received에서 강퇴/삭제 이벤트 감지:', data);
				if (data.type === 'kicked') {
					handleKickedEvent(data);
				} else {
					handleStudyDeletedEvent(data);
				}
			}
		});

		// 모든 이벤트를 로깅 (디버깅용)
		socketService.socket.onAny((eventName, ...args) => {
			console.log('🔍 모든 소켓 이벤트 수신:', eventName, args);
		});

		console.log('✅ 강퇴 이벤트 리스너 등록 완료');

		return () => {
			if (socketService?.socket) {
				console.log('🧹 강퇴 이벤트 리스너 정리 중...');
				events.forEach(eventName => {
					socketService.socket.off(eventName);
				});
				socketService.socket.off('message-received');
			}
		};
	}, [socketService, navigate, currentUserId]);

	return (
		<>
			<Header
				title={studyInfo?.title || '채팅방'}
				showSearch={true}
				onSearch={(e) => {
					e.stopPropagation();
					handleChatSearch()
				}}
				onShowAttachments={handleShowAttachments}
				onBeforeBack={() => {
					Promise.resolve().then(() => {
						if (socketService?.socket?.connected) {
							socketService.socket.disconnect();
						}
					}).catch(() => {
						// 에러 무시
					}).finally(() => {
						// 홈페이지로 이동 (로그인 상태 유지)
						setTimeout(() => {
							navigate('/home');
						}, 0);
					});
				}}
				onLeave={handleLeave} // 탈퇴 함수 연동
				onlineUsers={onlineUsers || []}
				studyInfo={studyInfo || null}
				currentUserInfo={currentUserInfo || null}
				allParticipants={getAllParticipants()}
				onShowParticipants={() => setShowChatMember(true)}
			/>


			{/* 참가 신청 알림 (방장만 표시) - 중복 기능으로 주석처리 */}
			{/*
			{console.log('🔍 알림 박스 렌더링 조건 확인:', {
				isOwner,
				joinRequestsLength: joinRequests.length,
				joinRequests,
				shouldShow: isOwner && joinRequests.length > 0
			})}
			
			{isOwner && joinRequests.length > 0 && (
				<div style={{
					backgroundColor: '#e3f2fd',
					border: '1px solid #2196f3',
					borderRadius: '8px',
					padding: '12px',
					margin: '10px',
					fontSize: '14px'
				}}>
					{joinRequests.map((request) => (
						<div key={request.id} style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							marginBottom: joinRequests.length > 1 ? '8px' : '0'
						}}>
							<span>
								<strong>{request.applicantName}</strong>님이 참가를 신청했습니다.
							</span>
							<div style={{ display: 'flex', gap: '8px' }}>
								<button 
									onClick={() => handleJoinResponse(request, 'approved')}
									style={{
										backgroundColor: '#4caf50',
										color: 'white',
										border: 'none',
										borderRadius: '4px',
										padding: '4px 12px',
										fontSize: '12px',
										cursor: 'pointer'
									}}
								>
									승인
								</button>
								<button 
									onClick={() => handleJoinResponse(request, 'rejected')}
									style={{
										backgroundColor: '#f44336',
										color: 'white',
										border: 'none',
										borderRadius: '4px',
										padding: '4px 12px',
										fontSize: '12px',
										cursor: 'pointer'
									}}
								>
									거절
								</button>
							</div>
						</div>
					))}
				</div>
			)}
			*/}

			<div className={"chatroom-history"}>

				{/* 메시지 출력 영역 */}
				{messages.map((msg, i) => {
					console.log('📨 새 메시지 확인:', {
						type: msg.type,
						messageType: msg.messageType,
						fileId: msg.fileId,
						fileName: msg.fileName,
						hasFiles: !!msg.files,
						filesLength: msg.files?.length || 0,
						text: msg.text,
						senderId: msg.senderId
					});
					
					if (msg.files && msg.files.length > 0) {
						console.log('🔍 files 배열 확인:', msg.files);
						console.log('🔍 files[0].fileId 확인:', msg.files[0].fileId, typeof msg.files[0].fileId);
					}
					
					// 파일 메시지인데 files가 없는 경우 fallback 생성
					if ((msg.messageType === 'FILE' || msg.fileId || msg.fileName) && !msg.files && msg.fileId) {
						console.log('🔍 파일 메시지 files 배열 fallback 생성:', {
							fileName: msg.fileName,
							fileId: msg.fileId,
							messageType: msg.messageType
						});
						msg.files = [{ 
							name: msg.fileName || '파일', 
							fileId: msg.fileId
						}];
					}
					if (msg.senderId === '시스템') {
						console.log('🔍 시스템 메시지 렌더링:', {
							text: msg.text,
							message: msg.message,
							senderId: msg.senderId,
							userId: msg.userId,
							type: msg.type
						});
						return <div key={i} className="program-msg">{msg.text}</div>;
					}

					if (msg.type === 'me') {
						return (
							<div key={i} className="i-say">
								<div className="i-say__text">
									{msg.files?.length > 0 && msg.files[0] && (
										<>
											{/* 이미지 파일인 경우 미리보기 표시 */}
											{isImageFile(msg.files[0].name) ? (
												<div className="image-preview">
													<img 
														src={`/api/files/download/${msg.files[0].fileId}`} 
														alt={msg.files[0].name}
														className="chat-image-preview"
														onClick={() => window.open(`/api/files/download/${msg.files[0].fileId}`, '_blank')}
													/>
													<div className="image-filename">
														{msg.files[0].name}
													</div>
												</div>
											) : (
												/* 일반 파일인 경우 기존 방식 */
												<a href={`/api/files/download/${msg.files[0].fileId}`} target="_blank" rel="noreferrer">
													<div className={`i-say__file i-say__file--${msg.files[0].name.split('.').pop().toLowerCase()}`}>
														<span>{msg.files[0].name}</span>
													</div>
												</a>
											)}
										</>
									)}
									{/* 파일 메시지인 경우 텍스트 중복 방지 */}
									{msg.files?.length > 0 ? 
										(msg.text !== msg.files[0].name ? msg.text : '') : 
										msg.text
									}
								</div>
								<time dateTime={msg.time} className="i-say__time">
									{msg.ampm} <span>{msg.time}</span>
								</time>
							</div>
						);
					}

					if (msg.type === 'user') {
						return (
							<div key={i} className="user-say" onClick={(e) => { e.stopPropagation(); setShowReportButtonIndex(i);}} >
								<div className="user-say__profile"></div>
								<div className="user-say__text">
									{msg.files?.length > 0 && msg.files[0] && (
										<>
											{/* 이미지 파일인 경우 미리보기 표시 */}
											{isImageFile(msg.files[0].name) ? (
												<div className="image-preview">
													<img 
														src={`/api/files/download/${msg.files[0].fileId}`} 
														alt={msg.files[0].name}
														className="chat-image-preview"
														onClick={(e) => {
															e.stopPropagation();
															window.open(`/api/files/download/${msg.files[0].fileId}`, '_blank');
														}}
													/>
													<div className="image-filename">
														{msg.files[0].name}
													</div>
												</div>
											) : (
												/* 일반 파일인 경우 기존 방식 */
												<a href={`/api/files/download/${msg.files[0].fileId}`} target="_blank" rel="noreferrer">
													<div className={`user-say__file user-say__file--${msg.files[0].name.split('.').pop().toLowerCase()}`}>
														{msg.files[0].name}
													</div>
												</a>
											)}
										</>
									)}
									{/* 파일 메시지인 경우 텍스트 중복 방지 */}
									{msg.files?.length > 0 ? 
										(msg.text !== msg.files[0].name ? msg.text : '') : 
										msg.text
									}
								</div>
								<div className="user-say__etc">
									<time dateTime={msg.time} className="user-say__time">
										{msg.ampm} <span>{msg.time}</span>
									</time>
									{showReportButtonIndex === i && (
										<button type="button" aria-label="신고하기" className="user-say__report" onClick={(e) => { e.stopPropagation(); setReportTarget(msg); setShowReportLayer(true); }} ></button>
									)}
								</div>
							</div>
						);
					}

					if (msg.type === 'todo') {
						return <TodoList key={i} todos={msg.todos} />;
					}

					return null;
				})}

				{/* 할 일 공유 토글 영역 - map 바깥에 별도로! */}
				{showTodo && (
					<TodoList todos={todoList} selectedIndex={selectedIndex} onAssignUser={handleAssignUser} />
				)}

				{/* 입력 중 표시 */}
				{typingUsers && typingUsers.length > 0 && (
					<div className="user-say">
						<div className="user-say__profile"></div>
						<div className="user-say__text">
							<div className="user-say__writing">
								<span className="user-say__writing__loading"></span>
								<span className="user-say__writing__loading"></span>
								<span className="user-say__writing__loading"></span>
							</div>
						</div>
					</div>
				)}
					
				<div ref={chatEndRef} />
			</div>

			<div className="msg-writing">
				<div className="msg-writing__box">
					<div className="msg-writing__services">
						<button type="button" className="msg-writing__toggle" title="영상 기능 버튼" onClick={() => window.open("http://192.168.1.232:7600", "_blank")}></button>
					</div>
					<ul className="msg-writing__actions">
						<li>
							<button type="button" className="msg-writing__action" onClick={() => fileInputRef.current.click()}>
								파일 업로드
							</button>
						</li>
						{/* 신청받기 버튼 디버깅 */}
						{console.log('🔍 신청받기 버튼 렌더링 조건:', {
							isOwner,
							hasPendingRequests,
							pendingMembersLength: pendingMembers.length,
							shouldShow: isOwner && hasPendingRequests
						})}
						{isOwner && hasPendingRequests && (
							<li>
								<button type="button" onClick={handleShowJoinRequests} className="msg-writing__action">
									신청받기 {pendingMembers.length > 0 && `(${pendingMembers.length})`}
								</button>
							</li>
						)}
						<li>
							<button type="button" className="msg-writing__action" onClick={() => {
								const users = getActiveUsers();
								if (users.length < 2) {
									customAlert('랜덤게임은 최소 2명 이상이 필요합니다.');
									return;
								}
								setShowRoulette(true);
							}}>
								랜덤게임
							</button>
						</li>
						<li>
							<button type="button" className="msg-writing__action" onClick={() => {
								if (showTodo) {
										handleRemoveTodoList();
									} else {
										setShowTodoSetting(true);
									}
								}}
							>
							{showTodo ? '목표 취소' : '목표 생성'}
							</button>
						</li>
					</ul>
				</div>
				<input type="file" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileUpload} />
				<div className="msg-writing__inputs">
					<div className="msg-writing__field">
						<textarea className="msg-writing__input" placeholder="메세지 입력!" value={message} onChange={handleChange} onKeyDown={handleKeyDown} ref={textareaRef} rows={1} />
					</div>
					<button type="button" className="msg-writing__send" aria-label="입력 전송" onClick={handleSend}/>
				</div>
			</div>

			<Layer isOpen={showRoulette} onClose={() => setShowRoulette(false)} header="랜덤 뽑기">
				<Roulette 
					users={getActiveUsers()} 
					isOwner={isOwner}
					onSpinStart={() => {
						setSpinning(true); // 모달 띄우고
						setShowResult(true); // "룰렛 돌리는 중..." 보여주기
					}}
					onWinnerSelected={(user) => {
						setSpinning(false); // 돌리기 종료
						setWinner(user); // 결과 저장
						addSystemMessage(`"${user}"님이 당첨되셨습니다!`, { user });
					}}
				/>
			</Layer>

			<Layer isOpen={showTodoSetting} onClose={() => setShowTodoSetting(false)} header="목표 설정" footer={ <button type="button" className="todo-setting__submit" onClick={handleTodoConfirm}>목표 전달</button> }>
				<div className="todo-setting">
					{todoSettingInputs.map((input, idx) => (
						<div key={idx} className="todo-setting__unit">
							<div className="field">
								<input className="text" type="text" value={input} onChange={(e) => handleInputChange(e, idx)} placeholder={`업무 ${idx + 1}`}/>
							</div>
							<button type="button" className="todo-setting__delete" aria-label="삭제하기" onClick={() => handleTodoSettingDelete(idx)}></button>
						</div>
					))}
					{todoSettingInputs.length < 10 && (
						<button type="button" className="todo-setting__add" onClick={handleTodoSettingAddInput} aria-label="목표 추가"></button>
					)}
				</div>
			</Layer>

			{showReportLayer && (
				<Layer isOpen={showReportLayer} onClose={() => setShowReportLayer(false)} header="신고하기" footer={
					<button className="layer__submit" onClick={handleReportSubmit} >신고하기</button>
				}>
					<div className="report-layer">
						<form>
							<div className="field">
								<select className="select" name="reportType">
									<option value="">신고 유형을 선택하세요</option>
									<option value="스팸/광고">스팸/광고</option>
									<option value="욕설/비방">욕설/비방</option>
									<option value="음란물">음란물</option>
									<option value="폭력/위협">폭력/위협</option>
									<option value="사기/기만">사기/기만</option>
									<option value="기타">기타</option>
								</select>
							</div>
							<div className="field __textarea">
								<textarea className="textarea" placeholder="신고 내용을 상세히 적어주세요." name="description" />
							</div>
						</form>
					</div>
				</Layer>
			)}

			{showNavigator && (
				<div className="search-navigator">
					<div className="search-navigator__controllers">
						<button type="button" className="search-navigator__arr search-navigator__arr--up" onClick={goToPrevNavigator} aria-label="검색된 이전 단어 찾기"></button>
						<span>{currentIndex + 1} / {searchResults.length}</span>
						<button type="button" className="search-navigator__arr search-navigator__arr--down" onClick={goToNextNavigator} aria-label="검색된 다음 단어 찾기"></button>
					</div>
					<button type="button" className="search-navigator__close" onClick={closeNavigator} aria-label="닫기"></button>
				</div>
			)}
			
			{showResult && (
				<ResultModal
					spinning={spinning}
					winner={winner}
					onClose={() => {
						setShowResult(false);
						setWinner(null);
						setSpinning(false);
					}}
				/>
			)}

			{showChatMember && (
				<ChatMember
					isVisible={showChatMember}
					onClose={() => setShowChatMember(false)}
					studyId={studyId}
					roomId={roomId}
					currentUserInfo={currentUserInfo}
					isOwner={isOwner}
					socketService={socketService}
				/>
			)}

			{showJoinSystem && (
				<JoinSystem 
					isOpen={showJoinSystem}
					onClose={() => setShowJoinSystem(false)}
					isOwner={isOwner}
					currentPendingMember={currentPendingMember}
					onComplete={handleJoinSystemComplete}
					onCancel={handleJoinSystemCancel}
				/>
			)}

			{showAttachments && (
				<AttachmentList
					isOpen={showAttachments}
					attachments={attachments}
					onClose={() => setShowAttachments(false)}
				/>
			)}
		</>
	);
}

export default Chat;