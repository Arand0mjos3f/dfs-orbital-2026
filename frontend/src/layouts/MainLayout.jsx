import { Outlet } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

export default function MainLayout() {
  return (
    <div className="min-h-dvh bg-[#F8FAFC]">
      <div className="mx-auto min-h-dvh w-full max-w-[430px] bg-[#F8FAFC]">
        <main className="min-h-dvh pb-28">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
