import { Link, useLocation } from 'react-router-dom';

function NavIcon({ type, active }) {
  const color = active ? '#4F46E5' : '#94A3B8';

  const icons = {
    home: <path d="M4 11 12 4l8 7v8.5a.5.5 0 0 1-.5.5H15v-6H9v6H4.5a.5.5 0 0 1-.5-.5V11Z" />,
    groups: (
      <>
        <circle cx="8.5" cy="9" r="3" />
        <circle cx="16.5" cy="9.5" r="2.5" />
        <path d="M3.5 20c.8-3.2 2.7-5 5-5s4.2 1.8 5 5" />
        <path d="M13.5 17c.8-1.3 1.9-2 3.2-2 1.8 0 3.2 1.4 3.8 4" />
      </>
    ),
    add: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
    debts: (
      <>
        <path d="M7 7h10l-3-3" />
        <path d="M17 17H7l3 3" />
      </>
    ),
    profile: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c1-4 3.3-6 7-6s6 2 7 6" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icons[type]}
    </svg>
  );
}

const navItems = [
  { id: 'home', label: 'Home', path: '/dashboard' },
  { id: 'groups', label: 'Groups', path: '/groups' },
  { id: 'add', label: 'Add', path: '/groups' },
  { id: 'debts', label: 'Debts', path: '/debts' },
  { id: 'profile', label: 'Profile', path: '/profile' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-3 left-1/2 z-50 w-[calc(100%-28px)] max-w-[402px] -translate-x-1/2 rounded-[24px] border border-white/80 bg-white/85 shadow-[0_8px_30px_rgba(15,23,42,0.05)] backdrop-blur-2xl">
      <div className="flex h-[58px] items-center justify-around px-2">
        {navItems.map((item) => {
          const active = location.pathname === item.path && item.id !== 'add';

          return (
            <Link
              key={item.id}
              to={item.path}
              className="flex h-full flex-1 flex-col items-center justify-center gap-1"
            >
              <NavIcon type={item.id} active={active || item.id === 'add'} />
              <span
                className={`text-[10px] font-semibold leading-none ${
                  active ? 'text-[#4F46E5]' : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
