import React, { useState } from 'react';
import { X, Sparkles, Coffee, History, Repeat, Check, UserCheck } from 'lucide-react';
import { ReturningCustomer } from '../types';
import { MenuItem } from '../data/menu';

interface ReturningCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: ReturningCustomer) => void;
  onReorderFavorite: (drinkName: string, snackName: string) => void;
  currentCustomer: ReturningCustomer | null;
  userName?: string;
  tableNumber?: string;
  onUpdateProfile?: (name: string, table: string) => void;
}

const DEMO_CUSTOMERS: ReturningCustomer[] = [
  {
    membershipCode: 'MEM-88',
    name: 'Aarav Mehta',
    favoriteDrink: 'Cortado',
    favoriteSnack: 'Almond Butter Croissant',
    frequentIntent: 'deep_work',
    pastOrders: ['Cortado + Almond Butter Croissant', 'Pour-Over Single Origin', 'Vanilla Cold Brew'],
  },
  {
    membershipCode: 'MEM-42',
    name: 'Priya Kapoor',
    favoriteDrink: 'Ceremonial Matcha Latte',
    favoriteSnack: 'Avocado Citrus Tartine',
    frequentIntent: 'meeting',
    pastOrders: ['Ceremonial Matcha Latte + Avocado Citrus Tartine', 'Cascara Sparkler'],
  },
  {
    membershipCode: 'CAFE-VIP',
    name: 'Samira Rao',
    favoriteDrink: 'Vanilla Cold Brew',
    favoriteSnack: 'Truffle Mushroom Toast',
    frequentIntent: 'unwind',
    pastOrders: ['Vanilla Cold Brew + Truffle Mushroom Toast', 'Dark Chocolate Mocha'],
  },
];

