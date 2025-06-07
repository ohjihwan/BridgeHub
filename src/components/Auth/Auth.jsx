import { useState } from 'react';
import SignUp from './SignUp';
import EmailVerification from './EmailVerification';
import '@scss/auth/auth.scss';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [email, setEmail] = useState('');
  const [verificationToken, setVerificationToken] = useState('');

  const handleVerificationComplete = (success) => {
    if (success) {
      setIsVerifying(false);
      setIsLogin(true);
    }
  };

  if (isVerifying) {
    return (
      <EmailVerification
        email={email}
        token={verificationToken}
        onVerificationComplete={handleVerificationComplete}
      />
    );
  }

  return (
    <div className="auth">
      <div className="auth__container">
        <div className="auth__header">
          <h1 className="auth__title">BridgeHub</h1>
          <p className="auth__subtitle">
            {isLogin ? '로그인' : '회원가입'}
          </p>
        </div>

        {isLogin ? (
          <form className="auth__form">
            <div className="form-group">
              <label htmlFor="email">이메일</label>
              <input
                type="email"
                id="email"
                placeholder="이메일을 입력하세요"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">비밀번호</label>
              <input
                type="password"
                id="password"
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>
            <button type="submit" className="auth__button">
              로그인
            </button>
          </form>
        ) : (
          <SignUp
            onVerificationStart={(email, token) => {
              setEmail(email);
              setVerificationToken(token);
              setIsVerifying(true);
            }}
          />
        )}

        <div className="auth__footer">
          <button
            className="auth__switch"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? '회원가입' : '로그인'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth; 