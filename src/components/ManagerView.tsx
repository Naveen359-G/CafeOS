import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  TrendingUp,
  Coffee,
  IndianRupee,
  Star,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Filter,
  X,
  Calendar,
  Sunrise,
  Sun,
  Moon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
} from 'recharts';
import { DemoOrder, CustomerFeedback, MenuItem } from '../types';

interface ManagerViewProps {
  orders: DemoOrder[];
  feedbacks: CustomerFeedback[];
  menuItems: MenuItem[];
  onAddMenuItem: (item: Partial<MenuItem>) => void;
  onUpdateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  onDeleteMenuItem: (id: string) => void;
  onRefreshData?: () => void;
}

export const ManagerView: React.FC<ManagerViewProps> = ({
  orders,
  feedbacks,
  menuItems,
  onAddMenuItem,
  onUpdateMenuItem,
  onDeleteMenuItem,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'analytics' | 'menu'>('analytics');
  const [insight, setInsight] = useState<{
    summary: string;
    actionableRecommendation: string;
    bottleneck?: string;
    customerTrend?: string;
    isAiGenerated: boolean;
  } | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  // Orders Filter state & Analytics Date Range filter state
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [analyticsDateRange, setAnalyticsDateRange] = useState<string>('all');

  // Modal for Adding / Editing Menu item
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState<{
    name: string;
    category: 'drink' | 'snack';
    price: number;
    description: string;
    type: 'coffee' | 'tea' | 'bakery' | 'savory';
    temperature: 'hot' | 'iced' | 'both';
    dietaryTags: string;
    imageUrl: string;
  }>({
    name: '',
    category: 'drink',
    price: 240,
    description: '',
    type: 'coffee',
    temperature: 'both',
    dietaryTags: 'Oat Milk, Dairy-Free',
    imageUrl: '',
  });

  // Filter orders by analytics date range
  const filteredAnalyticsOrders = orders.filter((o) => {
    if (analyticsDateRange === 'all') return true;
    const orderDate = new Date(o.createdAt);
    const now = new Date();
    if (analyticsDateRange === 'today') {
      return orderDate.toDateString() === now.toDateString();
    } else if (analyticsDateRange === 'last7days') {
      const diffTime = Math.abs(now.getTime() - orderDate.getTime());
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    } else {
      // Specific date string (YYYY-MM-DD)
      const orderDateStr = orderDate.toISOString().split('T')[0];
      return orderDateStr === analyticsDateRange;
    }
  });

  // KPI Calculations based on filtered analytics orders
  const totalOrders = filteredAnalyticsOrders.length;
  const activeOrders = filteredAnalyticsOrders.filter((o) => o.status !== 'completed');
  const completedOrders = filteredAnalyticsOrders.filter((o) => o.status === 'completed');
  const simulatedGross = filteredAnalyticsOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(simulatedGross / totalOrders) : 0;

  // Overdue count
  const nowTs = Date.now();
  const overdueCount = activeOrders.filter((o) => {
    const elapsedMinutes = (nowTs - o.createdAt) / (1000 * 60);
    return elapsedMinutes > (o.prepWarningThresholdMinutes || 2);
  }).length;

  // Average preparation time for completed orders (in minutes)
  const completedWithTimes = completedOrders.filter((o) => o.completedAt && o.createdAt);
  const avgPrepMins =
    completedWithTimes.length > 0
      ? (
          completedWithTimes.reduce((sum, o) => sum + (o.completedAt! - o.createdAt) / (1000 * 60), 0) /
          completedWithTimes.length
        ).toFixed(1)
      : '2.5';

  // Popular items overall in filtered orders
  const itemCountMap: Record<string, { count: number; category: string; revenue: number }> = {};
  filteredAnalyticsOrders.forEach((o) => {
    o.items.forEach((itemObj) => {
      const name = itemObj.item.name;
      if (!itemCountMap[name]) {
        itemCountMap[name] = { count: 0, category: itemObj.item.category, revenue: 0 };
      }
      itemCountMap[name].count += itemObj.quantity;
      itemCountMap[name].revenue += itemObj.item.price * itemObj.quantity;
    });
  });

  const topDrinks = Object.entries(itemCountMap)
    .filter(([_, data]) => data.category === 'drink')
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);

  const topSnacks = Object.entries(itemCountMap)
    .filter(([_, data]) => data.category === 'snack')
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);

  // Time-of-Day breakdown data for Recharts
  // Morning: 5 AM - 12 PM (hours 5-11)
  // Afternoon: 12 PM - 5 PM (hours 12-16)
  // Evening/Night: 5 PM - 4 AM (hours 17-23, 0-4)
  let morningOrdersCount = 0;
  let morningRevenue = 0;
  let afternoonOrdersCount = 0;
  let afternoonRevenue = 0;
  let eveningOrdersCount = 0;
  let eveningRevenue = 0;

  const morningItemMap: Record<string, number> = {};
  const afternoonItemMap: Record<string, number> = {};
  const eveningItemMap: Record<string, number> = {};

  filteredAnalyticsOrders.forEach((o) => {
    const hour = new Date(o.createdAt).getHours();
    o.items.forEach((itemObj) => {
      const name = itemObj.item.name;
      if (hour >= 5 && hour < 12) {
        morningOrdersCount += itemObj.quantity;
        morningRevenue += itemObj.item.price * itemObj.quantity;
        morningItemMap[name] = (morningItemMap[name] || 0) + itemObj.quantity;
      } else if (hour >= 12 && hour < 17) {
        afternoonOrdersCount += itemObj.quantity;
        afternoonRevenue += itemObj.item.price * itemObj.quantity;
        afternoonItemMap[name] = (afternoonItemMap[name] || 0) + itemObj.quantity;
      } else {
        eveningOrdersCount += itemObj.quantity;
        eveningRevenue += itemObj.item.price * itemObj.quantity;
        eveningItemMap[name] = (eveningItemMap[name] || 0) + itemObj.quantity;
      }
    });
  });

  // Recharts data for time-of-day sales volume & revenue
  const timeOfDayChartData = [
    { shift: 'Morning (5AM - 12PM)', orders: morningOrdersCount, revenue: morningRevenue },
    { shift: 'Afternoon (12PM - 5PM)', orders: afternoonOrdersCount, revenue: afternoonRevenue },
    { shift: 'Evening/Night (5PM - 4AM)', orders: eveningOrdersCount, revenue: eveningRevenue },
  ];

  // Top items by shift for comparison chart
  const topMorningItems = Object.entries(morningItemMap).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const topAfternoonItems = Object.entries(afternoonItemMap).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const topEveningItems = Object.entries(eveningItemMap).sort((a, b) => b[1] - a[1]).slice(0, 4);

  // Combine top items across shifts for a multi-bar chart
  const allTopItemNames = Array.from(
    new Set([
      ...topMorningItems.map(([name]) => name),
      ...topAfternoonItems.map(([name]) => name),
      ...topEveningItems.map(([name]) => name),
    ])
  ).slice(0, 6);

  const itemShiftComparisonData = allTopItemNames.map((itemName) => ({
    name: itemName,
    Morning: morningItemMap[itemName] || 0,
    Afternoon: afternoonItemMap[itemName] || 0,
    Evening: eveningItemMap[itemName] || 0,
  }));

  // Available unique dates for filtering
  const availableDates = Array.from(
    new Set(
      orders.map((o) => new Date(o.createdAt).toISOString().split('T')[0])
    )
  ).sort().reverse();

  // Filtered orders for Orders tab
  const filteredOrders = orders.filter((o) => {
    const orderDateStr = new Date(o.createdAt).toISOString().split('T')[0];
    const matchesDate = selectedDateFilter === 'all' || orderDateStr === selectedDateFilter;
    const matchesStatus = selectedStatusFilter === 'all' || o.status === selectedStatusFilter;
    return matchesDate && matchesStatus;
  });

  const avgRating =
    feedbacks.length > 0
      ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
      : '4.9';

  const repeatCustomerCount = orders.filter((o) => o.membershipCode).length;

  const handleFetchAiInsight = async () => {
    setIsLoadingInsight(true);
    try {
      const response = await fetch('/api/manager-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderCount: orders.length,
          averageRating: Number(avgRating),
          feedbacks,
          activeQueue: activeOrders.length,
        }),
      });
      const data = await response.json();
      setInsight(data);
    } catch (err) {
      console.error('Failed to fetch manager insight:', err);
      setInsight({
        summary: 'Floor metrics are balanced with steady queue throughput and positive feedback across cold brew and matcha drinks.',
        actionableRecommendation: 'Ensure Focus Corner charging strips and chilled oat milk supplies are pre-staged before the 2:30 PM deep work influx.',
        bottleneck: overdueCount > 0 ? `${overdueCount} orders taking longer than threshold` : 'Smooth flow',
        customerTrend: 'High afternoon preference for iced single-origin and vegan pastries.',
        isAiGenerated: false,
      });
    } finally {
      setIsLoadingInsight(false);
    }
  };

  const openAddItemModal = () => {
    setEditingItemId(null);
    setItemForm({
      name: '',
      category: 'drink',
      price: 240,
      description: '',
      type: 'coffee',
      temperature: 'both',
      dietaryTags: 'Vegetarian',
      imageUrl: '',
    });
    setIsEditingItem(true);
  };

  const openEditItemModal = (item: MenuItem) => {
    setEditingItemId(item.id);
    setItemForm({
      name: item.name,
      category: item.category,
      price: item.price,
      description: item.description,
      type: item.type,
      temperature: item.temperature,
      dietaryTags: item.dietaryTags.join(', '),
      imageUrl: item.imageUrl || '',
    });
    setIsEditingItem(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = itemForm.dietaryTags.split(',').map((t) => t.trim()).filter(Boolean);

    if (editingItemId) {
      onUpdateMenuItem(editingItemId, {
        name: itemForm.name,
        category: itemForm.category,
        price: Number(itemForm.price),
        description: itemForm.description,
        type: itemForm.type,
        temperature: itemForm.temperature,
        dietaryTags: tags,
        imageUrl: itemForm.imageUrl,
      });
    } else {
      onAddMenuItem({
        name: itemForm.name,
        category: itemForm.category,
        price: Number(itemForm.price),
        description: itemForm.description,
        type: itemForm.type,
        temperature: itemForm.temperature,
        dietaryTags: tags,
        imageUrl: itemForm.imageUrl,
        available: true,
      });
    }
    setIsEditingItem(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-navigation */}
      <div className="bg-white rounded-2xl border border-[#E6DDD4] p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold text-[#A86226] uppercase tracking-wider bg-[#F9F4EE] px-2 py-0.5 rounded border border-[#EAE2DA]">
                Manager Operations & Intelligence
              </span>
              <span className="text-[11px] text-[#8C7A70]">Synchronized Demo Platform</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#261B16]">
              CaféOS Shift Command & Analytics Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-[#6B5A50] mt-0.5">
              Live Recharts data visualization, date range filters, time-of-day demand analytics, and menu catalog management.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onRefreshData && (
              <button
                type="button"
                onClick={onRefreshData}
                className="px-3 py-2.5 bg-[#FAF6F0] hover:bg-[#F0EAE1] text-[#261B16] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-[#E6DDD4]"
                title="Refresh Orders & Data"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#C67D3E]" />
                <span>Sync</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleFetchAiInsight}
              disabled={isLoadingInsight}
              className="px-4 py-2.5 bg-[#261B16] hover:bg-[#3D2C25] active:scale-98 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm whitespace-nowrap"
            >
              {isLoadingInsight ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing Floor Pulse...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#C67D3E]" />
                  <span>Generate Gemini Shift Insight</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Manager Sub-tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-[#F0EAE1]">
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-[#261B16] text-white shadow-xs'
                : 'text-[#6B5A50] hover:text-[#261B16] bg-[#FAF6F0]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-[#C67D3E]" />
            <span>Analytics Dashboard & Charts</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#261B16] text-white shadow-xs'
                : 'text-[#6B5A50] hover:text-[#261B16] bg-[#FAF6F0]'
            }`}
          >
            Operations Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-[#261B16] text-white shadow-xs'
                : 'text-[#6B5A50] hover:text-[#261B16] bg-[#FAF6F0]'
            }`}
          >
            <span>Orders & Status Filter</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${activeTab === 'orders' ? 'bg-[#C67D3E] text-white' : 'bg-[#E6DDD4] text-[#261B16]'}`}>
              {orders.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('menu')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'menu'
                ? 'bg-[#261B16] text-white shadow-xs'
                : 'text-[#6B5A50] hover:text-[#261B16] bg-[#FAF6F0]'
            }`}
          >
            Menu Management ({menuItems.length})
          </button>
        </div>
      </div>

      {/* TAB 1: ANALYTICS DASHBOARD & CHARTS (RECHARTS) */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Analytics Header & Date Range Filter Toolbar */}
          <div className="bg-white rounded-2xl border border-[#E6DDD4] p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-serif font-bold text-[#261B16]">
                Sales & Time-of-Day Demand Intelligence
              </h3>
              <p className="text-xs text-[#6B5A50]">
                Visualize sales performance and item popularity across morning, afternoon, and evening shifts to optimize stock availability.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-[#FAF6F0] px-3 py-2 rounded-xl border border-[#E0D5CB]">
              <Calendar className="w-4 h-4 text-[#C67D3E]" />
              <span className="text-xs font-semibold text-[#8C7A70]">Date Range:</span>
              <select
                value={analyticsDateRange}
                onChange={(e) => setAnalyticsDateRange(e.target.value)}
                className="bg-transparent text-xs font-bold text-[#261B16] cursor-pointer outline-hidden"
              >
                <option value="all">All Time History ({orders.length} orders)</option>
                <option value="today">Today Only</option>
                <option value="last7days">Last 7 Days</option>
                {availableDates.map((d) => (
                  <option key={d} value={d}>
                    Date: {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white rounded-xl border border-[#E6DDD4] p-4 shadow-xs">
              <div className="flex items-center justify-between text-[#8C7A70] mb-1">
                <span className="text-xs font-semibold uppercase">Filtered Orders</span>
                <Coffee className="w-4 h-4 text-[#C67D3E]" />
              </div>
              <div className="text-2xl font-serif font-bold text-[#261B16] tabular-nums">
                {totalOrders}
              </div>
              <span className="text-[11px] text-[#8C7A70] mt-1 block">
                {completedOrders.length} completed
              </span>
            </div>

            <div className="bg-white rounded-xl border border-[#E6DDD4] p-4 shadow-xs">
              <div className="flex items-center justify-between text-[#8C7A70] mb-1">
                <span className="text-xs font-semibold uppercase">Filtered Revenue</span>
                <IndianRupee className="w-4 h-4 text-[#C67D3E]" />
              </div>
              <div className="text-2xl font-serif font-bold text-[#261B16] tabular-nums">
                ₹{simulatedGross}
              </div>
              <span className="text-[11px] text-[#8C7A70] mt-1 block">
                Avg Ticket: ₹{avgOrderValue}
              </span>
            </div>

            <div className="bg-white rounded-xl border border-[#E6DDD4] p-4 shadow-xs">
              <div className="flex items-center justify-between text-[#8C7A70] mb-1">
                <span className="text-xs font-semibold uppercase">Avg Prep Time</span>
                <Clock className="w-4 h-4 text-[#C67D3E]" />
              </div>
              <div className="text-2xl font-serif font-bold text-[#261B16] tabular-nums">
                {avgPrepMins}m
              </div>
              <span className="text-[11px] text-[#4E6B58] mt-1 block font-medium">
                Kitchen throughput optimal
              </span>
            </div>

            <div className="bg-white rounded-xl border border-[#E6DDD4] p-4 shadow-xs">
              <div className="flex items-center justify-between text-[#8C7A70] mb-1">
                <span className="text-xs font-semibold uppercase">Customer Rating</span>
                <Star className="w-4 h-4 text-[#C67D3E]" />
              </div>
              <div className="text-2xl font-serif font-bold text-[#261B16] tabular-nums">
                {avgRating} <span className="text-xs font-normal text-[#8C7A70]">/ 5.0</span>
              </div>
              <span className="text-[11px] text-[#4E6B58] mt-1 block font-medium">
                {repeatCustomerCount} VIP members
              </span>
            </div>
          </div>

          {/* Recharts Visualizations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Sales Volume & Revenue by Shift */}
            <div className="bg-white rounded-2xl border border-[#E6DDD4] p-4 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-serif font-bold text-[#261B16]">
                    Shift Volume & Revenue Distribution
                  </h4>
                  <p className="text-xs text-[#8C7A70]">Comparing order volume across operating time slots</p>
                </div>
                <TrendingUp className="w-4 h-4 text-[#C67D3E]" />
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeOfDayChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0EAE1" />
                    <XAxis dataKey="shift" tick={{ fontSize: 11, fill: '#6B5A50' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#6B5A50' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#261B16', borderRadius: '12px', color: '#fff', border: 'none' }}
                      formatter={(value: any, name: any) => [
                        name === 'revenue' ? `₹${value}` : `${value} units`,
                        name === 'revenue' ? 'Revenue' : 'Order Count',
                      ]}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="orders" name="Orders" fill="#C67D3E" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="revenue" name="Revenue (₹)" fill="#261B16" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Top Selling Items Categorized by Time-of-Day Shift */}
            <div className="bg-white rounded-2xl border border-[#E6DDD4] p-4 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-serif font-bold text-[#261B16]">
                    Item Popularity Across Shifts (Morning vs Afternoon vs Evening)
                  </h4>
                  <p className="text-xs text-[#8C7A70]">Most sold items categorized by consumption time</p>
                </div>
                <Coffee className="w-4 h-4 text-[#C67D3E]" />
              </div>

              <div className="h-72 w-full pt-2">
                {itemShiftComparisonData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-[#8C7A70]">
                    No order items available for selected filter.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={itemShiftComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0EAE1" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6B5A50' }} interval={0} angle={-15} textAnchor="end" />
                      <YAxis tick={{ fontSize: 11, fill: '#6B5A50' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#261B16', borderRadius: '12px', color: '#fff', border: 'none' }} />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                      <Bar dataKey="Morning" fill="#D97706" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Afternoon" fill="#F97316" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Evening" fill="#4338CA" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Shift Details & Availability Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Morning Shift */}
            <div className="bg-white rounded-2xl border border-[#E6DDD4] p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[#F0EAE1]">
                <Sunrise className="w-5 h-5 text-amber-600" />
                <div>
                  <h4 className="text-xs font-serif font-bold text-[#261B16]">Morning Peak (5AM - 12PM)</h4>
                  <span className="text-[11px] text-[#8C7A70]">{morningOrdersCount} units sold</span>
                </div>
              </div>
              <div className="space-y-1.5">
                {topMorningItems.length === 0 ? (
                  <p className="text-xs text-[#8C7A70] italic">No sales recorded.</p>
                ) : (
                  topMorningItems.map(([name, count], i) => (
                    <div key={i} className="flex justify-between text-xs p-2 bg-[#FAF6F0] rounded-lg">
                      <span className="font-semibold text-[#261B16]">{name}</span>
                      <span className="text-[#A86226] font-bold">{count} sold</span>
                    </div>
                  ))
                )}
              </div>
              <p className="text-[11px] text-[#574439] bg-[#FAF6F0] p-2.5 rounded-lg border border-[#EAE2DA]">
                <span className="font-bold">Recommendation:</span> Pre-grind espresso beans and stage croissants by 7:00 AM.
              </p>
            </div>

            {/* Afternoon Shift */}
            <div className="bg-white rounded-2xl border border-[#E6DDD4] p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[#F0EAE1]">
                <Sun className="w-5 h-5 text-orange-500" />
                <div>
                  <h4 className="text-xs font-serif font-bold text-[#261B16]">Afternoon Peak (12PM - 5PM)</h4>
                  <span className="text-[11px] text-[#8C7A70]">{afternoonOrdersCount} units sold</span>
                </div>
              </div>
              <div className="space-y-1.5">
                {topAfternoonItems.length === 0 ? (
                  <p className="text-xs text-[#8C7A70] italic">No sales recorded.</p>
                ) : (
                  topAfternoonItems.map(([name, count], i) => (
                    <div key={i} className="flex justify-between text-xs p-2 bg-[#FAF6F0] rounded-lg">
                      <span className="font-semibold text-[#261B16]">{name}</span>
                      <span className="text-[#A86226] font-bold">{count} sold</span>
                    </div>
                  ))
                )}
              </div>
              <p className="text-[11px] text-[#574439] bg-[#FAF6F0] p-2.5 rounded-lg border border-[#EAE2DA]">
                <span className="font-bold">Recommendation:</span> Keep nitro cold brew kegs chilled and verify power strips for deep work zones.
              </p>
            </div>

            {/* Evening / Night Shift */}
            <div className="bg-white rounded-2xl border border-[#E6DDD4] p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[#F0EAE1]">
                <Moon className="w-5 h-5 text-indigo-600" />
                <div>
                  <h4 className="text-xs font-serif font-bold text-[#261B16]">Evening/Night Peak (5PM - 4AM)</h4>
                  <span className="text-[11px] text-[#8C7A70]">{eveningOrdersCount} units sold</span>
                </div>
              </div>
              <div className="space-y-1.5">
                {topEveningItems.length === 0 ? (
                  <p className="text-xs text-[#8C7A70] italic">No sales recorded.</p>
                ) : (
                  topEveningItems.map(([name, count], i) => (
                    <div key={i} className="flex justify-between text-xs p-2 bg-[#FAF6F0] rounded-lg">
                      <span className="font-semibold text-[#261B16]">{name}</span>
                      <span className="text-[#A86226] font-bold">{count} sold</span>
                    </div>
                  ))
                )}
              </div>
              <p className="text-[11px] text-[#574439] bg-[#FAF6F0] p-2.5 rounded-lg border border-[#EAE2DA]">
                <span className="font-bold">Recommendation:</span> Stock calming chamomile teas and dark chocolate pastries for lounge relaxation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OPERATIONS OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Cards (Grid) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white rounded-xl border border-[#E6DDD4] p-4 shadow-xs">
              <div className="flex items-center justify-between text-[#8C7A70] mb-1">
                <span className="text-xs font-semibold uppercase">Total Orders</span>
                <Coffee className="w-4 h-4 text-[#C67D3E]" />
              </div>
              <div className="text-2xl font-serif font-bold text-[#261B16] tabular-nums">
                {totalOrders}
              </div>
              <span className="text-[11px] text-[#8C7A70] mt-1 block">
                {activeOrders.length} active · {completedOrders.length} delivered
              </span>
            </div>

            <div className="bg-white rounded-xl border border-[#E6DDD4] p-4 shadow-xs">
              <div className="flex items-center justify-between text-[#8C7A70] mb-1">
                <span className="text-xs font-semibold uppercase">Simulated Gross</span>
                <IndianRupee className="w-4 h-4 text-[#C67D3E]" />
              </div>
              <div className="text-2xl font-serif font-bold text-[#261B16] tabular-nums">
                ₹{simulatedGross}
              </div>
              <span className="text-[11px] text-[#8C7A70] mt-1 block">
                Avg Ticket: ₹{avgOrderValue}
              </span>
            </div>

            <div className="bg-white rounded-xl border border-[#E6DDD4] p-4 shadow-xs">
              <div className="flex items-center justify-between text-[#8C7A70] mb-1">
                <span className="text-xs font-semibold uppercase">Avg Prep Time</span>
                <Clock className="w-4 h-4 text-[#C67D3E]" />
              </div>
              <div className="text-2xl font-serif font-bold text-[#261B16] tabular-nums">
                {avgPrepMins}m
              </div>
              <span className={`text-[11px] mt-1 block font-medium ${overdueOrdersCountText(overdueCount)}`}>
                {overdueCount > 0 ? `${overdueCount} orders overdue` : 'On schedule'}
              </span>
            </div>

            <div className="bg-white rounded-xl border border-[#E6DDD4] p-4 shadow-xs">
              <div className="flex items-center justify-between text-[#8C7A70] mb-1">
                <span className="text-xs font-semibold uppercase">Customer Rating</span>
                <Star className="w-4 h-4 text-[#C67D3E]" />
              </div>
              <div className="text-2xl font-serif font-bold text-[#261B16] tabular-nums">
                {avgRating} <span className="text-xs font-normal text-[#8C7A70]">/ 5.0</span>
              </div>
              <span className="text-[11px] text-[#4E6B58] mt-1 block font-medium">
                {repeatCustomerCount} recognized members
              </span>
            </div>
          </div>

          {/* Gemini AI Operational Insight Box */}
          {insight && (
            <div className="bg-[#FAF6F0] rounded-2xl border border-[#C67D3E]/40 p-4 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-[#A86226] text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#C67D3E]" />
                <span>
                  {insight.isAiGenerated ? 'Gemini 3.8 Flash Operational Directive' : 'Barista Lead Operating Directive'}
                </span>
              </div>

              <div>
                <h3 className="text-base font-serif font-bold text-[#261B16] mb-1">
                  Floor Shift Executive Summary
                </h3>
                <p className="text-xs sm:text-sm text-[#574439] leading-relaxed">
                  {insight.summary}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-[#EAE2DA]">
                  <span className="text-xs font-bold text-[#261B16] block mb-1">
                    💡 Actionable Operational Recommendation:
                  </span>
                  <p className="text-xs text-[#574439] leading-relaxed">
                    {insight.actionableRecommendation}
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-[#EAE2DA]">
                  <span className="text-xs font-bold text-[#261B16] block mb-1">
                    🔍 Observed Trends & Flow:
                  </span>
                  <p className="text-xs text-[#574439] leading-relaxed">
                    {insight.customerTrend || 'High afternoon preference for iced single-origin and vegan pastries.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Popular Items Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-[#E6DDD4] p-4 shadow-xs">
              <h4 className="text-sm font-serif font-bold text-[#261B16] mb-3 flex items-center justify-between">
                <span>Top Selling Specialty Drinks</span>
                <Coffee className="w-4 h-4 text-[#C67D3E]" />
              </h4>
              <div className="space-y-2">
                {topDrinks.length === 0 ? (
                  <p className="text-xs text-[#8C7A70]">No beverage orders placed yet.</p>
                ) : (
                  topDrinks.map(([name, data], i) => (
                    <div key={i} className="flex items-center justify-between text-xs p-2 bg-[#FAF6F0] rounded-lg">
                      <span className="font-semibold text-[#261B16]">{name}</span>
                      <span className="text-[#A86226] font-bold tabular-nums">{data.count} ordered (₹{data.revenue})</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E6DDD4] p-4 shadow-xs">
              <h4 className="text-sm font-serif font-bold text-[#261B16] mb-3 flex items-center justify-between">
                <span>Top Selling Artisanal Snacks</span>
                <TrendingUp className="w-4 h-4 text-[#C67D3E]" />
              </h4>
              <div className="space-y-2">
                {topSnacks.length === 0 ? (
                  <p className="text-xs text-[#8C7A70]">No snack orders placed yet.</p>
                ) : (
                  topSnacks.map(([name, data], i) => (
                    <div key={i} className="flex items-center justify-between text-xs p-2 bg-[#FAF6F0] rounded-lg">
                      <span className="font-semibold text-[#261B16]">{name}</span>
                      <span className="text-[#A86226] font-bold tabular-nums">{data.count} ordered (₹{data.revenue})</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SEPARATE ORDERS STATUS & DATE-WISE FILTER */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-[#E6DDD4] p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0EAE1]">
            <div>
              <h3 className="text-lg font-serif font-bold text-[#261B16]">
                Orders Status & Date-Wise Audit Log
              </h3>
              <p className="text-xs text-[#6B5A50]">
                Filter customer orders by specific dates and real-time status to audit floor activity and kitchen throughput.
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-[#FAF6F0] px-3 py-1.5 rounded-xl border border-[#E0D5CB]">
                <Calendar className="w-3.5 h-3.5 text-[#C67D3E]" />
                <span className="text-xs text-[#8C7A70]">Date:</span>
                <select
                  value={selectedDateFilter}
                  onChange={(e) => setSelectedDateFilter(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-[#261B16] cursor-pointer outline-hidden"
                >
                  <option value="all">All Dates ({orders.length})</option>
                  {availableDates.map((dateStr) => (
                    <option key={dateStr} value={dateStr}>
                      {dateStr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-[#FAF6F0] px-3 py-1.5 rounded-xl border border-[#E0D5CB]">
                <Filter className="w-3.5 h-3.5 text-[#C67D3E]" />
                <span className="text-xs text-[#8C7A70]">Status:</span>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-[#261B16] cursor-pointer outline-hidden capitalize"
                >
                  <option value="all">All Statuses</option>
                  <option value="new">New</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EAE2DA] text-[#8C7A70] font-semibold">
                  <th className="py-2.5 px-3">Token</th>
                  <th className="py-2.5 px-3">Customer & Member ID</th>
                  <th className="py-2.5 px-3">Zone / Table</th>
                  <th className="py-2.5 px-3">Items Ordered</th>
                  <th className="py-2.5 px-3">Total (₹)</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Timestamp / Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EAE1]">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#8C7A70]">
                      No orders match the selected date or status filter.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-[#FAF6F0]/60">
                      <td className="py-3 px-3 font-bold text-[#261B16] tabular-nums">
                        {o.tokenNumber}
                      </td>
                      <td className="py-3 px-3 text-[#574439]">
                        <span className="font-semibold block">{o.customerName}</span>
                        {o.membershipCode && (
                          <span className="text-[10px] text-[#A86226] font-mono">{o.membershipCode}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-[#574439]">
                        {o.tableNumber ? `Table ${o.tableNumber}` : o.zone}
                      </td>
                      <td className="py-3 px-3 text-[#6B5A50] max-w-xs">
                        {o.items.map((i) => `${i.quantity}x ${i.item.name}`).join(', ')}
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#261B16] tabular-nums">
                        ₹{o.totalAmount}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            o.status === 'completed'
                              ? 'bg-zinc-100 text-zinc-700'
                              : o.status === 'ready'
                              ? 'bg-blue-100 text-blue-800'
                              : o.status === 'preparing'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[#8C7A70] tabular-nums">
                        <div>{new Date(o.createdAt).toLocaleDateString()}</div>
                        <div className="text-[10px]">{new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: MENU MANAGEMENT */}
      {activeTab === 'menu' && (
        <div className="bg-white rounded-2xl border border-[#E6DDD4] p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-serif font-bold text-[#261B16]">
                Live Menu Catalog Management
              </h3>
              <p className="text-xs text-[#6B5A50]">
                Add, edit prices, update descriptions, and toggle item availability in real-time. Changes dynamically feed the AI Barista recommendation catalog.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddItemModal}
              className="px-4 py-2 bg-[#261B16] hover:bg-[#3D2C25] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4 text-[#C67D3E]" />
              <span>Add New Menu Item</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EAE2DA] text-[#8C7A70] font-semibold">
                  <th className="py-2.5 px-3">Item Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Price (₹)</th>
                  <th className="py-2.5 px-3">Dietary / Notes</th>
                  <th className="py-2.5 px-3">Availability</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EAE1]">
                {menuItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAF6F0]/60">
                    <td className="py-2.5 px-3 font-bold text-[#261B16]">
                      {item.name}
                    </td>
                    <td className="py-2.5 px-3 capitalize text-[#6B5A50]">
                      {item.category} ({item.type})
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-[#261B16] tabular-nums">
                      ₹{item.price}
                    </td>
                    <td className="py-2.5 px-3 text-[#8C7A70]">
                      {item.dietaryTags.join(', ')}
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateMenuItem(item.id, { available: item.available === false ? true : false })
                        }
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer ${
                          item.available !== false
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.available !== false ? 'In Stock ✓' : 'Sold Out ✕'}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => openEditItemModal(item)}
                        className="p-1 text-[#6B5A50] hover:text-[#261B16] cursor-pointer"
                        title="Edit Item"
                      >
                        <Edit2 className="w-3.5 h-3.5 inline" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteMenuItem(item.id)}
                        className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Menu Item Modal */}
      {isEditingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#261B16]/60 backdrop-blur-xs" onClick={() => setIsEditingItem(false)} />

          <div className="relative w-full max-w-md bg-white rounded-2xl border border-[#E6DDD4] shadow-2xl p-6 z-10 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0EAE1]">
              <h4 className="text-base font-serif font-bold text-[#261B16]">
                {editingItemId ? 'Edit Menu Item' : 'Add New Specialty Item'}
              </h4>
              <button
                type="button"
                onClick={() => setIsEditingItem(false)}
                className="p-1 text-[#6B5A50] hover:text-[#261B16] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#574439] uppercase mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E0D5CB] rounded-lg text-sm text-[#261B16]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#574439] uppercase mb-1">Category</label>
                  <select
                    value={itemForm.category}
                    onChange={(e) => setItemForm({ ...itemForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E0D5CB] rounded-lg text-sm text-[#261B16]"
                  >
                    <option value="drink">Specialty Drink</option>
                    <option value="snack">Artisanal Snack</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#574439] uppercase mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E0D5CB] rounded-lg text-sm text-[#261B16]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#574439] uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E0D5CB] rounded-lg text-sm text-[#261B16]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#574439] uppercase mb-1">Dietary Tags (comma separated)</label>
                <input
                  type="text"
                  value={itemForm.dietaryTags}
                  onChange={(e) => setItemForm({ ...itemForm, dietaryTags: e.target.value })}
                  placeholder="e.g. Vegan, Gluten-Free, Oat Milk"
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E0D5CB] rounded-lg text-sm text-[#261B16]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingItem(false)}
                  className="px-4 py-2 border border-[#E6DDD4] text-[#6B5A50] rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#261B16] text-white rounded-lg font-bold cursor-pointer"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

function overdueOrdersCountText(count: number) {
  if (count > 0) return 'text-red-600';
  return 'text-[#4E6B58]';
}
