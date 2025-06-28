import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '@common/Header';
import Layer from '@common/Layer';
import Roulette from '@components/chat/Roulette';
import ResultModal from '@components/chat/ResultModal';
import TodoList from '@components/chat/TodoListDeployment';
import Video from '@components/Video';
import { useStudySocket } from '@dev/hooks/useSocket';
import { chatAPI, userAPI } from '@dev/services/apiService';

function Chat() {
	const location = useLocation();
	const studyInfo = location.state?.studyRoom || location.state;
	
	// 사용자 정보 상태
	const [currentUserId, setCurrentUserId] = useState(null);
	const [currentUserInfo, setCurrentUserInfo] = useState(null);
	
	const studyId = studyInfo?.studyRoomId || studyInfo?.id;
	const roomId = studyInfo?.roomId;
	
	// 실제 소켓 연동 (사용자 ID가 설정된 후에만)
	const { 
		messages: socketMessages, 
		onlineUsers, 
		isJoined, 
		sendMessage: socketSendMessage,
		isConnected 
	} = useStudySocket(studyId, currentUserId);

	const [message, setMessage] = useState('');
	const [messages, setMessages] = useState([]);
	const [isTyping, setIsTyping] = useState(false);
	const textareaRef = useRef(null);
	const [chatHistory, setChatHistory] = useState([]);
	const [showRoulette, setShowRoulette] = useState(false);
	// 랜덤 기능
	const isOwner = true; // 추후 socket or props로 실제 값 연결
	const [showResult, setShowResult] = useState(false); // 모달 띄울지 여부
	const [spinning, setSpinning] = useState(false); // 룰렛 돌리는 중 여부
	const [winner, setWinner] = useState(null); // 당첨자
	// --------
	// 목표 분담
	const [showTodo, setShowTodo] = useState(false);
	const [todoList, setTodoList] = useState([]);
	const [showTodoSetting, setShowTodoSetting] = useState(false);
	const [todoSettingInputs, setTodoSettingInputs] = useState(['', '']);
	const [selectedIndex, setSelectedIndex] = useState(null);
	const [searchResults, setSearchResults] = useState([]); // 검색된 요소 배열
	const [currentIndex, setCurrentIndex] = useState(0); // 현재 몇 번째 결과인지
	const [showNavigator, setShowNavigator] = useState(false); // 말풍선 표시 여부
	// WebRTC
	const [showVideo, setShowVideo] = useState(false);
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
	const handleAssignUser = (index) => {
		const userName = '김사과';
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
	// --------

	// 신고하기 기능 추가
	const [showReportLayer, setShowReportLayer] = useState(false);
	const [reportTarget, setReportTarget] = useState(null);
	const [showReportButtonIndex, setShowReportButtonIndex] = useState(null);
	const handleReportSubmit = () => {
		customConfirm('신고하시겠습니까?').then((confirm) => {
			if (confirm) {
				// 실제 신고 로직
				customAlert('신고가 접수되었습니다.');
				setShowReportLayer(false);
			}
		});
	};
	// --------
	
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
	// --------

	const chatEndRef = useRef(null);

	// 시간 포맷 도우미
	const getFormattedTime = () => {
		const now = new Date();
		const hours = now.getHours();
		const minutes = now.getMinutes();
		const ampm = hours >= 12 ? '오후' : '오전';
		const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
		return { ampm, timeStr };
	};

	// 시스템 메시지
	const addSystemMessage = (template, vars = {}) => {
		const text = template.replace(/\$\{(.*?)\}/g, (_, key) => vars[key] ?? '');
		setMessages(prev => [...prev, { 
			type: 'system', 
			text 
		}]);
	};

	// 내가 보낼 메시지
	const handleSend = () => {
		if (!message.trim()) return;

		// 실제 소켓으로 메시지 전송
		if (isConnected && studyId) {
			const messageData = {
				message: message.trim(),
				messageType: 'TEXT'
			};

			const success = socketSendMessage(messageData);
			
			if (!success) {
				console.error('메시지 전송 실패');
				return;
			}
		}

		// 로컬 UI 업데이트
		const { ampm, timeStr } = getFormattedTime();
		setMessages(prev => [
			...prev,
			{ type: 'me', text: message, time: timeStr, ampm, senderId: currentUserId }
		]);
		setMessage('');
		if (textareaRef.current) textareaRef.current.style.height = 'auto';
	};

	// '엔터'시 체팅 보냄
	const handleKeyDown = (e) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const handleRemoveTodoList = () => {
		customConfirm('정말 제거하시겠습니까?').then((confirmDelete) => {
			if (confirmDelete) {
				setTodoList([]);
				setShowTodo(false);
			}
		});
	};

	// 체팅 입력창 높이값
	const handleChange = (e) => {
		const value = e.target.value;
		setMessage(value);
		const textarea = textareaRef.current;
		if (textarea) {
			textarea.style.height = 'auto';
			textarea.style.height = (textarea.scrollHeight / 10) + 'rem';
		}
	};

	// WebRTC
	

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
		if (socketMessages && socketMessages.length > 0) {
			const latestMessage = socketMessages[socketMessages.length - 1];
			
			// 내가 보낸 메시지가 아닌 경우에만 추가
			if (latestMessage.senderId !== currentUserId) {
				const { ampm, timeStr } = getFormattedTime();
				
				const newMessage = {
					type: 'user',
					text: latestMessage.message || latestMessage.text,
					time: timeStr,
					ampm: ampm,
					senderId: latestMessage.senderId,
					senderName: latestMessage.senderName || '사용자'
				};
				
				setMessages(prev => {
					// 중복 메시지 방지
					const exists = prev.find(msg => 
						msg.text === newMessage.text && 
						msg.senderId === newMessage.senderId &&
						Math.abs(new Date() - new Date(msg.timestamp || 0)) < 1000
					);
					
					if (!exists) {
						return [...prev, { ...newMessage, timestamp: new Date() }];
					}
					return prev;
				});
			}
		}
	}, [socketMessages, currentUserId]);

	// 채팅 히스토리 로드
	useEffect(() => {
		const loadChatHistory = async () => {
			console.log('채팅 히스토리 로드 시작:', { roomId, studyId, currentUserId });
			
			// roomId 또는 studyId 중 하나라도 있으면 시도
			const chatRoomId = roomId || studyId;
			
			if (chatRoomId && currentUserId) {
				try {
					console.log('채팅 히스토리 API 호출:', chatRoomId);
					const response = await chatAPI.getRecentMessages(chatRoomId);
					console.log('채팅 히스토리 응답:', response);
					
					if (response.data && response.data.status === 'success') {
						const messages = response.data.data || [];
						console.log('받은 메시지 개수:', messages.length);
						
						if (messages.length > 0) {
							const historyMessages = messages.map(msg => ({
								type: msg.senderId === currentUserId ? 'me' : 'user',
								text: msg.content,
								time: new Date(msg.sentAt).toLocaleTimeString('ko-KR', { 
									hour: '2-digit', 
									minute: '2-digit' 
								}),
								ampm: new Date(msg.sentAt).getHours() >= 12 ? '오후' : '오전',
								senderId: msg.senderId,
								senderName: msg.senderNickname || msg.senderName
							}));
							
							setChatHistory(historyMessages);
							setMessages(prev => [...historyMessages, ...prev]);
							console.log('채팅 히스토리 로드 완료:', historyMessages.length, '개 메시지');
						} else {
							console.log('채팅 히스토리가 비어있습니다.');
						}
					} else {
						console.warn('채팅 히스토리 응답 구조가 예상과 다름:', response.data);
					}
				} catch (error) {
					console.error('채팅 히스토리 로드 실패:', error);
					console.error('에러 상세:', error.response?.data);
					
					// 에러가 발생해도 채팅 기능은 계속 사용할 수 있도록 함
					if (error.response?.status === 404) {
						console.log('채팅방이 존재하지 않거나 메시지가 없습니다.');
					}
				}
			} else {
				console.log('채팅 히스토리 로드 조건 미충족:', { chatRoomId, currentUserId });
			}
		};

		loadChatHistory();
	}, [roomId, studyId, currentUserId]);

	// 연결 상태 메시지
	useEffect(() => {
		if (isJoined && studyInfo) {
			addSystemMessage('${user}님이 ${action}하셨습니다.', { 
				user: '나', 
				action: '입장' 
			});
		}
	}, [isJoined, studyInfo]);

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

	/* 소캣테스트용 */
	const testUsers = ['김사과', '반하나', '오렌지', '이메론', '채애리'];

	return (
		<>
			<Header
				title={studyInfo?.title || '채팅방'}
				showSearch={true}
				onSearch={(e) => {
					e.stopPropagation();
					handleChatSearch()
				}}
			/>
			<div className={"chatroom-history"}>

				{/* 테스트 목적 용도 */}
				<button type="button" className="testButton" onClick={() => {
					const { ampm, timeStr } = getFormattedTime();
					setMessages(prev => [
						...prev,
						{
							type: 'user',
							text: '테스트 메시지에요',
							time: timeStr,
							ampm: ampm
						}
					]);
				}}>상대 메시지 테스트</button>
				<button type="button" className="testButton" onClick={() => {
						setIsTyping(true); // 입력 중 상태 on
						// 3초 후 타이핑 종료
						setTimeout(() => {
							setIsTyping(false);
						}, 3000);
					}}
				>타이핑 테스트</button>
				{/* // 테스트 목적 용도 */}

				{/* 메시지 출력 영역 */}
				{messages.map((msg, i) => {
					if (msg.type === 'system') {
						return <div key={i} className="program-msg">{msg.text}</div>;
					}

					if (msg.type === 'me') {
						return (
							<div key={i} className="i-say">
								<div className="i-say__text">{msg.text}</div>
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
								<div className="user-say__text">{msg.text}</div>
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
				{isTyping && (
					<div className="user-say" onClick={() => setShowReportLayer(true)}>
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
						<button type="button" className="msg-writing__toggle" title="영상 기능 버튼" onClick={() => setShowVideo(true)}></button>
					</div>
					<ul className="msg-writing__actions">
						<li>
							<button type="button" className="msg-writing__action" onClick={() => setShowRoulette(true)}>
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
				<div className="msg-writing__inputs">
					<div className="msg-writing__field">
						<textarea className="msg-writing__input" placeholder="메세지 입력!" value={message} onChange={handleChange} onKeyDown={handleKeyDown} ref={textareaRef} rows={1} />
					</div>
					<button type="button" className="msg-writing__send" aria-label="입력 전송" onClick={handleSend}/>
				</div>
			</div>

			<Layer isOpen={showRoulette} onClose={() => setShowRoulette(false)} header="랜덤 뽑기">
				<Roulette 
					users={testUsers} 
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
						<div className="field">
							<select className="select" name="report-type">
								<option value="신고1">신고1</option>
								<option value="신고2">신고2</option>
								<option value="신고3">신고3</option>
								<option value="신고4">신고4</option>
							</select>
						</div>

						<div className="field __textarea">
							<textarea className="textarea" placeholder="신고 내용을 적어주세요." name="description" />
						</div>
					</div>
				</Layer>
			)}

			{showNavigator && (
				<div className="search-navigator">
					<span>{currentIndex + 1} / {searchResults.length}</span>
					<button type="button" onClick={goToPrevNavigator}>▲</button>
					<button type="button" onClick={goToNextNavigator}>▼</button>
					<button type="button" onClick={closeNavigator}>닫기</button>
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

			{showVideo && 
				<Video onClose={() => setShowVideo(false)} />
			}
		</>
	);
}

export default Chat;
