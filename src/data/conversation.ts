import type { ConversationItem, ConversationCategory } from '../types/models';

const colorMap: Record<string, string> = {
  'green': '#4CAF50',
  'red': '#F44336',
  'blue': '#2196F3',
  'blueGrey': '#607D8B',
  'orange': '#FF9800',
  'deepOrange': '#FF5722',
  'indigo': '#3F51B5',
  'teal': '#009688',
  'purple': '#9C27B0',
  'brown': '#795548',
  'blueAccent': '#448AFF',
  'amber': '#FFC107',
  'pink': '#E91E63',
  'grey': '#9E9E9E',
  'cyan': '#00BCD4',
  'lightBlue': '#03A9F4',
  'redAccent': '#FF1744',
  'greenAccent': '#00E676',
  'deepPurple': '#673AB7',
  'orangeAccent': '#FF9100',
  'yellow': '#FFEB3B',
  'black': '#000000',
};

const DEFAULT_COLOR = '#2196F3';
const HEX_COLOR = /^#[0-9a-fA-F]{3,8}$/;

// Helper to get color hex from Flutter Color
export function getColor(colorName: string | undefined): string {
  if (!colorName) return DEFAULT_COLOR;
  if (HEX_COLOR.test(colorName)) return colorName;
  return colorMap[colorName] || DEFAULT_COLOR;
}

export function withAlpha(color: string, alpha: string): string {
  return `${getColor(color)}${alpha}`;
}

