import React from 'react';
import { ChefHat, ShieldCheck, User, LogOut } from 'lucide-react';

export type ActiveRole = 'customer' | 'chef' | 'admin';

interface RoleSwitcherProps {
  activeRole: ActiveRole;
  onChangeRole: (role: ActiveRole) => void;
  isAdminLoggedIn: boolean;
  isChefLoggedIn: boolean;
  onLogoutRole: (role: 'admin' | 'chef') => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  activeRole,
  onChangeRole,
  isAdminLoggedIn,
  isChefLoggedIn,
  onLogoutRole,
}) => {
  return (
    <aside aria-label="Demo role selector" className="bg-[#1B1310] text-[#E6DDD4] border-b border-[#3D2C25] px-2.5 sm:px-6 py-2 text-xs">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white tracking-wide uppercase text-[10px] bg-[#C67D3E] px-1.5 py-0.5 rounded">
              DEMO ROLES
            </span>
            <span className="text-[#A8988D] hidden md:inline text-[11px]">
              Switch seamlessly to evaluate connected Customer, Kitchen & Operations platforms:
            </span>
          </div>
        </div>

        {/* The 3 Role Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5 w-full sm:w-auto justify-stretch sm:justify-end overflow-x-auto">
          <button
            type="button"
            onClick={() => onChangeRole('customer')}
            className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap text-xs ${
              activeRole === 'customer'
                ? 'bg-white text-[#261B16] shadow-xs'
                : 'text-[#D5C6B7] hover:text-white hover:bg-[#2C1E18]'
            }`}
          >
            <User className="w-3.5 h-3.5 shrink-0" />
            <span>Customer</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeRole('chef')}
            className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap text-xs ${
              activeRole === 'chef'
                ? 'bg-[#C67D3E] text-white shadow-xs'
                : 'text-[#D5C6B7] hover:text-white hover:bg-[#2C1E18]'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden xs:inline">Kitchen</span>
            <span className="xs:hidden">Chef</span>
            <span>KDS</span>
            {isChefLoggedIn && <span className="text-[10px] opacity-80">(Active)</span>}
          </button>

          <button
            type="button"
            onClick={() => onChangeRole('admin')}
            className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap text-xs ${
              activeRole === 'admin'
                ? 'bg-[#C67D3E] text-white shadow-xs'
                : 'text-[#D5C6B7] hover:text-white hover:bg-[#2C1E18]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden xs:inline">Manager</span>
            <span className="xs:hidden">Admin</span>
            <span>Portal</span>
            {isAdminLoggedIn && <span className="text-[10px] opacity-80">(Active)</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};
