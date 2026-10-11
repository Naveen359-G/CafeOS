import React from 'react';
import { Clock, Plus, Check, Music, MapPin, Sparkles, AlertCircle } from 'lucide-react';
import { RecommendationResult, MenuItem } from '../types';
import { SEATING_ZONES } from '../data/menu';

interface RecommendationCardProps {
  recommendation: RecommendationResult;
  onAddPairing: (drink: MenuItem, snack: MenuItem) => void;
  onAddSingleItem: (item: MenuItem) => void;
  addedPairing: boolean;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onAddPairing,
  onAddSingleItem,
  addedPairing,
}) => {
  const zone = SEATING_ZONES[recommendation.suggestedZone] || SEATING_ZONES['Focus Corner'];

  return (
    <div className="bg-white rounded-2xl border border-[#E6DDD4] overflow-hidden shadow-xs">
      {/* Top Banner: AI Model / Status Indicator */}
      <div className="bg-[#FAF6F0] px-4 sm:px-6 py-3 border-b border-[#EAE2DA] flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-xs text-[#574439]">
          <Sparkles className="w-4 h-4 text-[#C67D3E]" />
          <span className="font-semibold text-[#261B16]">
            {recommendation.isAiGenerated ? 'Gemini 3.8 Flash Match' : 'Curated Barista Reserve'}
          </span>
          <span aria-hidden="true" className="text-[#C6B8AC]">·</span>
          <span className="text-[#8C7A70]">Intent-Aware Recommendation</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#574439]">
          <Clock className="w-3.5 h-3.5 text-[#C67D3E]" />
          <span className="font-medium">DEMO Prep Time:</span>
          <span className="font-bold text-[#261B16] tabular-nums">
            ~{recommendation.demoQueueEstimateMinutes} mins
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Personalized Intent Fit Header */}
        <div>
          <h3 className="text-lg sm:text-xl font-serif font-bold text-[#261B16]">
            {recommendation.greeting}
          </h3>
          <p className="text-sm text-[#574439] mt-1 leading-relaxed">
            {recommendation.intentFitExplanation}
          </p>
        </div>

        {/* Pairing Display (Drink + Snack Grid) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8C7A70]">
              The Recommended Flavor Pairing
            </span>
            <span className="text-xs text-[#574439] tabular-nums">
              Combo Total: <strong className="text-[#261B16] font-bold">₹{recommendation.totalEstimatedPrice}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Drink Card */}
            <div className="bg-[#FAF6F0] rounded-xl border border-[#EAE2DA] p-4 flex flex-col justify-between">
              <div>
                {recommendation.drink.imageUrl && (
                  <div className="w-full h-36 rounded-lg overflow-hidden mb-3 bg-[#EAE2DA]">
                    <img
                      src={recommendation.drink.imageUrl}
                      alt={recommendation.drink.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#A86226] font-semibold">
                      Primary Beverage
                    </span>
                    <h4 className="text-base font-serif font-bold text-[#261B16]">
                      {recommendation.drink.name}
                    </h4>
                  </div>
                  <span className="text-sm font-bold text-[#261B16] tabular-nums">
                    ₹{recommendation.drink.price}
                  </span>
                </div>
                <p className="text-xs text-[#6B5A50] mt-1.5 leading-relaxed">
                  {recommendation.drink.description}
                </p>
                {/* Clean unboxed metadata */}
                <div className="flex items-center gap-2 text-[11px] text-[#8C7A70] mt-2">
                  <span className="capitalize">{recommendation.drink.temperature}</span>
                  <span aria-hidden="true">·</span>
                  <span>{recommendation.drink.dietaryTags.join(', ')}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#EAE2DA] flex justify-end">
                <button
                  type="button"
                  onClick={() => onAddSingleItem(recommendation.drink)}
                  className="text-xs font-semibold text-[#574439] hover:text-[#261B16] flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add drink only (₹{recommendation.drink.price})
                </button>
              </div>
            </div>

            {/* Snack Card */}
            <div className="bg-[#FAF6F0] rounded-xl border border-[#EAE2DA] p-4 flex flex-col justify-between">
              <div>
                {recommendation.foodPairing.imageUrl && (
                  <div className="w-full h-36 rounded-lg overflow-hidden mb-3 bg-[#EAE2DA]">
                    <img
                      src={recommendation.foodPairing.imageUrl}
                      alt={recommendation.foodPairing.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#A86226] font-semibold">
                      Artisanal Food Pairing
                    </span>
                    <h4 className="text-base font-serif font-bold text-[#261B16]">
                      {recommendation.foodPairing.name}
                    </h4>
                  </div>
                  <span className="text-sm font-bold text-[#261B16] tabular-nums">
                    ₹{recommendation.foodPairing.price}
                  </span>
                </div>
                <p className="text-xs text-[#6B5A50] mt-1.5 leading-relaxed">
                  {recommendation.foodPairing.description}
                </p>
                {/* Clean unboxed metadata */}
                <div className="flex items-center gap-2 text-[11px] text-[#8C7A70] mt-2">
                  <span>{recommendation.foodPairing.dietaryTags.join(', ')}</span>
                  <span aria-hidden="true">·</span>
                  <span>{recommendation.foodPairing.vibeTag}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#EAE2DA] flex justify-end">
                <button
                  type="button"
                  onClick={() => onAddSingleItem(recommendation.foodPairing)}
                  className="text-xs font-semibold text-[#574439] hover:text-[#261B16] flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add snack only (₹{recommendation.foodPairing.price})
                </button>
              </div>
            </div>
          </div>

          {/* Pairing Explanation Callout */}
          <div className="mt-3 p-3.5 bg-[#FAF6F0] rounded-xl border border-[#EAE2DA]">
            <span className="text-[11px] font-semibold text-[#A86226] uppercase tracking-wider block mb-0.5">
              Sommelier Pairing Note
            </span>
            <p className="text-xs text-[#574439] leading-relaxed">
              "{recommendation.pairingReason}"
            </p>
          </div>
        </div>

        {/* Spatial Zone & Soundtrack Recommendation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {/* Seating Zone */}
          <div className="p-3.5 bg-white border border-[#E6DDD4] rounded-xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#261B16] mb-1">
              <MapPin className="w-4 h-4 text-[#C67D3E]" />
              <span>Recommended Zone: {zone.name}</span>
            </div>
            <p className="text-xs text-[#6B5A50] leading-relaxed">
              {recommendation.zoneReason}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#8C7A70] mt-2">
              <span>{zone.noiseLevel}</span>
              <span aria-hidden="true">·</span>
              <span>{zone.powerOutlets}</span>
            </div>
          </div>

          {/* Soundtrack Match */}
          <div className="p-3.5 bg-white border border-[#E6DDD4] rounded-xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#261B16] mb-1">
              <Music className="w-4 h-4 text-[#C67D3E]" />
              <span>Atmospheric Soundtrack</span>
            </div>
            <p className="text-xs text-[#6B5A50] leading-relaxed">
              {recommendation.ambientSoundtrack}
            </p>
            <div className="text-[11px] text-[#8C7A70] mt-2">
              <span>Optimized for focus and acoustic warmth</span>
            </div>
          </div>
        </div>

        {/* Offline Notice if applicable */}
        {recommendation.offlineNotice && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{recommendation.offlineNotice}</span>
          </div>
        )}

        {/* Primary CTA: Add Complete Pairing */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => onAddPairing(recommendation.drink, recommendation.foodPairing)}
            className={`w-full py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
              addedPairing
                ? 'bg-[#4E6B58] text-white'
                : 'bg-[#261B16] hover:bg-[#3D2C25] active:scale-98 text-white'
            }`}
          >
            {addedPairing ? (
              <>
                <Check className="w-4 h-4" />
                <span>Pairing Added to Bag (₹{recommendation.totalEstimatedPrice})</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add Complete Pairing to Bag · ₹{recommendation.totalEstimatedPrice}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
