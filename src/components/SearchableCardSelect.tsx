import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { tarotCards } from '../data/tarotCards';
import { TarotCard } from '../types';

interface SearchableCardSelectProps {
  selectedCardId: string;
  onSelect: (cardId: string) => void;
  id?: string;
}

export default function SearchableCardSelect({ selectedCardId, onSelect, id }: SearchableCardSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCard = useMemo(() => {
    return tarotCards.find(c => c.id === selectedCardId);
  }, [selectedCardId]);

  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return tarotCards;
    const q = searchQuery.toLowerCase();
    return tarotCards.filter(c => c.name.toLowerCase().includes(q));
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative w-full" id={id}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearchQuery('');
        }}
        className="w-full flex items-center justify-between px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg shadow-2xs hover:border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-zinc-400 focus:ring-offset-1 text-left cursor-pointer transition-colors"
        id={`${id}-btn`}
      >
        <span className={selectedCard ? "text-zinc-800 font-medium" : "text-zinc-400"}>
          {selectedCard ? selectedCard.name : "Select a card..."}
        </span>
        <ChevronDown className="w-4 h-4 text-zinc-400 flex-shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg max-h-60 overflow-hidden flex flex-col" id={`${id}-dropdown`}>
          <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-100 bg-zinc-50/50">
            <Search className="w-4 h-4 text-zinc-400 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-zinc-800 outline-hidden placeholder-zinc-400"
              autoFocus
              id={`${id}-search-input`}
            />
          </div>

          <div className="overflow-y-auto py-1 flex-1 max-h-48 divide-y divide-zinc-50" id={`${id}-options`}>
            {filteredCards.length > 0 ? (
              filteredCards.map((card) => {
                const isSelected = card.id === selectedCardId;
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => {
                      onSelect(card.id);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-zinc-50 text-zinc-900 font-semibold"
                        : "hover:bg-zinc-50/85 text-zinc-600"
                    }`}
                    id={`${id}-option-${card.id}`}
                  >
                    <span>{card.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-zinc-800" />}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-4 text-center text-xs text-zinc-400">
                No tarot cards match "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
