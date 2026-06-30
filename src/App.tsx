import React, { useState, useEffect } from 'react';
import { BookOpen, BarChart2, Compass } from 'lucide-react';
import { TarotPull } from './types';
import JournalPage from './components/JournalPage';
import ResultsPage from './components/ResultsPage';
import InsightsPage from './components/InsightsPage';

type TabOption = 'journal' | 'results' | 'insights';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabOption>('journal');
  const [pulls, setPulls] = useState<TarotPull[]>([]);

  // Load pulls from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('tarot_pulls_data');
    if (stored) {
      try {
        setPulls(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored tarot pulls data:', e);
      }
    }
  }, []);

  // Save pulls to localStorage
  const savePullsToStorage = (updatedPulls: TarotPull[]) => {
    setPulls(updatedPulls);
    localStorage.setItem('tarot_pulls_data', JSON.stringify(updatedPulls));
  };

  const handleSavePull = (newOrUpdatedPull: TarotPull) => {
    const index = pulls.findIndex(p => p.id === newOrUpdatedPull.id);
    let updated: TarotPull[];
    
    if (index >= 0) {
      // Update existing
      updated = [...pulls];
      updated[index] = newOrUpdatedPull;
    } else {
      // Add new
      updated = [newOrUpdatedPull, ...pulls];
    }
    
    savePullsToStorage(updated);
  };

  const handleDeletePull = (pullId: string) => {
    const updated = pulls.filter(p => p.id !== pullId);
    savePullsToStorage(updated);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans antialiased" id="app-root">
      {/* Header Container */}
      <header className="border-b border-zinc-100 bg-white" id="app-header">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-lg font-bold tracking-tight text-zinc-900 uppercase">Tarot Journal</h1>
          </div>

          {/* Tab Selection Navigation */}
          <nav className="flex items-center gap-1 bg-zinc-100/80 p-1 rounded-xl" id="nav-tabs">
            <button
              onClick={() => setActiveTab('journal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                activeTab === 'journal'
                  ? 'bg-white text-zinc-900 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
              id="tab-journal"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Journal</span>
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                activeTab === 'results'
                  ? 'bg-white text-zinc-900 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
              id="tab-results"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Results</span>
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                activeTab === 'insights'
                  ? 'bg-white text-zinc-900 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
              id="tab-insights"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Insights</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Screen Content */}
      <main className="max-w-4xl mx-auto px-4 py-6" id="app-main">
        {activeTab === 'journal' && (
          <JournalPage
            pulls={pulls}
            onSavePull={handleSavePull}
            onDeletePull={handleDeletePull}
          />
        )}
        {activeTab === 'results' && (
          <ResultsPage pulls={pulls} />
        )}
        {activeTab === 'insights' && (
          <InsightsPage pulls={pulls} />
        )}
      </main>
    </div>
  );
}
