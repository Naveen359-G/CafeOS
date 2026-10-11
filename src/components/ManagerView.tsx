import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  TrendingUp,
  Users,
  Coffee,
  IndianRupee,
  Star,
  Clock,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  Filter,
  X,
} from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'history'>('overview');
  const [insight, setInsight] = useState<{
    summary: string;
    actionableRecommendation: string;
    bottleneck?: string;
    customerTrend?: string;
    isAiGenerated: boolean;
  } | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

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

  // KPI Calculations based on real demo orders
  const totalOrders = orders.length;
  const activeOrders = orders.filter((o) => o.status !== 'completed');
  const completedOrders = orders.filter((o) => o.status === 'completed');
  const simulatedGross = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(simulatedGross / totalOrders) : 0;

  // Overdue count
  const now = Date.now();
  const overdueCount = activeOrders.filter((o) => {
    const elapsedMinutes = (now - o.createdAt) / (1000 * 60);
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

  // Popular items
  const itemCountMap: Record<string, { count: number; category: string }> = {};
  orders.forEach((o) => {
    o.items.forEach((itemObj) => {
      const name = itemObj.item.name;
      if (!itemCountMap[name]) {
        itemCountMap[name] = { count: 0, category: itemObj.item.category };
      }
      itemCountMap[name].count += itemObj.quantity;
    });
  });

  const topDrinks = Object.entries(itemCountMap)
    .filter(([_, data]) => data.category === 'drink')
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3);

  const topSnacks = Object.entries(itemCountMap)
    .filter(([_, data]) => data.category === 'snack')
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3);

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
              CaféOS Shift Command
            </h2>
            <p className="text-xs sm:text-sm text-[#6B5A50] mt-0.5">
              Live shift analytics, order history, menu management, and Gemini operational directives.
            </p>
          </div>

          <div className="flex items-center gap-2">
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
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-[#F0EAE1]">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#261B16] text-white shadow-xs'
                : 'text-[#6B5A50] hover:text-[#261B16] bg-[#FAF6F0]'
            }`}
          >
            Operations Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('menu')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'menu'
                ? 'bg-[#261B16] text-white shadow-xs'
                : 'text-[#6B5A50] hover:text-[#261B16] bg-[#FAF6F0]'
            }`}
          >
            Menu Management ({menuItems.length} items)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#261B16] text-white shadow-xs'
                : 'text-[#6B5A50] hover:text-[#261B16] bg-[#FAF6F0]'
            }`}
          >
            Full Order History ({orders.length})
          </button>
        </div>
      </div>

      {/* TAB 1: OPERATIONS OVERVIEW */}
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
                    {insight.customerTrend || 'Steady demand for espresso and light pastries.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Popular Items & Floor Velocity */}
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
                      <span className="text-[#A86226] font-bold tabular-nums">{data.count} ordered</span>
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
                      <span className="text-[#A86226] font-bold tabular-nums">{data.count} ordered</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MENU MANAGEMENT */}
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
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
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

      {/* TAB 3: FULL ORDER HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-[#E6DDD4] p-4 sm:p-6 shadow-xs space-y-4">
          <h3 className="text-base font-serif font-bold text-[#261B16]">
            Complete Orders Audit Log
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EAE2DA] text-[#8C7A70] font-semibold">
                  <th className="py-2.5 px-3">Token</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Items Ordered</th>
                  <th className="py-2.5 px-3">Total</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EAE1]">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#FAF6F0]/60">
                    <td className="py-2.5 px-3 font-bold text-[#261B16] tabular-nums">
                      {o.tokenNumber}
                    </td>
                    <td className="py-2.5 px-3 text-[#574439]">
                      {o.customerName}
                      {o.membershipCode && (
                        <span className="text-[10px] text-[#A86226] block">{o.membershipCode}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-[#574439]">
                      {o.tableNumber ? `${o.tableNumber}` : o.zone}
                    </td>
                    <td className="py-2.5 px-3 text-[#6B5A50]">
                      {o.items.map((i) => `${i.quantity}x ${i.item.name}`).join(', ')}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-[#261B16] tabular-nums">
                      ₹{o.totalAmount}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
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
                    <td className="py-2.5 px-3 text-[#8C7A70] tabular-nums">
                      {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
