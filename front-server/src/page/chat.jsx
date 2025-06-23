import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '@common/Header';
import Layer from '@common/Layer';
import Roulette from '@components/chat/Roulette';
import ResultModal from '@components/chat/ResultModal';
import TodoList from '@components/chat/TodoListDeployment';

function Chat() {
	const location = useLocation();
	const studyInfo = location.state;

	const [message, setMessage] = useState('');
	const [messages, setMessages] = useState([]);
	const [isTyping, setIsTyping] = useState(false);
	const textareaRef = useRef(null);
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

		const { ampm, timeStr } = getFormattedTime();
		setMessages(prev => [
			...prev,
			{ type: 'me', text: message, time: timeStr, ampm }
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

	// 첫 입장 메시지
	useEffect(() => {
		addSystemMessage('${user}님이 ${action}하셨습니다.', { user: '지환', action: '입장' });
	}, []);

	// 스크롤 하단
	useEffect(() => {
		if (!messages.length) return;

		const lastMsg = messages[messages.length - 1];
		if (lastMsg.type === 'me' && chatEndRef.current) {
			chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, [messages]);


	/* 소캣테스트용 */
	const testUsers = ['김사과', '반하나', '오렌지', '이메론', '채애리'];

	return (
		<>
			<Header showSearch={false} title={studyInfo?.title || '채팅방'} />
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
							<div key={i} className="user-say">
								<div className="user-say__profile"></div>
								<div className="user-say__text">
									{msg.text}
								</div>
								<time dateTime={msg.time} className="user-say__time">
									{msg.ampm} <span>{msg.time}</span>
								</time>
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

			<Layer isOpen={showTodoSetting} onClose={() => setShowTodoSetting(false)} header="목표 설정">
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
				<div className="todo-setting__submits">
					<button type="button" className="todo-setting__submit" onClick={handleTodoConfirm}>목표 전달</button>
				</div>
			</Layer>
			
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
		</>
	);
}

export default Chat;
