import React from 'react';
import { ShoppingBag, UserCheck } from 'lucide-react';
import { ReturningCustomer } from '../types';

interface HeaderProps {
  activeTab: 'experience' | 'menu' | 'vibe' | 'loyalty' | 'pulse';
  setActiveTab: (tab: 'experience' | 'menu' | 'vibe' | 'loyalty' | 'pulse') => void;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  userName?: string;
  tableNumber?: string;
  activeMember: ReturningCustomer | null;
  onOpenMemberModal: () => void;
  earnedBadgeCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  cartTotal,
  onOpenCart,
  userName,
  tableNumber,
  activeMember,
  onOpenMemberModal,
  earnedBadgeCount,
}) => {
  const displayName = userName && userName.trim()
    ? userName.trim()
    : activeMember?.name
    ? activeMember.name.split(' ')[0]
    : 'Guest Profile';

  return (
    <header className="sticky top-0 z-40 bg-[#FAF6F0]/95 backdrop-blur-md border-b border-[#E6DDD4]">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 sm:gap-6 px-3 sm:px-6 py-3">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => setActiveTab('experience')}
          className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-[#261B16] whitespace-nowrap shrink-0 text-left cursor-pointer"
        >
          CaféOS AI
        </button>

        {/* Zone 2: Concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#6B5A50]">
          <button
            onClick={() => setActiveTab('experience')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'experience'
                ? 'text-[#261B16] border-b-2 border-[#C67D3E] font-semibold'
                : 'hover:text-[#261B16]'
            }`}
          >
            AI Barista
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'menu'
                ? 'text-[#261B16] border-b-2 border-[#C67D3E] font-semibold'
                : 'hover:text-[#261B16]'
            }`}
          >
            Specialty Menu
          </button>
          <button
            onClick={() => setActiveTab('vibe')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'vibe'
                ? 'text-[#261B16] border-b-2 border-[#C67D3E] font-semibold'
                : 'hover:text-[#261B16]'
            }`}
          >
            Room Vibe & Map
          </button>
          <button
            onClick={() => setActiveTab('loyalty')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'loyalty'
                ? 'text-[#261B16] border-b-2 border-[#C67D3E] font-semibold'
                : 'hover:text-[#261B16]'
            }`}
          >
            Rewards & Stamps
          </button>
          <button
            onClick={() => setActiveTab('pulse')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'pulse'
                ? 'text-[#261B16] border-b-2 border-[#C67D3E] font-semibold'
                : 'hover:text-[#261B16]'
            }`}
          >
            Guest Feedback
          </button>
        </nav>

        {/* Zone 3: Customer Profile Section & Bag Action */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Customer Profile Pill (Always Visible on Desktop and Mobile) */}
          <button
            type="button"
            onClick={onOpenMemberModal}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg transition-colors cursor-pointer max-w-[170px] sm:max-w-[220px] ${
              userName && userName.trim()
                ? 'text-[#261B16] bg-[#F9F4EE] hover:bg-[#F3EBE1] border border-[#C67D3E]/50 font-medium'
                : 'text-[#574439] bg-[#FAF6F0] hover:bg-[#F4EFEA] border border-[#E0D5CB]'
            }`}
            title="Customer Profile & Table Booking"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#C67D3E] shrink-0" />
            <span className="font-semibold truncate">
              {displayName}
            </span>
            {tableNumber && tableNumber.trim() && (
              <span className="text-[10px] text-[#A86226] bg-[#F5EBE1] border border-[#E6DDD4] px-1.5 py-0.2 rounded font-medium shrink-0 truncate max-w-[75px]">
                {tableNumber.toLowerCase().includes('table') ? tableNumber : `T-${tableNumber}`}
              </span>
            )}
            {earnedBadgeCount > 0 && (
              <span className="text-[10px] bg-[#EBF1EC] text-[#4E6B58] font-bold px-1 rounded shrink-0 hidden sm:inline">
                ★{earnedBadgeCount}
              </span>
            )}
          </button>

          {/* Bag CTA */}
          <button
            onClick={onOpenCart}
            className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-[#261B16] hover:bg-[#3D2C25] active:scale-95 transition-all rounded-lg shadow-sm whitespace-nowrap cursor-pointer"
            aria-label="Open Cart"
          >
            <ShoppingBag className="w-4 h-4 text-[#E6DDD4]" />
            <span className="hidden sm:inline">Bag</span>
            {cartCount > 0 && (
              <span className="bg-[#C67D3E] text-white text-xs font-semibold px-1.5 py-0.2 rounded-full tabular-nums">
                {cartCount} · ₹{cartTotal}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Thumb Navigation */}
      <div className="flex md:hidden items-center justify-around px-2 py-2 border-t border-[#EAE2DA] bg-[#F7F2EB] text-xs font-medium text-[#6B5A50] overflow-x-auto">
        <button
          onClick={() => setActiveTab('experience')}
          className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
            activeTab === 'experience' ? 'text-[#261B16] bg-white font-semibold shadow-xs' : ''
          }`}
        >
          AI Barista
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
            activeTab === 'menu' ? 'text-[#261B16] bg-white font-semibold shadow-xs' : ''
          }`}
        >
          Menu
        </button>
        <button
          onClick={() => setActiveTab('vibe')}
          className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
            activeTab === 'vibe' ? 'text-[#261B16] bg-white font-semibold shadow-xs' : ''
          }`}
        >
          Floor Map
        </button>
        <button
          onClick={() => setActiveTab('loyalty')}
          className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
            activeTab === 'loyalty' ? 'text-[#261B16] bg-white font-semibold shadow-xs' : ''
          }`}
        >
          Rewards
        </button>
        <button
          onClick={() => setActiveTab('pulse')}
          className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
            activeTab === 'pulse' ? 'text-[#261B16] bg-white font-semibold shadow-xs' : ''
          }`}
        >
          Feedback
        </button>
      </div>
    </header>
  );
};
