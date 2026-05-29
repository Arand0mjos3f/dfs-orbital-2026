import { Outlet } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

export default function MainLayout() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-200 px-4 py-4">
      <div className="relative h-[min(852px,calc(100dvh-32px))] w-full max-w-[393px] overflow-hidden rounded-[44px] border border-white/80 bg-[#F8FAFC] shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
        <main className="h-full overflow-y-auto pb-28">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
