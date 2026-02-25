
import { Bell, Settings, User, LogOut } from 'lucide-react';
import { useAuth } from '../../../lib/AuthContext';
import { useUserStore } from '../../../app/zustand/useUserStore';

const TradingHeader = ({ className }: { className?: string }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const logoutStore = useUserStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    logoutStore();
    window.location.href = '/login';
  };

  return (
    <header className="bg-[#141920] border-b border-[#2a3441] h-14 flex items-center px-5">
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[#ff6b00] text-xl font-bold tracking-tight">exness</span>
            <span className="bg-[#1a1f26] text-[#b0b8c1] text-xs px-2 py-0.5 rounded border border-[#2a3441] font-medium">
              {isAuthenticated ? 'LIVE' : 'DEMO'}
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            <button className="text-white px-3 py-1.5 text-sm font-medium rounded hover:bg-[#1a1f26] transition-colors">
              Trading
            </button>
            <button className="text-[#6b7280] px-3 py-1.5 text-sm rounded hover:text-white hover:bg-[#1a1f26] transition-colors">
              Analytics
            </button>
            <button className="text-[#6b7280] px-3 py-1.5 text-sm rounded hover:text-white hover:bg-[#1a1f26] transition-colors">
              Portfolio
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block mr-2">
            <div className="text-[#6b7280] text-xs">Balance</div>
            <div className="text-white text-sm font-semibold tabular-nums">
              {user?.balance != null ? `$${Number(user.balance).toLocaleString()}` : '$10,000.00'}
            </div>
          </div>
          <button className="p-2 text-[#6b7280] rounded hover:text-white hover:bg-[#1a1f26] transition-colors" aria-label="Notifications">
            <Bell size={18} />
          </button>
          <button className="p-2 text-[#6b7280] rounded hover:text-white hover:bg-[#1a1f26] transition-colors" aria-label="Settings">
            <Settings size={18} />
          </button>
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-[#2a3441] bg-[#1a1f26]">
                <div className="w-7 h-7 bg-[#ff6b00] rounded flex items-center justify-center flex-shrink-0">
                  <User size={14} className="text-white" />
                </div>
                <span className="text-white text-sm font-medium max-w-[100px] truncate">{user?.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-[#6b7280] rounded hover:text-red-400 hover:bg-[#1a1f26] transition-colors"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <a href="/login" className="text-[#b0b8c1] hover:text-white text-sm font-medium px-3 py-2 transition-colors">
                Sign In
              </a>
              <a href="/signup" className="bg-[#ff6b00] hover:bg-[#e55a00] text-white text-sm font-medium px-4 py-2 rounded transition-colors">
                Sign Up
              </a>
            </div>
          )}
          <button className="bg-[#ff6b00] hover:bg-[#e55a00] text-white text-sm font-medium px-4 py-2 rounded transition-colors ml-1">
            Deposit
          </button>
        </div>
      </div>
    </header>
  );
};

export default TradingHeader;