export interface QuickPhrase {
  id: string;
  icon: string;
  text: string;
  color: string;
}

export const quickPhrases: QuickPhrase[] = [
  { id: 'quick:help', icon: '🆘', text: 'Preciso de ajuda', color: '#FF1744' },
  { id: 'quick:stop', icon: '✋', text: 'Quero parar', color: '#FF6B35' },
  { id: 'quick:pain', icon: '🤕', text: 'Estou com dor', color: '#E91E63' },
  { id: 'quick:hug', icon: '🤗', text: 'Preciso de um abraço', color: '#B24BF3' },
  { id: 'quick:overwhelmed', icon: '😖', text: 'Estou sobrecarregado', color: '#FF9100' },
  { id: 'quick:quiet', icon: '😌', text: 'Preciso de um tempo sozinho', color: '#00BCD4' },
  { id: 'quick:mother', icon: '👩', text: 'Chama minha mãe', color: '#4D94FF' },
  { id: 'quick:father', icon: '👨', text: 'Chama meu pai', color: '#00C853' },
];
