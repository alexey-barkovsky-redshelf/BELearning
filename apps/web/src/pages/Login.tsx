import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useTranslation } from '../context/LocaleContext';
import { useUser } from '../context/UserContext';

export function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('return') ?? '/profile';
  const { setSession } = useUser();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [emailValue, setEmailValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [remoteError, setRemoteError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const resetValidation = () => {
    setSubmitAttempted(false);
    setTouched(false);
    setRemoteError(null);
  };

  const trimmedEmail = emailValue.trim();
  const errorEmailRequired = trimmedEmail.length === 0;
  const errorPasswordRequired = passwordValue.length === 0;
  const showEmailError = (touched || submitAttempted) && errorEmailRequired;
  const showPasswordError = (touched || submitAttempted) && errorPasswordRequired;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setTouched(true);
    setRemoteError(null);
    if (errorEmailRequired || errorPasswordRequired) {
      return;
    }
    setSubmitting(true);
    const body = { email: trimmedEmail, password: passwordValue };
    const call = mode === 'signin' ? api.login(body) : api.register(body);
    call
      .then((res) => {
        setSession({
          token: res.token,
          userId: res.user.id,
          email: res.user.email,
          role: res.user.role,
        });
        navigate(returnTo);
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : t('login.errorGeneric');
        setRemoteError(msg);
      })
      .finally(() => {
        setSubmitting(false);
      });
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
          {mode === 'signup' ? <p className="login-hint">{t('login.signUpHint')}</p> : null}
          <p className="login-hint login-demo-hint">{t('login.demoHint')}</p>
          <div className="form-field">
            <label htmlFor="login-email">{t('login.emailLabel')}</label>
            <input
              id="login-email"
              type="email"
              value={emailValue}
              onChange={(e) => {
                setEmailValue(e.target.value);
                setTouched(true);
              }}
              onBlur={() => {
                setTouched(true);
              }}
              placeholder={t('login.emailPlaceholder')}
              autoComplete="email"
              className={showEmailError ? 'input-error' : ''}
              aria-invalid={showEmailError}
              aria-describedby={showEmailError ? 'login-email-error' : undefined}
            />
            {showEmailError ? (
              <p id="login-email-error" className="form-field-error" role="alert">
                {t('login.errorEmailRequired')}
              </p>
            ) : null}
          </div>
          <div className="form-field">
            <label htmlFor="login-password">{t('login.passwordLabel')}</label>
            <input
              id="login-password"
              type="password"
              value={passwordValue}
              onChange={(e) => {
                setPasswordValue(e.target.value);
                setTouched(true);
              }}
              onBlur={() => {
                setTouched(true);
              }}
              placeholder={t('login.passwordPlaceholder')}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              className={showPasswordError ? 'input-error' : ''}
              aria-invalid={showPasswordError}
              aria-describedby={showPasswordError ? 'login-password-error' : undefined}
            />
            {showPasswordError ? (
              <p id="login-password-error" className="form-field-error" role="alert">
                {t('login.errorPasswordRequired')}
              </p>
            ) : null}
          </div>
          {remoteError ? (
            <p className="form-field-error" role="alert">
              {remoteError}
            </p>
          ) : null}
          <button type="submit" className="button" disabled={submitting}>
            {submitting
              ? t('login.submitting')
              : mode === 'signin'
                ? t('login.submit')
                : t('login.submitSignUp')}
          </button>
        </form>

        <p className="login-footer">
          <Link to="/">{t('nav.home')}</Link>
        </p>
      </div>
    </div>
  );
}
