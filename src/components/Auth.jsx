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