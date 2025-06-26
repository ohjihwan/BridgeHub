import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authClient } from '@/assets/js/common-ui';

const API_BASE_URL = 'http://localhost:7100/api/auth';

function Login({ onSwitchToSignUp }) {
	const [userId, setUserId] = useState('');
	const [userPw, setUserPw] = useState('');
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		
		/* try {
			const res = await authClient.post(`/login`, {
				userid: userId,
				password: userPw
			});

			if (res.data.success) {
				const token = res.data.data.token;
				localStorage.setItem('authorization', token);
				await window.customAlert('로그인 성공').then(() => {
					navigate('/home');
				});
			} else {
				await window.customAlert(res.data.message || '로그인에 실패했습니다.');
			}
		} catch (err) {
			await window.customAlert(err.response?.data?.message || '로그인 중 오류가 발생했습니다.');
		} */
		navigate('/home');
	};

	function texttext(e) {
		console.log("이렇게 실행");
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
							<button type="button" className='fund-button' onClick={() => customAlert('안녕하세요! 여긴 안내창입니다.')}>아이디 찾기</button>
							<i className='slash'>/</i>
							<button type="button" className='fund-button' onClick={() => customConfirm('정말 비밀번호를 찾으시겠습니까?', texttext)}>비밀번호 찾기</button>
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