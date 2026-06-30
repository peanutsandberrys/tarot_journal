import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Calendar as CalendarIcon, ArrowLeft, ArrowRight, X, AlertCircle } from 'lucide-react';
import { TarotPull, CardPull, TarotCard } from '../types';
import { tarotCards } from '../data/tarotCards';
import SearchableCardSelect from './SearchableCardSelect';

interface JournalPageProps {
  pulls: TarotPull[];
  onSavePull: (pull: TarotPull) => void;
  onDeletePull: (pullId: string) => void;
}

export default function JournalPage({ pulls, onSavePull, onDeletePull }: JournalPageProps) {
  // Get today's local date
  const today = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  // Initialize selected date to today, and calendar view to current month/year
  const [selectedDate, setSelectedDate] = useState<string>(today);
  
  const initialYearAndMonth = useMemo(() => {
    const [y, m] = selectedDate.split('-').map(Number);
    return { year: y, month: m - 1 };
  }, [selectedDate]);

  const [currentYear, setCurrentYear] = useState<number>(initialYearAndMonth.year);
  const [currentMonth, setCurrentMonth] = useState<number>(initialYearAndMonth.month); // 0-indexed

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPullId, setEditingPullId] = useState<string | null>(null);
  const [formQuestion, setFormQuestion] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formCards, setFormCards] = useState<CardPull[]>([
    { cardId: '', isUpright: true, position: '' }
  ]);
  const [formError, setFormError] = useState('');

  // Months name array
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Year range for the selector
  const years = useMemo(() => {
    const current = new Date().getFullYear();
    const range = [];
    for (let i = current - 6; i <= current + 6; i++) {
      range.push(i);
    }
    return range;
  }, []);

  // Calendar calculations
  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentYear, currentMonth]);

  const firstDayOfWeek = useMemo(() => {
    return new Date(currentYear, currentMonth, 1).getDay(); // 0 (Sun) to 6 (Sat)
  }, [currentYear, currentMonth]);

  // Navigate months
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Helper to get formatted string YYYY-MM-DD
  const makeDateString = (day: number) => {
    const y = currentYear;
    const m = (currentMonth + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Check if a date has recorded pulls
  const dateHasPulls = (dateStr: string) => {
    return pulls.some(p => p.date === dateStr);
  };

  // Pulls for selected date
  const selectedDatePulls = useMemo(() => {
    return pulls.filter(p => p.date === selectedDate);
  }, [pulls, selectedDate]);

  // Open form to add new pull
  const handleOpenAddForm = () => {
    setEditingPullId(null);
    setFormQuestion('');
    setFormNotes('');
    setFormCards([{ cardId: '', isUpright: true, position: '' }]);
    setFormError('');
    setIsFormOpen(true);
  };

  // Open form to edit existing pull
  const handleOpenEditForm = (pull: TarotPull) => {
    setEditingPullId(pull.id);
    setFormQuestion(pull.question || '');
    setFormNotes(pull.notes || '');
    // Ensure cards deep copy to avoid editing main state in-place
    setFormCards(pull.cards.map(c => ({ ...c })));
    setFormError('');
    setIsFormOpen(true);
  };

  // Handle adding card field in form
  const handleAddCardToForm = () => {
    setFormCards([...formCards, { cardId: '', isUpright: true, position: '' }]);
  };

  // Handle removing a card field from form (only allow if more than 1)
  const handleRemoveCardFromForm = (index: number) => {
    if (formCards.length > 1) {
      const updated = [...formCards];
      updated.splice(index, 1);
      setFormCards(updated);
    }
  };

  // Handle card field changes
  const handleCardChange = (index: number, field: keyof CardPull, value: any) => {
    const updated = [...formCards];
    updated[index] = { ...updated[index], [field]: value };
    setFormCards(updated);
  };

  // Save pull form
  const handleSavePull = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const emptyCards = formCards.some(c => !c.cardId);
    if (emptyCards) {
      setFormError('Please select a tarot card for all fields.');
      return;
    }

    const savedPull: TarotPull = {
      id: editingPullId || Math.random().toString(36).substr(2, 9),
      date: selectedDate,
      question: formQuestion.trim() || undefined,
      cards: formCards,
      notes: formNotes.trim() || undefined,
    };

    onSavePull(savedPull);
    setIsFormOpen(false);
    setFormError('');
  };

  return (
    <div className="space-y-6" id="journal-page">
      {!isFormOpen ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* LEFT: CALENDAR (8 cols on md+) */}
          <div className="md:col-span-7 bg-white p-4 border border-zinc-100 rounded-xl shadow-xs" id="calendar-container">
            {/* Header controls */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <select
                  value={currentMonth}
                  onChange={(e) => setCurrentMonth(Number(e.target.value))}
                  className="px-2 py-1 text-sm font-semibold bg-zinc-50 border border-zinc-200 rounded-md focus:outline-hidden text-zinc-800 cursor-pointer"
                  id="month-selector"
                >
                  {months.map((name, index) => (
                    <option key={name} value={index}>{name}</option>
                  ))}
                </select>

                <select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(Number(e.target.value))}
                  className="px-2 py-1 text-sm font-semibold bg-zinc-50 border border-zinc-200 rounded-md focus:outline-hidden text-zinc-800 cursor-pointer"
                  id="year-selector"
                >
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 hover:bg-zinc-100 rounded-md text-zinc-500 cursor-pointer transition-colors"
                  title="Previous Month"
                  id="btn-prev-month"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 hover:bg-zinc-100 rounded-md text-zinc-500 cursor-pointer transition-colors"
                  title="Next Month"
                  id="btn-next-month"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekdays header */}
            <div className="grid grid-cols-7 text-center text-xs font-semibold text-zinc-400 py-1 mb-2">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1" id="calendar-grid">
              {/* Empty padding for first day of week */}
              {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                <div key={`empty-${idx}`} className="aspect-square" />
              ))}

              {/* Days of the month */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNumber = idx + 1;
                const dateStr = makeDateString(dayNumber);
                const isSelected = selectedDate === dateStr;
                const isToday = today === dateStr;
                const hasPulls = dateHasPulls(dateStr);

                return (
                  <button
                    key={`day-${dayNumber}`}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`aspect-square flex flex-col items-center justify-between p-1 rounded-lg text-sm transition-all cursor-pointer relative ${
                      isSelected
                        ? "bg-zinc-800 text-white font-semibold"
                        : isToday
                        ? "bg-zinc-100 text-zinc-900 border border-zinc-300 font-medium hover:bg-zinc-200"
                        : "text-zinc-700 hover:bg-zinc-50"
                    }`}
                    id={`day-btn-${dateStr}`}
                  >
                    <span className="text-xs">{dayNumber}</span>
                    {/* Circle indicating pulls */}
                    {hasPulls && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full mb-0.5 ${
                          isSelected ? "bg-white" : "bg-zinc-400"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT: PULLS DETAILS (5 cols on md+) */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-4" id="pulls-details-container">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-zinc-500" />
                  <span className="text-sm font-semibold text-zinc-700">
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                <button
                  onClick={handleOpenAddForm}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg cursor-pointer transition-colors shadow-2xs"
                  id="add-pull-btn"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Pull</span>
                </button>
              </div>

              {selectedDatePulls.length > 0 ? (
                <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1" id="pulls-list">
                  {selectedDatePulls.map((pull, pullIdx) => (
                    <div
                      key={pull.id}
                      className="bg-white border border-zinc-100 rounded-xl p-4 shadow-2xs relative space-y-3"
                      id={`pull-card-${pull.id}`}
                    >
                      {/* Action buttons */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditForm(pull)}
                          className="p-1 hover:bg-zinc-50 rounded text-zinc-400 hover:text-zinc-600 cursor-pointer transition-colors"
                          title="Edit Pull"
                          id={`btn-edit-${pull.id}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this tarot card pull?')) {
                              onDeletePull(pull.id);
                            }
                          }}
                          className="p-1 hover:bg-red-50 rounded text-zinc-400 hover:text-red-600 cursor-pointer transition-colors"
                          title="Delete Pull"
                          id={`btn-delete-${pull.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Question */}
                      {pull.question && (
                        <div>
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 block mb-0.5">Question</span>
                          <p className="text-sm font-medium text-zinc-800">{pull.question}</p>
                        </div>
                      )}

                      {/* Cards Drawn */}
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 block mb-1">Cards drawn</span>
                        <div className="space-y-2">
                          {pull.cards.map((cardPull, idx) => {
                            const cardInfo = tarotCards.find(c => c.id === cardPull.cardId);
                            return (
                              <div
                                key={idx}
                                className="flex items-start justify-between p-2 bg-zinc-50/60 border border-zinc-100 rounded-lg text-xs"
                                id={`drawn-card-${pull.id}-${idx}`}
                              >
                                <div className="space-y-0.5">
                                  <div className="font-semibold text-zinc-800">
                                    {cardInfo ? cardInfo.name : 'Unknown Card'}
                                    <span className="ml-1.5 text-[10px] px-1 py-0.2 bg-zinc-200/60 rounded text-zinc-500 font-normal">
                                      {cardPull.isUpright ? 'Upright' : 'Reversed'}
                                    </span>
                                  </div>
                                  {cardPull.position && (
                                    <div className="text-zinc-500 italic">
                                      Position: {cardPull.position}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Notes */}
                      {pull.notes && (
                        <div className="pt-2 border-t border-zinc-100">
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 block mb-0.5">Notes</span>
                          <p className="text-xs text-zinc-600 whitespace-pre-line leading-relaxed">{pull.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50 flex flex-col items-center justify-center p-4">
                  <span className="text-xs text-zinc-400 font-medium">No tarot pulls recorded for this day.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* FORM VIEW */
        <form onSubmit={handleSavePull} className="bg-white border border-zinc-100 rounded-xl p-5 shadow-xs space-y-5 max-w-2xl mx-auto" id="pull-form">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <h3 className="text-sm font-semibold text-zinc-800">
              {editingPullId ? 'Edit Tarot Pull' : 'Add Tarot Pull'} &mdash; {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </h3>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="p-1 hover:bg-zinc-100 rounded-md text-zinc-400 hover:text-zinc-600 cursor-pointer"
              id="form-close-btn"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {formError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600" id="form-error">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Question (Optional) */}
          <div className="space-y-1">
            <label htmlFor="form-question" className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Question
            </label>
            <input
              type="text"
              id="form-question"
              value={formQuestion}
              onChange={(e) => setFormQuestion(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg shadow-2xs focus:outline-hidden focus:border-zinc-400 text-zinc-800"
            />
          </div>

          {/* Cards Container */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Cards Drawn
            </label>

            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {formCards.map((cardPull, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-zinc-50/40 border border-zinc-100 rounded-xl relative space-y-3"
                  id={`form-card-row-${idx}`}
                >
                  {/* Remove Card button */}
                  {formCards.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCardFromForm(idx)}
                      className="absolute top-2 right-2 p-1 hover:bg-zinc-100 rounded text-zinc-400 hover:text-red-500 cursor-pointer"
                      title="Remove Card"
                      id={`btn-remove-card-row-${idx}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Card Number indicator */}
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Card #{idx + 1}
                  </span>

                  {/* Searchable Select and toggle */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <div className="sm:col-span-8 space-y-1">
                      <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Select Tarot Card
                      </label>
                      <SearchableCardSelect
                        selectedCardId={cardPull.cardId}
                        onSelect={(cardId) => handleCardChange(idx, 'cardId', cardId)}
                        id={`form-card-select-${idx}`}
                      />
                    </div>

                    <div className="sm:col-span-4 flex items-center h-9">
                      <button
                        type="button"
                        onClick={() => handleCardChange(idx, 'isUpright', !cardPull.isUpright)}
                        className={`w-full py-2 px-3 text-xs font-semibold rounded-lg border cursor-pointer transition-all ${
                          cardPull.isUpright
                            ? "bg-zinc-800 text-white border-zinc-800"
                            : "bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200"
                        }`}
                        id={`btn-toggle-direction-${idx}`}
                      >
                        {cardPull.isUpright ? 'Upright' : 'Reversed'}
                      </button>
                    </div>
                  </div>

                  {/* Position (Optional) */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                      Position of Card
                    </label>
                    <input
                      type="text"
                      value={cardPull.position || ''}
                      onChange={(e) => handleCardChange(idx, 'position', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg shadow-2xs focus:outline-hidden focus:border-zinc-400 text-zinc-800"
                    />
                  </div>
                </div>
              ))}

              <div className="pt-2 flex justify-start">
                <button
                  type="button"
                  onClick={handleAddCardToForm}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-50 hover:bg-zinc-100 text-zinc-600 font-semibold rounded-lg border border-zinc-200 cursor-pointer transition-colors shadow-3xs"
                  id="btn-add-card-to-form"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Card</span>
                </button>
              </div>
            </div>
          </div>

          {/* Notes (Optional) */}
          <div className="space-y-1">
            <label htmlFor="form-notes" className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Notes
            </label>
            <textarea
              id="form-notes"
              rows={3}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg shadow-2xs focus:outline-hidden focus:border-zinc-400 text-zinc-800 resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-zinc-500 hover:bg-zinc-50 border border-zinc-200 rounded-lg cursor-pointer transition-colors"
              id="form-cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg cursor-pointer transition-colors shadow-2xs"
              id="form-save-btn"
            >
              Save Pull
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
