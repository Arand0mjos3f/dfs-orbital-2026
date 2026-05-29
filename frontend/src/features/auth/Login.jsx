import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

const mockUsers = [
  {
    id: '16ab9e31-56f1-4afc-8d2f-09f45dfd57da',
    username: 'Sixian',
    email: 'sixian@example.com',
    password: 'password123',
    avatarUrl: '',
  },
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, setAuth } = useAuthStore();

  const [email, setEmail] = useState('sixian@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    const user = mockUsers.find(
      (mockUser) => mockUser.email === email.trim() && mockUser.password === password
    );

    if (!user) {
      setError('Invalid email or password');
      return;
    }

    setAuth(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
      'mock-token'
    );

    navigate(from, { replace: true });
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-200 px-4 py-4">
      <div className="flex h-[min(852px,calc(100dvh-32px))] w-full max-w-[393px] items-center justify-center rounded-[44px] border border-white/80 bg-[#F8FAFC] px-5 shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
        <div className="w-full rounded-[24px] bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
          <div className="mb-8">
            <p className="text-sm font-semibold text-slate-400">Welcome to</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
              O(n) Debtor
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-400">
              Sign in to continue your expense-sharing workflow.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className="w-full rounded-2xl border border-slate-100 bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#4F46E5]"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full rounded-2xl border border-slate-100 bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#4F46E5]"
                required
              />
            </div>

            {error && (
              <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-[#EF4444]">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-2xl bg-[#4F46E5] px-4 py-3 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(79,70,229,0.25)]"
            >
              Sign In
            </button>
          </form>

          <p className="mt-6 text-center text-xs font-semibold text-slate-400">
            Demo account is prefilled for Milestone 1 testing.
          </p>
        </div>
      </div>
    </div>
  );
}
