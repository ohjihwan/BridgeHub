import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './common/Header';

function Chat() {
	const location = useLocation();
	const studyInfo = location.state;
	const [message, setMessage] = useState('');
	const textareaRef = useRef(null);
	const handleChange = (e) => {
		const value = e.target.value;
		setMessage(value);
		const textarea = textareaRef.current;
		if (textarea) {
			textarea.style.height = 'auto';
			textarea.style.height = textarea.scrollHeight + 'px';
		}
	};


	return (
		<>
			<Header showSearch={false} title={studyInfo?.title || '채팅방'} />
			<div className={"chatroom-history"}>
				
			</div>

			<div className="msg-writing">
				<ul class="msg-writing__actions">
					<li>
						<button type="button" class="msg-writing__action">퀵메뉴</button>
					</li>
					<li>
						<button type="button" class="msg-writing__action">자주하는질문</button>
					</li>
				</ul>
				<div className="msg-writing__inputs">
					<div className="msg-writing__field">
						<textarea className="msg-writing__input" placeholder="메세지 입력!" value={message} onChange={handleChange} ref={textareaRef} rows={1} />
					</div>
					<button type="button" className="msg-writing__send" aria-label="입력 전송"/>
				</div>
			</div>
		</>
	);
}

export default Chat;
