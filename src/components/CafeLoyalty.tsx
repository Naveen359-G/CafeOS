import React, { useState } from 'react';
import { Award, Coffee, Gift, Check, Sparkles, Clock, Users, Laptop, Compass, Heart, QrCode, CalendarCheck2, ShieldCheck, MapPin } from 'lucide-react';
import { LoyaltyProfile, AchievementBadge } from '../types';

interface CafeLoyaltyProps {
  loyalty: LoyaltyProfile;
  badges: AchievementBadge[];
  onRedeemReward: () => void;
  hasRedeemedReward: boolean;
  customerName?: string;
  tableNumber?: string;
  onManualCheckIn?: () => void;
}

export const CafeLoyalty: React.FC<CafeLoyaltyProps> = ({
  loyalty,
  badges,
  onRedeemReward,
  hasRedeemedReward,
  customerName,
  tableNumber,
  onManualCheckIn,
}) => {
  const isRewardUnlocked = loyalty.stamps >= 8;
  const [justCheckedIn, setJustCheckedIn] = useState(false);

  const displayName = customerName && customerName.trim()
    ? customerName.trim()
    : loyalty.customerName && loyalty.customerName.trim()
    ? loyalty.customerName.trim()
    : 'Valued Guest';

  const customerId = loyalty.customerId || loyalty.membershipCode || 'CID-8492';

  const handleCheckInClick = () => {
    if (onManualCheckIn) {
      onManualCheckIn();
      setJustCheckedIn(true);
      setTimeout(() => setJustCheckedIn(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Digital Member Account Card (No physical card needed!) */}
      <div className="bg-gradient-to-br from-[#261B16] via-[#382820] to-[#261B16] text-[#FAF6F0] rounded-2xl p-5 sm:p-7 shadow-lg relative overflow-hidden border border-[#523E33]">
        {/* Decorative backdrop patterns */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#C67D3E]/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-36 h-36 bg-[#E6DDD4]/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest uppercase bg-[#C67D3E] text-white px-2 py-0.5 rounded-full">
                100% Digital Passport
              </span>
              <span className="text-xs text-[#C6B8AC]">
                No Physical Card Needed · Stored in Browser
              </span>
            </div>

            <div className="pt-1">
              <span className="text-xs text-[#D5C6B7] uppercase tracking-wider block">Individual Account Holder</span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight flex items-center gap-2">
                <span>{displayName}</span>
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[#E6DDD4]">
              <div className="flex items-center gap-1.5 bg-[#FAF6F0]/10 border border-white/15 px-2.5 py-1 rounded-lg">
                <QrCode className="w-3.5 h-3.5 text-[#C67D3E]" />
                <span>Account ID: <strong className="font-mono text-white">{customerId}</strong></span>
              </div>

              {tableNumber && tableNumber.trim() && (
                <div className="flex items-center gap-1.5 bg-[#FAF6F0]/10 border border-white/15 px-2.5 py-1 rounded-lg">
                  <MapPin className="w-3.5 h-3.5 text-[#C67D3E]" />
                  <span>Seated: <strong className="text-white">{tableNumber}</strong></span>
                </div>
              )}

              <div className="flex items-center gap-1.5 bg-[#FAF6F0]/10 border border-white/15 px-2.5 py-1 rounded-lg">
                <CalendarCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Total Visits: <strong className="text-white">{loyalty.totalVisits}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Check-In Action Button */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCheckInClick}
              className="w-full sm:w-auto px-5 py-3 bg-[#C67D3E] hover:bg-[#B46D32] active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <CalendarCheck2 className="w-4 h-4 text-white" />
              <span>{justCheckedIn ? '✓ Check-In Recorded!' : 'Mark Digital Visit Check-In (+1 Stamp)'}</span>
            </button>

            {loyalty.lastCheckIn && (
              <span className="text-[11px] text-[#C6B8AC]">
                Last check-in: {loyalty.lastCheckIn}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 8-Stamp Loyalty Card Grid */}
      <div className="bg-[#FAF6F0] rounded-2xl border border-[#C67D3E]/40 p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-serif font-bold text-[#261B16] flex items-center gap-2">
              <Gift className="w-5 h-5 text-[#C67D3E]" />
              <span>8-Stamp Digital Coffee Passport</span>
            </h3>
            <p className="text-xs text-[#6B5A50]">
              Automatically stamped on each visit check-in and order placement under Account ID <strong className="text-[#261B16]">{customerId}</strong>.
            </p>
          </div>

          <div className="text-xs font-semibold text-[#261B16]">
            Progress: <span className="tabular-nums text-[#C67D3E]">{loyalty.stamps} / 8 Stamps</span>
          </div>
        </div>

        {/* The 8 Stamp Slots */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 sm:gap-3 py-2">
          {Array.from({ length: 8 }).map((_, index) => {
            const isStamped = index < loyalty.stamps;
            const isRewardSlot = index === 7;

            return (
              <div
                key={index}
                className={`aspect-square rounded-2xl border flex flex-col items-center justify-center p-2 text-center transition-all ${
                  isStamped
                    ? 'bg-[#261B16] border-[#261B16] text-[#E6DDD4] shadow-xs'
                    : isRewardSlot
                    ? 'bg-white border-[#C67D3E] border-dashed text-[#C67D3E]'
                    : 'bg-white border-[#E6DDD4] text-[#C6B8AC]'
                }`}
              >
                {isStamped ? (
                  <div className="flex flex-col items-center">
                    <Coffee className="w-5 h-5 text-[#C67D3E] mb-1" />
                    <span className="text-[10px] font-bold text-white tabular-nums">#{index + 1}</span>
                  </div>
                ) : isRewardSlot ? (
                  <div className="flex flex-col items-center">
                    <Gift className="w-5 h-5 text-[#C67D3E] mb-1 animate-pulse" />
                    <span className="text-[10px] font-bold text-[#C67D3E]">FREE</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="w-2 h-2 rounded-full bg-[#E0D5CB] mb-1" />
                    <span className="text-[10px] font-medium text-[#8C7A70] tabular-nums">#{index + 1}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Reward Redemption Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#EAE2DA]">
          <div className="text-xs text-[#6B5A50]">
            {isRewardUnlocked ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-emerald-600 inline" /> You have completed 8 stamps! Claim your complimentary beverage now.
              </span>
            ) : (
              <span>{8 - loyalty.stamps} more qualifying check-ins until your free specialty beverage reward.</span>
            )}
          </div>

          <button
            type="button"
            onClick={onRedeemReward}
            disabled={!isRewardUnlocked || hasRedeemedReward}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap shadow-xs ${
              hasRedeemedReward
                ? 'bg-emerald-700 text-white opacity-90'
                : isRewardUnlocked
                ? 'bg-[#C67D3E] hover:bg-[#A86226] text-white active:scale-98'
                : 'bg-[#EAE2DA] text-[#8C7A70] cursor-not-allowed'
            }`}
          >
            {hasRedeemedReward ? (
              <>
                <Check className="w-4 h-4" />
                <span>Free Reward Active in Bag!</span>
              </>
            ) : (
              <>
                <Gift className="w-4 h-4" />
                <span>Redeem Free Drink Reward</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Digital Check-In & Stamp Activity History */}
      <div className="bg-white rounded-2xl border border-[#E6DDD4] p-4 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-serif font-bold text-[#261B16] flex items-center gap-2">
              <CalendarCheck2 className="w-5 h-5 text-[#C67D3E]" />
              <span>Digital Account Check-In History</span>
            </h3>
            <p className="text-xs text-[#6B5A50] mt-0.5">
              Verified digital check-ins and order rewards tied to account ID <strong className="text-[#261B16]">{customerId}</strong>.
            </p>
          </div>
          <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
            ✓ Browser Synced
          </span>
        </div>

        {loyalty.checkInHistory && loyalty.checkInHistory.length > 0 ? (
          <div className="space-y-2.5">
            {loyalty.checkInHistory.slice(0, 5).map((chk) => (
              <div
                key={chk.id}
                className="flex items-center justify-between p-3 bg-[#FAF6F0] rounded-xl border border-[#EAE2DA] text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#261B16] text-[#C67D3E] flex items-center justify-center shrink-0">
                    <Coffee className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-[#261B16] block">
                      {chk.type === 'order_placed'
                        ? `Order Placed (${chk.orderToken || 'Demo Order'})`
                        : 'Visit Check-In Marked'}
                    </span>
                    <span className="text-[11px] text-[#8C7A70]">
                      {chk.timestamp} {chk.tableNumber ? `· ${chk.tableNumber}` : ''}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-emerald-700 font-bold bg-[#EBF1EC] px-2 py-0.5 rounded text-[11px]">
                    +{chk.stampsAwarded} Stamp
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center bg-[#FAF6F0] rounded-xl border border-[#EAE2DA] text-xs text-[#8C7A70]">
            <span>No previous check-ins yet. Tap &quot;Mark Digital Visit Check-In&quot; or place an order to get your first stamp!</span>
          </div>
        )}
      </div>

      {/* Achievement Badges Grid */}
      <div className="bg-white rounded-2xl border border-[#E6DDD4] p-4 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-serif font-bold text-[#261B16] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#C67D3E]" />
              <span>Café Milestones & Achievement Badges</span>
            </h3>
            <p className="text-xs text-[#6B5A50] mt-0.5">
              Awarded through genuine demo sessions and tasting exploration.
            </p>
          </div>
          <span className="text-xs text-[#8C7A70] tabular-nums">
            {badges.filter((b) => b.earned).length} / {badges.length} Earned
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => {
            return (
              <div
                key={badge.id}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  badge.earned
                    ? 'bg-[#FAF6F0] border-[#C67D3E]/50 shadow-xs ring-1 ring-[#C67D3E]/20'
                    : 'bg-white border-[#E6DDD4] opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div
                      className={`p-2.5 rounded-xl ${
                        badge.earned ? 'bg-[#261B16] text-[#C67D3E]' : 'bg-[#FAF6F0] text-[#8C7A70]'
                      }`}
                    >
                      {badge.id === 'morning-regular' && <Clock className="w-5 h-5" />}
                      {badge.id === 'focus-master' && <Laptop className="w-5 h-5" />}
                      {badge.id === 'social-butterfly' && <Users className="w-5 h-5" />}
                      {badge.id === 'coffee-explorer' && <Compass className="w-5 h-5" />}
                      {badge.id === 'loyal-companion' && <Heart className="w-5 h-5" />}
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        badge.earned ? 'bg-[#EBF1EC] text-[#4E6B58]' : 'bg-[#FAF6F0] text-[#8C7A70]'
                      }`}
                    >
                      {badge.earned ? 'Earned ✓' : 'In Progress'}
                    </span>
                  </div>

                  <h4 className="text-sm font-serif font-bold text-[#261B16]">
                    {badge.title}
                  </h4>
                  <p className="text-xs text-[#6B5A50] mt-1 leading-relaxed">
                    {badge.description}
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-[#F0EAE1] flex items-center justify-between text-[11px] text-[#8C7A70]">
                  <span>Progress:</span>
                  <span className="font-semibold text-[#261B16] tabular-nums">{badge.progressText}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
