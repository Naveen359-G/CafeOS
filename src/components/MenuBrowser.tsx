import React, { useState } from 'react';
import { Plus, Coffee, Sparkles, Filter, Box } from 'lucide-react';
import { CAFÉ_DRINKS, CAFÉ_SNACKS, MenuItem } from '../data/menu';
import { MenuItem3DViewer } from './MenuItem3DViewer';

interface MenuBrowserProps {
  onAddItem: (item: MenuItem) => void;
}

export const MenuBrowser: React.FC<MenuBrowserProps> = ({ onAddItem }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'coffee' | 'tea' | 'pastry' | 'savory'>('all');
  const [temperatureFilter, setTemperatureFilter] = useState<'all' | 'hot' | 'iced'>('all');
  const [selected3DItem, setSelected3DItem] = useState<MenuItem | null>(null);

  const allItems = [...CAFÉ_DRINKS, ...CAFÉ_SNACKS];

  const filteredItems = allItems.filter((item) => {
    // Category filter
    if (activeCategory === 'coffee' && item.type !== 'coffee') return false;
    if (activeCategory === 'tea' && item.type !== 'tea') return false;
    if (activeCategory === 'pastry' && item.type !== 'bakery') return false;
    if (activeCategory === 'savory' && item.type !== 'savory') return false;

    // Temperature filter
    if (temperatureFilter === 'hot' && item.temperature !== 'hot' && item.temperature !== 'both') return false;
    if (temperatureFilter === 'iced' && item.temperature !== 'iced' && item.temperature !== 'both') return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Menu Header */}
      <div className="bg-white rounded-2xl border border-[#E6DDD4] p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#261B16]">
              Artisanal Menu Catalog
            </h2>
            <p className="text-xs sm:text-sm text-[#6B5A50] mt-0.5">
              8 Calibrated Specialty Drinks · 6 Handcrafted Pastries & Savory Bites · Interactive 3D Ready
            </p>
          </div>
          <div className="text-xs text-[#8C7A70] flex items-center gap-2">
            <span>Specialty Batch</span>
            <span aria-hidden="true">·</span>
            <span>All Prices in INR (₹)</span>
          </div>
        </div>

        {/* Filter Controls (Interactive Buttons) */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#F0EAE1]">
          <span className="text-xs font-semibold text-[#574439] mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#C67D3E]" /> Filter:
          </span>
          {[
            { id: 'all', label: 'All Items (14)' },
            { id: 'coffee', label: 'Specialty Coffee (6)' },
            { id: 'tea', label: 'Artisan Tea (2)' },
            { id: 'pastry', label: 'Bakery & Sweets (3)' },
            { id: 'savory', label: 'Savory Sourdough (3)' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-[#261B16] text-white shadow-xs'
                  : 'bg-[#FAF6F0] text-[#6B5A50] hover:text-[#261B16] border border-[#E6DDD4]'
              }`}
            >
              {cat.label}
            </button>
          ))}

          {/* Temperature Subfilter */}
          <div className="ml-auto flex items-center gap-1 bg-[#FAF6F0] p-1 rounded-lg border border-[#E6DDD4]">
            {(['all', 'hot', 'iced'] as const).map((temp) => (
              <button
                key={temp}
                type="button"
                onClick={() => setTemperatureFilter(temp)}
                className={`px-2 py-0.5 text-[11px] font-medium rounded capitalize transition-all cursor-pointer ${
                  temperatureFilter === temp
                    ? 'bg-white text-[#261B16] shadow-xs'
                    : 'text-[#6B5A50] hover:text-[#261B16]'
                }`}
              >
                {temp === 'all' ? 'All Temp' : temp}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-[#E6DDD4] overflow-hidden flex flex-col justify-between hover:border-[#D5C6B7] transition-all shadow-xs group"
          >
            {item.imageUrl ? (
              <div className="relative h-44 w-full overflow-hidden bg-[#FAF6F0]">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <button
                  type="button"
                  onClick={() => setSelected3DItem(item)}
                  className="absolute top-3 right-3 bg-white/90 hover:bg-white text-[#261B16] px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm border border-[#E6DDD4] transition-all cursor-pointer"
                  title="View in 3D"
                >
                  <Box className="w-3.5 h-3.5 text-[#C67D3E]" />
                  <span>3D View</span>
                </button>
              </div>
            ) : (
              <div className="relative h-28 w-full bg-[#FAF6F0] p-4 flex flex-col justify-between border-b border-[#F0EAE1]">
                <div className="flex items-center justify-between text-xs text-[#8C7A70]">
                  <span className="capitalize">{item.category}</span>
                  <button
                    type="button"
                    onClick={() => setSelected3DItem(item)}
                    className="bg-white/90 hover:bg-white text-[#261B16] px-2 py-0.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 shadow-xs border border-[#E6DDD4] transition-all cursor-pointer"
                  >
                    <Box className="w-3 h-3 text-[#C67D3E]" />
                    <span>3D</span>
                  </button>
                </div>
                <div className="text-xs text-[#A86226] font-medium">
                  {item.vibeTag}
                </div>
              </div>
            )}

            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-base font-serif font-bold text-[#261B16]">
                    {item.name}
                  </h3>
                  <span className="text-sm font-bold text-[#261B16] tabular-nums whitespace-nowrap">
                    ₹{item.price}
                  </span>
                </div>

                <p className="text-xs text-[#6B5A50] leading-relaxed line-clamp-2">
                  {item.description}
                </p>

                {/* Clean unboxed metadata */}
                <div className="flex items-center gap-2 text-[11px] text-[#8C7A70] mt-2.5">
                  <span>{item.dietaryTags.slice(0, 2).join(' · ')}</span>
                  {item.caffeineLevel !== 'none' && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{item.caffeineLevel} Caffeine</span>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#F0EAE1] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelected3DItem(item)}
                  className="text-xs font-semibold text-[#A86226] hover:text-[#261B16] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Inspect 3D Layers</span>
                </button>
                <button
                  type="button"
                  onClick={() => onAddItem(item)}
                  className="px-3 py-1.5 bg-[#FAF6F0] hover:bg-[#261B16] text-[#261B16] hover:text-white border border-[#E0D5CB] hover:border-[#261B16] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add (₹{item.price})</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3D / AR Viewer Modal */}
      <MenuItem3DViewer
        item={selected3DItem}
        isOpen={Boolean(selected3DItem)}
        onClose={() => setSelected3DItem(null)}
        onAddToCart={(item) => {
          onAddItem(item);
        }}
      />
    </div>
  );
};
