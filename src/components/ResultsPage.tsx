import React, { useState, useMemo } from 'react';
import { Calendar, Filter, ArrowUpDown, ArrowUp, ArrowDown, Info } from 'lucide-react';
import { TarotPull, CardPull, TarotCard } from '../types';
import { tarotCards } from '../data/tarotCards';
import CircleChart from './CircleChart';

interface ResultsPageProps {
  pulls: TarotPull[];
}

type TimeFilterOption = 'all' | 'this-month' | 'last-30' | 'last-90' | 'custom';

// Helper function to get traditional tarot order index
function getTraditionalTarotOrderIndex(cardId: string): number {
  if (cardId.startsWith('major-')) {
    return parseInt(cardId.split('-')[1]);
  }
  const [suit, valueStr] = cardId.split('-');
  let suitOffset = 0;
  if (suit === 'wands') suitOffset = 100;
  else if (suit === 'swords') suitOffset = 200;
  else if (suit === 'cups') suitOffset = 300;
  else if (suit === 'pentacles') suitOffset = 400;

  let cardVal = 0;
  if (valueStr === 'page') cardVal = 11;
  else if (valueStr === 'knight') cardVal = 12;
  else if (valueStr === 'queen') cardVal = 13;
  else if (valueStr === 'king') cardVal = 14;
  else cardVal = parseInt(valueStr);

  return suitOffset + cardVal;
}

