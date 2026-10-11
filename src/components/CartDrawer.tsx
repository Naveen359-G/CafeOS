import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const totalAmount = items.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#261B16]/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-md bg-[#FAF6F0] h-full shadow-2xl flex flex-col z-10 border-l border-[#E6DDD4]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#E6DDD4] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#C67D3E]" />
            <h3 className="text-lg font-serif font-bold text-[#261B16]">Your Order Bag</h3>
            <span className="text-xs text-[#8C7A70] tabular-nums">
              ({items.reduce((s, i) => s + i.quantity, 0)} items)
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#6B5A50] hover:text-[#261B16] rounded-lg hover:bg-[#FAF6F0] transition-colors cursor-pointer"
            aria-label="Close Bag"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#8C7A70]">
              <div className="w-16 h-16 rounded-full bg-[#EAE2DA] flex items-center justify-center mb-3">
                <ShoppingBag className="w-8 h-8 text-[#9E8D82]" />
              </div>
              <p className="font-serif font-semibold text-base text-[#574439]">Your bag is empty</p>
              <p className="text-xs mt-1 max-w-xs text-[#8C7A70]">
                Explore our AI Barista recommendations or specialty menu to add drinks & snacks.
              </p>
            </div>
          ) : (
            items.map((cartItem) => (
              <div
                key={cartItem.item.id}
                className="bg-white rounded-xl border border-[#E6DDD4] p-3.5 flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-[#261B16] truncate">
                    {cartItem.item.name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-[#8C7A70] mt-0.5">
                    <span className="capitalize">{cartItem.item.temperature}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">₹{cartItem.item.price} each</span>
                  </div>
                  <span className="text-xs font-bold text-[#261B16] tabular-nums block mt-1">
                    ₹{cartItem.item.price * cartItem.quantity}
                  </span>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1.5 bg-[#FAF6F0] p-1 rounded-lg border border-[#EAE2DA]">
                  <button
                    type="button"
                    onClick={() => {
                      if (cartItem.quantity === 1) {
                        onRemoveItem(cartItem.item.id);
                      } else {
                        onUpdateQuantity(cartItem.item.id, -1);
                      }
                    }}
                    className="p-1 text-[#6B5A50] hover:text-[#261B16] rounded transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    {cartItem.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-red-500" /> : <Minus className="w-3.5 h-3.5" />}
                  </button>

                  <span className="w-6 text-center text-xs font-bold text-[#261B16] tabular-nums">
                    {cartItem.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(cartItem.item.id, 1)}
                    className="p-1 text-[#6B5A50] hover:text-[#261B16] rounded transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 bg-white border-t border-[#E6DDD4] space-y-3">
            <div className="space-y-1.5 text-xs text-[#6B5A50]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="tabular-nums font-semibold text-[#261B16]">₹{totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Taxes (GST 5%)</span>
                <span className="tabular-nums text-[#8C7A70]">Included</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#261B16] pt-1 border-t border-[#F0EAE1]">
                <span>Order Total</span>
                <span className="tabular-nums">₹{totalAmount}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onProceedToCheckout}
              className="w-full py-3 bg-[#261B16] hover:bg-[#3D2C25] active:scale-98 text-white font-semibold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Demo Order</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[11px] text-center text-[#8C7A70]">
              Instant simulated order · Generates live queue token
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
