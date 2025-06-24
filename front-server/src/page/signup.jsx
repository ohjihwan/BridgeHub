import axios from 'axios';
import apiConfig, { API_ENDPOINTS } from '@dev/config/api';
import { useState, useEffect } from 'react';

const apiClient = axios.create(apiConfig);

function SignUp({ onSwitchToLogin, isActive }) {
	const [step, setStep] = useState(1);
	const [visibleIndexes, setVisibleIndexes] = useState([]);
	const [gender, setGender] = useState('man');
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		passwordConfirm: '',
		nickname: '',
		department1: '',
		department2: '',
		education1: '지역무관',
		education2: '지역무관',
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

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (step === 1) {
			setStep(2);
			return;
		}

		if (!formData.name || !formData.email || !formData.password || !formData.nickname) {
			window.customAlert('필수 정보를 모두 입력하세요.');
			return;
		}

		if (formData.password !== formData.passwordConfirm) {
			window.customAlert('비밀번호가 일치하지 않습니다.');
			return;
		}
		
		try {
			const requestData = {
				username: formData.email,
				password: formData.password,
				email: formData.email,
				phone: formData.hp,
				nickname: formData.nickname,
				name: formData.name,
				education: formData.department1,
				department: formData.department2,
				gender: gender,
				region: formData.education1,
				district: formData.education2 === '지역무관' ? '' : formData.education2,
				time: formData.timeZone
			};

			const response = await apiClient.post(API_ENDPOINTS.REGISTER, requestData);

			if (response.data.success) {
				window.customAlert('회원가입이 완료되었습니다.');
				onSwitchToLogin();
			}
		} catch (err) {
			window.customAlert(err.response?.data?.message || '회원가입에 실패했습니다.');
		}

	};

	const triggerStepAnimation = (step) => {
		const fieldCounts = { 1: 6, 2: 5 };
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
							<div className={getClassName('half-field', 0)}>
								<div className="field">
									<input type="text" className="text" name="name" value={formData.name || ''} onChange={handleChange} placeholder="이름을 입력하세요" required/>
								</div>
								<div className="field">
									<input type="text" className="text" name="nickname" value={formData.nickname || ''} onChange={handleChange} placeholder="별명을 입력하세요" required/>
								</div>
							</div>
							<div className={getClassName('field', 1)}>
								<input type="email" className="text" name="email" value={formData.email || ''} onChange={handleChange} placeholder="이메일을 입력하세요" required/>
								<button type="button" className="middle-button" 
									onClick={async () => {
										const value = await customPrompt('인증코드를 입력해주세요', 'XXXXXX');
										if (value !== null) {
											console.log('사용자가 입력한 값:', value);
										}
									}}
								>이메일인증</button>
							</div>
							<div className={getClassName('field', 2)}>
								<input type="password" className="text" name="password" value={formData.password || ''} onChange={handleChange} placeholder="비밀번호를 입력하세요" required/>
							</div>
							<div className={getClassName('field', 3)}>
								<input type="password" className="text" name="passwordConfirm" value={formData.passwordConfirm || ''} onChange={handleChange} placeholder="비밀번호를 다시 입력하세요" required/>
							</div>
							<div className={getClassName('radios', 4)}>
								<div className="radio">
									<label htmlFor="man">남자</label>
									<input type="radio" name="gender" id="man" checked={gender === 'man'} onChange={() => setGender('man')}/>
								</div>
								<div className="radio">
									<label htmlFor="woman">여자</label>
									<input type="radio" name="gender" id="woman" checked={gender === 'woman'} onChange={() => setGender('woman')}/>
								</div>
								<span className={`switcher ${gender}`}></span>
							</div>
							<div className={getClassName('field', 5)}>
								<input type="tel" className="text" name="hp" value={formData.hp || ''} onChange={handleChange} placeholder="휴대폰번호를 입력하세요" required/>
							</div>
						</div>
					) : (
						<div className="signup__forms">
							<div className={getClassName('half-field', 0)}>
								<div className="field">
									<select className="select" name="department1" value={formData.department1} onChange={handleChange}>
										<option value="">학력</option>
										<option value="고졸">고졸</option>
										<option value="대학교">대학교</option>
										<option value="대학원">대학원</option>
									</select>
								</div>
								<div className="field">
									<select className="select" name="department2" value={formData.department2} onChange={handleChange}>
										<option value="">학과/학부 선택</option>
										<option value="컴퓨터공학과">컴퓨터공학과</option>
										<option value="소프트웨어학과">소프트웨어학과</option>
										<option value="정보통신공학과">정보통신공학과</option>
									</select>
								</div>
							</div>
							<div className={getClassName('half-field', 1)}>
								<div className="field">
									<select className="select" name="education1" value={formData.education1} onChange={handleChange}>
										<option value="지역무관">지역무관</option>
										<option value="서울">서울</option>
										<option value="대구">대구</option>
										<option value="부산">부산</option>
									</select>
								</div>
								<div className="field" style={{ display: formData.education1 === '지역무관' ? 'none' : 'block' }}>
									<select className="select" name="education2" value={formData.education2} onChange={handleChange}>
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