export default function ResultsPage({ pulls }: ResultsPageProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilterOption>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Values & Court sorting states:
  // 'type' or 'frequency'
  const [valueSortField, setValueSortField] = useState<'type' | 'frequency'>('type');
  const [valueSortAsc, setValueSortAsc] = useState<boolean>(true);

  // Individual cards sorting states:
  const [individualSortField, setIndividualSortField] = useState<'frequency' | 'name'>('frequency');
  const [individualSortAsc, setIndividualSortAsc] = useState<boolean>(false);

  // Filter pulls based on time period
  const filteredPulls = useMemo(() => {
    const now = new Date();
    
    return pulls.filter(pull => {
      const pullDate = new Date(pull.date + 'T00:00:00');
      
      switch (timeFilter) {
        case 'all':
          return true;
        case 'this-month': {
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();
          return pullDate.getMonth() === currentMonth && pullDate.getFullYear() === currentYear;
        }
        case 'last-30': {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(now.getDate() - 30);
          return pullDate >= thirtyDaysAgo;
        }
        case 'last-90': {
          const ninetyDaysAgo = new Date();
          ninetyDaysAgo.setDate(now.getDate() - 90);
          return pullDate >= ninetyDaysAgo;
        }
        case 'custom': {
          if (!startDate && !endDate) return true;
          if (startDate && !endDate) {
            return pullDate >= new Date(startDate + 'T00:00:00');
          }
          if (!startDate && endDate) {
            return pullDate <= new Date(endDate + 'T00:00:00');
          }
          return pullDate >= new Date(startDate + 'T00:00:00') && pullDate <= new Date(endDate + 'T00:00:00');
        }
        default:
          return true;
      }
    });
  }, [pulls, timeFilter, startDate, endDate]);

  // Extract all individual card pulls from the filtered pulls
  const allCardPulls = useMemo(() => {
    const list: { cardId: string; isUpright: boolean }[] = [];
    filteredPulls.forEach(pull => {
      pull.cards.forEach(c => {
        list.push({ cardId: c.cardId, isUpright: c.isUpright });
      });
    });
    return list;
  }, [filteredPulls]);

  const totalCardsCount = allCardPulls.length;

  // 1. Upright vs Reversed Frequency (Orientation)
  // Upright color is green (#81b29a), Reversed is gold/yellow (#e9c46a)
  const orientationChartData = useMemo(() => {
    let upright = 0;
    let reversed = 0;

    allCardPulls.forEach(pulled => {
      if (pulled.isUpright) {
        upright++;
      } else {
        reversed++;
      }
    });

    const data = [
      { name: 'Upright', value: upright, color: '#81b29a' }, // Sage Green (pentacles green)
      { name: 'Reversed', value: reversed, color: '#e9c46a' } // Gold/Yellow
    ];

    return data.map(item => ({
      ...item,
      percentage: totalCardsCount > 0 ? (item.value / totalCardsCount) * 100 : 0
    }));
  }, [allCardPulls, totalCardsCount]);

  // 2. Arcana/Suits Frequency
  const suitChartData = useMemo(() => {
    const counts = {
      major: 0,
      cups: 0,
      swords: 0,
      wands: 0,
      pentacles: 0
    };

    allCardPulls.forEach(pulled => {
      const card = tarotCards.find(c => c.id === pulled.cardId);
      if (!card) return;
      if (card.type === 'major') {
        counts.major++;
      } else if (card.suit) {
        counts[card.suit]++;
      }
    });

    const data = [
      { name: 'Major Arcana', value: counts.major, key: 'major', color: '#e07a5f' }, // Warm Terracotta
      { name: 'Cups', value: counts.cups, key: 'cups', color: '#3d5a80' }, // Soft Deep Slate Blue
      { name: 'Swords', value: counts.swords, key: 'swords', color: '#b5838d' }, // Soft Warm Plum
      { name: 'Wands', value: counts.wands, key: 'wands', color: '#f4a261' }, // Soft Sand Orange
      { name: 'Pentacles', value: counts.pentacles, key: 'pentacles', color: '#81b29a' } // Sage Green
    ];

    // Sort in decreasing order of value (frequency)
    data.sort((a, b) => b.value - a.value);

    return data.map(item => ({
      ...item,
      percentage: totalCardsCount > 0 ? (item.value / totalCardsCount) * 100 : 0
    }));
  }, [allCardPulls, totalCardsCount]);

  // 3. Value Frequency Base Data
  const valueBaseData = useMemo(() => {
    const counts: Record<string, number> = {
      major: 0,
      '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0,
      page: 0, knight: 0, queen: 0, king: 0
    };

    allCardPulls.forEach(pulled => {
      const card = tarotCards.find(c => c.id === pulled.cardId);
      if (!card) return;
      if (card.type === 'major') {
        counts.major++;
      } else {
        const valStr = card.value.toString().toLowerCase();
        if (counts[valStr] !== undefined) {
          counts[valStr]++;
        }
      }
    });

    const categoriesList = [
      { name: 'Ace (1)', key: '1' },
      { name: 'Two (2)', key: '2' },
      { name: 'Three (3)', key: '3' },
      { name: 'Four (4)', key: '4' },
      { name: 'Five (5)', key: '5' },
      { name: 'Six (6)', key: '6' },
      { name: 'Seven (7)', key: '7' },
      { name: 'Eight (8)', key: '8' },
      { name: 'Nine (9)', key: '9' },
      { name: 'Ten (10)', key: '10' },
      { name: 'Page', key: 'page' },
      { name: 'Knight', key: 'knight' },
      { name: 'Queen', key: 'queen' },
      { name: 'King', key: 'king' },
      { name: 'Major Arcana', key: 'major' }
    ];

    return categoriesList.map(item => ({
      ...item,
      value: counts[item.key] || 0,
      percentage: totalCardsCount > 0 ? ((counts[item.key] || 0) / totalCardsCount) * 100 : 0
    }));
  }, [allCardPulls, totalCardsCount]);

  // Sorted values and court data for the table
  const sortedValueData = useMemo(() => {
    const data = [...valueBaseData];
    const typeOrder = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'page', 'knight', 'queen', 'king', 'major'];

    if (valueSortField === 'type') {
      data.sort((a, b) => {
        const idxA = typeOrder.indexOf(a.key);
        const idxB = typeOrder.indexOf(b.key);
        return valueSortAsc ? idxA - idxB : idxB - idxA;
      });
    } else if (valueSortField === 'frequency') {
      data.sort((a, b) => {
        if (a.value !== b.value) {
          return valueSortAsc ? a.value - b.value : b.value - a.value;
        }
        const idxA = typeOrder.indexOf(a.key);
        const idxB = typeOrder.indexOf(b.key);
        return idxA - idxB;
      });
    }
    return data;
  }, [valueBaseData, valueSortField, valueSortAsc]);

  // Handle value sort clicks
  const handleValueSort = (field: 'type' | 'frequency') => {
    if (valueSortField === field) {
      setValueSortAsc(!valueSortAsc);
    } else {
      setValueSortField(field);
      // default frequency to high-to-low initially
      setValueSortAsc(field === 'type' ? true : false);
    }
  };

  // 4. Individual Card Frequencies with sorting
  const sortedIndividualCards = useMemo(() => {
    const counts: Record<string, number> = {};
    tarotCards.forEach(card => {
      counts[card.id] = 0;
    });

    allCardPulls.forEach(pulled => {
      if (counts[pulled.cardId] !== undefined) {
        counts[pulled.cardId]++;
      }
    });

    const data = tarotCards.map(card => {
      const count = counts[card.id] || 0;
      const percentage = totalCardsCount > 0 ? (count / totalCardsCount) * 100 : 0;
      return {
        ...card,
        count,
        percentage
      };
    });

    return data.sort((a, b) => {
      if (individualSortField === 'name') {
        const idxA = getTraditionalTarotOrderIndex(a.id);
        const idxB = getTraditionalTarotOrderIndex(b.id);
        return individualSortAsc ? idxA - idxB : idxB - idxA;
      } else {
        // sort by frequency
        if (a.count !== b.count) {
          return individualSortAsc ? a.count - b.count : b.count - a.count;
        }
        // fallback to traditional order
        return getTraditionalTarotOrderIndex(a.id) - getTraditionalTarotOrderIndex(b.id);
      }
    });
  }, [allCardPulls, totalCardsCount, individualSortField, individualSortAsc]);

  const handleIndividualSort = (field: 'name' | 'frequency') => {
    if (individualSortField === field) {
      setIndividualSortAsc(!individualSortAsc);
    } else {
      setIndividualSortField(field);
      // default frequency to high-to-low initially, and name to traditional-first (asc)
      setIndividualSortAsc(field === 'name' ? true : false);
    }
  };

  return (
    <div className="space-y-6" id="results-page">
      {/* Time Period Filter Controls */}
      <div className="bg-white border border-zinc-100 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4" id="filters-container">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-400" />
          <span className="text-sm font-semibold text-zinc-700">Time Period Filter</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'this-month', 'last-30', 'last-90', 'custom'] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setTimeFilter(opt)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                timeFilter === opt
                  ? "bg-zinc-800 text-white border-zinc-800 shadow-2xs"
                  : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100"
              }`}
              id={`filter-btn-${opt}`}
            >
              {opt === 'all' && 'All Time'}
              {opt === 'this-month' && 'This Month'}
              {opt === 'last-30' && 'Last 30 Days'}
              {opt === 'last-90' && 'Last 90 Days'}
              {opt === 'custom' && 'Custom Range'}
            </button>
          ))}
        </div>

        {/* Custom date range inputs */}
        {timeFilter === 'custom' && (
          <div className="flex items-center gap-2 mt-2 md:mt-0 text-xs animate-fade-in" id="custom-date-inputs">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2 py-1 bg-white border border-zinc-200 rounded-md focus:outline-hidden text-zinc-700"
              id="custom-start-date"
            />
            <span className="text-zinc-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2 py-1 bg-white border border-zinc-200 rounded-md focus:outline-hidden text-zinc-700"
              id="custom-end-date"
            />
          </div>
        )}
      </div>

      {totalCardsCount > 0 ? (
        <div className="space-y-6">
          {/* Frequencies grid (1st Orientation, 2nd Arcana & Suits) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="charts-grid">
            {/* 1. Orientation (Upright vs Reversed) displayed FIRST */}
            <div className="space-y-2 bg-white p-4 border border-zinc-100 rounded-xl shadow-2xs" id="orientation-frequency-card">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Orientation</h3>
              <CircleChart data={orientationChartData} total={totalCardsCount} />
            </div>

            {/* 2. Arcana & Suits displayed SECOND */}
            <div className="space-y-2 bg-white p-4 border border-zinc-100 rounded-xl shadow-2xs" id="suit-frequency-card">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Arcana & Suits</h3>
              <CircleChart data={suitChartData} total={totalCardsCount} />
            </div>
          </div>

          {/* 3. Values & Court displayed THIRD (only Table, NO circle diagram) */}
          <div className="bg-white border border-zinc-100 rounded-xl shadow-2xs overflow-hidden" id="values-court-container">
            <div className="flex items-center justify-between p-4 border-b border-zinc-100 bg-zinc-50/50">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Values & Court</span>
            </div>

            <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 text-[10px] uppercase font-bold text-zinc-400 tracking-wider bg-zinc-50/30">
                    <th className="p-3 pl-4 w-16 select-none">Rank</th>
                    <th 
                      onClick={() => handleValueSort('type')}
                      className="p-3 select-none cursor-pointer hover:bg-zinc-100/50 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>Type</span>
                        {valueSortField === 'type' ? (
                          valueSortAsc ? <ArrowUp className="w-3.5 h-3.5 text-zinc-800" /> : <ArrowDown className="w-3.5 h-3.5 text-zinc-800" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-zinc-300" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleValueSort('frequency')}
                      className="p-3 pr-4 select-none cursor-pointer hover:bg-zinc-100/50 text-right transition-colors"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Frequency (%)</span>
                        {valueSortField === 'frequency' ? (
                          valueSortAsc ? <ArrowUp className="w-3.5 h-3.5 text-zinc-800" /> : <ArrowDown className="w-3.5 h-3.5 text-zinc-800" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-zinc-300" />
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {sortedValueData.map((item, idx) => (
                    <tr key={item.key} className="hover:bg-zinc-50/50 transition-colors" id={`val-row-${item.key}`}>
                      <td className="p-3 pl-4 text-zinc-400 font-medium">{idx + 1}</td>
                      <td className="p-3 font-semibold text-zinc-800">{item.name}</td>
                      <td className="p-3 pr-4 text-right font-medium text-zinc-800">
                        {item.value} ({item.percentage.toFixed(1)}%)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Individual Cards displayed LAST/FOURTH */}
          <div className="bg-white border border-zinc-100 rounded-xl shadow-2xs overflow-hidden" id="card-list-container">
            <div className="flex items-center justify-between p-4 border-b border-zinc-100 bg-zinc-50/50">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Individual Cards</span>
            </div>

            <div className="overflow-x-auto max-h-[450px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 text-[10px] uppercase font-bold text-zinc-400 tracking-wider bg-zinc-50/30">
                    <th className="p-3 pl-4 w-16 select-none">Rank</th>
                    <th 
                      onClick={() => handleIndividualSort('name')}
                      className="p-3 select-none cursor-pointer hover:bg-zinc-100/50 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>Card Name</span>
                        {individualSortField === 'name' ? (
                          individualSortAsc ? <ArrowUp className="w-3.5 h-3.5 text-zinc-800" /> : <ArrowDown className="w-3.5 h-3.5 text-zinc-800" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-zinc-300" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleIndividualSort('frequency')}
                      className="p-3 pr-4 select-none cursor-pointer hover:bg-zinc-100/50 text-right transition-colors"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Frequency (%)</span>
                        {individualSortField === 'frequency' ? (
                          individualSortAsc ? <ArrowUp className="w-3.5 h-3.5 text-zinc-800" /> : <ArrowDown className="w-3.5 h-3.5 text-zinc-800" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-zinc-300" />
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {sortedIndividualCards.map((card, idx) => (
                    <tr key={card.id} className="hover:bg-zinc-50/50 transition-colors" id={`row-${card.id}`}>
                      <td className="p-3 pl-4 text-zinc-400 font-medium">
                        {idx + 1}
                      </td>
                      <td className="p-3 font-semibold text-zinc-800">{card.name}</td>
                      <td className="p-3 pr-4 text-right font-medium text-zinc-800">
                        {card.count} ({card.percentage.toFixed(1)}%)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-24 border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50 flex flex-col items-center justify-center p-6">
          <Info className="w-8 h-8 text-zinc-300 mb-2" />
          <h4 className="text-sm font-semibold text-zinc-700">No pulls recorded in this time range</h4>
          <p className="text-xs text-zinc-400 max-w-sm mt-1">
            Go to the Journal tab, select a date, and record a tarot card pull to see full analytics and frequencies.
          </p>
        </div>
      )}
    </div>
  );
}
