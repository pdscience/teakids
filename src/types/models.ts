// Alphabet Model
export interface AlphabetItem {
  letter: string;
  word: string;
  icon: string;
}

// Routine Models
export type RoutinePeriod = 'morning' | 'afternoon' | 'night';

export interface RoutineItem {
  icon: string;
  text: string;
  period: RoutinePeriod;
  index: number;
  id?: string;
  custom?: boolean;
}

export interface CustomRoutineItem {
  id: string;
  period: RoutinePeriod;
  icon: string;
  text: string;
  createdAt: string;
  removedAt: string | null;
}

export interface RoutineProgress {
  period: string;
  completedCount: number;
  totalCount: number;
  completedItems: boolean[];
  progress: number;
  progressText: string;
  isCompleted: boolean;
}

// Conversation Models
export interface ConversationItem {
  id: string;
  icon: string;
  text: string;
  category: string;
  color?: string;
}

export type ConversationCategory = 'greetings' | 'needs' | 'health' | 'activities' | 'family' | 'places';

export interface CustomConversationCard {
  id: string;
  category: ConversationCategory;
  icon: string;
  text: string;
  color: string;
  createdAt: string;
}

// Interactive Models
export interface InteractiveItem {
  name: string;
  icon: string;
  category: string;
  color?: string;
  type?: string;
}

export type InteractiveCategory = 'shapes' | 'colors' | 'animals' | 'fruits' | 'foods' | 'numbers' | 'vegetables' | 'household';

// Navigation
export type TabName = 'home' | 'conversation' | 'routines' | 'writer' | 'interactive';
