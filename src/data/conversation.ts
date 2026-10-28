import type { ConversationCategory, ConversationItem } from '../types/models';
import { localize, localized } from '../i18n/content';
import { DEFAULT_LOCALE, type Locale, type LocalizedText } from '../i18n/types';
import { slugify } from '../utils/slug';

const colorMap: Record<string, string> = {
  green: '#4CAF50',
  red: '#F44336',
  blue: '#2196F3',
  blueGrey: '#607D8B',
  orange: '#FF9800',
  deepOrange: '#FF5722',
  indigo: '#3F51B5',
  teal: '#009688',
  purple: '#9C27B0',
  brown: '#795548',
  blueAccent: '#448AFF',
  amber: '#FFC107',
  pink: '#E91E63',
  grey: '#9E9E9E',
  cyan: '#00BCD4',
  lightBlue: '#03A9F4',
  redAccent: '#FF1744',
  greenAccent: '#00E676',
  deepPurple: '#673AB7',
  orangeAccent: '#FF9100',
  yellow: '#FFEB3B',
  black: '#000000',
};

const DEFAULT_COLOR = '#2196F3';
const HEX_COLOR = /^#[0-9a-fA-F]{3,8}$/;

export function getColor(colorName: string | undefined): string {
  if (!colorName) return DEFAULT_COLOR;
  if (HEX_COLOR.test(colorName)) return colorName;
  return colorMap[colorName] || DEFAULT_COLOR;
}

export function withAlpha(color: string, alpha: string): string {
  return `${getColor(color)}${alpha}`;
}

export const CONVERSATION_CATEGORIES: ConversationCategory[] = [
  'greetings',
  'needs',
  'health',
  'activities',
  'family',
  'places',
];

interface LocalizedConversationItem {
  icon: string;
  text: LocalizedText;
  category: ConversationCategory;
  color?: string;
}