export const conversationData: Record<ConversationCategory, ConversationItem[]> = {
  greetings: [
    { icon: '👍', text: 'Sim', category: 'greetings', color: getColor('green') },
    { icon: '👎', text: 'Não', category: 'greetings', color: getColor('red') },
    { icon: '👋', text: 'Olá', category: 'greetings', color: getColor('blue') },
    { icon: '🤔', text: 'Não sei', category: 'greetings', color: getColor('blueGrey') },
    { icon: '☀️', text: 'Bom dia', category: 'greetings', color: getColor('orange') },
    { icon: '🌇', text: 'Boa tarde', category: 'greetings', color: getColor('deepOrange') },
    { icon: '🌙', text: 'Boa noite', category: 'greetings', color: getColor('indigo') },
    { icon: '🙏', text: 'Obrigado', category: 'greetings', color: getColor('teal') },
    { icon: '🤝', text: 'Por favor', category: 'greetings', color: getColor('purple') },
    { icon: '😔', text: 'Desculpa', category: 'greetings', color: getColor('brown') },
    { icon: '👋', text: 'Tchau', category: 'greetings', color: getColor('blueAccent') },
    { icon: '😊', text: 'Estou bem', category: 'greetings', color: getColor('green') },
    { icon: '😢', text: 'Eu estou triste', category: 'greetings', color: '#0D47A1' },
    { icon: '😱', text: 'Eu estou assustado', category: 'greetings', color: getColor('deepPurple') },
    { icon: '😰', text: 'Eu estou nervoso', category: 'greetings', color: '#B71C1C' },
    { icon: '😴', text: 'Eu estou com sono', category: 'greetings', color: '#1A237E' },
    { icon: '😃', text: 'Eu estou feliz', category: 'greetings', color: getColor('amber') },
    { icon: '😡', text: 'Eu estou bravo', category: 'greetings', color: getColor('red') },
    { icon: '😣', text: 'Eu estou frustrado', category: 'greetings', color: getColor('orangeAccent') },
    { icon: '🤗', text: 'Eu preciso de um abraço', category: 'greetings', color: getColor('pink') },
    { icon: '😖', text: 'Eu estou sobrecarregado', category: 'greetings', color: getColor('grey') },
    { icon: '😐', text: 'Eu estou entediado', category: 'greetings', color: getColor('blueGrey') },
    { icon: '😌', text: 'Eu preciso de um tempo sozinho', category: 'greetings', color: getColor('teal') },
    { icon: '😵', text: 'Eu estou tonto', category: 'greetings', color: '#E040FB' },
  ],
  needs: [
    { icon: '🍎', text: 'Eu quero uma fruta', category: 'needs', color: getColor('redAccent') },
    { icon: '🥤', text: 'Eu quero água', category: 'needs', color: getColor('blue') },
    { icon: '🍪', text: 'Eu quero biscoito', category: 'needs', color: getColor('brown') },
    { icon: '🍽️', text: 'Eu estou com fome', category: 'needs', color: getColor('orange') },
    { icon: '🥛', text: 'Eu quero leite', category: 'needs', color: getColor('grey') },
    { icon: '🚽', text: 'Eu preciso ir ao banheiro', category: 'needs', color: getColor('cyan') },
    { icon: '🛏️', text: 'Eu estou com sono', category: 'needs', color: getColor('indigo') },
    { icon: '🧼', text: 'Eu quero tomar banho', category: 'needs', color: getColor('lightBlue') },
    { icon: '👕', text: 'Eu quero trocar de roupa', category: 'needs', color: getColor('green') },
    { icon: '🧥', text: 'Eu estou com frio', category: 'needs', color: getColor('blueGrey') },
    { icon: '🎽', text: 'Eu estou com calor', category: 'needs', color: getColor('orangeAccent') },
    { icon: '🧢', text: 'Eu quero meu chapéu', category: 'needs', color: getColor('amber') },
    { icon: '👟', text: 'Eu quero meus sapatos', category: 'needs', color: getColor('blue') },
    { icon: '🧸', text: 'Eu quero meu brinquedo', category: 'needs', color: getColor('pink') },
    { icon: '🎒', text: 'Eu quero minha mochila', category: 'needs', color: getColor('purple') },
    { icon: '🧴', text: 'Eu preciso de protetor solar', category: 'needs', color: getColor('yellow') },
    { icon: '💊', text: 'Eu preciso de vitaminas', category: 'needs', color: getColor('green') },
    { icon: '👓', text: 'Eu preciso dos meus óculos', category: 'needs', color: getColor('blue') },
    { icon: '🎧', text: 'Eu quero meus fones', category: 'needs', color: getColor('purple') },
    { icon: '📱', text: 'Eu quero meu celular', category: 'needs', color: getColor('black') },
    { icon: '🛁', text: 'Eu quero banho de banheira', category: 'needs', color: getColor('lightBlue') },
    { icon: '🧴', text: 'Eu quero passar creme', category: 'needs', color: getColor('pink') },
  ],
  health: [
    { icon: '💊', text: 'Eu preciso de remédio', category: 'health', color: getColor('red') },
    { icon: '🤕', text: 'Eu estou com dor', category: 'health', color: getColor('redAccent') },
    { icon: '🤒', text: 'Eu estou doente', category: 'health', color: getColor('green') },
    { icon: '🩹', text: 'Eu preciso de curativo', category: 'health', color: getColor('orange') },
    { icon: '🌡️', text: 'Eu estou com febre', category: 'health', color: getColor('red') },
    { icon: '🦷', text: 'Eu estou com dor de dente', category: 'health', color: getColor('blue') },
    { icon: '🧠', text: 'Eu estou com dor de cabeça', category: 'health', color: getColor('purple') },
    { icon: '😷', text: 'Eu estou com tosse', category: 'health', color: getColor('grey') },
    { icon: '🤧', text: 'Eu estou com alergia', category: 'health', color: getColor('pink') },
    { icon: '🤮', text: 'Eu estou enjoado', category: 'health', color: getColor('greenAccent') },
    { icon: '🩺', text: 'Eu preciso de médico', category: 'health', color: getColor('blue') },
    { icon: '🚑', text: 'Eu preciso de ambulância!', category: 'health', color: getColor('red') },
    { icon: '💉', text: 'Eu preciso de vacina', category: 'health', color: getColor('teal') },
  ],
  activities: [
    { icon: '📚', text: 'Eu quero ler um livro', category: 'activities', color: getColor('blue') },
    { icon: '🎮', text: 'Eu quero brincar', category: 'activities', color: getColor('purple') },
    { icon: '🧸', text: 'Eu quero meu brinquedo', category: 'activities', color: getColor('pink') },
    { icon: '🎨', text: 'Eu quero desenhar', category: 'activities', color: getColor('orange') },
    { icon: '🎵', text: 'Eu quero ouvir música', category: 'activities', color: getColor('deepPurple') },
    { icon: '📺', text: 'Eu quero ver TV', category: 'activities', color: '#212121' },
    { icon: '🎤', text: 'Eu quero cantar', category: 'activities', color: '#FF4081' },
    { icon: '🎬', text: 'Eu quero ver um filme', category: 'activities', color: getColor('red') },
    { icon: '🎲', text: 'Eu quero jogar um jogo', category: 'activities', color: getColor('green') },
    { icon: '🧩', text: 'Eu quero montar um quebra-cabeça', category: 'activities', color: getColor('teal') },
    { icon: '🏃', text: 'Eu quero correr', category: 'activities', color: getColor('orangeAccent') },
    { icon: '🚴', text: 'Eu quero andar de bicicleta', category: 'activities', color: getColor('blueAccent') },
    { icon: '⚽', text: 'Eu quero jogar futebol', category: 'activities', color: getColor('green') },
    { icon: '🏀', text: 'Eu quero jogar basquete', category: 'activities', color: getColor('orange') },
    { icon: '🎳', text: 'Eu quero jogar boliche', category: 'activities', color: getColor('blueGrey') },
    { icon: '🏊', text: 'Eu quero nadar', category: 'activities', color: getColor('cyan') },
    { icon: '🧘', text: 'Eu quero fazer ioga', category: 'activities', color: getColor('purple') },
    { icon: '🎹', text: 'Eu quero tocar piano', category: 'activities', color: getColor('black') },
    { icon: '🎸', text: 'Eu quero tocar violão', category: 'activities', color: getColor('brown') },
    { icon: '🎯', text: 'Eu quero jogar dardo', category: 'activities', color: getColor('red') },
  ],
  family: [
    { icon: '👩', text: 'minha mamãe', category: 'family', color: getColor('pink') },
    { icon: '👨', text: 'meu papai', category: 'family', color: getColor('blue') },
    { icon: '👨‍🏫', text: 'meu professor', category: 'family', color: getColor('green') },
    { icon: '🧑‍🤝‍🧑', text: 'meu amigo', category: 'family', color: getColor('orange') },
    { icon: '📞', text: 'Chama minha mãe!', category: 'family', color: getColor('red') },
    { icon: '📞', text: 'Chama meu pai!', category: 'family', color: getColor('redAccent') },
    { icon: '👵', text: 'minha avó', category: 'family', color: getColor('purple') },
    { icon: '👴', text: 'meu avô', category: 'family', color: getColor('grey') },
    { icon: '👶', text: 'meu irmãozinho', category: 'family', color: getColor('lightBlue') },
    { icon: '👧', text: 'minha irmãzinha', category: 'family', color: '#FF4081' },
    { icon: '🧑‍🤝‍🧑', text: 'meu primo(a)', category: 'family', color: getColor('teal') },
  ],
  places: [
    { icon: '🏠', text: 'Casa', category: 'places', color: getColor('brown') },
    { icon: '🏫', text: 'Escola', category: 'places', color: getColor('blue') },
    { icon: '🏥', text: 'Hospital', category: 'places', color: getColor('red') },
    { icon: '🛒', text: 'Loja', category: 'places', color: getColor('orange') },
    { icon: '🌳', text: 'Parque', category: 'places', color: getColor('green') },
    { icon: '🏖️', text: 'Praia', category: 'places', color: getColor('cyan') },
    { icon: '🏰', text: 'Parque de diversões', category: 'places', color: getColor('purple') },
    { icon: '⛪', text: 'Igreja', category: 'places', color: getColor('amber') },
    { icon: '🏢', text: 'Escritório', category: 'places', color: getColor('blueGrey') },
    { icon: '🍽️', text: 'Restaurante', category: 'places', color: getColor('deepOrange') },
    { icon: '✈️', text: 'Aeroporto', category: 'places', color: getColor('lightBlue') },
    { icon: '🚗', text: 'Carro', category: 'places', color: getColor('grey') },
    { icon: '🚂', text: 'Estação de trem', category: 'places', color: getColor('brown') },
    { icon: '🚌', text: 'Rodoviária', category: 'places', color: getColor('yellow') },
    { icon: '🏟️', text: 'Estádio', category: 'places', color: getColor('green') },
    { icon: '🎭', text: 'Teatro', category: 'places', color: getColor('red') },
    { icon: '🎨', text: 'Museu', category: 'places', color: getColor('purple') },
    { icon: '📚', text: 'Biblioteca', category: 'places', color: getColor('blue') },
    { icon: '🐾', text: 'Pet shop', category: 'places', color: getColor('orange') },
    { icon: '💇', text: 'Salão de beleza', category: 'places', color: getColor('pink') },
  ],
};

export function getConversationItems(category: ConversationCategory): ConversationItem[] {
  return conversationData[category] || [];
}

export function getAllConversationCategories(): { id: ConversationCategory; name: string; icon: string; color: string }[] {
  return [
    { id: 'greetings', name: 'Saudações', icon: '👋', color: '#4D94FF' },
    { id: 'needs', name: 'Necessidades', icon: '🍎', color: '#FF6B35' },
    { id: 'health', name: 'Saúde', icon: '❤️', color: '#FF1744' },
    { id: 'activities', name: 'Atividades', icon: '⚽', color: '#00C853' },
    { id: 'family', name: 'Família', icon: '👨‍👩‍👧', color: '#B24BF3' },
    { id: 'places', name: 'Locais', icon: '🏠', color: '#00BCD4' },
  ];
}
