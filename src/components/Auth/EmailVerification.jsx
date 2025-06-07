import { useState } from 'react';
import '@scss/auth/emailVerification.scss';

const EmailVerification = ({ email, token, onVerificationComplete }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerification = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code: verificationCode,
          token,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onVerificationComplete(true);
      } else {
        setError(data.message || '인증에 실패했습니다.');
      }
    } catch (err) {
      setError('서버 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="email-verification">
      <div className="email-verification__container">
        <h2 className="email-verification__title">이메일 인증</h2>
        <p className="email-verification__subtitle">
          {email}로 전송된 인증 코드를 입력해주세요.
        </p>
        
        <form onSubmit={handleVerification} className="email-verification__form">
          <div className="form-group">
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="인증 코드 6자리"
              maxLength={6}
              required
              className="verification-input"
            />
          </div>
          
          {error && <p className="error-message">{error}</p>}
          
          <button type="submit" className="email-verification__button" disabled={isLoading}>
            {isLoading ? '인증 중...' : '인증하기'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmailVerification; 