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
	// 임무 분담
	const [showTodo, setShowTodo] = useState(false);
	const dummyTodos = [
		{ title: '할 일1', users: ['유저1', '유저2'] },
		{ title: '할 일2', users: ['유저1', '유저2'] },
		{ title: '할 일3', users: ['유저1', '유저2'] },
	];
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

	// [할 일 공유 버튼 클릭 시 실행되는 함수]
	// 더미 데이터 생성 후 메시지 추가 함수 호출
	const handleTodoShare = () => {
		const dummy = [
			{ title: '기획서 작성', users: ['김사과', '오렌지'] },
			{ title: '디자인 시안', users: ['반하나'] }
		];

		const { ampm, timeStr } = getFormattedTime();
		setMessages(prev => [
			...prev,
			{ type: 'todo', todos: dummy, time: timeStr, ampm }
		]);
	};

	// [채팅 메시지에 '할 일 목록' 추가 함수]
	// todos 배열을 기반으로 메시지 배열에 새로운 'todo' 메시지를 추가
	const addTodoMessage = (todos) => {
		const { ampm, timeStr } = getFormattedTime();
		setMessages(prev => [
			...prev,
			{ type: 'todo', todos, time: timeStr, ampm }
		]);
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
					<li><button type="button" className="msg-writing__action" onClick={() => handleTodoShare()}>할 일 공유</button></li>
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
