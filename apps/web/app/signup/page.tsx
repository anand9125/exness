"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, TrendingUp, Lock, User } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { backendUrl } from '../../lib/url';
import { useUserStore } from '../zustand/useUserStore';

const SignupPage = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();
  const setUser = useUserStore((state) => state.setUser);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Username is required.');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${backendUrl}/user/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.username, password: formData.password }),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data);
        login(formData.username, data.userId);
        router.push('/webtrading');
      } else {
        setError(data.message || 'Failed to create account.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e13] flex items-center justify-center p-6">
      <div className="w-full max-w-[400px]">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-5">
            <div className="w-12 h-12 bg-[#ff6b00] rounded-xl flex items-center justify-center">
              <TrendingUp className="text-white" size={26} />
            </div>
            <span className="text-[#ff6b00] text-2xl font-bold tracking-tight">exness</span>
          </div>
          <h1 className="text-white text-2xl font-bold mb-2">Create account</h1>
          <p className="text-[#b0b8c1] text-sm">Sign up to start trading. You’ll get a demo balance to practice.</p>
        </div>

        {/* Form card */}
        <div className="bg-[#141920] rounded-xl border border-[#2a3441] p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-sm" role="alert">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="signup-username" className="block text-sm font-medium text-white mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" size={18} />
                <input
                  type="text"
                  id="signup-username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  autoComplete="username"
                  className="w-full bg-[#1a1f26] border border-[#2a3441] rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#ff6b00] focus:border-[#ff6b00]"
                  placeholder="Choose a username"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="signup-password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  autoComplete="new-password"
                  className="w-full bg-[#1a1f26] border border-[#2a3441] rounded-lg pl-10 pr-11 py-3 text-white placeholder:text-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#ff6b00] focus:border-[#ff6b00]"
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-white p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-[#6b7280]">Minimum 6 characters.</p>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="signup-terms"
                className="mt-1 rounded border-[#2a3441] bg-[#1a1f26] text-[#ff6b00] focus:ring-[#ff6b00]"
                required
              />
              <label htmlFor="signup-terms" className="text-sm text-[#b0b8c1]">
                I agree to the <Link href="/terms" className="text-[#ff6b00] hover:underline">Terms of Service</Link> and{' '}
                <Link href="/privacy" className="text-[#ff6b00] hover:underline">Privacy Policy</Link>.
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#ff6b00] hover:bg-[#e55a00] disabled:bg-[#374151] disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg text-base transition-colors"
            >
              {isLoading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 pt-5 border-t border-[#2a3441] text-center text-[#b0b8c1] text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-[#ff6b00] font-semibold hover:underline">Sign in</Link>
          </p>

          <div className="mt-5 pt-5 border-t border-[#2a3441]">
            <p className="text-center text-[#6b7280] text-xs mb-2">Try without an account</p>
            <Link href="/webtrading" className="block text-center text-[#ff6b00] hover:underline text-sm font-medium">
              Continue as guest
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-[#6b7280] text-xs">You’ll receive a demo balance to start.</p>
      </div>
    </div>
  );
};

export default SignupPage;
