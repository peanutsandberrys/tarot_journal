export interface CardPull {
  cardId: string; // e.g. "major-0" or "cups-1"
  isUpright: boolean;
  position?: string;
}

export interface TarotPull {
  id: string;
  date: string; // YYYY-MM-DD
  question?: string;
  cards: CardPull[];
  notes?: string;
}

export interface TarotCard {
  id: string;
  name: string;
  type: 'major' | 'minor';
  suit?: 'cups' | 'swords' | 'wands' | 'pentacles';
  value: number | 'page' | 'knight' | 'queen' | 'king'; // 0-21 for major, 1-10 or court for minor
  valueLabel: string; // "0", "1", ..., "Page", "Knight", "Queen", "King"
}