export const ReturningCustomerModal: React.FC<ReturningCustomerModalProps> = ({
  isOpen,
  onClose,
  onSelectCustomer,
  onReorderFavorite,
  currentCustomer,
  userName = '',
  tableNumber = '',
  onUpdateProfile,
}) => {
  const [codeInput, setCodeInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [editName, setEditName] = useState(userName || currentCustomer?.name || '');
  const [editTable, setEditTable] = useState(tableNumber || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync when opened
  React.useEffect(() => {
    if (isOpen) {
      setEditName(userName || currentCustomer?.name || '');
      setEditTable(tableNumber || '');
      setSaveSuccess(false);
    }
  }, [isOpen, userName, tableNumber, currentCustomer]);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateProfile) {
      onUpdateProfile(editName.trim(), editTable.trim());
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleLookup = (code: string) => {
    const found = DEMO_CUSTOMERS.find(
      (c) => c.membershipCode.toUpperCase() === code.trim().toUpperCase()
    );
    if (found) {
      setErrorMsg('');
      onSelectCustomer(found);
    } else {
      setErrorMsg(`Code "${code}" not found. Try one of our demo member codes below!`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-[#261B16]/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-[#E6DDD4] shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#FAF6F0] border-b border-[#E6DDD4] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#C67D3E]" />
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C67D3E]">
                RECOGNIZED DEMO MEMBER PROFILE
              </span>
              <h3 className="text-lg font-serif font-bold text-[#261B16]">
                Returning Customer & Favorites
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

        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Active Guest Profile Card */}
          <div className="bg-[#FAF6F0] rounded-xl border border-[#E0D5CB] p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-[#A86226] uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-[#C67D3E]" />
                Current Active Session Profile
              </span>
              <span className="text-[11px] text-emerald-700 bg-emerald-100/70 font-semibold px-2 py-0.5 rounded-full">
                Saved in Session
              </span>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#574439] uppercase tracking-wider mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Alex or Enter Name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E0D5CB] rounded-lg text-[#261B16] font-medium focus:outline-none focus:ring-2 focus:ring-[#C67D3E]/30 focus:border-[#C67D3E]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#574439] uppercase tracking-wider mb-1">
                    Table / Booking Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Table 4 or Desk 2"
                    value={editTable}
                    onChange={(e) => setEditTable(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E0D5CB] rounded-lg text-[#261B16] font-medium focus:outline-none focus:ring-2 focus:ring-[#C67D3E]/30 focus:border-[#C67D3E]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <p className="text-[11px] text-[#8C7A70]">
                  {editName.trim()
                    ? `Will be shown as ${editName.trim()}${editTable.trim() ? ` · Table ${editTable.trim()}` : ''}`
                    : 'Enter your name to personalize your orders & recommendations'}
                </p>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-[#261B16] hover:bg-[#3D2C25] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  {saveSuccess ? '✓ Saved!' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>

          {/* Member lookup box */}
          <div>
            <label className="block text-xs font-semibold text-[#574439] uppercase tracking-wider mb-1.5">
              Enter Demo Membership Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. MEM-88 or CAFE-VIP"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                className="flex-1 px-3 py-2 text-sm bg-[#FAF6F0] border border-[#E0D5CB] rounded-lg text-[#261B16] uppercase focus:outline-none focus:ring-2 focus:ring-[#C67D3E]/30 focus:border-[#C67D3E]"
              />
              <button
                type="button"
                onClick={() => handleLookup(codeInput)}
                className="px-4 py-2 bg-[#261B16] hover:bg-[#3D2C25] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Lookup
              </button>
            </div>
            {errorMsg && <p className="text-xs text-red-600 mt-1">{errorMsg}</p>}
          </div>

          {/* Quick Select Demo Profiles */}
          <div>
            <span className="text-[11px] font-semibold text-[#8C7A70] uppercase tracking-wider block mb-2">
              Or Click a Pre-configured Demo Profile:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {DEMO_CUSTOMERS.map((c) => (
                <button
                  key={c.membershipCode}
                  type="button"
                  onClick={() => onSelectCustomer(c)}
                  className={`p-3 text-left rounded-xl border text-xs transition-all cursor-pointer ${
                    currentCustomer?.membershipCode === c.membershipCode
                      ? 'bg-[#F9F4EE] border-[#C67D3E] ring-1 ring-[#C67D3E]'
                      : 'bg-[#FAF6F0] border-[#E6DDD4] hover:border-[#D5C6B7]'
                  }`}
                >
                  <span className="font-bold text-[#261B16] block">{c.name}</span>
                  <span className="text-[11px] text-[#A86226] block">{c.membershipCode}</span>
                  <span className="text-[10px] text-[#8C7A70] mt-1 block truncate">Fav: {c.favoriteDrink}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Recognized Customer Summary */}
          {currentCustomer && (
            <div className="bg-[#FAF6F0] rounded-xl border border-[#C67D3E]/40 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-emerald-700 font-bold bg-[#EBF1EC] px-2 py-0.5 rounded">
                    Active Member: {currentCustomer.membershipCode}
                  </span>
                  <h4 className="text-base font-serif font-bold text-[#261B16] mt-1">
                    Welcome back, {currentCustomer.name}!
                  </h4>
                </div>
              </div>

              {/* Favorites summary */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-white rounded-lg border border-[#EAE2DA]">
                  <span className="text-[10px] uppercase font-semibold text-[#8C7A70] block">Favorite Drink</span>
                  <span className="font-bold text-[#261B16]">{currentCustomer.favoriteDrink}</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-[#EAE2DA]">
                  <span className="text-[10px] uppercase font-semibold text-[#8C7A70] block">Favorite Snack</span>
                  <span className="font-bold text-[#261B16]">{currentCustomer.favoriteSnack}</span>
                </div>
              </div>

              {/* Past orders */}
              <div>
                <span className="text-[11px] font-semibold text-[#574439] uppercase tracking-wider block mb-1">
                  Recent Orders:
                </span>
                <div className="space-y-1 text-xs text-[#6B5A50]">
                  {currentCustomer.pastOrders.map((p, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C67D3E]" />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 1-Click Reorder Favorite */}
              <button
                type="button"
                onClick={() => {
                  onReorderFavorite(currentCustomer.favoriteDrink, currentCustomer.favoriteSnack);
                  onClose();
                }}
                className="w-full py-3 bg-[#261B16] hover:bg-[#3D2C25] active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <Repeat className="w-4 h-4 text-[#C67D3E]" />
                <span>1-Click Reorder Favorite Combo ({currentCustomer.favoriteDrink} + {currentCustomer.favoriteSnack})</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
