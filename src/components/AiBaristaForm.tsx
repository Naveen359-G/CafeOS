import React from 'react';
import { Sparkles, RefreshCw, AlertCircle, Coffee, Thermometer, ShieldCheck, IndianRupee } from 'lucide-react';
import { UserPreferences } from '../types';

interface AiBaristaFormProps {
  preferences: UserPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
  onGenerate: () => void;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  streamingText?: string;
}

export const AiBaristaForm: React.FC<AiBaristaFormProps> = ({
  preferences,
  setPreferences,
  onGenerate,
  isLoading,
  error,
  onRetry,
  streamingText,
}) => {
  const updatePreference = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E6DDD4] p-4 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-serif font-bold text-[#261B16] flex items-center gap-2">
            <span>Refine Your Taste Profile</span>
          </h2>
          <p className="text-xs text-[#6B5A50] mt-0.5">
            Personalize your brew temperature, dietary needs, and order budget.
          </p>
        </div>
        <span className="text-xs text-[#8C7A70] hidden sm:inline">8 Drinks · 6 Snacks</span>
      </div>

      <div className="space-y-5">
        {/* Drink Type Segmented Control */}
        <div>
          <label className="block text-xs font-semibold text-[#574439] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Coffee className="w-3.5 h-3.5 text-[#C67D3E]" />
            <span>Beverage Focus</span>
          </label>
          <div className="grid grid-cols-3 gap-2 p-1 bg-[#FAF6F0] rounded-xl border border-[#EAE2DA]">
            {(['any', 'coffee', 'tea'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => updatePreference('drinkType', type)}
                className={`py-2 px-3 text-xs font-medium rounded-lg capitalize transition-all cursor-pointer whitespace-nowrap ${
                  preferences.drinkType === type
                    ? 'bg-white text-[#261B16] font-semibold shadow-xs border border-[#E0D5CB]'
                    : 'text-[#6B5A50] hover:text-[#261B16]'
                }`}
              >
                {type === 'any' ? 'Any Brew' : type}
              </button>
            ))}
          </div>
        </div>

        {/* Temperature Segmented Control */}
        <div>
          <label className="block text-xs font-semibold text-[#574439] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Thermometer className="w-3.5 h-3.5 text-[#C67D3E]" />
            <span>Temperature</span>
          </label>
          <div className="grid grid-cols-3 gap-2 p-1 bg-[#FAF6F0] rounded-xl border border-[#EAE2DA]">
            {(['any', 'hot', 'iced'] as const).map((temp) => (
              <button
                key={temp}
                type="button"
                onClick={() => updatePreference('temperature', temp)}
                className={`py-2 px-3 text-xs font-medium rounded-lg capitalize transition-all cursor-pointer whitespace-nowrap ${
                  preferences.temperature === temp
                    ? 'bg-white text-[#261B16] font-semibold shadow-xs border border-[#E0D5CB]'
                    : 'text-[#6B5A50] hover:text-[#261B16]'
                }`}
              >
                {temp === 'any' ? 'Either' : temp}
              </button>
            ))}
          </div>
        </div>

        {/* Dietary Preferences */}
        <div>
          <label className="block text-xs font-semibold text-[#574439] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C67D3E]" />
            <span>Dietary Preference</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'none', label: 'Standard / No Restriction' },
              { id: 'oat_milk', label: 'Oat Milk' },
              { id: 'dairy_free', label: 'Dairy-Free' },
              { id: 'vegan', label: '100% Plant-Based' },
              { id: 'nut_free', label: 'Nut-Free' },
              { id: 'decaf', label: 'Gentle / Decaf Friendly' },
            ].map((diet) => (
              <button
                key={diet.id}
                type="button"
                onClick={() => updatePreference('dietary', diet.id as any)}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                  preferences.dietary === diet.id
                    ? 'bg-[#261B16] text-white border-[#261B16] font-medium'
                    : 'bg-[#FAF6F0] text-[#574439] border-[#E6DDD4] hover:border-[#C67D3E]/50'
                }`}
              >
                {diet.label}
              </button>
            ))}
          </div>
        </div>

        {/* Budget Slider */}
        <div className="pt-1">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="budget-slider" className="text-xs font-semibold text-[#574439] uppercase tracking-wider flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-[#C67D3E]" />
              <span>Target Order Budget</span>
            </label>
            <span className="text-sm font-bold text-[#261B16] tabular-nums">
              ₹{preferences.budget}
            </span>
          </div>

          <input
            id="budget-slider"
            type="range"
            min="150"
            max="500"
            step="10"
            value={preferences.budget}
            onChange={(e) => updatePreference('budget', Number(e.target.value))}
            className="w-full accent-[#C67D3E] cursor-pointer"
          />

          <div className="flex justify-between items-center text-[11px] text-[#8C7A70] mt-1 tabular-nums">
            <span>₹150 (Solo Brew)</span>
            <span>₹320 (Coffee + Light Pastry)</span>
            <span>₹500 (Full Artisanal Pairing)</span>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-800">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Unable to fetch AI recommendation</p>
            <p className="mt-0.5 text-red-700">{error}</p>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-900 rounded font-medium text-xs whitespace-nowrap cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Submit / Trigger Button */}
      <div className="mt-6 pt-4 border-t border-[#F0EAE1]">
        <button
          type="button"
          onClick={onGenerate}
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
            isLoading
              ? 'bg-[#A86226] text-white opacity-90 cursor-wait'
              : 'bg-[#C67D3E] hover:bg-[#B36F34] active:scale-98 text-white'
          }`}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>{streamingText || 'AI Barista is crafting your pairing...'}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-white" />
              <span>Ask AI Barista for Pairing & Seating Zone</span>
            </>
          )}
        </button>
        <p className="text-[11px] text-center text-[#8C7A70] mt-2 flex items-center justify-center gap-1.5 flex-wrap">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#52796F] animate-pulse"></span>
          <span className="font-medium text-[#6B5A50]">Intelligent Café Concierge</span>
          <span aria-hidden="true">·</span>
          <span>Real-time vibe analysis, dietary matchmaking & wait time estimation</span>
        </p>
      </div>
    </div>
  );
};
