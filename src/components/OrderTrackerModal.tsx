import React, { useEffect, useState } from 'react';
import { X, CheckCircle, Clock, Coffee, Sparkles, MapPin, Check, Flame } from 'lucide-react';
import { DemoOrder, OrderStatus } from '../types';

interface OrderTrackerModalProps {
  order: DemoOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onLeaveFeedback: () => void;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  order,
  isOpen,
  onClose,
  onLeaveFeedback,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(120);

  useEffect(() => {
    if (!isOpen || !order) return;

    if (order.status === 'ready' || order.status === 'completed') {
      setSecondsRemaining(0);
      return;
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, order?.status]);

  if (!isOpen || !order) return null;

  const currentStatus = order.status;

  const steps = [
    {
      id: 'new' as OrderStatus,
      label: 'Ticket Received',
      detail: 'Order dispatched to Barista KDS station',
    },
    {
      id: 'preparing' as OrderStatus,
      label: 'Chef Brewing & Crafting',
      detail: 'Grinding beans, microfoaming milk & baking',
    },
    {
      id: 'ready' as OrderStatus,
      label: 'Ready for Pickup / Table Delivery',
      detail:
        order.tableNumber && order.tableNumber !== 'Pickup Counter'
          ? `Delivering to ${order.tableNumber}`
          : 'Ready at Barista Counter',
    },
    {
      id: 'completed' as OrderStatus,
      label: 'Order Delivered',
      detail: 'Delivered to your seat. Enjoy your session!',
    },
  ];

  let progressPct = 25;
  if (currentStatus === 'preparing') progressPct = 60;
  if (currentStatus === 'ready') progressPct = 90;
  if (currentStatus === 'completed') progressPct = 100;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#261B16]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-[#E6DDD4] shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#FAF6F0] border-b border-[#E6DDD4] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#261B16] text-white rounded-lg">
              <Coffee className="w-5 h-5 text-[#C67D3E]" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C67D3E]">
                LIVE KITCHEN SYNCHRONIZED ORDER
              </span>
              <h3 className="text-lg font-serif font-bold text-[#261B16]">
                Order Token {order.tokenNumber}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#6B5A50] hover:text-[#261B16] rounded-lg hover:bg-white transition-colors cursor-pointer"
            aria-label="Close Order Tracker"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progression Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Status Alert Banner */}
          <div className="bg-[#FAF6F0] rounded-xl p-4 border border-[#EAE2DA] text-center">
            {currentStatus === 'ready' || currentStatus === 'completed' ? (
              <div className="text-[#4E6B58] flex flex-col items-center">
                <CheckCircle className="w-10 h-10 text-[#4E6B58] mb-1" />
                <h4 className="text-base font-serif font-bold text-[#261B16]">
                  {currentStatus === 'ready' ? 'Your Order is Ready!' : 'Order Complete & Enjoyed'}
                </h4>
                <p className="text-xs text-[#574439] mt-0.5">
                  {order.tableNumber && order.tableNumber !== 'Pickup Counter'
                    ? `Barista is bringing your tray to ${order.tableNumber}. Enjoy your session!`
                    : 'Please collect your tray from the Barista Order Pickup Station.'}
                </p>
              </div>
            ) : currentStatus === 'preparing' ? (
              <div>
                <div className="text-xs text-[#A86226] font-semibold uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> Barista is Actively Brewing
                </div>
                <div className="text-3xl font-serif font-bold text-[#261B16] tabular-nums">
                  {formatTime(secondsRemaining)}
                </div>
                <p className="text-xs text-[#6B5A50] mt-1">
                  Micro-foaming & bean extraction in progress
                </p>
              </div>
            ) : (
              <div>
                <div className="text-xs text-[#8C7A70] uppercase tracking-wider mb-1">
                  Queue Position #1 · Dispatched to KDS
                </div>
                <div className="text-3xl font-serif font-bold text-[#261B16] tabular-nums">
                  {formatTime(secondsRemaining)}
                </div>
                <p className="text-xs text-[#6B5A50] mt-1">
                  Kitchen will begin crafting your items momentarily
                </p>
              </div>
            )}

            {/* Visual Progress Bar */}
            <div className="w-full bg-[#EAE2DA] h-2 rounded-full mt-4 overflow-hidden">
              <div
                className="bg-[#C67D3E] h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Stepper Progression */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-[#574439] uppercase tracking-wider block">
              Kitchen Preparation Milestones
            </span>
            <div className="space-y-2.5">
              {steps.map((step, idx) => {
                const isComplete =
                  (step.id === 'new' && currentStatus !== 'new') ||
                  (step.id === 'preparing' && (currentStatus === 'ready' || currentStatus === 'completed')) ||
                  (step.id === 'ready' && currentStatus === 'completed') ||
                  (step.id === currentStatus);

                const isCurrent = step.id === currentStatus;

                return (
                  <div
                    key={step.id}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                      isComplete
                        ? 'bg-[#F2F7F3] border-[#D0E2D4]'
                        : isCurrent
                        ? 'bg-[#FAF6F0] border-[#C67D3E] ring-1 ring-[#C67D3E]'
                        : 'bg-white border-[#E6DDD4] opacity-60'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isComplete
                          ? 'bg-[#4E6B58] text-white'
                          : isCurrent
                          ? 'bg-[#C67D3E] text-white animate-pulse'
                          : 'bg-[#EAE2DA] text-[#8C7A70]'
                      }`}
                    >
                      {isComplete ? <Check className="w-4 h-4" /> : idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-semibold text-[#261B16]">
                          {step.label}
                        </h5>
                        {isCurrent && (
                          <span className="text-[10px] text-[#A86226] font-medium animate-pulse">
                            Live Status
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#6B5A50]">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Seating / Zone Guidance */}
          <div className="p-3.5 bg-[#FAF6F0] rounded-xl border border-[#EAE2DA] flex items-start gap-3">
            <MapPin className="w-4 h-4 text-[#C67D3E] shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold text-[#261B16] block">
                Destination: {order.zone} {order.tableNumber ? `(${order.tableNumber})` : ''}
              </span>
              <p className="text-[#6B5A50] mt-0.5">
                Head to your designated spot, plug in, and get settled. Your items are routed to this seat.
              </p>
            </div>
          </div>

          {/* Itemized Order Details */}
          <div className="border-t border-[#F0EAE1] pt-3 text-xs space-y-1">
            <div className="flex justify-between text-[#8C7A70]">
              <span>Customer:</span>
              <span className="font-medium text-[#261B16]">{order.customerName}</span>
            </div>
            <div className="flex justify-between text-[#8C7A70]">
              <span>Payment Mode:</span>
              <span className="font-medium text-[#261B16]">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-[#8C7A70]">
              <span>Items:</span>
              <span className="font-medium text-[#261B16] text-right">
                {order.items.map((i) => `${i.quantity}x ${i.item.name}`).join(', ')}
              </span>
            </div>
            <div className="flex justify-between font-bold text-[#261B16] pt-1">
              <span>Paid Total:</span>
              <span className="tabular-nums">₹{order.totalAmount}</span>
            </div>
          </div>

          {/* Quick Feedback CTA */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onLeaveFeedback();
              }}
              className="w-full py-2.5 bg-[#FAF6F0] hover:bg-[#261B16] text-[#261B16] hover:text-white border border-[#E0D5CB] hover:border-[#261B16] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C67D3E]" />
              <span>Leave Quick Café Pulse Feedback</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
