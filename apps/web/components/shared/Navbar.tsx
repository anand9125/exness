"use client";

import React from 'react'
import Link from 'next/link'
import { TrendingUp, User, LogOut } from 'lucide-react'
import { useAuth } from '../../lib/AuthContext'
import { useUserStore } from '../../app/zustand/useUserStore'

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const logoutStore = useUserStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    logoutStore();
  };

  return (
    <header className="w-full flex justify-between items-center px-6 py-4 border-b border-[#2a3441] bg-[#141920]">
      <Link href="/" className="flex items-center gap-3">
        <div className="w-9 h-9 bg-[#ff6b00] rounded-lg flex items-center justify-center flex-shrink-0">
          <TrendingUp className="text-white" size={20} />
        </div>
        <div>
          <span className="text-[#ff6b00] text-xl font-bold tracking-tight block">exness</span>
          <span className="text-[#6b7280] text-xs">Trading Simulator</span>
        </div>
      </Link>

      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <div className="flex items-center gap-3 text-[#b0b8c1] text-sm">
              <User size={16} />
              <span className="font-medium text-white">{user?.username}</span>
              {user?.balance != null && (
                <span className="text-green-400 font-mono tabular-nums">${Number(user.balance).toLocaleString()}</span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-[#1a1f26] border border-[#2a3441] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2a3441] transition-colors"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="bg-[#1a1f26] border border-[#2a3441] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#2a3441] transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="bg-[#ff6b00] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#e55a00] transition-colors"
            >
              Sign up
            </Link>
          </>
        )}
        <Link
          href="/webtrading"
          className="bg-[#ff6b00] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#e55a00] transition-colors"
        >
          Start Trading
        </Link>
      </div>
    </header>
  );
}

export default Navbar