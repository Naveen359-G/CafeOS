import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, ShieldCheck, MapPin, QrCode, CreditCard, Banknote, FileText, Check } from 'lucide-react';
import { CartItem } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  userName: string;
  tableNumber: string;
  zone: string;
  membershipCode: string;
  onConfirmOrder: (orderDetails: {
    customerName: string;
    tableNumber: string;
    paymentMethod: string;
    specialInstructions: string;
    membershipCode: string;
  }) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  userName: initialName,
  tableNumber: initialTable,
  zone,
  membershipCode: initialMemberCode,
  onConfirmOrder,
}) => {
  const [customerName, setCustomerName] = useState(initialName?.trim() || '');
  const [table, setTable] = useState(initialTable?.trim() || '');
  const [deliveryType, setDeliveryType] = useState<'table' | 'counter'>(
    initialTable && initialTable.trim() ? 'table' : 'counter'
  );
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'counter'>('upi');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [memberCode, setMemberCode] = useState(initialMemberCode || '');

  // Synchronize when modal opens or initial user details change
  useEffect(() => {
    if (isOpen) {
      if (initialName && initialName.trim()) {
        setCustomerName(initialName.trim());
      }
      if (initialTable && initialTable.trim()) {
        setTable(initialTable.trim());
        setDeliveryType('table');
      } else {
        setDeliveryType('counter');
      }
      if (initialMemberCode) {
        setMemberCode(initialMemberCode.trim());
      }
    }
  }, [isOpen, initialName, initialTable, initialMemberCode]);

  if (!isOpen) return null;

  const totalAmount = items.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmOrder({
      customerName: customerName.trim() || 'Café Guest',
      tableNumber: deliveryType === 'table' ? (table.trim() || 'Table Seated') : 'Pickup Counter',
      paymentMethod:
        paymentMethod === 'upi' ? 'Simulated UPI' : paymentMethod === 'card' ? 'Simulated Card' : 'Pay at Counter',
      specialInstructions: specialInstructions.trim(),
      membershipCode: memberCode.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#261B16]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-[#E6DDD4] shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#FAF6F0] border-b border-[#E6DDD4] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C67D3E]">
              DEMO SIMULATION · NO REAL CHARGE
            </span>
            <h3 className="text-lg font-serif font-bold text-[#261B16]">
              Confirm Your Café Experience
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#6B5A50] hover:text-[#261B16] rounded-lg hover:bg-white transition-colors cursor-pointer"
            aria-label="Close Checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Order Summary Recap */}
          <div className="bg-[#FAF6F0] rounded-xl p-3.5 border border-[#EAE2DA] text-xs space-y-1.5">
            <div className="flex justify-between text-[#8C7A70]">
              <span>Items to Brew:</span>
              <span className="text-[#261B16] font-medium text-right max-w-[240px] truncate">
                {items.map((i) => `${i.quantity}x ${i.item.name}`).join(', ')}
              </span>
            </div>
            <div className="flex justify-between text-[#8C7A70]">
              <span>Recommended Zone:</span>
              <span className="text-[#261B16] font-medium">{zone}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-[#261B16] pt-1 border-t border-[#E0D5CB]">
              <span>Total Amount:</span>
              <span className="tabular-nums">₹{totalAmount}</span>
            </div>
          </div>

          {/* Pre-filled from welcome session banner */}
          {(initialName || initialTable) && (
            <div className="flex items-center gap-2 px-3 py-2 bg-[#F9F4EE] rounded-xl border border-[#C67D3E]/40 text-xs text-[#574439]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="truncate">
                <span className="text-emerald-800 font-semibold">Auto-filled from check-in: </span>
                {customerName ? <strong className="text-[#261B16]">{customerName}</strong> : null}
                {table ? <span className="text-[#786355]"> · Table <strong className="text-[#261B16]">{table}</strong></span> : null}
              </div>
            </div>
          )}

          {/* Guest Name & Seating Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#574439] uppercase tracking-wider mb-1">
                Guest Name
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Name for order call"
                className="w-full px-3 py-2 text-sm bg-[#FAF6F0] border border-[#E0D5CB] rounded-lg text-[#261B16] focus:outline-none focus:ring-2 focus:ring-[#C67D3E]/30 focus:border-[#C67D3E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#574439] uppercase tracking-wider mb-1">
                Seating / Delivery Mode
              </label>
              <select
                value={deliveryType}
                onChange={(e) => setDeliveryType(e.target.value as any)}
                className="w-full px-3 py-2 text-sm bg-[#FAF6F0] border border-[#E0D5CB] rounded-lg text-[#261B16] focus:outline-none focus:ring-2 focus:ring-[#C67D3E]/30 focus:border-[#C67D3E]"
              >
                <option value="table">Deliver to My Table</option>
                <option value="counter">Pick Up at Barista Counter</option>
              </select>
            </div>
          </div>

          {deliveryType === 'table' && (
            <div>
              <label className="block text-xs font-semibold text-[#574439] uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Table Number</span>
                <span className="text-[11px] text-[#8C7A70] font-normal">Check the brass number plate</span>
              </label>
              <input
                type="text"
                value={table}
                onChange={(e) => setTable(e.target.value)}
                placeholder="e.g. Table 4, Corner Desk 2"
                className="w-full px-3 py-2 text-sm bg-[#FAF6F0] border border-[#E0D5CB] rounded-lg text-[#261B16] focus:outline-none focus:ring-2 focus:ring-[#C67D3E]/30 focus:border-[#C67D3E]"
              />
            </div>
          )}

          {/* Special Instructions */}
          <div>
            <label className="block text-xs font-semibold text-[#574439] uppercase tracking-wider mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-[#C67D3E]" />
              <span>Barista Special Instructions <span className="text-[#8C7A70] font-normal">(Optional)</span></span>
            </label>
            <input
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Extra hot, light ice, warm croissant lightly"
              className="w-full px-3 py-2 text-sm bg-[#FAF6F0] border border-[#E0D5CB] rounded-lg text-[#261B16] focus:outline-none focus:ring-2 focus:ring-[#C67D3E]/30 focus:border-[#C67D3E]"
            />
          </div>

          {/* Member Code */}
          <div>
            <label className="block text-xs font-semibold text-[#574439] uppercase tracking-wider mb-1">
              Demo Membership Code <span className="text-[#8C7A70] font-normal">(For Loyalty Stamps & History)</span>
            </label>
            <input
              type="text"
              value={memberCode}
              onChange={(e) => setMemberCode(e.target.value)}
              placeholder="e.g. MEM-88 or CAFE-VIP"
              className="w-full px-3 py-2 text-sm bg-[#FAF6F0] border border-[#E0D5CB] rounded-lg text-[#261B16] uppercase focus:outline-none focus:ring-2 focus:ring-[#C67D3E]/30 focus:border-[#C67D3E]"
            />
          </div>

          {/* Simulated Payment Mode */}
          <div>
            <label className="block text-xs font-semibold text-[#574439] uppercase tracking-wider mb-2">
              Select Simulated Payment Mode (Demo)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-2.5 text-left rounded-xl border text-xs transition-all cursor-pointer ${
                  paymentMethod === 'upi'
                    ? 'bg-[#F9F4EE] border-[#C67D3E] ring-1 ring-[#C67D3E]'
                    : 'bg-[#FAF6F0] border-[#E6DDD4] hover:border-[#D5C6B7]'
                }`}
              >
                <QrCode className="w-4 h-4 text-[#C67D3E] mb-1" />
                <span className="font-semibold text-[#261B16] block">Demo UPI</span>
                <span className="text-[10px] text-[#8C7A70]">Instant Simulated</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-2.5 text-left rounded-xl border text-xs transition-all cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'bg-[#F9F4EE] border-[#C67D3E] ring-1 ring-[#C67D3E]'
                    : 'bg-[#FAF6F0] border-[#E6DDD4] hover:border-[#D5C6B7]'
                }`}
              >
                <CreditCard className="w-4 h-4 text-[#C67D3E] mb-1" />
                <span className="font-semibold text-[#261B16] block">Demo Card</span>
                <span className="text-[10px] text-[#8C7A70]">Tap & Pay Mock</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('counter')}
                className={`p-2.5 text-left rounded-xl border text-xs transition-all cursor-pointer ${
                  paymentMethod === 'counter'
                    ? 'bg-[#F9F4EE] border-[#C67D3E] ring-1 ring-[#C67D3E]'
                    : 'bg-[#FAF6F0] border-[#E6DDD4] hover:border-[#D5C6B7]'
                }`}
              >
                <Banknote className="w-4 h-4 text-[#C67D3E] mb-1" />
                <span className="font-semibold text-[#261B16] block">At Counter</span>
                <span className="text-[10px] text-[#8C7A70]">Pay on Pickup</span>
              </button>
            </div>
          </div>

          {/* Place Order CTA */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 bg-[#261B16] hover:bg-[#3D2C25] active:scale-98 text-white font-semibold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-[#E6DDD4]" />
              <span>Confirm Demo Order · ₹{totalAmount}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
