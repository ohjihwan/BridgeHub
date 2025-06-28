import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authClient } from '@/assets/js/common-ui';
import Layer from '@common/Layer';

const API_BASE_URL = 'http://localhost:7100/api/auth';

function Login({ onSwitchToSignUp }) {
	const [userId, setUserId] = useState('');
	const [userPw, setUserPw] = useState('');
	const [remember, setRemember] = useState(false);
	const [showFindId, setShowFindId] = useState(false);
	const [findName, setFindName] = useState('');
	const [findPhone, setFindPhone] = useState('');

	const navigate = useNavigate();

	useEffect(() => {
		const savedId = localStorage.getItem('rememberId');
		if (savedId) {
			setUserId(savedId);
			setRemember(true);
		}
	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const res = await authClient.post(`/login`, {
				userid: userId,
				password: userPw
			});
			if (res.data.status === 'success') {
				const token = res.data.data.token;
				localStorage.setItem('token', token);

				// 아이디 저장 여부 반영
				if (remember) {
					localStorage.setItem('rememberId', userId);
				} else {
					localStorage.removeItem('rememberId');
				}

				navigate('/home');
			} else {
				await window.customAlert('로그인에 실패했습니다.');
			}
		} catch (err) {
			await window.customAlert('로그인 중 오류가 발생했습니다.');
		}
	};

	const handleFindIdRequest = async () => {
		if (!findName.trim() || !findPhone.trim()) {
			await window.customAlert('이름과 휴대폰 번호를 입력해주세요.');
			return;
		}

		try {
			const res = await authClient.post(`/find-id`, {
				name: findName,
				phone: findPhone
			});

			if (res.data.status === 'success') {
				await window.customAlert(`회원님의 아이디는 ${res.data.data.userid} 입니다.`);
				setShowFindId(false);
			} else {
				await window.customAlert(res.data.message || '아이디를 찾을 수 없습니다.');
			}
		} catch (err) {
			await window.customAlert('아이디 찾기 중 오류가 발생했습니다.');
		}
	};

	return (
		<>
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
								<button type="button" className='fund-button' onClick={() => setShowFindId(true)}>아이디 찾기</button>
								<i className='slash'>/</i>
								<button type="button" className='fund-button' onClick={() => customConfirm('정말 비밀번호를 찾으시겠습니까?')}>비밀번호 찾기</button>
							</div>
							<div className="login__checkbox">
								<input type="checkbox" id="remember" className='hide' checked={remember} onChange={(e) => setRemember(e.target.checked)} />
								<label htmlFor="remember">아이디 기억하기</label>
							</div>
						</div>

						<div className="login__buttons">
							<button type="submit" className="login__button">로그인</button>
							<button type="button" className="login__button login__button--signup" onClick={onSwitchToSignUp}>회원가입</button>
						</div>
					</form>
				</div>
			</div>,
			{showFindId && (
				<Layer isOpen={showFindId} onClose={() => setShowFindId(false)} header="아이디 찾기" footer={
					<button className="layer__submit" onClick={handleFindIdRequest} >아이디 찾기</button>
				}>
					<div className="find-my-info">
						<div className="info-row">
							<label htmlFor='findId' className="label hide">이름</label>
							<div className="field">
								<input type="text" name="findId" id="findId" className="text" placeholder="이름을 입력하세요" value={findName} onChange={(e) => setFindName(e.target.value)} />
							</div>
						</div>
						<div className="info-row">
							<label htmlFor='findHp' className="label hide">휴대폰 번호</label>
							<div className="field">
								<input type="tel" name="findHp" id="findHp" className="text" placeholder="휴대폰 번호를 입력하세요" value={findPhone} onChange={(e) => setFindPhone(e.target.value)} />
							</div>
						</div>
					</div>
				</Layer>
			)}
		</>
	);
}

export default Login; 