const conversationBase: Record<ConversationCategory, LocalizedConversationItem[]> = {
  greetings: [
    { icon: '👍', text: localized('Sim', 'Yes', 'Sí'), category: 'greetings', color: getColor('green') },
    { icon: '👎', text: localized('Não', 'No', 'No'), category: 'greetings', color: getColor('red') },
    { icon: '👋', text: localized('Olá', 'Hello', 'Hola'), category: 'greetings', color: getColor('blue') },
    { icon: '🤔', text: localized('Não sei', "I don't know", 'No sé'), category: 'greetings', color: getColor('blueGrey') },
    { icon: '☀️', text: localized('Bom dia', 'Good morning', 'Buenos días'), category: 'greetings', color: getColor('orange') },
    { icon: '🌇', text: localized('Boa tarde', 'Good afternoon', 'Buenas tardes'), category: 'greetings', color: getColor('deepOrange') },
    { icon: '🌙', text: localized('Boa noite', 'Good night', 'Buenas noches'), category: 'greetings', color: getColor('indigo') },
    { icon: '🙏', text: localized('Obrigado', 'Thank you', 'Gracias'), category: 'greetings', color: getColor('teal') },
    { icon: '🤝', text: localized('Por favor', 'Please', 'Por favor'), category: 'greetings', color: getColor('purple') },
    { icon: '😔', text: localized('Desculpa', 'Sorry', 'Perdón'), category: 'greetings', color: getColor('brown') },
    { icon: '👋', text: localized('Tchau', 'Bye', 'Adiós'), category: 'greetings', color: getColor('blueAccent') },
    { icon: '😊', text: localized('Estou bem', "I'm fine", 'Estoy bien'), category: 'greetings', color: getColor('green') },
    { icon: '😢', text: localized('Eu estou triste', "I'm sad", 'Estoy triste'), category: 'greetings', color: '#0D47A1' },
    { icon: '😱', text: localized('Eu estou assustado', "I'm scared", 'Tengo miedo'), category: 'greetings', color: getColor('deepPurple') },
    { icon: '😰', text: localized('Eu estou nervoso', "I'm nervous", 'Estoy nervioso'), category: 'greetings', color: '#B71C1C' },
    { icon: '😴', text: localized('Eu estou com sono', "I'm sleepy", 'Tengo sueño'), category: 'greetings', color: '#1A237E' },
    { icon: '😃', text: localized('Eu estou feliz', "I'm happy", 'Estoy feliz'), category: 'greetings', color: getColor('amber') },
    { icon: '😡', text: localized('Eu estou bravo', "I'm angry", 'Estoy enojado'), category: 'greetings', color: getColor('red') },
    { icon: '😣', text: localized('Eu estou frustrado', "I'm frustrated", 'Estoy frustrado'), category: 'greetings', color: getColor('orangeAccent') },
    { icon: '🤗', text: localized('Eu preciso de um abraço', 'I need a hug', 'Necesito un abrazo'), category: 'greetings', color: getColor('pink') },
    { icon: '😖', text: localized('Eu estou sobrecarregado', "I'm overwhelmed", 'Estoy sobrecargado'), category: 'greetings', color: getColor('grey') },
    { icon: '😐', text: localized('Eu estou entediado', "I'm bored", 'Estoy aburrido'), category: 'greetings', color: getColor('blueGrey') },
    { icon: '😌', text: localized('Eu preciso de um tempo sozinho', 'I need some time alone', 'Necesito un tiempo a solas'), category: 'greetings', color: getColor('teal') },
    { icon: '😵', text: localized('Eu estou tonto', "I'm dizzy", 'Estoy mareado'), category: 'greetings', color: '#E040FB' },
  ],
  needs: [
    { icon: '🍎', text: localized('Eu quero uma fruta', 'I want a fruit', 'Quiero una fruta'), category: 'needs', color: getColor('redAccent') },
    { icon: '🥤', text: localized('Eu quero água', 'I want water', 'Quiero agua'), category: 'needs', color: getColor('blue') },
    { icon: '🍪', text: localized('Eu quero biscoito', 'I want a cookie', 'Quiero una galleta'), category: 'needs', color: getColor('brown') },
    { icon: '🍽️', text: localized('Eu estou com fome', "I'm hungry", 'Tengo hambre'), category: 'needs', color: getColor('orange') },
    { icon: '🥛', text: localized('Eu quero leite', 'I want milk', 'Quiero leche'), category: 'needs', color: getColor('grey') },
    { icon: '🚽', text: localized('Eu preciso ir ao banheiro', 'I need to go to the bathroom', 'Necesito ir al baño'), category: 'needs', color: getColor('cyan') },
    { icon: '🛏️', text: localized('Eu estou com sono', "I'm sleepy", 'Tengo sueño'), category: 'needs', color: getColor('indigo') },
    { icon: '🧼', text: localized('Eu quero tomar banho', 'I want to take a bath', 'Quiero bañarme'), category: 'needs', color: getColor('lightBlue') },
    { icon: '👕', text: localized('Eu quero trocar de roupa', 'I want to change clothes', 'Quiero cambiarme de ropa'), category: 'needs', color: getColor('green') },
    { icon: '🧥', text: localized('Eu estou com frio', "I'm cold", 'Tengo frío'), category: 'needs', color: getColor('blueGrey') },
    { icon: '🎽', text: localized('Eu estou com calor', "I'm hot", 'Tengo calor'), category: 'needs', color: getColor('orangeAccent') },
    { icon: '🧢', text: localized('Eu quero meu chapéu', 'I want my hat', 'Quiero mi sombrero'), category: 'needs', color: getColor('amber') },
    { icon: '👟', text: localized('Eu quero meus sapatos', 'I want my shoes', 'Quiero mis zapatos'), category: 'needs', color: getColor('blue') },
    { icon: '🧸', text: localized('Eu quero meu brinquedo', 'I want my toy', 'Quiero mi juguete'), category: 'needs', color: getColor('pink') },
    { icon: '🎒', text: localized('Eu quero minha mochila', 'I want my backpack', 'Quiero mi mochila'), category: 'needs', color: getColor('purple') },
    { icon: '🧴', text: localized('Eu preciso de protetor solar', 'I need sunscreen', 'Necesito protector solar'), category: 'needs', color: getColor('yellow') },
    { icon: '💊', text: localized('Eu preciso de vitaminas', 'I need vitamins', 'Necesito vitaminas'), category: 'needs', color: getColor('green') },
    { icon: '👓', text: localized('Eu preciso dos meus óculos', 'I need my glasses', 'Necesito mis gafas'), category: 'needs', color: getColor('blue') },
    { icon: '🎧', text: localized('Eu quero meus fones', 'I want my headphones', 'Quiero mis auriculares'), category: 'needs', color: getColor('purple') },
    { icon: '📱', text: localized('Eu quero meu celular', 'I want my phone', 'Quiero mi teléfono'), category: 'needs', color: getColor('black') },
    { icon: '🛁', text: localized('Eu quero banho de banheira', 'I want a bubble bath', 'Quiero un baño de tina'), category: 'needs', color: getColor('lightBlue') },
    { icon: '🧴', text: localized('Eu quero passar creme', 'I want to put on lotion', 'Quiero ponerme crema'), category: 'needs', color: getColor('pink') },
  ],
  health: [
    { icon: '💊', text: localized('Eu preciso de remédio', 'I need medicine', 'Necesito medicina'), category: 'health', color: getColor('red') },
    { icon: '🤕', text: localized('Eu estou com dor', "I'm in pain", 'Tengo dolor'), category: 'health', color: getColor('redAccent') },
    { icon: '🤒', text: localized('Eu estou doente', "I'm sick", 'Estoy enfermo'), category: 'health', color: getColor('green') },
    { icon: '🩹', text: localized('Eu preciso de curativo', 'I need a bandage', 'Necesito una curita'), category: 'health', color: getColor('orange') },
    { icon: '🌡️', text: localized('Eu estou com febre', 'I have a fever', 'Tengo fiebre'), category: 'health', color: getColor('red') },
    { icon: '🦷', text: localized('Eu estou com dor de dente', 'I have a toothache', 'Me duele un diente'), category: 'health', color: getColor('blue') },
    { icon: '🧠', text: localized('Eu estou com dor de cabeça', 'I have a headache', 'Me duele la cabeza'), category: 'health', color: getColor('purple') },
    { icon: '😷', text: localized('Eu estou com tosse', 'I have a cough', 'Tengo tos'), category: 'health', color: getColor('grey') },
    { icon: '🤧', text: localized('Eu estou com alergia', 'I have an allergy', 'Tengo alergia'), category: 'health', color: getColor('pink') },
    { icon: '🤮', text: localized('Eu estou enjoado', 'I feel nauseous', 'Tengo náuseas'), category: 'health', color: getColor('greenAccent') },
    { icon: '🩺', text: localized('Eu preciso de médico', 'I need a doctor', 'Necesito un médico'), category: 'health', color: getColor('blue') },
    { icon: '🚑', text: localized('Eu preciso de ambulância!', 'I need an ambulance!', '¡Necesito una ambulancia!'), category: 'health', color: getColor('red') },
    { icon: '💉', text: localized('Eu preciso de vacina', 'I need a vaccine', 'Necesito una vacuna'), category: 'health', color: getColor('teal') },
  ],
  activities: [
    { icon: '📚', text: localized('Eu quero ler um livro', 'I want to read a book', 'Quiero leer un libro'), category: 'activities', color: getColor('blue') },
    { icon: '🎮', text: localized('Eu quero brincar', 'I want to play', 'Quiero jugar'), category: 'activities', color: getColor('purple') },
    { icon: '🧸', text: localized('Eu quero meu brinquedo', 'I want my toy', 'Quiero mi juguete'), category: 'activities', color: getColor('pink') },
    { icon: '🎨', text: localized('Eu quero desenhar', 'I want to draw', 'Quiero dibujar'), category: 'activities', color: getColor('orange') },
    { icon: '🎵', text: localized('Eu quero ouvir música', 'I want to listen to music', 'Quiero escuchar música'), category: 'activities', color: getColor('deepPurple') },
    { icon: '📺', text: localized('Eu quero ver TV', 'I want to watch TV', 'Quiero ver la tele'), category: 'activities', color: '#212121' },
    { icon: '🎤', text: localized('Eu quero cantar', 'I want to sing', 'Quiero cantar'), category: 'activities', color: '#FF4081' },
    { icon: '🎬', text: localized('Eu quero ver um filme', 'I want to watch a movie', 'Quiero ver una película'), category: 'activities', color: getColor('red') },
    { icon: '🎲', text: localized('Eu quero jogar um jogo', 'I want to play a game', 'Quiero jugar un juego'), category: 'activities', color: getColor('green') },
    { icon: '🧩', text: localized('Eu quero montar um quebra-cabeça', 'I want to do a puzzle', 'Quiero hacer un rompecabezas'), category: 'activities', color: getColor('teal') },
    { icon: '🏃', text: localized('Eu quero correr', 'I want to run', 'Quiero correr'), category: 'activities', color: getColor('orangeAccent') },
    { icon: '🚴', text: localized('Eu quero andar de bicicleta', 'I want to ride a bike', 'Quiero andar en bicicleta'), category: 'activities', color: getColor('blueAccent') },
    { icon: '⚽', text: localized('Eu quero jogar futebol', 'I want to play soccer', 'Quiero jugar al fútbol'), category: 'activities', color: getColor('green') },
    { icon: '🏀', text: localized('Eu quero jogar basquete', 'I want to play basketball', 'Quiero jugar al baloncesto'), category: 'activities', color: getColor('orange') },
    { icon: '🎳', text: localized('Eu quero jogar boliche', 'I want to go bowling', 'Quiero jugar a los bolos'), category: 'activities', color: getColor('blueGrey') },
    { icon: '🏊', text: localized('Eu quero nadar', 'I want to swim', 'Quiero nadar'), category: 'activities', color: getColor('cyan') },
    { icon: '🧘', text: localized('Eu quero fazer ioga', 'I want to do yoga', 'Quiero hacer yoga'), category: 'activities', color: getColor('purple') },
    { icon: '🎹', text: localized('Eu quero tocar piano', 'I want to play the piano', 'Quiero tocar el piano'), category: 'activities', color: getColor('black') },
    { icon: '🎸', text: localized('Eu quero tocar violão', 'I want to play the guitar', 'Quiero tocar la guitarra'), category: 'activities', color: getColor('brown') },
    { icon: '🎯', text: localized('Eu quero jogar dardo', 'I want to play darts', 'Quiero jugar a los dardos'), category: 'activities', color: getColor('red') },
  ],
  family: [
    { icon: '👩', text: localized('minha mamãe', 'my mommy', 'mi mamá'), category: 'family', color: getColor('pink') },
    { icon: '👨', text: localized('meu papai', 'my daddy', 'mi papá'), category: 'family', color: getColor('blue') },
    { icon: '👨‍🏫', text: localized('meu professor', 'my teacher', 'mi profesor'), category: 'family', color: getColor('green') },
    { icon: '🧑‍🤝‍🧑', text: localized('meu amigo', 'my friend', 'mi amigo'), category: 'family', color: getColor('orange') },
    { icon: '📞', text: localized('Chama minha mãe!', 'Call my mom!', '¡Llama a mi mamá!'), category: 'family', color: getColor('red') },
    { icon: '📞', text: localized('Chama meu pai!', 'Call my dad!', '¡Llama a mi papá!'), category: 'family', color: getColor('redAccent') },
    { icon: '👵', text: localized('minha avó', 'my grandma', 'mi abuela'), category: 'family', color: getColor('purple') },
    { icon: '👴', text: localized('meu avô', 'my grandpa', 'mi abuelo'), category: 'family', color: getColor('grey') },
    { icon: '👶', text: localized('meu irmãozinho', 'my little brother', 'mi hermanito'), category: 'family', color: getColor('lightBlue') },
    { icon: '👧', text: localized('minha irmãzinha', 'my little sister', 'mi hermanita'), category: 'family', color: '#FF4081' },
    { icon: '🧑‍🤝‍🧑', text: localized('meu primo(a)', 'my cousin', 'mi primo(a)'), category: 'family', color: getColor('teal') },
  ],
  places: [
    { icon: '🏠', text: localized('Casa', 'Home', 'Casa'), category: 'places', color: getColor('brown') },
    { icon: '🏫', text: localized('Escola', 'School', 'Escuela'), category: 'places', color: getColor('blue') },
    { icon: '🏥', text: localized('Hospital', 'Hospital', 'Hospital'), category: 'places', color: getColor('red') },
    { icon: '🛒', text: localized('Loja', 'Store', 'Tienda'), category: 'places', color: getColor('orange') },
    { icon: '🌳', text: localized('Parque', 'Park', 'Parque'), category: 'places', color: getColor('green') },
    { icon: '🏖️', text: localized('Praia', 'Beach', 'Playa'), category: 'places', color: getColor('cyan') },
    { icon: '🏰', text: localized('Parque de diversões', 'Amusement park', 'Parque de atracciones'), category: 'places', color: getColor('purple') },
    { icon: '⛪', text: localized('Igreja', 'Church', 'Iglesia'), category: 'places', color: getColor('amber') },
    { icon: '🏢', text: localized('Escritório', 'Office', 'Oficina'), category: 'places', color: getColor('blueGrey') },
    { icon: '🍽️', text: localized('Restaurante', 'Restaurant', 'Restaurante'), category: 'places', color: getColor('deepOrange') },
    { icon: '✈️', text: localized('Aeroporto', 'Airport', 'Aeropuerto'), category: 'places', color: getColor('lightBlue') },
    { icon: '🚗', text: localized('Carro', 'Car', 'Coche'), category: 'places', color: getColor('grey') },
    { icon: '🚂', text: localized('Estação de trem', 'Train station', 'Estación de tren'), category: 'places', color: getColor('brown') },
    { icon: '🚌', text: localized('Rodoviária', 'Bus station', 'Estación de autobuses'), category: 'places', color: getColor('yellow') },
    { icon: '🏟️', text: localized('Estádio', 'Stadium', 'Estadio'), category: 'places', color: getColor('green') },
    { icon: '🎭', text: localized('Teatro', 'Theater', 'Teatro'), category: 'places', color: getColor('red') },
    { icon: '🎨', text: localized('Museu', 'Museum', 'Museo'), category: 'places', color: getColor('purple') },
    { icon: '📚', text: localized('Biblioteca', 'Library', 'Biblioteca'), category: 'places', color: getColor('blue') },
    { icon: '🐾', text: localized('Pet shop', 'Pet shop', 'Tienda de mascotas'), category: 'places', color: getColor('orange') },
    { icon: '💇', text: localized('Salão de beleza', 'Beauty salon', 'Salón de belleza'), category: 'places', color: getColor('pink') },
  ],
};

