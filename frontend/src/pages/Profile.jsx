import { useAuthStore } from '../store/useAuthStore';

export default function Profile() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="min-h-dvh bg-[#FFF9F4] px-5 pb-8 pt-5">
      <header className="mb-6">
        <p className="text-sm font-semibold text-slate-400">Account</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">Profile</h1>
      </header>

      <section className="rounded-[24px] border border-[#D8CAFF] bg-white p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#F6CDB8] bg-[#FFE3D3] text-2xl">
            🎓
          </div>

          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
              {user?.username || 'Justin'}
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-400">
              {user?.email || 'justin@example.com'}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="rounded-2xl bg-[#FFF9F4] px-4 py-3">
            <p className="text-xs font-bold uppercase text-slate-400">Role</p>
            <p className="mt-1 text-sm font-extrabold text-slate-900">NUS Student</p>
          </div>

          <div className="rounded-2xl bg-[#FFF9F4] px-4 py-3">
            <p className="text-xs font-bold uppercase text-slate-400">Default Currency</p>
            <p className="mt-1 text-sm font-extrabold text-slate-900">SGD</p>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="mt-6 w-full rounded-2xl bg-red-50 px-4 py-3 text-sm font-extrabold text-[#B4233C]"
        >
          Log Out
        </button>
      </section>
    </div>
  );
}
