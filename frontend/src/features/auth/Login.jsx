import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../../api/users';
import { useAuthStore } from '../../store/useAuthStore';

const getRequestError = (requestError, fallbackMessage) => {
  const detail = requestError.response?.data?.detail;

  if (typeof detail === 'string') {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail.map((entry) => entry.msg).join(' ');
  }

  return fallbackMessage;
};

function PasswordVisibilityIcon({ isVisible }) {
  if (isVisible) {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M3 3l18 18" strokeLinecap="round" />
        <path
          d="M10.6 10.7a2 2 0 002.7 2.7M9.9 5.2A10.8 10.8 0 0112 5c5.4 0 9 7 9 7a16.8 16.8 0 01-2.4 3.3M6.6 6.6C4.3 8.2 3 12 3 12s3.6 7 9 7a10.7 10.7 0 004.1-.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="M3 12s3.6-7 9-7 9 7 9 7-3.6 7-9 7-9-7-9-7z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, setAuth } = useAuthStore();

  const [mode, setMode] = useState('signIn');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (mode === 'signUp' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response =
        mode === 'signUp'
          ? await registerUser({
              username: username.trim(),
              email: email.trim(),
              password,
              avatar_url: '',
            })
          : await loginUser({
              email: email.trim(),
              password,
            });

      const user = response.data;

      setAuth(
        {
          id: user.id,
          username: user.username,
          email: user.email,
          avatarUrl: user.avatar_url || '',
        },
        null
      );

      navigate(from, { replace: true });
    } catch (requestError) {
      setError(
        getRequestError(
          requestError,
          mode === 'signUp'
            ? 'Unable to create your account.'
            : 'Unable to sign in.'
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-[393px] rounded-2xl border border-[#D8CAFF] bg-white p-6">
        <div className="mb-8 text-center">
          <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-extrabold text-indigo-500">
            Split fairly, stay friendly ✦
          </span>
          <h1 className="mt-4 text-3xl font-extrabold text-gray-800">
            O(n) Debtor
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            {mode === 'signUp'
              ? 'Create an account to start splitting fairly.'
              : 'Sign in to manage your groups.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signUp' && (
            <div>
              <label
                htmlFor="signup-username"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Name
              </label>

              <input
                id="signup-username"
                type="text"
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);
                  setError('');
                }}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-800 outline-none focus:border-gray-400 focus:bg-white"
                autoComplete="name"
                minLength={1}
                maxLength={100}
                required
              />
            </div>
          )}

          <div>
            <label
              htmlFor="login-email"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Email
            </label>

            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError('');
              }}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-800 outline-none focus:border-gray-400 focus:bg-white"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError('');
                }}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-3 pr-12 text-sm text-gray-800 outline-none focus:border-gray-400 focus:bg-white"
                autoComplete={
                  mode === 'signUp' ? 'new-password' : 'current-password'
                }
                minLength={mode === 'signUp' ? 8 : 1}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((currentValue) => !currentValue)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg border border-transparent text-[#8F879A] hover:border-[#D8CAFF] hover:bg-[#F7F3FF] hover:text-[#5D48B8] focus:border-[#D8CAFF] focus:outline-none"
              >
                <PasswordVisibilityIcon isVisible={showPassword} />
              </button>
            </div>
          </div>

          {mode === 'signUp' && (
            <div>
              <label
                htmlFor="signup-confirm-password"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Confirm password
              </label>

              <div className="relative">
                <input
                  id="signup-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setError('');
                  }}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-3 pr-12 text-sm text-gray-800 outline-none focus:border-gray-400 focus:bg-white"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((currentValue) => !currentValue)
                  }
                  aria-label={
                    showConfirmPassword
                      ? 'Hide confirmed password'
                      : 'Show confirmed password'
                  }
                  aria-pressed={showConfirmPassword}
                  className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg border border-transparent text-[#8F879A] hover:border-[#D8CAFF] hover:bg-[#F7F3FF] hover:text-[#5D48B8] focus:border-[#D8CAFF] focus:outline-none"
                >
                  <PasswordVisibilityIcon isVisible={showConfirmPassword} />
                </button>
              </div>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-[#F3BDC7] bg-[#FFF1F3] px-3 py-2 text-sm font-medium text-[#B94B61]"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl border border-[#6D4AEF] bg-[#6D4AEF] px-4 py-3 text-sm font-bold text-white hover:bg-[#5938D6] disabled:cursor-not-allowed disabled:border-[#C8BCEA] disabled:bg-[#C8BCEA]"
          >
            {isSubmitting
              ? mode === 'signUp'
                ? 'Creating account...'
                : 'Signing in...'
              : mode === 'signUp'
                ? 'Sign Up'
                : 'Sign In'}
          </button>

          <div className="flex items-center gap-3 pt-1">
            <div className="h-px flex-1 bg-[#E8E0F2]" />
            <span className="text-xs font-semibold text-gray-400">or</span>
            <div className="h-px flex-1 bg-[#E8E0F2]" />
          </div>

          <button
            type="button"
            onClick={() =>
              switchMode(mode === 'signUp' ? 'signIn' : 'signUp')
            }
            className="w-full rounded-xl border border-[#D8CAFF] bg-white px-4 py-3 text-sm font-bold text-[#5D48B8] hover:bg-[#F7F3FF]"
          >
            {mode === 'signUp'
              ? 'Already have an account? Sign In'
              : 'New here? Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
}
