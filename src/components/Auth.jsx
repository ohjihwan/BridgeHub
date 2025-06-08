/**
 * 인증 관련 메인 컴포넌트
 * 로그인과 회원가입 화면을 전환하는 컨테이너 컴포넌트입니다.
 */
import { useState } from 'react';
import Login from './login';
import SignUp from './signup';
import '@scss/components/auth.scss';

function Auth() {
	const [isLoginView, setIsLoginView] = useState(true);

	return (
		<div className="auth">
			<div className={`auth__container ${isLoginView ? 'auth__container--login' : 'auth__container--signup'}`}>
				<div className="auth__forms-wrapper">
					<Login onSwitchToSignUp={() => setIsLoginView(false)} />
					<SignUp onSwitchToLogin={() => setIsLoginView(true)} />
				</div>
			</div>
		</div>
	);
}

export default Auth; 