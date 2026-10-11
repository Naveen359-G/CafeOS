import React, { useState, useEffect } from 'react';
import { ChefHat, Clock, AlertTriangle, CheckCircle, Flame, Bell, Filter, Sliders, Check, RefreshCw } from 'lucide-react';
import { DemoOrder, OrderStatus } from '../types';

interface KitchenDisplayProps {
  orders: DemoOrder[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onUpdateThreshold: (orderId: string, minutes: number) => void;
  onRefreshOrders?: () => void;
}

export const KitchenDisplay: React.FC<KitchenDisplayProps> = ({
  orders,
  onUpdateStatus,
  onUpdateThreshold,
  onRefreshOrders,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'preparing' | 'ready' | 'completed'>('all');
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [globalThreshold, setGlobalThreshold] = useState<number>(2); // Default 2 minutes
  const [lastOrderCount, setLastOrderCount] = useState<number>(orders.length);
  const [hasNewArrivalAlert, setHasNewArrivalAlert] = useState<boolean>(false);

  // Live timer tick every second for precise elapsed time calculation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Detect newly arrived orders for visual alert banner
  useEffect(() => {
    if (orders.length > lastOrderCount) {
      setHasNewArrivalAlert(true);
      const timer = setTimeout(() => setHasNewArrivalAlert(false), 5000);
      return () => clearTimeout(timer);
    }
    setLastOrderCount(orders.length);
  }, [orders.length, lastOrderCount]);

  // Compute active & completed metrics
  const activeOrders = orders.filter((o) => o.status !== 'completed');
  const newCount = orders.filter((o) => o.status === 'new').length;
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;
  const readyCount = orders.filter((o) => o.status === 'ready').length;
  const completedCount = orders.filter((o) => o.status === 'completed').length;

  // Calculate overdue count (orders whose elapsed time > threshold)
  const overdueOrders = activeOrders.filter((o) => {
    const thresholdMins = o.prepWarningThresholdMinutes || globalThreshold;
    const elapsedMinutes = (currentTime - o.createdAt) / (1000 * 60);
    return elapsedMinutes > thresholdMins;
  });

  // Calculate average prep time for completed orders (minutes)
  const completedWithTimes = orders.filter((o) => o.status === 'completed' && o.completedAt && o.createdAt);
  const avgPrepMinutes = completedWithTimes.length > 0
    ? (
        completedWithTimes.reduce((sum, o) => sum + ((o.completedAt! - o.createdAt) / (1000 * 60)), 0) /
        completedWithTimes.length
      ).toFixed(1)
    : '2.4';

  const filteredOrders = orders.filter((order) => {
    if (filterStatus === 'all') return order.status !== 'completed'; // Default show active tickets
    if (filterStatus === 'completed') return order.status === 'completed';
    return order.status === filterStatus;
  });

  const formatElapsed = (createdAt: number) => {
    const totalSecs = Math.max(0, Math.floor((currentTime - createdAt) / 1000));
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* KDS Header & Live Controls */}
      <div className="bg-[#1B1310] text-white rounded-2xl p-4 sm:p-6 shadow-md border border-[#3D2C25]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#C67D3E] text-white rounded-xl shadow-xs">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#C67D3E] uppercase tracking-wider bg-[#2C1E18] px-2 py-0.5 rounded border border-[#3D2C25]">
                  Live Barista KDS
                </span>
                <span className="text-xs text-[#E6DDD4]/70">Kitchen Display System</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                Chef & Brewing Command Center
              </h2>
            </div>
          </div>

          {/* Real-time Shift Telemetry Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-[#2C1E18] px-3.5 py-2 rounded-xl border border-[#3D2C25] text-xs">
              <span className="text-[#A8988D] block text-[10px] uppercase font-semibold">Active Brewing</span>
              <span className="text-lg font-bold text-white tabular-nums">{activeOrders.length} tickets</span>
            </div>

            <div className={`px-3.5 py-2 rounded-xl border text-xs ${
              overdueOrders.length > 0
                ? 'bg-red-950/80 border-red-800 text-red-200 animate-pulse'
                : 'bg-[#2C1E18] border-[#3D2C25] text-emerald-400'
            }`}>
              <span className="block text-[10px] uppercase font-semibold">Overdue (&gt;{globalThreshold}m)</span>
              <span className="text-lg font-bold tabular-nums">
                {overdueOrders.length} {overdueOrders.length > 0 ? '⚠️' : '✓'}
              </span>
            </div>

            <div className="bg-[#2C1E18] px-3.5 py-2 rounded-xl border border-[#3D2C25] text-xs">
              <span className="text-[#A8988D] block text-[10px] uppercase font-semibold">Avg Turnaround</span>
              <span className="text-lg font-bold text-[#E6DDD4] tabular-nums">{avgPrepMinutes} mins</span>
            </div>

            {onRefreshOrders && (
              <button
                type="button"
                onClick={onRefreshOrders}
                className="p-2.5 bg-[#2C1E18] hover:bg-[#3D2C25] text-[#E6DDD4] rounded-xl border border-[#3D2C25] transition-colors cursor-pointer"
                title="Refresh Tickets"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Global Warning Threshold Config & Status Filter Bar */}
        <div className="mt-5 pt-4 border-t border-[#3D2C25] flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[#A8988D] font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#C67D3E]" /> View:
            </span>
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === 'all'
                  ? 'bg-[#C67D3E] text-white shadow-xs'
                  : 'bg-[#2C1E18] text-[#D5C6B7] hover:bg-[#3D2C25]'
              }`}
            >
              Active Queue ({activeOrders.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('new')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === 'new'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#2C1E18] text-emerald-400 hover:bg-[#3D2C25]'
              }`}
            >
              New Tickets ({newCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('preparing')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === 'preparing'
                  ? 'bg-amber-600 text-white'
                  : 'bg-[#2C1E18] text-amber-400 hover:bg-[#3D2C25]'
              }`}
            >
              Brewing ({preparingCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('ready')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === 'ready'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#2C1E18] text-blue-400 hover:bg-[#3D2C25]'
              }`}
            >
              Ready ({readyCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === 'completed'
                  ? 'bg-zinc-600 text-white'
                  : 'bg-[#2C1E18] text-zinc-400 hover:bg-[#3D2C25]'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>

          {/* Configurable Warning Threshold */}
          <div className="flex items-center gap-2 bg-[#2C1E18] px-3 py-1.5 rounded-xl border border-[#3D2C25]">
            <Sliders className="w-3.5 h-3.5 text-[#C67D3E]" />
            <span className="text-[#A8988D]">Warning Latency:</span>
            {[2, 3, 5].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setGlobalThreshold(mins)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                  globalThreshold === mins
                    ? 'bg-[#C67D3E] text-white'
                    : 'text-[#D5C6B7] hover:text-white'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* New Order Arrival Banner */}
      {hasNewArrivalAlert && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl flex items-center justify-between shadow-lg animate-bounce">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Bell className="w-5 h-5" />
            <span>🔔 New incoming ticket dispatched to kitchen!</span>
          </div>
          <span className="text-xs bg-emerald-800 px-2 py-1 rounded">Just Arrived</span>
        </div>
      )}

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E6DDD4] p-12 text-center text-[#8C7A70] space-y-2">
          <ChefHat className="w-12 h-12 text-[#C67D3E] mx-auto opacity-40" />
          <h3 className="font-serif font-bold text-lg text-[#574439]">No Orders In This Queue</h3>
          <p className="text-xs max-w-sm mx-auto">
            All tickets under this filter have been completed or moved forward. New customer orders will appear automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => {
            const elapsedMins = (currentTime - order.createdAt) / (1000 * 60);
            const threshold = order.prepWarningThresholdMinutes || globalThreshold;
            const isOverdue = order.status !== 'completed' && elapsedMins > threshold;

            // Header colors
            let headerBg = 'bg-emerald-600 text-white';
            let statusBadge = 'bg-emerald-100 text-emerald-800';
            if (order.status === 'preparing') {
              headerBg = 'bg-amber-600 text-white';
              statusBadge = 'bg-amber-100 text-amber-800';
            } else if (order.status === 'ready') {
              headerBg = 'bg-blue-600 text-white';
              statusBadge = 'bg-blue-100 text-blue-800';
            } else if (order.status === 'completed') {
              headerBg = 'bg-zinc-700 text-zinc-200';
              statusBadge = 'bg-zinc-200 text-zinc-800';
            }

            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl border flex flex-col justify-between overflow-hidden shadow-xs transition-all ${
                  isOverdue
                    ? 'border-red-500 ring-2 ring-red-400'
                    : 'border-[#E6DDD4] hover:border-[#D5C6B7]'
                }`}
              >
                {/* Order Card Header */}
                <div>
                  <div className={`px-4 py-3 flex items-center justify-between ${headerBg}`}>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-serif font-bold text-lg tracking-tight">
                          {order.tokenNumber}
                        </span>
                        {isOverdue && (
                          <span className="bg-red-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 animate-pulse">
                            <AlertTriangle className="w-3 h-3" /> Overdue
                          </span>
                        )}
                      </div>
                      <span className="text-xs opacity-90 block">
                        {order.tableNumber ? order.tableNumber : 'Pickup Counter'} · {order.zone}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold block tabular-nums">
                        ⏱ {formatElapsed(order.createdAt)}
                      </span>
                      <span className="text-[10px] opacity-80 uppercase tracking-wider font-semibold">
                        Placed {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Customer & Ticket Info */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs text-[#574439] pb-2 border-b border-[#F0EAE1]">
                      <span className="font-semibold text-[#261B16]">
                        Guest: {order.customerName}
                      </span>
                      <span className="text-[#8C7A70] text-[11px] tabular-nums">
                        Total ₹{order.totalAmount} ({order.paymentMethod})
                      </span>
                    </div>

                    {/* Ordered Items List */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-semibold text-[#8C7A70] uppercase tracking-wider block">
                        Items to Prepare ({order.items.reduce((s, i) => s + i.quantity, 0)}):
                      </span>
                      {order.items.map((cartItem, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-[#FAF6F0] rounded-xl border border-[#EAE2DA] flex items-center justify-between gap-2"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-[#261B16] text-white text-xs font-bold flex items-center justify-center shrink-0 tabular-nums">
                                {cartItem.quantity}
                              </span>
                              <span className="text-xs font-bold text-[#261B16]">
                                {cartItem.item.name}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#6B5A50] ml-7">
                              <span className="capitalize">{cartItem.item.temperature}</span>
                              <span aria-hidden="true"> · </span>
                              <span>{cartItem.item.dietaryTags.join(', ')}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Special Instructions if any */}
                    {order.specialInstructions && (
                      <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                        <span className="font-bold block text-[10px] uppercase">Special Request:</span>
                        <span>"{order.specialInstructions}"</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 pt-0 space-y-2">
                  <div className="pt-2 border-t border-[#F0EAE1] flex items-center justify-between">
                    <span className="text-[11px] text-[#8C7A70]">
                      Warning threshold: {threshold}m
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${statusBadge}`}>
                      {order.status}
                    </span>
                  </div>

                  {/* Functional Action Buttons */}
                  <div className="grid grid-cols-1 gap-1.5 pt-1">
                    {order.status === 'new' && (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(order.id, 'preparing')}
                        className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <Flame className="w-4 h-4" />
                        <span>Start Preparing</span>
                      </button>
                    )}

                    {order.status === 'preparing' && (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(order.id, 'ready')}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Mark Ready for Pickup</span>
                      </button>
                    )}

                    {order.status === 'ready' && (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(order.id, 'completed')}
                        className="w-full py-2.5 bg-[#261B16] hover:bg-[#3D2C25] active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <Check className="w-4 h-4" />
                        <span>Complete Order & Close Ticket</span>
                      </button>
                    )}

                    {order.status === 'completed' && (
                      <div className="text-center text-xs text-[#4E6B58] font-semibold py-1">
                        ✓ Ticket Archived & Delivered
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
