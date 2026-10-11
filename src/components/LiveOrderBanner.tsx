import React from 'react';
import { Coffee, CheckCircle2, Clock, Sparkles, ArrowRight, X, AlertCircle } from 'lucide-react';
import { DemoOrder } from '../types';

interface LiveOrderBannerProps {
  order: DemoOrder | null;
  notificationMessage: string | null;
  onDismissNotification: () => void;
  onOpenTracker: (orderId: string) => void;
}

export const LiveOrderBanner: React.FC<LiveOrderBannerProps> = ({
  order,
  notificationMessage,
  onDismissNotification,
  onOpenTracker,
}) => {
  if (!order && !notificationMessage) return null;

  return (
    <div className="space-y-3">
      {/* 1. High-Priority Floating Live Status Notification (When Chef updates status or switching back to Customer) */}
      {notificationMessage && (
        <div className="bg-gradient-to-r from-[#261B16] via-[#3D2C25] to-[#261B16] text-white p-3.5 sm:p-4 rounded-2xl shadow-xl border border-[#C67D3E]/60 flex items-center justify-between gap-3 animate-bounce-short">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#C67D3E] text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#E6DDD4] block">
                Live Kitchen Progression Update
              </span>
              <p className="text-xs sm:text-sm font-semibold text-white truncate">
                {notificationMessage}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {order && (
              <button
                type="button"
                onClick={() => onOpenTracker(order.id)}
                className="px-3 py-1.5 bg-[#C67D3E] hover:bg-[#B46D32] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                Track Live →
              </button>
            )}
            <button
              type="button"
              onClick={onDismissNotification}
              className="p-1.5 text-[#E6DDD4] hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Dismiss Notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Persistent Live Order Bar (Shown whenever customer has an active order in progress) */}
      {order && order.status !== 'completed' && (
        <div className="bg-[#FAF6F0] rounded-xl border border-[#C67D3E]/40 p-3 sm:p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                order.status === 'ready'
                  ? 'bg-emerald-600 text-white animate-pulse'
                  : order.status === 'preparing'
                  ? 'bg-[#C67D3E] text-white'
                  : 'bg-[#EAE2DA] text-[#574439]'
              }`}
            >
              {order.status === 'ready' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : order.status === 'preparing' ? (
                <Coffee className="w-4 h-4" />
              ) : (
                <Clock className="w-4 h-4" />
              )}
            </div>

            <div className="text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-[#261B16] font-mono">{order.tokenNumber}</span>
                <span aria-hidden="true" className="text-[#C6B8AC]">·</span>
                <span
                  className={`font-semibold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${
                    order.status === 'ready'
                      ? 'bg-emerald-100 text-emerald-800 font-bold animate-pulse'
                      : order.status === 'preparing'
                      ? 'bg-[#F3E5D8] text-[#A86226] font-bold'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {order.status === 'ready'
                    ? '● Ready for Pickup!'
                    : order.status === 'preparing'
                    ? '● Chef Preparing Now'
                    : '● Order Queued'}
                </span>
                {order.tableNumber && (
                  <span className="text-[#6B5A50] text-[11px]">
                    · {order.tableNumber}
                  </span>
                )}
              </div>
              <p className="text-[#8C7A70] text-[11px] mt-0.5">
                {order.status === 'ready'
                  ? 'Your items are fresh and waiting! Please pick up or receive at table.'
                  : order.status === 'preparing'
                  ? 'Espresso extraction and artisanal preparation in motion.'
                  : 'Order registered in Kitchen Display System queue.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenTracker(order.id)}
            className="w-full sm:w-auto px-4 py-2 bg-[#261B16] hover:bg-[#3D2C25] active:scale-98 text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>Open Tracker</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#C67D3E]" />
          </button>
        </div>
      )}
    </div>
  );
};
