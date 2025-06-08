/**
 * 로그인 컴포넌트
 * 사용자 로그인을 처리하는 컴포넌트입니다.
 * 
 * @param {function} onSwitchToSignUp - 회원가입 화면으로 전환하는 콜백 함수
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@scss/components/auth.scss';

function Login({ onSwitchToSignUp }) {
	const [userId, setUserId] = useState('');
	const [userPw, setUserPw] = useState('');
	const navigate = useNavigate();

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log('로그인 시도:', userId, userPw);
		// 여기에 실제 로그인 로직을 추가하세요
		// 임시로 바로 메인 페이지로 이동하도록 설정
		navigate('/main');
	};

	return (
		<div className="login">
			<div className="login__container">
				<h2 className="login__title">로그인</h2>
				<form className="login__area" onSubmit={handleSubmit}>
					<div className="login__forms">
						<input className="login__input" type="text" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="아이디를 입력하세요"/>
						<input className="login__input" type="password" value={userPw} onChange={(e) => setUserPw(e.target.value)} placeholder="비밀번호를 입력하세요"/>
					</div>
					<div className="login__checkbox">
						<input type="checkbox" id="remember" />
						<label htmlFor="remember">아이디 기억하기</label>
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