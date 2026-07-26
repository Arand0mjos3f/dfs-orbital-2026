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
  {
    id: 'facda849-579e-48d6-a589-b160f0533bf5',
    username: 'Jingyi',
    email: 'jingyi.demo@example.com',
    password: 'password123',
    avatarUrl: '',
  },
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, setAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    const user = mockUsers.find(
      (mockUser) =>
        mockUser.email === email.trim() && mockUser.password === password
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
    <div className="flex min-h-dvh items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-[393px] rounded-2xl border border-[#D8CAFF] bg-white p-6">
        <div className="mb-8 text-center">
          <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-extrabold text-indigo-500">
            Split fairly, stay friendly ✦
          </span>
          <h1 className="mt-4 text-3xl font-extrabold text-gray-800">
            DFS Orbital
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Sign in to manage your groups.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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

            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError('');
              }}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-800 outline-none focus:border-gray-400 focus:bg-white"
              required
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-500">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-[#6D4AEF] px-4 py-3 text-sm font-bold text-white hover:bg-[#5938D6]"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
