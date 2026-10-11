import React, { useState } from 'react';
import { Users, MessageSquare, Plus, Sparkles, MapPin, Volume2 } from 'lucide-react';
import { VibeBeacon } from '../types';

interface RoomVibeBoardProps {
  beacons: VibeBeacon[];
  onAddBeacon: (beacon: Omit<VibeBeacon, 'id' | 'timestamp'>) => void;
  userZone: string;
}

export const RoomVibeBoard: React.FC<RoomVibeBoardProps> = ({
  beacons,
  onAddBeacon,
  userZone,
}) => {
  const [author, setAuthor] = useState('');
  const [zone, setZone] = useState(userZone || 'Focus Corner');
  const [statusNote, setStatusNote] = useState('');
  const [seekingChat, setSeekingChat] = useState(false);
  const [filterChat, setFilterChat] = useState<'all' | 'chat_open' | 'heads_down'>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !statusNote.trim()) return;

    onAddBeacon({
      author: author.trim(),
      zone,
      vibe: seekingChat ? 'Open to Friendly Chat' : 'Heads-Down Focus',
      statusNote: statusNote.trim(),
      seekingChat,
    });

    setAuthor('');
    setStatusNote('');
    setShowAddForm(false);
  };

  const filteredBeacons = beacons.filter((b) => {
    if (filterChat === 'chat_open') return b.seekingChat;
    if (filterChat === 'heads_down') return !b.seekingChat;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E6DDD4] p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold text-[#A86226] uppercase tracking-wider bg-[#F9F4EE] px-2 py-0.5 rounded border border-[#EAE2DA]">
                Community & Shared Energy
              </span>
              <span className="text-[11px] text-[#8C7A70]">The Café Companion</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#261B16]">
              Understand the Room & Connect
            </h2>
            <p className="text-xs sm:text-sm text-[#6B5A50] mt-0.5">
              See who is in the café today, what they are working on, or discover shared passions.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2.5 bg-[#261B16] hover:bg-[#3D2C25] active:scale-98 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4 text-[#C67D3E]" />
            <span>{showAddForm ? 'Close Beacon Form' : 'Post My Room Beacon'}</span>
          </button>
        </div>

        {/* Room Atmosphere Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5 pt-4 border-t border-[#F0EAE1]">
          <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#EAE2DA] text-xs">
            <div className="flex items-center justify-between font-semibold text-[#261B16] mb-1">
              <span>Focus Corner</span>
              <span className="text-[11px] text-[#8C7A70]">40 dB · Mellow</span>
            </div>
            <p className="text-[#6B5A50] text-[11px]">
              Deep work sprint, laptops active, acoustic wood baffles.
            </p>
          </div>

          <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#EAE2DA] text-xs">
            <div className="flex items-center justify-between font-semibold text-[#261B16] mb-1">
              <span>Social Table</span>
              <span className="text-[11px] text-[#8C7A70]">65 dB · Lively</span>
            </div>
            <p className="text-[#6B5A50] text-[11px]">
              Sunny communal oak bench, open chats & design collabs.
            </p>
          </div>

          <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#EAE2DA] text-xs">
            <div className="flex items-center justify-between font-semibold text-[#261B16] mb-1">
              <span>Cozy Lounge</span>
              <span className="text-[11px] text-[#8C7A70]">50 dB · Gentle</span>
            </div>
            <p className="text-[#6B5A50] text-[11px]">
              Vintage leather chairs, books, soft warm lighting.
            </p>
          </div>
        </div>
      </div>

      {/* Add Beacon Collapsible Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-[#C67D3E]/50 p-4 sm:p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-serif font-bold text-[#261B16]">
              Share Your Table Beacon
            </h3>
            <span className="text-xs text-[#8C7A70]">Opt-in · Zero Pressure</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="beacon-name" className="block text-xs font-semibold text-[#574439] uppercase tracking-wider mb-1">
                Your Name / Handle
              </label>
              <input
                id="beacon-name"
                type="text"
                required
                placeholder="e.g. Maya"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#FAF6F0] border border-[#E0D5CB] rounded-lg text-[#261B16] focus:outline-none focus:ring-2 focus:ring-[#C67D3E]/30 focus:border-[#C67D3E]"
              />
            </div>

            <div>
              <label htmlFor="beacon-zone" className="block text-xs font-semibold text-[#574439] uppercase tracking-wider mb-1">
                Seating Area
              </label>
              <select
                id="beacon-zone"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#FAF6F0] border border-[#E0D5CB] rounded-lg text-[#261B16] focus:outline-none focus:ring-2 focus:ring-[#C67D3E]/30 focus:border-[#C67D3E]"
              >
                <option value="Focus Corner">Focus Corner</option>
                <option value="Social Table">Social Table</option>
                <option value="Cozy Lounge">Cozy Lounge</option>
                <option value="Window Counter">Window Counter</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="beacon-note" className="block text-xs font-semibold text-[#574439] uppercase tracking-wider mb-1">
              What are you focusing on or reading today?
            </label>
            <input
              id="beacon-note"
              type="text"
              required
              placeholder="e.g. Building a Cloud Run hackathon MVP, reading Murakami, or sketching wireframes"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#FAF6F0] border border-[#E0D5CB] rounded-lg text-[#261B16] focus:outline-none focus:ring-2 focus:ring-[#C67D3E]/30 focus:border-[#C67D3E]"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="chat-toggle"
              type="checkbox"
              checked={seekingChat}
              onChange={(e) => setSeekingChat(e.target.checked)}
              className="w-4 h-4 accent-[#C67D3E] rounded"
            />
            <label htmlFor="chat-toggle" className="text-xs text-[#261B16] cursor-pointer">
              Open to a quick friendly coffee conversation or pairing ideas
            </label>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-[#261B16] hover:bg-[#3D2C25] text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Publish Beacon to Room
          </button>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-[#574439]">View Beacons:</span>
        <button
          type="button"
          onClick={() => setFilterChat('all')}
          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
            filterChat === 'all'
              ? 'bg-[#261B16] text-white'
              : 'bg-white text-[#6B5A50] border border-[#E6DDD4]'
          }`}
        >
          All Guests ({beacons.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterChat('chat_open')}
          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
            filterChat === 'chat_open'
              ? 'bg-[#261B16] text-white'
              : 'bg-white text-[#6B5A50] border border-[#E6DDD4]'
          }`}
        >
          Open to Chat
        </button>
        <button
          type="button"
          onClick={() => setFilterChat('heads_down')}
          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
            filterChat === 'heads_down'
              ? 'bg-[#261B16] text-white'
              : 'bg-white text-[#6B5A50] border border-[#E6DDD4]'
          }`}
        >
          Quiet Focus
        </button>
      </div>

      {/* Beacon Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBeacons.map((beacon) => (
          <div
            key={beacon.id}
            className="bg-white rounded-xl border border-[#E6DDD4] p-4 flex flex-col justify-between shadow-xs hover:border-[#D5C6B7] transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="text-sm font-serif font-bold text-[#261B16]">
                    {beacon.author}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-[#8C7A70] mt-0.5">
                    <MapPin className="w-3 h-3 text-[#C67D3E]" />
                    <span>{beacon.zone}</span>
                    <span aria-hidden="true">·</span>
                    <span>{beacon.timestamp}</span>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    beacon.seekingChat
                      ? 'bg-[#EBF1EC] text-[#4E6B58]'
                      : 'bg-[#FAF6F0] text-[#8C7A70]'
                  }`}
                >
                  {beacon.seekingChat ? '☕ Open to Chat' : '🎧 Deep Focus'}
                </span>
              </div>

              <p className="text-xs text-[#574439] leading-relaxed bg-[#FAF6F0] p-2.5 rounded-lg border border-[#EAE2DA]">
                "{beacon.statusNote}"
              </p>
            </div>

            <div className="mt-3 pt-2 text-[11px] text-[#8C7A70] flex items-center justify-between">
              <span>{beacon.vibe}</span>
              <span className="text-[#C67D3E] font-medium">CaféOS Live Community</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
