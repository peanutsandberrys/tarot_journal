import { TarotCard } from '../types';

export const MAJOR_NAMES = [
  "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor",
  "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit",
  "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance",
  "The Devil", "The Tower", "The Star", "The Moon", "The Sun",
  "Judgement", "The World"
];

const valueLabels = ["", "Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];

const suits: ('cups' | 'swords' | 'wands' | 'pentacles')[] = ['cups', 'swords', 'wands', 'pentacles'];

export const tarotCards: TarotCard[] = [];

// Add Major Arcana (0 to 21)
MAJOR_NAMES.forEach((name, index) => {
  tarotCards.push({
    id: `major-${index}`,
    name,
    type: 'major',
    value: index,
    valueLabel: index.toString(),
  });
});

// Add Minor Arcana (56 cards)
suits.forEach(suit => {
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const suitLabel = capitalize(suit);
  
  // Numbers 1-10
  for (let i = 1; i <= 10; i++) {
    const vLabel = i === 1 ? 'Ace' : valueLabels[i];
    tarotCards.push({
      id: `${suit}-${i}`,
      name: `${vLabel} of ${suitLabel}`,
      type: 'minor',
      suit,
      value: i,
      valueLabel: i === 1 ? '1' : i.toString(),
    });
  }
  
  // Court cards
  ['page', 'knight', 'queen', 'king'].forEach(court => {
    tarotCards.push({
      id: `${suit}-${court}`,
      name: `${capitalize(court)} of ${suitLabel}`,
      type: 'minor',
      suit,
      value: court as any,
      valueLabel: capitalize(court),
    });
  });
});
