import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from '../context/LocaleContext';
import { useUser } from '../context/UserContext';

export function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('return') ?? '/profile';
  const { setUserId } = useUser();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [userIdValue, setUserIdValue] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const resetValidation = () => {
    setSubmitAttempted(false);
    setTouched(false);
  };

  const trimmed = userIdValue.trim();
  const errorRequired = trimmed.length === 0;
  const showError = (touched || submitAttempted) && errorRequired;
  const errorMessage = errorRequired ? t('login.errorRequired') : '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setTouched(true);
    if (errorRequired) {
      return;
    }
    setUserId(trimmed);
    navigate(returnTo);
  };

  return (
    <div className="page">
      <div className="login-container">
        <h1>{t('login.title')}</h1>

        <div className="login-tabs">
          <button
            type="button"
            className={`login-tab ${mode === 'signin' ? 'active' : ''}`}
            onClick={() => {
              setMode('signin');
              resetValidation();
            }}
          >
            {t('login.signIn')}
          </button>
          <button
            type="button"
            className={`login-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => {
              setMode('signup');
              resetValidation();
            }}
          >
            {t('login.signUp')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {mode === 'signup' ? (
            <p className="login-hint">{t('login.signUpHint')}</p>
          ) : null}
          <div className="form-field">
            <label htmlFor="login-user-id">{t('login.userIdLabel')}</label>
            <input
              id="login-user-id"
              type="text"
              value={userIdValue}
              onChange={(e) => {
                setUserIdValue(e.target.value);
                setTouched(true);
              }}
              onBlur={() => {
                setTouched(true);
              }}
              placeholder={t('login.userIdPlaceholder')}
              autoComplete="username"
              className={showError ? 'input-error' : ''}
              aria-invalid={showError}
              aria-describedby={showError ? 'login-user-id-error' : undefined}
            />
            {showError ? (
              <p id="login-user-id-error" className="form-field-error" role="alert">
                {errorMessage}
              </p>
            ) : null}
          </div>
          <button type="submit" className="button">
            {mode === 'signin' ? t('login.submit') : t('login.submitSignUp')}
          </button>
        </form>

        <p className="login-footer">
          <Link to="/">{t('nav.home')}</Link>
        </p>
      </div>
    </div>
  );
}
