import React, { useState, useMemo } from 'react';
import { Search, Compass, Calendar, BookOpen, AlertCircle, Eye } from 'lucide-react';
import { TarotPull, CardPull, TarotCard } from '../types';
import { tarotCards } from '../data/tarotCards';
import SearchableCardSelect from './SearchableCardSelect';

interface InsightsPageProps {
  pulls: TarotPull[];
}

export default function InsightsPage({ pulls }: InsightsPageProps) {
  // Current selections
  const [selectedCardId, setSelectedCardId] = useState<string>('major-0'); // Default to The Fool
  const [isUpright, setIsUpright] = useState<boolean>(true);
  
  // Track which pull is expanded to show all entered data
  const [expandedPullId, setExpandedPullId] = useState<string | null>(null);

  const selectedCard = useMemo(() => {
    return tarotCards.find(c => c.id === selectedCardId);
  }, [selectedCardId]);

  // Find all pulls that contain this specific card with this orientation
  const matchingPulls = useMemo(() => {
    return pulls.filter(pull => {
      return pull.cards.some(c => c.cardId === selectedCardId && c.isUpright === isUpright);
    }).sort((a, b) => b.date.localeCompare(a.date)); // Sort by date descending
  }, [pulls, selectedCardId, isUpright]);

  // Handle expanding / collapsing a pull card
  const togglePullExpand = (pullId: string) => {
    setExpandedPullId(expandedPullId === pullId ? null : pullId);
  };

  return (
    <div className="space-y-6" id="insights-page">
      {/* Search Header */}
      <div className="bg-white border border-zinc-100 rounded-xl p-5 shadow-2xs space-y-4" id="insights-header">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Card Insight Explorer</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          {/* Card Selection */}
          <div className="sm:col-span-8 space-y-1">
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Select Card
            </label>
            <SearchableCardSelect
              selectedCardId={selectedCardId}
              onSelect={(id) => {
                setSelectedCardId(id);
                setExpandedPullId(null); // Reset expansion on change
              }}
              id="insight-card-selector"
            />
          </div>

          {/* Upright / Reversed toggle */}
          <div className="sm:col-span-4 flex items-center h-10">
            <button
              onClick={() => {
                setIsUpright(!isUpright);
                setExpandedPullId(null); // Reset expansion on change
              }}
              className={`w-full h-full py-2 px-3 text-xs font-semibold rounded-lg border cursor-pointer transition-all ${
                isUpright
                  ? "bg-zinc-800 text-white border-zinc-800 shadow-2xs"
                  : "bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200"
              }`}
              id="btn-toggle-insight-direction"
            >
              {isUpright ? 'Upright' : 'Reversed'}
            </button>
          </div>
        </div>
      </div>

      {/* Results Content */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Recorded Pulls ({matchingPulls.length})
          </span>
          {selectedCard && (
            <span className="text-xs font-semibold text-zinc-500">
              {selectedCard.name} ({isUpright ? 'Upright' : 'Reversed'})
            </span>
          )}
        </div>

        {matchingPulls.length > 0 ? (
          <div className="grid grid-cols-1 gap-4" id="insights-pulls-list">
            {matchingPulls.map((pull) => {
              const isExpanded = expandedPullId === pull.id;

              return (
                <div
                  key={pull.id}
                  onClick={() => togglePullExpand(pull.id)}
                  className={`bg-white border rounded-xl p-4 transition-all cursor-pointer select-none relative ${
                    isExpanded
                      ? "border-zinc-400 shadow-sm"
                      : "border-zinc-100 hover:border-zinc-200 shadow-3xs"
                  }`}
                  id={`insight-pull-card-${pull.id}`}
                >
                  {/* Top line with Date */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="text-xs font-semibold text-zinc-700">
                        {new Date(pull.date + 'T00:00:00').toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-medium bg-zinc-50 px-2 py-0.5 rounded-sm">
                      <Eye className="w-3 h-3" />
                      {isExpanded ? 'Click to close' : 'Click to show all data'}
                    </span>
                  </div>

                  {/* Notes Preview (Always shown if notes exist, as requested: "shown with date and notes") */}
                  {pull.notes && (
                    <div className="mt-2 pt-2 border-t border-zinc-50">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 block mb-0.5">Notes</span>
                      <p className="text-xs text-zinc-600 whitespace-pre-line line-clamp-3">
                        {pull.notes}
                      </p>
                    </div>
                  )}

                  {/* EXPANDABLE AREA: ALL DATA ENTERED FOR THIS PULL */}
                  {isExpanded && (
                    <div
                      className="mt-4 pt-4 border-t border-zinc-200 space-y-4 animate-fade-in"
                      onClick={(e) => e.stopPropagation()} // Prevent collapse when clicking inside
                      id={`insight-pull-details-${pull.id}`}
                    >
                      {/* Question */}
                      {pull.question && (
                        <div>
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 block mb-0.5">Question Asked</span>
                          <p className="text-sm font-medium text-zinc-800">{pull.question}</p>
                        </div>
                      )}

                      {/* Complete Draw list */}
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 block mb-1.5">Complete Spread / Drawing</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {pull.cards.map((cardPull, idx) => {
                            const info = tarotCards.find(c => c.id === cardPull.cardId);
                            const isCurrentCardAndDir = cardPull.cardId === selectedCardId && cardPull.isUpright === isUpright;

                            return (
                              <div
                                key={idx}
                                className={`p-2.5 rounded-lg border text-xs space-y-0.5 ${
                                  isCurrentCardAndDir
                                    ? "bg-zinc-900 border-zinc-900 text-white"
                                    : "bg-zinc-50 border-zinc-100 text-zinc-800"
                                }`}
                                id={`insight-drawn-card-${pull.id}-${idx}`}
                              >
                                <div className="font-semibold flex items-center justify-between">
                                  <span>{info ? info.name : 'Unknown Card'}</span>
                                  <span className={`text-[9px] px-1 rounded font-normal ${
                                    isCurrentCardAndDir
                                      ? "bg-zinc-800 text-zinc-300"
                                      : "bg-zinc-200/60 text-zinc-500"
                                  }`}>
                                    {cardPull.isUpright ? 'Upright' : 'Reversed'}
                                  </span>
                                </div>
                                {cardPull.position && (
                                  <div className={isCurrentCardAndDir ? "text-zinc-300 italic" : "text-zinc-500 italic"}>
                                    Position: {cardPull.position}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Full Notes */}
                      {pull.notes && (
                        <div className="pt-2 border-t border-zinc-100">
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 block mb-0.5">Full Notes</span>
                          <p className="text-xs text-zinc-600 whitespace-pre-line leading-relaxed">
                            {pull.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50 flex flex-col items-center justify-center p-4">
            <AlertCircle className="w-6 h-6 text-zinc-300 mb-1.5" />
            <span className="text-xs text-zinc-400 font-medium">No recorded pulls found containing this card and reversal.</span>
          </div>
        )}
      </div>
    </div>
  );
}
