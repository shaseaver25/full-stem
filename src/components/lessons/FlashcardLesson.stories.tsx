import type { Meta, StoryObj } from '@storybook/react';
import { FlashcardLesson } from './FlashcardLesson';
import { AccessibilityProvider } from '@/contexts/AccessibilityContext';

const meta: Meta<typeof FlashcardLesson> = {
  title: 'Lessons/FlashcardLesson',
  component: FlashcardLesson,
  decorators: [
    (Story) => (
      <AccessibilityProvider>
        <div className="p-8 min-h-screen bg-background">
          <Story />
        </div>
      </AccessibilityProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FlashcardLesson>;

const sampleCards = [
  {
    id: '1',
    frontText: 'What is the capital of France?',
    backText: 'Paris',
  },
  {
    id: '2',
    frontText: 'What is 7 × 8?',
    backText: '56',
  },
  {
    id: '3',
    frontText: 'Who wrote "Romeo and Juliet"?',
    backText: 'William Shakespeare',
  },
  {
    id: '4',
    frontText: 'What is the chemical symbol for water?',
    backText: 'H₂O',
  },
  {
    id: '5',
    frontText: 'What year did World War II end?',
    backText: '1945',
  },
];

const vocabularyCards = [
  {
    id: '1',
    frontText: 'Benevolent',
    backText: 'Well-meaning and kindly',
    imageUrl: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=300&h=200&fit=crop',
  },
  {
    id: '2',
    frontText: 'Ephemeral',
    backText: 'Lasting for a very short time',
  },
  {
    id: '3',
    frontText: 'Ubiquitous',
    backText: 'Present, appearing, or found everywhere',
  },
  {
    id: '4',
    frontText: 'Pragmatic',
    backText: 'Dealing with things sensibly and realistically',
  },
];

const mathCards = [
  {
    id: '1',
    frontText: 'What is the Pythagorean theorem?',
    backText: 'a² + b² = c²',
  },
  {
    id: '2',
    frontText: 'What is the value of π (pi)?',
    backText: 'Approximately 3.14159',
  },
  {
    id: '3',
    frontText: 'What is the formula for the area of a circle?',
    backText: 'A = πr²',
  },
];

export const StudyModeBasic: Story = {
  args: {
    cards: sampleCards,
    mode: 'study',
    title: 'General Knowledge',
    description: 'Study these important facts',
  },
};

export const QuizModeWithResults: Story = {
  args: {
    cards: sampleCards,
    mode: 'quiz',
    title: 'Quiz: Test Your Knowledge',
    description: 'Mark each card as known or needs review',
  },
};

export const VocabularyWithImages: Story = {
  args: {
    cards: vocabularyCards,
    mode: 'study',
    title: 'SAT Vocabulary',
    description: 'Learn key vocabulary words for the SAT exam',
  },
};

export const MathFormulas: Story = {
  args: {
    cards: mathCards,
    mode: 'study',
    title: 'Essential Math Formulas',
    description: 'Master these fundamental formulas',
  },
};

export const AccessibilityMode: Story = {
  args: {
    cards: sampleCards,
    mode: 'study',
    title: 'Accessible Flashcards',
    description: 'With TTS and dyslexia font enabled',
    ttsEnabled: true,
  },
  decorators: [
    (Story) => (
      <AccessibilityProvider>
        <div className="p-8 min-h-screen bg-background accessibility-high-contrast font-opendyslexic">
          <Story />
        </div>
      </AccessibilityProvider>
    ),
  ],
};

export const SingleCard: Story = {
  args: {
    cards: [
      {
        id: '1',
        frontText: 'What is the speed of light?',
        backText: '299,792,458 meters per second',
      },
    ],
    mode: 'study',
    title: 'Quick Fact',
  },
};

export const EmptyState: Story = {
  args: {
    cards: [],
    mode: 'study',
    title: 'No Cards Available',
  },
};
