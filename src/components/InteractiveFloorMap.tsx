import React, { useState } from 'react';
import { Users, Volume2, Zap, Compass, CheckCircle2 } from 'lucide-react';
import { ZoneOccupancy } from '../types';

interface InteractiveFloorMapProps {
  occupancyData: Record<string, ZoneOccupancy>;
  highlightedZone?: string;
  onSelectZone: (zoneName: string) => void;
  selectedZone: string;
}

export const InteractiveFloorMap: React.FC<InteractiveFloorMapProps> = ({
  occupancyData,
  highlightedZone,
  onSelectZone,
  selectedZone,
}) => {
  const currentZoneData = occupancyData[selectedZone] || occupancyData['Focus Corner'];

  const getOccupancyColor = (occupied: number, total: number) => {
    const ratio = occupied / total;
    if (ratio < 0.5) return { bg: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-300', badge: 'Low Occupancy' };
    if (ratio < 0.8) return { bg: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-300', badge: 'Moderate' };
    return { bg: 'bg-rose-500', text: 'text-rose-700', border: 'border-rose-300', badge: 'Nearly Full' };
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E6DDD4] overflow-hidden shadow-xs">
      {/* Top Header */}
      <div className="p-4 sm:p-5 bg-[#FAF6F0] border-b border-[#E6DDD4] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[11px] font-semibold text-[#A86226] uppercase tracking-wider bg-[#F9F4EE] px-2 py-0.5 rounded border border-[#EAE2DA]">
              Interactive Spatial Floor Map
            </span>
            <span className="text-[11px] text-[#8C7A70]">Live Simulated Seating Telemetry</span>
          </div>
          <h3 className="text-lg font-serif font-bold text-[#261B16]">
            CaféOS Architectural Layout & Vibe Map
          </h3>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs text-[#6B5A50]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>&lt;50% Free</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span>Moderate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span>High Load</span>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Responsive Architectural SVG Map */}
        <div className="lg:col-span-2 bg-[#FBF8F3] rounded-xl border border-[#EAE2DA] p-3 sm:p-5 overflow-hidden">
          <svg
            viewBox="0 0 800 520"
            className="w-full h-auto max-h-[480px] select-none"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.02))' }}
          >
            {/* Background architectural floor grid */}
            <defs>
              <pattern id="floor-tiles" width="40" height="40" patternUnits="userSpaceOnUse">
                <rect width="40" height="40" fill="#FAF6F0" />
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#F0EAE1" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="800" height="520" fill="url(#floor-tiles)" rx="12" />

            {/* Perimeter Walls & Windows */}
            <rect x="15" y="15" width="770" height="490" fill="none" stroke="#D8CCC0" strokeWidth="3" rx="12" />
            {/* North Window Strip */}
            <line x1="200" y1="15" x2="600" y2="15" stroke="#9EC5DB" strokeWidth="6" strokeLinecap="round" />
            <text x="400" y="32" textAnchor="middle" fill="#759BAE" fontSize="11" fontFamily="sans-serif" fontWeight="600">
              ☀️ Natural Sunlight Arch Windows
            </text>

            {/* Entrance Doorway */}
            <path d="M 40 505 L 120 505" stroke="#FAF6F0" strokeWidth="6" />
            <path d="M 40 505 A 80 80 0 0 1 120 445" fill="none" stroke="#C67D3E" strokeWidth="1.5" strokeDasharray="4 4" />
            <text x="80" y="495" textAnchor="middle" fill="#8C7A70" fontSize="10" fontWeight="bold">
              Entrance
            </text>

            {/* BARISTA ESPRESSO BAR & PICKUP COUNTER */}
            <g transform="translate(480, 310)">
              {/* Counter Bar */}
              <rect x="0" y="0" width="280" height="120" rx="10" fill="#2C1E18" stroke="#1B1310" strokeWidth="2" />
              <text x="140" y="35" textAnchor="middle" fill="#E6DDD4" fontSize="13" fontFamily="serif" fontWeight="bold">
                Barista Espresso Bar
              </text>
              <text x="140" y="55" textAnchor="middle" fill="#C67D3E" fontSize="10" fontWeight="600">
                La Marzocco Linea PB · Mahlkönig EK43
              </text>
              {/* Pickup Shelf */}
              <rect x="15" y="75" width="110" height="30" rx="5" fill="#432F26" />
              <text x="70" y="95" textAnchor="middle" fill="#FAF6F0" fontSize="10" fontWeight="bold">
                Order Pickup
              </text>
              {/* Brew Station */}
              <circle cx="170" cy="90" r="12" fill="#C67D3E" />
              <circle cx="210" cy="90" r="12" fill="#C67D3E" />
              <circle cx="250" cy="90" r="12" fill="#C67D3E" />
            </g>

            {/* ZONE 1: FOCUS CORNER (Top Left) */}
            <g
              onClick={() => onSelectZone('Focus Corner')}
              className="cursor-pointer transition-transform hover:opacity-95"
            >
              <rect
                x="35"
                y="35"
                width="310"
                height="190"
                rx="12"
                fill={selectedZone === 'Focus Corner' ? '#F4EDE4' : '#FFFFFF'}
                stroke={selectedZone === 'Focus Corner' ? '#C67D3E' : highlightedZone === 'Focus Corner' ? '#C67D3E' : '#E6DDD4'}
                strokeWidth={selectedZone === 'Focus Corner' ? 3 : highlightedZone === 'Focus Corner' ? 2.5 : 1.5}
                strokeDasharray={highlightedZone === 'Focus Corner' ? '6 3' : 'none'}
              />
              {/* Desks & ergonomic chairs */}
              <rect x="55" y="65" width="70" height="40" rx="4" fill="#EAE2DA" stroke="#D5C6B7" />
              <rect x="75" y="112" width="30" height="15" rx="3" fill="#8C7A70" />
              <rect x="155" y="65" width="70" height="40" rx="4" fill="#EAE2DA" stroke="#D5C6B7" />
              <rect x="175" y="112" width="30" height="15" rx="3" fill="#8C7A70" />
              <rect x="255" y="65" width="70" height="40" rx="4" fill="#EAE2DA" stroke="#D5C6B7" />
              <rect x="275" y="112" width="30" height="15" rx="3" fill="#8C7A70" />

              <rect x="55" y="145" width="110" height="35" rx="4" fill="#EAE2DA" stroke="#D5C6B7" />
              <rect x="95" y="185" width="30" height="15" rx="3" fill="#8C7A70" />
              <rect x="195" y="145" width="110" height="35" rx="4" fill="#EAE2DA" stroke="#D5C6B7" />
              <rect x="235" y="185" width="30" height="15" rx="3" fill="#8C7A70" />

              <text x="50" y="55" fill="#261B16" fontSize="13" fontFamily="serif" fontWeight="bold">
                Focus Corner
              </text>
              <circle cx="325" cy="52" r="5" fill="#10B981" />
              <text x="250" y="55" fill="#6B5A50" fontSize="10" fontWeight="600">
                40 dB · Deep Work
              </text>
            </g>

            {/* ZONE 2: SOCIAL TABLE (Top Right) */}
            <g
              onClick={() => onSelectZone('Social Table')}
              className="cursor-pointer transition-transform hover:opacity-95"
            >
              <rect
                x="380"
                y="35"
                width="385"
                height="220"
                rx="12"
                fill={selectedZone === 'Social Table' ? '#F4EDE4' : '#FFFFFF'}
                stroke={selectedZone === 'Social Table' ? '#C67D3E' : highlightedZone === 'Social Table' ? '#C67D3E' : '#E6DDD4'}
                strokeWidth={selectedZone === 'Social Table' ? 3 : highlightedZone === 'Social Table' ? 2.5 : 1.5}
                strokeDasharray={highlightedZone === 'Social Table' ? '6 3' : 'none'}
              />
              {/* Long communal oak table */}
              <rect x="420" y="95" width="305" height="75" rx="8" fill="#CBB69D" stroke="#B8A287" strokeWidth="2" />
              <text x="572" y="138" textAnchor="middle" fill="#654F38" fontSize="12" fontWeight="bold">
                Communal Oak Meeting Bench
              </text>
              {/* Chairs around communal table */}
              {[440, 490, 540, 590, 640, 690].map((cx) => (
                <rect key={`chair-top-${cx}`} x={cx - 15} y="72" width="30" height="16" rx="4" fill="#8C7A70" />
              ))}
              {[440, 490, 540, 590, 640, 690].map((cx) => (
                <rect key={`chair-bot-${cx}`} x={cx - 15} y="177" width="30" height="16" rx="4" fill="#8C7A70" />
              ))}

              <text x="395" y="55" fill="#261B16" fontSize="13" fontFamily="serif" fontWeight="bold">
                Social Table
              </text>
              <circle cx="745" cy="52" r="5" fill="#F59E0B" />
              <text x="660" y="55" fill="#6B5A50" fontSize="10" fontWeight="600">
                65 dB · Collab & Chats
              </text>
            </g>

            {/* ZONE 3: COZY LOUNGE (Bottom Left) */}
            <g
              onClick={() => onSelectZone('Cozy Lounge')}
              className="cursor-pointer transition-transform hover:opacity-95"
            >
              <rect
                x="35"
                y="255"
                width="310"
                height="230"
                rx="12"
                fill={selectedZone === 'Cozy Lounge' ? '#F4EDE4' : '#FFFFFF'}
                stroke={selectedZone === 'Cozy Lounge' ? '#C67D3E' : highlightedZone === 'Cozy Lounge' ? '#C67D3E' : '#E6DDD4'}
                strokeWidth={selectedZone === 'Cozy Lounge' ? 3 : highlightedZone === 'Cozy Lounge' ? 2.5 : 1.5}
                strokeDasharray={highlightedZone === 'Cozy Lounge' ? '6 3' : 'none'}
              />
              {/* Round rug */}
              <circle cx="180" cy="370" r="65" fill="#EAE2DA" stroke="#DFD4C8" />
              {/* Round Coffee Table */}
              <circle cx="180" cy="370" r="28" fill="#CBB69D" stroke="#B8A287" />
              <text x="180" y="374" textAnchor="middle" fill="#654F38" fontSize="10" fontWeight="bold">
                Low Table
              </text>

              {/* Plush Armchairs */}
              <rect x="85" y="345" width="35" height="50" rx="8" fill="#A86226" />
              <rect x="240" y="345" width="35" height="50" rx="8" fill="#A86226" />
              <rect x="155" y="275" width="50" height="35" rx="8" fill="#A86226" />

              {/* Bookshelf indicator */}
              <rect x="45" y="270" width="70" height="15" rx="3" fill="#654F38" />
              <text x="80" y="281" textAnchor="middle" fill="#FAF6F0" fontSize="8" fontWeight="bold">
                Bookshelf
              </text>

              <text x="50" y="315" fill="#261B16" fontSize="13" fontFamily="serif" fontWeight="bold">
                Cozy Lounge
              </text>
              <circle cx="325" cy="275" r="5" fill="#10B981" />
              <text x="250" y="277" fill="#6B5A50" fontSize="10" fontWeight="600">
                50 dB · Unwind
              </text>
            </g>

            {/* ZONE 4: BARISTA TASTING BENCH (Front of Bar) */}
            <g
              onClick={() => onSelectZone('Barista Tasting Bench')}
              className="cursor-pointer transition-transform hover:opacity-95"
            >
              <rect
                x="370"
                y="310"
                width="95"
                height="120"
                rx="10"
                fill={selectedZone === 'Barista Tasting Bench' ? '#F4EDE4' : '#FFFFFF'}
                stroke={selectedZone === 'Barista Tasting Bench' ? '#C67D3E' : highlightedZone === 'Barista Tasting Bench' ? '#C67D3E' : '#E6DDD4'}
                strokeWidth={selectedZone === 'Barista Tasting Bench' ? 3 : highlightedZone === 'Barista Tasting Bench' ? 2.5 : 1.5}
                strokeDasharray={highlightedZone === 'Barista Tasting Bench' ? '6 3' : 'none'}
              />
              <text x="417" y="335" textAnchor="middle" fill="#261B16" fontSize="11" fontFamily="serif" fontWeight="bold">
                Tasting
              </text>
              <text x="417" y="350" textAnchor="middle" fill="#261B16" fontSize="11" fontFamily="serif" fontWeight="bold">
                Bench
              </text>
              {/* 3 Stools */}
              <circle cx="417" cy="375" r="12" fill="#C67D3E" stroke="#A86226" strokeWidth="2" />
              <circle cx="417" cy="405" r="12" fill="#C67D3E" stroke="#A86226" strokeWidth="2" />
            </g>
          </svg>
        </div>

        {/* Right 1 Col: Selected Zone Inspector Card */}
        <div className="bg-[#FAF6F0] rounded-xl border border-[#EAE2DA] p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-[#A86226] uppercase tracking-wider">
                Zone Intelligence
              </span>
              {highlightedZone === selectedZone && (
                <span className="text-[11px] font-semibold text-[#4E6B58] bg-[#EBF1EC] px-2 py-0.5 rounded">
                  ★ AI Matched
                </span>
              )}
            </div>

            <h4 className="text-xl font-serif font-bold text-[#261B16]">
              {currentZoneData?.name || selectedZone}
            </h4>
            <p className="text-xs text-[#6B5A50] mt-1 leading-relaxed">
              Recommended Intent: <strong className="text-[#261B16]">{currentZoneData?.recommendedIntent}</strong>
            </p>

            {/* Occupancy Indicator */}
            {(() => {
              const occupied = currentZoneData?.occupiedSeats || 3;
              const total = currentZoneData?.totalSeats || 6;
              const color = getOccupancyColor(occupied, total);
              const pct = Math.round((occupied / total) * 100);

              return (
                <div className="mt-4 p-3 bg-white rounded-lg border border-[#E6DDD4] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#261B16]">Simulated Occupancy</span>
                    <span className={`font-bold tabular-nums ${color.text}`}>
                      {occupied} / {total} seats ({pct}%)
                    </span>
                  </div>

                  <div className="w-full bg-[#EAE2DA] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${color.bg}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-[#8C7A70]">
                    <span>Status: {color.badge}</span>
                    <span>{total - occupied} Available</span>
                  </div>
                </div>
              );
            })()}

            {/* Zone Specs */}
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-start gap-2 text-[#574439]">
                <Volume2 className="w-4 h-4 text-[#C67D3E] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#261B16]">Acoustic Profile: </span>
                  <span>{currentZoneData?.noiseLevel}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-[#574439]">
                <Zap className="w-4 h-4 text-[#C67D3E] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#261B16]">Power Outlets: </span>
                  <span>{currentZoneData?.powerOutlets}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-[#574439]">
                <Compass className="w-4 h-4 text-[#C67D3E] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#261B16]">Best Suited For: </span>
                  <span>{currentZoneData?.recommendedIntent}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#EAE2DA]">
            <p className="text-[11px] text-[#8C7A70] text-center">
              Click any zone on the floor map to inspect its real-time ambiance and seat availability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
