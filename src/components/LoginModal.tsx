import React, { useState } from 'react';
import { X, Lock, ShieldCheck, ChefHat, User, AlertCircle, CheckCircle2 } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole: 'admin' | 'chef';
  onLoginSuccess: (role: 'admin' | 'chef') => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  targetRole,
  onLoginSuccess,
}) => {
  const [loginId, setLoginId] = useState(targetRole === 'admin' ? 'Cafe-admin' : 'Cafe-chef');
  const [password, setPassword] = useState(targetRole === 'admin' ? 'Admin-CafeOS1' : 'Chef-Cafe1');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole, loginId, password }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        onLoginSuccess(targetRole);
        onClose();
      } else {
        setErrorMsg(data.message || 'Invalid credentials');
      }
    } catch (err: any) {
      // Local fallback verification in case of network edge
      if (
        (targetRole === 'admin' && loginId === 'Cafe-admin' && password === 'Admin-CafeOS1') ||
        (targetRole === 'chef' && loginId === 'Cafe-chef' && password === 'Chef-Cafe1')
      ) {
        onLoginSuccess(targetRole);
        onClose();
      } else {
        setErrorMsg('Authentication error. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-[#261B16]/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-2xl border border-[#E6DDD4] shadow-2xl overflow-hidden z-10 flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#FAF6F0] border-b border-[#E6DDD4] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {targetRole === 'admin' ? (
              <ShieldCheck className="w-5 h-5 text-[#C67D3E]" />
            ) : (
              <ChefHat className="w-5 h-5 text-[#C67D3E]" />
            )}
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C67D3E]">
                {targetRole === 'admin' ? 'ADMIN ACCESS' : 'CHEF KDS ACCESS'}
              </span>
              <h3 className="text-lg font-serif font-bold text-[#261B16]">
                {targetRole === 'admin' ? 'Manager Portal Login' : 'Kitchen KDS Login'}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#6B5A50] hover:text-[#261B16] rounded-lg hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#EAE2DA] text-xs text-[#6B5A50]">
            <p className="font-semibold text-[#261B16]">Hackathon Credentials Pre-filled:</p>
            <div className="mt-1 font-mono text-[11px] text-[#A86226]">
              {targetRole === 'admin' ? (
                <>
                  <div>ID: <strong>Cafe-admin</strong></div>
                  <div>Password: <strong>Admin-CafeOS1</strong></div>
                </>
              ) : (
                <>
                  <div>ID: <strong>Cafe-chef</strong></div>
                  <div>Password: <strong>Chef-Cafe1</strong></div>
                </>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#574439] uppercase tracking-wider mb-1">
              Login ID
            </label>
            <input
              type="text"
              required
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#FAF6F0] border border-[#E0D5CB] rounded-lg text-[#261B16] focus:outline-none focus:ring-2 focus:ring-[#C67D3E]/30 focus:border-[#C67D3E]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#574439] uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#FAF6F0] border border-[#E0D5CB] rounded-lg text-[#261B16] focus:outline-none focus:ring-2 focus:ring-[#C67D3E]/30 focus:border-[#C67D3E]"
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-[#261B16] hover:bg-[#3D2C25] active:scale-98 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
            >
              <Lock className="w-4 h-4 text-[#C67D3E]" />
              <span>{isLoading ? 'Verifying...' : `Sign in as ${targetRole === 'admin' ? 'Admin' : 'Chef'}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