export function getConversationItems(
  category: ConversationCategory,
  locale: Locale = DEFAULT_LOCALE
): ConversationItem[] {
  return (conversationBase[category] ?? []).map((item) => ({
    id: `${item.category}:${slugify(item.text[DEFAULT_LOCALE])}`,
    icon: item.icon,
    text: localize(item.text, locale),
    category: item.category,
    color: item.color,
  }));
}

export function getAllConversationCategories(
  locale: Locale = DEFAULT_LOCALE
): { id: ConversationCategory; name: string; icon: string; color: string }[] {
  const names: Record<ConversationCategory, LocalizedText> = {
    greetings: localized('Saudações', 'Greetings', 'Saludos'),
    needs: localized('Necessidades', 'Needs', 'Necesidades'),
    health: localized('Saúde', 'Health', 'Salud'),
    activities: localized('Atividades', 'Activities', 'Actividades'),
    family: localized('Família', 'Family', 'Familia'),
    places: localized('Locais', 'Places', 'Lugares'),
  };

  return [
    { id: 'greetings', name: localize(names.greetings, locale), icon: '👋', color: '#4D94FF' },
    { id: 'needs', name: localize(names.needs, locale), icon: '🍎', color: '#FF6B35' },
    { id: 'health', name: localize(names.health, locale), icon: '❤️', color: '#FF1744' },
    { id: 'activities', name: localize(names.activities, locale), icon: '⚽', color: '#00C853' },
    { id: 'family', name: localize(names.family, locale), icon: '👨‍👩‍👧', color: '#B24BF3' },
    { id: 'places', name: localize(names.places, locale), icon: '🏠', color: '#00BCD4' },
  ];
}

// Compatibilidade temporária até a Task 8; sempre em pt-BR para os IDs atuais.
export const conversationData: Record<ConversationCategory, ConversationItem[]> = {
  greetings: getConversationItems('greetings'),
  needs: getConversationItems('needs'),
  health: getConversationItems('health'),
  activities: getConversationItems('activities'),
  family: getConversationItems('family'),
  places: getConversationItems('places'),
};
