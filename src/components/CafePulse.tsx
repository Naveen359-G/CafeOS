import React, { useState } from 'react';
import { Star, Send, CheckCircle2, MessageSquareQuote } from 'lucide-react';
import { CustomerFeedback } from '../types';

interface CafePulseProps {
  onAddFeedback: (feedback: Omit<CustomerFeedback, 'id' | 'timestamp'>) => void;
  recentFeedbacks: CustomerFeedback[];
}

export const CafePulse: React.FC<CafePulseProps> = ({
  onAddFeedback,
  recentFeedbacks,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Flawless Roast']);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const availableTags = [
    'Flawless Roast',
    'Perfect Seating Vibe',
    'Super Fast Prep',
    'Great Acoustic Playlist',
    'Rich Latte Art',
    'Crisp Pastry',
    'Helpful Outlets',
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddFeedback({
      rating,
      tags: selectedTags,
      comment: comment.trim(),
    });
    setIsSubmitted(true);
    setTimeout(() => {
      setComment('');
      setIsSubmitted(false);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Feedback Input Card */}
      <div className="bg-white rounded-2xl border border-[#E6DDD4] p-4 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-serif font-bold text-[#261B16]">
              Café Pulse · Guest Sentiment
            </h2>
            <p className="text-xs text-[#6B5A50] mt-0.5">
              Rate your coffee, seating ambiance, and experience. Stored locally in your session.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-[#8C7A70] bg-[#FAF6F0] px-2.5 py-1 rounded-md border border-[#EAE2DA]">
            Demo Local Storage
          </span>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center bg-[#F2F7F3] rounded-xl border border-[#D0E2D4] text-[#4E6B58] space-y-2">
            <CheckCircle2 className="w-10 h-10 mx-auto text-[#4E6B58]" />
            <h3 className="font-serif font-bold text-base text-[#261B16]">
              Thank You for Your Pulse!
            </h3>
            <p className="text-xs text-[#574439] max-w-sm mx-auto">
              Your feedback has been logged to the Manager Pulse view and helps the barista team calibrate roast and floor flow.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Star Rating */}
            <div>
              <label className="block text-xs font-semibold text-[#574439] uppercase tracking-wider mb-2">
                Overall Experience Rating
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 text-[#C67D3E] hover:scale-110 transition-transform cursor-pointer"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      className={`w-7 h-7 ${
                        (hoverRating || rating) >= star
                          ? 'fill-[#C67D3E] text-[#C67D3E]'
                          : 'text-[#E0D5CB]'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-sm font-bold text-[#261B16] ml-2 tabular-nums">
                  {rating} of 5 Stars
                </span>
              </div>
            </div>

            {/* Quick Vibe Tags */}
            <div>
              <label className="block text-xs font-semibold text-[#574439] uppercase tracking-wider mb-2">
                What Stood Out?
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                      selectedTags.includes(tag)
                        ? 'bg-[#261B16] text-white border-[#261B16] font-medium'
                        : 'bg-[#FAF6F0] text-[#574439] border-[#E6DDD4] hover:border-[#C67D3E]'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Comment */}
            <div>
              <label htmlFor="feedback-comment" className="block text-xs font-semibold text-[#574439] uppercase tracking-wider mb-1.5">
                Comments or Special Requests <span className="text-[#8C7A70] font-normal">(Optional)</span>
              </label>
              <textarea
                id="feedback-comment"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="e.g. Loved the cardamom latte note! The Focus Corner had ideal acoustics for my coding sprint."
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF6F0] border border-[#E0D5CB] rounded-lg text-[#261B16] placeholder-[#9E8D82] focus:outline-none focus:ring-2 focus:ring-[#C67D3E]/30 focus:border-[#C67D3E]"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-[#261B16] hover:bg-[#3D2C25] active:scale-98 text-white text-sm font-semibold rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4 text-[#E6DDD4]" />
              <span>Submit Café Pulse Feedback</span>
            </button>
          </form>
        )}
      </div>

      {/* Recent Community Feedbacks */}
      <div className="bg-white rounded-2xl border border-[#E6DDD4] p-4 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-serif font-bold text-[#261B16] flex items-center gap-2">
            <MessageSquareQuote className="w-4 h-4 text-[#C67D3E]" />
            <span>Recent Guest Pulse Entries</span>
          </h3>
          <span className="text-xs text-[#8C7A70] tabular-nums">
            {recentFeedbacks.length} Reviews Logged
          </span>
        </div>

        <div className="space-y-3">
          {recentFeedbacks.length === 0 ? (
            <p className="text-xs text-[#8C7A70] py-4 text-center">
              No feedback entries yet. Be the first to rate your visit!
            </p>
          ) : (
            recentFeedbacks.slice(0, 5).map((fb) => (
              <div
                key={fb.id}
                className="p-3.5 bg-[#FAF6F0] rounded-xl border border-[#EAE2DA] text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#C67D3E]">
                    {Array.from({ length: fb.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#C67D3E]" />
                    ))}
                  </div>
                  <span className="text-[11px] text-[#8C7A70]">
                    {fb.timestamp}
                  </span>
                </div>

                {fb.tags.length > 0 && (
                  <div className="flex items-center gap-2 text-[11px] text-[#574439]">
                    <span>{fb.tags.join(' · ')}</span>
                  </div>
                )}

                {fb.comment && (
                  <p className="text-[#261B16] leading-relaxed pt-0.5">
                    "{fb.comment}"
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
