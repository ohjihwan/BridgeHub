import { useState, useEffect } from 'react';

function SignUp({ onSwitchToLogin, isActive }) {
	const [step, setStep] = useState(1);
	const [visibleIndexes, setVisibleIndexes] = useState([]);
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		passwordConfirm: '',
		nickname: '',
		department: '',
		education: '지역무관',
		timeZone: '',
	});

	useEffect(() => {
		if (!isActive) return;
		triggerStepAnimation(step);
	}, [isActive, step]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (step === 1) setStep(2);
		else console.log('회원가입 데이터:', formData);
	};

	const triggerStepAnimation = (step) => {
		const fieldCounts = { 1: 5, 2: 5 };
		const count = fieldCounts[step];
		const delayBase = 75;
		const delayOffset = 300;
		const timers = [];

		setVisibleIndexes([]);
		for (let i = 0; i < count; i++) {
			const timer = setTimeout(() => {
				setVisibleIndexes(prev => [...prev, i]);
			}, delayOffset + i * delayBase);
			timers.push(timer);
		}
	};

	const getClassName = (base, index) => {
		return `${base} ${visibleIndexes.includes(index) ? 'showAni' : ''}`;
	};

	function onConfirmss() {
		customAlert('인증되었습니다')
	}

	return (
		<div className="signup">
			<div className="signup__container">
				
				<h1 className='animation-logo' aria-label="Bridge Hub">
					<div className="animation-logo__imgmotion">
						<div className="animation-logo__wave">
							<i className="animation-logo__wave1"></i>
							<i className="animation-logo__wave2"></i>
						</div>
					</div>
				</h1>
				<form className="signup__area" onSubmit={handleSubmit}>
					{step === 1 ? (
						<div className="signup__forms">
							<div className={getClassName('field', 0)}>
								<input className="text" type="text" name="name" value={formData.name} onChange={handleChange} placeholder="이름을 입력하세요" required/>
							</div>
							<div className={getClassName('field', 1)}>
								<input className="text" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="이메일을 입력하세요" required/>
								<button type="button" className="middle-button" 
									onClick={
										async () => {
											const name = await customAlert(
												'이름을 입력해주세요',
												value => console.log('입력된 값:', value),
												{ showInput: true, placeholder: '홍길동' }
											);
											console.log('최종 반환값:', name);
										}
									}
									
								>이메일인증</button>
							</div>
							<div className={getClassName('field', 2)}>
								<input className="text" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="비밀번호를 입력하세요" required/>
							</div>
							<div className={getClassName('field', 3)}>
								<input className="text" type="password" name="passwordConfirm" value={formData.passwordConfirm} onChange={handleChange} placeholder="비밀번호를 다시 입력하세요" required/>
							</div>
							<div className={getClassName('field', 4)}>
								<input className="text" type="text" name="nickname" value={formData.nickname} onChange={handleChange} placeholder="닉네임을 입력하세요" required/>
							</div>
						</div>
					) : (
						<div className="signup__forms">
							<div className={getClassName('half-field', 0)}>
								<div className="field">
									<select className="select" name="department" value={formData.department} onChange={handleChange}>
										<option value="">학력</option>
										<option value="고졸">고졸</option>
										<option value="대학교">대학교</option>
										<option value="대학원">대학원</option>
									</select>
								</div>
								<div className="field">
									<select className="select" name="department" value={formData.department} onChange={handleChange}>
										<option value="">학과/학부 선택</option>
										<option value="컴퓨터공학과">컴퓨터공학과</option>
										<option value="소프트웨어학과">소프트웨어학과</option>
										<option value="정보통신공학과">정보통신공학과</option>
									</select>
								</div>
							</div>
							<div className={getClassName('half-field', 1)}>
								<div className="field">
									<select className="select" name="education" value={formData.education} onChange={handleChange}>
										<option value="지역무관">지역무관</option>
										<option value="서울">서울</option>
										<option value="대구">대구</option>
										<option value="부산">부산</option>
									</select>
								</div>
								<div className="field" style={{ display: formData.education === '지역무관' ? 'none' : 'block' }}>
									<select className="select" name="education" value={formData.education} onChange={handleChange}>
										<option value="강남구">강남구</option>
										<option value="서초구">서초구</option>
										<option value="종로구">종로구</option>
									</select>
								</div>
							</div>
							<div className={getClassName('field', 2)}>
								<select className="select" name="timeZone" value={formData.timeZone} onChange={handleChange}>
									<option value="">선호 시간대 선택</option>
									<option value="오전">오전 (06:00-12:00)</option>
									<option value="오후">오후 (12:00-18:00)</option>
									<option value="저녁">저녁 (18:00-24:00)</option>
								</select>
							</div>
						</div>
					)}
					<div className="signup__buttons">
						{step === 1 ? (
							<>
								<button type="submit" className="signup__button">다음 단계</button>
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
