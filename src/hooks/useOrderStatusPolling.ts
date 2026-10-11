import { useState, useEffect, useCallback, useRef } from 'react';
import { DemoOrder, OrderStatus } from '../types';
import { playStatusChime } from '../utils/audioChime';

export function useOrderStatusPolling(
  activeRole: string,
  trackedOrderId: string | null,
  onStatusChange?: (order: DemoOrder, prevStatus: OrderStatus | null) => void
) {
  const [orders, setOrders] = useState<DemoOrder[]>([]);
  const [lastReportedStatus, setLastReportedStatus] = useState<OrderStatus | null>(() => {
    try {
      return (localStorage.getItem('cafeos_last_reported_status') as OrderStatus) || null;
    } catch {
      return null;
    }
  });
  const [statusNotification, setStatusNotification] = useState<string | null>(null);
  const prevStatusRef = useRef<OrderStatus | null>(lastReportedStatus);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.warn('Orders polling error:', e);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3500);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Real-time status monitor & websocket-like polling transition detector (Preparing -> Ready toast)
  useEffect(() => {
    if (activeRole === 'customer' && trackedOrderId && orders.length > 0) {
      const curOrder = orders.find((o) => o.id === trackedOrderId);
      if (curOrder) {
        const currentStatus = curOrder.status;
        const previousStatus = prevStatusRef.current;

        if (previousStatus !== currentStatus) {
          setLastReportedStatus(currentStatus);
          try {
            localStorage.setItem('cafeos_last_reported_status', currentStatus);
          } catch {}
          prevStatusRef.current = currentStatus;

          if (currentStatus === 'preparing') {
            playStatusChime('preparing');
            setStatusNotification(`☕ Kitchen Update: Chef is preparing your order (${curOrder.tokenNumber})!`);
          } else if (currentStatus === 'ready') {
            playStatusChime('ready');
            setStatusNotification(`🎉 In-App Toast: Order ${curOrder.tokenNumber} is now READY for pickup at ${curOrder.tableNumber || 'the counter'}!`);
          } else if (currentStatus === 'completed') {
            playStatusChime('completed');
            setStatusNotification(`✨ Order Complete: Order ${curOrder.tokenNumber} has been served.`);
          }

          if (onStatusChange) {
            onStatusChange(curOrder, previousStatus);
          }
        }
      }
    }
  }, [orders, activeRole, trackedOrderId, onStatusChange]);

  return {
    orders,
    setOrders,
    fetchOrders,
    statusNotification,
    setStatusNotification,
    trackedOrderId,
    lastReportedStatus,
  };
}
