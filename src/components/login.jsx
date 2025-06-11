import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ onSwitchToSignUp }) {
	const [userId, setUserId] = useState('');
	const [userPw, setUserPw] = useState('');
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		console.log('로그인 시도:', userId, userPw);
		navigate('/main');
	};

	function texttext() {
		console.log('네엡!');
	}

	return (
		<div className="login">
			<div className="login__container">

				<h1 className='animation-logo' aria-label="Bridge Hub">
					<div className="animation-logo__imgmotion">
						<div className="animation-logo__wave">
							<i className="animation-logo__wave1"></i>
							<i className="animation-logo__wave2"></i>
						</div>
					</div>
				</h1>

				<form className="login__area" onSubmit={handleSubmit}>
					<div className="login__forms">
						<div className="field">
							<input className="text" type="text" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="이메일를 입력하세요"/>
						</div>
						<div className="field">
							<input className="text" type="password" value={userPw} onChange={(e) => setUserPw(e.target.value)} placeholder="비밀번호를 입력하세요"/>
						</div>
					</div>
					
					<div className="login__options">
						<div className="find-buttons">
							<button type="button" className='fund-button' onClick={() => customAlert('테스트 알림!')}>아이디 찾기</button>
							<i className='slash'>/</i>
							<button type="button" className='fund-button'onClick={() => customAlert('정말 비밀번호를 찾으시겠습니까?', texttext)}>비밀번호 찾기</button>
						</div>
						<div className="login__checkbox">
							<input type="checkbox" id="remember" className='hide'/>
							<label htmlFor="remember">아이디 기억하기</label>
						</div>
					</div>

					<div className="login__buttons">
						<button type="submit" className="login__button">로그인</button>
						<button type="button" className="login__button login__button--signup" onClick={onSwitchToSignUp}>회원가입</button>
					</div>					
				</form>
			</div>
		</div>
	);
}

export default Login; 