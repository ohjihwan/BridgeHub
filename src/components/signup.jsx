/**
 * 회원가입 컴포넌트
 * 사용자 회원가입을 처리하는 컴포넌트입니다.
 * 2단계 회원가입 프로세스를 구현했습니다.
 * 
 * @param {function} onSwitchToLogin - 로그인 화면으로 전환하는 콜백 함수
 */
import { useState } from 'react';
import '@scss/components/auth.scss';

function SignUp({ onSwitchToLogin }) {
	const [step, setStep] = useState(1);
	const [isVerifying, setIsVerifying] = useState(false);
	const [verificationCode, setVerificationCode] = useState('');
	const [verificationToken, setVerificationToken] = useState('');
	const [error, setError] = useState('');
	const [formData, setFormData] = useState({
		// 1depth - 필수값
		name: '',
		email: '',
		password: '',
		passwordConfirm: '',
		nickname: '',
		
		// 2depth - 선택값
		department: '',
		education: '지역무관',
		timeZone: '',
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
	};

	const handleSendVerification = async (e) => {
		e.preventDefault();
		setError('');

		// 이메일 유효성 검사
		if (!formData.email) {
			setError('이메일을 입력해주세요.');
			return;
		}

		// 비밀번호 유효성 검사
		if (formData.password.length < 8) {
			setError('비밀번호는 8자 이상이어야 합니다.');
			return;
		}
		if (formData.password !== formData.passwordConfirm) {
			setError('비밀번호가 일치하지 않습니다.');
			return;
		}

		try {
			const response = await fetch('http://localhost:3001/api/email/send-verification', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				mode: 'cors',
				body: JSON.stringify({ email: formData.email }),
			});

			const data = await response.json();

			if (response.ok) {
				setVerificationToken(data.token);
				setIsVerifying(true);
			} else {
				setError(data.message || '인증 코드 전송에 실패했습니다.');
			}
		} catch (err) {
			setError('서버 오류가 발생했습니다.');
		}
	};

	const handleVerifyCode = async (e) => {
		e.preventDefault();
		setError('');

		try {
			const response = await fetch('http://localhost:3001/api/email/verify-email', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				mode: 'cors',
				body: JSON.stringify({
					email: formData.email,
					code: verificationCode,
					token: verificationToken
				}),
			});

			const data = await response.json();

			if (response.ok) {
				// 인증 성공 후 회원가입 처리
				handleSignup(e);
			} else {
				setError(data.message || '인증 코드 확인에 실패했습니다.');
			}
		} catch (err) {
			setError('서버 오류가 발생했습니다.');
		}
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (step === 1) {
			handleSendVerification(e);
		} else {
			// 최종 제출
			console.log('회원가입 데이터:', formData);
		}
	};

	if (isVerifying) {
		return (
			<div className="signup">
				<div className="signup__container">
					<h2 className="signup__title">이메일 인증</h2>
					<form className="signup__area" onSubmit={handleVerifyCode}>
						<div className="signup__forms">
							<p className="signup__subtitle">
								{formData.email}로 전송된 인증 코드를 입력해주세요.
							</p>
							<input
								className="signup__input"
								type="text"
								value={verificationCode}
								onChange={(e) => setVerificationCode(e.target.value)}
								placeholder="인증 코드 6자리"
								maxLength={6}
								required
							/>
						</div>
						{error && <p className="signup__error">{error}</p>}
						<div className="signup__buttons">
							<button type="submit" className="signup__button">인증하기</button>
							<button
								type="button"
								className="signup__button signup__button--text"
								onClick={() => setIsVerifying(false)}
							>
								이전으로
							</button>
						</div>
					</form>
				</div>
			</div>
		);
	}

	return (
		<div className="signup">
			<div className="signup__container">
				<h2 className="signup__title">회원가입 {step}/2</h2>
				<form className="signup__area" onSubmit={handleSubmit}>
					{step === 1 ? (
						<div className="signup__forms">
							<input className="signup__input" type="text" name="name" value={formData.name} onChange={handleChange} placeholder="이름을 입력하세요" required/>
							<input className="signup__input" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="이메일을 입력하세요" required/>
							<input className="signup__input" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="비밀번호를 입력하세요" required/>
							<input className="signup__input" type="password" name="passwordConfirm" value={formData.passwordConfirm} onChange={handleChange} placeholder="비밀번호를 다시 입력하세요" required/>
							<input className="signup__input" type="text" name="nickname" value={formData.nickname} onChange={handleChange} placeholder="닉네임을 입력하세요" required/>
						</div>
					) : (
						<div className="signup__forms">
							<div className="half-form">
								<select className="signup__input" name="department" value={formData.department} onChange={handleChange}>
									<option value="">학력</option>
									<option value="고졸">고졸</option>
									<option value="대학교">대학교</option>
									<option value="대학원">대학원</option>
								</select>
								<select className="signup__input" name="department" value={formData.department} onChange={handleChange}>
									<option value="">학과/학부 선택</option>
									<option value="컴퓨터공학과">컴퓨터공학과</option>
									<option value="소프트웨어학과">소프트웨어학과</option>
									<option value="정보통신공학과">정보통신공학과</option>
								</select>
							</div>
							<div className="half-form">
								<select className="signup__input" name="education" value={formData.education} onChange={handleChange}>
									<option value="지역무관">지역무관</option>
									<option value="서울">서울</option>
									<option value="대구">대구</option>
									<option value="부산">부산</option>
								</select>
								<select className="signup__input" name="education" value={formData.education} onChange={handleChange}>
									<option value="강남구">강남구</option>
									<option value="서초구">서초구</option>
									<option value="종로구">종로구</option>
								</select>
							</div>
							<select className="signup__input" name="timeZone" value={formData.timeZone} onChange={handleChange}>
								<option value="">선호 시간대 선택</option>
								<option value="오전">오전 (06:00-12:00)</option>
								<option value="오후">오후 (12:00-18:00)</option>
								<option value="저녁">저녁 (18:00-24:00)</option>
							</select>
						</div>
					)}
					{error && <p className="signup__error">{error}</p>}
					<div className="signup__buttons">
						{step === 1 ? (
							<>
								<button type="submit" className="signup__button">이메일 인증하기</button>
								<button type="button" className="signup__button signup__button--text" onClick={onSwitchToLogin}>로그인으로 돌아가기</button>
							</>
						) : (
							<>
								<button type="submit" className="signup__button">가입완료</button>
								<button type="button" className="signup__button signup__button--text" onClick={() => setStep(1)}>이전으로</button>
							</>
						)}
					</div>
				</form>
			</div>
		</div>
	);
}

export default SignUp; 