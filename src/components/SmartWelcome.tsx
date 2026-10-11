import React from 'react';
import { Laptop, Users, Coffee, Sparkles, MapPin } from 'lucide-react';
import { VisitIntent } from '../types';

interface SmartWelcomeProps {
  intent: VisitIntent;
  setIntent: (intent: VisitIntent) => void;
  userName: string;
  setUserName: (name: string) => void;
  tableNumber: string;
  setTableNumber: (table: string) => void;
  onProceed: () => void;
}

export const SmartWelcome: React.FC<SmartWelcomeProps> = ({
  intent,
  setIntent,
  userName,
  setUserName,
  tableNumber,
  setTableNumber,
  onProceed,
}) => {
  // Contextual time-based greeting calculation
  const getContextualGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return {
        greeting: 'Good morning',
        vibeMessage: 'Fresh single-origin batches are calibrated. What brings you in this morning?',
        tag: 'Morning Roast Calibration',
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        greeting: 'Good afternoon',
        vibeMessage: 'Afternoon productivity and cold brew flow are in full gear. What brings you in today?',
        tag: 'Afternoon Peak Rhythm',
      };
    } else {
      return {
        greeting: 'Good evening',
        vibeMessage: 'Warm lamps are lit and the playlist is mellowing down. How would you like to spend your time?',
        tag: 'Evening Golden Hour',
      };
    }
  };

  const { greeting, vibeMessage, tag } = getContextualGreeting();

  const intentOptions = [
    {
      id: 'deep_work' as VisitIntent,
      title: 'Deep Work',
      subtitle: 'Solo focus, zero distraction & high-clarity caffeine',
      zoneSuggestion: 'Focus Corner',
      icon: Laptop,
    },
    {
      id: 'meeting' as VisitIntent,
      title: 'Meeting',
      subtitle: 'Collaborative energy, communal table & shareable bites',
      zoneSuggestion: 'Social Table',
      icon: Users,
    },
    {
      id: 'unwind' as VisitIntent,
      title: 'Unwind',
      subtitle: 'Slow breathing, plush seating & restorative comfort drinks',
      zoneSuggestion: 'Cozy Lounge',
      icon: Coffee,
    },
    {
      id: 'surprise_me' as VisitIntent,
      title: 'Surprise Me',
      subtitle: 'Barista signature pairings & unexpected flavor journey',
      zoneSuggestion: 'Barista Tasting Bench',
      icon: Sparkles,
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-2xl bg-white border border-[#E6DDD4] shadow-xs">
      {/* Visual Ambiance Hero Strip */}
      <div className="relative h-48 sm:h-64 w-full overflow-hidden bg-[#261B16]">
        <img
          src="/src/assets/images/hero_cafe_ambiance_1791712878821.jpg"
          alt="Warm boutique artisanal café atmosphere"
          className="w-full h-full object-cover object-center opacity-85"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#261B16] via-[#261B16]/40 to-transparent" />
        <div className="absolute bottom-4 left-4 sm:left-6 right-4 sm:right-6 text-white">
          <div className="flex items-center gap-2 text-xs text-[#E6DDD4]/90 mb-1">
            <span>Specialty Coffee Lab</span>
            <span aria-hidden="true">·</span>
            <span>{tag}</span>
            <span aria-hidden="true">·</span>
            <span>Est. 2024</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            {greeting}{userName ? `, ${userName}` : ''}
          </h1>
          <p className="text-xs sm:text-sm text-[#E6DDD4] max-w-xl mt-0.5 line-clamp-2">
            {vibeMessage}
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-6 sm:pb-8">
        {/* Guest Details Input Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label htmlFor="customer-name" className="block text-xs font-semibold text-[#574439] uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Your Name <span className="text-[#8C7A70] font-normal">(Optional)</span></span>
              {userName && userName.trim() && (
                <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                  ✓ Saved to Profile
                </span>
              )}
            </label>
            <input
              id="customer-name"
              type="text"
              placeholder="e.g. Alex"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-[#FAF6F0] border border-[#E0D5CB] rounded-lg text-[#261B16] placeholder-[#9E8D82] focus:outline-none focus:ring-2 focus:ring-[#C67D3E]/30 focus:border-[#C67D3E] transition-all"
            />
          </div>
          <div>
            <label htmlFor="table-number" className="block text-xs font-semibold text-[#574439] uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Table / Booking # <span className="text-[#8C7A70] font-normal">(Optional)</span></span>
              {tableNumber && tableNumber.trim() ? (
                <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                  ✓ Table Saved
                </span>
              ) : (
                <span className="text-[11px] text-[#A86226] font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3 inline" /> Seated?
                </span>
              )}
            </label>
            <input
              id="table-number"
              type="text"
              placeholder="e.g. Table 4 or Leave empty"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-[#FAF6F0] border border-[#E0D5CB] rounded-lg text-[#261B16] placeholder-[#9E8D82] focus:outline-none focus:ring-2 focus:ring-[#C67D3E]/30 focus:border-[#C67D3E] transition-all"
            />
          </div>
        </div>

        {/* Live sync reassurance badge */}
        {(userName.trim() || tableNumber.trim()) && (
          <div className="mb-5 px-3 py-1.5 bg-[#FAF6F0] rounded-lg border border-[#E6DDD4] text-[11px] text-[#6B5A50] flex items-center justify-between">
            <span className="truncate">
              Profile: <strong className="text-[#261B16]">{userName.trim() || 'Guest'}</strong>
              {tableNumber.trim() && (
                <> · Table: <strong className="text-[#261B16]">{tableNumber.trim()}</strong></>
              )}
            </span>
            <span className="text-emerald-700 font-medium shrink-0 ml-2">
              ✓ Carried into Bag & Order Checkout
            </span>
          </div>
        )}

        {/* Intent Question */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base sm:text-lg font-serif font-bold text-[#261B16]">
              What brings you in today?
            </h2>
            <span className="text-xs text-[#8C7A70]">Intent-aware pairing</span>
          </div>
          <p className="text-xs text-[#6B5A50] mb-4">
            Select your mode. Our Barista AI matches your beverage, food pairing, and ideal café seating zone.
          </p>

          {/* 4 Intent Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {intentOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = intent === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setIntent(opt.id)}
                  className={`text-left p-4 rounded-xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-[#F9F4EE] border-[#C67D3E] shadow-sm ring-1 ring-[#C67D3E]'
                      : 'bg-white border-[#E6DDD4] hover:border-[#D5C6B7] hover:bg-[#FAF6F0]/60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2.5 rounded-lg shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#C67D3E] text-white'
                          : 'bg-[#F4EFEA] text-[#574439]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[#261B16]">
                          {opt.title}
                        </span>
                        {isSelected && (
                          <span className="text-[11px] font-semibold text-[#A86226] bg-[#F3E5D8] px-2 py-0.5 rounded-sm">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#6B5A50] mt-1 leading-relaxed">
                        {opt.subtitle}
                      </p>
                      <div className="mt-2 text-[11px] text-[#8C7A70]">
                        <span>Suggested zone: </span>
                        <span className="font-medium text-[#261B16]">{opt.zoneSuggestion}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* CTA to customize preferences */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#F0EAE1]">
          <div className="text-xs text-[#6B5A50] text-center sm:text-left">
            <span>Next: Taste preferences, dietary options & budget</span>
          </div>
          <button
            type="button"
            onClick={onProceed}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#261B16] hover:bg-[#3D2C25] active:scale-98 text-white text-sm font-semibold rounded-lg transition-all shadow-sm cursor-pointer whitespace-nowrap"
          >
            Customize Preferences →
          </button>
        </div>
      </div>
    </section>
  );
};
